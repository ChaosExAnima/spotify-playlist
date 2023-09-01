import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import SpotifyProvider from 'next-auth/providers/spotify';
import { db } from '~/lib/db';

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(db),
	providers: [
		SpotifyProvider({
			clientId: process.env.CLIENT_ID as string,
			clientSecret: process.env.CLIENT_SECRET as string,
		}),
	],
	debug: true,
	callbacks: {
		async session({ session, user }) {
			const getToken = await db.account.findFirst({
				where: {
					userId: user.id,
				},
			});

			let accessToken: string | null = null;
			if (getToken) {
				accessToken = getToken.access_token;
			}

			session.user.token = accessToken;
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
