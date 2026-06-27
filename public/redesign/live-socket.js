/* The Hockey Lab — LiveSocket: real-time push client for the LiveHub Durable Object.

   One shared WebSocket per topic ("scores" / "draft") to /api/live?topic=…. The hub
   polls the NHL upstream ONCE for everyone and notifies us the instant the data moves;
   we then refetch through the normal NHL.* path (served from the warm edge cache the hub
   just populated). So the board / draft tracker update in ~1s instead of on a 20s timer.

   This is a pure enhancement layered over the existing setInterval polling:
   - If WebSocket is unavailable or the connection never opens, subscribe() is a no-op
     and callers keep their own polling — nothing breaks.
   - Auto-reconnects with capped exponential backoff while at least one listener remains.
   - Heartbeat ping keeps intermediaries from idling the socket.

   API:
     const unsub = window.LiveSocket.subscribe('draft', (msg) => { … refetch … });
     window.LiveSocket.active('draft')  // true when the socket is currently connected
*/
(function () {
  if (typeof window === 'undefined') return;
  var subs = {}; // topic -> state

  function urlFor(topic) {
    var l = window.location;
    var proto = l.protocol === 'https:' ? 'wss:' : 'ws:';
    return proto + '//' + l.host + '/api/live?topic=' + encodeURIComponent(topic);
  }

  function ensure(topic) {
    var s = subs[topic];
    if (!s) s = subs[topic] = { ws: null, listeners: new Set(), rev: -1, retry: 0, timer: null, hb: null, connected: false };
    if (s.ws && (s.ws.readyState === 0 || s.ws.readyState === 1)) return s; // connecting/open already
    try { s.ws = new WebSocket(urlFor(topic)); } catch (_) { return s; }

    s.ws.onopen = function () {
      s.connected = true; s.retry = 0;
      try { s.ws.send('ping'); } catch (_) {}
      clearInterval(s.hb);
      s.hb = setInterval(function () { try { if (s.ws && s.ws.readyState === 1) s.ws.send('ping'); } catch (_) {} }, 25000);
    };
    s.ws.onmessage = function (e) {
      if (e.data === 'pong') return;
      var m; try { m = JSON.parse(e.data); } catch (_) { return; }
      if (!m || (m.type !== 'change' && m.type !== 'hello')) return;
      // On a reconnect "hello" with the same revision we've already seen, don't refetch.
      if (m.type === 'hello' && typeof m.rev === 'number' && m.rev === s.rev) return;
      s.rev = m.rev;
      s.listeners.forEach(function (fn) { try { fn(m); } catch (_) {} });
    };
    s.ws.onclose = function () { s.connected = false; clearInterval(s.hb); schedule(topic); };
    s.ws.onerror = function () { try { s.ws.close(); } catch (_) {} };
    return s;
  }

  function schedule(topic) {
    var s = subs[topic];
    if (!s || !s.listeners.size) return; // only reconnect while someone still cares
    clearTimeout(s.timer);
    var delay = Math.min(30000, 1000 * Math.pow(2, Math.min(5, s.retry++)));
    s.timer = setTimeout(function () { ensure(topic); }, delay);
  }

  window.LiveSocket = {
    subscribe: function (topic, fn) {
      if (typeof WebSocket === 'undefined' || typeof fn !== 'function') return function () {};
      var s = ensure(topic);
      s.listeners.add(fn);
      return function () {
        s.listeners.delete(fn);
        if (!s.listeners.size) {
          clearTimeout(s.timer); clearInterval(s.hb);
          try { if (s.ws) s.ws.close(); } catch (_) {}
        }
      };
    },
    active: function (topic) { var s = subs[topic]; return !!(s && s.connected); },
  };
})();
