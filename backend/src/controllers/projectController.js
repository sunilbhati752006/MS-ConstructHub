const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =========================
// Add Project
// =========================
const addProject = async (req, res) => {
  try {
    const {
      projectName,
      siteAddress,
      startDate,
      endDate,
      budget,
      status,
    } = req.body;

    const project = await prisma.project.create({
      data: {
        projectName,
        siteAddress,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        status,
      },
    });

    res.status(201).json({
      message: "Project added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get All Projects
// =========================
const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get Project By ID
// =========================
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Update Project
// =========================
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      projectName,
      siteAddress,
      startDate,
      endDate,
      budget,
      status,
    } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        projectName,
        siteAddress,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        status,
      },
    });

    res.status(200).json({
      message: "Project updated successfully",
      updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Delete Project
// =========================
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};