const express = require("express");
const router = express.Router();

const {
    getDashboardSummary,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizePermissions = require("../middleware/authorizePermissions");

// Dashboard Summary
router.get(
    "/",
    authMiddleware,
   authorizePermissions("dashboard.view"),
    getDashboardSummary
);

module.exports = router;
