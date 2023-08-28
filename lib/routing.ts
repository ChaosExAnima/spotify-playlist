export function baseUrl() {
	return `http${process.env.SSL ? 's' : ''}://${
		process.env.HOST ?? 'localhost'
	}`;
}

export function url(path: string) {
	return baseUrl() + path;
}
