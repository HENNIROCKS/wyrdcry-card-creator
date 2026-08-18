<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';

	let { data }: { data: FighterCardData } = $props();
	let talentsTextEl: HTMLTextAreaElement;
	let mayHireTextEl: HTMLTextAreaElement;
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

	function wrapSelection(el: HTMLTextAreaElement, marker: string, field: 'talentsText' | 'mayHireText') {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = data[field].slice(start, end);
		data[field] = data[field].slice(0, start) + marker + selected + marker + data[field].slice(end);
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
	<!-- Name / Subtitle / Caption -->
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
		{#if data.showCaption}
			<label class="field-label mt-2" for="img-caption">{t('ui.form-caption')}</label>
			<input id="img-caption" class="field-input" type="text" placeholder={t('ui.form-placeholder-caption-fighter')} bind:value={data.imageCaption} />
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
				<input type="checkbox" bind:checked={data.showCaption} class="h-4 w-4 rounded accent-[#16754A]" />
				<span class="text-zinc-200">{t('ui.form-show-caption')}</span>
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

	<!-- Gold Coins -->
	<section>
		<p class="field-label mb-2">{t('ui.form-gold-coins')}</p>
		<div class="space-y-3">
			<div>
				<label class="sublabel" for="gold-coins-value">{t('ui.form-gold-coins-value')}</label>
				<input id="gold-coins-value" type="number" class="field-input" bind:value={data.goldCoinsValue} />
			</div>
			<div>
				<label class="sublabel" for="may-hire-text">{t('ui.form-may-hire')}</label>
				<div class="markup-toolbar">
					<button type="button" class="markup-btn caps" title={t('ui.form-uppercase')} onclick={() => wrapSelection(mayHireTextEl, '^^', 'mayHireText')}>AA</button>
				</div>
				<textarea
					id="may-hire-text"
					class="field-input resize-none"
					rows="4"
					bind:value={data.mayHireText}
					bind:this={mayHireTextEl}
				></textarea>
			</div>
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
				<label class="sublabel" for="defense">{t('ui.form-defense')}</label>
				<input id="defense" class="field-input text-center" placeholder="—" bind:value={data.defense} />
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
	</section>

	<!-- Talents -->
	<section>
		<label class="field-label" for="talents-text">{t('ui.form-talents')}</label>
		<div class="markup-toolbar">
			<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(talentsTextEl, '**', 'talentsText')}>B</button>
			<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(talentsTextEl, '*', 'talentsText')}>I</button>
			<button type="button" class="markup-btn caps" title={t('ui.form-uppercase')} onclick={() => wrapSelection(talentsTextEl, '^^', 'talentsText')}>AA</button>
		</div>
		<textarea
			id="talents-text"
			class="field-input resize-none"
			rows="8"
			bind:value={data.talentsText}
			bind:this={talentsTextEl}
		></textarea>
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
