const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.get("/test-email", async (req, res) => {
  const to = process.env.EMAIL;

  await sendEmail(
    to,
    "Test ✅",
    "Email is working 🚀"
  );

  res.send("Email Sent ✅");
});

module.exports = router;