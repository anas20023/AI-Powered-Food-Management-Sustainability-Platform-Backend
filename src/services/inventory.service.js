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

  const where = { user_Id: id };

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
  if (quantity === undefined || quantity === null || quantity === 0) throwError(400, "quantity is required");

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) throwError(400, "quantity must be a positive number");

  // Check existing inventory for this user + food_item
  const existing = await prisma.inventory.findFirst({
    where: {
      user_Id: id,
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
    user_Id: id,
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
  if (inv.user_Id !== uid) throwError(403, "Forbidden");

  // Block modifications if inventory is expired
  if (String(inv.status).toLowerCase() === "expired") {
    throwError(400, "Cannot modify an expired inventory item");
  }

  // sanitize updates: convert numeric/date fields if provided
  const data = { ...updates };
  if (data.quantity !== undefined) {
    const q = Number(data.quantity);
    if (isNaN(q) || q < 0) throwError(400, "quantity must be a non-negative number");
    data.quantity = q;
  }
  if (data.purchased_date) data.purchased_date = new Date(data.purchased_date);
  if (data.expiry_date) data.expiry_date = new Date(data.expiry_date);

  // Prepare log details: find food item to get category (best-effort)
  let foodItem = null;
  try {
    if (inv.food_item_id) {
      foodItem = await prisma.fooditem.findUnique({ where: { id: inv.food_item_id } });
    }
  } catch (e) {
    // if lookup fails, continue without category; logging is best-effort
    foodItem = null;
  }

  // Build log entry content
  const logTitle = `Inventory updated (id=${iid})`;
  const logPayload = {
    log_title: logTitle,
    user_Id: uid,
    food_item_id: inv.food_item_id ?? null,
    // store the new quantity if provided, otherwise the previous quantity
    quantity: data.quantity !== undefined ? data.quantity : inv.quantity,
    category: foodItem?.category ?? null,
    // logged_at, created_at will default in DB / Prisma
  };

  // Use a transaction so update + log are atomic
  const [updated] = await prisma.$transaction([
    prisma.inventory.update({ where: { id: iid }, data }),
    prisma.log.create({ data: logPayload })
  ]);

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
  if (inv.user_Id !== uid) throwError(403, "Forbidden");

  // Block deletion if inventory is expired
  if (String(inv.status).toLowerCase() === "expired") {
    throwError(400, "Cannot delete an expired inventory item");
  }

  // Best-effort fetch of food item for category in the log
  let foodItem = null;
  try {
    if (inv.food_item_id) {
      foodItem = await prisma.fooditem.findUnique({ where: { id: inv.food_item_id } });
    }
  } catch (e) {
    foodItem = null;
  }

  const logPayload = {
    log_title: `Inventory deleted (id=${iid})`,
    user_Id: uid,
    food_item_id: inv.food_item_id ?? null,
    quantity: inv.quantity ?? 0,
    category: foodItem?.category ?? null,
  };

  // Transaction: create log then delete inventory
  await prisma.$transaction([
    prisma.log.create({ data: logPayload }),
    prisma.inventory.delete({ where: { id: iid } })
  ]);

  return true;
};
export const refreshInventory = async (user_Id) => {
  console.log(user_Id);
  const res = await prisma.user.findUnique({
    where: {
      id: user_Id
    }
  })
  if(!res) throwError(400,"User Not Found !")
  const data = await prisma.inventory.findMany({
      where:{
        user_id:user_Id
      }
  })
  for (const item of data) {
    if (item.status!=="Expired" && item.expiry_date && new Date(item.expiry_date) <= new Date()) {
      await prisma.inventory.update({
        where: { id: item.id },
        data: { status: "Expired" }
      });
    }
  }

}