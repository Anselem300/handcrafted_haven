// src/lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

export interface JwtPayload {
  id: number;
  email: string;
}

// Hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// ✅ Read token from cookies (server-side)
export async function getUserFromRequest(): Promise<JwtPayload | null> {
  const cookieStore = await cookies(); // async now
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return typeof decoded === "object" && decoded !== null
      ? (decoded as JwtPayload)
      : null;
  } catch {
    return null;
  }
}
