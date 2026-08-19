// Centralized JSON-LD structured data for SEO / rich results.
// These describe the business to Google, Bing, and AI search engines.

export const SITE_URL = 'https://kwantumtech.com';

/** Core business identity — reused across pages via @id references. */
export const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: 'Kwantum Tech',
	legalName: 'Kwantum Consulting LLC',
	url: SITE_URL,
	logo: `${SITE_URL}/assets/og/og-home.png`,
	image: `${SITE_URL}/assets/og/og-home.png`,
	description:
		'Kwantum Tech is a premium software engineering and IT consulting firm building AI employees, custom web and mobile applications, secure infrastructure, and automation for high-performance teams.',
	slogan: 'Quantum-grade engineering for elite ambitions.',
	knowsAbout: [
		'AI Employees',
		'AI Agents',
		'Software Engineering',
		'IT Consulting',
		'Cloud Architecture',
		'Cybersecurity',
		'Business Automation',
		'Web Development',
		'Mobile App Development'
	]
};

export const websiteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'@id': `${SITE_URL}/#website`,
	url: SITE_URL,
	name: 'Kwantum Tech',
	description:
		'Premium software engineering, IT consulting, and AI employees for high-performance teams.',
	publisher: { '@id': `${SITE_URL}/#organization` },
	inLanguage: 'en-US'
};

/** Professional services offering — good for the home/services page. */
export const professionalServiceSchema = {
	'@context': 'https://schema.org',
	'@type': 'ProfessionalService',
	'@id': `${SITE_URL}/#service`,
	name: 'Kwantum Tech',
	url: SITE_URL,
	image: `${SITE_URL}/assets/og/og-home.png`,
	description:
		'Premium software engineering and IT consulting: custom web & mobile apps, AI bots and agents, infrastructure architecture, performance optimization, and security.',
	parentOrganization: { '@id': `${SITE_URL}/#organization` },
	areaServed: 'Worldwide',
	serviceType: [
		'Software Engineering',
		'IT Consulting',
		'AI Agents & Automation',
		'Infrastructure Architecture',
		'Performance Optimization',
		'Security & Privacy'
	]
};

/**
 * Build a Service schema for the AI Employees offering.
 * @param {{name:string, description:string}[]} offerings
 */
export function aiEmployeesServiceSchema(offerings) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${SITE_URL}/ai-agents/#service`,
		serviceType: 'AI Employees',
		name: 'AI Employees by Kwantum Tech',
		url: `${SITE_URL}/ai-agents`,
		image: `${SITE_URL}/assets/og/og-ai-employees.png`,
		provider: { '@id': `${SITE_URL}/#organization` },
		areaServed: 'Worldwide',
		audience: {
			'@type': 'Audience',
			audienceType: 'Real estate teams, agencies, and service businesses'
		},
		description:
			'Premium AI employees that qualify leads, follow up, book calls, and support clients 24/7 — built and managed for you.',
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'AI Employees',
			itemListElement: offerings.map((o) => ({
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Service',
					name: o.name,
					description: o.description
				}
			}))
		}
	};
}

/**
 * Build a Service schema for the AI Audit offering.
 */
export function aiAuditServiceSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${SITE_URL}/ai-audit/#service`,
		serviceType: 'AI Audit',
		name: 'AI Audit by Kwantum Tech',
		url: `${SITE_URL}/ai-audit`,
		image: `${SITE_URL}/assets/og/og-ai-audit.png`,
		provider: { '@id': `${SITE_URL}/#organization` },
		areaServed: 'Worldwide',
		audience: {
			'@type': 'Audience',
			audienceType: 'Owner-run businesses — med spas, home services, real estate, and offices'
		},
		description:
			'A 45-minute AI Audit that produces a written plan showing exactly where AI hands your business back 5+ hours a week. Guaranteed, or you don\'t pay. Built by an engineer, not a salesperson.',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			description: 'Free to look — 5+ hours found or you don\'t pay.'
		}
	};
}

/**
 * Build a Service schema for the Web Apps offering.
 */
export function webAppsServiceSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${SITE_URL}/web-apps/#service`,
		serviceType: 'Custom Web App Development',
		name: 'Custom Web Apps by Kwantum Tech',
		url: `${SITE_URL}/web-apps`,
		image: `${SITE_URL}/assets/og/og-home.png`,
		provider: { '@id': `${SITE_URL}/#organization` },
		areaServed: 'Worldwide',
		audience: {
			'@type': 'Audience',
			audienceType:
				'Owner-run businesses replacing spreadsheets and disconnected tools with custom software'
		},
		description:
			'Custom web apps engineered around how your business runs — a written scope, a fixed price, and a working Release 1 in 21 days, with automation and AI built in. You own 100% of the code.'
	};
}

/**
 * Build a BreadcrumbList schema.
 * @param {{name:string, path:string}[]} items
 */
export function breadcrumbSchema(items) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: `${SITE_URL}${item.path}`
		}))
	};
}

/**
 * Build an FAQPage schema.
 * @param {{question:string, answer:string}[]} faqs
 */
export function faqSchema(faqs) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.question,
			acceptedAnswer: { '@type': 'Answer', text: f.answer }
		}))
	};
}
