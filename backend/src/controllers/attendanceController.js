const prisma = require("@prisma/client");
const prismaClient = new prisma.PrismaClient();

// ==========================
// Add Attendance
// ==========================
const addAttendance = async (req, res) => {
  try {
    const { labourId, projectId, date, status } = req.body;

    const labour = await prismaClient.labour.findUnique({
      where: { id: labourId },
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }

    const project = await prismaClient.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const attendance = await prismaClient.attendance.create({
      data: {
        labourId,
        projectId,
        date: new Date(date),
        status,
      },
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
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
    const attendance = await prismaClient.attendance.findMany({
      include: {
        labour: true,
        project: true,
      },
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
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

    const attendance = await prismaClient.attendance.findUnique({
      where: { id },
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

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
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
      where: { id },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    const updatedAttendance = await prismaClient.attendance.update({
      where: { id },
      data: {
        labourId,
        projectId,
        date: new Date(date),
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
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
      where: { id },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    await prismaClient.attendance.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
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