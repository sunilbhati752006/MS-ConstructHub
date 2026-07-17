const prisma = require("../config/prisma");

const addLabour = async (req, res) => {
    try {

        const {
            fullName,
            mobileNumber,
            aadhaarNumber,
            address,
            dailyWage
        } = req.body;

        const existingLabour = await prisma.labour.findFirst({
            where: {
                OR: [
                    { mobileNumber },
                    { aadhaarNumber }
                ]
            }
        });

        if (existingLabour) {
            return res.status(400).json({
                message: "Labour already exists"
            });
        }

        const labour = await prisma.labour.create({
            data: {
                fullName,
                mobileNumber,
                aadhaarNumber,
                address,
                dailyWage
            }
        });

        res.status(201).json({
            message: "Labour Added Successfully",
            labour
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getAllLabours = async (req, res) => {
    try {

        const labours = await prisma.labour.findMany({
            orderBy: {
                id: "desc"
            }
        });

        res.status(200).json({
            message: "Labour List",
            labours
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getLabourById = async (req, res) => {
    try {

        const { id } = req.params;

        const labour = await prisma.labour.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!labour) {
            return res.status(404).json({
                message: "Labour not found"
            });
        }

        res.status(200).json({
            message: "Labour Found",
            labour
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

const updateLabour = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            fullName,
            mobileNumber,
            aadhaarNumber,
            address,
            dailyWage
        } = req.body;

        const labour = await prisma.labour.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!labour) {
            return res.status(404).json({
                message: "Labour not found"
            });
        }

        const updatedLabour = await prisma.labour.update({
            where: {
                id: Number(id)
            },
            data: {
                fullName,
                mobileNumber,
                aadhaarNumber,
                address,
                dailyWage
            }
        });

        res.status(200).json({
            message: "Labour Updated Successfully",
            labour: updatedLabour
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

const deleteLabour = async (req, res) => {
    try {

        const { id } = req.params;

        const labour = await prisma.labour.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!labour) {
            return res.status(404).json({
                message: "Labour not found"
            });
        }

        await prisma.labour.delete({
            where: {
                id: Number(id)
            }
        });

        res.status(200).json({
            message: "Labour Deleted Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    addLabour,
    getAllLabours,
    getLabourById,
    updateLabour,
    deleteLabour
};