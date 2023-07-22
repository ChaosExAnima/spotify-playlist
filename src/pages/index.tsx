import { fetchAuthInfo, getAuthInfo, getRedirectCode } from 'lib/auth';
import { Link, redirect } from 'router';

import './index.css';

export default function HomePage() {
	return (
		<>
			<h1>Spotify Playlist</h1>
			<Link to="/login">Log In</Link>
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

export async function Loader(): Promise<void> {
	const authInfo = getAuthInfo();
	if (authInfo) {
		throw redirect('/playlist');
	}
	if (!getRedirectCode()) {
		return null;
	}
	const codeVerifier = localStorage.getItem('code_verifier');
	if (!codeVerifier) {
		return null;
	}
	await fetchAuthInfo(codeVerifier);
	localStorage.removeItem('code_verifier');
	throw redirect('/');
}
