import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const code = credentials?.code as string | undefined;
        if (!email || !code) return null;

        const otp = await prisma.emailOtp.findFirst({
          where: { email, code, expires: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp) return null;

        await prisma.emailOtp.deleteMany({ where: { email } });

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, emailVerified: new Date() },
          });
        } else if (!user.emailVerified) {
          user = await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
          });
        }

        return { id: user.id, email: user.email, name: user.name, plan: user.plan };
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
