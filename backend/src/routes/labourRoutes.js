const express = require("express");
const router = express.Router();

const uploadFile = require("../middleware/uploadMiddleware");

const {
    addLabour,
    getAllLabours,
    getLabourById,
    updateLabour,
    deleteLabour,
} = require("../controllers/labourController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =========================
// Add Labour
// =========================
router.post(
    "/add",
    authMiddleware,
    authorizeRoles("OWNER"),
    uploadFile("labour").fields([
        { name: "photo", maxCount: 1 },
        { name: "aadhaarDocument", maxCount: 1 },
        { name: "documents", maxCount: 5 },
    ]),
    addLabour
);

// =========================
// Get All Labours
// =========================
router.get(
    "/all",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllLabours
);

// =========================
// Get Labour By ID
// =========================
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getLabourById
);

// =========================
// Update Labour
// =========================
router.put(
    "/update/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateLabour
);

// =========================
// Delete Labour
// =========================
router.delete(
    "/delete/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deleteLabour
);

module.exports = router;