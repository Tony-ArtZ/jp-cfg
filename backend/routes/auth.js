import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { createToken } from "../utils/jwt_handler.js";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

router.post("/register", async (req, res) => {
  const { name, email, password, age } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        age,
      })
      .returning()
      .execute();
    const token = createToken({ id: newUser[0].id });
    res.cookie("token", token, { httpOnly: true });
    // Return user data without password
    const { password: _, ...userData } = newUser[0];
    res.json({
      message: "Registration successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const token = createToken({ id: req.user.id });
    res.cookie("token", token, { httpOnly: true });
    // Return user data without password
    const { password, ...userData } = req.user;
    res.json({
      message: "Login successful",
      user: userData,
    });
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    const token = createToken({ id: req.user.id });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  }
);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userData } = user[0];
    res.json({ user: userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

export default router;
