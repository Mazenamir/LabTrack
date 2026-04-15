const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// ─── Generate JWT Token ───────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

//Register 

const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, phone } = req.body;
    const findUser = await User.findOne({ email });

    if (findUser) {
      return res.status(400).json({ msg: "E-Mail is used already" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name,
      email,
      password,
      role,
      specialization,
      phone,
      verificationToken,
    });

    if (role === "patient") {
      const count = await User.countDocuments({ role: "patient" });
      user.patientCode = `P-${String(count).padStart(3, "0")}`;
      await user.save();
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/api/users/verify/${user.verificationToken}`;

    await sendEmail(
      user.email,
      "Please verify your email",
      `
        <p>Hi ${user.name || "there"},</p>
        <p>Thanks for registering. Click the link below to verify your email:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>If you did not create this account, ignore this message.</p>
      `
    );

    res.status(201).json({
      msg: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientCode: user.patientCode,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};



// Login
const login = async (req , res) => {
    try {
        const {email , password} = req.body ;

        const user = await User.findOne({email})
        if (!user){
            return res.status(400).json({msg :"invailed E-mail or password"})

        }

        if (!user.isActive){
            return res.status(400).json({msg :"Account isn't Active"})
            
        }

        //Check the password

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    if (user.role === "patient" && !user.patientCode) {
      const count = await User.countDocuments({ role: "patient" });
      user.patientCode = `P-${String(count).padStart(3, "0")}`;
      await user.save();
    }

    
    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientCode: user.patientCode,
      },
    });
    } catch (error) {
        res.status(500).json({msg : "Server Error" , error : error.message});
    }
};


//GetMe => to Get the user-Profile (Admin - Patient ....)

    const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
};