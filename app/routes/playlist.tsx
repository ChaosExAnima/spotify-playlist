import { Link, useLoaderData } from '@remix-run/react';

import Page from '~/components/page';
import { queryPlaylists, queryProfile } from '~/lib/query';
import { loadWithAuth } from '~/lib/routing';

export default function PlaylistsPage() {
	const { playlists, user } = useLoaderData<typeof loader>();
	return (
		<Page>
			<p>Hi, {user.display_name}!</p>
			<p>You have {playlists.total} playlists to pick from:</p>
			<ul>
				{playlists.items.map((item) => (
					<li key={item.id}>
						<Link to={`/playlist/${item.id}`}>{item.name}</Link>
					</li>
				))}
			</ul>
		</Page>
	);
}

export const loader = loadWithAuth({
	playlists: queryPlaylists,
	user: queryProfile,
});
