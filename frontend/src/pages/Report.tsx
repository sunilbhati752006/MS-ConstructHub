import { useEffect, useMemo, useState } from "react";
import { API_URL as API_BASE_URL } from "../config";
const API_URL = `${API_BASE_URL}/reports`;
import {
  BarChart3,
  Users,
  Building2,
  ClipboardCheck,
  WalletCards,
  Receipt,
  Package,
  RefreshCw,
} from "lucide-react";

interface ReportProps {
  token: string;
}
 
type ReportType =
  | "labour"
  | "projects"
  | "attendance"
  | "payroll"
  | "expenses"
  | "materials";

interface Labour {
  id: number;
  fullName: string;
  mobileNumber: string;
  address: string;
  dailyWage: number;
}

interface Project {
  id: number;
  projectName: string;
  siteAddress: string;
  budget: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  labour: {
    id: number;
    fullName: string;
  };
  project: {
    id: number;
    projectName: string;
  };
}

interface Payroll {
  id: number;
  month: number;
  year: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalSalary: number;
  paymentStatus: string;
  paidDate?: string | null;
  labour: {
    id: number;
    fullName: string;
  };
  project: {
    id: number;
    projectName: string;
  };
}

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string | null;
  project: {
    id: number;
    projectName: string;
  };
}

interface Material {
  id: number;
  materialName: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  project: {
    id: number;
    projectName: string;
  };
}


