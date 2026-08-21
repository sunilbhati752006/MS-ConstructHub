const express = require("express");
const router = express.Router();

const {
    addProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Add Project
router.post(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    addProject
);

// Get All Projects
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllProjects
);

// Get Project By ID
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getProjectById
);

// Update Project
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateProject
);

// Delete Project
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deleteProject
);

module.exports = router;
