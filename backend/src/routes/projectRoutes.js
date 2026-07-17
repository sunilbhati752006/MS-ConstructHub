const express = require("express");

const router = express.Router();

const {
  addProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const verifyToken = require("../middleware/authMiddleware");

// Add Project
router.post("/", verifyToken, addProject);

// Get All Projects
router.get("/", verifyToken, getAllProjects);

// Get Project By ID
router.get("/:id", verifyToken, getProjectById);

// Update Project
router.put("/:id", verifyToken, updateProject);

// Delete Project
router.delete("/:id", verifyToken, deleteProject);

module.exports = router;