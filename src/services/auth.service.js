import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/PrismaClient.js";
import 'dotenv/config'
import { success } from "../utils/response.js";


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const throwError = (status = 400, message = "Error", details = null) => {
  const e = new Error(message);
  e.status = status;
  if (details) e.details = details;
  throw e;
};

export const registerUser = async (payload) => {
  const { full_name, email, password, role, household_size, dietary_preferences, budget_range, location } = payload;

  if (!full_name || !email || !password) throwError(400, "Missing required fields");


  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throwError(409, "Email already registered");

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password_hash,
      role: role ?? null,
      household_size: household_size ?? null,
      dietary_preferences: dietary_preferences ?? null,
      budget_range: budget_range ?? null,
      location: location ?? null,
    },
  });

return;
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throwError(400, "Missing credentials");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throwError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throwError(401, "Invalid credentials");

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } };
};

export const getUserProfile = async (id) => {
  if (!id) throwError(401, "Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      household_size: true,
      dietary_preferences: true,
      budget_range: true,
      location: true,
      created_at: true,
    },
  });

  if (!user) throwError(404, "User not found");
  return user;
};

export const updateUserProfile = async (id, updates) => {
  if (!id) throwError(401, "Unauthorized");

  if(!id || !updates)     throwError(204,"Information Missing !");

  // prevent password updates here LoL :D
  if ("password" in updates) delete updates.password;
  console.log(updates);

  const user = await prisma.user.update({
    where: { id: id },
    data: updates,
  });
  const updated_User=user;
  if("password_hash" in updated_User) delete updated_User.password_hash

  return updated_User;
};

export const changeUserPassword = async (userId, { oldPassword, newPassword }) => {
  const id=parseInt(userId);
  if (!id) throwError(401, "Unknown User! ");

  if (!oldPassword || !newPassword) throwError(400, "Missing passwords");

  if(oldPassword===newPassword) throwError(400,"Old Password Can't be Your new Password !")

  const user = await prisma.user.findUnique({ where: { id:id } });
  if (!user) throwError(404, "User not found");

  const ok = await bcrypt.compare(oldPassword, user.password_hash);
  if (!ok) throwError(401, "Old password is incorrect");

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: id }, data: { password_hash: newHash } });

  return null;
};
