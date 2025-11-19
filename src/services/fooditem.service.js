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

  const items = await prisma.foodItem.findMany({
    where,
    skip: Number(offset),
    take: Number(limit),
    orderBy: { name: "asc" },
  });

  const total = await prisma.foodItem.count({ where });
  return { items, total };
};

export const getFoodItem = async (id) => {
  const item = await prisma.foodItem.findUnique({ where: { id } });
  if (!item) throwError(404, "Food item not found");
  return item;
};

export const createFoodItem = async (payload) => {
  // payload should contain: name, category, expiration_days, cost_per_unit, unit
  if (!payload.name || !payload.category) throwError(400, "name and category required");
  const item = await prisma.foodItem.create({ data: payload });
  return item;
};

export const updateFoodItem = async (id, payload) => {
  const existing = await prisma.foodItem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");
  const updated = await prisma.foodItem.update({ where: { id }, data: payload });
  return updated;
};

export const deleteFoodItem = async (id) => {
  const existing = await prisma.foodItem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");
  await prisma.foodItem.delete({ where: { id } });
  return true;
};
