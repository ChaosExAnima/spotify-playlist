export class APIError extends Error {
	private res: Response;
	constructor(message: string, response: Response, options?: ErrorOptions) {
		super(message, options);
		this.res = response;
	}

	get response() {
		return this.res;
	}
}
