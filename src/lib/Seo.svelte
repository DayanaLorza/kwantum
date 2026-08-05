<script>
	import { page } from '$app/stores';

	// Canonical site origin — used to build absolute URLs for OG/Twitter tags.
	// Social crawlers require ABSOLUTE urls for images and the page url.
	const SITE_URL = 'https://kwantumtech.com';

	// Site-wide default keywords, used when a page doesn't provide its own.
	const DEFAULT_KEYWORDS = [
		'Kwantum Tech',
		'software engineering',
		'IT consulting',
		'AI employees',
		'AI agents',
		'business automation'
	];

	let {
		title = 'Kwantum Tech | IT Consulting & AI Employees',
		description = 'Kwantum Tech delivers modern IT consulting, cloud architecture, cybersecurity, and premium AI employees that work for your business 24/7.',
		// Path (relative to /static) or absolute URL to the share image (1200x630 recommended)
		image = '/og-image.png',
		imageAlt = 'Kwantum Tech — AI Employees, IT Consulting & Automation',
		// 'website' for landing pages, 'article' for blog posts, etc.
		type = 'website',
		siteName = 'Kwantum Tech',
		twitterHandle = '',
		// Array of keyword phrases for this page.
		keywords = [],
		noindex = false,
		// A single JSON-LD object, or an array of them, for this page.
		schema = []
	} = $props();

	// Escape a value for safe use inside a double-quoted HTML attribute.
	const attr = (v) =>
		String(v ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');

	// NOTE: Mixing static and dynamic sibling elements inside <svelte:head>
	// does not render reliably during SSR (which is what social/search crawlers
	// read). To guarantee every tag is server-rendered, we build the entire head
	// as one HTML string and output it with a single {@html}.
	const headHtml = $derived.by(() => {
		const canonicalUrl = $page?.url
			? new URL($page.url.pathname, SITE_URL).href
			: SITE_URL;
		const absoluteImage = image.startsWith('http')
			? image
			: new URL(image, SITE_URL).href;
		const robots = noindex
			? 'noindex, nofollow'
			: 'index, follow, max-image-preview:large';
		const kw = (keywords && keywords.length ? keywords : DEFAULT_KEYWORDS).join(', ');

		const tags = [
			`<title>${attr(title)}</title>`,
			`<meta name="description" content="${attr(description)}">`,
			`<meta name="keywords" content="${attr(kw)}">`,
			`<meta name="robots" content="${robots}">`,
			`<link rel="canonical" href="${attr(canonicalUrl)}">`,

			// Open Graph / Facebook / LinkedIn
			`<meta property="og:type" content="${attr(type)}">`,
			`<meta property="og:site_name" content="${attr(siteName)}">`,
			`<meta property="og:title" content="${attr(title)}">`,
			`<meta property="og:description" content="${attr(description)}">`,
			`<meta property="og:url" content="${attr(canonicalUrl)}">`,
			`<meta property="og:image" content="${attr(absoluteImage)}">`,
			`<meta property="og:image:secure_url" content="${attr(absoluteImage)}">`,
			`<meta property="og:image:type" content="image/png">`,
			`<meta property="og:image:width" content="1200">`,
			`<meta property="og:image:height" content="630">`,
			`<meta property="og:image:alt" content="${attr(imageAlt)}">`,
			`<meta property="og:locale" content="en_US">`,

			// Twitter / X
			`<meta name="twitter:card" content="summary_large_image">`,
			`<meta name="twitter:title" content="${attr(title)}">`,
			`<meta name="twitter:description" content="${attr(description)}">`,
			`<meta name="twitter:image" content="${attr(absoluteImage)}">`,
			`<meta name="twitter:image:alt" content="${attr(imageAlt)}">`
		];

		if (twitterHandle) {
			tags.push(`<meta name="twitter:site" content="${attr(twitterHandle)}">`);
			tags.push(`<meta name="twitter:creator" content="${attr(twitterHandle)}">`);
		}

		// JSON-LD structured data (escape "<" so the JSON can't break out of the script)
		const nodes = Array.isArray(schema) ? schema.filter(Boolean) : schema ? [schema] : [];
		if (nodes.length) {
			const json = JSON.stringify(nodes.length === 1 ? nodes[0] : nodes).replace(
				/</g,
				'\\u003c'
			);
			tags.push(`<script type="application/ld+json">${json}<\/script>`);
		}

		return tags.join('\n');
	});
</script>

<svelte:head>
	{@html headHtml}
</svelte:head>
