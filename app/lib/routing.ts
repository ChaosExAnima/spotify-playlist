import { redirect } from '@remix-run/node';

import { isLoggedIn } from './auth';

import type { LoaderArgs } from '@remix-run/node';
import type { Params } from '@remix-run/react';

type QueryLoaderFunc<T> = (args: LoaderArgs) => Promise<T>;
type QueryMap<T> = {
	[K in keyof T]: T[K] extends QueryLoaderFunc<infer U>
		? QueryLoaderFunc<U>
		: T[K] extends Promise<infer V>
		? Promise<V>
		: T[K];
};
type QueryResult<T> = {
	[K in keyof T]: T[K] extends QueryLoaderFunc<infer U>
		? U
		: T[K] extends Promise<infer V>
		? V
		: T[K];
};

export function loadWithAuth<T>(
	queries: Readonly<QueryMap<T>>
): (args: LoaderArgs) => Promise<QueryResult<T>> {
	return async (args): Promise<Readonly<QueryResult<T>>> => {
		checkAuth();
		try {
			const results: Partial<QueryResult<T>> = {};
			for (const key in queries) {
				const query = queries[key];
				if (query instanceof Function) {
					results[key] = await query(args);
				} else {
					results[key] = await (query as Promise<
						QueryResult<T>[typeof key]
					>);
				}
			}
			return results as QueryResult<T>;
		} catch (err) {
			throw new Response(String(err), { status: 500 });
		}
	};
}

export function checkAuth() {
	if (!isLoggedIn()) {
		throw redirect('/');
	}
}

export function getParamOrThrow(
	key: string,
	params: Params,
	status = 404
): string {
	if (!params[key]) {
		throw new Response('', { status });
	}
	return params[key];
}
