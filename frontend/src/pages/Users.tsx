import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Plus,
  Search,
  UserCog,
  Pencil,
  Power,
  X,
  Save,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";

interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersProps {
  token: string;
}

interface UserForm {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: "OWNER" | "MANAGER";
}

const API_URL = "http://localhost:5000/api/users";

const emptyForm: UserForm = {
  fullName: "",
  email: "",
  mobileNumber: "",
  password: "",
  role: "MANAGER",
};

export default function Users({ token }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [form, setForm] =
    useState<UserForm>(emptyForm);

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load users"
      );
    }

    setUsers(data.data || []);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  // =========================
  // FILTER USERS
  // =========================

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.mobileNumber,
        user.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  // =========================
  // SUMMARY
  // =========================

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  const managerUsers = users.filter(
    (user) => user.role === "MANAGER"
  ).length;

  // =========================
  // ADD USER MODAL
  // =========================

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  // =========================
  // EDIT USER MODAL
  // =========================

  const openEditModal = (user: User) => {
    setEditingId(user.id);

    setForm({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      password: "",
      role:
        user.role === "OWNER"
          ? "OWNER"
          : "MANAGER",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE ADD/EDIT MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
    field: keyof UserForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.mobileNumber.trim() ||
      !form.role
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    if (
      !editingId &&
      !form.password.trim()
    ) {
      setError(
        "Password is required when creating a user."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : `${API_URL}/create`;

      const method = editingId
        ? "PUT"
        : "POST";

      const body: Record<string, string> = {
        fullName: form.fullName.trim(),
        email: form.email
          .trim()
          .toLowerCase(),
        mobileNumber:
          form.mobileNumber.trim(),
        role: form.role,
      };

      if (!editingId) {
        body.password =
          form.password.trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              editingId
                ? "update"
                : "create"
            } user`
        );
      }

      closeModal();

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save user"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ACTIVATE / DEACTIVATE
  // =========================

  const toggleUserStatus = async (
    user: User
  ) => {
    const action = user.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.fullName}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive:
              !user.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} user`
        );
      }

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to ${action} user`
      );
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    value: string
  ) => {
    if (!value) return "-";

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </section>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <>
      <section className="dashboard-section">
        <div className="projects-page">

          {/* TOOLBAR */}

          <div className="projects-toolbar">

            <div>
              <div className="projects-title-row">

                <div className="projects-title-icon">
                  <UserCog size={25} />
                </div>

                <div>
                  <h2>Users</h2>

                  <p>
                    Manage portal users and
                    administrator access.
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add User
            </button>

          </div>

          {/* ERROR */}

          {error && !showModal && (
            <div className="projects-alert">
              {error}
            </div>
          )}

          {/* SUMMARY CARDS */}

          <div className="projects-summary-grid">

            <div className="project-summary-card">

              <div className="project-summary-card-icon blue">
                <UserCog size={21} />
              </div>

              <div>
                <span>Total Users</span>
                <strong>
                  {users.length}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon green">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span>Active Users</span>
                <strong>
                  {activeUsers}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon purple">
                <UserCog size={21} />
              </div>

              <div>
                <span>Managers</span>
                <strong>
                  {managerUsers}
                </strong>
              </div>

            </div>

            <div className="project-summary-card">

              <div className="project-summary-card-icon blue">
                <Power size={21} />
              </div>

              <div>
                <span>Inactive Users</span>
                <strong>
                  {inactiveUsers}
                </strong>
              </div>

            </div>

          </div>

          {/* USER TABLE */}

          <div className="projects-content-panel">

            <div className="projects-list-header">

              <div>
                <h3>User Accounts</h3>

                <p>
                  {filteredUsers.length} user
                  {filteredUsers.length === 1
                    ? ""
                    : "s"}{" "}
                  found
                </p>
              </div>

              <div className="projects-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* EMPTY STATE */}

            {filteredUsers.length === 0 ? (

              <div className="projects-empty">

                <div className="projects-empty-icon">
                  <UserCog size={34} />
                </div>

                <h3>
                  {search
                    ? "No users found"
                    : "No users available"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Create a user account to get started."}
                </p>

                {!search && (
                  <button
                    type="button"
                    className="project-add-button"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    Add First User
                  </button>
                )}

              </div>

            ) : (

              <div className="projects-table-wrapper">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => (

                        <tr key={user.id}>

                          {/* USER */}

                          <td>

                            <div className="project-name-cell">

                              <div className="project-table-icon">
                                <UserCog
                                  size={18}
                                />
                              </div>

                              <div>

                                <strong>
                                  {user.fullName}
                                </strong>

                                <span>
                                  User #{user.id}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td>

                            <div
                              style={{
                                display: "flex",
                                flexDirection:
                                  "column",
                                gap: "5px",
                              }}
                            >

                              <span>
                                {user.email}
                              </span>

                              <span>
                                {user.mobileNumber}
                              </span>

                            </div>

                          </td>

                          {/* ROLE */}

                          <td>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(user)
                              }
                              style={{
                                border: "none",
                                cursor: "pointer",
                                background:
                                  "transparent",
                                padding: 0,
                              }}
                            >

                              <span
                                className={
                                  user.role === "OWNER"
                                    ? "project-status active"
                                    : "project-status planned"
                                }
                              >

                                <span></span>

                                {user.role}

                              </span>

                            </button>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                user.isActive
                                  ? "project-status active"
                                  : "project-status completed"
                              }
                            >

                              <span></span>

                              {user.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}

                            </span>

                          </td>

                          {/* CREATED */}

                          <td>
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="project-actions">

                              <button
                                type="button"
                                className="project-action edit"
                                title="Edit User"
                                onClick={() =>
                                  openEditModal(
                                    user
                                  )
                                }
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                className="project-action"
                                title={
                                  user.isActive
                                    ? "Deactivate User"
                                    : "Activate User"
                                }
                                onClick={() =>
                                  toggleUserStatus(
                                    user
                                  )
                                }
                              >
                                <Power
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

      {/* =====================================================
          ADD / EDIT USER MODAL
      ===================================================== */}

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
                    ? "Edit User"
                    : "Create New User"}
                </h2>

                <p>
                  Manage user account and
                  access details.
                </p>

              </div>

              <button
                type="button"
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

                {/* FULL NAME */}

                <div className="project-form-group full">

                  <label>
                    Full Name
                  </label>

                  <div className="project-input-wrapper">

                    <UserCog size={18} />

                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={
                        form.fullName
                      }
                      onChange={(event) =>
                        handleChange(
                          "fullName",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="project-form-group">

                  <label>
                    Email
                  </label>

                  <div className="project-input-wrapper">

                    <Mail size={18} />

                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={
                        form.email
                      }
                      onChange={(event) =>
                        handleChange(
                          "email",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* MOBILE */}

                <div className="project-form-group">

                  <label>
                    Mobile Number
                  </label>

                  <div className="project-input-wrapper">

                    <Phone size={18} />

                    <input
                      type="tel"
                      placeholder="10 digit mobile"
                      maxLength={10}
                      value={
                        form.mobileNumber
                      }
                      onChange={(event) =>
                        handleChange(
                          "mobileNumber",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                {!editingId && (

                  <div className="project-form-group full">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={
                        form.password
                      }
                      onChange={(event) =>
                        handleChange(
                          "password",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                )}

                {/* ROLE */}

                <div className="project-form-group">

                  <label>
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      handleChange(
                        "role",
                        event.target.value
                      )
                    }
                  >

                    <option value="MANAGER">
                      MANAGER
                    </option>

                    <option value="OWNER">
                      OWNER
                    </option>

                  </select>

                </div>

              </div>

              {/* FOOTER */}

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
                        ? "Update User"
                        : "Create User"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          USER PROFILE MODAL
      ===================================================== */}

      {selectedUser && (

        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedUser(null);
            }

          }}
        >

          <div className="project-modal">

            <div className="project-modal-header">

              <div>

                <h2>
                  User Profile
                </h2>

                <p>
                  View user account and
                  access details.
                </p>

              </div>

              <button
                type="button"
                className="project-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="project-form">

              <div className="project-form-grid">

                {/* FULL NAME */}

                <div className="project-form-group full">

                  <label>
                    Full Name
                  </label>

                  <div className="project-input-wrapper">

                    <UserCog size={18} />

                    <input
                      type="text"
                      value={
                        selectedUser.fullName
                      }
                      readOnly
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="project-form-group">

                  <label>
                    Email
                  </label>

                  <div className="project-input-wrapper">

                    <Mail size={18} />

                    <input
                      type="text"
                      value={
                        selectedUser.email
                      }
                      readOnly
                    />

                  </div>

                </div>

                {/* MOBILE */}

                <div className="project-form-group">

                  <label>
                    Mobile Number
                  </label>

                  <div className="project-input-wrapper">

                    <Phone size={18} />

                    <input
                      type="text"
                      value={
                        selectedUser.mobileNumber
                      }
                      readOnly
                    />

                  </div>

                </div>

                {/* ROLE */}

                <div className="project-form-group">

                  <label>
                    Role
                  </label>

                  <input
                    type="text"
                    value={
                      selectedUser.role
                    }
                    readOnly
                  />

                </div>

                {/* STATUS */}

                <div className="project-form-group">

                  <label>
                    Status
                  </label>

                  <input
                    type="text"
                    value={
                      selectedUser.isActive
                        ? "ACTIVE"
                        : "INACTIVE"
                    }
                    readOnly
                  />

                </div>

                {/* CREATED */}

                <div className="project-form-group full">

                  <label>
                    Created Date
                  </label>

                  <input
                    type="text"
                    value={formatDate(
                      selectedUser.createdAt
                    )}
                    readOnly
                  />

                </div>

              </div>

              {/* PROFILE FOOTER */}

              <div className="project-form-footer">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={() =>
                    setSelectedUser(null)
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="project-save-button"
                  onClick={() => {

                    const user =
                      selectedUser;

                    setSelectedUser(null);

                    openEditModal(user);

                  }}
                >

                  <Pencil size={18} />

                  Edit User

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}