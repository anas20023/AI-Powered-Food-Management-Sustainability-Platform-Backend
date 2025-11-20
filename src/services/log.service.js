import prisma from "../config/PrismaClient.js";

export const getUserLogs = async (id) => {
    const userID = parseInt(id)
    const res = await prisma.log.findMany({
        where:{
            user_id:userID
        }
    })
    if (!res) throw new Error("No Logs Found !")
    return res;
}