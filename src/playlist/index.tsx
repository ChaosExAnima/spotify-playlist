import { getAuthInfo } from 'lib/auth';
import { queryPlaylist } from 'lib/query';
import { LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';

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

export async function loader({ params }: LoaderFunctionArgs) {
	const playlistId = params.playlist;
	if (!playlistId) {
		throw new Response('', { status: 404, statusText: 'Not found' });
	}
	const authInfo = getAuthInfo();
	if (!authInfo) {
		throw redirect('/');
	}
	const playlist = await queryPlaylist(playlistId);
	console.log(playlist);

	return playlist;
}
