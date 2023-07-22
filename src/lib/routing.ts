import { LoaderFunctionArgs, Params, redirect } from 'react-router-dom';

import { getAuthInfo } from './auth';

type QueryLoaderFunc<T> = (args: LoaderFunctionArgs) => Promise<T>;
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
): (args: LoaderFunctionArgs) => Promise<QueryResult<T>> {
	return async (args): Promise<Readonly<QueryResult<T>>> => {
		checkAuth();
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
	};
}

export function checkAuth() {
	const authInfo = getAuthInfo();
	if (!authInfo) {
		throw redirect('/');
	}
	return authInfo;
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
