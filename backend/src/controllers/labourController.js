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
const name = fullName?.trim();
const mobile = mobileNumber?.trim();
const aadhaar = aadhaarNumber?.trim();
const labourAddress = address?.trim();
const wage = Number(dailyWage);

if (
    !name ||
    !mobile ||
    !aadhaar ||
    !labourAddress ||
    dailyWage === undefined ||
    dailyWage === null ||
    dailyWage === ""
) {
    return res.status(400).json({
        success: false,
        message: "All fields are required"
    });
}

const mobileRegex = /^[6-9]\d{9}$/;

if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
    });
}

const aadhaarRegex = /^\d{12}$/;

if (!aadhaarRegex.test(aadhaar)) {
    return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number"
    });
}

if (isNaN(wage) || wage <= 0) {
    return res.status(400).json({
        success: false,
        message: "Daily wage must be greater than zero"
    });
}

 const existingLabour = await prisma.labour.findFirst({
    where: {
        OR: [
            { mobileNumber: mobile },
            { aadhaarNumber: aadhaar }
        ]
    }
});
if (existingLabour) {
    return res.status(400).json({
        success: false,
        message: "Labour already exists"
    });
}

        const labour = await prisma.labour.create({
    data: {
        fullName: name,
        mobileNumber: mobile,
        aadhaarNumber: aadhaar,
        address: labourAddress,
        dailyWage: wage
    }
});
const files = req.files || {};


const uploadedDocuments = [];

if (files.photo?.[0]) {
    uploadedDocuments.push({
        labourId: labour.id,
        documentType: "PHOTO",
        fileName: files.photo[0].filename,
        filePath: `/uploads/labour/${files.photo[0].filename}`,
        mimeType: files.photo[0].mimetype,
        fileSize: files.photo[0].size
    });
}

if (files.aadhaarDocument?.[0]) {
    uploadedDocuments.push({
        labourId: labour.id,
        documentType: "AADHAAR",
        fileName: files.aadhaarDocument[0].filename,
        filePath: `/uploads/labour/${files.aadhaarDocument[0].filename}`,
        mimeType: files.aadhaarDocument[0].mimetype,
        fileSize: files.aadhaarDocument[0].size
    });
}

if (files.documents?.length) {
    for (const file of files.documents) {
        uploadedDocuments.push({
            labourId: labour.id,
            documentType: "DOCUMENT",
            fileName: file.filename,
            filePath: `/uploads/labour/${file.filename}`,
            mimeType: file.mimetype,
            fileSize: file.size
        });
    }
}

if (uploadedDocuments.length > 0) {
    await prisma.labourDocument.createMany({
        data: uploadedDocuments
    });
}

        res.status(201).json({
    success: true,
    message: "Labour added successfully",
    labour
});
    } catch (error) {
        console.log(error);

        res.status(500).json({
    success: false,
    message: "Server Error"
});
    }
};

const getAllLabours = async (req, res) => {
    try {

        const labours = await prisma.labour.findMany({
    include: {
        documents: true
    },
    orderBy: {
        id: "desc"
    }
});

       res.status(200).json({
    success: true,
    message: "Labour list fetched successfully",
    labours
});

    } catch (error) {
        console.log(error);

        res.status(500).json({
    success: false,
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
    },
    include: {
        documents: true
    }
});

        if (!labour) {
            return res.status(404).json({
                success: false,
                message: "Labour not found"
            });
        }

        res.status(200).json({
    success: true,
    message: "Labour fetched successfully",
    labour
});

    } catch (error) {
        console.log(error);

        res.status(500).json({
    success: false,
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
        
        const name = fullName?.trim();
const mobile = mobileNumber?.trim();
const aadhaar = aadhaarNumber?.trim();
const labourAddress = address?.trim();
const wage = Number(dailyWage);

if (
    !name ||
    !mobile ||
    !aadhaar ||
    !labourAddress ||
    dailyWage === undefined ||
    dailyWage === null ||
    dailyWage === ""
) {
    return res.status(400).json({
        success: false,
        message: "All fields are required"
    });
}

const mobileRegex = /^[6-9]\d{9}$/;

if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
    });
}

const aadhaarRegex = /^\d{12}$/;

if (!aadhaarRegex.test(aadhaar)) {
    return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number"
    });
}

if (isNaN(wage) || wage <= 0) {
    return res.status(400).json({
        success: false,
        message: "Daily wage must be greater than zero"
    });
}
        const labour = await prisma.labour.findUnique({
    where: {
        id: Number(id)
    },
    include: {
        documents: true
    }
});

        if (!labour) {
            return res.status(404).json({
                message: "Labour not found"
            });
        }

        const duplicateLabour = await prisma.labour.findFirst({
    where: {
        AND: [
            {
                OR: [
                    { mobileNumber: mobile },
                    { aadhaarNumber: aadhaar }
                ]
            },
            {
                NOT: {
                    id: Number(id)
                }
            }
        ]
    }
});

if (duplicateLabour) {
    return res.status(400).json({
        success: false,
        message: "Mobile number or Aadhaar already exists"
    });
}

       const updatedLabour = await prisma.labour.update({
    where: {
        id: Number(id)
    },
    data: {
        fullName: name,
        mobileNumber: mobile,
        aadhaarNumber: aadhaar,
        address: labourAddress,
        dailyWage: wage
    }
});

       res.status(200).json({
    success: true,
    message: "Labour updated successfully",
    labour: updatedLabour
});

    } catch (error) {
        console.log(error);

        res.status(500).json({
    success: false,
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
                success: false,
                message: "Labour not found"
            });
        }

        await prisma.labour.delete({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json({
            success: true,
            message: "Labour deleted successfully"
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
    addLabour,
    getAllLabours,
    getLabourById,
    updateLabour,
    deleteLabour
};