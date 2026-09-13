const ROLE_PERMISSIONS = {
    OWNER: ["*"],

    MANAGER: [
        "dashboard.view",
        "labour.view",
        "labour.create",
        "labour.update",
        "labour.delete",
        "attendance.view",
        "attendance.create",
        "attendance.update",
        "materials.view",
        "materials.create",
        "materials.update",
        "materials.delete",
        "projects.view",
        "projects.create",
        "projects.update"
    ]
};

const authorizePermissions = (...requiredPermissions) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized Access"
            });
        }

        const role = String(req.user.role || "").toUpperCase();

        const userPermissions = ROLE_PERMISSIONS[role];

        if (!userPermissions) {
            return res.status(403).json({
                message: "Access Forbidden"
            });
        }

        // OWNER has complete access
        if (userPermissions.includes("*")) {
            return next();
        }

        // Check whether user has all required permissions
        const hasPermission = requiredPermissions.every(
            (permission) => userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

module.exports = authorizePermissions;