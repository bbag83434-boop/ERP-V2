
(function () {
  const RING_CIRCUMFERENCE = 327; // 2 * PI * 52
  const progressEl = document.getElementById('progress-num');
  const ringFg = document.querySelector('.ring-fg');
  const statusEl = document.getElementById('status-text');
  const REDIRECT_URL = '/pages/login.html';

  let displayedPct = 0;
  let serverReady = false;

  function setProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    displayedPct = pct;
    progressEl.textContent = Math.round(pct);
    const offset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
    ringFg.style.strokeDashoffset = offset;
  }

  // Smooth crawl up to 90% while waiting on the real server response.
  // Never reaches 100% on its own — only the real health check can finish it.
  let crawl = setInterval(function () {
    if (displayedPct < 90) {
      setProgress(displayedPct + (90 - displayedPct) * 0.06 + 0.4);
    }
  }, 120);

  function finish() {
    clearInterval(crawl);
    setProgress(100);
    statusEl.textContent = 'Ready';
    setTimeout(function () {
      window.location.replace(REDIRECT_URL);
    }, 350);
  }

  function pingServer() {
    fetch('/api/health', { cache: 'no-store' })
      .then(function (res) {
        if (res.ok) {
          serverReady = true;
          finish();
        } else {
          retry();
        }
      })
      .catch(retry);
  }

  let attempts = 0;
  function retry() {
    attempts++;
    if (attempts > 40) {
      // Safety net: after ~60s, go anyway rather than trap the user
      statusEl.textContent = 'Taking longer than usual...';
      finish();
      return;
    }
    setTimeout(pingServer, 1500);
  }

  // Register service worker so future opens show this splash instantly,
  // even before the network/server responds.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  pingServer();
})();