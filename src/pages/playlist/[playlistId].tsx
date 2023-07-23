import Page from 'components/page';
import { queryPlaylist } from 'lib/query';
import { getParamOrThrow, loadWithAuth } from 'lib/routing';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

interface PlaylistPageData {
	playlist: SpotifyApi.PlaylistObjectFull;
}

export default function PlaylistPage() {
	const { playlist } = useLoaderData() as PlaylistPageData;
	console.log(playlist);
	return <Page header={playlist.name}>Cool playlist stuff here</Page>;
}

export const Loader = loadWithAuth({
	playlist: ({ params }: LoaderFunctionArgs) =>
		queryPlaylist(getParamOrThrow('playlistId', params)),
});
