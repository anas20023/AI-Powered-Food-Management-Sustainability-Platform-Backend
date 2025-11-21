import prisma from '../config/PrismaClient.js';
export const getconsumption = async (id) => {
    console.log(id);
    const res = await prisma.consumption.findMany({
        where:{
            user_id:id
        }
    });
    console.log(res);
    if (!res) throw new Error("No Data Found!")
    return res;
}
export const getwaste = async (id) => {
    // console.log(id);
    const res = await prisma.consumption.findMany({
        where:{
            user_id:id
        }
    });
    // console.log(res);
    if (!res) throw new Error("No Data Found!")
    return res;
}