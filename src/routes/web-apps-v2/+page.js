import { redirect } from '@sveltejs/kit';

// The V2 preview was promoted to /web-apps.
export function load() {
	throw redirect(301, '/web-apps');
}
