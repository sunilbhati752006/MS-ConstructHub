const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =======================================
// Labour Report
// =======================================
const getLabourReport = async (req, res) => {
  try {
    const labours = await prisma.labour.findMany({
      include: {
        attendances: true,
        payrolls: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      totalLabours: labours.length,
      data: labours,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Project Report
// =======================================
const getProjectReport = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        attendances: true,
        payrolls: true,
        expenses: true,
        materials: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      totalProjects: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Attendance Report
// =======================================
const getAttendanceReport = async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        labour: true,
        project: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json({
      success: true,
      totalRecords: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =======================================
// Payroll Report
// =======================================
const getPayrollReport = async (req, res) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        labour: true,
        project: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    res.status(200).json({
      success: true,
      totalPayrolls: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Expense Report
// =======================================
const getExpenseReport = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        project: true,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    res.status(200).json({
      success: true,
      totalExpenses: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Material Report
// =======================================
const getMaterialReport = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: {
        project: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      totalMaterials: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLabourReport,
  getProjectReport,
  getAttendanceReport,
  getPayrollReport,
  getExpenseReport,
  getMaterialReport,
};