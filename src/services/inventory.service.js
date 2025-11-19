import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const listInventory = async ({ userId, category, expiringWithinDays, status, limit = 50, offset = 0 }) => {
  if (!userId) throwError(401, "Unauthorized");
  const where = { user_id: userId };

  if (status) where.status = status;
  if (category) where.foodItem = { category };
  if (expiringWithinDays) {
    const days = Number(expiringWithinDays);
    const now = new Date();
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    // Prisma: comparing date strings for date fields
    where.expiry_date = { lte: until.toISOString().slice(0, 10) };
  }

  const items = await prisma.inventory.findMany({
    where,
    skip: Number(offset),
    take: Number(limit),
    include: { foodItem: true },
    orderBy: { expiry_date: "asc" },
  });

  const total = await prisma.inventory.count({ where });
  return { items, total };
};

export const createInventory = async ({ userId, payload }) => {
  if (!userId) throwError(401, "Unauthorized");
  const data = {
    user_id: userId,
    food_item_id: payload.food_item_id ?? null,
    custom_name: payload.custom_name ?? null,
    quantity: payload.quantity ?? 0,
    unit: payload.unit ?? null,
    purchased_date: payload.purchased_date ?? null,
    expiry_date: payload.expiry_date ?? null,
    notes: payload.notes ?? null,
    status: payload.status ?? undefined,
  };
  const inv = await prisma.inventory.create({ data });
  return inv;
};

export const updateInventory = async ({ userId, id, updates }) => {
  if (!userId) throwError(401, "Unauthorized");
  const inv = await prisma.inventory.findUnique({ where: { id } });
  if (!inv) throwError(404, "Inventory item not found");
  if (inv.user_id !== userId) throwError(403, "Forbidden");

  const updated = await prisma.inventory.update({ where: { id }, data: updates });
  return updated;
};

export const deleteInventory = async ({ userId, id }) => {
  if (!userId) throwError(401, "Unauthorized");
  const inv = await prisma.inventory.findUnique({ where: { id } });
  if (!inv) throwError(404, "Inventory item not found");
  if (inv.user_id !== userId) throwError(403, "Forbidden");

  await prisma.inventory.delete({ where: { id } });
  return true;
};
