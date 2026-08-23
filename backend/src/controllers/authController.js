const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
// Forgot Password - Send OTP
// =======================================
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

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

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // OTP expires in 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete old OTP
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id
            }
        });

        // Save OTP
        await prisma.passwordResetToken.create({
            data: {
                token: otp,
                expiresAt,
                userId: user.id
            }
        });

        // Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        // Send OTP email
        await transporter.sendMail({
            from: `"MS ConstructHub" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "MS ConstructHub - Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>MS ConstructHub</h2>

                    <p>Hello ${user.fullName},</p>

                    <p>
                        We received a request to reset your password.
                    </p>

                    <p>Your OTP is:</p>

                    <h1 style="letter-spacing: 8px;">
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password reset,
                        please ignore this email.
                    </p>

                    <p>
                        Regards,<br>
                        MS ConstructHub Team
                    </p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Unable to send OTP"
        });
    }
};

// =======================================
// Reset Password - Verify OTP
// =======================================
const resetPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const otp = req.body.otp?.trim();
        const newPassword = req.body.newPassword?.trim();

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required"
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and contain uppercase, lowercase, and a number"
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

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token: otp,
                userId: user.id
            }
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
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
                message: "OTP has expired"
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
                id: user.id
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