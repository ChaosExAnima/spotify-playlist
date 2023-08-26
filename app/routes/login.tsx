import { logIn } from '~/lib/auth';

import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = logIn;
