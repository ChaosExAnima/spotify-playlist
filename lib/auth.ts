import { redirect } from 'next/navigation';
import { APIError, fetchAuthInfo, fetchRefreshedAuth } from './api';
import { url } from './routing';
import { cookies } from 'next/headers';
import { isPlainObject, objectHasKeys } from './types';

// All taken from https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

const TOKEN_SESSION_KEY = 'token';
const VERIFIER_SESSION_KEY = 'verifier';

export interface AuthInfo {
	access: string;
	expires: number;
	refresh: string;
}

export interface AuthSession {
	[TOKEN_SESSION_KEY]?: AuthInfo;
	[VERIFIER_SESSION_KEY]?: string;
}

export let token: string | null = null;

export async function getToken() {
	if (token) {
		return token;
	}
	const authInfo = getAuthInfo();
	if (!authInfo) {
		return null;
	}
	if (authInfo.expires < Date.now()) {
		token = authInfo.access;
		return token;
	} else {
		const newAuthInfo = await fetchRefreshedAuth(authInfo);
		cookies().set(TOKEN_SESSION_KEY, JSON.stringify(newAuthInfo));
		return getToken();
	}
}

export function logIn() {
	const url = getAuthRedirectUrl();
	return redirect(url);
}

export function logOut() {
	cookies().delete(TOKEN_SESSION_KEY);
}

export async function handleLoginCode(request: Request) {
	const code = getRedirectCode(request);
	if (!code) {
		return false;
	}
	try {
		const authInfo = await fetchAuthInfo(code);
		if (isAuthInfo(authInfo)) {
			cookies().set(TOKEN_SESSION_KEY, JSON.stringify(authInfo));
			return true;
		}
	} catch (err) {
		if (err instanceof APIError) {
			const json = await err.response.json();
			console.log(json);
		}
	}
	return false;
}

function isAuthInfo(value: unknown): value is AuthInfo {
	return objectHasKeys(value, ['access', 'expires', 'refresh']);
}

function getAuthInfo() {
	const rawAuthInfo = cookies().get(TOKEN_SESSION_KEY);
	if (!rawAuthInfo || !rawAuthInfo.value) {
		return null;
	}
	const authInfo = JSON.parse(rawAuthInfo.value);
	if (isAuthInfo(authInfo)) {
		return authInfo;
	}
	return null;
}

/**
 * @returns The current redirect code
 */
function getRedirectCode(request: Request) {
	const params = new URL(request.url).searchParams;

	const code = params.get('code');
	const state = params.get('state');
	if (state === process.env.STATE) {
		return code;
	}
}

function getAuthRedirectUrl() {
	if (!process.env.CLIENT_ID || !process.env.STATE) {
		throw new Error('Env not set!');
	}
	const params = new URLSearchParams({
		client_id: process.env.CLIENT_ID,
		redirect_uri: url('/login'),
		response_type: 'code',
		scope: 'playlist-read-private',
		state: process.env.STATE,
	});
	return `https://accounts.spotify.com/authorize?${params}`;
}
