<script>
	import '@fontsource-variable/space-grotesk';
	import '@fontsource-variable/raleway';
	import '@fontsource/share-tech-mono';
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<Header />

<div id="main" style="display: contents">
	{@render children()}
</div>

<Footer />
