const isBrowser = typeof window !== 'undefined';

export interface UseCookieOptions {
	[key: string]: boolean | number | string;
}

export function stringifyOptions(options: UseCookieOptions) {
	return Object.keys(options).reduce((acc, key) => {
		if (key === 'days') {
			return acc;
		} else {
			if (options[key] === false) {
				return acc;
			} else if (options[key] === true) {
				return `${acc}; ${key}`;
			} else {
				return `${acc}; ${key}=${options[key]}`;
			}
		}
	}, '');
}

export function setCookie(
	name: string,
	value: string,
	options: UseCookieOptions = {}
) {
	if (!isBrowser) return;

	const optionsWithDefaults = {
		days: 7,
		path: '/',
		...options,
	};

	const expires = new Date(
		Date.now() + optionsWithDefaults.days * 864e5
	).toUTCString();

	document.cookie =
		name +
		'=' +
		encodeURIComponent(value) +
		'; expires=' +
		expires +
		stringifyOptions(optionsWithDefaults);
}

export function getCookie(name: string, initialValue = '') {
	return (
		(isBrowser &&
			document.cookie.split('; ').reduce((r, v) => {
				const parts = v.split('=');
				return parts[0] === name ? decodeURIComponent(parts[1]) : r;
			}, '')) ||
		initialValue
	);
}
