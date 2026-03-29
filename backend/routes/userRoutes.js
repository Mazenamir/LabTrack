const express = require("express");
const router = express.Router();
const { register , login , getMe} = require("../controllers/userController");
const { verifyToken } = require("../middleware/userMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const User = require("../models/User");

router.post("/register", register);

router.post("/login", login);



// const { allowRoles } = require("../middleware/roleMiddleware");

// temp test route — delete after testing

router.get("/test", allowRoles("admin","doctor"), (req, res) => {
    res.json({ message: "This route is protected and accessible to admin, doctor, and lab_manager roles only." });
});





// Get all patients (doctor only)
router.get("/patients", verifyToken, allowRoles("doctor", "admin"), async (req, res) => {
  try {
    const patients = await User.find({ role: "patient", isActive: true }).select("name email phone");
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});



// GET /api/users/search?patientCode=P-001
router.get("/search", verifyToken, allowRoles("doctor", "admin"), async (req, res) => {
  try {
    const { patientCode } = req.query;
    const user = await User.findOne({ patientCode, role: "patient" }).select("-password");
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", verifyToken, getMe) ; 
module.exports = router;