const { handleMessage, checkReminders } = require("../lib/flow");

module.exports = async function handler(req, res) {
  // ============ GET: Webhook Verification ============
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("Webhook verified");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // ============ POST: Incoming Messages ============
  if (req.method === "POST") {
    try {
      const body = req.body;

      // Validate WhatsApp webhook payload
      if (
        body?.object === "whatsapp_business_account" &&
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      ) {
        const change = body.entry[0].changes[0].value;
        const message = change.messages[0];
        const from = message.from; // sender phone number

        console.log("INCOMING:", { from, type: message.type, body: message.text?.body || message.interactive?.button_reply?.id || message.interactive?.list_reply?.id });

        // Await message handling before responding —
        // Vercel freezes the function after res is sent,
        // so fire-and-forget async work will be killed.
        try {
          await handleMessage(from, message);
        } catch (err) {
          console.error("Error handling message:", err);
        }

        // Piggyback: check and send pending reminders to other users
        try {
          await checkReminders();
        } catch (err) {
          console.error("Reminder check error:", err);
        }
      }
    } catch (err) {
      console.error("Webhook POST error:", err);
    }

    // Always return 200 to WhatsApp
    return res.status(200).json({ status: "ok" });
  }

  return res.status(405).send("Method Not Allowed");
};
