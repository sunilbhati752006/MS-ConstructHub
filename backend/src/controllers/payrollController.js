const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ===============================
// Generate Payroll
// ===============================
const generatePayroll = async (req, res) => {
  try {
    const { labourId, projectId, month, year } = req.body;

    // Check Labour
    const labour = await prisma.labour.findUnique({
      where: {
        id: labourId,
      },
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }

    // Check Project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check Duplicate Payroll
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        labourId,
        projectId,
        month,
        year,
      },
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: "Payroll already generated for this month.",
      });
    }

    // Month Dates
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get Attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        labourId,
        projectId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;

    attendance.forEach((item) => {
      if (item.status === "PRESENT") {
        presentDays++;
      } else if (item.status === "HALF_DAY") {
        halfDays++;
      } else {
        absentDays++;
      }
    });

    const totalSalary =
      presentDays * labour.dailyWage +
      halfDays * (labour.dailyWage / 2);

    const payroll = await prisma.payroll.create({
      data: {
        labourId,
        projectId,
        month,
        year,
        presentDays,
        halfDays,
        absentDays,
        totalSalary,
      },
    });

    res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Payroll
// ===============================
const getAllPayroll = async (req, res) => {
  try {
    const payroll = await prisma.payroll.findMany({
      include: {
        labour: true,
        project: true,
      },
    });

    res.status(200).json({
      success: true,
      total: payroll.length,
      payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Payroll By ID
// ===============================
const getPayrollById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const payroll = await prisma.payroll.findUnique({
      where: {
        id,
      },
      include: {
        labour: true,
        project: true,
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Mark Salary Paid
// ===============================
const markSalaryPaid = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const payroll = await prisma.payroll.findUnique({
      where: {
        id,
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    const updatedPayroll = await prisma.payroll.update({
      where: {
        id,
      },
      data: {
        paymentStatus: "PAID",
        paidDate: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Salary marked as paid.",
      payroll: updatedPayroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Payroll
// ===============================
const deletePayroll = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const payroll = await prisma.payroll.findUnique({
      where: {
        id,
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    await prisma.payroll.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  markSalaryPaid,
  deletePayroll,
};