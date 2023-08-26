import { db } from '~/lib/db.server';
import { queryAnalysis, queryFeatures } from '~/lib/query';
import { getPromiseMap } from '~/lib/utils';

import type { TrackInfo } from '~/lib/types';

async function getTrackFromDb(trackId: string) {
	let track = await db.track.findUnique({ where: { id: trackId } });
	if (track) {
		return {
			...track,
			...JSON.parse(track.track),
			analysis: JSON.parse(track.analysis),
			features: JSON.parse(track.features),
		} as TrackInfo;
	}
	return null;
}

export async function getTracksInfo(playlist: SpotifyApi.PlaylistObjectFull) {
	const playlistTracks = await indexById(
		playlist.tracks.items.map(({ track }) => track)
	);
	const trackIds = Array.from(playlistTracks.keys());
	const tracks = await Promise.all(
		trackIds.map(async (trackId) => {
			const track = await getTrackFromDb(trackId);
			if (track) {
				return track;
			}
			return trackId;
		})
	);
	const trackIdsToLoad = tracks.filter(
		(track): track is string => typeof track === 'string'
	);
	if (trackIdsToLoad.length === 0) {
		return tracks as TrackInfo[];
	}

	const { analysis, features } = await getPromiseMap({
		analysis: indexById(
			Promise.all(
				trackIdsToLoad.map(async (track) => ({
					...(await queryAnalysis(track)),
					id: track,
				}))
			)
		),
		features: indexById(queryFeatures(trackIdsToLoad)),
	});
	return Promise.all(
		tracks.map(async (trackId) => {
			if (typeof trackId !== 'string') {
				return trackId;
			}
			const track = playlistTracks.get(trackId);
			const trackInfo: TrackInfo = {
				...track,
				added_at: new Date(),
				analysis: analysis.get(trackId),
				features: features.get(trackId),
			};

			await db.track.create({
				data: {
					added_at: trackInfo.added_at,
					analysis: JSON.stringify(trackInfo.analysis),
					features: JSON.stringify(trackInfo.features),
					id: trackInfo.id,
					track: JSON.stringify(track),
				},
			});

			return trackInfo;
		})
	);
}

async function indexById<Object extends { id: string }>(
	objectsPromise: Object[] | Promise<Object[]>
) {
	const objects = await objectsPromise;
	return new Map(objects.map((object) => [object.id, object]));
}
