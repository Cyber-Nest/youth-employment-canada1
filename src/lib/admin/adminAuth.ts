import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "youth-employment-canada-admin-panel-secret-token";

export function signAdminToken(payload: { email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyAdminToken(token: string): { email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const expectedSignature = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");
    
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest): Promise<{ email: string } | null> {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return null;
    
    const decoded = verifyAdminToken(token);
    if (!decoded || decoded.role !== "admin") return null;
    
    return { email: decoded.email };
  } catch {
    return null;
  }
}
