const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const labourRoutes = require("./routes/labourRoutes");
const projectRoutes = require("./routes/projectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const materialRoutes = require("./routes/materialRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// =========================
// Middlewares
// =========================
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json());

// =========================
// API Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/labour", labourRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// =========================
// Home Route
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MS ConstructHub Backend Running Successfully 🚀",
  });
});

// =========================
// 404 Route
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;