const express = require("express");

const router = express.Router();

const {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyExpenseSummary,
} = require("../controllers/expenseController");

// =========================
// Expense Routes
// =========================

// Add Expense
router.post("/", addExpense);

// Get All Expenses
router.get("/", getAllExpenses);

// Monthly Expense Summary
router.get("/summary", getMonthlyExpenseSummary);

// Get Expense By ID
router.get("/:id", getExpenseById);

// Update Expense
router.put("/:id", updateExpense);

// Delete Expense
router.delete("/:id", deleteExpense);

module.exports = router;