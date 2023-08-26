import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'stream';

import type { EntryContext } from '@remix-run/node';

const ABORT_DELAY = 5_000;

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext
		  )
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext
		  );
}

function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		const { abort, pipe } = renderToPipeableStream(
			<RemixServer
				abortDelay={ABORT_DELAY}
				context={remixContext}
				url={request.url}
			/>,
			{
				onAllReady() {
					const body = new PassThrough();

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					);

					pipe(body);
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					console.error(error);
				},
				onShellError(error: unknown) {
					reject(error);
				},
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		const { abort, pipe } = renderToPipeableStream(
			<RemixServer
				abortDelay={ABORT_DELAY}
				context={remixContext}
				url={request.url}
			/>,
			{
				onError(error: unknown) {
					console.error(error);
					responseStatusCode = 500;
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onShellReady() {
					const body = new PassThrough();

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					);

					pipe(body);
				},
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}
