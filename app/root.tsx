import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';

import styles from '~/index.css';

import type { LinksFunction } from '@remix-run/node';

export default function Root() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					content="width=device-width, initial-scale=1"
					name="viewport"
				/>
				<meta content="#777eff" name="theme-color" />
				<Meta />
				<Links />
				<title>Spotify Playlist</title>
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export const links: LinksFunction = () => {
	return [{ href: styles, rel: 'stylesheet' }];
};
