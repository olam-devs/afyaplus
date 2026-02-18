// Email notifications via Resend API
const axios = require("axios");

const RESEND_URL = "https://api.resend.com/emails";

async function sendBookingEmail({ name, phone, service, price, lang, paymentUrl, paymentStatus }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return;

  const from = process.env.FROM_EMAIL || "Afya+ <onboarding@resend.dev>";
  const isPaid = paymentStatus === "Completed";
  const statusColor = isPaid ? "#25D366" : "#e67e22";
  const statusText = isPaid ? "PAID" : "AWAITING PAYMENT";

  const html = `
    <div style="font-family:-apple-system,Arial,sans-serif;max-width:500px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
      <div style="background:#25D366;padding:20px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Afya+ New Booking</h1>
      </div>
      <div style="padding:24px;">
        <div style="display:inline-block;background:${statusColor};color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:bold;margin-bottom:16px;">
          ${statusText}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${phone}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;">Service</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${service}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;">Price</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${price}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;">Language</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${lang === "sw" ? "Kiswahili" : "English"}</td></tr>
          <tr><td style="padding:10px 0;color:#888;">Payment</td><td style="padding:10px 0;font-weight:600;color:${statusColor};">${statusText}</td></tr>
        </table>
        ${paymentUrl ? `<div style="margin-top:16px;"><a href="${paymentUrl}" style="color:#25D366;font-size:13px;">Payment Link</a></div>` : ""}
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;color:#888;font-size:12px;">
          Contact client: <a href="https://wa.me/${phone}" style="color:#25D366;">WhatsApp ${phone}</a>
        </div>
      </div>
    </div>`;

  const subject = isPaid
    ? `Payment Received - ${name} (${service})`
    : `New Booking - ${name} (${service}) - Awaiting Payment`;

  try {
    await axios.post(RESEND_URL, {
      from,
      to: [adminEmail],
      subject,
      html,
    }, {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Email sent:", subject);
  } catch (err) {
    console.error("Resend email error:", err.response?.data || err.message);
  }
}

module.exports = { sendBookingEmail };
