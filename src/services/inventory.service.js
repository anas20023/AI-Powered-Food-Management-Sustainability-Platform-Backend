import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const listInventory = async ({ userId, category, expiringWithinDays, status, limit = 50, offset = 0 }) => {
  if (!userId) throwError(401, "Unauthorized");
  const id = Number(userId);
  if (isNaN(id)) throwError(401, "Unauthorized");

  const where = { user_id: id };

  if (status) where.status = status;
  if (category) where.fooditem = { category }; // relation field is `fooditem`
  if (expiringWithinDays) {
    const days = Number(expiringWithinDays);
    if (isNaN(days) || days < 0) throwError(400, "expiringWithinDays must be a non-negative number");
    const now = new Date();
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    where.expiry_date = { lte: until }; // supply Date object
  }

  const items = await prisma.inventory.findMany({
    where,
    skip: Number(offset) || 0,
    take: Number(limit) || 50,
    include: { fooditem: true }, // relation name corrected
    orderBy: { expiry_date: "asc" },
  });

  const total = await prisma.inventory.count({ where });
  return { items, total };
};

export const createInventory = async ({ userId, payload }) => {
  const id = Number(userId);
  if (!id || isNaN(id)) throwError(401, "Unauthorized");

  let {
    food_item_id,
    quantity,
    purchased_date,
    expiry_date,
    notes,
    status
  } = payload;

  if (!food_item_id) throwError(400, "food_item_id is required");
  if (quantity === undefined || quantity === null) throwError(400, "quantity is required");

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) throwError(400, "quantity must be a positive number");

  // Check existing inventory for this user + food_item
  const existing = await prisma.inventory.findFirst({
    where: {
      user_id: id,
      food_item_id: Number(food_item_id)
    }
  });

  if (existing) {
    const sum = Number(existing.quantity || 0) + qty;

    const updated = await prisma.inventory.update({
      where: { id: existing.id },
      data: {
        quantity: sum,
        purchased_date: purchased_date ? new Date(purchased_date) : existing.purchased_date,
        expiry_date: expiry_date ? new Date(expiry_date) : existing.expiry_date,
        notes: notes ?? existing.notes,
        status: status ?? existing.status
      }
    });

    return updated;
  }

  // create new - only set dates if provided (avoid Invalid Date)
  const data = {
    user_id: id,
    food_item_id: Number(food_item_id),
    quantity: qty,
    notes: notes ?? null,
  };

  if (purchased_date) data.purchased_date = new Date(purchased_date);
  if (expiry_date) data.expiry_date = new Date(expiry_date);
  if (status) data.status = status;

  const created = await prisma.inventory.create({ data });
  return created;
};

export const updateInventory = async ({ userId, id, updates }) => {
  if (!userId) throwError(401, "Unauthorized");
  const uid = Number(userId);
  if (isNaN(uid)) throwError(401, "Unauthorized");
  const iid = Number(id);
  if (isNaN(iid)) throwError(400, "Invalid inventory id");

  const inv = await prisma.inventory.findUnique({ where: { id: iid } });
  if (!inv) throwError(404, "Inventory item not found");
  if (inv.user_id !== uid) throwError(403, "Forbidden");

  // sanitize updates: convert numeric/date fields if provided
  const data = { ...updates };
  if (data.quantity !== undefined) {
    const q = Number(data.quantity);
    if (isNaN(q) || q < 0) throwError(400, "quantity must be a non-negative number");
    data.quantity = q;
  }
  if (data.purchased_date) data.purchased_date = new Date(data.purchased_date);
  if (data.expiry_date) data.expiry_date = new Date(data.expiry_date);

  const updated = await prisma.inventory.update({ where: { id: iid }, data });
  return updated;
};

export const deleteInventory = async ({ userId, id }) => {
  if (!userId) throwError(401, "Unauthorized");
  const uid = Number(userId);
  if (isNaN(uid)) throwError(401, "Unauthorized");
  const iid = Number(id);
  if (isNaN(iid)) throwError(400, "Invalid inventory id");

  const inv = await prisma.inventory.findUnique({ where: { id: iid } });
  if (!inv) throwError(404, "Inventory item not found");
  if (inv.user_id !== uid) throwError(403, "Forbidden");

  await prisma.inventory.delete({ where: { id: iid } });
  return true;
};
