export interface TrackAnalysisObject extends SpotifyApi.AudioAnalysisObject {
	id: string;
}

export interface TrackInfo extends SpotifyApi.TrackObjectFull {
	added_at: string;
	analysis?: TrackAnalysisObject;
	features?: SpotifyApi.AudioFeaturesObject;
}
