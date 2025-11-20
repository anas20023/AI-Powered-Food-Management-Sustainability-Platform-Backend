import * as foodService from "../services/fooditem.service.js";
import { success, error as sendError } from "../utils/response.js";

// GET /food-items
export const getFoodItems = async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    const userId = req.user.id;

    const result = await foodService.listFoodItems({
      category,
      search,
      limit: Number(limit),
      offset: Number(offset),
      userId,
    });

    return success(res, result, "Food items fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

// GET /food-items/:id
export const getFoodItemById = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const item = await foodService.getFoodItem(itemId, userId);
    return success(res, item, "Food item fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

// POST /food-items
export const createFoodItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const item = await foodService.createFoodItem({
      ...req.body,
      user_id: userId,
    });

    return success(res, item, "Food item created", 201);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

// PUT /food-items/:id
export const updateFoodItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const item = await foodService.updateFoodItem(itemId, req.body, userId);
    return success(res, item, "Food item updated", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

// DELETE /food-items/:id
export const removeFoodItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    await foodService.deleteFoodItem(itemId, userId);

    return success(res, null, "Food item deleted", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};
