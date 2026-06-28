import { App, Menu, Modal, Setting, setIcon } from "obsidian";
import type { HomeView } from "./view";
import { Dashboard, newDashboardId } from "./types";

/**
 * The top-left dashboard switcher: a numbered button per dashboard plus a "+"
 * to add one. Clicking a number switches to it; right-clicking opens a menu to
 * rename or delete it.
 */
export function renderDashboardSwitcher(view: HomeView, container: HTMLElement): void {
	const s = view.plugin.settings;
	const bar = container.createDiv("hearth-dash-switcher");

	const switchTo = (id: string) => {
		if (id === s.activeDashboardId) return;
		s.activeDashboardId = id;
		void view.plugin.saveData(s);
		view.render();
	};

	s.dashboards.forEach((d, i) => {
		const btn = bar.createEl("button", {
			cls: "hearth-dash-btn",
			text: String(i + 1),
		});
		btn.toggleClass("is-active", d.id === s.activeDashboardId);
		btn.setAttribute("aria-label", d.name);
		btn.setAttribute("title", d.name);
		btn.addEventListener("click", () => switchTo(d.id));
		btn.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			showDashboardMenu(view, d, e);
		});
	});

	const add = bar.createEl("button", {
		cls: "hearth-dash-btn hearth-dash-add",
		attr: { "aria-label": "New dashboard" },
	});
	setIcon(add, "plus");
	add.addEventListener("click", () => {
		const dash: Dashboard = {
			id: newDashboardId(),
			name: `Dashboard ${s.dashboards.length + 1}`,
			cards: [],
		};
		s.dashboards.push(dash);
		s.activeDashboardId = dash.id;
		void view.plugin.saveData(s);
		view.render();
	});
}

/** Context menu for a single dashboard button: rename and delete. */
function showDashboardMenu(view: HomeView, dash: Dashboard, evt: MouseEvent): void {
	const s = view.plugin.settings;
	const menu = new Menu();

	menu.addItem((item) =>
		item
			.setTitle("Rename")
			.setIcon("pencil")
			.onClick(() => {
				new RenameDashboardModal(view.app, dash.name, (name) => {
					dash.name = name;
					void view.plugin.saveData(s);
					view.render();
				}).open();
			}),
	);

	menu.addItem((item) =>
		item
			.setTitle("Delete")
			.setIcon("trash-2")
			// Always keep at least one dashboard around.
			.setDisabled(s.dashboards.length <= 1)
			.onClick(() => {
				const i = s.dashboards.findIndex((d) => d.id === dash.id);
				if (i >= 0) s.dashboards.splice(i, 1);
				if (s.activeDashboardId === dash.id) {
					s.activeDashboardId = s.dashboards[0].id;
				}
				void view.plugin.saveData(s);
				view.render();
			}),
	);

	menu.showAtMouseEvent(evt);
}

/** A tiny prompt for renaming a dashboard. */
class RenameDashboardModal extends Modal {
	private current: string;
	private onSubmit: (name: string) => void;

	constructor(app: App, current: string, onSubmit: (name: string) => void) {
		super(app);
		this.current = current;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		this.titleEl.setText("Rename dashboard");
		const input = this.contentEl.createEl("input", {
			cls: "hearth-rename-input",
			attr: { type: "text", spellcheck: "false" },
		});
		input.value = this.current;
		input.focus();
		input.select();

		const submit = () => {
			const name = input.value.trim();
			if (name) this.onSubmit(name);
			this.close();
		};
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") submit();
		});

		new Setting(this.contentEl).addButton((b) =>
			b.setButtonText("Save").setCta().onClick(submit),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
