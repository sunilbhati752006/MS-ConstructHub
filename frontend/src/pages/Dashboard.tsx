import { useEffect, useState } from "react";
import type { Page } from "../main";
import Projects from "./Projects";
import Labour from "./Labour";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import Material from "./Material";
import Expense from "./Expense";
import Report from "./Report";
import UsersPage from "./Users";
import { companyLogo } from "../assets/companyLogoData";
import { API_URL } from "../config";


import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  WalletCards,
  Package,
  Receipt,
  FileBarChart,
  UserCog,
  Bell,
  LogOut,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Plus,
  UserPlus,
  CalendarPlus,
  PackagePlus,
  ReceiptText,
  Clock3,
  TrendingUp,
  CheckCircle2,
  Menu,
  ChevronDown,
} from "lucide-react";

interface DashboardData {
  projects: {
    total: number;
    active: number;
    completed: number;
  };

  labours: {
    total: number;
  };

  attendance: {
    present: number;
    halfDay: number;
    absent: number;
  };

  payroll: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };

  expenses: {
    totalAmount: number;
  };

  inventory: {
    totalMaterials: number;
    totalInventoryValue: number;
  };
}

interface DashboardProps {
  token: string;
  onLogout: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface ModuleInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const modules: Record<
  Exclude<Page, "dashboard">,
  ModuleInfo
> = {
  projects: {
    title: "Projects",
    description: "Manage construction projects and project status.",
    icon: <Building2 size={22} />,
  },

  labour: {
    title: "Labour",
    description: "Manage registered workers and labour information.",
    icon: <Users size={22} />,
  },

  attendance: {
    title: "Attendance",
    description: "Track daily labour attendance and attendance status.",
    icon: <ClipboardCheck size={22} />,
  },

  payroll: {
    title: "Payroll",
    description: "Manage labour payroll, payments and pending amounts.",
    icon: <WalletCards size={22} />,
  },

  materials: {
    title: "Materials",
    description: "Manage construction materials and inventory.",
    icon: <Package size={22} />,
  },

  expenses: {
    title: "Expenses",
    description: "Track company expenses and uploaded expense records.",
    icon: <Receipt size={22} />,
  },

  reports: {
    title: "Reports",
    description: "View business reports and operational summaries.",
    icon: <FileBarChart size={22} />,
  },

  users: {
    title: "Users",
    description: "Manage portal users and administrator access.",
    icon: <UserCog size={22} />,
  },
};

export default function Dashboard({
  token,
  onLogout,
  currentPage,
  onNavigate,
}: DashboardProps) {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [error, setError] = useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showOwnerProfile, setShowOwnerProfile] =
    useState(false);

  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    mobileNumber: string;
    role: string;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard"
          );
        }

        setDashboard(data.dashboard);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load user profile"
          );
        }

        setUser(data.user);
      } catch (err) {
        console.error(
          "Failed to load current user:",
          err
        );
      }
    };

    fetchDashboard();
    fetchCurrentUser();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading MS ConstructHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-page">
        <div className="error-card">
          <ShieldCheck size={40} />

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button onClick={onLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const attendanceTotal =
    dashboard.attendance.present +
    dashboard.attendance.halfDay +
    dashboard.attendance.absent;

  const presentPercentage =
    attendanceTotal > 0
      ? Math.round(
          (dashboard.attendance.present /
            attendanceTotal) *
            100
        )
      : 0;

  const halfDayPercentage =
    attendanceTotal > 0
      ? Math.round(
          (dashboard.attendance.halfDay /
            attendanceTotal) *
            100
        )
      : 0;

  const absentPercentage =
    attendanceTotal > 0
      ? Math.round(
          (dashboard.attendance.absent /
            attendanceTotal) *
            100
        )
      : 0;

      const projectTotal = dashboard.projects.total;

const activeProjectPercentage =
  projectTotal > 0
    ? Math.round(
        (dashboard.projects.active / projectTotal) *
          100
      )
    : 0;

const completedProjectPercentage =
  projectTotal > 0
    ? Math.round(
        (dashboard.projects.completed / projectTotal) *
          100
      )
    : 0;

  const renderDashboardHome = () => {
    return (
      <>
        {/* WELCOME BANNER */}
        <section className="dashboard-section dashboard-welcome-section">
          <div className="dashboard-welcome-card">
            <div className="welcome-content">
              <span className="welcome-label">
                CONSTRUCTION MANAGEMENT PORTAL
              </span>

              <h2>
                Welcome back,{" "}
                {user?.fullName || "Owner"}! 👋
              </h2>

              <p>
                Here's what's happening with your
                construction business today.
              </p>
            </div>

            <div className="welcome-date">
              <div className="welcome-date-icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <strong>{formatDate()}</strong>
                <span>{formatTime()}</span>
              </div>
            </div>

            <div className="welcome-decoration">
              <Building2 size={80} />
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="dashboard-section dashboard-kpi-section">
          <div className="dashboard-kpi-grid">
            {/* PROJECTS */}
            <div className="dashboard-kpi-card kpi-orange">
              <div className="kpi-content">
                <span className="kpi-label">
                  Total Projects
                </span>

                <strong>
                  {dashboard.projects.total}
                </strong>

                <small>
                  {dashboard.projects.active} Active
                  {" • "}
                  {dashboard.projects.completed} Completed
                </small>
              </div>

              <div className="kpi-icon">
                <Building2 size={25} />
              </div>

              <div className="kpi-line">
                <TrendingUp size={32} />
              </div>
            </div>

            {/* LABOUR */}
            <div className="dashboard-kpi-card kpi-purple">
              <div className="kpi-content">
                <span className="kpi-label">
                  Total Labour
                </span>

                <strong>
                  {dashboard.labours.total}
                </strong>

                <small>
                  Registered Workers
                </small>
              </div>

              <div className="kpi-icon">
                <Users size={25} />
              </div>

              <div className="kpi-line">
                <TrendingUp size={32} />
              </div>
            </div>

            {/* PAYROLL */}
            <div className="dashboard-kpi-card kpi-green">
              <div className="kpi-content">
                <span className="kpi-label">
                  Payroll (This Month)
                </span>

                <strong>
                  {formatCurrency(
                    dashboard.payroll.totalAmount
                  )}
                </strong>

                <small>
                  Paid{" "}
                  {formatCurrency(
                    dashboard.payroll.paidAmount
                  )}
                </small>
              </div>

              <div className="kpi-icon">
                <WalletCards size={25} />
              </div>

              <div className="kpi-line">
                <TrendingUp size={32} />
              </div>
            </div>

            {/* EXPENSES */}
            <div className="dashboard-kpi-card kpi-red">
              <div className="kpi-content">
                <span className="kpi-label">
                  Expenses (This Month)
                </span>

                <strong>
                  {formatCurrency(
                    dashboard.expenses.totalAmount
                  )}
                </strong>

                <small>
                  Total Recorded Expenses
                </small>
              </div>

              <div className="kpi-icon">
                <ReceiptText size={25} />
              </div>

              <div className="kpi-line">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>
        </section>

        {/* ATTENDANCE / INVENTORY / QUICK ACTIONS */}
        <section className="dashboard-section dashboard-middle-section">
          <div className="dashboard-middle-grid">

            {/* ATTENDANCE */}
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div className="panel-title">
                  <div className="panel-title-icon orange">
                    <ClipboardCheck size={19} />
                  </div>

                  <div>
                    <h3>Attendance Overview</h3>
                    <p>Today's attendance status</p>
                  </div>
                </div>

                <div className="panel-date">
                  <CalendarDays size={14} />
                  Today
                </div>
              </div>

              <div className="attendance-overview-list">
                <div className="attendance-overview-row">
                  <div className="attendance-status">
                    <span className="attendance-dot present"></span>
                    <span>Present</span>
                  </div>

                  <strong>
                    {dashboard.attendance.present}
                  </strong>

                  <span className="attendance-percent present">
                    {presentPercentage}%
                  </span>
                </div>

                <div className="attendance-overview-row">
                  <div className="attendance-status">
                    <span className="attendance-dot half"></span>
                    <span>Half Day</span>
                  </div>

                  <strong>
                    {dashboard.attendance.halfDay}
                  </strong>

                  <span className="attendance-percent half">
                    {halfDayPercentage}%
                  </span>
                </div>

                <div className="attendance-overview-row">
                  <div className="attendance-status">
                    <span className="attendance-dot absent"></span>
                    <span>Absent</span>
                  </div>

                  <strong>
                    {dashboard.attendance.absent}
                  </strong>

                  <span className="attendance-percent absent">
                    {absentPercentage}%
                  </span>
                </div>
              </div>

              <div className="attendance-total">
                <span>Total Workers</span>
                <strong>{attendanceTotal}</strong>
              </div>
            </div>

            {/* INVENTORY */}
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div className="panel-title">
                  <div className="panel-title-icon orange">
                    <Package size={19} />
                  </div>

                  <div>
                    <h3>Inventory Overview</h3>
                    <p>Current material stock</p>
                  </div>
                </div>
              </div>

              <div className="inventory-overview">
                <div className="inventory-stat">
                  <span>Total Materials</span>

                  <strong>
                    {dashboard.inventory.totalMaterials}
                  </strong>

                  <small>Items in Stock</small>
                </div>

                <div className="inventory-divider"></div>

                <div className="inventory-stat">
                  <span>Inventory Value</span>

                  <strong>
                    {formatCurrency(
                      dashboard.inventory
                        .totalInventoryValue
                    )}
                  </strong>

                  <small>Total Stock Value</small>
                </div>
              </div>

              <div className="low-stock-box">
                <div>
                  <Package size={16} />
                  <span>Low Stock Items</span>
                </div>

                <strong>0 Items</strong>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="dashboard-panel quick-actions-panel">
              <div className="dashboard-panel-header">
                <div className="panel-title">
                  <div className="panel-title-icon orange">
                    <Plus size={19} />
                  </div>

                  <div>
                    <h3>Quick Actions</h3>
                    <p>Common management tasks</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions-grid">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate("projects")
                  }
                >
                  <Building2 size={22} />
                  <span>Add Project</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("labour")
                  }
                >
                  <UserPlus size={22} />
                  <span>Add Labour</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("attendance")
                  }
                >
                  <CalendarPlus size={22} />
                  <span>Mark Attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("expenses")
                  }
                >
                  <ReceiptText size={22} />
                  <span>Add Expense</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("materials")
                  }
                >
                  <PackagePlus size={22} />
                  <span>Add Material</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("reports")
                  }
                >
                  <BarChart3 size={22} />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT SUMMARY + RECENT ACTIVITY */}
        <section className="dashboard-section dashboard-bottom-section">
          <div className="dashboard-bottom-grid">

            {/* PROJECT SUMMARY */}
            <div className="dashboard-panel project-summary-dashboard">
              <div className="dashboard-panel-header">
                <div className="panel-title">
                  <div className="panel-title-icon orange">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h3>Project Summary</h3>
                    <p>Current project status</p>
                  </div>
                </div>
              </div>

              <div className="project-summary-content">
                <div
  className="project-donut"
  style={{
    background: `conic-gradient(
      #10b981 0% ${activeProjectPercentage}%,
      #d1d5db ${activeProjectPercentage}% ${
        activeProjectPercentage + completedProjectPercentage
      }%,
      #e5e7eb ${
        activeProjectPercentage + completedProjectPercentage
      }% 100%
    )`,
  }}
