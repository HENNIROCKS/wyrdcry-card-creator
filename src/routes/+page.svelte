<svelte:head>
	<title>Wyrdcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import LangSwitch from '$lib/components/LangSwitch.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';

	const formattedDate = $derived(
		new Date(__BUILD_DATE__ + 'T00:00:00').toLocaleDateString(i18n.code, { dateStyle: 'long' })
	);
</script>

<main class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6 py-10">
	<h1 class="text-4xl font-bold tracking-wide text-center px-6">Wyrdcry Card Creator</h1>
	<div class="flex flex-col items-stretch gap-3 w-full max-w-xs px-6 my-4">
		<a href="{base}/fighter" class="px-8 py-4 bg-[#125E3C] hover:bg-[#16754A] rounded text-white font-semibold text-lg text-center transition">
			{t('ui.fighter-card')}
		</a>
		<a href="{base}/text" class="px-8 py-4 bg-[#125E3C] hover:bg-[#16754A] rounded text-white font-semibold text-lg text-center transition">
			{t('ui.text-card')}
		</a>
		<a href="{base}/card-back" class="px-8 py-4 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300 hover:text-white font-semibold text-lg text-center transition">
			{t('ui.card-back')}
		</a>
	</div>
	<p class="text-zinc-500 text-sm text-center max-w-sm px-6">
		{t('ui.tagline')}
		{t('ui.disclaimer')}
	</p>
	<div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
		<LangSwitch />
		<ThemeToggle />
	</div>
	<p class="text-zinc-500 text-xs">{t('ui.last-updated')}: {formattedDate}</p>
</main>
