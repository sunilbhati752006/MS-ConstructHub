const express = require("express");
const router = express.Router();

const {
    generatePayroll,
    getAllPayroll,
    getPayrollById,
    markSalaryPaid,
    deletePayroll,
} = require("../controllers/payrollController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Generate Payroll
router.post(
    "/generate",
    authMiddleware,
    authorizeRoles("OWNER"),
    generatePayroll
);

// Get All Payroll
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllPayroll
);

// Get Payroll By ID
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getPayrollById
);

// Mark Salary Paid
router.put(
    "/pay/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    markSalaryPaid
);

// Delete Payroll
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deletePayroll
);

module.exports = router;
