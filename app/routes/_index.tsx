import { Link, useLoaderData } from '@remix-run/react';

import Page from '~/components/page';
import { handleLoginCode, isLoggedIn } from '~/lib/auth';
import { queryProfile } from '~/lib/query';

import type { LoaderArgs } from '@remix-run/node';

export default function HomePage() {
	const user = useLoaderData<typeof loader>();
	return (
		<Page header="Spotify Playlist">
			{user && <p>Hi, {user.display_name}!</p>}
			{!user && (
				<p>
					<Link to="/login">Log In</Link>
				</p>
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

export async function loader({ request }: LoaderArgs) {
	await handleLoginCode(request);
	console.log(isLoggedIn());

	if (isLoggedIn()) {
		try {
			return queryProfile();
		} catch (err) {
			console.log(err);
			return null;
		}
	}
	return null;
}
