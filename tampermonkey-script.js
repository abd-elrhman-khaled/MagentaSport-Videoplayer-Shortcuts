// ==UserScript==
// @name         MagentaSport Player Keyboard-Shortcuts (like the player of nba.com)
// @namespace    https://github.com/dusanvin/magentasport-shortcuts
// @version      1.0
// @description  J/L/U/O/Space Shortcuts für den MagentaSport-Player (wie nba.com)
// @match        https://www.magentasport.de/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Anpassbare Schrittweiten (Sekunden)
  const STEP_SMALL = 10;   // J / L
  const STEP_LARGE = 60;   // U / O

  // Kleines Overlay für Feedback
  let toast;
  function ensureToast() {
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'ms-shortcuts-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      bottom: '12%',
      transform: 'translateX(-50%)',
      padding: '8px 12px',
      borderRadius: '10px',
      background: 'rgba(0,0,0,0.65)',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      zIndex: 999999,
      opacity: '0',
      transition: 'opacity .15s ease',
      pointerEvents: 'none',
      userSelect: 'none'
    });
    document.documentElement.appendChild(toast);
    return toast;
  }
  let toastTimer;
  function showToast(text) {
    const el = ensureToast();
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = '0'), 650);
  }

  // Aktives Video finden (robust bei SPA/Reload des Players)
  function findActiveVideo() {
    // Bevorzugt das bekannte Magenta-Video
    const byId = document.querySelector('#sravvpl_video-element--0');
    if (byId && isUsableVideo(byId)) return byId;

    // Fallback: sichtbares, initialisiertes <video>
    const vids = Array.from(document.querySelectorAll('video'));
    const candidates = vids
      .filter(isUsableVideo)
      // priorisiere Videos mit Quelle/Dauer
      .sort((a, b) => (scoreVideo(b) - scoreVideo(a)));

    return candidates[0] || null;
  }
  function isUsableVideo(v) {
    if (!(v instanceof HTMLVideoElement)) return false;
    const rect = v.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    return visible;
  }
  function scoreVideo(v) {
    let s = 0;
    if (v.currentSrc || v.src) s += 2;
    if (isFinite(v.duration) && v.duration > 0) s += 2;
    if (!v.paused) s += 1;
    return s;
  }

  // Zielzeit in erlaubten Bereich klemmen (auch für Live/DVR)
  function clampTime(video, target) {
    try {
      const seekable = video.seekable;
      if (seekable && seekable.length) {
        const start = seekable.start(0);
        const end = seekable.end(seekable.length - 1);
        // winzige Marge, um ans Ende springende Pausen zu vermeiden
        const epsilon = 0.25;
        return Math.min(Math.max(target, start), end - epsilon);
      }
    } catch (e) {}
    if (isFinite(video.duration) && video.duration > 0) {
      const epsilon = 0.25;
      return Math.min(Math.max(target, 0), video.duration - epsilon);
    }
    return Math.max(target, 0);
  }

  function seekBy(video, delta) {
    const target = clampTime(video, (video.currentTime || 0) + delta);
    video.currentTime = target;
    const sign = delta > 0 ? '+' : '–';
    const secs = Math.abs(delta);
    showToast(`${sign}${secs}s`);
  }

  function togglePlay(video) {
    if (video.paused) {
      const p = video.play();
      // Promise ggf. unterdrücken
      if (p && typeof p.catch === 'function') p.catch(() => {});
      showToast('▶︎');
    } else {
      video.pause();
      showToast('⏸');
    }
  }

  // Nur auslösen, wenn nicht gerade in einem Eingabefeld getippt wird
  function isTypingInField(e) {
    const t = e.target;
    return (
      t &&
      (t.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/i.test(t.tagName))
    );
  }

  // Einmal registrieren – auch bei SPA-Navigation ausreichend
  window.addEventListener('keydown', (e) => {
    if (isTypingInField(e)) return;

    const key = e.key.toLowerCase();
    if (!['j', 'l', 'u', 'o', ' '].includes(key)) return;

    const video = findActiveVideo();
    if (!video) return;

    // optional: Wiederholungen (Taste gehalten) ignorieren
    if (e.repeat) return;

    if (key === ' ') {
      e.preventDefault(); // Scrollen der Seite verhindern
      togglePlay(video);
      return;
    }

    switch (key) {
      case 'j':
        seekBy(video, -STEP_SMALL);
        break;
      case 'l':
        seekBy(video, +STEP_SMALL);
        break;
      case 'u':
        seekBy(video, -STEP_LARGE);
        break;
      case 'o':
        seekBy(video, +STEP_LARGE);
        break;
    }
  });

  // Bonus: Reageiere auf Player-Wechsel (SPA) und räume altes Toast auf
  const mo = new MutationObserver(() => {
    // Wenn der Player neu gerendert wurde, stelle sicher, dass das Toast oben im DOM bleibt
    if (toast && !document.documentElement.contains(toast)) {
      toast = null;
      ensureToast();
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
