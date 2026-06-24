(function(){
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  const {
    useState,
    useEffect,
    useMemo,
    useRef
  } = React;
  const BC = window.BC;
  const {
    T,
    MONO
  } = window.E_TOK;
  const ML = {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    color: T.faint
  };
  const col = BC.col;
  function svgToPng(svgEl, opts) {
    const o = opts || {};
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
      const img = new Image();
      img.onload = () => {
        const vb = svgEl.viewBox.baseVal;
        const ar = vb && vb.width && vb.height ? vb.width / vb.height : 200 / 85;
        const s = 2,
          W = 700 * s,
          padX = 24 * s,
          padTop = (o.title ? 52 : 18) * s,
          padBot = 34 * s;
        const innerW = W - padX * 2,
          innerH = innerW / ar,
          H = padTop + innerH + padBot;
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const x = c.getContext('2d');
        x.fillStyle = o.bg || '#ffffff';
        x.fillRect(0, 0, W, H);
        if (o.title) {
          x.fillStyle = o.fg || '#15161b';
          x.font = `600 ${17 * s}px Geist, system-ui, sans-serif`;
          x.fillText(o.title, padX, 26 * s);
          if (o.sub) {
            x.fillStyle = o.mut || '#62636a';
            x.font = `400 ${11 * s}px 'Geist Mono', monospace`;
            x.fillText(o.sub, padX, 42 * s);
          }
        }
        x.drawImage(img, padX, padTop, innerW, innerH);
        x.fillStyle = o.mut || '#9b9ca3';
        x.font = `500 ${10 * s}px 'Geist Mono', monospace`;
        x.fillText('THE HOCKEY LAB', padX, H - 14 * s);
        c.toBlob(b => {
          if (!b) return;
          const u = URL.createObjectURL(b);
          const a = document.createElement('a');
          a.href = u;
          a.download = o.filename || 'hockey-lab.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(u), 1500);
        });
      };
      img.onerror = () => {};
      img.src = src;
    } catch (e) {}
  }
  function ExpBtn({
    onClick
  }) {
    return React.createElement("button", {
      onClick: onClick,
      "aria-label": "Save as image",
      title: "Save as image",
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 9px',
        borderRadius: 7,
        border: `1px solid ${T.line2}`,
        background: 'transparent',
        color: T.mut,
        cursor: 'pointer'
      }
    }, React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), React.createElement("path", {
      d: "M7 10l5 5 5-5"
    }), React.createElement("path", {
      d: "M12 15V3"
    })), "Save");
  }
  const TYPE_LABEL = {
    goal: 'Goal',
    on: 'Shot on goal',
    miss: 'Missed',
    block: 'Blocked'
  };
  const FILTERS = [['all', 'All'], ['goal', 'Goals'], ['on', 'On net'], ['miss', 'Missed'], ['block', 'Blocked']];
  function Marker({
    s,
    c,
    onEnter,
    onLeave
  }) {
    const common = {
      onMouseEnter: e => onEnter(s, e),
      onMouseLeave: onLeave,
      style: {
        cursor: 'pointer'
      }
    };
    if (s.type === 'goal') return React.createElement("g", common, React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "4.4",
      fill: "none",
      stroke: c,
      strokeWidth: "0.8",
      strokeOpacity: "0.55"
    }), React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "2.7",
      fill: c
    }), React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "6.5",
      fill: "transparent"
    }));
    if (s.type === 'on') return React.createElement("g", common, React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "1.85",
      fill: c,
      fillOpacity: "0.62"
    }), React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "5",
      fill: "transparent"
    }));
    if (s.type === 'miss') return React.createElement("g", common, React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "1.7",
      fill: "none",
      stroke: c,
      strokeWidth: "0.7",
      strokeOpacity: "0.5"
    }), React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "5",
      fill: "transparent"
    }));
    return React.createElement("g", _extends({}, common, {
      transform: `rotate(45 ${s.x} ${s.y})`
    }), React.createElement("rect", {
      x: s.x - 1.4,
      y: s.y - 1.4,
      width: "2.8",
      height: "2.8",
      fill: "none",
      stroke: c,
      strokeWidth: "0.7",
      strokeOpacity: "0.5"
    }), React.createElement("rect", {
      x: s.x - 5,
      y: s.y - 5,
      width: "10",
      height: "10",
      fill: "transparent"
    }));
  }
  function ShotMap({
    g,
    gameTabs,
    activeGame,
    onGame
  }) {
    const [shots, setShots] = useState(() => BC.shotMap(g));
    const [source, setSource] = useState('sample');
    const [filter, setFilter] = useState('all');
    const [tip, setTip] = useState(null);
    const wrap = useRef(null);
    useEffect(() => {
      let alive = true;
      setShots(BC.shotMap(g));
      setSource('sample');
      setFilter('all');
      setTip(null);
      if (g.st !== 'pre' && window.NHL && NHL.shotMap) {
        NHL.shotMap(g.id).then(res => {
          if (alive && res && res.shots && res.shots.length) {
            setShots(res.shots);
            setSource('live');
          }
        }).catch(() => {});
      }
      return () => {
        alive = false;
      };
    }, [g.id]);
    const counts = useMemo(() => {
      const c = {
        goal: 0,
        on: 0,
        miss: 0,
        block: 0
      };
      shots.forEach(s => {
        c[s.type] = (c[s.type] || 0) + 1;
      });
      return c;
    }, [shots]);
    const shown = filter === 'all' ? shots : shots.filter(s => s.type === filter || filter === 'on' && s.type === 'goal');
    const onEnter = (s, e) => {
      const r = wrap.current && wrap.current.getBoundingClientRect();
      if (!r) return;
      setTip({
        s,
        left: (e.clientX - r.left) / r.width * 100,
        top: (e.clientY - r.top) / r.height * 100
      });
    };
    const teamShots = ab => shots.filter(s => s.team === ab);
    const summary = ab => {
      const a = teamShots(ab);
      return {
        sog: a.filter(s => s.type === 'on' || s.type === 'goal').length,
        g: a.filter(s => s.type === 'goal').length
      };
    };
    const dot = c => ({
      width: 8,
      height: 8,
      borderRadius: 99,
      background: c,
      display: 'inline-block'
    });
    const exportImg = () => {
      const svg = wrap.current && wrap.current.querySelector('svg');
      if (svg) svgToPng(svg, {
        filename: `shot-map-${g.a}-${g.h}.png`,
        title: `${BC.city(g.a)} @ ${BC.city(g.h)} · Shot locations`,
        sub: `${g.st.startsWith('final') ? 'Final' : g.st === 'live' ? 'Live' : 'Upcoming'}${g.as != null && g.st !== 'pre' ? ` · ${g.a} ${g.as}–${g.hs} ${g.h}` : ''}`,
        bg: T.mode === 'dark' ? '#10131a' : '#fbfaf7',
        fg: T.mode === 'dark' ? '#ecedf0' : '#15161b'
      });
    };
    return React.createElement("div", {
      style: {
        background: T.paper,
        border: `1px solid ${T.line}`,
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, React.createElement("span", {
      style: ML
    }, "Shot locations"), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, shots.length > 0 && React.createElement(ExpBtn, {
      onClick: exportImg
    }), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: source === 'live' ? '#1a8a4f' : T.faint
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: source === 'live' ? '#1a8a4f' : T.line2
      }
    }), source === 'live' ? 'live coordinates' : 'sample data'))), React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, FILTERS.map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setFilter(k),
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${filter === k ? T.invBg : T.line2}`,
        background: filter === k ? T.invBg : 'transparent',
        color: filter === k ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, lab, k !== 'all' && k !== 'goal' ? ` · ${counts[k] || 0}` : k === 'goal' ? ` · ${counts.goal || 0}` : ''))), gameTabs && gameTabs.length > 0 && React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 12,
        paddingTop: 10,
        borderTop: `1px solid ${T.line}`
      }
    }, gameTabs.map(t => React.createElement("button", {
      key: t.key,
      onClick: () => onGame && onGame(t.key),
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        padding: '3px 10px',
        borderRadius: 7,
        border: `1px solid ${activeGame === t.key ? T.ink : T.line2}`,
        background: activeGame === t.key ? T.bg : 'transparent',
        color: activeGame === t.key ? T.ink : T.mut,
        fontWeight: activeGame === t.key ? 700 : 400,
        cursor: 'pointer'
      }
    }, t.label))), React.createElement("div", {
      ref: wrap,
      style: {
        position: 'relative'
      }
    }, React.createElement("svg", {
      viewBox: "0 0 200 85",
      style: {
        width: '100%',
        height: 'auto',
        display: 'block',
        background: T.mode === 'dark' ? '#10131a' : '#fbfaf7',
        borderRadius: 10
      }
    }, React.createElement("g", {
      fill: "none",
      stroke: T.line2,
      strokeWidth: "0.6"
    }, React.createElement("rect", {
      x: "2",
      y: "2",
      width: "196",
      height: "81",
      rx: "14"
    }), React.createElement("line", {
      x1: "75",
      y1: "2",
      x2: "75",
      y2: "83",
      stroke: "#cfd6e6"
    }), React.createElement("line", {
      x1: "125",
      y1: "2",
      x2: "125",
      y2: "83",
      stroke: "#cfd6e6"
    }), React.createElement("line", {
      x1: "100",
      y1: "2",
      x2: "100",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("circle", {
      cx: "100",
      cy: "42.5",
      r: "11"
    }), React.createElement("circle", {
      cx: "31",
      cy: "20.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "31",
      cy: "64.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "169",
      cy: "20.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "169",
      cy: "64.5",
      r: "8"
    }), React.createElement("line", {
      x1: "11",
      y1: "2",
      x2: "11",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.4",
      strokeWidth: "0.5"
    }), React.createElement("line", {
      x1: "189",
      y1: "2",
      x2: "189",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.4",
      strokeWidth: "0.5"
    }), React.createElement("path", {
      d: "M11 38 A6 6 0 0 1 11 47",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("path", {
      d: "M189 38 A6 6 0 0 0 189 47",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("rect", {
      x: "8",
      y: "40.5",
      width: "3",
      height: "4",
      rx: "0.5",
      stroke: T.red,
      strokeOpacity: "0.6"
    }), React.createElement("rect", {
      x: "189",
      y: "40.5",
      width: "3",
      height: "4",
      rx: "0.5",
      stroke: T.red,
      strokeOpacity: "0.6"
    })), shown.map((s, i) => React.createElement(Marker, {
      key: i,
      s: s,
      c: col(s.team),
      onEnter: onEnter,
      onLeave: () => setTip(null)
    }))), tip && React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${tip.left}%`,
        top: `${tip.top}%`,
        transform: 'translate(-50%,-120%)',
        pointerEvents: 'none',
        background: T.mode === 'dark' ? '#2a2b33' : T.ink,
        color: '#fff',
        borderRadius: 8,
        padding: '7px 9px',
        fontFamily: MONO,
        fontSize: 10.5,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        zIndex: 5
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5
      }
    }, React.createElement("span", {
      style: dot(col(tip.s.team))
    }), React.createElement("strong", {
      style: {
        fontWeight: 600
      }
    }, tip.s.shooter || tip.s.team)), React.createElement("div", {
      style: {
        color: '#c9c9cf',
        marginTop: 2
      }
    }, TYPE_LABEL[tip.s.type], tip.s.shotType ? ` · ${tip.s.shotType}` : '', tip.s.dist != null ? ` · ${tip.s.dist} ft` : ''), (tip.s.per || tip.s.time) && React.createElement("div", {
      style: {
        color: '#8e8f97'
      }
    }, tip.s.per, " ", tip.s.time))), React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 18px',
        marginTop: 12,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: dot(col(g.a))
    }), g.a, " attacks right \xB7 ", summary(g.a).sog, " SOG / ", summary(g.a).g, " G"), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: dot(col(g.h))
    }), g.h, " attacks left \xB7 ", summary(g.h).sog, " SOG / ", summary(g.h).g, " G"), React.createElement("span", {
      style: {
        flex: 1
      }
    }), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        color: T.faint,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 99,
        border: `1.4px solid ${T.faint}`
      }
    }), "goal"), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: T.faint
      }
    }), "on net"), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 99,
        border: `1px solid ${T.faint}`
      }
    }), "missed"), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        transform: 'rotate(45deg)',
        border: `1px solid ${T.faint}`
      }
    }), "blocked"))));
  }
  window.E_ShotMap = ShotMap;
  const ZP = {
    behind: {
      x: 3,
      y: 31,
      w: 8,
      h: 23
    },
    net: {
      x: 12,
      y: 31,
      w: 20,
      h: 23
    },
    slot: {
      x: 33,
      y: 31,
      w: 24,
      h: 23
    },
    highslot: {
      x: 58,
      y: 31,
      w: 33,
      h: 23
    },
    lcircle: {
      circle: true,
      cx: 45,
      cy: 20.5,
      r: 11
    },
    rcircle: {
      circle: true,
      cx: 45,
      cy: 64.5,
      r: 11
    },
    lpoint: {
      x: 58,
      y: 6,
      w: 33,
      h: 24
    },
    rpoint: {
      x: 58,
      y: 55,
      w: 33,
      h: 24
    }
  };
  const heat = t => `rgba(229,52,31,${(0.06 + 0.74 * Math.max(0, Math.min(1, t))).toFixed(3)})`;
  function ShotZones({
    scope,
    id,
    teamAb,
    name
  }) {
    const goalie = scope === 'goalie';
    const [data, setData] = useState(() => BC.shotZones(scope, id));
    const [source, setSource] = useState('sample');
    const [metric, setMetric] = useState('vol');
    const [hover, setHover] = useState(null);
    const wrap = useRef(null);
    useEffect(() => {
      let alive = true;
      setData(BC.shotZones(scope, id));
      setSource('sample');
      setHover(null);
      if (window.NHL && NHL.shotZones) {
        NHL.shotZones(scope, id).then(res => {
          if (alive && res && res.zones && res.zones.length) {
            setData(res);
            setSource('live');
          }
        }).catch(() => {});
      }
      return () => {
        alive = false;
      };
    }, [scope, id]);
    const zones = data.zones;
    const t = useMemo(() => {
      const vals = zones.map(z => metric === 'vol' ? z.share : z.pct);
      const lo = Math.min(...vals),
        hi = Math.max(...vals);
      const span = hi - lo || 1;
      const m = {};
      zones.forEach(z => {
        let v = metric === 'vol' ? z.share : z.pct;
        let norm = (v - lo) / span;
        if (metric === 'pct' && goalie) norm = 1 - norm;
        m[z.key] = norm;
      });
      return m;
    }, [zones, metric, goalie]);
    const pctLabel = goalie ? 'Save %' : 'Shooting %';
    const c = window.BC.col && teamAb ? BC.col(teamAb) : T.ink;
    const fmtPct = v => goalie ? `.${String(Math.round(v * 10)).padStart(3, '0')}` : `${v.toFixed(1)}%`;
    const exportImg = () => {
      const svg = wrap.current && wrap.current.querySelector('svg');
      if (svg) svgToPng(svg, {
        filename: `shot-zones-${teamAb || id}.png`,
        title: `${name || teamAb || ''} · ${goalie ? 'Save zones' : 'Shot zones'} (season)`,
        sub: `${data.shots.toLocaleString()} ${goalie ? 'shots faced' : 'shots'} · ${fmtPct(data.pct)} ${goalie ? 'save' : 'shooting'}`,
        bg: T.mode === 'dark' ? '#12161d' : '#edf2fa',
        fg: T.mode === 'dark' ? '#ecedf0' : '#15161b'
      });
    };
    const delta = z => +(z.pct - z.lg).toFixed(1);
    const deltaGood = d => d >= 0;
    const onEnter = (z, e) => {
      const r = wrap.current && wrap.current.getBoundingClientRect();
      if (!r) return;
      setHover({
        z,
        left: (e.clientX - r.left) / r.width * 100,
        top: (e.clientY - r.top) / r.height * 100
      });
    };
    return React.createElement("div", {
      style: {
        background: T.paper,
        border: `1px solid ${T.line}`,
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: ML
    }, goalie ? 'Save zones · season' : 'Shot zones · season'), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, React.createElement(ExpBtn, {
      onClick: exportImg
    }), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: source === 'live' ? '#1a8a4f' : T.faint
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: source === 'live' ? '#1a8a4f' : T.line2
      }
    }), source === 'live' ? 'live · NHL Edge' : 'sample data'))), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut,
        marginBottom: 12
      }
    }, data.shots.toLocaleString(), " ", goalie ? 'shots faced' : 'shots', " \xB7 ", data.made.toLocaleString(), " ", goalie ? 'goals against' : 'goals', " \xB7 ", React.createElement("b", {
      style: {
        color: T.ink
      }
    }, fmtPct(data.pct)), " ", goalie ? 'save' : 'shooting'), React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, [['vol', 'Shot volume'], ['pct', pctLabel]].map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setMetric(k),
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${metric === k ? T.invBg : T.line2}`,
        background: metric === k ? T.invBg : 'transparent',
        color: metric === k ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, lab))), React.createElement("div", {
      ref: wrap,
      style: {
        position: 'relative'
      }
    }, React.createElement("svg", {
      viewBox: "0 0 130 85",
      style: {
        width: '100%',
        height: 'auto',
        display: 'block',
        background: T.mode === 'dark' ? 'linear-gradient(180deg,#161b24,#11151b)' : 'linear-gradient(180deg,#f1f5fc,#e9f0f9)',
        borderRadius: 10
      }
    }, React.createElement("defs", null, React.createElement("linearGradient", {
      id: "ozTint",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, React.createElement("stop", {
      offset: "0",
      stopColor: T.mode === 'dark' ? '#243043' : '#dce8f6',
      stopOpacity: "0.55"
    }), React.createElement("stop", {
      offset: "1",
      stopColor: T.mode === 'dark' ? '#1a2230' : '#eef4fb',
      stopOpacity: "0.2"
    }))), React.createElement("path", {
      d: "M120 3 H9 a6 6 0 0 0 -6 6 V76 a6 6 0 0 0 6 6 H120 Z",
      fill: "url(#ozTint)"
    }), zones.map(z => {
      const p = ZP[z.key];
      if (!p) return null;
      const tv = t[z.key];
      const fill = heat(tv);
      const light = tv < 0.5;
      const tcol = light ? T.ink : '#fff';
      const hot = hover && hover.z.key === z.key;
      const lblFill = light ? T.mut : 'rgba(255,255,255,.82)';
      const valText = metric === 'vol' ? z.shots : fmtPct(z.pct);
      const hoverHandlers = {
        onMouseEnter: e => onEnter(z, e),
        onMouseLeave: () => setHover(null),
        style: {
          cursor: 'pointer'
        }
      };
      if (p.circle) {
        const dotCol = light ? T.red : '#fff';
        return React.createElement("g", _extends({
          key: z.key
        }, hoverHandlers), React.createElement("circle", {
          cx: p.cx,
          cy: p.cy,
          r: p.r,
          fill: fill,
          stroke: hot ? T.ink : '#ffffff',
          strokeWidth: hot ? 0.9 : 0.7
        }), React.createElement("circle", {
          cx: p.cx,
          cy: p.cy,
          r: "3.1",
          fill: "none",
          stroke: dotCol,
          strokeWidth: "0.45",
          strokeOpacity: "0.6"
        }), React.createElement("circle", {
          cx: p.cx,
          cy: p.cy,
          r: "0.9",
          fill: dotCol,
          fillOpacity: "0.85"
        }), React.createElement("g", {
          stroke: dotCol,
          strokeWidth: "0.45",
          strokeOpacity: "0.6",
          strokeLinecap: "round"
        }, React.createElement("path", {
          d: `M${p.cx - 2.2} ${p.cy - 4.2} v2 M${p.cx + 2.2} ${p.cy - 4.2} v2 M${p.cx - 2.2} ${p.cy + 2.2} v2 M${p.cx + 2.2} ${p.cy + 2.2} v2`
        })), React.createElement("text", {
          x: p.cx,
          y: p.cy - p.r * 0.42,
          textAnchor: "middle",
          style: {
            fontSize: 5.6,
            fontWeight: 700,
            fill: tcol,
            fontFamily: MONO
          }
        }, valText), React.createElement("text", {
          x: p.cx,
          y: p.cy + p.r * 0.62,
          textAnchor: "middle",
          style: {
            fontSize: 3.1,
            fill: lblFill,
            fontFamily: MONO,
            letterSpacing: '.02em'
          }
        }, z.label));
      }
      const cx = p.x + p.w / 2;
      const vfs = Math.min(6, p.w * 0.34);
      const showLabel = p.w >= 18;
      return React.createElement("g", _extends({
        key: z.key
      }, hoverHandlers), React.createElement("rect", {
        x: p.x,
        y: p.y,
        width: p.w,
        height: p.h,
        rx: "2.5",
        fill: fill,
        stroke: hot ? T.ink : '#ffffff',
        strokeWidth: hot ? 0.9 : 0.7
      }), React.createElement("text", {
        x: cx,
        y: p.y + p.h / 2 + (showLabel ? -1.5 : vfs * 0.35),
        textAnchor: "middle",
        style: {
          fontSize: vfs,
          fontWeight: 700,
          fill: tcol,
          fontFamily: MONO
        }
      }, valText), showLabel && React.createElement("text", {
        x: cx,
        y: p.y + p.h / 2 + 5,
        textAnchor: "middle",
        style: {
          fontSize: 3.1,
          fill: lblFill,
          fontFamily: MONO,
          letterSpacing: '.02em'
        }
      }, z.label));
    }), React.createElement("g", {
      fill: "none"
    }, React.createElement("path", {
      d: "M120 3 H9 a6 6 0 0 0 -6 6 V76 a6 6 0 0 0 6 6 H120",
      stroke: "#b9c2cf",
      strokeWidth: "0.8"
    }), React.createElement("line", {
      x1: "92",
      y1: "3",
      x2: "92",
      y2: "82",
      stroke: "#2552c4",
      strokeWidth: "1.7",
      strokeOpacity: "0.6"
    }), React.createElement("line", {
      x1: "11",
      y1: "6.5",
      x2: "11",
      y2: "78.5",
      stroke: T.red,
      strokeWidth: "0.7",
      strokeOpacity: "0.75"
    }), React.createElement("path", {
      d: "M11 39.4 L4 36.8 M11 45.6 L4 48.2",
      stroke: T.red,
      strokeWidth: "0.4",
      strokeOpacity: "0.5"
    }), React.createElement("path", {
      d: "M11 37.3 A5.4 5.4 0 0 1 11 47.7 Z",
      fill: "#2552c4",
      fillOpacity: "0.16",
      stroke: T.red,
      strokeWidth: "0.55",
      strokeOpacity: "0.75"
    }), React.createElement("rect", {
      x: "7.4",
      y: "40",
      width: "3.6",
      height: "5",
      rx: "0.6",
      fill: "#ffffff",
      fillOpacity: "0.6",
      stroke: "#8b94a3",
      strokeWidth: "0.5"
    }), React.createElement("circle", {
      cx: "100",
      cy: "20.5",
      r: "1.1",
      fill: T.red,
      fillOpacity: "0.6"
    }), React.createElement("circle", {
      cx: "100",
      cy: "64.5",
      r: "1.1",
      fill: T.red,
      fillOpacity: "0.6"
    }))), hover && React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${hover.left}%`,
        top: `${hover.top}%`,
        transform: 'translate(-50%,-118%)',
        pointerEvents: 'none',
        background: T.mode === 'dark' ? '#2a2b33' : T.ink,
        color: '#fff',
        borderRadius: 8,
        padding: '7px 10px',
        fontFamily: MONO,
        fontSize: 10.5,
        lineHeight: 1.55,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        zIndex: 5
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        marginBottom: 1
      }
    }, hover.z.label), React.createElement("div", {
      style: {
        color: '#c9c9cf'
      }
    }, hover.z.shots, " ", goalie ? 'faced' : 'shots', " \xB7 ", hover.z.made, " ", goalie ? 'GA' : 'G', " \xB7 ", (hover.z.share * 100).toFixed(1), "% of total"), React.createElement("div", {
      style: {
        color: '#c9c9cf'
      }
    }, goalie ? 'save' : 'shooting', " ", fmtPct(hover.z.pct), " \xB7 lg ", fmtPct(hover.z.lg), React.createElement("span", {
      style: {
        color: deltaGood(delta(hover.z)) ? '#5fd08a' : '#ff8a7a',
        marginLeft: 6
      }
    }, delta(hover.z) >= 0 ? '▲' : '▼', " ", Math.abs(delta(hover.z)).toFixed(1))))), React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 18px',
        marginTop: 12,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: c
      }
    }), teamAb, name ? ` · ${name}` : ''), React.createElement("span", {
      style: {
        flex: 1
      }
    }), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: T.faint
      }
    }, goalie ? 'fewer saves' : 'lower', React.createElement("span", {
      style: {
        display: 'inline-flex',
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, [0.12, 0.3, 0.5, 0.7, 0.9].map((v, i) => React.createElement("span", {
      key: i,
      style: {
        width: 16,
        height: 9,
        background: heat(v)
      }
    }))), goalie ? 'more saves' : 'higher', " ", metric === 'vol' ? 'volume' : pctLabel.toLowerCase()), React.createElement("span", {
      style: {
        width: '100%',
        color: T.faint
      }
    }, "net at left \xB7 offensive zone \xB7 hover a zone for shots, goals & vs-league ", goalie ? 'save%' : 'shooting%')));
  }
  window.E_ShotZones = ShotZones;
  const SHOT_LABEL = {
    goal: 'Goal',
    on: 'On net',
    miss: 'Missed',
    block: 'Blocked'
  };
  function RinkShot({
    s,
    faded,
    onEnter,
    onLeave
  }) {
    const c = col(s.team);
    const o = faded ? 0.5 : 1;
    const inner = s.type === 'goal' ? React.createElement(React.Fragment, null, React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "3",
      fill: "none",
      stroke: c,
      strokeWidth: "0.7",
      strokeOpacity: 0.6 * o
    }), React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "1.8",
      fill: c,
      fillOpacity: o
    })) : s.type === 'on' ? React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "1.7",
      fill: c,
      fillOpacity: 0.62 * o
    }) : s.type === 'miss' ? React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "1.6",
      fill: "none",
      stroke: c,
      strokeWidth: "0.6",
      strokeOpacity: 0.5 * o
    }) : React.createElement("g", {
      transform: `rotate(45 ${s.x} ${s.y})`
    }, React.createElement("rect", {
      x: s.x - 1.3,
      y: s.y - 1.3,
      width: "2.6",
      height: "2.6",
      fill: "none",
      stroke: c,
      strokeWidth: "0.6",
      strokeOpacity: 0.5 * o
    }));
    return React.createElement("g", {
      onMouseEnter: e => onEnter && onEnter(s, e),
      onMouseLeave: onLeave,
      style: {
        cursor: 'pointer'
      }
    }, inner, React.createElement("circle", {
      cx: s.x,
      cy: s.y,
      r: "4.5",
      fill: "transparent"
    }));
  }
  function LiveRink({
    g,
    focus,
    players,
    onPick,
    shots
  }) {
    const posRef = useRef({});
    const trailRef = useRef([]);
    const [, tick] = useState(0);
    const [mode, setMode] = useState('live');
    const [showShots, setShowShots] = useState(false);
    const [period, setPeriod] = useState('all');
    const [stype, setStype] = useState('all');
    const [tip, setTip] = useState(null);
    const wrap = useRef(null);
    const attackRight = g.a;
    const shotList = shots || [];
    const perShots = useMemo(() => shotList.filter(s => period === 'all' || s.per === period), [shotList, period]);
    const visShots = useMemo(() => perShots.filter(s => stype === 'all' || s.type === stype), [perShots, stype]);
    const shotCounts = useMemo(() => {
      const c = {
        goal: 0,
        on: 0,
        miss: 0,
        block: 0
      };
      visShots.forEach(s => {
        c[s.type] = (c[s.type] || 0) + 1;
      });
      return c;
    }, [visShots]);
    const typeN = useMemo(() => {
      const c = {
        goal: 0,
        on: 0,
        miss: 0,
        block: 0
      };
      perShots.forEach(s => {
        c[s.type] = (c[s.type] || 0) + 1;
      });
      return c;
    }, [perShots]);
    const set = useMemo(() => {
      const arr = [...(players || [])];
      if (focus && !arr.find(p => p.id === focus.id)) arr.push(focus);
      return arr;
    }, [players, focus]);
    useEffect(() => {
      const P = posRef.current;
      const ids = new Set(set.map(p => p.id));
      set.forEach(p => {
        if (!P[p.id]) {
          let x, y;
          if (p.isG) {
            x = p.team === attackRight ? 13 : 187;
            y = 42.5;
          } else {
            x = 70 + Math.random() * 60;
            y = 14 + Math.random() * 57;
          }
          P[p.id] = {
            x,
            y,
            tx: x,
            ty: y
          };
        }
      });
      Object.keys(P).forEach(id => {
        if (id !== '_puck' && !ids.has(id)) delete P[id];
      });
      if (!P._puck) P._puck = {
        x: 100,
        y: 42,
        tx: 100,
        ty: 42
      };
    }, [set]);
    useEffect(() => {
      trailRef.current = [];
    }, [focus && focus.id]);
    const setRef = useRef(set);
    setRef.current = set;
    const focusRef = useRef(focus);
    focusRef.current = focus;
    useEffect(() => {
      if (g.st !== 'live') {
        tick(v => v + 1);
        return;
      }
      const band = p => {
        const fwd = p.pos !== 'D';
        if (p.team === attackRight) return fwd ? [96, 186] : [55, 150];
        return fwd ? [14, 104] : [50, 145];
      };
      const iv = setInterval(() => {
        const S = setRef.current,
          F = focusRef.current,
          P = posRef.current;
        S.forEach(p => {
          const o = P[p.id];
          if (!o) return;
          if (p.isG) {
            o.tx = p.team === attackRight ? 13 : 187;
            if (Math.hypot(o.tx - o.x, o.ty - o.y) < 2) o.ty = 38 + Math.random() * 9;
            o.x += (o.tx - o.x) * 0.12;
            o.y += (o.ty - o.y) * 0.12;
            return;
          }
          const benched = F && p.id === F.id && !F.onIce;
          if (benched) {
            o.tx = p.team === attackRight ? 26 : 174;
            o.ty = 79;
          } else {
            const dx = o.tx - o.x,
              dy = o.ty - o.y;
            if (Math.hypot(dx, dy) < 7) {
              const [lo, hi] = band(p);
              o.tx = lo + Math.random() * (hi - lo);
              o.ty = 10 + Math.random() * 65;
            }
          }
          o.x += (o.tx - o.x) * 0.1;
          o.y += (o.ty - o.y) * 0.1;
        });
        const pk = P._puck;
        if (pk) {
          if (Math.hypot(pk.tx - pk.x, pk.ty - pk.y) < 9) {
            pk.tx = 18 + Math.random() * 164;
            pk.ty = 10 + Math.random() * 65;
          }
          pk.x += (pk.tx - pk.x) * 0.16;
          pk.y += (pk.ty - pk.y) * 0.16;
        }
        if (F && P[F.id]) {
          const tr = trailRef.current;
          tr.push({
            x: P[F.id].x,
            y: P[F.id].y
          });
          if (tr.length > 12) tr.shift();
        }
        tick(v => v + 1);
      }, 70);
      return () => clearInterval(iv);
    }, [g.id, g.st, attackRight]);
    const P = posRef.current;
    const trail = trailRef.current.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
    const pk = P._puck;
    const live = g.st === 'live';
    const showShotMarkers = mode === 'shots' || mode === 'live' && showShots;
    const onShotEnter = (s, e) => {
      const r = wrap.current && wrap.current.getBoundingClientRect();
      if (!r) return;
      setTip({
        s,
        left: (e.clientX - r.left) / r.width * 100,
        top: (e.clientY - r.top) / r.height * 100
      });
    };
    return React.createElement("div", {
      style: {
        background: T.paper,
        border: `1px solid ${T.line}`,
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 14
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 10,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 4,
        padding: 3,
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: 9
      }
    }, [['live', 'Live positions'], ['shots', 'Shot locations']].map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setMode(k),
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '.03em',
        textTransform: 'uppercase',
        padding: '5px 11px',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        background: mode === k ? T.invBg : 'transparent',
        color: mode === k ? T.invFg : T.mut
      }
    }, lab))), React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, mode === 'live' && React.createElement("button", {
      onClick: () => setShowShots(v => !v),
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        padding: '4px 9px',
        borderRadius: 7,
        border: `1px solid ${showShots ? T.invBg : T.line2}`,
        background: showShots ? T.invBg : 'transparent',
        color: showShots ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, showShots ? '✓ ' : '', "Show shots"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: '#1a8a4f',
        border: `1px solid ${T.line2}`,
        borderRadius: 5,
        padding: '2px 6px'
      }
    }, React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 99,
        background: '#1a8a4f'
      }
    }), mode === 'shots' ? 'live shots' : 'live'), mode === 'live' && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.faint,
        border: `1px solid ${T.line2}`,
        borderRadius: 5,
        padding: '2px 6px'
      }
    }, "simulated positions"))), showShotMarkers && React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginBottom: 10,
        flexWrap: 'wrap',
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.faint,
        marginRight: 2
      }
    }, "Period"), [['all', 'All'], ['1st', '1st'], ['2nd', '2nd'], ['3rd', '3rd']].map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setPeriod(k),
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${period === k ? T.invBg : T.line2}`,
        background: period === k ? T.invBg : 'transparent',
        color: period === k ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, lab, k !== 'all' ? ` · ${shotList.filter(s => s.per === k).length}` : ''))), showShotMarkers && React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginBottom: 10,
        flexWrap: 'wrap',
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.faint,
        marginRight: 2
      }
    }, "Type"), [['all', 'All'], ['goal', 'Goals'], ['on', 'On net'], ['miss', 'Missed'], ['block', 'Blocked']].map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setStype(k),
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${stype === k ? T.invBg : T.line2}`,
        background: stype === k ? T.invBg : 'transparent',
        color: stype === k ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, lab, k !== 'all' ? ` · ${typeN[k] || 0}` : ''))), React.createElement("div", {
      ref: wrap,
      style: {
        position: 'relative'
      }
    }, React.createElement("svg", {
      viewBox: "0 0 200 85",
      style: {
        width: '100%',
        height: 'auto',
        display: 'block',
        background: T.mode === 'dark' ? '#10131a' : '#fbfaf7',
        borderRadius: 10
      }
    }, React.createElement("g", {
      fill: "none",
      stroke: T.line2,
      strokeWidth: "0.6"
    }, React.createElement("rect", {
      x: "2",
      y: "2",
      width: "196",
      height: "81",
      rx: "14"
    }), React.createElement("line", {
      x1: "75",
      y1: "2",
      x2: "75",
      y2: "83",
      stroke: "#cfd6e6"
    }), React.createElement("line", {
      x1: "125",
      y1: "2",
      x2: "125",
      y2: "83",
      stroke: "#cfd6e6"
    }), React.createElement("line", {
      x1: "100",
      y1: "2",
      x2: "100",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("circle", {
      cx: "100",
      cy: "42.5",
      r: "11"
    }), React.createElement("circle", {
      cx: "31",
      cy: "20.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "31",
      cy: "64.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "169",
      cy: "20.5",
      r: "8"
    }), React.createElement("circle", {
      cx: "169",
      cy: "64.5",
      r: "8"
    }), React.createElement("line", {
      x1: "11",
      y1: "2",
      x2: "11",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.4",
      strokeWidth: "0.5"
    }), React.createElement("line", {
      x1: "189",
      y1: "2",
      x2: "189",
      y2: "83",
      stroke: T.red,
      strokeOpacity: "0.4",
      strokeWidth: "0.5"
    }), React.createElement("path", {
      d: "M11 38 A6 6 0 0 1 11 47",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("path", {
      d: "M189 38 A6 6 0 0 0 189 47",
      stroke: T.red,
      strokeOpacity: "0.5"
    }), React.createElement("rect", {
      x: "8",
      y: "40.5",
      width: "3",
      height: "4",
      rx: "0.5",
      stroke: T.red,
      strokeOpacity: "0.6"
    }), React.createElement("rect", {
      x: "189",
      y: "40.5",
      width: "3",
      height: "4",
      rx: "0.5",
      stroke: T.red,
      strokeOpacity: "0.6"
    })), showShotMarkers && visShots.map((sh, i) => React.createElement(RinkShot, {
      key: 's' + i,
      s: sh,
      faded: mode === 'live',
      onEnter: onShotEnter,
      onLeave: () => setTip(null)
    })), mode === 'live' && trail.split(' ').length > 1 && focus && React.createElement("polyline", {
      points: trail,
      fill: "none",
      stroke: col(focus.team),
      strokeWidth: "1.1",
      strokeOpacity: "0.3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), mode === 'live' && set.map(p => {
      const o = P[p.id];
      if (!o) return null;
      const isF = focus && p.id === focus.id;
      const c = col(p.team);
      if (p.isG) {
        const sz = isF ? 7 : 5.6;
        return React.createElement("g", {
          key: p.id,
          onClick: () => onPick && onPick(p),
          style: {
            cursor: 'pointer'
          }
        }, isF && React.createElement("rect", {
          x: o.x - sz / 2 - 1.4,
          y: o.y - sz / 2 - 1.4,
          width: sz + 2.8,
          height: sz + 2.8,
          rx: "2",
          fill: c,
          fillOpacity: "0.18"
        }), React.createElement("rect", {
          x: o.x - sz / 2,
          y: o.y - sz / 2,
          width: sz,
          height: sz,
          rx: "1.6",
          fill: c,
          stroke: "#fff",
          strokeWidth: isF ? 0.85 : 0.5
        }), React.createElement("text", {
          x: o.x,
          y: o.y + 1.1,
          textAnchor: "middle",
          style: {
            fontSize: isF ? 3 : 2.6,
            fontWeight: 700,
            fill: '#fff',
            fontFamily: MONO,
            pointerEvents: 'none'
          }
        }, "G"), React.createElement("circle", {
          cx: o.x,
          cy: o.y,
          r: "6.5",
          fill: "transparent"
        }));
      }
      return React.createElement("g", {
        key: p.id,
        onClick: () => onPick && onPick(p),
        style: {
          cursor: 'pointer'
        }
      }, isF && React.createElement("circle", {
        cx: o.x,
        cy: o.y,
        r: "5.8",
        fill: c,
        fillOpacity: "0.18"
      }), React.createElement("circle", {
        cx: o.x,
        cy: o.y,
        r: isF ? 4.2 : 3.2,
        fill: c,
        fillOpacity: isF ? 1 : 0.82,
        stroke: "#fff",
        strokeWidth: isF ? 0.85 : 0.5
      }), React.createElement("text", {
        x: o.x,
        y: o.y + (isF ? 1.15 : 1),
        textAnchor: "middle",
        style: {
          fontSize: isF ? 3.2 : 2.7,
          fontWeight: 700,
          fill: '#fff',
          fontFamily: MONO,
          pointerEvents: 'none'
        }
      }, p.num), React.createElement("circle", {
        cx: o.x,
        cy: o.y,
        r: "6.5",
        fill: "transparent"
      }));
    }), mode === 'live' && pk && React.createElement("circle", {
      cx: pk.x,
      cy: pk.y,
      r: "1.5",
      fill: T.mode === 'dark' ? '#f4f4f6' : '#111418',
      stroke: T.mode === 'dark' ? '#111418' : '#fff',
      strokeWidth: "0.45"
    })), tip && React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${tip.left}%`,
        top: `${tip.top}%`,
        transform: 'translate(-50%,-120%)',
        pointerEvents: 'none',
        background: T.mode === 'dark' ? '#2a2b33' : T.ink,
        color: '#fff',
        borderRadius: 8,
        padding: '7px 9px',
        fontFamily: MONO,
        fontSize: 10.5,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        zIndex: 5
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5
      }
    }, React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: col(tip.s.team),
        display: 'inline-block'
      }
    }), React.createElement("strong", {
      style: {
        fontWeight: 600
      }
    }, tip.s.shooter || tip.s.team)), React.createElement("div", {
      style: {
        color: '#c9c9cf',
        marginTop: 2
      }
    }, SHOT_LABEL[tip.s.type], tip.s.shotType ? ` · ${tip.s.shotType}` : '', tip.s.dist != null ? ` · ${tip.s.dist} ft` : ''), (tip.s.per || tip.s.time) && React.createElement("div", {
      style: {
        color: '#8e8f97'
      }
    }, tip.s.per, " ", tip.s.time))), mode === 'live' ? React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 16px',
        marginTop: 10,
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.mut,
        alignItems: 'center'
      }
    }, focus && React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 99,
        background: col(focus.team),
        border: '1.4px solid #fff',
        boxShadow: `0 0 0 1px ${T.line2}`
      }
    }), "#", focus.num, " ", focus.name, !focus.onIce && live ? ' · on bench' : ''), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: T.faint
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: T.mode === 'dark' ? '#f4f4f6' : '#111418'
      }
    }), "puck"), React.createElement("span", {
      style: {
        flex: 1
      }
    }), React.createElement("span", {
      style: {
        color: T.faint
      }
    }, "tap a number to follow", showShots ? ' · shots shown' : '', " \xB7 ", g.a, " \u2192 \xB7 ", g.h, " \u2190")) : React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 18px',
        marginTop: 10,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: col(g.a)
      }
    }), g.a, " ", visShots.filter(s => s.team === g.a).length), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: col(g.h)
      }
    }), g.h, " ", visShots.filter(s => s.team === g.h).length), React.createElement("span", {
      style: {
        flex: 1
      }
    }), React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        color: T.faint,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", null, shotCounts.goal, " G"), React.createElement("span", null, shotCounts.on, " on net"), React.createElement("span", null, shotCounts.miss, " miss"), React.createElement("span", null, shotCounts.block, " blocked"))));
  }
  window.E_LiveRink = LiveRink;
})();
})();