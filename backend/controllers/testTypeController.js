const TestType = require("../models/TestType");

// ─── Create Test Type (Admin only) ────────────────────────────
const createTest = async (req, res) => {
  try {
    const { name, category, description, normalRange, unit, turnaroundDays } = req.body;

    // Check if test already exists
    const existing = await TestType.findOne({ name });
    if (existing) {
      return res.status(400).json({ msg: "Test type already exists" });
    }

    const test = await TestType.create({
      name,
      category,
      description,
      normalRange,
      unit,
      turnaroundDays,
    });

    res.status(201).json({ msg: "Test type created successfully", test });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ─── Get All Active Test Types ─────────────────────────────────
const listTests = async (req, res) => {
  try {
    const tests = await TestType.find({ isActive: true });
    res.status(200).json({ tests });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ─── Update Test Type (Admin only) ────────────────────────────
const updateTest = async (req, res) => {
  try {
    const test = await TestType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ msg: "Test type not found" });
    }

    res.status(200).json({ msg: "Test type updated successfully", test });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ─── Deactivate Test Type (Admin only) ────────────────────────
const deleteTest = async (req, res) => {
  try {
    const test = await TestType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ msg: "Test type not found" });
    }

    res.status(200).json({ msg: "Test type deactivated successfully", test });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = { createTest, listTests, updateTest, deleteTest };