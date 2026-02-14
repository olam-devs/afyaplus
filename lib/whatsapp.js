const axios = require("axios");

const API_VERSION = "v21.0";

function getBaseUrl() {
  return `https://graph.facebook.com/${API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function sendMessage(data) {
  try {
    console.log("OUTGOING:", { to: data.to, type: data.type, body: data.text?.body || data.interactive?.type });
    const resp = await axios.post(getBaseUrl(), data, { headers: getHeaders() });
    console.log("API_RESPONSE:", resp.status);
  } catch (err) {
    console.error("WhatsApp API error:", err.response?.data || err.message);
  }
}

async function sendText(to, text) {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

async function sendButtons(to, bodyText, buttons) {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

async function sendList(to, bodyText, buttonText, sections) {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: {
        button: buttonText,
        sections: sections.map((s) => ({
          title: s.title,
          rows: s.rows.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description || "",
          })),
        })),
      },
    },
  });
}

module.exports = { sendText, sendButtons, sendList };
