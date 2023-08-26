import { getToken } from '../auth';
import { APIError } from './errors';

type Method = 'GET' | 'POST';
type QueryParams = ConstructorParameters<typeof URLSearchParams>[0];

export async function fetchFromAPI<Result = unknown>(
	url: string,
	method: Method,
	headers: HeadersInit = {},
	body?: BodyInit
) {
	const response = await fetch(url, {
		body,
		headers,
		method,
	});
	if (!response.ok) {
		throw new APIError(`Got error from API: ${response.status}`, response);
	}
	return response.json() as Result;
}

export function fetchWithBasic<Result = unknown>(
	endpoint: string,
	method: Method = 'GET',
	query: QueryParams
): Promise<Result> {
	const params = new URLSearchParams(query);
	const auth = Buffer.from(
		`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
	).toString('base64');
	return fetchFromAPI<Result>(
		`https://accounts.spotify.com/api${endpoint}?${params}`,
		method,
		{
			Authorization: `Basic ${auth}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	);
}

export function fetchWithToken<Result = unknown>(
	endpoint: string,
	method: Method = 'GET',
	query: ConstructorParameters<typeof URLSearchParams>[0] = {}
) {
	const token = getToken();
	if (!token) {
		throw new Error('No auth info found');
	}
	const params = new URLSearchParams(query);
	let url = `https://api.spotify.com/v1${endpoint}`;
	if (method === 'GET') {
		url += `?${params}`;
	}
	return fetchFromAPI<Result>(
		url,
		method,
		{
			Authorization: `Bearer ${token}`,
		},
		method === 'POST' ? params : undefined
	);
}
