import { type LoaderArgs } from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import Graph from '~/components/graph';
import Image from '~/components/image';
import Page from '~/components/page';
import TrackDisplay from '~/components/track';
import { queryAnalysis, queryFeatures, queryPlaylist } from '~/lib/query';
import { checkAuth, getParamOrThrow, getPromiseMap } from '~/lib/routing';
import classes from '~/styles.module.css';

import type { TrackAnalysisObject, TrackInfo } from '~/lib/types';

export default function PlaylistPage() {
	const { playlist, tracks } = useTypedLoaderData<typeof loader>();
	return (
		<Page header={playlist.name}>
			<Graph
				className={classes.graph}
				initial="danceability"
				tracks={tracks}
			/>
			<ul className={classes.tracks}>
				{tracks.map((track) => (
					<li key={`${track.id}-${track.added_at}`}>
						<TrackDisplay track={track} />
					</li>
				))}
			</ul>
			<Image
				alt={`Playlist cover for ${playlist.name}`}
				className={classes.cover}
				images={playlist.images}
			/>
		</Page>
	);
}

export async function loader({ params }: LoaderArgs) {
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
		const tracks = trackIds.map((trackId) => {
			const playlistTrack = playlist.tracks.items.find(
				(result) => result.track.id === trackId
			);
			const trackInfo: TrackInfo = {
				...playlistTrack.track,
				added_at: playlistTrack.added_at,
				analysis: analysis.find((result) => result.id === trackId),
				features: features.find((result) => result.id === trackId),
			};
			return trackInfo;
		});
		return typedjson({ playlist, tracks });
	} catch (err) {
		console.log(err);
		throw new Response('', { status: 404 });
	}
}
