import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const listInventory = async ({ userId }) => {
  if (!userId) throwError(401, "Unauthorized");
  const id = Number(userId);
  if (isNaN(id)) throwError(401, "Unauthorized");

  const items = await prisma.inventory.findMany({
    where: { user_id: id },
    include: { fooditem: true }
  });

  return items;
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

  // Best-effort: fetch food item to record category in logs
  let foodItem = null;
  try {
    foodItem = await prisma.fooditem.findUnique({ where: { id: Number(food_item_id) } });
  } catch (e) {
    foodItem = null;
  }

  // Check existing inventory for this user + food_item
  const existing = await prisma.inventory.findFirst({
    where: {
      user_id: id,
      food_item_id: Number(food_item_id)
    }
  });

  // Log builder helper
  const buildLogPayload = ({ title, userIdForLog, foodItemId, qtyForLog, category, extra = {} }) => ({
    log_title: title,
    user_Id: userIdForLog,            // keep your existing log field name
    food_item_id: foodItemId ?? null,
    quantity: qtyForLog,
    category: category ?? null,
    ...extra
  });

  if (existing) {
    // Merge into existing inventory: increase quantity
    const newQuantity = Number(existing.quantity || 0) + qty;

    const updateData = {
      quantity: newQuantity,
      purchased_date: purchased_date ? new Date(purchased_date) : existing.purchased_date,
      expiry_date: expiry_date ? new Date(expiry_date) : existing.expiry_date,
      notes: notes ?? existing.notes,
      status: status ?? existing.status
    };

    const logPayload = buildLogPayload({
      title: `Inventory added (merged) (id=${existing.id})`,
      userIdForLog: id,
      foodItemId: existing.food_item_id,
      qtyForLog: newQuantity,
      category: foodItem?.category ?? existing.category ?? null,
      extra: { added_quantity: qty } // helpful to see how much was added
    });

    // Atomic update + log
    const [updatedInventory] = await prisma.$transaction([
      prisma.inventory.update({ where: { id: existing.id }, data: updateData }),
      prisma.log.create({ data: logPayload })
    ]);

    return updatedInventory;
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

  const logPayload = buildLogPayload({
    title: `Inventory created`,
    userIdForLog: id,
    foodItemId: Number(food_item_id),
    qtyForLog: qty,
    category: foodItem?.category ?? null,
    extra: { created: true }
  });

  // Atomic create inventory + log
  const [createdInventory] = await prisma.$transaction([
    prisma.inventory.create({ data }),
    prisma.log.create({ data: logPayload })
  ]);

  return createdInventory;
};

export const updateInventory = async ({ userId, id, updates }) => {
  if (!userId) throwError(401, "Unauthorized");
  const uid = Number(userId);
  if (isNaN(uid)) throwError(401, "Unauthorized");

  const iid = Number(id);
  if (isNaN(iid)) throwError(400, "Invalid inventory id");

  // Fetch current inventory
  const inv = await prisma.inventory.findUnique({ where: { id: iid } });
  if (!inv) throwError(404, "Inventory item not found");
  if (inv.user_id !== uid) throwError(403, "Forbidden");

  // Block modifications if inventory is expired
  if (String(inv.status).toLowerCase() === "expired") {
    throwError(400, "Cannot modify an expired inventory item");
  }

  // Whitelist scalar fields only
  const allowedFields = ['quantity', 'purchased_date', 'expiry_date', 'notes', 'status'];
  const raw = updates || {};
  const candidate = {};

  for (const f of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(raw, f)) {
      candidate[f] = raw[f];
    }
  }

  // Validate / sanitize quantity if present
  if (candidate.quantity !== undefined) {
    const q = Number(candidate.quantity);
    const currentQty = Number(inv.quantity || 0);
    if (isNaN(q) || q < 0 || q > currentQty) {
      throwError(400, `quantity must be a number between 0 and ${currentQty}`);
    }
    candidate.quantity = q;
  }

  // Validate / sanitize dates
  if (candidate.purchased_date !== undefined) {
    const pd = new Date(candidate.purchased_date);
    if (isNaN(pd.getTime())) throwError(400, "Invalid purchased_date");
    candidate.purchased_date = pd;
  }
  if (candidate.expiry_date !== undefined) {
    const ed = new Date(candidate.expiry_date);
    if (isNaN(ed.getTime())) throwError(400, "Invalid expiry_date");
    candidate.expiry_date = ed;
  }

  // Best-effort: fetch fooditem to get category and cost_per_unit (if any)
  let foodItem = null;
  try {
    if (inv.food_item_id) {
      foodItem = await prisma.fooditem.findUnique({ where: { id: inv.food_item_id } });
    }
  } catch (e) {
    foodItem = null;
  }

  // Determine consumption (only when quantity decreased) and only if food_item_id exists
  let consumptionNeeded = false;
  let consumedQuantity = 0;
  if (candidate.quantity !== undefined && inv.food_item_id) {
    const currentQty = Number(inv.quantity || 0);
    const newQty = Number(candidate.quantity);
    if (newQty < currentQty) {
      consumptionNeeded = true;
      consumedQuantity = currentQty - newQty;
    }
  }

  // Build consumption payload (guarded by consumptionNeeded)
  let consumptionPayload = null;
  if (consumptionNeeded) {
    // Use fooditem.cost_per_unit if available (schema: fooditem.cost_per_unit Int?), else fallback to 0.
    const perUnitCost =
      foodItem && typeof foodItem.cost_per_unit !== "undefined" && foodItem.cost_per_unit !== null
        ? Number(foodItem.cost_per_unit)
        : 0;

    const totalCost = Math.round(perUnitCost * consumedQuantity);

    // consumption.food_item_id is non-nullable in your schema, so use inv.food_item_id (guarded above)
    consumptionPayload = {
      user_id: uid,
      food_item_id: inv.food_item_id,
      cost: totalCost,
      quantity: consumedQuantity,
      category: foodItem?.category ?? null, // consumption.category is VarChar(36)
    };
  }

  // Build log payload using schema field names; include consumed_quantity for audit clarity
  const logPayload = {
    log_title: `Inventory updated (id=${iid})`,
    user_id: uid,
    food_item_id: inv.food_item_id ?? null,
    quantity: candidate.quantity !== undefined ? candidate.quantity : inv.quantity,
    category: foodItem?.category ?? null,
    // you can add an extra field if your log model supports JSON or extra fields
  };

  // Build updateData with only scalar fields (so Prisma doesn't expect relations)
  const updateData = {};
  if (candidate.quantity !== undefined) updateData.quantity = candidate.quantity;
  if (candidate.purchased_date !== undefined) updateData.purchased_date = candidate.purchased_date;
  if (candidate.expiry_date !== undefined) updateData.expiry_date = candidate.expiry_date;
  if (candidate.notes !== undefined) updateData.notes = candidate.notes;
  if (candidate.status !== undefined) updateData.status = candidate.status;

  // Nothing to update
  if (Object.keys(updateData).length === 0) return inv;

  // Transaction: update inventory, create log, optionally create consumption
  const tx = [
    prisma.inventory.update({ where: { id: iid }, data: updateData }),
    prisma.log.create({ data: logPayload })
  ];
  if (consumptionNeeded && consumptionPayload) {
    tx.push(prisma.consumption.create({ data: consumptionPayload }));
  }

  const results = await prisma.$transaction(tx);
  const updatedInventory = results[0];
  return updatedInventory;
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
  //console.log(user_Id);
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