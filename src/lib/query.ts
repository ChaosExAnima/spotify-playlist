import { getAuthInfo } from 'lib/auth';

export async function fetchFromAPI<Result = unknown>(
	uri: string,
	method: 'GET' | 'POST' = 'GET'
) {
	const authInfo = getAuthInfo();
	if (!authInfo) {
		throw new Error('No auth info found');
	}
	const response = await fetch(`https://api.spotify.com/v1${uri}`, {
		headers: {
			Authorization: `Bearer ${authInfo.access}`,
		},
		method,
	});
	if (!response.ok) {
		console.error(`Got error from API: ${response.status}`);
	}
	return response.json() as Result;
}

export function queryProfile() {
	return fetchFromAPI<SpotifyApi.CurrentUsersProfileResponse>('/me');
}

export function queryPlaylists() {
	return fetchFromAPI<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
		'/me/playlists'
	);
}
