const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =========================
// Add Expense
// =========================
const addExpense = async (req, res) => {
  try {
    const {
      projectId,
      title,
      category,
      amount,
      expenseDate,
      description,
    } = req.body;

    // Validate Required Fields
    if (
      !projectId ||
      !title ||
      !category ||
      !amount ||
      !expenseDate
    ) {
      return res.status(400).json({
        message: "All required fields are mandatory",
      });
    }

    // Check Project Exists
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Validate Amount
    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        projectId: Number(projectId),
        title,
        category,
        amount: Number(amount),
        expenseDate: new Date(expenseDate),
        description,
      },
      include: {
        project: true,
      },
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get All Expenses
// =========================
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        project: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get Expense By ID
// =========================
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        project: true,
      },
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// =========================
// Update Expense
// =========================
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      projectId,
      title,
      category,
      amount,
      expenseDate,
      description,
    } = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const updatedExpense = await prisma.expense.update({
      where: {
        id: Number(id),
      },
      data: {
        projectId: Number(projectId),
        title,
        category,
        amount: Number(amount),
        expenseDate: new Date(expenseDate),
        description,
      },
      include: {
        project: true,
      },
    });

    res.status(200).json({
      message: "Expense updated successfully",
      updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Delete Expense
// =========================
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Monthly Expense Summary
// =========================
const getMonthlyExpenseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: new Date(`${year}-${month}-01`),
          lt: new Date(Number(year), Number(month), 1),
        },
      },
    });

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    res.status(200).json({
      month,
      year,
      totalExpense,
      totalRecords: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyExpenseSummary,
};