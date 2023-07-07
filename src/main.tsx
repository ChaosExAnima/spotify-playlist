import { authorizePKCE } from 'lib/auth.ts';
import PlaylistPage, { loader as playlistLoader } from 'playlist/index.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	RouterProvider,
	createBrowserRouter,
	redirect,
} from 'react-router-dom';

import HomePage, { loader as homeLoader } from './home.tsx';
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
				Component: PlaylistPage,
				loader: playlistLoader,
				path: 'playlist/:playlist',
			},
		],
		loader: homeLoader,
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
