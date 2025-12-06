import express from "express";
import jwt from "jsonwebtoken";
import User from "../Models/User.model.js";
import { auth, isAdmin } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  console.log("Login API called"); // debug
  console.log("Received body:", req.body);

  try {
    const { userId, password } = req.body;
    console.log("Finding user:", userId);

    const user = await User.findOne({ userId });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin creates new user
router.post("/create-user", auth, isAdmin, async (req, res) => {
  try {
    const { userId, password, role = "user" } = req.body;

    const exists = await User.findOne({ userId });
    if (exists)
      return res.status(400).json({ message: "UserId already exists" });

    const newUser = await User.create({ userId, password, role });

    res.status(201).json({
      message: "User created",
      user: {
        id: newUser._id,
        userId: newUser.userId,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
