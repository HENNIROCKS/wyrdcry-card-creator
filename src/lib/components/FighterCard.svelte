<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { cardSize } from '$lib/card-size.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import WeaponTable from '$lib/components/WeaponTable.svelte';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';

	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	let { data, printerFriendly = false, exporting = false }: { data: FighterCardData; printerFriendly?: boolean; exporting?: boolean } = $props();

	function fittext(node: HTMLElement, _value?: unknown) {
		function fit() {
			node.style.fontSize = '';
			const max = node.clientWidth;
			let size = parseFloat(getComputedStyle(node).fontSize);
			while (node.scrollWidth > max && size > 8) {
				size -= 0.5;
				node.style.fontSize = `${size}px`;
			}
		}
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(node);
		return { update: () => requestAnimationFrame(fit), destroy: () => ro.disconnect() };
	}

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
				{:else}
					<div class="model-placeholder">
						{#if !exporting && !printerFriendly}<span>{t('card.upload-model-image')}</span>{/if}
					</div>
				{/if}
			</div>
		</div>
		<div class="image-header">
			<h1 class="fighter-name">
				{#if data.isNamedCharacter}<span class="chevron">«</span>{/if}
				{#each (data.name || t('card.fighter-name-placeholder')).split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}
				{#if data.isNamedCharacter}<span class="chevron">»</span>{/if}
			</h1>
			{#if data.showSubtitle && data.subtitle}
				<p class="fighter-subtitle">{data.subtitle}</p>
			{/if}
		</div>
	</div>

	<!-- Gold coins badge and may-hire box are off; the form fields are disabled to match.
	{#if data.mayHireText}
		<div class="may-hire-box">
			<p class="talents-text">{@html parseMarkup(data.mayHireText)}</p>
		</div>
	{/if}

	{#if data.goldCoinsValue}
		<div class="gold-coins-badge-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl};">
			<div class="gold-coins-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl};">
				<span class="gold-coins-text">{data.goldCoinsValue}</span>
				<span class="gold-coins-abbr">{t('card.gold-coins-abbr')}</span>
			</div>
		</div>
	{/if}
	-->

	<!-- PARCHMENT SECTION -->
	<div class="parchment" class:is-tight={data.showWeapons && data.weapons.length}>
		<!-- Characteristics box -->
		<div class="stats-box">
			<div class="stats-header">
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-move').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-fight').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-shoot').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-defense').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-health').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-bravery').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
				<div class="stat-col label-col"><span class="header-text">{#each t('card.col-base-size').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
			</div>
			<div class="stats-values">
				<div class="stat-val" class:stat-val-empty={!data.move} use:fittext={data.move}>{formatMove(data.move)}</div>
				<div class="stat-val" class:stat-val-empty={!data.fight} use:fittext={data.fight}>{data.fight || '—'}</div>
				<div class="stat-val" class:stat-val-empty={!data.shoot} use:fittext={data.shoot}>{data.shoot || '—'}</div>
				<div class="stat-val" class:stat-val-empty={!data.defense} use:fittext={data.defense}>{data.defense || '—'}</div>
				<div class="stat-val" class:stat-val-empty={!data.health} use:fittext={data.health}>{data.health || '—'}</div>
				<div class="stat-val" class:stat-val-empty={!data.bravery} use:fittext={data.bravery}>{formatBravery(data.bravery)}</div>
				<div class="stat-val" class:stat-val-narrow={data.baseSize?.includes('×')} use:fittext={data.baseSize}>{data.baseSize}</div>
			</div>
		</div>

		{#if data.showWeapons && data.weapons.length}
			<!-- Weapons box -->
			<WeaponTable weapons={data.weapons} tight {printerFriendly} />
		{/if}

		<!-- Talents box -->
		<div class="talents-box" use:fitTalentsBox={data.talentsText}>
			{#if data.talentsText}
				<p class="talents-text">{@html parseMarkup(data.talentsText)}</p>
			{:else if !exporting && !printerFriendly}
				<p class="talents-text talents-placeholder">{t('card.talents-placeholder')}</p>
			{/if}
		</div>

		{#if data.keywords.length}
			<div class="keywords-row">
				{#each data.keywords as keyword}
					<span class="keyword-pill">{keyword}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.showCaption && data.imageCaption}
		<div class="image-caption">{data.imageCaption}</div>
	{/if}
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
		margin: 5px 38px 0; /* left edge shares the parchment column's flush line */
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

	/* Same shape as the gold coins badge, cut from the runemark SVG. */
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

	.model-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FAF6F3;
		font-family: system-ui, sans-serif;
		font-size: 16px;
		line-height: 1.25;
		text-align: center;
		padding: 0 22px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-caption {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		text-align: center;
		font-family: 'Alegreya', serif;
		font-size: 13px;
		color: #000;
		opacity: 0.5;
		border: 0;
		outline: none;
		background: transparent;
	}

	.is-printer-friendly .image-caption {
		opacity: 1;
	}

	.may-hire-box {
		position: absolute;
		top: 248.7px; /* same vertical center as the gold coins badge */
		left: 78px;
		right: 38px;
		transform: translateY(-50%);
		box-sizing: border-box;
		border-radius: 7.5px;
		border: 1px dashed #16754A;
		background: url('/background.jpg') center center / cover no-repeat;
		padding: 10px 16px 10px 42px; /* left offset clears the badge, which paints on top */
	}

	.may-hire-box .talents-text {
		font-size: 14px;
	}

	.gold-coins-badge-border {
		position: absolute;
		top: 209.7px; /* image section's bottom edge (5px margin + 248.7px height − 39px half-height), nudged up 5px */
		left: 38px;
		width: 78px;
		height: 78px;
		background: #FAF6F3;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
	}

	.gold-coins-badge {
		width: 76px;
		height: 76px;
		background: #16754A;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
	}

	.gold-coins-text {
		font-family: 'Grenze Gotisch', serif;
		font-size: 42px;
		font-weight: 600;
		color: #FAF6F3;
		text-align: center;
		line-height: 1;
		border: 0;
		outline: none;
		background: transparent;
	}

	.gold-coins-abbr {
		font-family: 'Alegreya', serif;
		font-size: 1em;
		color: #FAF6F3;
		text-align: center;
		line-height: 1;
		border: 0;
		outline: none;
		background: transparent;
	}

	.is-printer-friendly .gold-coins-badge-border {
		background: #000;
	}

	.is-printer-friendly .gold-coins-badge {
		background: #fff;
	}

	.is-printer-friendly .gold-coins-text,
	.is-printer-friendly .gold-coins-abbr {
		color: #000;
	}

	/* ── PARCHMENT SECTION ─────────────────────── */

	.parchment {
		flex: 1 1 auto;
		min-height: 0;
		padding: 29px 38px 38px;
		display: flex;
		flex-direction: column;
		gap: 20px;
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
		font-size: 38px;
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
		height: 55px;
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
		font-size: 18px;
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
		font-size: 28px;
		font-weight: 400;
		color: #000;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		/* Grenze Gotisch's old-style figures sit 1–2px below the optical centre of
		   their line box, while values carrying a descender (2/4) sit slightly
		   above it. The padding lifts everything by 2px, which splits that. */
		padding: 0 6px 4px;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* Rectangular bases carry three glyph groups — start smaller so fittext has less to claw back. */
	.stat-val-narrow {
		font-size: 22px;
	}

	.stat-val-empty {
		font-size: 16px;
	}

	/* ── TALENTS BOX ───────────────────────────── */

	.header-text {
		color: #FAF6F3;
		font-family: 'Grenze Gotisch', serif;
		font-weight: 400;
		font-size: 18px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.talents-text {
		font-family: 'Alegreya', serif;
		font-size: 18px;
		color: #000;
		line-height: 1.5;
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

	.keywords-row {
		flex-shrink: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.keyword-pill {
		font-family: 'Alegreya', serif;
		font-size: 14px;
		line-height: 1;
		text-transform: uppercase;
		color: #000;
		background: #FFF;
		border: 1px solid #16754A;
		border-radius: 999px;
		padding: 7px 14px;
	}

	/* Weapons table active: the number rows and the outer spacing give up a few
	   pixels so the talents box keeps room. Text blocks are left alone. */
	.parchment.is-tight {
		padding: 24px 38px 30px;
		gap: 14px;
	}

	.parchment.is-tight .stats-header,
	.parchment.is-tight .stats-values {
		height: 46px;
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

	.is-printer-friendly .may-hire-box {
		border-color: #000;
		background: #fff;
	}

	.is-printer-friendly .stats-values {
		background: transparent;
	}

	.is-printer-friendly .talents-text {
		color: #000;
	}
</style>
