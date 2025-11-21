import prisma from "../config/PrismaClient.js";

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const saveUpload = async ({ userId, filename, url, associated_inventory_id, associated_log_id }) => {
  if (!userId) throwError(401, "Unauthorized");
  if (!url) throwError(400, "No URL provided");
  if (!filename) throwError(400, "No filename provided");

  const uid = Number(userId);
  if (Number.isNaN(uid)) throwError(400, "Invalid userId");

  // verify user exists
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) throwError(404, "User not found");

  // verify optional inventory/log if provided
  let invId = associated_inventory_id ?? null;
  if (invId !== null) {
    invId = Number(invId);
    if (Number.isNaN(invId)) throwError(400, "Invalid associated_inventory_id");
    const inv = await prisma.inventory.findUnique({ where: { id: invId } });
    if (!inv) throwError(404, "Associated inventory not found");
  }

  let logId = associated_log_id ?? null;
  if (logId !== null) {
    logId = Number(logId);
    if (Number.isNaN(logId)) throwError(400, "Invalid associated_log_id");
    const log = await prisma.log.findUnique({ where: { id: logId } });
    if (!log) throwError(404, "Associated log not found");
  }

  const upl = await prisma.upload.create({
    data: {
      user_id: uid,
      filename,
      url,
      associated_inventory_id: invId,
      associated_log_id: logId,
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

  await prisma.upload.delete({ where: { id } });
  return true;
};
