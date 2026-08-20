const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folder if it doesn't exist
const createFolder = (folderName) => {
    const folderPath = path.join(__dirname, "../../uploads", folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    return folderPath;
};

// Allowed file types
const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf"
];

// File filter
const fileFilter = (req, file, cb) => {

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Only JPG, JPEG, PNG and PDF files are allowed."));
    }

    cb(null, true);
};

// Upload middleware factory
const uploadFile = (folderName) => {

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {
            console.log(
        "FILE RECEIVED:",
        file.fieldname,
        file.originalname,
        file.mimetype
    );

            const uploadPath = createFolder(folderName);

            cb(null, uploadPath);

        },

        filename: (req, file, cb) => {

            const uniqueName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                path.extname(file.originalname);

            cb(null, uniqueName);

        }

    });

    return multer({

        storage,

        fileFilter,

        limits: {
            fileSize: 5 * 1024 * 1024
        }

    });

};

module.exports = uploadFile;