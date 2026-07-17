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
      where: { id: labourId },
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }

    // Check Project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check Existing Payroll
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        labourId,
        projectId,
        month,
        year,
      },
    });

    if (existingPayroll) {
      return res.status(409).json({
        success: false,
        message: "Payroll for this month has already been generated.",
      });
    }

    // Month Start & End
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Attendance Records
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

    // NEW VALIDATION
    if (attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No attendance found for the selected month. Complete attendance before generating payroll.",
      });
    }

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;

    attendance.forEach((item) => {
      switch (item.status) {
        case "PRESENT":
          presentDays++;
          break;

        case "HALF_DAY":
          halfDays++;
          break;

        default:
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

    return res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll,
    });
  } catch (error) {
    return res.status(500).json({
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
      orderBy: {
        createdAt: "desc",
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
      where: { id },
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
      where: { id },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Salary has already been marked as paid.",
      });
    }

    const updatedPayroll = await prisma.payroll.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paidDate: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Salary marked as paid successfully.",
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
      where: { id },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    await prisma.payroll.delete({
      where: { id },
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