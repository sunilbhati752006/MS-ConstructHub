import { useEffect, useState } from "react";
import { API_URL as API_BASE_URL } from "../config";
const API_URL = `${API_BASE_URL}/labour`;
import {
  
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  MapPin,
  IndianRupee,
  CreditCard,
  FileText,
  Upload,
  Eye,
} from "lucide-react";

interface LabourDocument {
  id: number;
  documentType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt?: string;
}

interface Labour {
  id: number;
  fullName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  address: string;
  dailyWage: number;
  createdAt?: string;
  updatedAt?: string;
  documents?: LabourDocument[];
}

interface LabourProps {
  token: string;
}

interface LabourForm {
  fullName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  address: string;
  dailyWage: string;
}

const emptyForm: LabourForm = {
  fullName: "",
  mobileNumber: "",
  aadhaarNumber: "",
  address: "",
  dailyWage: "",
};


export default function Labour({ token }: LabourProps) {
  const [labours, setLabours] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<LabourForm>(emptyForm);

  const [photo, setPhoto] = useState<File | null>(null);
  const [aadhaarDocument, setAadhaarDocument] =
    useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<LabourDocument[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchLabours = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load labour records"
        );
      }

      setLabours(data.labours || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load labour records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabours();
  }, [token]);

  const filteredLabours = labours.filter((labour) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return [
      labour.fullName,
      labour.mobileNumber,
      labour.aadhaarNumber,
      labour.address,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);

    setPhoto(null);
    setAadhaarDocument(null);
    setDocuments([]);

    setError("");
    setShowModal(true);
  };

  const openEditModal = (labour: Labour) => {
    setEditingId(labour.id);

    setForm({
      fullName: labour.fullName,
      mobileNumber: labour.mobileNumber,
      aadhaarNumber: labour.aadhaarNumber,
      address: labour.address,
      dailyWage: String(labour.dailyWage),
    });

    setPhoto(null);
    setAadhaarDocument(null);
    setDocuments([]);

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);

    setPhoto(null);
    setAadhaarDocument(null);
    setDocuments([]);
  };

  const handleChange = (
    field: keyof LabourForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (
      !form.fullName.trim() ||
      !form.mobileNumber.trim() ||
      !form.aadhaarNumber.trim() ||
      !form.address.trim() ||
      !form.dailyWage
    ) {
      return "All labour details are required.";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim())) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!/^\d{12}$/.test(form.aadhaarNumber.trim())) {
      return "Please enter a valid 12-digit Aadhaar number.";
    }

    const wage = Number(form.dailyWage);

    if (isNaN(wage) || wage <= 0) {
      return "Daily wage must be greater than zero.";
    }

    return "";
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const response = await fetch(
          `${API_URL}/update/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: form.fullName.trim(),
              mobileNumber: form.mobileNumber.trim(),
              aadhaarNumber: form.aadhaarNumber.trim(),
              address: form.address.trim(),
              dailyWage: Number(form.dailyWage),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update labour"
          );
        }
      } else {
        const formData = new FormData();

        formData.append(
          "fullName",
          form.fullName.trim()
        );

        formData.append(
          "mobileNumber",
          form.mobileNumber.trim()
        );

        formData.append(
          "aadhaarNumber",
          form.aadhaarNumber.trim()
        );

        formData.append(
          "address",
          form.address.trim()
        );

        formData.append(
          "dailyWage",
          String(Number(form.dailyWage))
        );

        if (photo) {
          formData.append("photo", photo);
        }

        if (aadhaarDocument) {
          formData.append(
            "aadhaarDocument",
            aadhaarDocument
          );
        }

        documents.forEach((file) => {
          formData.append("documents", file);
        });

        const response = await fetch(
          `${API_URL}/add`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to add labour"
          );
        }
      }

      closeModal();
      await fetchLabours();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save labour"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this labour record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/delete/${id}`,
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
          data.message || "Failed to delete labour"
        );
      }

      await fetchLabours();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete labour"
      );
    }
  };

  const getDocuments = (labour: Labour) => {
    return labour.documents || [];
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading labour records...</p>
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
                  <Users size={25} />
                </div>

                <div>
                  <h2>Labour</h2>
                  <p>
                    Manage registered workers and
                    labour information.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add Labour
            </button>
          </div>

          {/* ERROR */}
          {error && !showModal && (
            <div className="projects-alert">
              {error}
            </div>
          )}

          {/* SUMMARY */}
          <div className="projects-summary-grid">

            <div className="project-summary-card">
              <div className="project-summary-card-icon blue">
                <Users size={21} />
              </div>

              <div>
                <span>Total Labour</span>
                <strong>{labours.length}</strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon green">
                <Users size={21} />
              </div>

              <div>
                <span>Registered Workers</span>
                <strong>{labours.length}</strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon purple">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Total Daily Wages</span>

                <strong>
                  {formatCurrency(
                    labours.reduce(
                      (total, labour) =>
                        total +
                        Number(labour.dailyWage || 0),
                      0
                    )
                  )}
                </strong>
              </div>
            </div>

          </div>

          {/* TABLE PANEL */}
          <div className="projects-content-panel">

            <div className="projects-list-header">
              <div>
                <h3>All Labour</h3>

                <p>
                  {filteredLabours.length} labour
                  {filteredLabours.length === 1
                    ? ""
                    : " records"} found
                </p>
              </div>

              <div className="projects-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search labour..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>

            {filteredLabours.length === 0 ? (
              <div className="projects-empty">

                <div className="projects-empty-icon">
                  <Users size={34} />
                </div>

                <h3>
                  {search
                    ? "No labour found"
                    : "No labour records yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Register your first worker to get started."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    Add First Labour
                  </button>
                )}

              </div>
            ) : (
              <div className="projects-table-wrapper">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>LABOUR</th>
                      <th>CONTACT</th>
                      <th>ADDRESS</th>
                      <th>DAILY WAGE</th>
                      <th>DOCUMENTS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredLabours.map((labour) => {

                      const docs =
                        getDocuments(labour);

                      return (
                        <tr key={labour.id}>

                          {/* NAME */}
                          <td>
                            <div className="project-name-cell">

                              <div className="project-table-icon">
                                <Users size={20} />
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

                          {/* CONTACT */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "7px",
                                }}
                              >
                                <Phone size={15} />
                                <span>
                                  {labour.mobileNumber}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "7px",
                                  color: "#64748b",
                                }}
                              >
                                <CreditCard size={15} />
                                <span>
                                  {labour.aadhaarNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ADDRESS */}
                          <td>
                            <div className="project-location">
                              <MapPin size={16} />

                              <span>
                                {labour.address}
                              </span>
                            </div>
                          </td>

                          {/* WAGE */}
<td>
  <strong className="project-budget">
    {formatCurrency(Number(labour.dailyWage))}
    <span
      style={{
        fontWeight: 400,
        color: "#64748b",
        fontSize: "12px",
        marginLeft: "4px",
      }}
    >
      /day
    </span>
  </strong>
</td>

{/* DOCUMENTS */}
<td>
  {docs.length > 0 ? (
    <button
      type="button"
      onClick={() => {
        setSelectedDocuments(docs);
        setShowDocumentsModal(true);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        border: "none",
        background: "transparent",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: 600,
        padding: 0,
      }}
    >
      <FileText size={17} />
      <span>
        {docs.length} file
        {docs.length === 1 ? "" : "s"}
      </span>
    </button>
  ) : (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        color: "#94a3b8",
      }}
    >
      <FileText size={17} />
      0 files
    </span>
  )}
