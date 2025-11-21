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

  let { food_item_id, quantity, purchased_date, expiry_date, notes, status } = payload;

  if (food_item_id === undefined || food_item_id === null) throwError(400, "food_item_id is required");
  if (quantity === undefined || quantity === null) throwError(400, "quantity is required");

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) throwError(400, "quantity must be a positive number");

  // Find the food item (if not found, create a minimal one)
  let foodItem = await prisma.fooditem.findUnique({ where: { id: Number(food_item_id) } });
  if (!foodItem) {
    foodItem = await prisma.fooditem.create({
      data: {
        name: `Item ${food_item_id}`,
        category: "Snacks", // default - pick what makes sense for you
        user_id: id
      }
    });
  }

  // Find existing inventory for this user + food item
  const existingInventory = await prisma.inventory.findFirst({
    where: { user_id: id, food_item_id: foodItem.id }
  });

  // Build a log payload using only fields that exist in the `log` model.
  // Avoid spreading arbitrary `extra` keys into the object.
  const buildLog = ({ title, foodItemId, qtyForLog }) => {
    return {
      log_title: title,
      user_id: id,
      food_item_id: foodItemId ?? null,
      quantity: qtyForLog,
      category: foodItem?.category ?? null,
      logged_at: new Date()
    };
  };

  if (existingInventory) {
    // inventory update payload: only inventory fields
    const inventoryUpdateData = {
      quantity: Number(existingInventory.quantity || 0) + qty,
      purchased_date: purchased_date ? new Date(purchased_date) : existingInventory.purchased_date,
      expiry_date: expiry_date ? new Date(expiry_date) : existingInventory.expiry_date,
      notes: notes ?? existingInventory.notes,
      status: status ?? existingInventory.status
    };

    // build a clear title that includes the added quantity (no unknown keys)
    const logTitle = `Inventory merged (inventoryId=${existingInventory.id}) — added ${qty}, previous ${existingInventory.quantity}, new ${inventoryUpdateData.quantity}`;

    const logPayload = buildLog({
      title: logTitle,
      foodItemId: existingInventory.food_item_id,
      qtyForLog: qty
    });

    // transaction: update inventory and create the log atomically
    const [updatedInventory, createdLog] = await prisma.$transaction([
      prisma.inventory.update({ where: { id: existingInventory.id }, data: inventoryUpdateData }),
      prisma.log.create({ data: logPayload })
    ]);

    return updatedInventory;
  }

  // No existing inventory — create inventory and log
  const inventoryCreateData = {
    user_id: id,
    food_item_id: foodItem.id,
    quantity: qty,
    notes: notes ?? null,
    ...(purchased_date ? { purchased_date: new Date(purchased_date) } : {}),
    ...(expiry_date ? { expiry_date: new Date(expiry_date) } : {}),
    ...(status ? { status } : {})
  };

  const logTitle = `Inventory created (food_item_id=${foodItem.id}) — qty ${qty}`;
  const logPayloadForCreate = buildLog({
    title: logTitle,
    foodItemId: foodItem.id,
    qtyForLog: qty
  });

  const [createdInventory, createdLog] = await prisma.$transaction([
    prisma.inventory.create({ data: inventoryCreateData }),
    prisma.log.create({ data: logPayloadForCreate })
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