import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

/**
 * Server-side session helper.
 * Works in Server Components, Route Handlers, and Server Actions.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };
  } catch {
    return null;
  }
}
