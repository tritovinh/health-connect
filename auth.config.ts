import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { refreshGoogleAccessToken } from "@/lib/auth-token";

export default {
  providers: [
    Google({
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
            "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
            "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/leaderboard") ||
        nextUrl.pathname.startsWith("/challenges") ||
        nextUrl.pathname.startsWith("/activity");

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },

    // Reset access token every hour
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
        };
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;