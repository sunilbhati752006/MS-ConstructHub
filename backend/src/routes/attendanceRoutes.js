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
const authorizePermissions = require("../middleware/authorizePermissions");

// Add Attendance
router.post(
    "/",
    authMiddleware,
    authorizePermissions("attendance.create"),
    addAttendance
);

// Get All Attendance
router.get(
    "/",
    authMiddleware,
    authorizePermissions("attendance.view"),
    getAllAttendance
);

// Get Attendance By ID
router.get(
    "/:id",
    authMiddleware,
    authorizePermissions("attendance.view"),
    getAttendanceById
);

// Update Attendance
router.put(
    "/:id",
    authMiddleware,
    authorizePermissions("attendance.update"),
    updateAttendance
);

// Delete Attendance
router.delete(
    "/:id",
    authMiddleware,
    authorizePermissions("attendance.delete"),
    deleteAttendance
);

module.exports = router;