import * as inventoryService from "../services/inventory.service.js";
import { success, error as sendError } from "../utils/response.js";

export const getInventory = async (req, res) => {
  try {
    const { category, expiringWithinDays, status, limit, offset } = req.query;
    const result = await inventoryService.listInventory({ userId: req.user?.id, category, expiringWithinDays, status, limit, offset });
    return success(res, result, "Inventory fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const inv = await inventoryService.createInventory({ userId: req.user?.id, payload: req.body });
    return success(res, inv, "Inventory item created", 201);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const inv = await inventoryService.updateInventory({ userId: req.user?.id, id: req.params.id, updates: req.body });
    return success(res, inv, "Inventory item updated", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    await inventoryService.deleteInventory({ userId: parseInt(req.user?.id), id: parseInt(req.params.id) });
    return success(res, null, "Inventory item deleted", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};
