import { useEffect, useState } from "react";
import type { Page } from "../main";
import Projects from "./Projects";
import Labour from "./Labour";
import Attendance from "./Attendance";
import Payroll from "./Payroll";

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
    icon: <Building2 size={24} />,
  },

  labour: {
    title: "Labour",
    description: "Manage registered workers and labour information.",
    icon: <Users size={24} />,
  },

  attendance: {
    title: "Attendance",
    description: "Track daily labour attendance and attendance status.",
    icon: <ClipboardCheck size={24} />,
  },

  payroll: {
    title: "Payroll",
    description: "Manage labour payroll, payments and pending amounts.",
    icon: <WalletCards size={24} />,
  },

  materials: {
    title: "Materials",
    description: "Manage construction materials and inventory.",
    icon: <Package size={24} />,
  },

  expenses: {
    title: "Expenses",
    description: "Track company expenses and uploaded expense records.",
    icon: <Receipt size={24} />,
  },

  reports: {
    title: "Reports",
    description: "View business reports and operational summaries.",
    icon: <FileBarChart size={24} />,
  },

  users: {
    title: "Users",
    description: "Manage portal users and administrator access.",
    icon: <UserCog size={24} />,
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
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/dashboard",
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

    fetchDashboard();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
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

  const renderModulePage = () => {
    if (currentPage === "dashboard") {
      return (
        <>
          {/* BUSINESS OVERVIEW */}
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>Business Overview</h2>
                <p>Current operational summary</p>
              </div>
            </div>

            <div className="stats-grid">
              {/* PROJECTS */}
              <div className="stat-card blue">
                <div className="stat-top">
                  <span className="stat-icon">
                    <Building2 size={22} />
                  </span>

                  <span className="stat-label">
                    Projects
                  </span>
                </div>

                <strong>
                  {dashboard.projects.total}
                </strong>

                <div className="stat-bottom">
                  <span>
                    {dashboard.projects.active} Active
                  </span>

                  <span>
                    {dashboard.projects.completed} Completed
                  </span>
                </div>
              </div>

              {/* LABOUR */}
              <div className="stat-card purple">
                <div className="stat-top">
                  <span className="stat-icon">
                    <Users size={22} />
                  </span>

                  <span className="stat-label">
                    Total Labour
                  </span>
                </div>

                <strong>
                  {dashboard.labours.total}
                </strong>

                <div className="stat-bottom">
                  <span>
                    Registered workers
                  </span>
                </div>
              </div>

              {/* PAYROLL */}
              <div className="stat-card green">
                <div className="stat-top">
                  <span className="stat-icon">
                    <WalletCards size={22} />
                  </span>

                  <span className="stat-label">
                    Payroll
                  </span>
                </div>

                <strong>
                  {formatCurrency(
                    dashboard.payroll.totalAmount
                  )}
                </strong>

                <div className="stat-bottom">
                  <span>
                    Paid{" "}
                    {formatCurrency(
                      dashboard.payroll.paidAmount
                    )}
                  </span>

                  <span>
                    Pending{" "}
                    {formatCurrency(
                      dashboard.payroll.pendingAmount
                    )}
                  </span>
                </div>
              </div>

              {/* EXPENSES */}
              <div className="stat-card orange">
                <div className="stat-top">
                  <span className="stat-icon">
                    <Receipt size={22} />
                  </span>

                  <span className="stat-label">
                    Expenses
                  </span>
                </div>

                <strong>
                  {formatCurrency(
                    dashboard.expenses.totalAmount
                  )}
                </strong>

                <div className="stat-bottom">
                  <span>
                    Total recorded expenses
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ATTENDANCE + INVENTORY */}
          <section className="dashboard-section">
            <div className="detail-grid">
              {/* ATTENDANCE */}
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Attendance</h3>
                    <p>
                      Current attendance overview
                    </p>
                  </div>

                  <span className="panel-icon">
                    <ClipboardCheck size={22} />
                  </span>
                </div>

                <div className="attendance-list">
                  <div className="attendance-row">
                    <span>
                      <i className="dot present"></i>
                      Present
                    </span>

                    <strong>
                      {dashboard.attendance.present}
                    </strong>
                  </div>

                  <div className="attendance-row">
                    <span>
                      <i className="dot half"></i>
                      Half Day
                    </span>

                    <strong>
                      {dashboard.attendance.halfDay}
                    </strong>
                  </div>

                  <div className="attendance-row">
                    <span>
                      <i className="dot absent"></i>
                      Absent
                    </span>

                    <strong>
                      {dashboard.attendance.absent}
                    </strong>
                  </div>
                </div>
              </div>

              {/* INVENTORY */}
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Inventory</h3>
                    <p>Current material stock</p>
                  </div>

                  <span className="panel-icon">
                    <Package size={22} />
                  </span>
                </div>

                <div className="inventory-main">
                  <div>
                    <span>Total Materials</span>

                    <strong>
                      {dashboard.inventory.totalMaterials}
                    </strong>
                  </div>

                  <div>
                    <span>Inventory Value</span>

                    <strong>
                      {formatCurrency(
                        dashboard.inventory
                          .totalInventoryValue
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECT SUMMARY */}
          <section className="dashboard-section">
            <div className="panel project-panel">
              <div className="panel-header">
                <div>
                  <h3>Project Summary</h3>
                  <p>Current project status</p>
                </div>

                <span className="status-badge">
                  {dashboard.projects.active} ACTIVE
                </span>
              </div>

              <div className="project-summary-row">
                <div className="project-summary-icon">
                  <Building2 size={25} />
                </div>

                <div className="project-summary-info">
                  <strong>
                    Active Construction Projects
                  </strong>

                  <span>
                    {dashboard.projects.active} project
                    {dashboard.projects.active === 1
                      ? ""
                      : "s"} currently active
                  </span>
                </div>

                <div className="project-number">
                  {dashboard.projects.active}
                </div>
              </div>
            </div>
          </section>
        </>
      );
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


  const module =
      modules[
        currentPage as Exclude<Page, "dashboard">
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
    <div className="portal">
      {/* SIDEBAR */}
      <aside className="sidebar">
        {/* BRAND */}
        <div className="brand">
          <div className="brand-icon">
            MS
          </div>

          <div>
            <h2>ConstructHub</h2>
            <span>
              Management Portal
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {/* MAIN */}
          <div className="nav-section">
            <span>MAIN</span>

            <button
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
          <div className="owner-avatar">
            O
          </div>

          <div className="owner-info">
            <strong>Owner</strong>
            <span>Administrator</span>
          </div>

          <button
            className="sidebar-logout"
            onClick={onLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
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

          <div className="topbar-actions">
            <button
              className="notification-button"
              title="Notifications"
            >
              <Bell size={21} />
              <span></span>
            </button>

            <div className="topbar-user">
              <div className="top-avatar">
                O
              </div>

              <div>
                <strong>Owner</strong>
                <small>
                  Super Admin
                </small>
              </div>
            </div>
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
    </div>
  );
}
