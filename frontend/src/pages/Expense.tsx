import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import {
  Plus,
  Search,
  Receipt,
  Building2,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
} from "lucide-react";

interface Project {
  id: number;
  projectName: string;
}

interface Expense {
  id: number;
  projectId: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string | null;
  project: Project;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpenseProps {
  token: string;
}

interface ExpenseForm {
  projectId: string;
  title: string;
  category: string;
  amount: string;
  expenseDate: string;
  description: string;
}


const emptyForm: ExpenseForm = {
  projectId: "",
  title: "",
  category: "",
  amount: "",
  expenseDate: "",
  description: "",
};

export default function Expense({ token }: ExpenseProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<ExpenseForm>(emptyForm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

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

  const fetchExpenses = async () => {
    const response = await fetch(
      `${API_URL}/expenses`,
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
          "Failed to load expenses"
      );
    }

    setExpenses(data.expenses || []);
  };

  const fetchProjects = async () => {
    const response = await fetch(
      `${API_URL}/projects`,
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
          "Failed to load projects"
      );
    }

    setProjects(data.projects || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchExpenses(),
        fetchProjects(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load expense data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredExpenses = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return expenses;
    }

    return expenses.filter((expense) =>
      [
        expense.title,
        expense.category,
        expense.description || "",
        expense.project?.projectName || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [expenses, search]);

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const averageExpense =
    expenses.length > 0
      ? totalExpense / expenses.length
      : 0;

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      expenseDate: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (
    expense: Expense
  ) => {
    setEditingId(expense.id);

    setForm({
      projectId: String(
        expense.projectId
      ),
      title: expense.title,
      category: expense.category,
      amount: String(expense.amount),
      expenseDate: expense.expenseDate
        ? expense.expenseDate.slice(0, 10)
        : "",
      description:
        expense.description || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    field: keyof ExpenseForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.projectId ||
      !form.title.trim() ||
      !form.category.trim() ||
      !form.amount ||
      !form.expenseDate
    ) {
      setError(
        "Please fill all required expense details."
      );
      return;
    }

    if (Number(form.amount) <= 0) {
      setError(
        "Amount must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/expenses/${editingId}`
        : `${API_URL}/expenses`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(
            form.projectId
          ),
          title: form.title.trim(),
          category:
            form.category.trim(),
          amount: Number(form.amount),
          expenseDate:
            form.expenseDate,
          description:
            form.description.trim() ||
            undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              editingId
                ? "update"
                : "add"
            } expense`
        );
      }

      closeModal();
      await fetchExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save expense"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this expense?"
      );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete expense"
        );
      }

      await fetchExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete expense"
      );
    }
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
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
                  <Receipt size={25} />
                </div>

                <div>
                  <h2>Expenses</h2>

                  <p>
                    Track company expenses,
                    project costs and spending.
                  </p>
                </div>

              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add Expense
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
                <Receipt size={21} />
              </div>

              <div>
                <span>
                  Total Expenses
                </span>

                <strong>
                  {expenses.length}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon green">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>
                  Total Amount
                </span>

                <strong>
                  {formatCurrency(
                    totalExpense
                  )}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon purple">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>
                  Average Expense
                </span>

                <strong>
                  {formatCurrency(
                    averageExpense
                  )}
                </strong>
              </div>

            </div>

          </div>

          <div className="projects-content-panel">

            <div className="projects-list-header">

              <div>
                <h3>
                  Expense Records
                </h3>

                <p>
                  {
                    filteredExpenses.length
                  } expense
                  {
                    filteredExpenses.length ===
                    1
                      ? ""
                      : "s"
                  } found
                </p>
              </div>

              <div className="projects-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {filteredExpenses.length ===
            0 ? (
              <div className="projects-empty">

                <div className="projects-empty-icon">
                  <Receipt size={34} />
                </div>

                <h3>
                  {search
                    ? "No expenses found"
                    : "No expenses yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Record your first company expense to get started."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={
                      openAddModal
                    }
                  >
                    <Plus size={18} />
                    Add First Expense
                  </button>
                )}

              </div>
            ) : (
              <div className="projects-table-wrapper">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>Expense</th>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredExpenses.map(
                      (expense) => (
                        <tr
                          key={
                            expense.id
                          }
                        >

                          <td>
                            <div className="project-name-cell">

                              <div className="project-table-icon">
                                <Receipt
                                  size={19}
                                />
                              </div>

                              <div>
                                <strong>
                                  {
                                    expense.title
                                  }
                                </strong>

                                <span>
                                  Expense #
                                  {
                                    expense.id
                                  }
                                </span>
                              </div>

                            </div>
                          </td>

                          <td>
                            <div className="project-location">

                              <Building2
                                size={16}
                              />

                              <span>
                                {
                                  expense
                                    .project
                                    ?.projectName ||
                                  "Unknown Project"
                                }
                              </span>

                            </div>
                          </td>

                          <td>
                            <span>
                              {
                                expense.category
                              }
                            </span>
                          </td>

                          <td>
                            <div className="project-location">

                              <CalendarDays
                                size={16}
                              />

                              <span>
                                {formatDate(
                                  expense.expenseDate
                                )}
                              </span>

                            </div>
                          </td>

                          <td>
                            <strong className="project-budget">
                              {formatCurrency(
                                expense.amount
                              )}
                            </strong>
                          </td>

                          <td>
                            <span>
                              {expense.description ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            <div className="project-actions">

                              <button
                                className="project-action edit"
                                title="Edit Expense"
                                onClick={() =>
                                  openEditModal(
                                    expense
                                  )
                                }
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                className="project-action delete"
                                title="Delete Expense"
                                onClick={() =>
                                  handleDelete(
                                    expense.id
                                  )
                                }
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>
                          </td>

                        </tr>
                      )
                    )}

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
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="project-modal">

            <div className="project-modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Expense"
                    : "Add New Expense"}
                </h2>

                <p>
                  Enter the expense details
                  below.
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
              onSubmit={handleSubmit}
            >

              <div className="project-form-grid">

                <div className="project-form-group full">

                  <label>
                    Project
                  </label>

                  <div className="project-input-wrapper">

                    <Building2
                      size={18}
                    />

                    <select
                      value={
                        form.projectId
                      }
                      onChange={(event) =>
                        handleChange(
                          "projectId",
                          event.target
                            .value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Project
                      </option>

                      {projects.map(
                        (project) => (
                          <option
                            key={
                              project.id
                            }
                            value={
                              project.id
                            }
                          >
                            {
                              project.projectName
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                <div className="project-form-group full">

                  <label>
                    Expense Title
                  </label>

                  <div className="project-input-wrapper">

                    <Receipt size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Cement Transportation"
                      value={
                        form.title
                      }
                      onChange={(event) =>
                        handleChange(
                          "title",
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="project-form-group">

                  <label>
                    Category
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Transport"
                    value={
                      form.category
                    }
                    onChange={(event) =>
                      handleChange(
                        "category",
                        event.target
                          .value
                      )
                    }
                    required
                  />

                </div>

                <div className="project-form-group">

                  <label>
                    Amount
                  </label>

                  <div className="project-input-wrapper">

                    <IndianRupee
                      size={18}
                    />

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="5000"
                      value={
                        form.amount
                      }
                      onChange={(event) =>
                        handleChange(
                          "amount",
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="project-form-group">

                  <label>
                    Expense Date
                  </label>

                  <div className="project-input-wrapper">

                    <CalendarDays
                      size={18}
                    />

                    <input
                      type="date"
                      value={
                        form.expenseDate
                      }
                      onChange={(event) =>
                        handleChange(
                          "expenseDate",
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="project-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Optional expense description"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      handleChange(
                        "description",
                        event.target
                          .value
                      )
                    }
                    rows={4}
                  />

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
                    "Saving..."
                  ) : (
                    <>
                      <Save size={18} />

                      {editingId
                        ? "Update Expense"
                        : "Add Expense"}
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