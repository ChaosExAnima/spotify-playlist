import Page from '~/components/page';
import Link from 'next/link';
import { Suspense } from 'react';
import LoadingComponent from '~/components/loading';
import { queryPlaylists, queryProfile } from '~/lib/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextAuth]/router';
import LogIn from '~/components/log-in';

export default async function Home() {
	return (
		<Page header="Spotify Playlist">
			<Suspense fallback={<LoadingComponent />}>
				<UserInfo />
			</Suspense>
			<footer>
				<h2>References</h2>
				<ul>
					<li>
						<a
							href="https://developer.spotify.com/documentation/web-api/reference/"
							rel="noreferrer"
							target="_blank"
						>
							Spotify API
						</a>
					</li>
					<li>
						<a
							href="https://reactrouter.com/en/main/start/overview"
							rel="noreferrer"
							target="_blank"
						>
							React Router
						</a>
					</li>
				</ul>
			</footer>
		</Page>
	);
}

async function UserInfo() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return (
			<p>
				<LogIn />
			</p>
		);
	}
	const user = await queryProfile();
	return (
		<>
			<p>Hi, {user.display_name}!</p>

			<p>
				<Link href="/logout">Log out here</Link>
			</p>
			<Suspense fallback={<LoadingComponent />}>
				<PlaylistPicker />
			</Suspense>
		</>
	);
}

async function PlaylistPicker() {
	const playlists = await queryPlaylists();
	if (!playlists) {
		return null;
	}
	return (
		<>
			<p>Pick a playlist:</p>
			<ul>
				{playlists.items.map((playlist) => (
					<li key={playlist.id}>
						<Link href={`/playlist/${playlist.id}`}>
							{playlist.name}
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
