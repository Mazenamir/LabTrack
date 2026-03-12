const express = require("express");
const router = express.Router();
const { createTest, listTests, updateTest, deleteTest } = require("../controllers/testTypeController");
const { verifyToken } = require("../middleware/userMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Everyone logged in can see tests
router.get("/", verifyToken, listTests);

// Admin only
router.post("/", verifyToken, allowRoles("admin"), createTest);
router.put("/:id", verifyToken, allowRoles("admin"), updateTest);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteTest);

module.exports = router;