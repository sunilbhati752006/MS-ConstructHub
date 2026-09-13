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
const authorizePermissions = require("../middleware/authorizePermissions");

// Add Material
router.post(
    "/",
    authMiddleware,
    authorizePermissions("materials.create"),
    addMaterial
);

// Get All Materials
router.get(
    "/",
    authMiddleware,
    authorizePermissions("materials.view"),
    getAllMaterials
);

// Inventory Summary
router.get(
    "/summary",
    authMiddleware,
    authorizePermissions("materials.view"),
    getInventorySummary
);

// Get Material By ID
router.get(
    "/:id",
    authMiddleware,
    authorizePermissions("materials.view"),
    getMaterialById
);

// Update Material
router.put(
    "/:id",
    authMiddleware,
    authorizePermissions("materials.update"),
    updateMaterial
);

// Delete Material
router.delete(
    "/:id",
    authMiddleware,
    authorizePermissions("materials.delete"),
    deleteMaterial
);

module.exports = router;
