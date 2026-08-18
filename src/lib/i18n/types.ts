export interface LocaleMeta {
	language: string;
	code: string;
	dir: 'ltr' | 'rtl';
	contributors: string[];
}

export interface LocaleData {
	meta: LocaleMeta;
	ui: Record<string, string>;
	card: Record<string, string>;
}
