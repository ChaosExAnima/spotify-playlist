import {
	authorizePKCE,
	fetchAuthInfo,
	getAuthInfo,
	getRedirectCode,
} from 'lib/auth.ts';
import PlaylistsPage from 'lib/playlists.tsx';
import { queryPlaylist, queryPlaylists, queryProfile } from 'lib/query.ts';
import { getParamOrThrow, loadWithAuth } from 'lib/routing.ts';
import PlaylistPage from 'playlist/index.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	LoaderFunctionArgs,
	RouterProvider,
	createBrowserRouter,
	redirect,
} from 'react-router-dom';

import HomePage from './home.tsx';
import './index.css';

const router = createBrowserRouter([
	{
		Component: HomePage,
		children: [
			{
				loader: async () => {
					throw redirect(await authorizePKCE());
				},
				path: 'login',
			},
			{
				Component: PlaylistsPage,
				loader: loadWithAuth({
					playlists: queryPlaylists(),
					user: queryProfile(),
				}),
				path: 'playlist',
			},
			{
				Component: PlaylistPage,
				loader: loadWithAuth({
					playlist: ({ params }: LoaderFunctionArgs) =>
						queryPlaylist(getParamOrThrow('playlistId', params)),
				}),
				path: 'playlist/:playlist',
			},
		],
		loader: async () => {
			const authInfo = getAuthInfo();
			if (authInfo) {
				throw redirect('/playlist');
			}
			if (!getRedirectCode()) {
				return null;
			}
			const codeVerifier = localStorage.getItem('code_verifier');
			if (!codeVerifier) {
				return null;
			}
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

if (import.meta.hot) {
	import.meta.hot.dispose(() => router.dispose());
}
