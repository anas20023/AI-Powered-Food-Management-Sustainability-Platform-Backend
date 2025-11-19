import * as foodService from "../services/fooditem.service.js";
import { success, error as sendError } from "../utils/response.js";

export const getFoodItems = async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    const result = await foodService.listFoodItems({ category, search, limit, offset });
    return success(res, result, "Food items fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const getFoodItemById = async (req, res) => {
  try {
    const item = await foodService.getFoodItem(req.params.id);
    return success(res, item, "Food item fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const createFoodItem = async (req, res) => {
  try {
    const item = await foodService.createFoodItem(req.body);
    return success(res, item, "Food item created", 201);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const updateFoodItem = async (req, res) => {
  try {
    const item = await foodService.updateFoodItem(req.params.id, req.body);
    return success(res, item, "Food item updated", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const removeFoodItem = async (req, res) => {
  try {
    await foodService.deleteFoodItem(req.params.id);
    return success(res, null, "Food item deleted", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};
