<script lang="ts">
	import { cardSize } from '$lib/card-size.svelte';
	import type { FighterCardData } from '$lib/types';
	import { fittext } from '$lib/fit-text';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';
	import { t } from '$lib/i18n/index.svelte';
	import WeaponTable from '$lib/components/WeaponTable.svelte';

	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	let { data, printerFriendly = false, exporting = false }: { data: FighterCardData; printerFriendly?: boolean; exporting?: boolean } = $props();

	const hasFluff = $derived(data.showFluff && !!data.fluff.trim());
	const hasCampaign = $derived(!!data.goldCoins.trim() || !!data.renown.trim());

	const nameParts = $derived((data.name || t('card.fighter-name-placeholder')).split('|'));

	/* The longest line of the name sets its size: a name past 16 characters is set
	   smaller in proportion, down to 28px. */
	const nameChars = $derived(Math.max(1, ...nameParts.map((part) => part.trim().length)));

	/* Without a picture the image field carries the fighter's initials: first and
	   last word of the name, or of the subtitle for a fighter without a name; a
	   hyphen or a line break divides words. A single word gives its first two
	   letters. */
	const initials = $derived.by(() => {
		const source = (data.name || (data.showSubtitle ? data.subtitle : '')).trim();
		if (!source) return '';
		const first = (word: string) => word.match(/\p{L}/u)?.[0] ?? '';
		const words = source.split(/[\s|-]+/).filter(Boolean);
		if (!words.length) return '';
		if (words.length > 1) return (first(words[0]) + first(words[words.length - 1])).toUpperCase();
		const [one = '', two = ''] = words[0].match(/\p{L}/gu) ?? [];
		return one.toUpperCase() + two.toLowerCase();
	});

	function fitTalentsBox(node: HTMLElement, _value?: unknown) {
		function fit() {
			const content = node.firstElementChild as HTMLElement | null;
			if (!content) return;
			content.style.fontSize = '';
			let size = parseFloat(getComputedStyle(content).fontSize);
			// higher floor than fittext's 8px — body copy stays legible where a single stat digit doesn't need to
			while (content.scrollHeight > node.clientHeight && size > 13) {
				size -= 0.5;
				content.style.fontSize = `${size}px`;
			}
		}
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(node);
		return { update: () => requestAnimationFrame(fit), destroy: () => ro.disconnect() };
	}

	function formatMove(value: string) {
		if (!value) return '—';
		return value === '0' ? value : `${value}"`;
	}

	function formatBravery(value: string) {
		return value ? `${value}+` : '—';
	}

	function parseMarkup(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/\^\^(.+?)\^\^/g, '<span class="caps">$1</span>');
	}

</script>

