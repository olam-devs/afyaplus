const { sendText, sendButtons, sendList } = require("./whatsapp");
const { getSession, setSession, clearSession, getAllActiveSessions } = require("./session");
const C = require("./content");
const pesapal = require("./pesapal");
const { sendBookingEmail } = require("./email");

// Trigger words (case-insensitive)
const WELCOME_TRIGGERS = ["hi", "hello", "hey", "habari", "mambo", "niaje", "start", "anza", "karibu", "salaam", "jambo", "hujambo", "afya", "afya+", "hi, ! please let us know how we can help you.", "ndewo", "shikamoo", "marahaba", "sasa", "vipi", "good morning", "good afternoon", "good evening", "howdy", "greetings", "yo"];
const MENU_TRIGGERS = ["menu", "orodha", "huduma", "services"];
const HELP_TRIGGERS = ["help", "msaada", "assist", "support"];

// Extract language prefix from button/list ID
function getLang(id) {
  if (id.startsWith("sw_")) return "sw";
  if (id.startsWith("en_")) return "en";
  return null;
}

// Strip language prefix from ID
function stripLang(id) {
  return id.replace(/^(sw_|en_)/, "");
}

// ============ SENDERS ============

async function sendWelcome(to) {
  await sendButtons(to, C.welcome.body, C.welcome.buttons);
}

async function sendMainMenu(to, lang) {
  const menu = C.mainMenu[lang];
  await sendList(to, menu.body, menu.buttonText, menu.sections);
}

async function sendServiceDetail(to, lang, serviceKey, bodyText, backId) {
  const labels = C.bookBackButtons[lang];
  const menuId = `${lang}_menu`;
  const buttons = [
    { id: `${lang}_book_${serviceKey}`, title: labels.book },
  ];
  if (backId !== menuId) {
    buttons.push({ id: backId, title: labels.back });
  }
  buttons.push({ id: menuId, title: labels.menu });
  await sendButtons(to, bodyText, buttons);
}

async function sendHelpPage(to, lang, page) {
  const helpPage = C.help[lang][page];
  await sendButtons(to, helpPage.body, helpPage.buttons);
}

// ============ BOOKING ============

async function startBooking(to, lang, serviceKey) {
  // Validate serviceKey exists before starting
  if (!C.serviceLabels[lang] || !C.serviceLabels[lang][serviceKey]) {
    await sendText(to, lang === "sw"
      ? "Samahani, huduma hii haipatikani kwa sasa."
      : "Sorry, this service is not available right now.");
    await sendMainMenu(to, lang);
    return;
  }
  const t = C.booking[lang];
  await setSession(to, {
    state: "awaiting_name", lang, serviceKey,
    lastActivity: Date.now(), reminderCount: 0, lastReminder: 0,
  });
  await sendText(to, t.askName);
}

