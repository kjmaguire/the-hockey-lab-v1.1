/* The Hockey Lab — privacy-respecting analytics + client error reporting.
   No cookies, no personal data. Two jobs:
   1) Catch uncaught errors / promise rejections → console + ONE subtle toast
      (via BC.notifyError) so breakage is visible instead of silent.
   2) Optionally load Cloudflare Web Analytics (cookie-free) if a beacon token
      is configured; otherwise a complete no-op. */
(function () {
  var seen = {};
  function beacon(type, data) {
    try {
      var ep = window.__THL_BEACON; // e.g. '/api/log' — unset by default → no-op
      if (!ep || !navigator.sendBeacon) return;
      navigator.sendBeacon(ep, JSON.stringify({ t: type, ts: Date.now(), path: location.hash || location.pathname, data: data }));
    } catch (e) { /* never let logging throw */ }
  }
  function report(kind, msg, src) {
    var key = kind + '|' + String(msg || '').slice(0, 120);
    if (seen[key]) return; seen[key] = 1;                 // dedupe identical errors
    try { console.error('[THL ' + kind + ']', msg, src || ''); } catch (e) {}
    try {                                                  // surface ONCE per session, never on a loop
      if (!window.__thlErrToast && window.BC && window.BC.notifyError) {
        window.__thlErrToast = 1;
        window.BC.notifyError('Something went wrong — some data may be unavailable.');
      }
    } catch (e) {}
    beacon('error', { kind: kind, msg: String(msg || '').slice(0, 200) });
  }
  window.addEventListener('error', function (e) {
    report('error', (e && (e.message || (e.error && e.error.message))) || 'script error', e && e.filename);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    report('promise', (r && (r.message || String(r))) || 'unhandled rejection');
  });

  // Generic event hook (no-op unless a beacon endpoint is configured).
  window.E_track = function (name, data) { beacon('event', { name: name, data: data }); };

  // Optional Cloudflare Web Analytics (cookie-free). Enable by setting
  // window.__CF_BEACON_TOKEN or <meta name="cf-beacon" content="TOKEN">.
  try {
    var meta = document.querySelector('meta[name="cf-beacon"]');
    var token = window.__CF_BEACON_TOKEN || (meta && meta.getAttribute('content'));
    if (token && token.indexOf('REPLACE') === -1) {
      var s = document.createElement('script');
      s.defer = true;
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
      document.head.appendChild(s);
    }
  } catch (e) {}
})();
