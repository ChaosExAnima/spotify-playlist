import { Suspense } from 'react';
import Graph from '~/components/graph';
import Image from '~/components/image';
import LoadingComponent from '~/components/loading';
import Page from '~/components/page';
import TrackDisplay from '~/components/track';
import { queryPlaylist } from '~/lib/api/query';
import { getTracksInfo } from '~/models/track.server';
import classes from './page.module.css';

export default async function PlaylistPage({
	params: { playlist: playlistId },
}: {
	params: { playlist: string };
}) {
	const { playlist, tracks } = await getTrackData(playlistId);
	return (
		<Page header={playlist?.name ?? 'Loading...'}>
			<Suspense fallback={<LoadingComponent />}>
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
			</Suspense>
		</Page>
	);
}

async function getTrackData(playlistId?: string) {
	if (!playlistId || typeof playlistId !== 'string') {
		throw new Error('Invalid playlist ID');
	}
	const playlist = await queryPlaylist(playlistId);
	const tracks = await getTracksInfo(
		playlist.tracks.items
			.map((playlistTrack) => playlistTrack.track)
			.filter((i): i is SpotifyApi.TrackObjectFull => !!i)
	);
	return { playlist, tracks };
}