</td>

                           {/* ACTIONS */}
                          <td>
                            <div className="project-actions">

                              <button
                                className="project-action edit"
                                title="Edit Labour"
                                onClick={() =>
                                  openEditModal(
                                    labour
                                  )
                                }
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                className="project-action delete"
                                title="Delete Labour"
                                onClick={() =>
                                  handleDelete(
                                    labour.id
                                  )
                                }
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* ADD / EDIT MODAL */}
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

            {/* MODAL HEADER */}
            <div className="project-modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Labour"
                    : "Add New Labour"}
                </h2>

                <p>
                  Enter the registered worker details
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

            {/* MODAL ERROR */}
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

                  <label>Full Name</label>

                  <div className="project-input-wrapper">

                    <Users size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={form.fullName}
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

                {/* MOBILE */}
                <div className="project-form-group">

                  <label>Mobile Number</label>

                  <div className="project-input-wrapper">

                    <Phone size={18} />

                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={form.mobileNumber}
                      onChange={(event) =>
                        handleChange(
                          "mobileNumber",
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* AADHAAR */}
                <div className="project-form-group">

                  <label>Aadhaar Number</label>

                  <div className="project-input-wrapper">

                    <CreditCard size={18} />

                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12 digit Aadhaar"
                      value={form.aadhaarNumber}
                      onChange={(event) =>
                        handleChange(
                          "aadhaarNumber",
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* ADDRESS */}
                <div className="project-form-group full">

                  <label>Address</label>

                  <div className="project-input-wrapper">

                    <MapPin size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Vaishali Nagar, Jaipur"
                      value={form.address}
                      onChange={(event) =>
                        handleChange(
                          "address",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* DAILY WAGE */}
                <div className="project-form-group">

                  <label>Daily Wage</label>

                  <div className="project-input-wrapper">

                    <IndianRupee size={18} />

                    <input
                      type="number"
                      min="1"
                      placeholder="500"
                      value={form.dailyWage}
                      onChange={(event) =>
                        handleChange(
                          "dailyWage",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                {/* PHOTO */}
                {!editingId && (
                  <div className="project-form-group">

                    <label>Worker Photo</label>

                    <div className="project-input-wrapper">

                      <Upload size={18} />

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(event) =>
                          setPhoto(
                            event.target.files?.[0] ||
                              null
                          )
                        }
                      />

                    </div>

                  </div>
                )}

                {/* AADHAAR DOCUMENT */}
                {!editingId && (
                  <div className="project-form-group">

                    <label>
                      Aadhaar Document
                    </label>

                    <div className="project-input-wrapper">

                      <FileText size={18} />

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        onChange={(event) =>
                          setAadhaarDocument(
                            event.target.files?.[0] ||
                              null
                          )
                        }
                      />

                    </div>

                  </div>
                )}

                {/* OTHER DOCUMENTS */}
                {!editingId && (
                  <div className="project-form-group full">

                    <label>
                      Other Documents
                    </label>

                    <div className="project-input-wrapper">

                      <FileText size={18} />

                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        onChange={(event) =>
                          setDocuments(
                            Array.from(
                              event.target.files ||
                                []
                            )
                          )
                        }
                      />

                    </div>

                    {documents.length > 0 && (
                      <small
                        style={{
                          marginTop: "6px",
                          color: "#64748b",
                        }}
                      >
                        {documents.length} document
                        {documents.length === 1
                          ? ""
                          : "s"} selected
                      </small>
                    )}

                  </div>
                )}

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
                        ? "Update Labour"
                        : "Create Labour"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
            )}

      {/* DOCUMENTS VIEWER MODAL */}
      {showDocumentsModal && (
        <div
          className="project-modal-overlay"
          onClick={() => setShowDocumentsModal(false)}
        >
          <div
            className="project-modal"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div className="project-modal-header">
              <div>
                <h3>Labour Documents</h3>
                <p>
                  {selectedDocuments.length} document
                  {selectedDocuments.length === 1 ? "" : "s"} available
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDocumentsModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "26px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {selectedDocuments.map((document) => {
                const documentUrl = `${API_BASE_URL.replace("/api", "")}${document.filePath}`;
                return (
                  <div
                    key={document.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                      padding: "14px",
                      marginBottom: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: 0,
                      }}
                    >
                      <FileText
                        size={22}
                        style={{ flexShrink: 0 }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {document.fileName}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {document.documentType}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="project-save-button"
                      onClick={() =>
                        window.open(
                          documentUrl,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="project-form-footer">
              <button
                type="button"
                className="project-cancel-button"
                onClick={() => setShowDocumentsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
