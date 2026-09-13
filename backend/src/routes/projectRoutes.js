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
const authorizePermissions = require("../middleware/authorizePermissions");

// Add Project
router.post(
    "/",
    authMiddleware,
    authorizePermissions("projects.create"),
    addProject
);

// Get All Projects
router.get(
    "/",
    authMiddleware,
    authorizePermissions("projects.view"),
    getAllProjects
);

// Get Project By ID
router.get(
    "/:id",
    authMiddleware,
    authorizePermissions("projects.view"),
    getProjectById
);

// Update Project
router.put(
    "/:id",
    authMiddleware,
   authorizePermissions("projects.update"),
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
