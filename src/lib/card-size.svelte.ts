export type CardSize = 'bridge' | 'poker';

export interface Dimensions {
	w: number;
	h: number;
}

export interface CardSizeSpec {
	labelKey: string;
	/** Printed size as the trade quotes it. Exact values are 57.15×88.9mm
	    (bridge) and 63.5×88.9mm (poker); print services list the rounded pair. */
	mmLabel: string;
	portrait: Dimensions;
}

/* Both sizes hold the 915px height and vary the width, because the parchment
   column is vertically tight. */
export const CARD_SIZES: Record<CardSize, CardSizeSpec> = {
	bridge: {
		labelKey: 'ui.card-size-bridge',
		mmLabel: '57 × 89',
		portrait: { w: 588, h: 915 },
	},
	poker: {
		labelKey: 'ui.card-size-poker',
		mmLabel: '63 × 88',
		portrait: { w: 654, h: 915 },
	},
};

/** PNG export runs at 2× the preview dimensions. */
export const EXPORT_SCALE = 2;

const STORAGE_KEY = 'warcry-card-size';

class CardSizeStore {
	current = $state<CardSize>('bridge');

	/* Restored at construction rather than from onMount, so the first client
	   render already uses the saved size instead of resizing after hydration. */
	constructor() {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved && saved in CARD_SIZES) this.current = saved as CardSize;
	}

	get spec() { return CARD_SIZES[this.current]; }
	get portrait() { return this.spec.portrait; }

	set(size: CardSize) {
		this.current = size;
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, size);
	}
}

export const cardSize = new CardSizeStore();
