const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function resetPassword() {
    try {

        const newPassword = await bcrypt.hash("Sunil@123", 10);

        await prisma.user.update({
            where: {
                email: "sunil@gmail.com"
            },
            data: {
                password: newPassword
            }
        });

        console.log("✅ Password Reset Successfully");

    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();