const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =======================================
// Dashboard Summary
// =======================================
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const role = String(req.user?.role || "").toUpperCase();
    const isOwner = role === "OWNER";

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalLabours,
      totalMaterials,
      expenses,
      payrolls,
      materials,
      todayAttendance,
    ] = await Promise.all([
      prisma.project.count(),

      prisma.project.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.project.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.labour.count(),

      prisma.material.count(),

      // Financial data is fetched ONLY for OWNER
      isOwner
        ? prisma.expense.findMany()
        : Promise.resolve([]),

      // Financial data is fetched ONLY for OWNER
      isOwner
        ? prisma.payroll.findMany()
        : Promise.resolve([]),

      prisma.material.findMany(),

      prisma.attendance.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    // ===========================
    // Expense Calculation
    // ===========================

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // ===========================
    // Payroll Calculation
    // ===========================

    const totalPayroll = payrolls.reduce(
      (sum, payroll) => sum + payroll.totalSalary,
      0
    );

    const paidPayroll = payrolls
      .filter((payroll) => payroll.paymentStatus === "PAID")
      .reduce((sum, payroll) => sum + payroll.totalSalary, 0);

    const pendingPayroll = payrolls
      .filter((payroll) => payroll.paymentStatus === "PENDING")
      .reduce((sum, payroll) => sum + payroll.totalSalary, 0);

    // ===========================
    // Inventory Calculation
    // ===========================

    const totalInventoryValue = materials.reduce(
      (sum, material) =>
        sum + material.quantity * material.unitPrice,
      0
    );

    // ===========================
    // Attendance Calculation
    // ===========================

    let todayPresent = 0;
    let todayHalfDay = 0;
    let todayAbsent = 0;

    todayAttendance.forEach((attendance) => {
      const status = attendance.status.toUpperCase();

      if (status === "PRESENT") {
        todayPresent++;
      } else if (status === "HALF_DAY") {
        todayHalfDay++;
      } else if (status === "ABSENT") {
        todayAbsent++;
      }
    });

    // ===========================
    // Final Response
    // ===========================

    const dashboard = {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },

      labours: {
        total: totalLabours,
      },

      attendance: {
        present: todayPresent,
        halfDay: todayHalfDay,
        absent: todayAbsent,
      },

      inventory: {
        totalMaterials,
        // Inventory value is OWNER-only
        ...(isOwner && {
          totalInventoryValue,
        }),
      },

      // Financial information is OWNER-only
      ...(isOwner && {
        payroll: {
          totalAmount: totalPayroll,
          paidAmount: paidPayroll,
          pendingAmount: pendingPayroll,
        },

        expenses: {
          totalAmount: totalExpenses,
        },
      }),
    };

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};