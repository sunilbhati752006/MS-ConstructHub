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

// =======================================
// Report Routes
// =======================================

// Labour Report
router.get("/labours", getLabourReport);

// Project Report
router.get("/projects", getProjectReport);

// Attendance Report
router.get("/attendance", getAttendanceReport);

// Payroll Report
router.get("/payroll", getPayrollReport);

// Expense Report
router.get("/expenses", getExpenseReport);

// Material Report
router.get("/materials", getMaterialReport);

module.exports = router;