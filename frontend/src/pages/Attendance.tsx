import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import {
  Plus,
  Search,
  ClipboardCheck,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
  Building2,
  Users,
} from "lucide-react";

interface Labour {
  id: number;
  fullName: string;
}

interface Project {
  id: number;
  projectName: string;
}

interface Attendance {
  id: number;
  labourId: number;
  projectId: number;
  date: string;
  status: string;
  labour?: Labour;
  project?: Project;
}

interface AttendanceProps {
  token: string;
}

interface AttendanceForm {
  labourId: string;
  projectId: string;
  date: string;
  status: string;
}

const emptyForm: AttendanceForm = {
  labourId: "",
  projectId: "",
  date: "",
  status: "PRESENT",
};


export default function Attendance({
  token,
}: AttendanceProps) {
  const [attendance, setAttendance] = useState<
    Attendance[]
  >([]);

  const [labours, setLabours] = useState<Labour[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<AttendanceForm>(emptyForm);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance`,
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
            "Failed to load attendance"
        );
      }

      setAttendance(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance"
      );
    }
  };

  const fetchLabours = async () => {
    try {
      const response = await fetch(
        `${API_URL}/labour/all`,
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
            "Failed to load labour"
        );
      }

      setLabours(data.labours || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load labour"
      );
    }
  };

  const fetchProjects = async () => {
    try {
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects"
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchAttendance(),
        fetchLabours(),
        fetchProjects(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredAttendance = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return attendance;
    }

    return attendance.filter((item) =>
      [
        item.labour?.fullName || "",
        item.project?.projectName || "",
        item.status,
        item.date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [attendance, search]);

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (
    item: Attendance
  ) => {
    setEditingId(item.id);

    setForm({
      labourId: String(item.labourId),
      projectId: String(item.projectId),
      date: item.date
        ? item.date.slice(0, 10)
        : "",
      status: item.status,
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
    field: keyof AttendanceForm,
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
      !form.labourId ||
      !form.projectId ||
      !form.date ||
      !form.status
    ) {
      setError(
        "Please fill all attendance details."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/attendance/${editingId}`
        : `${API_URL}/attendance`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          labourId: Number(form.labourId),
          projectId: Number(form.projectId),
          date: form.date,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save attendance"
        );
      }

      closeModal();

      await fetchAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/attendance/${id}`,
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
          data.message ||
            "Failed to delete attendance"
        );
      }

      await fetchAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete attendance"
      );
    }
  };

  const formatDate = (
    value: string
  ) => {
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

  const getStatusClass = (
    status: string
  ) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return "project-status active";

      case "HALF_DAY":
        return "project-status planned";

      case "ABSENT":
        return "project-status completed";

      default:
        return "project-status";
    }
  };

  const presentCount =
    attendance.filter(
      (item) =>
        item.status.toUpperCase() ===
        "PRESENT"
    ).length;

  const halfDayCount =
    attendance.filter(
      (item) =>
        item.status.toUpperCase() ===
        "HALF_DAY"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        item.status.toUpperCase() ===
        "ABSENT"
    ).length;

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading attendance...
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dashboard-section">
        <div className="projects-page">

          {/* HEADER */}

          <div className="projects-toolbar">

            <div>
              <div className="projects-title-row">

                <div className="projects-title-icon">
                  <ClipboardCheck
                    size={25}
                  />
                </div>

                <div>
                  <h2>
                    Attendance
                  </h2>

                  <p>
                    Track daily labour
                    attendance across
                    construction projects.
                  </p>
                </div>

              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Mark Attendance
            </button>

          </div>

          {/* ERROR */}

          {error &&
            !showModal && (
              <div className="projects-alert">
                {error}
              </div>
            )}

          {/* SUMMARY */}

          <div className="projects-summary-grid">

            <div className="project-summary-card">

              <div className="project-summary-card-icon blue">
                <ClipboardCheck
                  size={21}
                />
              </div>

              <div>
                <span>
                  Total Records
                </span>

                <strong>
                  {attendance.length}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon green">
                <Users size={21} />
              </div>

              <div>
                <span>
                  Present
                </span>

                <strong>
                  {presentCount}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon purple">
                <CalendarDays
                  size={21}
                />
              </div>

              <div>
                <span>
                  Half Day / Absent
                </span>

                <strong>
                  {halfDayCount +
                    absentCount}
                </strong>
              </div>

            </div>

          </div>

          {/* TABLE */}

          <div className="projects-content-panel">

            <div className="projects-list-header">

              <div>
                <h3>
                  Attendance Records
                </h3>

                <p>
                  {
                    filteredAttendance.length
                  }{" "}
                  record
                  {filteredAttendance.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  found
                </p>
              </div>

              <div className="projects-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search attendance..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {filteredAttendance.length ===
            0 ? (
              <div className="projects-empty">

                <div className="projects-empty-icon">
                  <ClipboardCheck
                    size={34}
                  />
                </div>

                <h3>
                  {search
                    ? "No attendance found"
                    : "No attendance records yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Start recording daily labour attendance."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={
                      openAddModal
                    }
                  >
                    <Plus size={18} />
                    Mark First Attendance
                  </button>
                )}

              </div>
            ) : (
              <div className="projects-table-wrapper">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>LABOUR</th>
                      <th>PROJECT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredAttendance.map(
                      (item) => (
                        <tr
                          key={item.id}
                        >

                          <td>
                            <div className="project-name-cell">

                              <div className="project-table-icon">
                                <Users
                                  size={20}
                                />
                              </div>

                              <div>

                                <strong>
                                  {item.labour
                                    ?.fullName ||
                                    `Labour #${item.labourId}`}
                                </strong>

                                <span>
                                  Labour #
                                  {
                                    item.labourId
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
                                {item.project
                                  ?.projectName ||
                                  `Project #${item.projectId}`}
                              </span>

                            </div>

                          </td>

                          <td>

                            <div className="project-timeline">

                              <div>

                                <CalendarDays
                                  size={15}
                                />

                                <span>
                                  {formatDate(
                                    item.date
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span
                              className={getStatusClass(
                                item.status
                              )}
                            >
                              <span></span>

                              {item.status ===
                              "HALF_DAY"
                                ? "HALF DAY"
                                : item.status}
                            </span>

                          </td>

                          <td>

                            <div className="project-actions">

                              <button
                                className="project-action edit"
                                title="Edit Attendance"
                                onClick={() =>
                                  openEditModal(
                                    item
                                  )
                                }
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                className="project-action delete"
                                title="Delete Attendance"
                                onClick={() =>
                                  handleDelete(
                                    item.id
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

      {/* MODAL */}

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
                    ? "Edit Attendance"
                    : "Mark Attendance"}
                </h2>

                <p>
                  Record labour attendance
                  for a construction project.
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

                {/* LABOUR */}

                <div className="project-form-group">

                  <label>
                    Labour
                  </label>

                  <select
                    value={
                      form.labourId
                    }
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

                    {labours.map(
                      (labour) => (
                        <option
                          key={labour.id}
                          value={labour.id}
                        >
                          {labour.fullName}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* PROJECT */}

                <div className="project-form-group">

                  <label>
                    Project
                  </label>

                  <select
                    value={
                      form.projectId
                    }
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

                    {projects.map(
                      (project) => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {
                            project.projectName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DATE */}

                <div className="project-form-group">

                  <label>
                    Date
                  </label>

                  <div className="project-input-wrapper">

                    <CalendarDays
                      size={18}
                    />

                    <input
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(event) =>
                        handleChange(
                          "date",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="project-form-group">

                  <label>
                    Attendance Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value
                      )
                    }
                    required
                  >

                    <option value="PRESENT">
                      PRESENT
                    </option>

                    <option value="HALF_DAY">
                      HALF DAY
                    </option>

                    <option value="ABSENT">
                      ABSENT
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
                      <Save
                        size={18}
                      />

                      {editingId
                        ? "Update Attendance"
                        : "Save Attendance"}
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