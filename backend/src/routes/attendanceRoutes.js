const express = require("express");
const router = express.Router();

const {
    addAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Add Attendance
router.post(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    addAttendance
);

// Get All Attendance
router.get(
    "/",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAllAttendance
);

// Get Attendance By ID
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    getAttendanceById
);

// Update Attendance
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    updateAttendance
);

// Delete Attendance
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("OWNER"),
    deleteAttendance
);

module.exports = router;
