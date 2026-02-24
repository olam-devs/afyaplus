// Snippe payment webhook — handles payment.completed and payment.failed events
// bodyParser disabled so we can read raw bytes for HMAC signature verification
const crypto = require("crypto");
const { sendText } = require("../../lib/whatsapp");
const { sendBookingEmail } = require("../../lib/email");

// Disable Vercel's automatic body parsing — we need the raw bytes
module.exports.config = { api: { bodyParser: false } };

// Read raw body from request stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function fmtAmount(value, currency) {
  return `${currency || "TZS"} ${Number(value).toLocaleString()}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Read raw body for signature verification
  const rawBody = await getRawBody(req);

  // Verify signature if secret is configured
  const secret = process.env.SNIPPE_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers["x-webhook-signature"];
    if (!signature || !verifySignature(rawBody, signature, secret)) {
      console.error("Snippe webhook: invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  // Parse body after verification
  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  console.log("SNIPPE WEBHOOK:", event?.type, JSON.stringify(event?.data)?.slice(0, 300));

  try {
    if (event.type === "payment.completed") {
      const d = event.data;
      const meta = d.metadata || {};
      const whatsappPhone = meta.whatsapp_phone;
      const lang = meta.lang || "sw";
      const name = meta.customer_name || d.customer?.name || "Mteja";
      const service = meta.service_name || "Huduma";
      const price = meta.service_price || "";
      const contactPhone = meta.contact_phone || d.customer?.phone || "N/A";
      const paymentPhone = meta.payment_phone || d.customer?.phone || "N/A";
      const amount = fmtAmount(d.amount?.value, d.amount?.currency);
      const ref = d.reference || d.external_reference || "";
      const provider = d.channel?.provider || d.payment_method || "N/A";

      // ── Warm thank-you to customer ──
      if (whatsappPhone) {
        const msg =
          lang === "sw"
            ? `✅ *Asante ${name}!*\n\nMalipo yako ya *${amount}* kwa huduma ya *${service}* yamepokelewa.\n\nTimu yetu ya Afya+ itawasiliana nawe mapema iwezekanavyo kuweka miadi yako.\n\nRef: ${ref}`
            : `✅ *Thank you, ${name}!*\n\nYour payment of *${amount}* for *${service}* has been received.\n\nThe Afya+ team will get back to you shortly to schedule your appointment.\n\nRef: ${ref}`;
        await sendText(whatsappPhone, msg).catch((e) =>
          console.error("Snippe webhook: customer notify error:", e.message)
        );
      }

      // ── Admin WhatsApp alert with full booking details ──
      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminPhone) {
        const adminMsg =
          `💰 *Booking Confirmed — Afya+*\n\n` +
          `👤 Mteja: ${name}\n` +
          `📱 WhatsApp: +${whatsappPhone || "N/A"}\n` +
          `📞 Simu ya Mawasiliano: ${contactPhone}\n` +
          `💳 Simu ya Malipo: ${paymentPhone}\n` +
          `🏥 Huduma: ${service}\n` +
          `💵 Kiasi: ${amount}\n` +
          `🔌 Mbinu: ${provider}\n` +
          `🔖 Ref: ${ref}`;
        await sendText(adminPhone, adminMsg).catch((e) =>
          console.error("Snippe webhook: admin notify error:", e.message)
        );
      }

      // ── Admin confirmation email ──
      await sendBookingEmail({
        name,
        contactPhone,
        paymentPhone,
        service,
        price,
        lang,
        paymentStatus: "Completed",
        paymentRef: ref,
      }).catch((e) => console.error("Snippe webhook: confirmation email error:", e.message));
    }

    if (event.type === "payment.failed") {
      const d = event.data;
      const meta = d.metadata || {};
      const whatsappPhone = meta.whatsapp_phone;
      const lang = meta.lang || "sw";
      const reason = d.failure_reason || (lang === "sw" ? "Tatizo la mtandao" : "Network issue");

      if (whatsappPhone) {
        const msg =
          lang === "sw"
            ? `❌ *Malipo Hayakufanikiwa*\n\nSamahani, malipo yako hayakufanikiwa.\nSababu: ${reason}\n\nTafadhali jaribu tena au wasiliana na Afya+ kwa msaada.`
            : `❌ *Payment Failed*\n\nSorry, your payment was unsuccessful.\nReason: ${reason}\n\nPlease try again or contact Afya+ for assistance.`;
        await sendText(whatsappPhone, msg).catch((e) =>
          console.error("Snippe webhook: customer fail notify error:", e.message)
        );
      }
    }
  } catch (err) {
    console.error("Snippe webhook processing error:", err.message);
  }

  return res.status(200).json({ received: true });
};
