const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =========================
// Add Material
// =========================
const addMaterial = async (req, res) => {
  try {
    const {
      projectId,
      materialName,
      category,
      unit,
      quantity,
      unitPrice,
      supplier,
    } = req.body;

    // Validate Required Fields
    if (
      !projectId ||
      !materialName ||
      !category ||
      !unit ||
      quantity === undefined ||
      unitPrice === undefined ||
      !supplier
    ) {
      return res.status(400).json({
        message: "All required fields are mandatory",
      });
    }

    // Check Project Exists
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Validate Quantity
    if (Number(quantity) < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    // Validate Unit Price
    if (Number(unitPrice) <= 0) {
      return res.status(400).json({
        message: "Unit price must be greater than zero",
      });
    }

    const material = await prisma.material.create({
      data: {
        projectId: Number(projectId),
        materialName,
        category,
        unit,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        supplier,
      },
      include: {
        project: true,
      },
    });

    res.status(201).json({
      message: "Material added successfully",
      material,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get All Materials
// =========================
const getAllMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: {
        project: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      count: materials.length,
      materials,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Get Material By ID
// =========================
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        project: true,
      },
    });

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// =========================
// Update Material
// =========================
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      projectId,
      materialName,
      category,
      unit,
      quantity,
      unitPrice,
      supplier,
    } = req.body;

    const existingMaterial = await prisma.material.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingMaterial) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    if (Number(unitPrice) <= 0) {
      return res.status(400).json({
        message: "Unit price must be greater than zero",
      });
    }

    const updatedMaterial = await prisma.material.update({
      where: {
        id: Number(id),
      },
      data: {
        projectId: Number(projectId),
        materialName,
        category,
        unit,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        supplier,
      },
      include: {
        project: true,
      },
    });

    res.status(200).json({
      message: "Material updated successfully",
      updatedMaterial,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Delete Material
// =========================
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const existingMaterial = await prisma.material.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingMaterial) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    await prisma.material.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Inventory Summary
// =========================
const getInventorySummary = async (req, res) => {
  try {
    const materials = await prisma.material.findMany();

    const totalMaterials = materials.length;

    const totalInventoryValue = materials.reduce(
      (sum, material) => sum + (material.quantity * material.unitPrice),
      0
    );

    res.status(200).json({
      totalMaterials,
      totalInventoryValue,
      materials,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getInventorySummary,
};