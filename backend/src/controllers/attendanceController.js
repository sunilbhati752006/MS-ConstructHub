const prisma = require("@prisma/client");
const prismaClient = new prisma.PrismaClient();

// =====================================
// Check if Salary is Already Paid
// =====================================
const isPayrollPaid = async (labourId, projectId, date) => {
  const attendanceDate = new Date(date);

  const month = attendanceDate.getMonth() + 1;
  const year = attendanceDate.getFullYear();

  const payroll = await prismaClient.payroll.findFirst({
    where: {
      labourId,
      projectId,
      month,
      year,
      paymentStatus: "PAID",
    },
  });

  return !!payroll;
};

// ==========================
// Add Attendance
// ==========================
const addAttendance = async (req, res) => {
  try {
    const { labourId, projectId, date, status } = req.body;

    // Check Labour
    const labour = await prismaClient.labour.findUnique({
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
    const project = await prismaClient.project.findUnique({
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

    // Check Paid Payroll
    const payrollPaid = await isPayrollPaid(
      labourId,
      projectId,
      date
    );

    if (payrollPaid) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance cannot be modified because salary has already been paid for this month.",
      });
    }

    // Check Duplicate Attendance
    const existingAttendance =
      await prismaClient.attendance.findFirst({
        where: {
          labourId,
          projectId,
          date: new Date(date),
        },
      });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this labour on this project for the selected date.",
      });
    }

    const attendance =
      await prismaClient.attendance.create({
        data: {
          labourId,
          projectId,
          date: new Date(date),
          status,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Attendance
// ==========================
const getAllAttendance = async (req, res) => {
  try {
    const attendance =
      await prismaClient.attendance.findMany({
        include: {
          labour: true,
          project: true,
        },
        orderBy: {
          date: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Attendance By ID
// ==========================
const getAttendanceById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const attendance =
      await prismaClient.attendance.findUnique({
        where: {
          id,
        },
        include: {
          labour: true,
          project: true,
        },
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Attendance
// ==========================
const updateAttendance = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { labourId, projectId, date, status } = req.body;

    const attendance = await prismaClient.attendance.findUnique({
      where: {
        id,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check Paid Payroll
    const payrollPaid = await isPayrollPaid(
      labourId,
      projectId,
      date
    );

    if (payrollPaid) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance cannot be modified because salary has already been paid for this month.",
      });
    }

    // Check Duplicate Attendance
    const duplicateAttendance =
      await prismaClient.attendance.findFirst({
        where: {
          labourId,
          projectId,
          date: new Date(date),
          NOT: {
            id,
          },
        },
      });

    if (duplicateAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this labour on this project for the selected date.",
      });
    }

    const updatedAttendance =
      await prismaClient.attendance.update({
        where: {
          id,
        },
        data: {
          labourId,
          projectId,
          date: new Date(date),
          status,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Attendance
// ==========================
const deleteAttendance = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const attendance = await prismaClient.attendance.findUnique({
      where: {
        id,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check Paid Payroll
    const payrollPaid = await isPayrollPaid(
      attendance.labourId,
      attendance.projectId,
      attendance.date
    );

    if (payrollPaid) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance cannot be modified because salary has already been paid for this month.",
      });
    }

    await prismaClient.attendance.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};