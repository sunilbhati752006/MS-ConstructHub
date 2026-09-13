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
const authorizePermissions = require("../middleware/authorizePermissions");

// =========================
// Add Labour
// =========================
router.post(
    "/add",
    authMiddleware,
    authorizePermissions("labour.create"),
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
    authorizePermissions("labour.view"),
    getAllLabours
);

// =========================
// Get Labour By ID
// =========================
router.get(
    "/:id",
    authMiddleware,
    authorizePermissions("labour.view"),
    getLabourById
);

// =========================
// Update Labour
// =========================
router.put(
    "/update/:id",
    authMiddleware,
    authorizePermissions("labour.update"),
    updateLabour
);

// =========================
// Delete Labour
// =========================
router.delete(
    "/delete/:id",
    authMiddleware,
    authorizePermissions("labour.delete"),
    deleteLabour
);

module.exports = router;