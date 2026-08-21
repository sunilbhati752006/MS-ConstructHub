const express = require("express");
const router = express.Router();

const {
    getDashboardSummary,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Dashboard Summary
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getDashboardSummary
);

module.exports = router;
