'use client';

import { signIn, signOut } from 'next-auth/react';

export function LogIn() {
	return <button onClick={() => signIn('spotify')}>Log in</button>;
}

export function LogOut() {
	return <button onClick={() => signOut()}>Log out</button>;
}
