import Page from '~/components/page';
import Link from 'next/link';
import { Suspense } from 'react';
import LoadingComponent from '~/components/loading';
import { queryPlaylists, queryProfile } from '~/lib/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import { LogIn, LogOut } from '~/components/auth';

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
					<li>
						<a
							href="https://next-auth.js.org/getting-started"
							rel="noreferrer"
							target="_blank"
						>
							Next Auth
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
				<LogOut />
			</p>
			<Suspense fallback={<LoadingComponent />}>
				<PlaylistPicker />
			</Suspense>
		</>
	);
}

async function PlaylistPicker() {
	const playlists = await queryPlaylists();
	if (!playlists || playlists.items.length === 0) {
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
