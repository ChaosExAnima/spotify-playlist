import { Link } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import Page from '~/components/page';
import { isLoggedIn, setToken } from '~/lib/auth';
import { queryPlaylists, queryProfile } from '~/lib/query';
import { sessionFromRequest } from '~/lib/session';

import type { LoaderArgs } from '@remix-run/node';

export default function HomePage() {
	const data = useTypedLoaderData<typeof loader>();
	const { playlists, user } = data ?? {};
	return (
		<Page header="Spotify Playlist">
			{user && <p>Hi, {user.display_name}!</p>}
			{!user && (
				<p>
					<Link to="/login">Log In</Link>
				</p>
			)}
			<PlaylistPicker playlists={playlists} />
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

function PlaylistPicker({
	playlists,
}: {
	playlists?: SpotifyApi.ListOfUsersPlaylistsResponse;
}) {
	if (!playlists) {
		return null;
	}
	return (
		<>
			<p>Pick a playlist:</p>
			<ul>
				{playlists.items.map((playlist) => (
					<li key={playlist.id}>
						<Link to={`/playlist/${playlist.id}`}>
							{playlist.name}
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}

export async function loader({ request }: LoaderArgs) {
	const session = await sessionFromRequest(request);
	await setToken(session);
	if (isLoggedIn()) {
		try {
			return typedjson({
				playlists: await queryPlaylists(),
				user: await queryProfile(),
			});
		} catch (err) {
			console.log(err);
			return null;
		}
	}
	return null;
}
