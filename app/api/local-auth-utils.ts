import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.APP_SECRET || "decisionpilot-secret-key";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId, type: "local" }, JWT_SECRET, { expiresIn: "30d" });
}

export async function verifyLocalToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      clockTolerance: 60,
    }) as { userId: number; type: string };

    if (decoded.type !== "local") return null;

    const db = getDb();
    const user = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, decoded.userId))
      .limit(1);

    return user[0] || null;
  } catch {
    return null;
  }
}
