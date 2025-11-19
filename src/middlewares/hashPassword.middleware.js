import bcrypt from "bcrypt";

export const hashPassword = async (req, res, next) => {
  try {
    if (!req.body.password) {
      return next();
    }
    const saltRounds = 10;
    const hashed = await bcrypt.hash(req.body.password, saltRounds);
    req.body.password = hashed;
    next();
  } catch (error) {
    console.error("Password hashing failed:", error);
    res.status(500).json({ message: "Internal server error while hashing password" });
  }
};
