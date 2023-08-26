import { createCookieSessionStorage, redirect } from '@remix-run/node';

import type { AuthSession } from './auth';

type SessionData = AuthSession;

export type Session = Awaited<ReturnType<typeof sessionFromRequest>>;

const { commitSession, destroySession, getSession } =
	createCookieSessionStorage<SessionData>({
		cookie: {
			// domain: process.env.HOST,
			httpOnly: true,
			maxAge: 60 * 60 * 24, // one day
			name: '__session',
			sameSite: 'lax',
			secrets: [process.env.SECRET],
			secure: true,
		},
	});

export function sessionFromRequest(request: Request) {
	return getSession(request.headers.get('Cookie'));
}

export async function saveSessionHeaders(session: Session) {
	return {
		headers: {
			'Set-Cookie': await commitSession(session),
		},
	};
}

export async function saveSession(session: Session, path = '/') {
	return redirect(path, await saveSessionHeaders(session));
}

export async function deleteSession(request: Request, path = '/') {
	const session = await sessionFromRequest(request);
	return redirect(path, {
		headers: {
			'Set-Cookie': await destroySession(session),
		},
		status: 302,
	});
}
