import type { JWT } from "next-auth/jwt";

// Refesh the access token when google reject
export async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
	try {
		if (!token.refreshToken) {
			throw new Error("No refresh token available");
		}

		const response = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: process.env.AUTH_GOOGLE_ID!,
				client_secret: process.env.AUTH_GOOGLE_SECRET!,
				grant_type: "refresh_token",
				refresh_token: token.refreshToken,
			}),
		});

		const refreshedTokens = await response.json();

		if (!response.ok) {
			console.error("Google token refresh failed:", refreshedTokens);
			return {
				...token,
				error: "RefreshAccessTokenError",
			};
		}

		return {
			...token,
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 3600) * 1000,
			// Use old one if the new one isn't available
			refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
			error: undefined,
		};
	} catch (error) {
		console.error("Error refreshing Google access token:", error);
		return {
			...token,
			error: "RefreshAccessTokenError",
		};
	}
}