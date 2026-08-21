const express = require("express");
const router = express.Router();

const {
    addMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    getInventorySummary,
} = require("../controllers/materialController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Add Material
router.post(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    addMaterial
);

// Get All Materials
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllMaterials
);

// Inventory Summary
router.get(
    "/summary",
    authMiddleware,
    authorizeRoles("OWNER"),
    getInventorySummary
);

// Get Material By ID
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getMaterialById
);

// Update Material
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateMaterial
);

// Delete Material
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deleteMaterial
);

module.exports = router;
