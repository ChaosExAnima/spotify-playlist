import { useLoaderData } from 'react-router-dom';

export default function PlaylistPage() {
	const playlist = useLoaderData() as SpotifyApi.PlaylistObjectFull;
	console.log(playlist);
	return (
		<>
			<h1>{playlist.name}</h1>
			<pre>{JSON.stringify(playlist, null, '\t')}</pre>
		</>
	);
}
