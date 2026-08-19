import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// honour the harness-assigned port in dev previews; fall back to vite's default
		port: Number(process.env.PORT) || 5173,
		strictPort: false
	}
});
