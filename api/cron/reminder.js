const { checkReminders } = require("../../lib/flow");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Optional auth: set CRON_SECRET env var to protect this endpoint
  if (process.env.CRON_SECRET) {
    const token =
      req.headers.authorization?.replace("Bearer ", "") || req.query.token;
    if (token !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const sent = await checkReminders();
    console.log(`Reminder cron: sent ${sent} reminders`);
    return res.status(200).json({ status: "ok", sent });
  } catch (err) {
    console.error("Reminder cron error:", err);
    return res.status(500).json({ error: err.message });
  }
};
