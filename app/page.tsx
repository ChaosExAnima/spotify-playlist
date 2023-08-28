import Page from '~/components/page';
import Link from 'next/link';
import { Suspense } from 'react';
import LoadingComponent from '~/components/loading';
import { queryPlaylists, queryProfile } from '~/lib/api';
import { isLoggedIn } from '~/lib/auth';

export default async function Home() {
	const user = await getUser();
	return (
		<Page header="Spotify Playlist">
			{user && <p>Hi, {user.display_name}!</p>}
			{!user && (
				<p>
					<Link href="/login">Log In</Link>
				</p>
			)}
			{user && (
				<Suspense fallback={<LoadingComponent />}>
					<PlaylistPicker />
				</Suspense>
			)}
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

async function getUser() {
	if (isLoggedIn()) {
		return await queryProfile();
	}
	return null;
}
