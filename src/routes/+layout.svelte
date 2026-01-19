<script>
	import favicon from '$lib/assets/favicon.svg';
	import Preloader from '$lib/Preloader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<Preloader />

{@render children()}
