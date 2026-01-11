const nodemailer = require('nodemailer');

exports.sendNotification = async (req, res) => {
  const { to, subject, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
    res.json({ message: 'Notification sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
