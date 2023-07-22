import generouted from '@generouted/react-router/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), generouted(), tsconfigPaths()],
	server: {
		port: 5173,
		strictPort: true,
	},
});
