<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';

	type Row = { name: string; range: string; attacks: string; damage: string; goldCoins?: string };

	let {
		weapons,
		showGoldCoins = false,
		tight = false,
		printerFriendly = false
	}: { weapons: Row[]; showGoldCoins?: boolean; tight?: boolean; printerFriendly?: boolean } = $props();

	function formatRange(value: string) {
		if (!value) return '—';
		return value === '0' ? value : `${value}"`;
	}
</script>

<div class="weapon-box" class:is-tight={tight} class:is-printer-friendly={printerFriendly}>
	<div class="weapon-header">
		<div class="weapon-col weapon-col-name"><span class="header-text">{weapons.length > 1 ? t('card.col-weapon-plural') : t('card.col-weapon')}</span></div>
		<div class="weapon-col"><span class="header-text">{#each t('card.col-range').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
		<div class="weapon-col"><span class="header-text">{t('card.col-attacks')}</span></div>
		<div class="weapon-col"><span class="header-text">{t('card.col-damage')}</span></div>
		{#if showGoldCoins}
			<div class="weapon-col"><span class="header-text">{#each t('card.col-gold-coins').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</span></div>
		{/if}
	</div>
	{#each weapons as weapon}
		<div class="weapon-values">
			<div class="weapon-val weapon-val-name">{weapon.name || '—'}</div>
			<div class="weapon-val">{formatRange(weapon.range)}</div>
			<div class="weapon-val">{weapon.attacks || '—'}</div>
			<div class="weapon-val">{weapon.damage || '—'}</div>
			{#if showGoldCoins}
				<div class="weapon-val">{weapon.goldCoins || '—'}</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	/* dom-to-image-more fix: serialization preserves border-style:solid (from
	   Tailwind preflight) but drops border-width:0, so UA-default width kicks in.
	   The card components carry the same rule; scoped styles stop at the component
	   boundary, so it has to be repeated here. */
	.weapon-box * {
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-box {
		width: 100%;
		flex-shrink: 0;
		border-radius: 7.5px;
		border: 1px solid #16754A;
	}

	.weapon-header {
		display: flex;
		height: 55px;
		background: #16754A;
		border-radius: 6.5px 6.5px 0 0;
	}

	.weapon-values {
		display: flex;
		min-height: 55px;
		background: rgba(255, 255, 255, 0.25);
	}

	.weapon-values:nth-child(odd) {
		background: rgba(22, 117, 74, 0.12);
	}

	.weapon-values:last-child {
		border-radius: 0 0 6.5px 6.5px;
	}

	/* Tight rows buy the surrounding card vertical space. */
	.weapon-box.is-tight .weapon-header {
		height: 46px;
	}

	.weapon-box.is-tight .weapon-values {
		min-height: 46px;
	}

	.weapon-col {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1.15;
		text-align: center;
	}

	.weapon-col-name {
		flex: 2 2 0;
		justify-content: flex-start;
		text-align: left;
		padding-left: 16px;
	}

	.header-text {
		color: #FAF6F3;
		font-family: 'Grenze Gotisch', serif;
		font-weight: 400;
		font-size: 18px;
		text-align: center;
	}

	.weapon-val {
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
		padding: 0 6px;
	}

	.weapon-val-name {
		flex: 2 2 0;
		font-size: 22px;
		white-space: normal;
		justify-content: flex-start;
		text-align: left;
		padding-left: 16px;
	}

	.weapon-box.is-printer-friendly {
		border-color: #000;
	}

	.weapon-box.is-printer-friendly .weapon-header,
	.weapon-box.is-printer-friendly .weapon-values,
	.weapon-box.is-printer-friendly .weapon-values:nth-child(odd) {
		background: transparent;
	}

	.weapon-box.is-printer-friendly .header-text {
		color: #000;
	}
</style>
