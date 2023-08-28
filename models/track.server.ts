import { db } from '~/lib/db.server';
import { queryAnalysis, queryFeatures } from '~/lib/api/query';
import { getPromiseMap } from '~/lib/utils';

import type { Prisma } from '@prisma/client';
import type { TrackInfo } from '~/lib/types';

function dbTrackToInfo(track?: Prisma.TrackCreateInput) {
	if (!track) {
		return null;
	}
	return {
		...track,
		...JSON.parse(track.track),
		analysis: JSON.parse(track.analysis),
		features: JSON.parse(track.features),
	} as TrackInfo;
}

export async function getTracksInfo(baseTracks: SpotifyApi.TrackObjectFull[]) {
	const baseTracksMap = indexById(baseTracks);
	const trackIds = Array.from(baseTracksMap.keys());
	const dbTracks = await asyncIndexById(
		db.track.findMany({
			where: { id: { in: trackIds } },
		})
	);
	const trackIdsToLoad = trackIds.filter((trackId) => !dbTracks.has(trackId));
	const { analysis, features } = await getPromiseMap({
		analysis: asyncIndexById(
			Promise.all(
				trackIdsToLoad.map(async (track) => ({
					...(await queryAnalysis(track)),
					id: track,
				}))
			)
		),
		features: asyncIndexById(queryFeatures(trackIdsToLoad)),
	});
	return Promise.all(
		trackIds.map(async (trackId) => {
			if (dbTracks.has(trackId)) {
				return dbTrackToInfo(dbTracks.get(trackId)) as TrackInfo;
			}
			const track = baseTracksMap.get(trackId);
			if (!track) {
				throw new Error(`Could not find track ${trackId}`);
			}
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

interface Entity {
	id: string;
}

function indexById<Object extends Entity>(objects: Object[]) {
	return new Map(objects.map((object) => [object.id, object]));
}

async function asyncIndexById<Object extends Entity>(
	objectsPromise: Promise<Object[]> | Object[]
) {
	const objects = await objectsPromise;
	return indexById<Object>(objects);
}
