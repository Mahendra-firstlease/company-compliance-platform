import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const cleanEmail = credentials.email.toLowerCase().trim();

        // 1. Brute-force throttling per login identifier (A04 & A07)
        const rateLimitKey = `auth_login:${cleanEmail}`;
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.auth);

        if (!rateLimit.success) {
          console.warn(`[Security Alert] Rate limit exceeded on login for: ${cleanEmail}`);
          throw new Error("Too many failed login attempts. Please wait 15 minutes before trying again.");
        }

        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!user || !user.passwordHash) {
          console.warn(`[Security Audit] Failed login attempt for non-existent or passwordless account: ${cleanEmail}`);
          throw new Error("Invalid email or password. Please try again.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          console.warn(`[Security Audit] Failed password attempt for account: ${cleanEmail}`);
          throw new Error("Invalid email or password. Please try again.");
        }

        console.log(`[Security Audit] Successful authentication for user: ${user.email} (${user.role})`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CLIENT";
        token.phone = (user as any).phone || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET || process.env.AUTH_SECRET,
};