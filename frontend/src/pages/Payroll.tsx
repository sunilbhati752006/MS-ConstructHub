import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  WalletCards,
  User,
  Building2,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  Trash2,
  X,
  Save,
} from "lucide-react";

interface Labour {
  id: number;
  fullName: string;
  dailyWage: number;
}

interface Project {
  id: number;
  projectName: string;
}

interface Payroll {
  id: number;
  labourId: number;
  projectId: number;
  month: number;
  year: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalSalary: number;
  paymentStatus: string;
  paidDate?: string | null;
  labour: Labour;
  project: Project;
  createdAt?: string;
}

interface PayrollProps {
  token: string;
}

interface PayrollForm {
  labourId: string;
  projectId: string;
  month: string;
  year: string;
}

const API_URL = "http://localhost:5000/api";

const emptyForm: PayrollForm = {
  labourId: "",
  projectId: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Payroll({ token }: PayrollProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [labours, setLabours] = useState<Labour[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PayrollForm>(emptyForm);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value?: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchPayrolls = async () => {
    const response = await fetch(`${API_URL}/payroll`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load payroll");
    }

    setPayrolls(data.payroll || []);
  };

  const fetchLabours = async () => {
    const response = await fetch(`${API_URL}/labour/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load labour");
    }

    setLabours(data.labours || []);
  };

  const fetchProjects = async () => {
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load projects");
    }

    setProjects(data.projects || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchPayrolls(),
        fetchLabours(),
        fetchProjects(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payroll data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredPayrolls = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return payrolls;

    return payrolls.filter((payroll) => {
      const monthName =
        monthNames[payroll.month - 1] || "";

      return [
        payroll.labour?.fullName,
        payroll.project?.projectName,
        payroll.paymentStatus,
        monthName,
        String(payroll.year),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [payrolls, search]);

  const openModal = () => {
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleChange = (
    field: keyof PayrollForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleGenerate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.labourId ||
      !form.projectId ||
      !form.month ||
      !form.year
    ) {
      setError("Please fill all payroll details.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/payroll/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            labourId: Number(form.labourId),
            projectId: Number(form.projectId),
            month: Number(form.month),
            year: Number(form.year),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate payroll"
        );
      }

      closeModal();
      await fetchPayrolls();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate payroll"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this salary as PAID?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/payroll/pay/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark salary paid"
        );
      }

      await fetchPayrolls();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark salary as paid"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/payroll/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete payroll"
        );
      }

      await fetchPayrolls();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete payroll"
      );
    }
  };

  const totalPayroll = payrolls.reduce(
    (total, payroll) =>
      total + Number(payroll.totalSalary || 0),
    0
  );

  const paidPayroll = payrolls
    .filter(
      (payroll) =>
        payroll.paymentStatus.toUpperCase() === "PAID"
    )
    .reduce(
      (total, payroll) =>
        total + Number(payroll.totalSalary || 0),
      0
    );

  const pendingPayroll = totalPayroll - paidPayroll;

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading payroll...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dashboard-section">
        <div className="projects-page">

          <div className="projects-toolbar">
            <div>
              <div className="projects-title-row">
                <div className="projects-title-icon">
                  <WalletCards size={25} />
                </div>

                <div>
                  <h2>Payroll</h2>
                  <p>
                    Manage labour salaries, payments and
                    payroll records.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openModal}
            >
              <Plus size={19} />
              Generate Payroll
            </button>
          </div>

          {error && !showModal && (
            <div className="projects-alert">
              {error}
            </div>
          )}

          <div className="projects-summary-grid">

            <div className="project-summary-card">
              <div className="project-summary-card-icon blue">
                <WalletCards size={21} />
              </div>

              <div>
                <span>Total Payroll</span>
                <strong>
                  {formatCurrency(totalPayroll)}
                </strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon green">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Paid</span>
                <strong>
                  {formatCurrency(paidPayroll)}
                </strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon purple">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Pending</span>
                <strong>
                  {formatCurrency(pendingPayroll)}
                </strong>
              </div>
            </div>

          </div>

          <div className="projects-content-panel">

            <div className="projects-list-header">
              <div>
                <h3>Payroll Records</h3>
                <p>
                  {filteredPayrolls.length} record
                  {filteredPayrolls.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <div className="projects-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search payroll..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>

            {filteredPayrolls.length === 0 ? (
              <div className="projects-empty">
                <div className="projects-empty-icon">
                  <WalletCards size={34} />
                </div>

                <h3>
                  {search
                    ? "No payroll found"
                    : "No payroll records yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Generate payroll after attendance has been recorded."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={openModal}
                  >
                    <Plus size={18} />
                    Generate Payroll
                  </button>
                )}
              </div>
            ) : (
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
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id}>

                        <td>
                          <div className="project-name-cell">
                            <div className="project-table-icon">
                              <User size={19} />
                            </div>

                            <div>
                              <strong>
                                {payroll.labour?.fullName ||
                                  "Unknown Labour"}
                              </strong>

                              <span>
                                Payroll #{payroll.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="project-location">
                            <Building2 size={16} />

                            <span>
                              {payroll.project?.projectName ||
                                "Unknown Project"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="project-location">
                            <CalendarDays size={16} />

                            <span>
                              {monthNames[
                                payroll.month - 1
                              ] || payroll.month}{" "}
                              {payroll.year}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="payroll-attendance">
                            <span className="payroll-present">
                              P: {payroll.presentDays}
                            </span>

                            <span className="payroll-half">
                              H: {payroll.halfDays}
                            </span>

                            <span className="payroll-absent">
                              A: {payroll.absentDays}
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong className="project-budget">
                            {formatCurrency(
                              payroll.totalSalary
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              payroll.paymentStatus
                                .toUpperCase() === "PAID"
                                ? "project-status active"
                                : "project-status planned"
                            }
                          >
                            <span></span>
                            {payroll.paymentStatus}
                          </span>

                          {payroll.paidDate && (
                            <small className="payroll-paid-date">
                              Paid:{" "}
                              {formatDate(
                                payroll.paidDate
                              )}
                            </small>
                          )}
                        </td>

                        <td>
                          <div className="project-actions">

                            {payroll.paymentStatus
                              .toUpperCase() !== "PAID" && (
                              <button
                                className="project-action edit"
                                title="Mark Salary Paid"
                                onClick={() =>
                                  handleMarkPaid(
                                    payroll.id
                                  )
                                }
                              >
                                <CheckCircle2 size={17} />
                              </button>
                            )}

                            <button
                              className="project-action delete"
                              title="Delete Payroll"
                              onClick={() =>
                                handleDelete(payroll.id)
                              }
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="project-modal">

            <div className="project-modal-header">
              <div>
                <h2>Generate Payroll</h2>

                <p>
                  Select labour, project and payroll
                  period.
                </p>
              </div>

              <button
                className="project-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="projects-alert">
                {error}
              </div>
            )}

            <form
              className="project-form"
              onSubmit={handleGenerate}
            >

              <div className="project-form-grid">

                <div className="project-form-group full">
                  <label>Labour</label>

                  <div className="project-input-wrapper">
                    <User size={18} />

                    <select
                      value={form.labourId}
                      onChange={(event) =>
                        handleChange(
                          "labourId",
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select Labour
                      </option>

                      {labours.map((labour) => (
                        <option
                          key={labour.id}
                          value={labour.id}
                        >
                          {labour.fullName} —{" "}
                          {formatCurrency(
                            labour.dailyWage
                          )}
                          /day
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="project-form-group full">
                  <label>Project</label>

                  <div className="project-input-wrapper">
                    <Building2 size={18} />

                    <select
                      value={form.projectId}
                      onChange={(event) =>
                        handleChange(
                          "projectId",
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select Project
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="project-form-group">
                  <label>Month</label>

                  <div className="project-input-wrapper">
                    <CalendarDays size={18} />

                    <select
                      value={form.month}
                      onChange={(event) =>
                        handleChange(
                          "month",
                          event.target.value
                        )
                      }
                      required
                    >
                      {monthNames.map(
                        (month, index) => (
                          <option
                            key={month}
                            value={index + 1}
                          >
                            {month}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="project-form-group">
                  <label>Year</label>

                  <div className="project-input-wrapper">
                    <CalendarDays size={18} />

                    <input
                      type="number"
                      min="2020"
                      max="2100"
                      value={form.year}
                      onChange={(event) =>
                        handleChange(
                          "year",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="project-form-footer">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="project-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    "Generating..."
                  ) : (
                    <>
                      <Save size={18} />
                      Generate Payroll
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}