import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logOut } from '~/lib/auth';

export async function GET() {
	logOut();
	revalidatePath('/');
	redirect('/');
}
