export interface FighterCardData {
	name: string;
	subtitle: string;
	modelImage: string | null; // data URL from file upload
	imageOffsetX: number; // 0–100, object-position x
	imageOffsetY: number; // 0–100, object-position y
	imageZoom: number;    // 1–3, scale factor
	imageCaption: string;
	goldCoinsValue: string;
	mayHireText: string;      // markup: **bold**, *italic*
	move: string;
	fight: string;
	shoot: string;
	defense: string;
	health: string;
	bravery: string;
	talentsText: string;      // markup: **bold**, *italic*, ^^uppercase^^
	keywords: string[];       // rendered comma-separated, uppercase
	isNamedCharacter: boolean;
	showSubtitle: boolean;
	showCaption: boolean;
}

export interface CardBackData {
	title: string;
	backgroundImage: string | null;
	imageOffsetX: number;
	imageOffsetY: number;
	imageZoom: number;
	textColor: 'white' | 'black' | 'green';
	showFlippedName: boolean;
	showLogo: boolean;
	logoSize: number; // px, width of the logo mark
}

export interface TextCardWeapon {
	name: string;
	range: string;
	attacks: string;
	damage: string;
	goldCoins: string;
}

export interface TextCardData {
	name: string;
	cardLabel: string;          // preset slug or custom string — see presetLabels in TextForm.svelte
	showFlavorText: boolean;
	showPrerequisite: boolean;  // forced off when cardLabel === 'weapon' — see TextForm.svelte
	flavorText: string;         // italic block; render order: flavor → weapon table (cardLabel 'weapon' only) → prerequisite → body
	weapons: TextCardWeapon[];  // weapon table rows, shown only when cardLabel === 'weapon'
	prerequisiteText: string;   // framed box
	bodyText: string;
	showCaption: boolean;
	imageCaption: string;
	smallBodyText: boolean;
}
