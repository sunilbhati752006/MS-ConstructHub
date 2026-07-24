const express = require("express");
const router = express.Router();

const {
    register,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    getCurrentUser
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/test", (req, res) => {
    res.json({
        message: "Auth Route Working"
    });
});

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Profile Access Granted",
        user: req.user
    });
});

router.get(
    "/me",
    authMiddleware,
    getCurrentUser
);

router.get(
    "/admin",
    authMiddleware,
    authorizeRoles("OWNER"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Owner"
        });
    }
);

module.exports = router;