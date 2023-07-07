import { fetchAuthInfo, getAuthInfo, getRedirectCode } from 'lib/auth';
import { queryPlaylists, queryProfile } from 'lib/query';
import { Link, redirect, useLoaderData } from 'react-router-dom';

import './App.css';

export interface AppData {
	playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse;
	user: SpotifyApi.CurrentUsersProfileResponse;
}

export default function HomePage() {
	const data = useLoaderData() as AppData;
	return (
		<>
			<h1>Spotify Playlist</h1>
			{!data && <Link to="login">Log In</Link>}
			{data && <UserInfo {...data} />}
			<footer>
				<h2>References</h2>
				<ul>
					<li>
						<a
							href="https://developer.spotify.com/documentation/web-api/reference/"
							target="_blank"
						>
							Spotify API
						</a>
					</li>
					<li>
						<a
							href="https://reactrouter.com/en/main/start/overview"
							target="_blank"
						>
							React Router
						</a>
					</li>
				</ul>
			</footer>
		</>
	);
}

export async function loader() {
	const authInfo = getAuthInfo();
	if (authInfo) {
		try {
			const [user, playlists] = await Promise.all([
				queryProfile(),
				queryPlaylists(),
			]);
			return { playlists, user };
		} catch (err) {
			/* empty */
		}
	}

	if (!getRedirectCode()) {
		return null;
	}
	const codeVerifier = localStorage.getItem('code_verifier');
	await fetchAuthInfo(codeVerifier);
	localStorage.removeItem('code_verifier');
	throw redirect('/');
}

function UserInfo({ playlists, user }: AppData) {
	return (
		<>
			<p>Hi, {user.display_name}!</p>
			<p>You have {playlists.total} playlists to pick from:</p>
			<ul>
				{playlists.items.map((item) => (
					<li key={item.id}>
						<Link to={`/playlist/${item.id}`}>{item.name}</Link>
					</li>
				))}
			</ul>
		</>
	);
}
