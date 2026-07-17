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

// =========================
// Material Routes
// =========================

// Add Material
router.post("/", addMaterial);

// Get All Materials
router.get("/", getAllMaterials);

// Inventory Summary
router.get("/summary", getInventorySummary);

// Get Material By ID
router.get("/:id", getMaterialById);

// Update Material
router.put("/:id", updateMaterial);

// Delete Material
router.delete("/:id", deleteMaterial);

module.exports = router;