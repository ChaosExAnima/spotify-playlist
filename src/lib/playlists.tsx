import { Link, useLoaderData } from 'react-router-dom';

interface PlaylistsData {
	playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse;
	user: SpotifyApi.CurrentUsersProfileResponse;
}

export default function PlaylistsPage() {
	const { playlists, user } = useLoaderData() as PlaylistsData;
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
