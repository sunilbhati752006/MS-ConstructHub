import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import {
  Plus,
  Search,
  Package,
  Building2,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Save,
  Truck,
} from "lucide-react";

interface Project {
  id: number;
  projectName: string;
}

interface Material {
  id: number;
  projectId: number;
  materialName: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  project: Project;
  createdAt?: string;
  updatedAt?: string;
}

interface MaterialProps {
  token: string;
}

interface MaterialForm {
  projectId: string;
  materialName: string;
  category: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  supplier: string;
}



const emptyForm: MaterialForm = {
  projectId: "",
  materialName: "",
  category: "",
  unit: "",
  quantity: "",
  unitPrice: "",
  supplier: "",
};

export default function Material({ token }: MaterialProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] =
    useState<MaterialForm>(emptyForm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const fetchMaterials = async () => {
    const response = await fetch(
      `${API_URL}/materials`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load materials"
      );
    }

    setMaterials(data.materials || []);
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
        data.message || "Failed to load projects"
      );
    }

    setProjects(data.projects || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchMaterials(),
        fetchProjects(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load material data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredMaterials = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return materials;
    }

    return materials.filter((material) =>
      [
        material.materialName,
        material.category,
        material.unit,
        material.supplier,
        material.project?.projectName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [materials, search]);

  const totalInventoryValue = materials.reduce(
    (total, material) =>
      total +
      Number(material.quantity || 0) *
        Number(material.unitPrice || 0),
    0
  );

  const totalQuantity = materials.reduce(
    (total, material) =>
      total + Number(material.quantity || 0),
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingId(material.id);

    setForm({
      projectId: String(material.projectId),
      materialName: material.materialName,
      category: material.category,
      unit: material.unit,
      quantity: String(material.quantity),
      unitPrice: String(material.unitPrice),
      supplier: material.supplier,
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
    field: keyof MaterialForm,
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
      !form.materialName.trim() ||
      !form.category.trim() ||
      !form.unit.trim() ||
      !form.quantity ||
      !form.unitPrice ||
      !form.supplier.trim()
    ) {
      setError(
        "Please fill all material details."
      );
      return;
    }

    if (Number(form.quantity) < 0) {
      setError(
        "Quantity cannot be negative."
      );
      return;
    }

    if (Number(form.unitPrice) <= 0) {
      setError(
        "Unit price must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/materials/${editingId}`
        : `${API_URL}/materials`;

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
          projectId: Number(form.projectId),
          materialName:
            form.materialName.trim(),
          category:
            form.category.trim(),
          unit: form.unit.trim(),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          supplier:
            form.supplier.trim(),
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
            } material`
        );
      }

      closeModal();
      await fetchMaterials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save material"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/materials/${id}`,
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
            "Failed to delete material"
        );
      }

      await fetchMaterials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete material"
      );
    }
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading materials...</p>
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
                  <Package size={25} />
                </div>

                <div>
                  <h2>Materials</h2>

                  <p>
                    Manage construction materials,
                    suppliers and inventory.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="project-add-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add Material
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
                <Package size={21} />
              </div>

              <div>
                <span>Material Items</span>

                <strong>
                  {materials.length}
                </strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon green">
                <Building2 size={21} />
              </div>

              <div>
                <span>Total Quantity</span>

                <strong>
                  {totalQuantity.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            <div className="project-summary-card">
              <div className="project-summary-card-icon purple">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Inventory Value</span>

                <strong>
                  {formatCurrency(
                    totalInventoryValue
                  )}
                </strong>
              </div>
            </div>

          </div>

          <div className="projects-content-panel">

            <div className="projects-list-header">
              <div>
                <h3>Material Inventory</h3>

                <p>
                  {filteredMaterials.length} material
                  {filteredMaterials.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <div className="projects-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="projects-empty">

                <div className="projects-empty-icon">
                  <Package size={34} />
                </div>

                <h3>
                  {search
                    ? "No materials found"
                    : "No materials yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Add your first construction material to get started."}
                </p>

                {!search && (
                  <button
                    className="project-add-button"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    Add First Material
                  </button>
                )}

              </div>
            ) : (
              <div className="projects-table-wrapper">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Value</th>
                      <th>Supplier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMaterials.map(
                      (material) => {

                        const totalValue =
                          Number(
                            material.quantity
                          ) *
                          Number(
                            material.unitPrice
                          );

                        return (
                          <tr
                            key={material.id}
                          >

                            <td>
                              <div className="project-name-cell">

                                <div className="project-table-icon">
                                  <Package size={19} />
                                </div>

                                <div>
                                  <strong>
                                    {
                                      material.materialName
                                    }
                                  </strong>

                                  <span>
                                    Material #
                                    {
                                      material.id
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
                                    material
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
                                  material.category
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                {
                                  material.quantity
                                }{" "}
                                {
                                  material.unit
                                }
                              </strong>
                            </td>

                            <td>
                              <strong className="project-budget">
                                {formatCurrency(
                                  material.unitPrice
                                )}
                              </strong>
                            </td>

                            <td>
                              <strong className="project-budget">
                                {formatCurrency(
                                  totalValue
                                )}
                              </strong>
                            </td>

                            <td>
                              <div className="project-location">
                                <Truck
                                  size={16}
                                />

                                <span>
                                  {
                                    material.supplier
                                  }
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="project-actions">

                                <button
                                  className="project-action edit"
                                  title="Edit Material"
                                  onClick={() =>
                                    openEditModal(
                                      material
                                    )
                                  }
                                >
                                  <Pencil
                                    size={17}
                                  />
                                </button>

                                <button
                                  className="project-action delete"
                                  title="Delete Material"
                                  onClick={() =>
                                    handleDelete(
                                      material.id
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
                        );
                      }
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
                    ? "Edit Material"
                    : "Add New Material"}
                </h2>

                <p>
                  Enter the material inventory
                  details below.
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
                </div>

                <div className="project-form-group full">
                  <label>
                    Material Name
                  </label>

                  <div className="project-input-wrapper">

                    <Package size={18} />

                    <input
                      type="text"
                      placeholder="e.g. Cement"
                      value={
                        form.materialName
                      }
                      onChange={(event) =>
                        handleChange(
                          "materialName",
                          event.target.value
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
                    placeholder="e.g. Construction"
                    value={form.category}
                    onChange={(event) =>
                      handleChange(
                        "category",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="project-form-group">
                  <label>
                    Unit
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Bags, Kg, Ton"
                    value={form.unit}
                    onChange={(event) =>
                      handleChange(
                        "unit",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="project-form-group">
                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100"
                    value={form.quantity}
                    onChange={(event) =>
                      handleChange(
                        "quantity",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="project-form-group">
                  <label>
                    Unit Price
                  </label>

                  <div className="project-input-wrapper">

                    <IndianRupee size={18} />

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="500"
                      value={
                        form.unitPrice
                      }
                      onChange={(event) =>
                        handleChange(
                          "unitPrice",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>
                </div>

                <div className="project-form-group full">
                  <label>
                    Supplier
                  </label>

                  <div className="project-input-wrapper">

                    <Truck size={18} />

                    <input
                      type="text"
                      placeholder="e.g. ABC Building Supplies"
                      value={form.supplier}
                      onChange={(event) =>
                        handleChange(
                          "supplier",
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
                    "Saving..."
                  ) : (
                    <>
                      <Save size={18} />

                      {editingId
                        ? "Update Material"
                        : "Add Material"}
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