import { queryPlaylist } from 'lib/query';
import { getParamOrThrow, loadWithAuth } from 'lib/routing';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

interface PlaylistPageData {
	playlist: SpotifyApi.PlaylistObjectFull;
}

export default function PlaylistPage() {
	const { playlist } = useLoaderData() as PlaylistPageData;
	console.log(playlist);
	return (
		<>
			<h1>{playlist.name}</h1>
			<pre>{JSON.stringify(playlist, null, '\t')}</pre>
		</>
	);
}

export const Loader = loadWithAuth({
	playlist: ({ params }: LoaderFunctionArgs) =>
		queryPlaylist(getParamOrThrow('playlistId', params)),
});