>
  <div className="project-donut-inner">
    <strong>
      {dashboard.projects.total}
    </strong>

    <span>Projects</span>
  </div>
</div>

                <div className="project-status-list">
                  <div className="project-status-row">
                    <div>
                      <span className="status-dot active"></span>
                      <span>Active Projects</span>
                    </div>

                    <strong>
                      {dashboard.projects.active}
                    </strong>
                  </div>

                  <div className="project-status-row">
                    <div>
                      <span className="status-dot completed"></span>
                      <span>Completed Projects</span>
                    </div>

                    <strong>
                      {dashboard.projects.completed}
                    </strong>
                  </div>

                  <div className="project-status-row total">
                    <div>
                      <CheckCircle2 size={15} />
                      <span>Total Projects</span>
                    </div>

                    <strong>
                      {dashboard.projects.total}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="dashboard-panel recent-activity-panel">
              <div className="dashboard-panel-header">
                <div className="panel-title">
                  <div className="panel-title-icon orange">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <h3>Recent Activity</h3>
                    <p>Latest system overview</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity-list">
                <div className="recent-activity-item">
                  <div className="activity-icon orange">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <strong>
                      Projects Overview
                    </strong>

                    <p>
                      {dashboard.projects.active} active
                      construction projects
                    </p>
                  </div>

                  <span>Just now</span>
                </div>

                <div className="recent-activity-item">
                  <div className="activity-icon purple">
                    <Users size={17} />
                  </div>

                  <div>
                    <strong>
                      Labour Registered
                    </strong>

                    <p>
                      {dashboard.labours.total} registered
                      workers
                    </p>
                  </div>

                  <span>Just now</span>
                </div>

                <div className="recent-activity-item">
                  <div className="activity-icon green">
                    <WalletCards size={17} />
                  </div>

                  <div>
                    <strong>
                      Payroll Overview
                    </strong>

                    <p>
                      {formatCurrency(
                        dashboard.payroll.paidAmount
                      )}{" "}
                      paid
                    </p>
                  </div>

                  <span>Just now</span>
                </div>

                <div className="recent-activity-item">
                  <div className="activity-icon red">
                    <ReceiptText size={17} />
                  </div>

                  <div>
                    <strong>
                      Expense Overview
                    </strong>

                    <p>
                      {formatCurrency(
                        dashboard.expenses.totalAmount
                      )}{" "}
                      recorded
                    </p>
                  </div>

                  <span>Just now</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  const renderModulePage = () => {
    if (currentPage === "dashboard") {
      return renderDashboardHome();
    }

    if (currentPage === "projects") {
      return <Projects token={token} />;
    }

    if (currentPage === "labour") {
      return <Labour token={token} />;
    }

    if (currentPage === "attendance") {
      return <Attendance token={token} />;
    }

    if (currentPage === "payroll") {
      return <Payroll token={token} />;
    }

    if (currentPage === "materials") {
      return <Material token={token} />;
    }

    if (currentPage === "expenses") {
      return <Expense token={token} />;
    }

    if (currentPage === "reports") {
      return <Report token={token} />;
    }

    if (currentPage === "users") {
      return <UsersPage token={token} />;
    }

    const module =
      modules[
        currentPage as Exclude<
          Page,
          "dashboard"
        >
      ];

    return (
      <section className="dashboard-section">
        <div className="module-page">
          <div className="module-page-header">
            <div className="module-page-icon">
              {module.icon}
            </div>

            <div>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </div>
          </div>

          <div className="module-empty-state">
            <div className="module-empty-icon">
              {module.icon}
            </div>

            <h3>
              {module.title} Management
            </h3>

            <p>
              This module is ready for integration
              with the MS ConstructHub backend.
            </p>

            <span className="module-status">
              Module Ready
            </span>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`portal ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="brand">
          <div className="brand-logo">
            <img
  src={companyLogo}
  alt="MS Construction Company"
/>
          </div>

          <div className="brand-text">
            <h2>MS CONSTRUCTHUB</h2>
            <span>Management Portal</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">

          {/* MAIN */}
          <div className="nav-section">
            <span>MAIN</span>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("dashboard")
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* MANAGEMENT */}
          <div className="nav-section">
            <span>MANAGEMENT</span>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "projects"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("projects")
              }
            >
              <Building2 size={20} />
              <span>Projects</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "labour"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("labour")
              }
            >
              <Users size={20} />
              <span>Labour</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "attendance"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("attendance")
              }
            >
              <CalendarDays size={20} />
              <span>Attendance</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "payroll"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("payroll")
              }
            >
              <WalletCards size={20} />
              <span>Payroll</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "materials"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("materials")
              }
            >
              <Package size={20} />
              <span>Materials</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "expenses"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("expenses")
              }
            >
              <Receipt size={20} />
              <span>Expenses</span>
            </button>
          </div>

          {/* SYSTEM */}
          <div className="nav-section">
            <span>SYSTEM</span>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "reports"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("reports")
              }
            >
              <BarChart3 size={20} />
              <span>Reports</span>
            </button>

            <button
              type="button"
              className={`nav-item ${
                currentPage === "users"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onNavigate("users")
              }
            >
              <UserCog size={20} />
              <span>Users</span>
            </button>
          </div>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">

          <button
            type="button"
            className="owner-profile-button"
            onClick={() =>
              setShowOwnerProfile(true)
            }
            title="View Owner Profile"
          >
            <div className="owner-avatar">
              {user?.fullName
                ? user.fullName
                    .charAt(0)
                    .toUpperCase()
                : "O"}
            </div>

            <div className="owner-info">
              <strong>
                {user?.fullName || "Owner"}
              </strong>

              <span>
                {user?.role || "OWNER"}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
            title="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="topbar-title">
            <button
              type="button"
              className="topbar-menu"
              aria-label={isSidebarCollapsed ? "Show navigation" : "Hide navigation"}
              aria-expanded={!isSidebarCollapsed}
              onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            >
              <Menu size={24} />
            </button>
            <div className="topbar-heading">
            <h1>
              {currentPage === "dashboard"
                ? "Dashboard"
                : modules[
                    currentPage as Exclude<
                      Page,
                      "dashboard"
                    >
                  ].title}
            </h1>

            <p>
              {currentPage === "dashboard"
                ? "Welcome back. Here's what's happening with your construction business."
                : modules[
                    currentPage as Exclude<
                      Page,
                      "dashboard"
                    >
                  ].description}
            </p>
            </div>
          </div>

          <div className="topbar-actions">

            {/* NOTIFICATION */}
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-button"
                title="Notifications"
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
              >
                <Bell size={21} />

                <span></span>
              </button>

              {showNotifications && (
                <div className="notification-panel">

                  <div className="notification-panel-header">
                    <div>
                      <strong>
                        Notifications
                      </strong>

                      <small>
                        Recent updates
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                    >
                      ×
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-icon">
                      !
                    </div>

                    <div>
                      <strong>
                        Pending Payroll
                      </strong>

                      <p>
                        Check pending payroll
                        records.
                      </p>
                    </div>
                  </div>

                  <div className="notification-item">
                    <div className="notification-icon">
                      i
                    </div>

                    <div>
                      <strong>
                        System Ready
                      </strong>

                      <p>
                        MS ConstructHub is
                        running normally.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* USER */}
            <button
              type="button"
              className="topbar-user"
              onClick={() =>
                setShowOwnerProfile(true)
              }
              title="View Owner Profile"
            >
              <div className="top-avatar">
                {user?.fullName
                  ? user.fullName
                      .charAt(0)
                      .toUpperCase()
                  : "O"}
              </div>

              <div>
                <strong>
                  {user?.fullName || "Owner"}
                </strong>

                <small>
                  {user?.role || "OWNER"}
                </small>
              </div>
              <ChevronDown className="topbar-user-chevron" size={16} />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {renderModulePage()}

        {/* FOOTER */}
        <footer className="portal-footer">
          <span>MS ConstructHub</span>

          <span>
            Construction Management Portal
          </span>

          <span>© 2026</span>
        </footer>
      </main>

      {/* OWNER PROFILE MODAL */}
      {showOwnerProfile && (
        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowOwnerProfile(false);
            }
          }}
        >
          <div className="project-modal">

            <div className="project-modal-header">
              <div>
                <h2>Owner Profile</h2>

                <p>
                  Your logged-in account details.
                </p>
              </div>

              <button
                type="button"
                className="project-modal-close"
                onClick={() =>
                  setShowOwnerProfile(false)
                }
              >
                ×
              </button>
            </div>

            <div className="project-form">

              <div className="project-form-grid">

                <div className="project-form-group full">
                  <label>Full Name</label>

                  <input
                    type="text"
                    value={
                      user?.fullName || "Owner"
                    }
                    readOnly
                  />
                </div>

                <div className="project-form-group">
                  <label>Email</label>

                  <input
                    type="text"
                    value={
                      user?.email || "-"
                    }
                    readOnly
                  />
                </div>

                <div className="project-form-group">
                  <label>
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    value={
                      user?.mobileNumber || "-"
                    }
                    readOnly
                  />
                </div>

                <div className="project-form-group">
                  <label>Role</label>

                  <input
                    type="text"
                    value={
                      user?.role ||
                      "Administrator"
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className="project-form-footer">
                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={() =>
                    setShowOwnerProfile(false)
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="owner-profile-logout"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
