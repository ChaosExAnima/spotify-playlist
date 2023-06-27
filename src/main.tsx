import {
	authorizePKCE,
	fetchAuthInfo,
	getAuthInfo,
	getRedirectCode,
} from 'lib/auth.ts';
import { queryPlaylists, queryProfile } from 'lib/query.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	RouterProvider,
	createBrowserRouter,
	redirect,
} from 'react-router-dom';

import App from './App.tsx';
import './index.css';

const router = createBrowserRouter([
	{
		children: [
			{
				loader: async () => {
					throw redirect(await authorizePKCE());
				},
				path: '/login',
			},
		],
		element: <App />,
		loader: async () => {
			const authInfo = getAuthInfo();
			if (authInfo) {
				const [user, playlists] = await Promise.all([
					queryProfile(),
					queryPlaylists(),
				]);
				return { playlists, user };
			}

			if (!getRedirectCode()) {
				return null;
			}
			const codeVerifier = localStorage.getItem('code_verifier');
			await fetchAuthInfo(codeVerifier);
			localStorage.removeItem('code_verifier');
			throw redirect('/');
		},
		path: '/',
	},
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
