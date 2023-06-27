// Taken from https://github.com/tylerwolff/useCookie
import { UseCookieOptions, getCookie, setCookie } from 'lib/cookie';
import { useState } from 'react';

export default function useCookie(key: string, initialValue?: string) {
	const [item, setItem] = useState(() => {
		return getCookie(key, initialValue);
	});

	const updateItem = (value: string, options: UseCookieOptions) => {
		setItem(value);
		setCookie(key, value, options);
	};

	return [item, updateItem];
}
