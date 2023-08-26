import { type LoaderArgs } from '@remix-run/node';
import { useNavigation } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import Graph from '~/components/graph';
import Image from '~/components/image';
import LoadingComponent from '~/components/loading';
import Page from '~/components/page';
import TrackDisplay from '~/components/track';
import { queryPlaylist } from '~/lib/api/query';
import { checkAuth, getParamOrThrow } from '~/lib/routing';
import { getTracksInfo } from '~/models/track.server';
import classes from '~/styles.module.css';

export default function PlaylistPage() {
	const { playlist, tracks } = useTypedLoaderData<typeof loader>();
	const nav = useNavigation();
	if (nav.state === 'loading') {
		return <LoadingComponent />;
	}
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
		const tracks = await getTracksInfo(playlist);
		return typedjson({ playlist, tracks });
	} catch (err) {
		console.log(err);
		throw new Response('', { status: 404 });
	}
}
