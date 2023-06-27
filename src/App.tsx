import { Link, useLoaderData } from 'react-router-dom';

import './App.css';

export interface AppData {
	playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse;
	user: SpotifyApi.CurrentUsersProfileResponse;
}

function App() {
	const data = useLoaderData() as AppData;
	return (
		<>
			<h1>Spotify Playlist</h1>
			{!data && <Link to="login">Log In</Link>}
			{data && <UserInfo {...data} />}
		</>
	);
}

function UserInfo({ playlists, user }: AppData) {
	return (
		<>
			<p>Hi, {user.display_name}!</p>
			<p>You have {playlists.total} playlists to pick from</p>
		</>
	);
}

export default App;
