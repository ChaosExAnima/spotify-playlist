import { PropsWithChildren } from 'react';

interface PageProps {
	header?: string;
}

export default function Page({
	children,
	header,
}: PropsWithChildren<PageProps>) {
	return (
		<main>
			{header && (
				<header>
					<h1>{header}</h1>
				</header>
			)}
			{children}
		</main>
	);
}
