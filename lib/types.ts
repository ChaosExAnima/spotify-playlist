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

export function isPlainObject(value: unknown): value is object {
	return !!value && typeof value === 'object';
}

export function objectHasKeys<Key extends string>(
	value: unknown,
	keys: Key | Key[]
): value is Record<Key, unknown> {
	if (!isPlainObject(value)) {
		return false;
	}
	if (Array.isArray(keys)) {
		return keys.every((key) => key in value);
	}
	return keys in value;
}
