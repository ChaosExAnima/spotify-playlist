import { type LoaderArgs } from '@remix-run/node';

import { deleteSession } from '~/lib/session';

export function loader({ request }: LoaderArgs) {
	return deleteSession(request);
}
