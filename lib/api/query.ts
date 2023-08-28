import { fetchWithToken } from './common';

export function queryProfile() {
	return fetchWithToken<SpotifyApi.CurrentUsersProfileResponse>('/me');
}

export function queryPlaylist(playlistId: string) {
	return fetchWithToken<SpotifyApi.PlaylistObjectFull>(
		`/playlists/${playlistId}`
	);
}

export function queryPlaylists() {
	return fetchWithToken<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
		'/me/playlists'
	);
}

export function queryTracks(trackIds: string[]) {
	return fetchWithToken<SpotifyApi.MultipleTracksResponse>('/tracks', {
		ids: trackIds.join(','),
	});
}

export async function queryFeatures(trackIds: string[]) {
	const response =
		await fetchWithToken<SpotifyApi.MultipleAudioFeaturesResponse>(
			`/audio-features`,
			{
				ids: trackIds.join(','),
			}
		);
	return response.audio_features;
}

export function queryAnalysis(trackId: string) {
	return fetchWithToken<SpotifyApi.AudioAnalysisObject>(
		`/audio-analysis/${trackId}`
	);
}
