import Page from 'components/page';
import { queryAnalysis, queryFeatures, queryPlaylist } from 'lib/query';
import { checkAuth, getParamOrThrow, getPromiseMap } from 'lib/routing';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

interface TrackAnalysisObject extends SpotifyApi.AudioAnalysisObject {
	id: string;
}

interface TrackInfo extends SpotifyApi.TrackObjectFull {
	added_at: string;
	analysis?: TrackAnalysisObject;
	features?: SpotifyApi.AudioFeaturesObject;
}

interface PlaylistPageData {
	playlist: SpotifyApi.PlaylistObjectFull;
	tracks: Map<string, TrackInfo>;
}

export default function PlaylistPage() {
	const { playlist, tracks } = useLoaderData() as PlaylistPageData;
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
				{Array.from(tracks.values()).map((track) => (
					<li key={`${track.id}-${track.added_at}`}>
						<p>
							<strong>{track.name}</strong>
						</p>
						<p>
							By{' '}
							{track.artists.map(({ name }) => name).join(', ')}{' '}
							on <em>{track.album.name}</em>
						</p>
						<p>BPM: {track.features?.tempo ?? 'Unknown'}</p>
					</li>
				))}
			</ul>
		</Page>
	);
}

export const Loader = async ({
	params,
}: LoaderFunctionArgs): Promise<PlaylistPageData> => {
	checkAuth();
	const playlistId = getParamOrThrow('playlistId', params);
	try {
		const playlist = await queryPlaylist(playlistId);
		const trackIds = playlist.tracks.items.map(({ track: { id } }) => id);
		const { analysis, features } = await getPromiseMap({
			analysis: Promise.all(
				trackIds.map((track) =>
					queryAnalysis(track).then(
						(result): TrackAnalysisObject => ({
							...result,
							id: track,
						})
					)
				)
			),
			features: queryFeatures(trackIds),
		});
		const tracks = new Map<string, TrackInfo>(
			trackIds.map((trackId) => {
				const playlistTrack = playlist.tracks.items.find(
					(result) => result.track.id === trackId
				);
				const trackInfo: TrackInfo = {
					...playlistTrack.track,
					added_at: playlistTrack.added_at,
					analysis: analysis.find((result) => result.id === trackId),
					features: features.find((result) => result.id === trackId),
				};
				console.log('info for', trackId, trackInfo);

				return [trackId, trackInfo];
			})
		);
		return { playlist, tracks };
	} catch (err) {
		console.log(err);
		throw new Response('', { status: 404 });
	}
};
