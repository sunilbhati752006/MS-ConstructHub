const express = require("express");

const router = express.Router();

const {
  addAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

router.post("/", addAttendance);

router.get("/", getAllAttendance);

router.get("/:id", getAttendanceById);

router.put("/:id", updateAttendance);

router.delete("/:id", deleteAttendance);

module.exports = router;