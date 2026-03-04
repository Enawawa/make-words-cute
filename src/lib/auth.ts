import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtpToken } from "./otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || "";
        const code = (credentials?.code as string) || "";
        const token = (credentials?.token as string) || "";

        if (!email || !code || !token) return null;
        if (!verifyOtpToken(token, email, code)) return null;

        const name = email.split("@")[0];
        return { id: email, email, name, plan: "free" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan || "free";
      }
      if (trigger === "update" && session?.plan) {
        token.plan = session.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = (token.plan as string) || "free";
      }
      return session;
    },
  },
});
