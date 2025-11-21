import * as resourceService from "../services/resource.service.js";
import { success, error } from "../utils/response.js";

export const getResources = async (req, res) => {
    try {
        const items = await resourceService.listResources();
        success(res, items, "Resources Fetched Successfully!", 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

export const getResourceById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return error(res, "Invalid id", 400);
        const item = await resourceService.getResourceById(id);
        if (!item) return error(res, "Resource not found", 404);
        return success(res, item, "Resource fetched successfully", 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

export const createResource = async (req, res) => {
    try {
        const { title, description, url, related_category, type } = req.body;
        if (!title || typeof title !== "string") {
            return error(res, "title is required and must be a string", 400);
        }
        if (!url || typeof url !== "string") {
            return error(res, "url is required and must be a string", 400);
        }

        const payload = {
            title,
            description: description ?? null,
            url,
            related_category: related_category ?? null,
            type: type ?? null,
            ownerId: req.user?.id ?? null,
        };

        const created = await resourceService.createResource(payload);
        return success(res, created, "Resource created successfully", 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

export const updateResource = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return error(res, "Invalid id", 400);

        const { title, description, url, related_category, type } = req.body;
        if (title !== undefined && typeof title !== "string") {
            return error(res, "title must be a string", 400);
        }
        if (url !== undefined && typeof url !== "string") {
            return error(res, "url must be a string", 400);
        }

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (url !== undefined) updates.url = url;
        if (related_category !== undefined) updates.related_category = related_category;
        if (type !== undefined) updates.type = type;

        const updated = await resourceService.updateResource(id, updates);
        if (!updated) return error(res, "Resource not found", 404);
        return success(res, updated, "Resource updated successfully", 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

export const deleteResource = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return error(res, "Invalid id", 400);
        const deleted = await resourceService.deleteResource(id);
        if (!deleted) return error(res, "Resource not found", 404);
        return success(res, null, "Resource deleted successfully", 204);
    } catch (err) {
        return error(res, err.message, 400);
    }
};
