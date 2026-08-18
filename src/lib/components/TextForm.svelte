<script lang="ts">
	import type { TextCardData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';

	let { data }: { data: TextCardData } = $props();
	let bodyTextEl: HTMLTextAreaElement;
	let prerequisiteTextEl: HTMLTextAreaElement;

	const presetLabels = ['trait', 'ability', 'reaction', 'weapon', 'equipment'];
	let selectValue = $state(presetLabels.includes(data.cardLabel) ? data.cardLabel : '__custom__');
	let customText = $state(presetLabels.includes(data.cardLabel) ? '' : data.cardLabel);

	$effect(() => {
		data.cardLabel = selectValue === '__custom__' ? customText : selectValue;
		if (data.cardLabel === 'weapon') data.showPrerequisite = false;
	});

	function wrapSelection(el: HTMLTextAreaElement, marker: string, field: 'bodyText' | 'prerequisiteText') {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = data[field].slice(start, end);
		data[field] = data[field].slice(0, start) + marker + selected + marker + data[field].slice(end);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + marker.length, end + marker.length);
		});
	}

	function addWeapon() {
		data.weapons = [...data.weapons, { name: '', range: '', attacks: '', damage: '', goldCoins: '' }];
	}

	function removeWeapon(i: number) {
		data.weapons = data.weapons.filter((_, idx) => idx !== i);
	}
</script>

