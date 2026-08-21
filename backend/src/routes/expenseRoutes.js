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

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Add Expense
router.post(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    addExpense
);

// Get All Expenses
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllExpenses
);

// Monthly Expense Summary
router.get(
    "/summary",
    authMiddleware,
    authorizeRoles("OWNER"),
    getMonthlyExpenseSummary
);

// Get Expense By ID
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getExpenseById
);

// Update Expense
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateExpense
);

// Delete Expense
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deleteExpense
);

module.exports = router;
