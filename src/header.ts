import { Component, Platform, setIcon } from "obsidian";
import type { HomeView } from "./view";
import { SearchSection } from "./search";
import { HEARTH_ICON_ID } from "./icon";

/** Renders the title/logo, the search bar with the New-note button, and the
 * auto-detected filter row. In Mobile mode, the New-note button is left out
 * here — it moves into the mobile action bar rendered below (see
 * mobileactions.ts), along with the rest of that customizable button row. */
export function renderHeader(view: HomeView, container: HTMLElement, component: Component): void {
	const s = view.plugin.settings;
	const mobileOnly = Platform.isMobile && s.mobileSearchOnly;

	if (s.showTitle) {
		const titleRow = container.createDiv("hearth-title");
		const logo = s.logo.trim();
		// A custom emoji/text logo is shown verbatim; otherwise fall back to the
		// Hearth crystal icon as the brand mark.
		if (logo === "") {
			const logoEl = titleRow.createSpan({ cls: "hearth-logo hearth-logo-icon" });
			setIcon(logoEl, HEARTH_ICON_ID);
		} else {
			titleRow.createSpan({ cls: "hearth-logo", text: logo });
		}
		titleRow.createSpan({ cls: "hearth-title-text", text: s.title });
	}

	const search = new SearchSection(view);

	// The search row holds the search column (bar + filters + results overlay)
	// and the New-note button side by side. Filters live inside the search
	// column so they span exactly the search field's width, not the button's.
	const searchRow = container.createDiv("hearth-search");
	const searchWrap = searchRow.createDiv("hearth-search-wrap");
	const searchCol = searchWrap.createDiv("hearth-search-col");
	const bar = search.renderBar(searchCol);

	if (s.showNewNoteButton && !mobileOnly) {
		const btn = searchRow.createEl("button", {
			cls: "hearth-newnote",
			attr: { "aria-label": "Create new note" },
		});
		setIcon(btn.createSpan("hearth-newnote-icon"), "plus");
		btn.createSpan({ cls: "hearth-newnote-label", text: "New note" });
		btn.addEventListener("click", () => {
			void view.plugin.createNewNote();
		});
		// Keep the New-note button aligned with the search bar width-wise.
		void bar;
	}

	// Results dropdown overlays from the search column; filter chips render
	// under the bar inside the same column (matching its width). Click-outside
	// dismissal is bound to the search column, so clicking the title, the
	// New-note button, or anywhere off the search field closes the dropdown.
	search.renderResultsAndFilters(searchCol, searchCol, component);
}
