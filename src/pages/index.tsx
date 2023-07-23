import { handleLoginCode, isLoggedIn } from 'lib/auth';
import { queryProfile } from 'lib/query';
import { useLoaderData } from 'react-router-dom';
import { Link } from 'router';

import './index.css';

export default function HomePage() {
	const user = useLoaderData() as SpotifyApi.CurrentUsersProfileResponse;
	return (
		<>
			<h1>Spotify Playlist</h1>
			{user && <p>Hi, {user.display_name}!</p>}
			{!user && <Link to="/login">Log In</Link>}
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

export async function Loader(): Promise<SpotifyApi.CurrentUsersProfileResponse | null> {
	await handleLoginCode();
	console.log('logged in:', isLoggedIn());
	if (isLoggedIn()) {
		try {
			return await queryProfile();
		} catch (err) {
			console.log(err);
			return null;
		}
	}
	return null;
}
