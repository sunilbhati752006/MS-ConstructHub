const express = require("express");
const router = express.Router();

const {
    getLabourReport,
    getProjectReport,
    getAttendanceReport,
    getPayrollReport,
    getExpenseReport,
    getMaterialReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Labour Report
router.get(
    "/labours",
    authMiddleware,
    authorizeRoles("OWNER"),
    getLabourReport
);

// Project Report
router.get(
    "/projects",
    authMiddleware,
    authorizeRoles("OWNER"),
    getProjectReport
);

// Attendance Report
router.get(
    "/attendance",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAttendanceReport
);

// Payroll Report
router.get(
    "/payroll",
    authMiddleware,
    authorizeRoles("OWNER"),
    getPayrollReport
);

// Expense Report
router.get(
    "/expenses",
    authMiddleware,
    authorizeRoles("OWNER"),
    getExpenseReport
);

// Material Report
router.get(
    "/materials",
    authMiddleware,
    authorizeRoles("OWNER"),
    getMaterialReport
);

module.exports = router;
