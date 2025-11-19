// /mnt/data/innovatex_bubt_hackathon_part1.docx.pdf
import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

/**
 * Save upload metadata. `file` is multer's file object.
 * We store url = file.path (local path) OR S3 location (if using S3).
 */
export const saveUpload = async ({ userId, file, associated_inventory_id = null, associated_log_id = null }) => {
  if (!userId) throwError(401, "Unauthorized");
  if (!file) throwError(400, "No file provided");

  const filePath = file.path || file.location || null;
  const filename = file.filename || (filePath ? filePath.split("/").pop() : null);

  const upl = await prisma.upload.create({
    data: {
      user_id: userId,
      filename,
      url: filePath,
      mimetype: file.mimetype ?? null,
      size_bytes: file.size ?? null,
      associated_inventory_id: associated_inventory_id ?? null,
      associated_log_id: associated_log_id ?? null,
    },
  });

  return upl;
};

export const getUpload = async (userId, id) => {
  if (!userId) throwError(401, "Unauthorized");
  const u = await prisma.upload.findUnique({ where: { id } });
  if (!u) throwError(404, "Upload not found");
  if (u.user_id !== userId) throwError(403, "Forbidden");
  return u;
};

export const deleteUpload = async (userId, id) => {
  if (!userId) throwError(401, "Unauthorized");
  const u = await prisma.upload.findUnique({ where: { id } });
  if (!u) throwError(404, "Upload not found");
  if (u.user_id !== userId) throwError(403, "Forbidden");

  // deletion of file is best-effort (do not crash on fs error)
  try {
    if (u.url && u.url.startsWith("/")) {
      // local absolute path
      await fs.unlink(u.url).catch(() => {});
    } else if (u.url && u.url.startsWith("./")) {
      await fs.unlink(u.url).catch(() => {});
    }
  } catch (e) {
    // ignore
  }

  await prisma.upload.delete({ where: { id } });
  return true;
};
