/**
 * Svelte action: shrinks the node's font size in half-pixel steps until its text
 * fits its width on one line, no further than `min` pixels. Refits on resize and
 * whenever the action's parameter – the text it holds – changes.
 */
export function fittext(node: HTMLElement, _value?: unknown, min = 8) {
	function fit() {
		node.style.fontSize = '';
		const max = node.clientWidth;
		let size = parseFloat(getComputedStyle(node).fontSize);
		while (node.scrollWidth > max && size > min) {
			size -= 0.5;
			node.style.fontSize = `${size}px`;
		}
	}
	fit();
	const ro = new ResizeObserver(fit);
	ro.observe(node);
	return { update: () => requestAnimationFrame(fit), destroy: () => ro.disconnect() };
}
