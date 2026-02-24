// Snippe Payment API helper
// Env vars: SNIPPE_API_KEY, APP_URL
const axios = require("axios");

const BASE_URL = "https://api.snippe.sh";

// Normalize phone to 255XXXXXXXXX (no +) — required format for Snippe phone_number field
function normalizePhone(phone) {
  const cleaned = String(phone).replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+255")) return cleaned.slice(1);
  if (cleaned.startsWith("255") && cleaned.length >= 12) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length >= 10) return "255" + cleaned.slice(1);
  if (cleaned.length === 9) return "255" + cleaned;
  return cleaned;
}

function getAppUrl() {
  return process.env.APP_URL || "https://afyaplus.vercel.app";
}

// Trigger a USSD push directly to the customer's mobile money phone
async function createMobilePayment({ amount, customerPhone, customerFirstName, customerLastName, metadata }) {
  const phone = normalizePhone(customerPhone);
  const idempotencyKey = `AFYA_${phone}_${Date.now()}`;

  const response = await axios.post(
    `${BASE_URL}/v1/payments`,
    {
      payment_type: "mobile",
      details: { amount, currency: "TZS" },
      phone_number: phone,
      customer: {
        firstname: customerFirstName || "Customer",
        lastname: customerLastName || ".",
        email: "customer@afyaplus.co.tz",
      },
      webhook_url: `${getAppUrl()}/api/snippe/webhook`,
      metadata,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SNIPPE_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  return response.data.data;
}

module.exports = { createMobilePayment, normalizePhone };
