(function () {
  const progressEl = document.getElementById('progress-num');
  const progressFill = document.querySelector('.progress-fill');
  const progressTrack = document.querySelector('.progress-track');
  const statusEl = document.getElementById('status-text');
  const REDIRECT_URL = '/pages/login.html';
  let displayedPct = 0;

  function setProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    displayedPct = pct;
    progressEl.textContent = Math.round(pct);
    progressFill.style.width = pct + '%';
    progressTrack.setAttribute('aria-valuenow', Math.round(pct));
  }

  const crawl = setInterval(function () {
    if (displayedPct < 90) setProgress(displayedPct + (90 - displayedPct) * 0.06 + 0.4);
  }, 120);

  function finish() {
    clearInterval(crawl);
    setProgress(100);
    statusEl.textContent = 'Workspace ready';
    setTimeout(function () { window.location.replace(REDIRECT_URL); }, 350);
  }

  function pingServer() {
    fetch('/api/health', { cache: 'no-store' }).then(function (res) {
      if (res.ok) finish(); else retry();
    }).catch(retry);
  }

  let attempts = 0;
  function retry() {
    attempts++;
    if (attempts > 40) {
      statusEl.textContent = 'Almost there — opening your workspace';
      finish();
      return;
    }
    setTimeout(pingServer, 1500);
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
  pingServer();
})();