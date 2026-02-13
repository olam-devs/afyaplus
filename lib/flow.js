const { sendText, sendButtons, sendList } = require("./whatsapp");
const { getSession, setSession, clearSession } = require("./session");
const C = require("./content");

// Trigger words (case-insensitive)
const WELCOME_TRIGGERS = ["hi", "hello", "hey", "habari", "mambo", "niaje", "start", "anza", "karibu", "salaam", "jambo", "hujambo", "afya", "afya+"];
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

// Send welcome message with language selection
async function sendWelcome(to) {
  await sendButtons(to, C.welcome.body, C.welcome.buttons);
}

// Send main menu
async function sendMainMenu(to, lang) {
  const menu = C.mainMenu[lang];
  await sendList(to, menu.body, menu.buttonText, menu.sections);
}

// Send service detail with book + back buttons
async function sendServiceDetail(to, lang, serviceKey, bodyText, backId) {
  const labels = C.bookBackButtons[lang];
  await sendButtons(to, bodyText, [
    { id: `${lang}_book_${serviceKey}`, title: labels.book },
    { id: backId, title: labels.back },
    { id: `${lang}_menu`, title: labels.menu },
  ]);
}

// Start booking flow
async function startBooking(to, lang, serviceKey) {
  const t = C.booking[lang];
  setSession(to, { state: "awaiting_name", lang, serviceKey });
  await sendText(to, t.askName);
}

// Handle text input during booking
async function handleBookingText(to, session, text) {
  const lang = session.lang;
  const t = C.booking[lang];

  if (session.state === "awaiting_name") {
    // Validate name: at least 2 characters, letters and spaces only
    const name = text.trim();
    if (name.length < 2 || !/^[a-zA-Z\s]+$/.test(name)) {
      await sendText(to, lang === "sw"
        ? "Tafadhali andika jina sahihi (herufi tu):"
        : "Please enter a valid name (letters only):");
      return;
    }
    setSession(to, { ...session, state: "awaiting_phone", name });
    await sendText(to, t.askPhone);
  } else if (session.state === "awaiting_phone") {
    // Validate phone: digits, optionally starting with +
    const phone = text.trim().replace(/[\s\-()]/g, "");
    if (!/^\+?\d{9,15}$/.test(phone)) {
      await sendText(to, t.invalidPhone);
      return;
    }
    const svc = C.serviceLabels[lang][session.serviceKey];
    const confirmText = t.confirm(session.name, phone, svc.name, svc.price);
    setSession(to, { ...session, state: "awaiting_confirm", phone });
    await sendButtons(to, confirmText, [
      { id: `${lang}_confirm`, title: t.confirmBtn },
      { id: `${lang}_cancel`, title: t.cancelBtn },
    ]);
  }
}

// Handle confirmed booking
async function handleConfirm(to, lang) {
  const session = getSession(to);
  if (!session) {
    await sendWelcome(to);
    return;
  }
  const t = C.booking[lang];
  const labels = C.bookBackButtons[lang];
  const name = session.name;

  // Log booking (in production, save to DB / send to admin)
  console.log("BOOKING:", {
    name: session.name,
    phone: session.phone,
    service: session.serviceKey,
    lang: session.lang,
    timestamp: new Date().toISOString(),
  });

  clearSession(to);
  await sendButtons(to, t.success(name), [
    { id: `${lang}_menu`, title: labels.menu },
  ]);
}

// Handle cancelled booking
async function handleCancel(to, lang) {
  clearSession(to);
  const t = C.booking[lang];
  const labels = C.bookBackButtons[lang];
  await sendButtons(to, t.cancelled, [
    { id: `${lang}_menu`, title: labels.menu },
  ]);
}

// ============ MAIN ROUTER ============
async function handleMessage(to, message) {
  // Check for active booking session first (text input)
  const session = getSession(to);
  if (session && (session.state === "awaiting_name" || session.state === "awaiting_phone")) {
    // Only handle plain text during booking
    if (message.type === "text") {
      await handleBookingText(to, session, message.text.body);
      return;
    }
  }

  // Handle interactive replies (buttons and list selections)
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

  // Handle plain text (trigger words)
  if (message.type === "text") {
    const text = message.text.body.trim().toLowerCase();

    if (WELCOME_TRIGGERS.includes(text)) {
      clearSession(to);
      await sendWelcome(to);
      return;
    }

    // Menu triggers: check if user has a language preference in session
    if (MENU_TRIGGERS.includes(text)) {
      const s = getSession(to);
      if (s && s.lang) {
        await sendMainMenu(to, s.lang);
      } else {
        await sendWelcome(to);
      }
      return;
    }

    if (HELP_TRIGGERS.includes(text)) {
      const s = getSession(to);
      const lang = (s && s.lang) || "sw";
      await sendText(to, C.help[lang]);
      return;
    }

    // Default: show welcome
    await sendWelcome(to);
    return;
  }

  // Fallback for any unhandled message type
  await sendWelcome(to);
}

// Route interactive button/list replies
async function handleInteractive(to, id) {
  // === Language selection ===
  if (id === "lang_sw") {
    setSession(to, { lang: "sw" });
    await sendMainMenu(to, "sw");
    return;
  }
  if (id === "lang_en") {
    setSession(to, { lang: "en" });
    await sendMainMenu(to, "en");
    return;
  }

  const lang = getLang(id);
  if (!lang) {
    await sendWelcome(to);
    return;
  }
  const key = stripLang(id);

  // === Back to main menu ===
  if (key === "menu") {
    clearSession(to);
    setSession(to, { lang });
    await sendMainMenu(to, lang);
    return;
  }

  // === GP ===
  if (key === "gp") {
    await sendButtons(to, C.gp[lang].body, C.gp[lang].buttons);
    return;
  }
  if (key === "gp_chat" || key === "gp_video") {
    await startBooking(to, lang, key);
    return;
  }

  // === Specialist ===
  if (key === "specialist") {
    await sendButtons(to, C.specialist[lang].body, C.specialist[lang].buttons);
    return;
  }
  if (key === "sp_chat" || key === "sp_video") {
    await startBooking(to, lang, key);
    return;
  }

  // === Home Doctor ===
  if (key === "home") {
    await sendList(to, C.home[lang].body, C.home[lang].buttonText, C.home[lang].sections);
    return;
  }
  if (key === "home_urgent" || key === "home_procedure" || key === "home_amd" || key === "home_sda") {
    const detail = C.homeDetails[lang][key];
    await sendServiceDetail(to, lang, key, detail.body, `${lang}_home`);
    return;
  }

  // === Corporate ===
  if (key === "corporate") {
    await sendList(to, C.corporate[lang].body, C.corporate[lang].buttonText, C.corporate[lang].sections);
    return;
  }
  if (key === "corp_pre" || key === "corp_screen" || key === "corp_wellness") {
    const detail = C.corpDetails[lang][key];
    await sendServiceDetail(to, lang, key, detail.body, `${lang}_corporate`);
    return;
  }

  // === Pharmacy ===
  if (key === "pharmacy") {
    await sendServiceDetail(to, lang, "pharmacy", C.pharmacy[lang].body, `${lang}_menu`);
    return;
  }

  // === Booking triggers ===
  if (key.startsWith("book_")) {
    const serviceKey = key.replace("book_", "");
    await startBooking(to, lang, serviceKey);
    return;
  }

  // === Confirm / Cancel ===
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

module.exports = { handleMessage };
