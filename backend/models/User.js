const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    patientCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "doctor", "technician", "patient"],
      default: "patient",
    },

    specialization: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔐 Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,

    // 🔁 Reset Password
    resetToken: String,
    resetTokenExpire: Date,
  },
  { timestamps: true }
);


// 🔒 Hash Password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔑 Compare Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;