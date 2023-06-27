/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_CLIENT_ID: string;
	readonly VITE_APP_CLIENT_SECRET: string;
	readonly VITE_APP_REDIRECT: string;
	readonly VITE_APP_STATE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
