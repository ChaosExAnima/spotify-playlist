import { Modals } from '@generouted/react-router/lazy';
import { isLoggedIn } from 'lib/auth';
import { Outlet } from 'react-router-dom';
import { Link } from 'router';

export default function App() {
	const loggedIn = isLoggedIn();
	return (
		<section>
			{loggedIn && (
				<header>
					<nav>
						<ul>
							<li>
								<Link to="/playlist">Playlists</Link>
							</li>
							<li>
								<button onClick={() => null}>Log out</button>
							</li>
						</ul>
					</nav>
				</header>
			)}
			<main>
				<Outlet />
			</main>
			<Modals />
		</section>
	);
}
