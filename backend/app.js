require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes (uncomment as we build them) ──────────────────────
// const authRoutes = require("./routes/authRoutes");
// app.use("/api/auth", authRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "LabTrack API is running 🧬" });
});

// ─── Connect to MongoDB ───────────────────────────────────────
async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

dbConnect();

// ─── Import Routes ─────────────────────────────────────────────
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);



// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});