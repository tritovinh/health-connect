import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account }) {
      if (account && account.provider === "google") {
        try {
          const existingAccount = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (existingAccount) {
            await db.account.update({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                access_token: account.access_token,
                refresh_token: account.refresh_token ?? existingAccount.refresh_token,
                expires_at: account.expires_at,
              },
            });
          }
        } catch (error) {
          console.error("Error updating Google account tokens:", error);
        }
      }
      return true;
    },
  },
});