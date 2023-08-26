import { useLoaderData } from 'react-router-dom';

import Page from '~/components/page';
import { queryPlaylists, queryProfile } from '~/lib/query';
import { loadWithAuth } from '~/lib/routing';
import { Link } from '~/router';

interface PlaylistsData {
	playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse;
	user: SpotifyApi.CurrentUsersProfileResponse;
}

export default function PlaylistsPage() {
	const { playlists, user } = useLoaderData() as PlaylistsData;
	return (
		<Page>
			<p>Hi, {user.display_name}!</p>
			<p>You have {playlists.total} playlists to pick from:</p>
			<ul>
				{playlists.items.map((item) => (
					<li key={item.id}>
						<Link
							params={{ playlistId: item.id }}
							to="/playlist/:playlistId"
						>
							{item.name}
						</Link>
					</li>
				))}
			</ul>
		</Page>
	);
}

export const Loader = loadWithAuth({
	playlists: queryPlaylists,
	user: queryProfile,
});
