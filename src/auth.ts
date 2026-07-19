import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: {},
      },
      authorize: async (credentials) => {
        const password = credentials?.password as string;
        if (!password) return null;

        const passwordHash = process.env.OWNER_PASSWORD_HASH;
        if (!passwordHash) {
          console.error("OWNER_PASSWORD_HASH env var not set");
          return null;
        }

        const valid = await bcrypt.compare(password, passwordHash);
        if (!valid) return null;

        return { id: "owner", name: "Owner" };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: {
    signIn: "/workspace/login",
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/workspace") ||
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/api/workspace") ||
        nextUrl.pathname.startsWith("/api/blog/admin");

      if (isProtected && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
});
