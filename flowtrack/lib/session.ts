import { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "./auth";

export async function getSession(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("ft_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
