const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =======================================
// User Routes
// =======================================

// Create User (OWNER Only)
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("OWNER"),
  createUser
);

// Update User (OWNER Only)
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER"),
  updateUser
);

// Get All Users (OWNER Only)
router.get(
  "/",
  authMiddleware,
  authorizeRoles("OWNER"),
  getAllUsers
);

// Get User By ID (OWNER Only)
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER"),
  getUserById
);

module.exports = router;