import { Modals } from '@generouted/react-router/lazy';
import { Outlet } from 'react-router-dom';

export default function App() {
	return (
		<section>
			<header>
				<nav>...</nav>
			</header>

			<main>
				<Outlet />
			</main>
			<Modals />
		</section>
	);
}
