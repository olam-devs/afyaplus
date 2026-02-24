// Snippe Payment API helper
// Env vars: SNIPPE_API_KEY, APP_URL
const axios = require("axios");

const BASE_URL = "https://api.snippe.sh";

// Normalize any TZ phone format to +255XXXXXXXXX for Snippe customer object
function normalizePhone(phone) {
  const cleaned = String(phone).replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+255")) return cleaned;
  if (cleaned.startsWith("255") && cleaned.length >= 12) return "+" + cleaned;
  if (cleaned.startsWith("0") && cleaned.length >= 10) return "+255" + cleaned.slice(1);
  if (cleaned.length === 9) return "+255" + cleaned;
  return "+" + cleaned;
}

function getAppUrl() {
  return process.env.APP_URL || "https://afyaplus.vercel.app";
}

// Create a hosted checkout session — returns payment_link_url and reference
async function createPaymentSession({ amount, customerName, customerPhone, description, metadata }) {
  const webhookUrl = `${getAppUrl()}/api/snippe/webhook`;

  const response = await axios.post(
    `${BASE_URL}/v1/sessions`,
    {
      amount,
      currency: "TZS",
      allowed_methods: ["mobile_money", "qr"],
      customer: {
        name: customerName,
        phone: normalizePhone(customerPhone),
        email: "customer@afyaplus.co.tz",
      },
      webhook_url: webhookUrl,
      description,
      metadata,
      expires_in: 14400, // 4 hours
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SNIPPE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
}

module.exports = { createPaymentSession, normalizePhone };