<div class="card" class:is-printer-friendly={printerFriendly} style="--card-w: {cardSize.portrait.w}px; --card-h: {cardSize.portrait.h}px">
	<!-- IMAGE SECTION -->
	<div class="image-section">
		<div class="image-box">
			<div class="image-inner" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl};">
				{#if data.modelImage}
					<img class="model-img" src={data.modelImage} alt="Fighter" style="object-position: {data.imageOffsetX}% {data.imageOffsetY}%; transform: scale({data.imageZoom}); transform-origin: {data.imageOffsetX}% {data.imageOffsetY}%" />
				{/if}
			</div>
			{#if !data.modelImage && initials}<span class="initials" aria-hidden="true">{initials}</span>{/if}
		</div>
		<div class="image-header">
			<h1 class="fighter-name" style="--chars: {nameChars}">
				{#if data.isNamedCharacter}<span class="chevron">«</span>{/if}
				{#each nameParts as part, i}{#if i > 0}<br>{/if}{part}{/each}
				{#if data.isNamedCharacter}<span class="chevron">»</span>{/if}
			</h1>
			{#if data.showSubtitle && data.subtitle}
				<p class="fighter-subtitle">{data.subtitle}</p>
			{/if}
		</div>
	</div>

	<!-- PARCHMENT SECTION -->
	<div class="parchment">
		{#if hasFluff}
			<p class="fluff">{data.fluff}</p>
		{/if}

		{#if data.keywords.length}
			<div class="keywords-row">
				{#each data.keywords as keyword}
					<span class="keyword-pill">{keyword}</span>
				{/each}
			</div>
		{/if}

		<div class="profile">
			<!-- Characteristics box -->
			<div class="stats-box">
				<div class="stats-header">
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-move').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-fight').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-shoot').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-armour').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-health').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
					<div class="stat-col label-col"><span class="header-text">{#each t('card.col-bravery').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				</div>
				<div class="stats-values">
					<div class="stat-val" use:fittext={data.move}>{formatMove(data.move)}</div>
					<div class="stat-val" use:fittext={data.fight}>{data.fight || '—'}</div>
					<div class="stat-val" use:fittext={data.shoot}>{data.shoot || '—'}</div>
					<div class="stat-val" use:fittext={data.armour}>{data.armour || '—'}</div>
					<div class="stat-val" use:fittext={data.health}>{data.health || '—'}</div>
					<div class="stat-val" use:fittext={data.bravery}>{formatBravery(data.bravery)}</div>
				</div>
			</div>

			<!-- Campaign box, left out while neither value is set -->
			{#if hasCampaign}
				<div class="stats-box">
					<div class="stats-header">
						<div class="stat-col label-col"><span class="header-text">{t('card.col-gold-coins').replaceAll('|', '')}</span></div>
						<div class="stat-col label-col"><span class="header-text">{t('card.col-renown')}</span></div>
					</div>
					<div class="stats-values">
						<div class="stat-val" use:fittext={data.goldCoins}>{data.goldCoins || '—'}</div>
						<div class="stat-val" use:fittext={data.renown}>{data.renown || '—'}</div>
					</div>
				</div>
			{/if}

			{#if data.weapons.length}
				<!-- Weapons box -->
				<WeaponTable weapons={data.weapons} tight {printerFriendly} />
			{/if}
		</div>

		<!-- Talents box -->
		<div class="talents-box" use:fitTalentsBox={data.talentsText}>
			{#if data.talentsText}
				<p class="talents-text">{@html parseMarkup(data.talentsText)}</p>
			{:else if !exporting && !printerFriendly}
				<p class="talents-text talents-placeholder">{t('card.talents-placeholder')}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	/* 2× scale: 1mm = 7.559px (2 × 96/25.4) */

	/* dom-to-image-more fix: serialization preserves border-style:solid (from
	   Tailwind preflight) but drops border-width:0, so UA-default width kicks in.
	   border:0 sets style:none too, which survives. Mirrors TextCard approach. */
	.card * {
		border: 0;
		outline: none;
		background: transparent;
	}

	/* Dimensions come from the card-size store (bridge/poker) via inline vars. */
	.card {
		width: var(--card-w);
		height: var(--card-h);
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: url('/background.jpg') center center / cover no-repeat;
		border: 0;
		outline: none;
	}

	/* ── IMAGE SECTION ─────────────────────────── */

	.image-section {
		flex: 0 0 175px;
		margin: 16px 38px 0 30px; /* left edge shares the parchment column's flush line */
		display: flex;
		gap: 12px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-box {
		flex: 0 0 175px;
		position: relative;
		top: 10px; /* nudged down, closer to the characteristics table */
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-header {
		flex: 1 1 auto;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 8px;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* Cut from the runemark SVG. */
	.image-inner {
		position: absolute;
		inset: 0;
		background: #16754A;
		border: 0;
		outline: none;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
	}

	.model-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* A watermark over the empty field; decoration, the name beside it carries
	   the text. */
	.initials {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Grenze Gotisch', serif;
		font-weight: 600;
		font-size: 100px;
		line-height: 1;
		color: rgba(255, 255, 255, 0.32);
		pointer-events: none;
	}

	.is-printer-friendly .initials {
		color: rgba(0, 0, 0, 0.2);
	}

	/* ── PARCHMENT SECTION ─────────────────────── */

	.parchment {
		flex: 1 1 auto;
		min-height: 0;
		padding: 24px 30px 26px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.chevron {
		display: inline;
		border: 0;
		outline: none;
	}

	.fighter-name {
		font-family: 'Grenze Gotisch', serif;
		font-weight: 600;
		font-size: clamp(28px, calc(38px * 16 / var(--chars, 16)), 38px);
		width: 100%;
		color: #000;
		line-height: 1.1;
		margin: 0;
		text-align: center;
		border: 0;
		outline: none;
		background: transparent;
	}

	.fighter-subtitle {
		display: block;
		width: 100%;
		font-family: 'Grenze Gotisch', serif;
		font-size: 20px;
		line-height: 1.3;
		color: #000;
		text-align: center;
		margin: 4px 0 0;
		white-space: normal;
		overflow-wrap: break-word;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* Prose, not a rule: no wash, no border, set apart only by the italic. */
	.fluff {
		flex-shrink: 0;
		margin: 14px 0 0;
		font-family: 'Alegreya', serif;
		font-size: 18px;
		line-height: 1.4;
		font-style: italic;
		color: #000;
		white-space: pre-wrap;
	}

	/* The tables read as one block: the parchment's gap between them, roughly
	   twice that to the keywords above and the talents below. */
	.profile {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-bottom: 16px;
	}

	/* ── SHARED BOX STYLE ──────────────────────── */

	.stats-box {
		width: 100%;
		flex-shrink: 0;
		border-radius: 7.5px;
		border: 1px solid #16754A;
	}

	.talents-box {
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
		border-radius: 7.5px;
		overflow: hidden;
	}

	/* ── CHARACTERISTICS BOX ───────────────────── */

	.stats-header,
	.stats-values {
		display: flex;
		height: 46px;
		border: 0;
		outline: none;
	}

	.stats-values {
		border-radius: 0 0 6.5px 6.5px;
		background: rgba(255, 255, 255, 0.25);
	}

	.stats-header {
		background: #16754A;
		border-radius: 6.5px 6.5px 0 0;
	}

	.stat-col {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		background: transparent;
	}

	.label-col {
		flex-direction: column;
		line-height: 1.15;
		font-family: 'Grenze Gotisch', serif;
		font-size: 20px;
		font-weight: 400;
		font-style: normal;
		text-align: center;
		background: url('/background.jpg') center center / cover no-repeat;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		border: 0;
		outline: none;
	}

	.stat-val {
		flex: 1 1 0;
		font-family: 'Grenze Gotisch', serif;
		font-size: 20px;
		font-weight: 400;
		color: #000;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		/* Grenze Gotisch defaults to old-style figures, which hang below the
		   baseline. The lining set matches the column labels; the tabular one
		   keeps the digits of a column over each other. */
		font-variant-numeric: lining-nums tabular-nums;
		padding: 0 4px;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* ── TALENTS BOX ───────────────────────────── */

	.header-text {
		color: #FAF6F3;
		font-family: 'Grenze Gotisch', serif;
		font-weight: 400;
		font-size: 20px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.talents-text {
		font-family: 'Alegreya', serif;
		font-size: 18px;
		color: #000;
		line-height: 1.3;
		margin: 0;
		text-align: left;
		white-space: pre-wrap;
		border: 0;
		outline: none;
		background: transparent;
	}

	.talents-text :global(strong),
	.talents-text :global(em),
	.talents-text :global(.caps) {
		border: 0;
		outline: none;
		background: transparent;
	}

	.talents-text :global(.caps) {
		text-transform: uppercase;
	}

	.talents-placeholder {
		color: #5a4030;
		opacity: 0.6;
		font-style: italic;
	}

	/* ── KEYWORDS ──────────────────────────────── */

	/* Parts the image section from the profile more than the parchment's own gap
	   does, so the pills read with the name above rather than the
	   characteristics below. */
	.keywords-row {
		flex-shrink: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin: 16px 0;
	}

	.keyword-pill {
		font-family: 'Alegreya', serif;
		font-size: 14px;
		line-height: 1;
		text-transform: uppercase;
		color: #000;
		background: rgba(255, 255, 255, 0.25);
		border: 1px solid #16754A;
		border-radius: 999px;
		padding: 7px 14px;
	}

	/* ── PRINTER-FRIENDLY OVERRIDES ────────────── */

	.is-printer-friendly {
		background: #fff;
	}

	.is-printer-friendly .image-inner {
		background: #e8e8e8;
	}

	.is-printer-friendly .stats-box {
		border-color: #000;
	}

	.is-printer-friendly .stats-header {
		background: transparent;
	}

	.is-printer-friendly .label-col {
		background: none;
		-webkit-background-clip: unset;
		background-clip: unset;
		color: #000;
	}

	.is-printer-friendly .header-text {
		color: #000;
	}

	.is-printer-friendly .keyword-pill {
		border-color: #000;
		background: transparent;
	}

	.is-printer-friendly .stats-values {
		background: transparent;
	}

	.is-printer-friendly .talents-text {
		color: #000;
	}
</style>
