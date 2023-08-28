type PromiseMap<Map extends Record<string, unknown>> = {
	[K in keyof Map]: Promise<Map[K]>;
};

export async function getPromiseMap<Map extends Record<string, unknown>>(
	map: PromiseMap<Map>
): Promise<Map> {
	const results = await Promise.all(
		Object.entries(map).map(([key, promise]) =>
			promise.then((result) => ({ [key]: result }))
		)
	);
	return results.reduce((acc, result) => ({ ...acc, ...result }), {}) as Map;
}
