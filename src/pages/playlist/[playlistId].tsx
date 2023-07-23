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
	const headerImage = playlist.images.reduce((biggest, image) =>
		image.width > biggest.width ? image : biggest
	);
	return (
		<Page header={playlist.name}>
			{headerImage && (
				<p>
					<img
						alt={`Playlist cover for ${playlist.name}`}
						height={headerImage.height}
						src={headerImage.url}
						width={headerImage.width}
					/>
				</p>
			)}
			<ul>
				{playlist.tracks.items.map(({ added_at, track }) => (
					<li key={`${track.id}-${added_at}`}>
						{track.name} by&nbsp;
						{track.artists.map(({ name }) => name).join(', ')}
						&nbsp;on&nbsp;
						{track.album.name}
					</li>
				))}
			</ul>
		</Page>
	);
}

export const Loader = loadWithAuth({
	playlist: ({ params }: LoaderFunctionArgs) =>
		queryPlaylist(getParamOrThrow('playlistId', params)),
});
