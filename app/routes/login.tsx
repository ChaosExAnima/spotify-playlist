import { type LoaderFunction, redirect } from '@remix-run/node';

import { getRedirectCode, handleLoginCode, logIn } from '~/lib/auth';

export const loader: LoaderFunction = async ({ request }) => {
	console.log(getRedirectCode(request));
	if (getRedirectCode(request)) {
		await handleLoginCode(request);
		throw redirect('/');
	}
	await logIn();
};
