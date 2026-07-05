import { TFile } from "obsidian";
import type { HomeView } from "./view";
import { effectiveBackground } from "./types";

/**
 * URL of the bundled default background. Served straight from the main branch
 * on GitHub so it works without depending on a specific release asset being
 * attached. Update the file at assets/default-bg.gif to ship a new image.
 */
const DEFAULT_BG_URL =
	"https://raw.githubusercontent.com/ondreu/Hearth/refs/heads/main/assets/default-bg.gif";

/**
 * Apply the optional, customizable background as a separate layer behind the
 * content so opacity/blur don't affect the foreground. Uses the active
 * dashboard's override when set, otherwise the global default.
 */
export function applyBackground(view: HomeView, root: HTMLElement): void {
	const bg = effectiveBackground(view.plugin.settings);
	if (bg.kind === "none") return;
	// "default" uses the bundled Hearth background; no value field needed.
	if (bg.kind !== "default" && !bg.value) return;

	const layer = root.createDiv("hearth-bg");
	layer.style.opacity = String(bg.opacity);
	if (bg.blur > 0) layer.style.filter = `blur(${bg.blur}px)`;

	if (bg.kind === "color") {
		layer.style.background = bg.value;
		return;
	}

	let url: string | null = null;
	if (bg.kind === "default") {
		url = DEFAULT_BG_URL;
	} else if (bg.kind === "url") {
		url = bg.value;
	} else if (bg.kind === "image") {
		const file = view.app.vault.getAbstractFileByPath(bg.value);
		if (file instanceof TFile) url = view.app.vault.getResourcePath(file);
	}

	if (url) {
		// Escape characters that would break out of the CSS url("...") literal.
		// cover/center sizing lives in styles.css (.hearth-bg).
		const safe = url.replace(/["\\]/g, "\\$&");
		layer.style.backgroundImage = `url("${safe}")`;
	}
}
