import NextAuth, { DefaultSession } from 'next-auth';

export type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

declare global {
	interface ObjectConstructor {
		entries<T extends object>(o: T): Entries<T>;
		keys<T>(o: T): (keyof T)[];
	}
}
namespace NodeJS {
	interface ProcessEnv {
		readonly CLIENT_ID: string;
		readonly CLIENT_SECRET: string;
	}
}

declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			/** Oauth access token */
			token?: accessToken;
		} & DefaultSession['user'];
	}
}
