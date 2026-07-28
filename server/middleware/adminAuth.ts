import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Extend Express Request to include admin user info
export interface AdminRequest extends Request {
  admin?: { username: string; role: string };
}

/**
 * Admin Login Handler
 * POST /api/admin/login
 * Expects { username, password } in body
 * Returns JWT token on success
 */
export async function handleAdminLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const trimmedUsername = String(username).trim();
    const trimmedPassword = String(password).trim();

    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ error: "Username and password cannot be empty." });
    }

    // Validate against environment variables
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const jwtSecret = process.env.JWT_SECRET || "convertoneai-jwt-secret-change-in-production-k8x9m2v4";
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";

    if (trimmedUsername !== adminUsername) {
      console.warn(`[Admin Auth] Failed login attempt for username: ${trimmedUsername}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Verify password - support both bcrypt hashed and plain text
    let passwordValid = false;
    if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$") || adminPassword.startsWith("$2y$")) {
      // It's a bcrypt hash
      passwordValid = await bcrypt.compare(trimmedPassword, adminPassword);
    } else {
      // Direct comparison for plain text (used in development)
      passwordValid = trimmedPassword === adminPassword;
    }

    if (!passwordValid) {
      console.warn(`[Admin Auth] Failed login attempt (wrong password) for username: ${trimmedUsername}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }


    const token = jwt.sign(
      { username: adminUsername, role: "admin" },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    console.log(`[Admin Auth] Successful login for admin user: ${adminUsername}`);

    res.json({
      success: true,
      token,
      message: "Authentication successful."
    });
  } catch (error) {
    console.error("[Admin Auth] Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * JWT Authentication Middleware
 * Validates Bearer token from Authorization header
 */
export function requireAdminAuth(req: AdminRequest, res: Response, next: NextFunction) {
  const jwtSecret = process.env.JWT_SECRET || "convertoneai-jwt-secret-change-in-production-k8x9m2v4";

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No authorization header provided." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Unauthorized: Invalid authorization format. Use: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, jwtSecret) as { username: string; role: string };

    // Explicitly check for admin role in the token payload
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges." });
    }

    req.admin = { username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Unauthorized: Token has expired." });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    return res.status(401).json({ error: "Unauthorized: Authentication failed." });
  }
}

/**
 * Generate a bcrypt hash for a given password (utility for setup)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
