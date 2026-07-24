const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const register = async (req, res) => {
    try {

        const { fullName, email, mobileNumber, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { mobileNumber }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email or Mobile Number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                mobileNumber,
                password: hashedPassword
            }
        });

        res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isActive: user.isActive
    }
});

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // Check if account is active
if (!user.isActive) {
    return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact the owner."
    });
}

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

       res.status(200).json({
    success: true,
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isActive: user.isActive
    }
});

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// =======================================
// Change Password
// =======================================
const changePassword = async (req, res) => {
    try {

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                password: hashedPassword
            }
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =======================================
// Forgot Password
// =======================================
const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate Secure Token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token Expiry (15 Minutes)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Delete old reset tokens
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id
            }
        });

        // Save new token
        await prisma.passwordResetToken.create({
            data: {
                token: resetToken,
                expiresAt,
                userId: user.id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Password reset token generated successfully",
            resetToken
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// =======================================
// Reset Password
// =======================================
const resetPassword = async (req, res) => {
    try {

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: {
                token
            },
            include: {
                user: true
            }
        });

        if (!resetToken) {
            return res.status(404).json({
                success: false,
                message: "Invalid reset token"
            });
        }

        if (resetToken.expiresAt < new Date()) {

            await prisma.passwordResetToken.delete({
                where: {
                    id: resetToken.id
                }
            });

            return res.status(400).json({
                success: false,
                message: "Reset token has expired"
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            resetToken.user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: resetToken.user.id
            },
            data: {
                password: hashedPassword
            }
        });

        await prisma.passwordResetToken.delete({
            where: {
                id: resetToken.id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// =======================================
// Get Current User
// =======================================
const getCurrentUser = async (req, res) => {
    try {

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                mobileNumber: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};
module.exports = {
    register,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    getCurrentUser
};