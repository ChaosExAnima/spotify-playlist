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
