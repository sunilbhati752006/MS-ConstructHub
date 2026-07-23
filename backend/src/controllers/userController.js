const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");


// =======================================
// Get All Users
// =======================================
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Get User By ID
// =======================================
const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Create New User (OWNER Only)
// =======================================
const createUser = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, role } = req.body;

const name = fullName?.trim();
const userEmail = email?.trim().toLowerCase();
const mobile = mobileNumber?.trim();
const userPassword = password?.trim();

if (!name || !userEmail || !mobile || !userPassword || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(userEmail)) {
  return res.status(400).json({
    success: false,
    message: "Invalid email format",
  });
}
const mobileRegex = /^[6-9]\d{9}$/;

if (!mobileRegex.test(mobile)) {
  return res.status(400).json({
    success: false,
    message: "Invalid mobile number",
  });
}
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!passwordRegex.test(userPassword)) {
  return res.status(400).json({
    success: false,
    message:
      "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
  });
}
const validRole = role?.trim().toUpperCase();
    if (validRole !== "OWNER" && validRole !== "MANAGER") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { email: userEmail },
      { mobileNumber: mobile },
    ],
  },
});

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Mobile Number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const user = await prisma.user.create({
      data: {
  fullName: name,
  email: userEmail,
  mobileNumber: mobile,
  password: hashedPassword,
 role: validRole,
},
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Update User (OWNER Only)
// =======================================
const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { fullName, email, mobileNumber, role } = req.body;
    const name = fullName?.trim();
const userEmail = email?.trim().toLowerCase();
const mobile = mobileNumber?.trim();
const validRole = role?.trim().toUpperCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
}
if (mobileNumber) {
  const mobileRegex = /^[6-9]\d{9}$/;

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number",
    });
  }
}
if (role && validRole !== "OWNER" && validRole !== "MANAGER") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (email || mobileNumber) {
      const duplicateUser = await prisma.user.findFirst({
  where: {
    AND: [
      {
        OR: [
          { email: userEmail },
          { mobileNumber: mobile },
        ],
      },
      {
        NOT: {
          id,
        },
      },
    ],
  },
});
      if (duplicateUser) {
        return res.status(400).json({
          success: false,
          message: "Email or Mobile Number already exists",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
  fullName: name,
  email: userEmail,
  mobileNumber: mobile,
  role: validRole,
},
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =======================================
// Activate / Deactivate User (OWNER Only)
// =======================================
const updateUserStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // OWNER cannot deactivate himself
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      data: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
   updateUserStatus,
};