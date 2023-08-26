import { type LoaderArgs } from '@remix-run/node';

import { handleLoginCode, logIn } from '~/lib/auth';

export async function loader({ request }: LoaderArgs) {
	const login = await handleLoginCode(request);
	if (login) {
		return login;
	}
	return logIn();
}
