import NextAuth from "next-auth"
import { db } from "./lib/db"
import authConfig from "./auth.config"
import { getUserById } from "./modules/auth/actions"

type UserRole = "ADMIN" | "USER"

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account) return false;

      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
      });

      // ✅ 1. Determine user role (admin if matches env)
      const userRole = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";

      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,
            role: userRole, // ✅ 2. Assign role
            accounts: {
              // @ts-ignore
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refreshToken: account.refresh_token,
                accessToken: account.access_token,
                expiresAt: account.expires_at,
                tokenType: account.token_type,
                scope: account.scope,
                idToken: account.id_token,
                sessionState: account.session_state,
              },
            },
          },
        });

        if (!newUser) return false;
      } else {
        // ✅ 3. Update role if it's the admin account and not already admin
        if (
          user.email === process.env.ADMIN_EMAIL &&
          existingUser.role !== "ADMIN"
        ) {
          await db.user.update({
            where: { email: user.email! },
            data: { role: "ADMIN" },
          });
        }

        // Link social account if not exists
        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (!existingAccount) {
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refreshToken: account.refresh_token,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
              // @ts-ignore
              sessionState: account.session_state,
            },
          });
        }
      }

      return true;
    },

async jwt({ token }) {
  if (!token.sub) return token;

  const existingUser = await getUserById(token.sub);
  if (!existingUser) return token;

  // Properly set all token fields
  token.name = existingUser.name;
  token.email = existingUser.email;
  token.role = existingUser.role; // Make sure this is set
  
  return token;
},

    async session({ session, token }) {
  if (session.user && token) {
    session.user.id = token.sub as string;
    session.user.name = token.name;
    session.user.email = token.email as string;
    session.user.role = token.role as UserRole;
  }
  return session;
}

  },
  session: { strategy: "jwt" },
  ...authConfig,
})