<div class="space-y-10 text-sm">

	<!-- Card Name + Type -->
	<section>
		<label class="field-label" for="card-label">{t('ui.form-type')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-select')})</span> {#if selectValue === '__custom__'}<span class="normal-case font-normal text-zinc-500">{customText.length}/30</span>{/if}</label>
		<select id="card-label" class="field-input" bind:value={selectValue}>
			<option value="trait">{t('card.label-trait')}</option>
			<option value="ability">{t('card.label-ability')}</option>
			<option value="reaction">{t('card.label-reaction')}</option>
			<option value="weapon">{t('card.label-weapon')}</option>
			<option value="equipment">{t('card.label-equipment')}</option>
			<option value="__custom__">{t('ui.form-custom')}</option>
		</select>
		{#if selectValue === '__custom__'}
			<input
				class="field-input mt-2"
				type="text"
				placeholder={t('ui.form-custom-label')}
				maxlength="30"
				bind:value={customText}
			/>
		{/if}
		<label class="field-label mt-2" for="card-name">{t('ui.form-card')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
		<input
			id="card-name"
			class="field-input"
			type="text"
			placeholder={t('card.card-name-placeholder')}
			bind:value={data.name}
		/>
		{#if data.showCaption}
			<label class="field-label mt-2" for="image-caption">{t('ui.form-caption')}</label>
			<input id="image-caption" class="field-input" type="text" placeholder={t('ui.form-placeholder-caption-text')} bind:value={data.imageCaption} />
		{/if}
	</section>

	<!-- Card Elements -->
	<section>
		<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
		<div class="flex flex-col gap-3">
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.showFlavorText} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-show-flavor-text')}</span>
			</label>
			{#if data.cardLabel !== 'weapon'}
				<label class="flex cursor-pointer items-center gap-3">
					<input type="checkbox" bind:checked={data.showPrerequisite} class="h-4 w-4 rounded accent-[#16754A]" />
					<span class="text-zinc-200">{t('ui.form-show-prerequisite')}</span>
				</label>
			{/if}
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.showCaption} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-show-caption')}</span>
			</label>
		</div>
	</section>

	<!-- Text -->
	{#if data.showFlavorText}
		<section>
			<label class="field-label" for="flavor-text">{t('ui.form-flavor-text')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-italic')})</span></label>
			<textarea
				id="flavor-text"
				class="field-input resize-none"
				rows="3"
				bind:value={data.flavorText}
			></textarea>
		</section>
	{/if}

	{#if data.cardLabel === 'weapon'}
		<section>
			<p class="field-label mb-2">{t('ui.form-weapon-name')}</p>
			<div class="weapon-grid">
				<label class="sublabel" for="weapon-name-0">{t('ui.form-weapon-name')}</label>
				<label class="sublabel" for="weapon-range-0">{t('ui.form-weapon-range')}</label>
				<label class="sublabel" for="weapon-attacks-0">{t('ui.form-weapon-attacks')}</label>
				<label class="sublabel" for="weapon-damage-0">{t('ui.form-weapon-damage')}</label>
				<label class="sublabel" for="weapon-gold-coins-0">{t('ui.form-weapon-gold-coins')}</label>
				<span></span>
				{#each data.weapons as weapon, i}
					<input id="weapon-name-{i}" class="field-input text-center" type="text" maxlength="30" placeholder={t('ui.form-weapon-name')} aria-label={t('ui.form-weapon-name')} bind:value={weapon.name} />
					<input id="weapon-range-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-range')} aria-label={t('ui.form-weapon-range')} bind:value={weapon.range} />
					<input id="weapon-attacks-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-attacks')} aria-label={t('ui.form-weapon-attacks')} bind:value={weapon.attacks} />
					<input id="weapon-damage-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-damage')} aria-label={t('ui.form-weapon-damage')} bind:value={weapon.damage} />
					<input id="weapon-gold-coins-{i}" class="field-input text-center" type="text" placeholder={t('ui.form-weapon-gold-coins')} aria-label={t('ui.form-weapon-gold-coins')} bind:value={weapon.goldCoins} />
					<button
						type="button"
						class="weapon-remove"
						disabled={data.weapons.length <= 1}
						aria-label="{t('ui.form-remove')} {i + 1}"
						onclick={() => removeWeapon(i)}
					>×</button>
				{/each}
			</div>
			<button type="button" class="weapon-add" onclick={addWeapon}>+ {t('ui.form-add-weapon')}</button>
		</section>
	{/if}

	{#if data.showPrerequisite}
		<section>
			<label class="field-label" for="prerequisite-text">{t('ui.form-prerequisite')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-framed')})</span></label>
			<div class="markup-toolbar">
				<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(prerequisiteTextEl, '**', 'prerequisiteText')}>B</button>
				<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(prerequisiteTextEl, '*', 'prerequisiteText')}>I</button>
				<button type="button" class="markup-btn" class:active={data.smallBodyText} title={t('ui.form-small-text')} onclick={() => data.smallBodyText = !data.smallBodyText}>A↓</button>
			</div>
			<textarea
				id="prerequisite-text"
				class="field-input resize-none"
				rows="3"
				bind:value={data.prerequisiteText}
				bind:this={prerequisiteTextEl}
			></textarea>
		</section>
	{/if}

	<section>
		<label class="field-label" for="body-text">{t('ui.form-text')}</label>
		<div class="markup-toolbar">
			<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(bodyTextEl, '**', 'bodyText')}>B</button>
			<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(bodyTextEl, '*', 'bodyText')}>I</button>
			<button type="button" class="markup-btn" class:active={data.smallBodyText} title={t('ui.form-small-text')} onclick={() => data.smallBodyText = !data.smallBodyText}>A↓</button>
		</div>
		<textarea
			id="body-text"
			class="field-input resize-none"
			rows="8"
			bind:value={data.bodyText}
			bind:this={bodyTextEl}
		></textarea>
	</section>

</div>

<style>
	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
	}

	.sublabel {
		display: block;
		font-size: 0.65rem;
		color: var(--ui-field-label);
		margin-bottom: 2px;
	}

	.weapon-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
		gap: 8px;
		align-items: center;
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

	.weapon-remove:hover:not(:disabled) {
		border-color: #16754A;
	}

	.weapon-remove:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.weapon-add {
		margin-top: 8px;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 5px 12px;
		border-radius: 6px;
		border: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		cursor: pointer;
	}

	.weapon-add:hover {
		border-color: #16754A;
	}

	@media (max-width: 1023px) {
		.weapon-grid {
			grid-template-columns: 1fr 1fr;
		}

		.weapon-grid label,
		.weapon-grid span {
			display: none;
		}
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

	.markup-btn.active {
		background: #16754A;
		border-color: #16754A;
		color: #fff;
	}

	.markup-btn:hover {
		border-color: #16754A;
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

	@media (max-width: 1023px) {
		.markup-btn {
			font-size: 1rem;
			padding: 12px 20px;
		}
	}
</style>
