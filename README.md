# Magentasport-Shortcuts

Tampermonkey userscript that adds **NBA-style keyboard shortcuts** to the MagentaSport web player on `magentasport.de` (Video on Demand (VOD) only, **no live streams**). Tested with Mozilla Firefox.

## What you get

* **J** → jump **10s back**
* **L** → jump **10s forward**
* **U** → jump **60s back**
* **O** → jump **60s forward**
* **Space** → **Play/Pause**
* Visual on-screen toast shows what happened (e.g., “+10s”)

> Works on **static/on-demand videos** (finite duration). Live/DVR streams aren’t supported.

---

## Install (Tampermonkey)

1. **Install Tampermonkey** in your browser (Chrome, Firefox, Edge, Safari).
2. Open the **Tampermonkey Dashboard** → **Create a new script…**.
3. Replace the template with your script’s code (the one you have) and make sure the header contains:

   ```js
   // @match        https://www.magentasport.de/*
   // @run-at       document-idle
   ```
4. **Save** and ensure the script is **Enabled**.
5. Open a **MagentaSport VOD** page and press `J/L/U/O/Space` to test.

> Tip: If nothing happens, reload the page once the player is visible.

---

## Usage

* Use the keys **J/L/U/O/Space** while the video is focused (mouse over the player is enough).
* The script **ignores typing** inside inputs/textareas.
* Space prevents page-scroll while toggling play/pause.

---

## Limitations

* **No live streams/DVR** (seek ranges on live content differ).
* Might not react during **ad breaks**.
* Could require updates if Magenta changes player internals (selectors).
* Doesn’t control Chromecast overlay UI.

---

## Customization (optional)

Open the script and adjust:

* **Step sizes**:

  ```js
  const STEP_SMALL = 10; // J/L
  const STEP_LARGE = 60; // U/O
  ```
* **Extra key for play/pause** (NBA also uses `K`):
  Add `'k'` to the allowed keys and call `togglePlay(video)` for it.
* **Selectors**: If Magenta changes things, update `findActiveVideo()` (e.g., query a visible `<video>` inside the player container).

---

## Troubleshooting

* **No reaction**:
  – Check the script is enabled and matches `https://www.magentasport.de/*`
  – Make sure you’re on a **VOD** (not live)
  – Open DevTools → **Console** to see errors
  – Temporarily disable other video-shortcut extensions
* **Conflicts with site keys**: Only **Space** uses `preventDefault`; if you want to fully override others, you can also call `e.preventDefault()` for J/L/U/O.

---

## Privacy

* Runs locally in your browser, **no network requests**, no data collection.

---

## Uninstall

Tampermonkey Dashboard → select the script → **Delete** (trash icon).

---

## License

MIT

---

## Changelog

* **1.0.0** – Initial release (J/L/U/O/Space for MagentaSport VOD).
