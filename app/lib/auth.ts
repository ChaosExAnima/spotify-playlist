import { redirect } from 'remix-typedjson';

import { APIError, fetchAuthInfo, fetchRefreshedAuth } from './api';
import { url } from './routing';
import { saveSession, sessionFromRequest } from './session';

import type { Session } from './session';

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

export let token: string = null;

export function getToken() {
	return token;
}

export async function setToken(session: Session) {
	const authInfo = getAuthInfo(session);
	if (!authInfo) {
		return;
	}
	if (authInfo.expires < Date.now()) {
		token = authInfo.access;
		return;
	}
	try {
		const newAuthInfo = await fetchRefreshedAuth(authInfo);
		session.set(TOKEN_SESSION_KEY, newAuthInfo);
		token = newAuthInfo.access;
	} catch (err) {}
}

export function isLoggedIn() {
	return !!token;
}

export function logIn() {
	const url = getAuthRedirectUrl();
	return redirect(url, { status: 302 });
}

export async function handleLoginCode(request: Request) {
	if (!getRedirectCode(request)) {
		return false;
	}
	const session = await sessionFromRequest(request);
	try {
		const authInfo = await fetchAuthInfo(getToken());
		if (authInfo) {
			session.set(TOKEN_SESSION_KEY, authInfo);
		}
	} catch (err) {
		if (err instanceof APIError) {
			const json = await err.response.json();
			console.log(json);
		}
	}
	return saveSession(session);
}

function getAuthInfo(session: Session) {
	if (session.has(TOKEN_SESSION_KEY)) {
		const authInfo = session.get(TOKEN_SESSION_KEY);
		if ('access' in authInfo && 'expires' in authInfo) {
			return authInfo;
		}
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
