import { Modals } from '@generouted/react-router/lazy';
import { isLoggedIn } from 'lib/auth';
import { Outlet } from 'react-router-dom';
import { Link } from 'router';

export default function App() {
	const loggedIn = isLoggedIn();
	return (
		<>
			{loggedIn && (
				<header>
					<nav>
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
			<Modals />
		</>
	);
}
