import { Link, Outlet } from '@remix-run/react';

import { isLoggedIn } from '~/lib/auth';

export default function App() {
	const loggedIn = isLoggedIn();
	return (
		<>
			{loggedIn && (
				<header>
					<nav>
						<h1>
							<Link to="/">Spotify Playlists</Link>
						</h1>
						<ul>
							<li>
								<Link to="/playlist">Playlists</Link>
							</li>
							<li>
								<Link to="/logout">Log out</Link>
							</li>
						</ul>
					</nav>
				</header>
			)}
			<Outlet />
		</>
	);
}
