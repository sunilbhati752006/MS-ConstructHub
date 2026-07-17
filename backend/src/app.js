const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const labourRoutes = require("./routes/labourRoutes");
const projectRoutes = require("./routes/projectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/labour", labourRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "MS ConstructHub Backend Running Successfully 🚀",
  });
});

module.exports = app;