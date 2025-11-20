import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const listFoodItems = async ({ category, search, limit = 50, offset = 0 }) => {
  const where = {};
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: "insensitive" };
  // console.log("Something Hapenning !");

  const items = await prisma.fooditem.findMany({
    where,
    skip: Number(offset),
    take: Number(limit),
    orderBy: { name: "asc" },
  });

  const total = await prisma.fooditem.count({ where });
  return { items, total };
};

export const getFoodItem = async (UserID) => {
  const id=parseInt(UserID)
  //  console.log(id);
  const item = await prisma.fooditem.findUnique({ where: { id } });
  if (!item) throwError(404, "Food item not found");
  return item;
};

export const createFoodItem = async (payload) => {
  // payload should contain: name, category, expiration_days, cost_per_unit
  if (!payload.name || !payload.category) throwError(400, "name and category required");
  const item = await prisma.fooditem.create({ data: payload });
  return item;
};

export const updateFoodItem = async (UserID, payload) => {
  const id= parseInt(UserID);
  const existing = await prisma.fooditem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");
  const updated = await prisma.fooditem.update({ where: { id }, data: payload });
  return updated;
};

export const deleteFoodItem = async (UserID) => {
  const id=parseInt(UserID)
  const existing = await prisma.fooditem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");
  await prisma.fooditem.delete({ where: { id } });
  return true;
};
