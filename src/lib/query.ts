import { getToken } from 'lib/auth';

export async function fetchFromAPI<Result = unknown>(
	uri: string,
	method: 'GET' | 'POST' = 'GET'
) {
	const token = getToken();
	if (!token) {
		throw new Error('No auth info found');
	}
	const response = await fetch(`https://api.spotify.com/v1${uri}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method,
	});
	if (!response.ok) {
		throw new Error(`Got error from API: ${response.status}`);
	}
	return response.json() as Result;
}

export function queryProfile() {
	return fetchFromAPI<SpotifyApi.CurrentUsersProfileResponse>('/me');
}

export function queryPlaylist(playlistId: string) {
	return fetchFromAPI<SpotifyApi.PlaylistObjectFull>(
		`/playlists/${playlistId}`
	);
}

export function queryPlaylists() {
	return fetchFromAPI<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
		'/me/playlists'
	);
}
