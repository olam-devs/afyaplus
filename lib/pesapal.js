// PesaPal API v3 helper for serverless (no Express needed)
// Env vars: PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_ENV (demo|live)
const axios = require("axios");

const DEMO_URL = "https://cybqa.pesapal.com/pesapalv3";
const LIVE_URL = "https://pay.pesapal.com/v3";

// Cache token and IPN ID in memory (re-fetched on cold start)
let cachedToken = null;
let cachedTokenExpiry = 0;
let cachedIpnId = null;

function getBaseUrl() {
  return process.env.PESAPAL_ENV === "live" ? LIVE_URL : DEMO_URL;
}

// Step 1: Authenticate — get bearer token
async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const resp = await axios.post(`${getBaseUrl()}/api/Auth/RequestToken`, {
    consumer_key: process.env.PESAPAL_CONSUMER_KEY,
    consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
  }, {
    headers: { Accept: "text/plain", "Content-Type": "application/json" },
  });

  cachedToken = resp.data.token;
  cachedTokenExpiry = new Date(resp.data.expiryDate).getTime();
  return cachedToken;
}

// Step 2: Register IPN callback (auto-cached, PesaPal deduplicates)
async function getIpnId() {
  if (cachedIpnId) return cachedIpnId;

  const token = await getAccessToken();
  const ipnUrl = `${getCallbackBaseUrl()}/api/pesapal/ipn`;

  const resp = await axios.post(`${getBaseUrl()}/api/URLSetup/RegisterIPN`, {
    url: ipnUrl,
    ipn_notification_type: "GET",
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
  });

  cachedIpnId = resp.data.ipn_id;
  console.log("PesaPal IPN registered:", cachedIpnId);
  return cachedIpnId;
}

// Step 3: Submit order — returns { order_tracking_id, redirect_url }
async function submitOrder({ orderId, amount, currency, description, billing, callbackPageUrl }) {
  const token = await getAccessToken();
  const ipnId = await getIpnId();

  const resp = await axios.post(`${getBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    id: orderId,
    currency,
    amount,
    description,
    callback_url: callbackPageUrl,
    notification_id: ipnId,
    billing_address: billing,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
  });

  console.log("PesaPal order submitted:", resp.data);
  return resp.data;
}

// Step 4: Check transaction status
async function getTransactionStatus(orderTrackingId) {
  const token = await getAccessToken();

  const resp = await axios.get(`${getBaseUrl()}/api/Transactions/GetTransactionStatus`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
    params: { orderTrackingId },
  });

  return resp.data;
}

// Helper: get your deployed base URL
function getCallbackBaseUrl() {
  return process.env.APP_URL || "https://afyaplus.vercel.app";
}

module.exports = { getAccessToken, getIpnId, submitOrder, getTransactionStatus, getCallbackBaseUrl };