async function handleBookingText(to, session, text) {
  const lang = session.lang;
  const t = C.booking[lang];

  if (session.state === "awaiting_name") {
    const name = text.trim();
    if (name.length < 2 || !/^[a-zA-Z\s\-'.]+$/.test(name)) {
      await sendText(to, lang === "sw"
        ? "Tafadhali andika jina sahihi (herufi tu):"
        : "Please enter a valid name (letters only):");
      return;
    }
    await setSession(to, {
      ...session, state: "awaiting_phone", name,
      lastActivity: Date.now(), reminderCount: 0, lastReminder: 0,
    });
    await sendText(to, t.askPhone);

  } else if (session.state === "awaiting_phone") {
    const phone = text.trim().replace(/[\s\-()]/g, "");
    if (!/^\+?\d{9,15}$/.test(phone)) {
      await sendText(to, t.invalidPhone);
      return;
    }
    const svc = C.serviceLabels[lang] && C.serviceLabels[lang][session.serviceKey];
    if (!svc) {
      await clearSession(to);
      await sendText(to, lang === "sw"
        ? "Samahani, kuna tatizo. Tafadhali anza upya."
        : "Sorry, something went wrong. Please start over.");
      await sendWelcome(to);
      return;
    }
    const confirmText = t.confirm(session.name, phone, svc.name, svc.price);
    await setSession(to, {
      ...session, state: "awaiting_confirm", phone,
      lastActivity: Date.now(), reminderCount: 0, lastReminder: 0,
    });
    await sendButtons(to, confirmText, [
      { id: `${lang}_confirm`, title: t.confirmBtn },
      { id: `${lang}_cancel`, title: t.cancelBtn },
    ]);
  }
}

async function handleConfirm(to, lang) {
  const session = await getSession(to);
  if (!session || !session.name || !session.phone) {
    await sendWelcome(to);
    return;
  }
  const t = C.booking[lang];
  const labels = C.bookBackButtons[lang];
  const svc = C.serviceLabels[lang][session.serviceKey];
  const name = session.name;

  console.log("BOOKING:", {
    name: session.name,
    phone: session.phone,
    service: session.serviceKey,
    lang: session.lang,
    timestamp: new Date().toISOString(),
  });

  // Try to create a PesaPal payment link
  let paymentUrl = null;
  if (process.env.PESAPAL_CONSUMER_KEY && svc) {
    try {
      const orderId = `AFYA_${to}_${Date.now()}`;
      const nameParts = session.name.trim().split(/\s+/);
      const callbackPage = `${pesapal.getCallbackBaseUrl()}/api/pesapal/callback`;

      const order = await pesapal.submitOrder({
        orderId,
        amount: svc.amount,
        currency: "TZS",
        description: `Afya+ ${svc.name}`,
        callbackPageUrl: callbackPage,
        billing: {
          phone_number: session.phone,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          country_code: "TZ",
          line_1: "",
          line_2: "",
          city: "",
          state: "",
          postal_code: "",
          zip_code: "",
        },
      });

      paymentUrl = order.redirect_url;
      console.log("PesaPal order created:", { orderId, trackingId: order.order_tracking_id, url: paymentUrl });
    } catch (err) {
      console.error("PesaPal order error:", err.message);
    }
  }

  // Send email notification to admin
  sendBookingEmail({
    name: session.name,
    phone: session.phone,
    service: svc ? svc.name : session.serviceKey,
    price: svc ? svc.price : "N/A",
    lang,
    paymentUrl,
    paymentStatus: "Pending",
  }).catch(err => console.error("Email error:", err.message));

  const serviceName = svc ? svc.name : session.serviceKey;
  const servicePrice = svc ? svc.price : "N/A";

  await clearSession(to);

  if (paymentUrl) {
    await sendButtons(to, t.success(name, session.phone, serviceName, servicePrice, paymentUrl), [
      { id: `${lang}_menu`, title: labels.menu },
    ]);
  } else {
    await sendButtons(to, t.successFallback(name, session.phone, serviceName, servicePrice), [
      { id: `${lang}_menu`, title: labels.menu },
    ]);
  }
}

async function handleCancel(to, lang) {
  await clearSession(to);
  const t = C.booking[lang];
  const labels = C.bookBackButtons[lang];
  await sendButtons(to, t.cancelled, [
    { id: `${lang}_menu`, title: labels.menu },
  ]);
}

// ============ MAIN ROUTER ============

async function handleMessage(to, message) {
  const session = await getSession(to);

  // ---- Active booking session ----
  if (session && session.state) {
    const lang = session.lang || "sw";

    // Reset reminder tracking on any user activity
    await setSession(to, {
      ...session,
      lastActivity: Date.now(), reminderCount: 0, lastReminder: 0,
    });

    // --- AWAITING NAME or PHONE (text input expected) ---
    if (session.state === "awaiting_name" || session.state === "awaiting_phone") {

      // Text input
      if (message.type === "text") {
        const text = message.text.body.trim().toLowerCase();

        // Allow escape via trigger words
        if (WELCOME_TRIGGERS.includes(text)) {
          await clearSession(to);
          await sendWelcome(to);
          return;
        }
        if (MENU_TRIGGERS.includes(text)) {
          await clearSession(to);
          await setSession(to, { lang });
          await sendMainMenu(to, lang);
          return;
        }

        // Process booking input (name or phone)
        await handleBookingText(to, session, message.text.body);
        return;
      }

      // Interactive (button/list click) — allow escape buttons
      if (message.type === "interactive") {
        const reply = message.interactive;
        let id;
        if (reply.type === "button_reply") id = reply.button_reply.id;
        else if (reply.type === "list_reply") id = reply.list_reply.id;

        if (id) {
          const key = stripLang(id);
          // Allow menu, cancel, and back buttons to escape booking
          if (key === "menu" || key === "cancel") {
            await clearSession(to);
            await setSession(to, { lang });
            await sendMainMenu(to, lang);
            return;
          }
        }
      }

      // Any other message type — remind to type
      await sendText(to, lang === "sw"
        ? "Tafadhali andika jibu la maandishi:"
        : "Please type your answer:");
      return;
    }

    // --- AWAITING CONFIRMATION (button click expected) ---
    if (session.state === "awaiting_confirm") {

      // Button/list click — route to confirm/cancel handler
      if (message.type === "interactive") {
        const reply = message.interactive;
        let id;
        if (reply.type === "button_reply") id = reply.button_reply.id;
        else if (reply.type === "list_reply") id = reply.list_reply.id;

        if (id) {
          await handleInteractive(to, id);
          return;
        }
      }

      // Text during confirm — allow escape or resend buttons
      if (message.type === "text") {
        const text = message.text.body.trim().toLowerCase();
        if (WELCOME_TRIGGERS.includes(text)) {
          await clearSession(to);
          await sendWelcome(to);
          return;
        }
        if (MENU_TRIGGERS.includes(text)) {
          await clearSession(to);
          await setSession(to, { lang });
          await sendMainMenu(to, lang);
          return;
        }
      }

      // Resend confirm/cancel buttons
      const t = C.booking[lang];
      await sendButtons(to,
        lang === "sw"
          ? "Tafadhali bonyeza kitufe hapa chini kuthibitisha au kughairi:"
          : "Please tap a button below to confirm or cancel:",
        [
          { id: `${lang}_confirm`, title: t.confirmBtn },
          { id: `${lang}_cancel`, title: t.cancelBtn },
        ]);
      return;
    }
  }

  // ---- Interactive replies (buttons and list selections) ----
  if (message.type === "interactive") {
    const reply = message.interactive;
    let id;
    if (reply.type === "button_reply") {
      id = reply.button_reply.id;
    } else if (reply.type === "list_reply") {
      id = reply.list_reply.id;
    }
    if (id) {
      await handleInteractive(to, id);
      return;
    }
  }

  // ---- Plain text (trigger words) ----
  if (message.type === "text") {
    const text = message.text.body.trim().toLowerCase();

    if (WELCOME_TRIGGERS.includes(text)) {
      await clearSession(to);
      await sendWelcome(to);
      return;
    }

    if (MENU_TRIGGERS.includes(text)) {
      const s = await getSession(to);
      if (s && s.lang) {
        await sendMainMenu(to, s.lang);
      } else {
        await sendWelcome(to);
      }
      return;
    }

    if (HELP_TRIGGERS.includes(text)) {
      const lang = (text === "msaada") ? "sw" : "en";
      await sendHelpPage(to, lang, "p1");
      return;
    }

    // Default: unrecognized input
    await sendText(to, C.unrecognized);
    return;
  }

  // Fallback for any unhandled message type
  await sendText(to, C.unrecognized);
}

// ============ INTERACTIVE ROUTER ============

async function handleInteractive(to, id) {
  // Language selection
  if (id === "lang_sw") {
    await setSession(to, { lang: "sw" });
    await sendMainMenu(to, "sw");
    return;
  }
  if (id === "lang_en") {
    await setSession(to, { lang: "en" });
    await sendMainMenu(to, "en");
    return;
  }

  const lang = getLang(id);
  if (!lang) {
    await sendWelcome(to);
    return;
  }
  const key = stripLang(id);

  // Back to main menu
  if (key === "menu") {
    await clearSession(to);
    await setSession(to, { lang });
    await sendMainMenu(to, lang);
    return;
  }

  // GP
  if (key === "gp") {
    await sendButtons(to, C.gp[lang].body, C.gp[lang].buttons);
    return;
  }
  if (key === "gp_chat" || key === "gp_video") {
    await startBooking(to, lang, key);
    return;
  }

  // Specialist
  if (key === "specialist") {
    await sendButtons(to, C.specialist[lang].body, C.specialist[lang].buttons);
    return;
  }
  if (key === "sp_chat" || key === "sp_video") {
    await startBooking(to, lang, key);
    return;
  }

  // Home Doctor
  if (key === "home") {
    await sendList(to, C.home[lang].body, C.home[lang].buttonText, C.home[lang].sections);
    return;
  }
  if (key === "home_urgent" || key === "home_procedure" || key === "home_amd" || key === "home_sda") {
    const detail = C.homeDetails[lang][key];
    await sendServiceDetail(to, lang, key, detail.body, `${lang}_home`);
    return;
  }

  // Corporate
  if (key === "corporate") {
    await sendList(to, C.corporate[lang].body, C.corporate[lang].buttonText, C.corporate[lang].sections);
    return;
  }
  if (key === "corp_pre" || key === "corp_screen" || key === "corp_wellness") {
    const detail = C.corpDetails[lang][key];
    await sendServiceDetail(to, lang, key, detail.body, `${lang}_corporate`);
    return;
  }

  // Pharmacy
  if (key === "pharmacy") {
    await sendServiceDetail(to, lang, "pharmacy", C.pharmacy[lang].body, `${lang}_menu`);
    return;
  }

  // Booking triggers
  if (key.startsWith("book_")) {
    const serviceKey = key.replace("book_", "");
    await startBooking(to, lang, serviceKey);
    return;
  }

  // Help pages
  if (key === "help_p1" || key === "help_p2" || key === "help_p3") {
    const page = key.replace("help_", "");
    await sendHelpPage(to, lang, page);
    return;
  }
  if (key === "help_done") {
    await sendWelcome(to);
    return;
  }

  // Confirm / Cancel
  if (key === "confirm") {
    await handleConfirm(to, lang);
    return;
  }
  if (key === "cancel") {
    await handleCancel(to, lang);
    return;
  }

  // Fallback
  await sendWelcome(to);
}

// ============ REMINDER SYSTEM ============

async function checkReminders() {
  const sessions = await getAllActiveSessions();
  const now = Date.now();
  let sent = 0;

  for (const { userId, ...session } of sessions) {
    if (!session.state) continue;

    const lang = session.lang || "sw";
    const lastActivity = session.lastActivity || session.timestamp || now;
    const reminderCount = session.reminderCount || 0;
    const lastReminder = session.lastReminder || 0;
    const timeSinceActivity = now - lastActivity;
    const timeSinceReminder = now - lastReminder;

    let messageKey = null;

    if (reminderCount === 0 && timeSinceActivity >= 10 * 60 * 1000) {
      // First reminder: 10 min after last activity
      messageKey = "first";
    } else if (reminderCount === 1 && timeSinceReminder >= 10 * 60 * 1000) {
      // Second reminder: 10 min after first
      messageKey = "second";
    } else if (reminderCount >= 2 && timeSinceReminder >= 12 * 60 * 60 * 1000) {
      // Daily reminders: every 12 hours (twice per day)
      messageKey = "daily";
    }

    if (messageKey) {
      try {
        await sendText(userId, C.reminder[lang][messageKey]);
        await setSession(userId, {
          ...session,
          reminderCount: reminderCount + 1,
          lastReminder: now,
        });
        sent++;
      } catch (err) {
        console.error(`Reminder send error for ${userId}:`, err.message);
      }
    }
  }

  return sent;
}

module.exports = { handleMessage, checkReminders };
