const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

// =======================================
// User Routes
// =======================================

// Get All Users
router.get("/", getAllUsers);

// Get User By ID
router.get("/:id", getUserById);

module.exports = router;