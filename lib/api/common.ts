import { redirect } from 'next/navigation';
import { APIError } from './errors';
import { db } from '../db';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/app/api/auth/[...nextauth]/route';

type Method = 'GET' | 'POST';
type QueryParams = ConstructorParameters<typeof URLSearchParams>[0];

export async function fetchFromAPI<Result = unknown>(
	url: string,
	method: Method = 'GET',
	headers: HeadersInit = {},
	body?: BodyInit
) {
	const response = await fetch(url, {
		body,
		headers,
		method,
	});
	if (!response.ok) {
		if (response.status === 401) {
			redirect('/api/auth/login/spotify');
		}
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

export async function fetchWithToken<Result = unknown>(
	endpoint: string,
	query: ConstructorParameters<typeof URLSearchParams>[0] = {},
	method: Method = 'GET'
) {
	const token = await getToken();
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

async function getToken() {
	const session = await getServerSession(authOptions);
	return session?.user.token;
}
