const express = require("express");

const router = express.Router();

const {
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  markSalaryPaid,
  deletePayroll,
} = require("../controllers/payrollController");

// Generate Payroll
router.post("/generate", generatePayroll);

// Get All Payroll
router.get("/", getAllPayroll);

// Get Payroll By ID
router.get("/:id", getPayrollById);

// Mark Salary Paid
router.put("/pay/:id", markSalaryPaid);

// Delete Payroll
router.delete("/:id", deletePayroll);

module.exports = router;