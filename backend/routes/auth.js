import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { z } from "zod";
import { protectroute } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  name: z.string().min(3, "name moet minimaal 3 tekens bevatten"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  role: z.enum(['player', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

router.post("/register", async (req, res) => {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { name, email, password, role } = validation.data;

    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'player';

    const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
        [name, email, hashedPassword, userRole]
    );

    const token = generateToken(newUser.rows[0]);

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ user: newUser.rows[0] });
})

router.post("/login", async (req, res) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { email, password } = validation.data;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(userData);

    res.cookie("token", token, cookieOptions);

    res.json({ id: userData.id, name: userData.name, email: userData.email, role: userData.role });
})

router.get("/me", protectroute, async (req, res) => {
    res.json(req.user);
});

router.post("/logout", (req, res) => {
    res.cookie("token", "", {
        ...cookieOptions,
        maxAge: 1,
    });
    res.json({ message: "Logged out successfully" });
});

// (Admin) Get All Users
router.get("/users", protectroute, requireRole("admin"), async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ message: "Could not fetch users" });
    }
});

// (Admin) Delete User
router.delete("/users/:id", protectroute, requireRole("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({ message: "User deleted" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Could not delete user" });
    }
});

export default router;