// /mnt/data/innovatex_bubt_hackathon_part1.docx.pdf
import * as uploadsService from "../services/uploads.service.js";
import { success, error as sendError } from "../utils/response.js";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { associated_inventory_id, associated_log_id } = req.body;
    const upl = await uploadsService.saveUpload({ userId: req.user?.id, file, associated_inventory_id, associated_log_id });
    return success(res, upl, "Upload saved", 201);
  } catch (err) {
    return sendError(res, err.message || "Upload failed", err.status || 500);
  }
};

export const getUploadById = async (req, res) => {
  try {
    const u = await uploadsService.getUpload(req.user?.id, req.params.id);
    return success(res, u, "Upload fetched", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};

export const deleteUpload = async (req, res) => {
  try {
    await uploadsService.deleteUpload(req.user?.id, req.params.id);
    return success(res, null, "Upload deleted", 200);
  } catch (err) {
    return sendError(res, err.message || "Failed", err.status || 500);
  }
};
