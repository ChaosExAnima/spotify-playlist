export interface TrackAnalysisObject extends SpotifyApi.AudioAnalysisObject {
	id: string;
}

export interface TrackInfo extends SpotifyApi.TrackObjectFull {
	added_at: Date;
	analysis?: TrackAnalysisObject;
	features?: SpotifyApi.AudioFeaturesObject;
}

export type KeysOfValueType<O, T> = {
	[K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

export type FeatureKeys = KeysOfValueType<
	SpotifyApi.AudioFeaturesObject,
	number
>;
