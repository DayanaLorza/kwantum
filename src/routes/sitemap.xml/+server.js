import { SITE_URL } from '$lib/seo/schema.js';

// Prerendered so it is emitted as a static sitemap.xml at build time.
export const prerender = true;

// Public, indexable pages with relative priorities.
const pages = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/web-apps', changefreq: 'weekly', priority: '0.9' },
	{ path: '/ai-audit', changefreq: 'weekly', priority: '0.9' },
	{ path: '/ai-agents', changefreq: 'weekly', priority: '0.9' },
	{ path: '/contact', changefreq: 'monthly', priority: '0.7' }
];

export function GET() {
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = pages
		.map(
			(p) => `	<url>
		<loc>${SITE_URL}${p.path}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>${p.changefreq}</changefreq>
		<priority>${p.priority}</priority>
	</url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
