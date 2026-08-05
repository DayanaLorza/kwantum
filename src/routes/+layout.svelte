<script>
	import favicon from '$lib/assets/favicon.svg';
	import Preloader from '$lib/Preloader.svelte';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<Preloader />
<Header />

{@render children()}
<Footer />

<style>
	:global(:root) {
		--primary: #00ff41;
		--accent: #ffff00;
		--bg: #000000;
		--text: #e0ffe0;
		--secondary: #39ff14;
	}

	:global(body) {
		margin: 0;
		font-family: "Raleway", "Inter", "Segoe UI", system-ui, sans-serif;
		color: var(--text);
		background: var(--bg);
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
