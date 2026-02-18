// Post-payment browser redirect — user lands here after paying on PesaPal
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Afya+ Payment</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, Arial, sans-serif; background: #f0f8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px 30px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .logo { font-size: 28px; font-weight: bold; color: #25D366; margin-bottom: 8px; }
    .check { font-size: 48px; margin: 16px 0; }
    h1 { font-size: 20px; color: #333; margin-bottom: 8px; }
    p { color: #666; font-size: 15px; line-height: 1.5; margin-bottom: 20px; }
    .btn { display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-size: 16px; font-weight: 600; }
    .btn:hover { background: #1da851; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Afya+</div>
    <div class="check">&#10003;</div>
    <h1>Asante! / Thank you!</h1>
    <p>Malipo yako yamepokelewa. Timu yetu itawasiliana nawe hivi karibuni.<br><br>
    <em>Your payment has been received. Our team will contact you shortly.</em></p>
    <a class="btn" href="https://wa.me/?text=hi">Back to WhatsApp</a>
  </div>
</body>
</html>`);
};
