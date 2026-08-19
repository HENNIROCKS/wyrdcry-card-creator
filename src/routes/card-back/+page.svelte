<svelte:head>
	<title>Card Back — Wyrdcry Card Creator (Beta)</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import type { CardBackData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';
	import logoSvgRaw from '$lib/wyrdcry-logo.svg?raw';

	const logoMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvgRaw)}")`;

	let cardEl: HTMLElement;
	let exporting = $state(false);
	let exportedImageUrl = $state<string | null>(null);
	let printerFriendly = $state(false);
	let showDropdown = $state(false);
	let activeTab = $state<'edit' | 'preview'>('edit');
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);

	$effect(() => {
		const onResize = () => { viewportHeight = window.innerHeight; viewportWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	const isMobile = $derived(viewportWidth < 1024);
	$effect(() => {
		if (!showDropdown) return;
		const close = () => { showDropdown = false; };
		const id = setTimeout(() => document.addEventListener('click', close), 0);
		return () => { clearTimeout(id); document.removeEventListener('click', close); };
	});
	const cardScale = $derived(
		isMobile
			? Math.min(1, (viewportWidth - 32) / 574)
			: Math.min(1, (viewportHeight - 64) / 915)
	);

	let data = $state<CardBackData>({
		title: '',
		backgroundImage: null,
		imageOffsetX: 50,
		imageOffsetY: 50,
		imageZoom: 1,
		textColor: 'white',
		showFlippedName: true,
		showLogo: false,
		logoSize: 220,
	});

	const resolvedColor = $derived(
		printerFriendly && !data.backgroundImage ? '#000' :
		data.textColor === 'black' ? '#000' :
		data.textColor === 'green' ? '#16754A' :
		'#fff'
	);

	const titleLines = $derived(data.title.split('|'));

	// Distance from card's vertical center to the nearest edge of each name — keeps
	// mirrored names apart when no logo is shown, and clear of the logo when it is.
	const namePerSide = $derived.by(() => {
		const base = data.showFlippedName ? 110 : 0;
		if (!data.showLogo) return base;
		const logoHalfHeight = (data.logoSize * (217.55 / 254.59)) / 2;
		const logoPadding = 56; // 1em at the card-name font-size (56px)
		return Math.max(base, logoHalfHeight + logoPadding);
	});

	let adjustMode = $state(false);

	interface TouchState {
		mode: 'idle' | 'drag' | 'pinch';
		startX: number;
		startY: number;
		startOffsetX: number;
		startOffsetY: number;
		startDist: number;
		startZoom: number;
	}
	let touchState: TouchState = { mode: 'idle', startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startDist: 0, startZoom: 1 };

	function getTouchDist(touches: TouchList): number {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			touchState = { ...touchState, mode: 'drag', startX: e.touches[0].clientX, startY: e.touches[0].clientY, startOffsetX: data.imageOffsetX, startOffsetY: data.imageOffsetY };
		} else if (e.touches.length === 2) {
			touchState = { ...touchState, mode: 'pinch', startDist: getTouchDist(e.touches), startZoom: data.imageZoom };
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (touchState.mode === 'drag' && e.touches.length === 1) {
			const dx = (e.touches[0].clientX - touchState.startX) / cardScale;
			const dy = (e.touches[0].clientY - touchState.startY) / cardScale;
			data.imageOffsetX = Math.max(0, Math.min(100, touchState.startOffsetX - dx * (50 / 574)));
			data.imageOffsetY = Math.max(0, Math.min(100, touchState.startOffsetY - dy * (50 / 915)));
		} else if (touchState.mode === 'pinch' && e.touches.length === 2) {
			const newDist = getTouchDist(e.touches);
			data.imageZoom = Math.max(1, Math.min(3, touchState.startZoom * (newDist / touchState.startDist)));
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.touches.length === 0) {
			touchState.mode = 'idle';
		} else if (e.touches.length === 1 && touchState.mode === 'pinch') {
			touchState = { ...touchState, mode: 'drag', startX: e.touches[0].clientX, startY: e.touches[0].clientY, startOffsetX: data.imageOffsetX, startOffsetY: data.imageOffsetY };
		}
	}

	const isRealMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

	function handleImageUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			data.backgroundImage = ev.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function makeSlug() {
		const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
		const now = new Date();
		const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
		return `${toSlug(data.title || 'card-back')}_${ts}`;
	}

	async function doExport(suffix: string) {
		if (!cardEl || exporting) return;
		exporting = true;
		try {
			let dataUrl: string;
			if (isRealMobile) {
				const { domToPng } = await import('modern-screenshot');
				dataUrl = await domToPng(cardEl, { width: 574, height: 915, scale: 2 });
				if (navigator.share && navigator.canShare) {
					const blob = await (await fetch(dataUrl)).blob();
					const file = new File([blob], `${makeSlug()}${suffix}.png`, { type: 'image/png' });
					await navigator.share({ files: [file] });
				} else {
					exportedImageUrl = dataUrl;
				}
			} else {
				const domtoimage = (await import('dom-to-image-more')).default;
				dataUrl = await domtoimage.toPng(cardEl, { scale: 2 });
				const a = document.createElement('a');
				a.href = dataUrl;
				a.download = `${makeSlug()}${suffix}.png`;
				a.click();
			}
		} catch {
		} finally {
			exporting = false;
		}
	}

	async function exportCard() {
		await doExport('');
	}

	async function exportPrinterFriendly() {
		showDropdown = false;
		printerFriendly = true;
		await new Promise(r => requestAnimationFrame(r));
		await doExport('_print');
		printerFriendly = false;
	}
</script>

<div class="flex flex-col h-dvh bg-zinc-900 text-white overflow-hidden lg:flex-row">

	<!-- Mobile tab bar -->
	<nav class="lg:hidden flex shrink-0">
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest transition {activeTab === 'edit' ? 'bg-[#16754A] text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'edit'}
		>{t('ui.tab-edit')}</button>
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest transition {activeTab === 'preview' ? 'bg-[#16754A] text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'preview'}
		>{t('ui.tab-preview')}</button>
	</nav>

	<!-- LEFT: Form panel -->
	<aside
		class="flex flex-col border-zinc-800 w-full flex-1 min-h-0 lg:w-[480px] lg:flex-none lg:shrink-0 lg:border-r lg:h-full"
		style:display={isMobile && activeTab !== 'edit' ? 'none' : 'flex'}
	>
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="{base}/" class="text-zinc-300 rounded px-2 py-1 transition hover:text-white hover:bg-zinc-800" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest uppercase text-zinc-200">{t('ui.card-back')}</h1>
			</div>
			<div class="relative hidden lg:block">
				<div class="flex rounded-md overflow-hidden">
					<button
						onclick={exportCard}
						disabled={exporting}
						class="bg-[#16754A] px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1C965F] disabled:opacity-50"
					>
						{exporting ? t('ui.exporting') : t('ui.export-png')}
					</button>
					<button
						onclick={() => showDropdown = !showDropdown}
						disabled={exporting}
						class="bg-[#16754A] border-l border-[#125E3C] px-2 py-2 text-white transition hover:bg-[#1C965F] disabled:opacity-50"
						aria-label="More export options"
					>
						<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
					</button>
				</div>
				{#if showDropdown}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute right-0 top-full mt-1 z-10 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg"
						onmouseleave={() => showDropdown = false}
					>
						<button
							onclick={exportPrinterFriendly}
							class="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-md"
						>
							{t('ui.export-printer-friendly')}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-5">
			<div class="space-y-10 text-sm">
				<!-- Title -->
				<section>
					<label class="field-label" for="card-back-title">{t('ui.form-fighter')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
					<input
						id="card-back-title"
						class="field-input"
						type="text"
						bind:value={data.title}
						placeholder={t('ui.form-placeholder-card-back')}
					/>
				</section>

				<!-- Card Elements -->
				<section>
					<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={data.showFlippedName} class="h-4 w-4 rounded accent-[#16754A]" />
						<span class="text-zinc-200">{t('ui.form-show-flipped-name')}</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer mt-2">
						<input type="checkbox" bind:checked={data.showLogo} class="h-4 w-4 rounded accent-[#16754A]" />
						<span class="text-zinc-200">{t('ui.form-show-logo')}</span>
					</label>
					{#if data.showLogo}
						<div class="mt-2">
							<label class="sublabel" for="logo-size">{t('ui.form-logo-size')}</label>
							<input id="logo-size" type="range" min="80" max="400" step="10" bind:value={data.logoSize} class="w-full accent-[#16754A]" />
						</div>
					{/if}
				</section>

				<!-- Text Color -->
				<section>
					<span class="field-label">{t('ui.form-text-color')}</span>
					<div class="color-swatches">
						<button
							class="color-swatch swatch-white"
							class:is-selected={data.textColor === 'white'}
							onclick={() => data.textColor = 'white'}
							aria-label="White"
						></button>
						<button
							class="color-swatch swatch-black"
							class:is-selected={data.textColor === 'black'}
							onclick={() => data.textColor = 'black'}
							aria-label="Black"
						></button>
						<button
							class="color-swatch swatch-green"
							class:is-selected={data.textColor === 'green'}
							onclick={() => data.textColor = 'green'}
							aria-label="Green"
						></button>
					</div>
				</section>

				<!-- Background Image -->
				<section>
					<span class="field-label">{t('ui.form-background-image')}</span>
					{#if data.backgroundImage}
						<div class="flex items-center gap-3 mb-3">
							<img src={data.backgroundImage} alt="Preview" class="h-16 w-16 rounded object-cover" />
							<button
								class="text-xs text-zinc-400 underline hover:text-white"
								onclick={() => { data.backgroundImage = null; adjustMode = false; }}
							>
								{t('ui.form-remove')}
							</button>
						</div>
						<div class="hidden lg:block space-y-2">
							<div>
								<label class="sublabel" for="img-offset-x">{t('ui.form-position-x')} <span class="font-normal">({t('ui.form-position-x-hint')})</span></label>
								<input id="img-offset-x" type="range" min="0" max="100" bind:value={data.imageOffsetX} class="w-full accent-[#16754A]" />
							</div>
							<div>
								<label class="sublabel" for="img-offset-y">{t('ui.form-position-y')} <span class="font-normal">({t('ui.form-position-y-hint')})</span></label>
								<input id="img-offset-y" type="range" min="0" max="100" bind:value={data.imageOffsetY} class="w-full accent-[#16754A]" />
							</div>
							<div>
								<label class="sublabel" for="img-zoom">{t('ui.form-zoom')}</label>
								<input id="img-zoom" type="range" min="1" max="3" step="0.05" bind:value={data.imageZoom} class="w-full accent-[#16754A]" />
							</div>
						</div>
						<p class="lg:hidden text-sm text-zinc-500">{t('ui.adjust-image-hint-mobile')}</p>
					{:else}
						<label
							class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 transition hover:border-zinc-500"
						>
							<span class="text-zinc-300">{t('ui.form-click-to-upload')}</span>
							<span class="mt-1 text-xs text-zinc-400">PNG, JPG, WebP</span>
							<input type="file" accept="image/*" class="sr-only" onchange={handleImageUpload} />
						</label>
					{/if}
				</section>
			</div>
		</div>
	</aside>

	<!-- RIGHT: Card preview -->
	<main
		class="flex flex-col flex-1 min-h-0 items-center justify-start overflow-y-auto pt-6 lg:justify-center lg:pt-0 lg:h-full lg:overflow-hidden"
		style:display={isMobile && activeTab !== 'preview' ? 'none' : 'flex'}
	>
		<!-- Export button + adjust toggle: mobile only -->
		<div class="lg:hidden mb-4 flex items-center gap-3">
			<div class="relative">
				<div class="flex rounded-md overflow-hidden">
					<button
						onclick={exportCard}
						disabled={exporting}
						class="bg-[#16754A] px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1C965F] disabled:opacity-50"
					>
						{exporting ? t('ui.exporting') : t('ui.export-png')}
					</button>
					<button
						onclick={() => showDropdown = !showDropdown}
						disabled={exporting}
						class="bg-[#16754A] border-l border-[#125E3C] px-2 py-2 text-white transition hover:bg-[#1C965F] disabled:opacity-50"
						aria-label="More export options"
					>
						<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
					</button>
				</div>
				{#if showDropdown}
					<div class="absolute left-0 top-full mt-1 z-10 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg">
						<button
							onclick={exportPrinterFriendly}
							class="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-md"
						>
							{t('ui.export-printer-friendly')}
						</button>
					</div>
				{/if}
			</div>

			{#if data.backgroundImage}
				<button
					onclick={() => adjustMode = !adjustMode}
					class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition {adjustMode ? 'bg-[#16754A] text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
						<polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
						<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
					</svg>
					{adjustMode ? t('ui.done') : t('ui.adjust-image')}
				</button>
			{/if}
		</div>

		<!-- Card wrapper -->
		<div style="width: {574 * cardScale}px; height: {915 * cardScale}px; position: relative; flex-shrink: 0;">
			<div style="transform: scale({cardScale}); transform-origin: top left; position: absolute; top: 0; left: 0; display: inline-block; line-height: 0;">
				<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
					<div class="card" class:printer-friendly={printerFriendly} class:has-bg-image={!!data.backgroundImage} style="--card-text-color: {resolvedColor};">

						{#if data.backgroundImage}
							<img
								src={data.backgroundImage}
								alt=""
								style="position:absolute; inset:0; width:100%; height:100%; display:block; object-fit:cover; object-position:{data.imageOffsetX}% {data.imageOffsetY}%; transform:scale({data.imageZoom}); transform-origin:{data.imageOffsetX}% {data.imageOffsetY}%; border:0; outline:none; background:transparent; filter: {printerFriendly ? 'grayscale(1)' : 'none'};"
							/>
						{/if}
						<div class="name-overlay">
							{#if data.title}
								<p class="card-name" style="transform: translateY(calc(-50% - {namePerSide}px));">
									{#each titleLines as line, i}{#if i > 0}<br>{/if}{line}{/each}
								</p>
							{/if}
							{#if data.title && data.showFlippedName}
								<p class="card-name" style="transform: translateY(calc(-50% + {namePerSide}px)) rotate(180deg);">
									{#each titleLines as line, i}{#if i > 0}<br>{/if}{line}{/each}
								</p>
							{/if}
						</div>
						{#if data.showLogo}
							<div class="card-logo" style="background-color: {resolvedColor}; width: {data.logoSize}px; mask-image: {logoMaskUrl}; -webkit-mask-image: {logoMaskUrl};"></div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Touch overlay for image positioning (mobile only) -->
			{#if adjustMode && data.backgroundImage}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; touch-action: none; cursor: grab;"
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
				>
					<div class="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
						<svg class="w-10 h-10 text-white opacity-60 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
							<polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
							<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
						</svg>
					</div>
				</div>
			{/if}
		</div>
	</main>

</div>

{#if exportedImageUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex flex-col bg-black/90"
		onclick={() => exportedImageUrl = null}
	>
		<div class="flex items-center justify-between px-5 py-4 shrink-0">
			<p class="text-sm font-semibold" style="color: #fff">{t('ui.long-press-save')}</p>
			<button class="text-sm font-semibold px-3 py-1 rounded-full" style="color: #fff; background: rgba(255,255,255,0.2)" onclick={() => exportedImageUrl = null}>{t('ui.close')}</button>
		</div>
		<div class="flex-1 min-h-0 overflow-y-auto flex justify-center px-4 pb-6">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={exportedImageUrl}
				alt={t('ui.exported-card-alt')}
				class="w-full h-auto self-start rounded shadow-xl"
				style="max-width: 400px;"
				onclick={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}

<style>
	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
	}

	.sublabel {
		display: block;
		font-size: 0.65rem;
		color: var(--ui-field-label);
		margin-bottom: 2px;
	}

	.field-input {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--ui-text);
		font-size: 1rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #16754A;
	}

	/* ── Card back visual ───────────────────────── */

	.card {
		width: 574px;
		height: 915px;
		position: relative;
		overflow: hidden;
		background-color: #16754A;
		background-image: url('/background.jpg');
		background-size: cover;
		background-position: center;
		border: 0;
		outline: none;
	}

	.card * {
		border-width: 0;
		border-style: solid;
		outline: none;
		background: transparent;
	}

	.printer-friendly {
		background-image: none;
		background-color: #fff;
	}

	.has-bg-image {
		background-image: none;
	}

	.name-overlay {
		position: absolute;
		inset: 0;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-name {
		position: absolute;
		top: 50%;
		left: 2rem;
		right: 2rem;
		font-family: 'Grenze Gotisch', serif;
		font-size: 56px;
		font-weight: 400;
		line-height: 1.1;
		color: var(--card-text-color, #fff);
		text-align: center;
		word-break: break-word;
		margin: 0;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		aspect-ratio: 254.59 / 217.55;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		-webkit-mask-size: contain;
		mask-size: contain;
	}

	.color-swatches {
		display: flex;
		gap: 10px;
		margin-top: 4px;
	}

	.color-swatch {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s;
		padding: 0;
	}

	.color-swatch.is-selected {
		border-color: #16754A;
	}

	.swatch-white {
		background: #ffffff;
	}

	.swatch-black {
		background: #111111;
		border-color: rgba(255, 255, 255, 0.3);
	}

	.swatch-green {
		background: #16754A;
	}
</style>
