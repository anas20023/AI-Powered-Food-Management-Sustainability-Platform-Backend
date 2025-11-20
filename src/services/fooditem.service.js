import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

/**
 * listFoodItems({ category, search, limit = 50, offset = 0, userId })
 */
export const listFoodItems = async ({ category, search, limit = 50, offset = 0, userId }) => {
  const where = {};

  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: "insensitive" };

  // if userId provided, only return that user's items
  if (userId !== undefined && userId !== null) {
    const uid = Number(userId);
    if (isNaN(uid)) throwError(400, "Invalid userId");
    where.user_id = uid;
  }

  const items = await prisma.fooditem.findMany({
    where,
    skip: Number(offset) || 0,
    take: Number(limit) || 50,
    orderBy: { name: "asc" },
  });

  const total = await prisma.fooditem.count({ where });
  return { items, total };
};

/**
 * getFoodItem(itemId, userId)
 * If userId provided, enforce ownership (only owner can view)
 */
export const getFoodItem = async (itemId, userId) => {
  const id = Number(itemId);
  if (isNaN(id)) throwError(400, "Invalid food item id");

  const item = await prisma.fooditem.findUnique({ where: { id } });
  if (!item) throwError(404, "Food item not found");

  if (userId !== undefined && userId !== null) {
    const uid = Number(userId);
    if (isNaN(uid)) throwError(400, "Invalid userId");
    // if item.user_id is set and doesn't match, forbid access
    if (item.user_id && item.user_id !== uid) throwError(403, "Forbidden");
  }

  return item;
};

/**
 * createFoodItem(payload)
 * payload should contain: name, category, optional expiration_days, cost_per_unit, unit, user_id
 */
export const createFoodItem = async (payload) => {
  if (!payload || !payload.name || !payload.category) {
    throwError(400, "name and category required");
  }

  const data = {
    name: String(payload.name),
    category: payload.category,
    expiration_days: payload.expiration_days !== undefined ? Number(payload.expiration_days) : null,
    cost_per_unit: payload.cost_per_unit !== undefined ? Number(payload.cost_per_unit) : null,
    unit: payload.unit ?? null,
    user_id: payload.user_id !== undefined ? (Number(payload.user_id) || null) : null,
  };

  const item = await prisma.fooditem.create({ data });
  return item;
};

/**
 * updateFoodItem(itemId, payload, userId)
 * Enforces ownership if userId provided.
 */
export const updateFoodItem = async (itemId, payload, userId) => {
  const id = Number(itemId);
  if (isNaN(id)) throwError(400, "Invalid food item id");

  const existing = await prisma.fooditem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");

  if (userId !== undefined && userId !== null) {
    const uid = Number(userId);
    if (isNaN(uid)) throwError(400, "Invalid userId");
    if (existing.user_id && existing.user_id !== uid) throwError(403, "Forbidden");
  }

  const data = {};
  if (payload.name !== undefined) data.name = String(payload.name);
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.expiration_days !== undefined) data.expiration_days = payload.expiration_days === null ? null : Number(payload.expiration_days);
  if (payload.cost_per_unit !== undefined) data.cost_per_unit = payload.cost_per_unit === null ? null : Number(payload.cost_per_unit);
  if (payload.unit !== undefined) data.unit = payload.unit;
  // allow updating owner only if explicitly provided (be careful)
  if (payload.user_id !== undefined) data.user_id = payload.user_id === null ? null : Number(payload.user_id);

  const updated = await prisma.fooditem.update({ where: { id }, data });
  return updated;
};

/**
 * deleteFoodItem(itemId, userId)
 * Enforces ownership if userId provided.
 */
export const deleteFoodItem = async (itemId, userId) => {
  const id = Number(itemId);
  if (isNaN(id)) throwError(400, "Invalid food item id");

  const existing = await prisma.fooditem.findUnique({ where: { id } });
  if (!existing) throwError(404, "Food item not found");

  if (userId !== undefined && userId !== null) {
    const uid = Number(userId);
    if (isNaN(uid)) throwError(400, "Invalid userId");
    if (existing.user_id && existing.user_id !== uid) throwError(403, "Forbidden");
  }

  await prisma.fooditem.delete({ where: { id } });
  return true;
};
