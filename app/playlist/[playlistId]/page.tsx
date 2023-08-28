import { Suspense } from 'react';
import Graph from '~/components/graph';
import Image from '~/components/image';
import LoadingComponent from '~/components/loading';
import Page from '~/components/page';
import TrackDisplay from '~/components/track';
import { queryPlaylist } from '~/lib/api/query';
import { getTracksInfo } from '~/models/track.server';
import classes from './page.module.css';
import { Metadata } from 'next';

interface PlaylistPageProps {
	params: { playlistId: string };
}

export async function generateMetadata({
	params,
}: PlaylistPageProps): Promise<Metadata> {
	const { playlistId } = params;
	const playlist = await queryPlaylist(playlistId);
	return {
		title: playlist.name,
	};
}

export default async function PlaylistPage({
	params: { playlistId },
}: PlaylistPageProps) {
	const playlist = await queryPlaylist(playlistId);
	return (
		<Page header={playlist?.name ?? 'Loading...'}>
			<Suspense fallback={<LoadingComponent />}>
				<TrackVisualizer playlistId={playlistId} />
			</Suspense>
		</Page>
	);
}

async function TrackVisualizer({ playlistId }: { playlistId: string }) {
	if (!playlistId || typeof playlistId !== 'string') {
		throw new Error('Invalid playlist ID');
	}
	const playlist = await queryPlaylist(playlistId);
	return (
		<>
			<Suspense fallback={<LoadingComponent />}>
				<TracksDisplay playlist={playlist} />
			</Suspense>
			<Image
				alt={`Playlist cover for ${playlist.name}`}
				className={classes.cover}
				images={playlist.images}
			/>
		</>
	);
}

interface PlaylistProps {
	playlist: SpotifyApi.PlaylistObjectFull;
}

async function TracksDisplay({ playlist }: PlaylistProps) {
	const tracks = await getTracksInfo(
		playlist.tracks.items
			.map((playlistTrack) => playlistTrack.track)
			.filter((i): i is SpotifyApi.TrackObjectFull => !!i)
	);

	return (
		<>
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
		</>
	);
}
