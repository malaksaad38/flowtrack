import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Same domain — no baseURL needed in production; set for dev clarity.
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
