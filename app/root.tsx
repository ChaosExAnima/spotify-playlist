import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import React from 'react';

export default function Root() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<link href="/favicon.ico" rel="icon" />
				<meta
					content="width=device-width, initial-scale=1"
					name="viewport"
				/>
				<meta content="#777eff" name="theme-color" />
				<link href="/manifest.json" rel="manifest" />
				<Links />
				<Meta />
				<title>Spotify Playlist</title>
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
