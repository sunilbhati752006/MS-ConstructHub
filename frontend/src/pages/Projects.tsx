import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  CalendarDays,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Save,
  FolderKanban,
} from "lucide-react";

interface Project {
  id: number;
  projectName: string;
  siteAddress: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectsProps {
  token: string;
}

interface ProjectForm {
  projectName: string;
  siteAddress: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: string;
}

const emptyForm: ProjectForm = {
  projectName: "",
  siteAddress: "",
  startDate: "",
  endDate: "",
  budget: "",
  status: "ACTIVE",
};

export default function Projects({ token }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects"
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return projects;
    }

    return projects.filter((project) =>
      [
        project.projectName,
        project.siteAddress,
        project.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [projects, search]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);

    setForm({
      projectName: project.projectName,
      siteAddress: project.siteAddress,
      startDate: project.startDate
        ? project.startDate.slice(0, 10)
        : "",
      endDate: project.endDate
        ? project.endDate.slice(0, 10)
        : "",
      budget: String(project.budget),
      status: project.status,
    });

    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    field: keyof ProjectForm,
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
      !form.projectName.trim() ||
      !form.siteAddress.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.budget
    ) {
      setError("Please fill all project details.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `http://localhost:5000/api/projects/${editingId}`
        : "http://localhost:5000/api/projects";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: form.projectName.trim(),
          siteAddress: form.siteAddress.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          budget: Number(form.budget),
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${editingId ? "update" : "add"} project`
        );
      }

      closeModal();
      await fetchProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
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
          data.message || "Failed to delete project"
        );
      }

      await fetchProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete project"
      );
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "project-status active";

      case "COMPLETED":
        return "project-status completed";

      case "PLANNED":
        return "project-status planned";

      default:
        return "project-status";
    }
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
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
                  <FolderKanban size={25} />
                </div>

                <div>
                  <h2>Projects</h2>
                  <p>
                    Manage your construction projects,
                    budgets and project status.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add Project
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
                <Building2 size={21} />
              </div>

              <div>
                <span>Total Projects</span>
                <strong>{projects.length}</strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon green">
                <FolderKanban size={21} />
              </div>

              <div>
                <span>Active Projects</span>
                <strong>
                  {
                    projects.filter(
                      (project) =>
                        project.status.toUpperCase() ===
                        "ACTIVE"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon purple">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Total Budget</span>
                <strong>
                  {formatCurrency(
                    projects.reduce(
                      (total, project) =>
                        total + Number(project.budget || 0),
                      0
                    )
                  )}
                </strong>
              </div>
            </div>

          </div>

          <div className="projects-content-panel">

            <div className="projects-list-header">
              <div>
                <h3>All Projects</h3>
                <p>
                  {filteredProjects.length} project
                  {filteredProjects.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <div className="projects-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="projects-empty">
                <div className="projects-empty-icon">
                  <Building2 size={34} />
                </div>

                <h3>
                  {search
                    ? "No projects found"
                    : "No projects yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Create your first construction project to get started."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    Add First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="projects-table-wrapper">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Location</th>
                      <th>Timeline</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>

                        <td>
                          <div className="project-name-cell">
                            <div className="project-table-icon">
                              <Building2 size={20} />
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
                          <div className="project-location">
                            <MapPin size={16} />
                            <span>
                              {project.siteAddress}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="project-timeline">
                            <div>
                              <CalendarDays size={15} />
                              <span>
                                {formatDate(
                                  project.startDate
                                )}
                              </span>
                            </div>

                            <span className="timeline-arrow">
                              →
                            </span>

                            <div>
                              <CalendarDays size={15} />
                              <span>
                                {formatDate(
                                  project.endDate
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong className="project-budget">
                            {formatCurrency(
                              Number(project.budget)
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              project.status
                            )}
                          >
                            <span></span>
                            {project.status}
                          </span>
                        </td>

                        <td>
                          <div className="project-actions">
                            <button
                              className="project-action edit"
                              title="Edit Project"
                              onClick={() =>
                                openEditModal(project)
                              }
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              className="project-action delete"
                              title="Delete Project"
                              onClick={() =>
                                handleDelete(project.id)
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
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="project-modal">

            <div className="project-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Project"
                    : "Add New Project"}
                </h2>

                <p>
                  Enter the construction project details
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
                  <label>Project Name</label>

                  <div className="project-input-wrapper">
                    <Building2 size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Jaipur Mall Construction"
                      value={form.projectName}
                      onChange={(event) =>
                        handleChange(
                          "projectName",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="project-form-group full">
                  <label>Site Address</label>

                  <div className="project-input-wrapper">
                    <MapPin size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Vaishali Nagar, Jaipur"
                      value={form.siteAddress}
                      onChange={(event) =>
                        handleChange(
                          "siteAddress",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="project-form-group">
                  <label>Start Date</label>

                  <div className="project-input-wrapper">
                    <CalendarDays size={18} />

                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        handleChange(
                          "startDate",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="project-form-group">
                  <label>End Date</label>

                  <div className="project-input-wrapper">
                    <CalendarDays size={18} />

                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        handleChange(
                          "endDate",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="project-form-group">
                  <label>Budget</label>

                  <div className="project-input-wrapper">
                    <IndianRupee size={18} />

                    <input
                      type="number"
                      min="0"
                      placeholder="5000000"
                      value={form.budget}
                      onChange={(event) =>
                        handleChange(
                          "budget",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="project-form-group">
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="PLANNED">
                      PLANNED
                    </option>

                    <option value="COMPLETED">
                      COMPLETED
                    </option>
                  </select>
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
                        ? "Update Project"
                        : "Create Project"}
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
