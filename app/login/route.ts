import { redirect } from 'next/navigation';
import { handleLoginCode, logIn } from '~/lib/auth';

export async function GET(request: Request) {
	const login = await handleLoginCode(request);
	if (login) {
		redirect('/');
	}
	logIn();
}
