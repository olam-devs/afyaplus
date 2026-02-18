// PesaPal IPN callback — they ping this when payment status changes
const { getTransactionStatus } = require("../../lib/pesapal");
const { sendText, sendButtons } = require("../../lib/whatsapp");
const { sendBookingEmail } = require("../../lib/email");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const { OrderTrackingId, OrderMerchantReference } = req.query;

  if (!OrderTrackingId) {
    return res.status(400).json({ error: "Missing OrderTrackingId" });
  }

  try {
    const status = await getTransactionStatus(OrderTrackingId);
    console.log("IPN:", { OrderTrackingId, OrderMerchantReference, status: status.payment_status_description });

    // Payment completed — notify user + admin
    if (status.payment_status_description === "Completed") {
      // Extract WhatsApp number from merchant reference (format: AFYA_255xxx_timestamp)
      const parts = (OrderMerchantReference || "").split("_");
      const userPhone = parts.length >= 2 ? parts[1] : null;

      if (userPhone) {
        // Notify user on WhatsApp
        await sendButtons(userPhone,
          "Malipo yako yamepokewa! Asante kwa kutumia Afya+. Timu yetu itawasiliana nawe hivi karibuni.\n\n" +
          "_Your payment has been received! Thank you for using Afya+. Our team will contact you shortly._",
          [{ id: "lang_sw", title: "Kiswahili" }, { id: "lang_en", title: "English" }]
        );
        console.log("Payment confirmation sent to:", userPhone);
      }

      // Send payment confirmation email to admin
      sendBookingEmail({
        name: status.description || OrderMerchantReference,
        phone: userPhone || "N/A",
        service: status.description || "N/A",
        price: `TZS ${status.amount?.toLocaleString() || "N/A"}`,
        lang: "en",
        paymentStatus: "Completed",
      }).catch(err => console.error("IPN email error:", err.message));
    }

    return res.status(200).json({
      orderTrackingId: OrderTrackingId,
      status: status.payment_status_description,
    });
  } catch (err) {
    console.error("IPN error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
