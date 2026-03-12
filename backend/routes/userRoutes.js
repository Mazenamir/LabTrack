const express = require("express");
const router = express.Router();
const { register , login , getMe} = require("../controllers/userController");
const { verifyToken } = require("../middleware/userMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.post("/register", register);

router.post("/login", login);



// const { allowRoles } = require("../middleware/roleMiddleware");

// temp test route — delete after testing

router.get("/test", allowRoles("admin","doctor"), (req, res) => {
    res.json({ message: "This route is protected and accessible to admin, doctor, and lab_manager roles only." });
});

router.get("/me", verifyToken, getMe) ; 
module.exports = router;