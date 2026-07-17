const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
            message: "User Registered Successfully",
            user
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
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    register,
    login
};