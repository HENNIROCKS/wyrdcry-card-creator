<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';

	let { data }: { data: FighterCardData } = $props();
	let talentsTextEl: HTMLTextAreaElement;
	let keywordDraft = $state('');

	function handleImageUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			data.modelImage = ev.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	// The weapons table is capped at three rows, same as the text card.
	const MAX_WEAPONS = 3;

	function addWeapon() {
		if (data.weapons.length >= MAX_WEAPONS) return;
		data.weapons = [...data.weapons, { name: '', range: '', attacks: '', damage: '' }];
	}

	function removeWeapon(i: number) {
		data.weapons = data.weapons.filter((_, idx) => idx !== i);
	}

	function wrapSelection(el: HTMLTextAreaElement, marker: string) {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = data.talentsText.slice(start, end);
		data.talentsText = data.talentsText.slice(0, start) + marker + selected + marker + data.talentsText.slice(end);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + marker.length, end + marker.length);
		});
	}

	function commitKeyword() {
		const value = keywordDraft.trim();
		if (value) data.keywords = [...data.keywords, value];
		keywordDraft = '';
	}

	function handleKeywordKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			commitKeyword();
		} else if (e.key === 'Backspace' && !keywordDraft && data.keywords.length) {
			data.keywords = data.keywords.slice(0, -1);
		}
	}

	function removeKeyword(i: number) {
		data.keywords = data.keywords.filter((_, idx) => idx !== i);
	}
</script>

