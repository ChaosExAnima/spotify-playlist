/* eslint-disable no-undef */
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	cacheDirectory: './node_modules/.cache/remix',
	future: {
		v2_dev: true,
		v2_errorBoundary: true,
		v2_headers: true,
		v2_meta: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true,
	},
	serverModuleFormat: 'cjs',
};
