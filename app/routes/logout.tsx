import { type LoaderArgs } from '@remix-run/node';

import { deleteSession } from '~/lib/session';

export async function loader({ request }: LoaderArgs) {
	await deleteSession(request);
}
