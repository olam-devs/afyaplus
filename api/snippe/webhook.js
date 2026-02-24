// Snippe payment webhook — handles payment.completed and payment.failed events
// Sends WhatsApp notifications to customer and admin
const crypto = require("crypto");
const { sendText } = require("../../lib/whatsapp");

// Best-effort signature verification (uses stringified body — works if key order matches)
function verifySignature(body, signature, secret) {
  if (!secret || !signature) return true;
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");
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

  // Signature verification (optional — set SNIPPE_WEBHOOK_SECRET to enable)
  const secret = process.env.SNIPPE_WEBHOOK_SECRET;
  const signature = req.headers["x-webhook-signature"];
  if (secret && !verifySignature(req.body, signature, secret)) {
    console.error("Snippe webhook: invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body;
  console.log("SNIPPE WEBHOOK:", event?.type, JSON.stringify(event?.data)?.slice(0, 300));

  try {
    if (event.type === "payment.completed") {
      const d = event.data;
      const meta = d.metadata || {};
      const whatsappPhone = meta.whatsapp_phone;
      const lang = meta.lang || "sw";
      const name = d.customer?.name || meta.customer_name || "Mteja";
      const service = meta.service_name || "Huduma";
      const amount = fmtAmount(d.amount?.value, d.amount?.currency);
      const ref = d.reference || d.external_reference || "";
      const provider = d.channel?.provider || d.payment_method || "";

      // ── Notify customer ──
      if (whatsappPhone) {
        const msg =
          lang === "sw"
            ? `✅ *Malipo Yamepokelewa!*\n\nAsante ${name}! Malipo yako ya *${amount}* kwa huduma ya *${service}* yamefanikiwa.\n\nTimu yetu itawasiliana nawe hivi karibuni.\n\nRef: ${ref}`
            : `✅ *Payment Received!*\n\nThank you ${name}! Your payment of *${amount}* for *${service}* was successful.\n\nThe Afya+ team will contact you shortly.\n\nRef: ${ref}`;
        await sendText(whatsappPhone, msg).catch((e) =>
          console.error("Snippe webhook: customer notify error:", e.message)
        );
      }

      // ── Notify admin ──
      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminPhone) {
        const adminMsg =
          `💰 *Malipo Mapya — Afya+*\n\n` +
          `Mteja: ${name}\n` +
          `WhatsApp: ${whatsappPhone ? "+" + whatsappPhone : "N/A"}\n` +
          `Simu: ${d.customer?.phone || "N/A"}\n` +
          `Huduma: ${service}\n` +
          `Kiasi: ${amount}\n` +
          `Mbinu: ${provider || "N/A"}\n` +
          `Ref: ${ref}`;
        await sendText(adminPhone, adminMsg).catch((e) =>
          console.error("Snippe webhook: admin notify error:", e.message)
        );
      }
    }

    if (event.type === "payment.failed") {
      const d = event.data;
      const meta = d.metadata || {};
      const whatsappPhone = meta.whatsapp_phone;
      const lang = meta.lang || "sw";
      const reason =
        d.failure_reason ||
        (lang === "sw" ? "Tatizo la mtandao" : "Network issue");

      if (whatsappPhone) {
        const msg =
          lang === "sw"
            ? `❌ *Malipo Hayakufanikiwa*\n\nSamahani, malipo yako hayakufanikiwa.\nSababu: ${reason}\n\nTafadhali jaribu tena kupitia kiungo ulichopewa, au wasiliana na Afya+ kwa msaada.`
            : `❌ *Payment Failed*\n\nSorry, your payment was unsuccessful.\nReason: ${reason}\n\nPlease try again using the link you received, or contact Afya+ for assistance.`;
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
