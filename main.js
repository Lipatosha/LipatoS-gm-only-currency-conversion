const MODULE_ID = "lipatos-gm-only-currency-conversion";

function hideConversion(root) {
  if (game.user.isGM || !root) return;

  // Look for controls whose visible text is "Конвертация"/"Conversion".
  const candidates = root.querySelectorAll(
    "button, a, [role='tab'], [data-tab], [data-action], nav > *, .tabs > *"
  );

  for (const el of candidates) {
    const text = String(el.textContent ?? "").trim().toLowerCase();
    const tab = String(el.dataset?.tab ?? "").toLowerCase();
    const action = String(el.dataset?.action ?? "").toLowerCase();

    const isConversion =
      text.includes("конвертац") ||
      text === "conversion" ||
      tab.includes("convert") ||
      tab.includes("conversion") ||
      action.includes("convert") ||
      action.includes("conversion");

    if (isConversion) {
      el.classList.add("gmocc-hidden-conversion");
      el.setAttribute("aria-hidden", "true");
      el.tabIndex = -1;
    }
  }

  // Hide a matching conversion pane too, if it exists.
  const panes = root.querySelectorAll("[data-tab], [data-group], .tab");
  for (const el of panes) {
    const tab = String(el.dataset?.tab ?? "").toLowerCase();
    const text = String(el.textContent ?? "").trim().toLowerCase();

    if (
      tab.includes("convert") ||
      tab.includes("conversion") ||
      text.startsWith("конвертация")
    ) {
      // Avoid hiding the whole currency window just because a parent contains the word.
      if (el.matches(".tab, [data-tab]")) {
        el.classList.add("gmocc-hidden-conversion");
      }
    }
  }

  // If the transfer tab exists, make sure it remains active/visible.
  const transfer = Array.from(root.querySelectorAll(
    "button, a, [role='tab'], [data-tab], [data-action], nav > *, .tabs > *"
  )).find(el => {
    const text = String(el.textContent ?? "").trim().toLowerCase();
    const tab = String(el.dataset?.tab ?? "").toLowerCase();
    return text.includes("передач") || text === "transfer" || tab.includes("transfer");
  });

  if (transfer) transfer.classList.remove("gmocc-hidden-conversion");
}

function processAll() {
  if (game.user.isGM) return;
  for (const app of document.querySelectorAll(".application, .window-app, dialog")) {
    hideConversion(app);
  }
}

Hooks.on("renderApplication", (app, html) => {
  if (game.user.isGM) return;
  const root = app?.element ?? html?.[0] ?? html;
  hideConversion(root);
});

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e" || game.user.isGM) return;

  processAll();

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        hideConversion(node);
        if (node.querySelectorAll) {
          for (const child of node.querySelectorAll(".application, .window-app, dialog")) {
            hideConversion(child);
          }
        }
      }
    }
  });

  observer.observe(document.body, {childList: true, subtree: true});

  console.log(`${MODULE_ID} | Currency conversion is hidden for non-GM users.`);
});