export default function Report({ token }: ReportProps) {
  const [activeReport, setActiveReport] =
    useState<ReportType>("labour");

  const [labours, setLabours] = useState<Labour[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendance, setAttendance] =
    useState<Attendance[]>([]);
  const [payroll, setPayroll] =
    useState<Payroll[]>([]);
  const [expenses, setExpenses] =
    useState<Expense[]>([]);
  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value: string) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const fetchReport = async (
    type: ReportType
  ) => {
    const response = await fetch(
      `${API_URL}/${type === "labour" ? "labours" : type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to load ${type} report`
      );
    }

    switch (type) {
      case "labour":
        setLabours(data.data || []);
        break;

      case "projects":
        setProjects(data.data || []);
        break;

      case "attendance":
        setAttendance(data.data || []);
        break;

      case "payroll":
        setPayroll(data.data || []);
        break;

      case "expenses":
        setExpenses(data.data || []);
        break;

      case "materials":
        setMaterials(data.data || []);
        break;
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchReport("labour"),
        fetchReport("projects"),
        fetchReport("attendance"),
        fetchReport("payroll"),
        fetchReport("expenses"),
        fetchReport("materials"),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [token]);

  const refreshReports = async () => {
    try {
      setRefreshing(true);
      setError("");
      await loadReports();
    } finally {
      setRefreshing(false);
    }
  };

  const reportTabs = [
    {
      id: "labour" as ReportType,
      title: "Labour",
      icon: <Users size={19} />,
    },
    {
      id: "projects" as ReportType,
      title: "Projects",
      icon: <Building2 size={19} />,
    },
    {
      id: "attendance" as ReportType,
      title: "Attendance",
      icon: <ClipboardCheck size={19} />,
    },
    {
      id: "payroll" as ReportType,
      title: "Payroll",
      icon: <WalletCards size={19} />,
    },
    {
      id: "expenses" as ReportType,
      title: "Expenses",
      icon: <Receipt size={19} />,
    },
    {
      id: "materials" as ReportType,
      title: "Materials",
      icon: <Package size={19} />,
    },
  ];

  const totalPayroll = useMemo(
    () =>
      payroll.reduce(
        (sum, item) =>
          sum + Number(item.totalSalary || 0),
        0
      ),
    [payroll]
  );

  const paidPayroll = useMemo(
    () =>
      payroll
        .filter(
          (item) =>
            item.paymentStatus === "PAID"
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.totalSalary || 0),
          0
        ),
    [payroll]
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ),
    [expenses]
  );

  const inventoryValue = useMemo(
    () =>
      materials.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.unitPrice || 0),
        0
      ),
    [materials]
  );

  const presentCount = attendance.filter(
    (item) => item.status === "PRESENT"
  ).length;

  const halfDayCount = attendance.filter(
    (item) => item.status === "HALF_DAY"
  ).length;

  const absentCount = attendance.filter(
    (item) =>
      item.status === "ABSENT"
  ).length;

  const renderLabourReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Labour</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Daily Wage</th>
          </tr>
        </thead>

        <tbody>
          {labours.map((labour) => (
            <tr key={labour.id}>
              <td>
                <div className="project-name-cell">
                  <div className="project-table-icon">
                    <Users size={18} />
                  </div>

                  <div>
                    <strong>
                      {labour.fullName}
                    </strong>
                    <span>
                      Labour #{labour.id}
                    </span>
                  </div>
                </div>
              </td>

              <td>{labour.mobileNumber}</td>

              <td>{labour.address}</td>

              <td>
                <strong>
                  {formatCurrency(
                    labour.dailyWage
                  )}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProjectReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Site Address</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <div className="project-name-cell">
                  <div className="project-table-icon">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <strong>
                      {project.projectName}
                    </strong>
                    <span>
                      Project #{project.id}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                {project.siteAddress}
              </td>

              <td>
                <strong>
                  {formatCurrency(
                    project.budget
                  )}
                </strong>
              </td>

              <td>
                <span>
                  {project.status}
                </span>
              </td>

              <td>
                {formatDate(
                  project.startDate
                )}
              </td>

              <td>
                {formatDate(
                  project.endDate
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Labour</th>
            <th>Project</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>
                  {item.labour.fullName}
                </strong>
              </td>

              <td>
                {item.project.projectName}
              </td>

              <td>
                {formatDate(item.date)}
              </td>

              <td>
                <span>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPayrollReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Labour</th>
            <th>Project</th>
            <th>Period</th>
            <th>Attendance</th>
            <th>Salary</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {payroll.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>
                  {item.labour.fullName}
                </strong>
              </td>

              <td>
                {item.project.projectName}
              </td>

              <td>
                {item.month}/{item.year}
              </td>

              <td>
                P:{item.presentDays}{" "}
                H:{item.halfDays}{" "}
                A:{item.absentDays}
              </td>

              <td>
                <strong>
                  {formatCurrency(
                    item.totalSalary
                  )}
                </strong>
              </td>

              <td>
                {item.paymentStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderExpenseReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th>Project</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="project-name-cell">
                  <div className="project-table-icon">
                    <Receipt size={18} />
                  </div>

                  <div>
                    <strong>
                      {item.title}
                    </strong>
                    <span>
                      Expense #{item.id}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                {item.project.projectName}
              </td>

              <td>
                {item.category}
              </td>

              <td>
                {formatDate(
                  item.expenseDate
                )}
              </td>

              <td>
                <strong>
                  {formatCurrency(
                    item.amount
                  )}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMaterialReport = () => (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Project</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Inventory Value</th>
            <th>Supplier</th>
          </tr>
        </thead>

        <tbody>
          {materials.map((item) => {
            const value =
              Number(item.quantity || 0) *
              Number(item.unitPrice || 0);

            return (
              <tr key={item.id}>
                <td>
                  <div className="project-name-cell">
                    <div className="project-table-icon">
                      <Package size={18} />
                    </div>

                    <div>
                      <strong>
                        {item.materialName}
                      </strong>
                      <span>
                        Material #{item.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  {item.project.projectName}
                </td>

                <td>
                  {item.category}
                </td>

                <td>
                  {item.quantity}{" "}
                  {item.unit}
                </td>

                <td>
                  {formatCurrency(
                    item.unitPrice
                  )}
                </td>

                <td>
                  <strong>
                    {formatCurrency(value)}
                  </strong>
                </td>

                <td>
                  {item.supplier}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderReport = () => {
    switch (activeReport) {
      case "labour":
        return renderLabourReport();

      case "projects":
        return renderProjectReport();

      case "attendance":
        return renderAttendanceReport();

      case "payroll":
        return renderPayrollReport();

      case "expenses":
        return renderExpenseReport();

      case "materials":
        return renderMaterialReport();

      default:
        return null;
    }
  };

  const getReportCount = () => {
    switch (activeReport) {
      case "labour":
        return labours.length;

      case "projects":
        return projects.length;

      case "attendance":
        return attendance.length;

      case "payroll":
        return payroll.length;

      case "expenses":
        return expenses.length;

      case "materials":
        return materials.length;
    }
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="projects-page">

        <div className="projects-toolbar">

          <div>
            <div className="projects-title-row">

              <div className="projects-title-icon">
                <BarChart3 size={25} />
              </div>

              <div>
                <h2>Reports</h2>

                <p>
                  View business reports and
                  management summaries.
                </p>
              </div>

            </div>
          </div>

          <button
            className="project-add-button"
            onClick={refreshReports}
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "report-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Reports"}
          </button>

        </div>

        {error && (
          <div className="projects-alert">
            {error}
          </div>
        )}

        <div className="projects-summary-grid">

          <div className="project-summary-card">
            <div className="project-summary-card-icon blue">
              <Users size={21} />
            </div>

            <div>
              <span>Total Labour</span>
              <strong>
                {labours.length}
              </strong>
            </div>
          </div>

          <div className="project-summary-card">
            <div className="project-summary-card-icon green">
              <Building2 size={21} />
            </div>

            <div>
              <span>Total Projects</span>
              <strong>
                {projects.length}
              </strong>
            </div>
          </div>

          <div className="project-summary-card">
            <div className="project-summary-card-icon purple">
              <ClipboardCheck size={21} />
            </div>

            <div>
              <span>Attendance Records</span>
              <strong>
                {attendance.length}
              </strong>
            </div>
          </div>

          <div className="project-summary-card">
            <div className="project-summary-card-icon blue">
              <WalletCards size={21} />
            </div>

            <div>
              <span>Total Payroll</span>
              <strong>
                {formatCurrency(
                  totalPayroll
                )}
              </strong>
            </div>
          </div>

          <div className="project-summary-card">
            <div className="project-summary-card-icon purple">
              <Receipt size={21} />
            </div>

            <div>
              <span>Total Expenses</span>
              <strong>
                {formatCurrency(
                  totalExpenses
                )}
              </strong>
            </div>
          </div>

          <div className="project-summary-card">
            <div className="project-summary-card-icon green">
              <Package size={21} />
            </div>

            <div>
              <span>Inventory Value</span>
              <strong>
                {formatCurrency(
                  inventoryValue
                )}
              </strong>
            </div>
          </div>

        </div>

        <div className="projects-content-panel">

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              padding: "18px",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveReport(tab.id)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding:
                    "10px 16px",
                  borderRadius:
                    "8px",
                  border:
                    activeReport ===
                    tab.id
                      ? "1px solid #2563eb"
                      : "1px solid #dbe3ef",
                  background:
                    activeReport ===
                    tab.id
                      ? "#2563eb"
                      : "#ffffff",
                  color:
                    activeReport ===
                    tab.id
                      ? "#ffffff"
                      : "#334155",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {tab.icon}
                {tab.title}
              </button>
            ))}
          </div>

          <div className="projects-list-header">

            <div>
              <h3>
                {reportTabs.find(
                  (tab) =>
                    tab.id ===
                    activeReport
                )?.title}{" "}
                Report
              </h3>

              <p>
                {getReportCount()} records
                found
              </p>
            </div>

          </div>

          {getReportCount() === 0 ? (
            <div className="projects-empty">

              <div className="projects-empty-icon">
                <BarChart3 size={34} />
              </div>

              <h3>
                No report data
              </h3>

              <p>
                There are no records available
                for this report yet.
              </p>

            </div>
          ) : (
            renderReport()
          )}

        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            <strong>Paid Payroll:</strong>{" "}
            {formatCurrency(
              paidPayroll
            )}
          </div>

          <div
            style={{
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            <strong>Present:</strong>{" "}
            {presentCount}
          </div>

          <div
            style={{
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            <strong>Half Day:</strong>{" "}
            {halfDayCount}
          </div>

          <div
            style={{
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            <strong>Absent:</strong>{" "}
            {absentCount}
          </div>
        </div>

      </div>
    </section>
  );
}