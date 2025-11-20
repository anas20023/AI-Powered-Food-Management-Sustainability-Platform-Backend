import 'dotenv/config';
import prisma from "../config/PrismaClient.js";

export const getAllUsers = async () => {
    const res = await prisma.user.findMany();
    // console.log(res);
    if (!res) throw new Error("User not Found !")
    return res;
}
export const getUserById = async (id) => {

}