<div class="space-y-10 text-sm">
	<!-- Name / Subtitle / Fluff -->
	<section>
		<label class="field-label" for="fighter-name">{t('ui.form-fighter')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
		<input
			id="fighter-name"
			class="field-input"
			type="text"
			bind:value={data.name}
			placeholder={t('ui.form-placeholder-fighter')}
		/>
		{#if data.showSubtitle}
			<label class="field-label mt-2" for="fighter-subtitle">{t('ui.form-subtitle')} <span class="normal-case font-normal text-zinc-500">{(data.subtitle ?? '').length}/120</span></label>
			<input
				id="fighter-subtitle"
				class="field-input"
				type="text"
				maxlength="120"
				bind:value={data.subtitle}
			/>
		{/if}
		{#if data.showFluff}
			<label class="field-label mt-2" for="fighter-fluff">{t('ui.form-fluff')}</label>
			<textarea id="fighter-fluff" class="field-input resize-none" rows="3" bind:value={data.fluff}></textarea>
		{/if}
	</section>

	<!-- Card Elements -->
	<section>
		<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
		<div class="flex flex-col gap-3">
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.isNamedCharacter} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-named-fighter')}</span>
			</label>
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.showSubtitle} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-show-subtitle')}</span>
			</label>
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.showFluff} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-show-fluff')}</span>
			</label>
		</div>
	</section>

	<!-- Model Image -->
	<section>
		<span class="field-label">{t('ui.form-model-image')}</span>
		{#if data.modelImage}
			<div class="flex items-center gap-3 mb-3">
				<img src={data.modelImage} alt="Preview" class="h-16 w-16 rounded object-cover" />
				<button
					class="text-xs text-zinc-400 underline hover:text-white"
					onclick={() => (data.modelImage = null)}
				>
					{t('ui.form-remove')}
				</button>
			</div>
			<div class="space-y-2">
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
			</div>
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

	<!-- Keywords -->
	<section>
		<label class="field-label" for="keywords-input">{t('ui.form-keywords')}</label>
		<div class="tags-wrap">
			{#each data.keywords as keyword, i}
				<span class="tag-chip">
					{keyword}
					<button type="button" class="tag-remove" aria-label={t('ui.form-remove')} onclick={() => removeKeyword(i)}>×</button>
				</span>
			{/each}
			<input
				id="keywords-input"
				class="tag-input"
				type="text"
				placeholder={t('ui.form-keywords-placeholder')}
				bind:value={keywordDraft}
				onkeydown={handleKeywordKeydown}
				onblur={commitKeyword}
			/>
		</div>
	</section>

	<!-- Characteristics -->
	<section>
		<p class="field-label mb-2">{t('ui.form-characteristics')}</p>
		<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
			<div>
				<label class="sublabel" for="move">{t('ui.form-move')}</label>
				<input id="move" class="field-input text-center" placeholder="—" bind:value={data.move} />
			</div>
			<div>
				<label class="sublabel" for="fight">{t('ui.form-fight')}</label>
				<input id="fight" class="field-input text-center" placeholder="—" bind:value={data.fight} />
			</div>
			<div>
				<label class="sublabel" for="shoot">{t('ui.form-shoot')}</label>
				<input id="shoot" class="field-input text-center" placeholder="—" bind:value={data.shoot} />
			</div>
			<div>
				<label class="sublabel" for="armour">{t('ui.form-armour')}</label>
				<input id="armour" class="field-input text-center" placeholder="—" bind:value={data.armour} />
			</div>
			<div>
				<label class="sublabel" for="health">{t('ui.form-health')}</label>
				<input id="health" class="field-input text-center" placeholder="—" bind:value={data.health} />
			</div>
			<div>
				<label class="sublabel" for="bravery">{t('ui.form-bravery')}</label>
				<input id="bravery" class="field-input text-center" placeholder="—" bind:value={data.bravery} />
			</div>
		</div>
		<div class="mt-2 grid grid-cols-2 gap-2">
			<div>
				<label class="sublabel" for="gold-coins">{t('ui.form-weapon-gold-coins')}</label>
				<input id="gold-coins" class="field-input text-center" inputmode="numeric" placeholder="—" bind:value={data.goldCoins} />
			</div>
			<div>
				<label class="sublabel" for="renown">{t('ui.form-renown')}</label>
				<input id="renown" class="field-input text-center" inputmode="numeric" placeholder="—" bind:value={data.renown} />
			</div>
		</div>
	</section>

	<!-- Weapons -->
	<section>
		<p class="field-label mb-2">{t('ui.form-weapons')}</p>
		<div class="weapon-grid">
			<label class="sublabel" for="weapon-name-0">{t('ui.form-weapon-name')}</label>
			<label class="sublabel" for="weapon-range-0">{t('ui.form-weapon-range')}</label>
			<label class="sublabel" for="weapon-attacks-0">{t('ui.form-weapon-attacks')}</label>
			<label class="sublabel" for="weapon-damage-0">{t('ui.form-weapon-damage')}</label>
			<span></span>
			{#each data.weapons as weapon, i}
				<input id="weapon-name-{i}" class="field-input text-center" type="text" maxlength="30" placeholder={t('ui.form-weapon-name')} aria-label={t('ui.form-weapon-name')} bind:value={weapon.name} />
				<input id="weapon-range-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-range')} aria-label={t('ui.form-weapon-range')} bind:value={weapon.range} />
				<input id="weapon-attacks-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-attacks')} aria-label={t('ui.form-weapon-attacks')} bind:value={weapon.attacks} />
				<input id="weapon-damage-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-damage')} aria-label={t('ui.form-weapon-damage')} bind:value={weapon.damage} />
				<button
					type="button"
					class="weapon-remove"
					disabled={data.weapons.length <= 1}
					aria-label="{t('ui.form-remove')} {i + 1}"
					onclick={() => removeWeapon(i)}
				>×</button>
			{/each}
		</div>
		<div class="mt-2 flex items-center gap-2.5">
			<button
				type="button"
				class="weapon-add"
				aria-disabled={data.weapons.length >= MAX_WEAPONS}
				aria-describedby={data.weapons.length >= MAX_WEAPONS ? 'weapon-limit' : undefined}
				onclick={addWeapon}
			>+ {t('ui.form-add-weapon')}</button>
			{#if data.weapons.length >= MAX_WEAPONS}
				<span id="weapon-limit" class="weapon-limit">{t('ui.form-weapon-limit')}</span>
			{/if}
		</div>
	</section>

	<!-- Talents -->
	<section>
		<label class="field-label" for="talents-text">{t('ui.form-talents')}</label>
		<div class="markup-toolbar">
			<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(talentsTextEl, '**')}>B</button>
			<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(talentsTextEl, '*')}>I</button>
			<button type="button" class="markup-btn caps" title={t('ui.form-uppercase')} onclick={() => wrapSelection(talentsTextEl, '^^')}>AA</button>
		</div>
		<textarea
			id="talents-text"
			class="field-input resize-none"
			rows="8"
			bind:value={data.talentsText}
			bind:this={talentsTextEl}
		></textarea>
	</section>
</div>

<style>
	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
		text-transform: uppercase;
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

	.markup-toolbar {
		display: flex;
		gap: 4px;
		margin-bottom: 4px;
	}

	.markup-btn {
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1;
		padding: 3px 8px;
		border-radius: 4px;
		border: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		cursor: pointer;
	}

	.markup-btn.italic {
		font-style: italic;
	}

	.markup-btn.caps {
		text-transform: uppercase;
	}

	.markup-btn:hover {
		border-color: #16754A;
	}

	@media (max-width: 1023px) {
		.markup-btn {
			font-size: 1rem;
			padding: 12px 20px;
		}
	}

	.weapon-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr auto;
		gap: 8px;
		align-items: center;
	}

	.weapon-limit {
		font-size: 0.7rem;
		color: var(--ui-field-label);
	}

	.weapon-remove {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.weapon-remove:hover:not(:disabled),
	.weapon-remove:focus-visible {
		border-color: #16754A;
	}

	.weapon-remove:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.weapon-add {
		font-size: 0.8rem;
		font-weight: 700;
		padding: 5px 12px;
		border-radius: 6px;
		border: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		cursor: pointer;
	}

	.weapon-add:hover:not([aria-disabled='true']),
	.weapon-add:focus-visible {
		border-color: #16754A;
	}

	.weapon-add[aria-disabled='true'] {
		opacity: 0.35;
		cursor: not-allowed;
	}

	@media (max-width: 1023px) {
		.weapon-grid {
			grid-template-columns: 1fr 1fr;
		}

		.weapon-grid label,
		.weapon-grid > span:empty {
			display: none;
		}

		/* Own row: with an odd cell count the next weapon would otherwise start mid-row. */
		.weapon-remove {
			grid-column: 1 / -1;
			justify-self: end;
		}
	}

	.tags-wrap {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		width: 100%;
		box-sizing: border-box;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		transition: border-color 0.15s;
	}

	.tags-wrap:focus-within {
		border-color: #16754A;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: #16754A;
		color: #fff;
		font-size: 0.85rem;
		line-height: 1;
		padding: 5px 6px 5px 10px;
		border-radius: 999px;
		text-transform: uppercase;
	}

	.tag-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: transparent;
		color: #fff;
		font-size: 0.9rem;
		line-height: 1;
		cursor: pointer;
	}

	.tag-remove:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.tag-input {
		flex: 1;
		min-width: 80px;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--ui-text);
		font-size: 1rem;
		padding: 4px 2px;
	}
</style>
