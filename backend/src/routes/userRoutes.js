const express = require("express");

const router = express.Router();

const {
    getAllUsers,
    getUserById
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =======================================
// User Routes
// =======================================

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