const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
      attachments,
    });

    console.log("Email sent ✅");

  } catch (err) {
    console.log("Email error ❌", err);
  }
};

module.exports = sendEmail;