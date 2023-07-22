import { authorizePKCE } from 'lib/auth';
import { redirect } from 'react-router-dom';

export const Loader = async () => {
	throw redirect(await authorizePKCE());
};
