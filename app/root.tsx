import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteError,
} from '@remix-run/react';

import styles from '~/index.css';

import Page from './components/page';

import type { LinksFunction, V2_MetaFunction } from '@remix-run/node';

export default function Root() {
	return (
		<html lang="en">
			<head>
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

export function ErrorBoundary() {
	const error = useRouteError();
	console.error(error);
	return (
		<html lang="en">
			<head>
				<title>Oh no!</title>
				<Meta />
				<Links />
			</head>
			<body>
				<Page header="Page not found" />
				<Scripts />
			</body>
		</html>
	);
}

export const meta: V2_MetaFunction = () => [
	{ content: 'width=device-width, initial-scale=1', name: 'viewport' },
	{ content: '#777eff', name: 'theme-color' },
	{
		href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎧</text></svg>',
		rel: 'icon',
		tagName: 'link',
	},
];
