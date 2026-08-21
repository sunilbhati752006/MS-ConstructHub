const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserStatus,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Create User (OWNER Only)
router.post(
    "/create",
    authMiddleware,
    authorizeRoles("OWNER"),
    createUser
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

// Update User (OWNER Only)
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateUser
);

// Activate / Deactivate User (OWNER Only)
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateUserStatus
);

module.exports = router;
