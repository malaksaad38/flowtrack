import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  advanced: {
    database: {
      generateId: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Better Auth uses /api/auth/* by default — matches our existing route layout
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});

export type Session = typeof auth.$Infer.Session;
