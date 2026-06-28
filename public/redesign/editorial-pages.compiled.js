(function(){
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState: uS,
  useMemo: uM
} = React;
const D = window.BC;
window.__E_LIVE = window.__E_LIVE || {};
window.E_useLive = function (mock, fetchLive, deps, key) {
  const M = window.__E_LIVE;
  const peek = () => key && M[key] !== undefined ? M[key] : undefined;
  const seeded = peek();
  const [val, setVal] = React.useState(seeded !== undefined ? seeded : mock);
  const depRef = React.useRef(deps);
  const dprev = depRef.current,
    dnow = deps || [];
  const depsChanged = !dprev || dprev.length !== dnow.length || dnow.some((d, i) => d !== dprev[i]);
  React.useEffect(() => {
    depRef.current = deps;
    let alive = true;
    let got = false;
    const s = peek();
    setVal(s !== undefined ? s : mock);
    const runLive = () => {
      if (!alive || got) return;
      const sv = peek();
      if (sv !== undefined) {
        got = true;
        setVal(sv);
        return;
      }
      if (window.NHL && window.BC && window.BC.LIVE && typeof fetchLive === 'function') {
        Promise.resolve().then(fetchLive).then(live => {
          if (alive && live) {
            got = true;
            if (key) M[key] = live;
            setVal(live);
          }
        }).catch(() => {});
      }
    };
    runLive();
    window.addEventListener('e-live-ready', runLive);
    return () => {
      alive = false;
      window.removeEventListener('e-live-ready', runLive);
    };
  }, deps);
  const live = peek();
  if (live !== undefined) return live;
  return depsChanged ? mock : val;
};
const c2 = D.col,
  nk = D.nick,
  ct = D.city;
const LIGHT = {
  mode: 'light',
  ink: '#15161b',
  mut: '#62636a',
  faint: '#9b9ca3',
  line: '#e6e4de',
  line2: '#dad8d0',
  red: '#e5341f',
  paper: '#fff',
  bg: '#f5f4f0',
  glass: 'rgba(245,244,240,.85)',
  invBg: '#15161b',
  invFg: '#fff',
  posBg: '#e7f5ec',
  posFg: '#1a8a4f',
  negBg: '#fdecea',
  negFg: '#c0392b',
  goldBg: '#fdf6e6',
  goldFg: '#9a6b1a',
  goldLine: '#f0e2c0'
};
const DARK = {
  mode: 'dark',
  ink: '#ecedf0',
  mut: '#b4b6bf',
  faint: '#8a8c96',
  line: '#2a2c33',
  line2: '#3b3d46',
  red: '#ff5a45',
  paper: '#1c1d23',
  bg: '#141519',
  glass: 'rgba(18,19,23,.82)',
  invBg: '#33343d',
  invFg: '#f3f3f5',
  posBg: 'rgba(34,170,95,.18)',
  posFg: '#54d98c',
  negBg: 'rgba(255,90,69,.16)',
  negFg: '#ff7d6d',
  goldBg: 'rgba(202,150,70,.18)',
  goldFg: '#d8af68',
  goldLine: 'rgba(202,150,70,.34)'
};
const T = {
  ...LIGHT
};
try {
  if (localStorage.getItem('e_theme') === 'dark') Object.assign(T, DARK);
} catch (e) {}
window.E_applyTheme = m => {
  Object.assign(T, m === 'dark' ? DARK : LIGHT);
};
const MONO = "'Geist Mono',monospace";
const SERIF = "'Newsreader',serif";
const card = {
  get background() {
    return T.paper;
  },
  get border() {
    return '1px solid ' + T.line;
  },
  borderRadius: 14
};
function Eyebrow({
  children
}) {
  return React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: T.red
    }
  }, children);
}
function PageHead({
  k,
  t,
  serif,
  right
}) {
  return React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 24
    }
  }, React.createElement("div", null, React.createElement(Eyebrow, null, k), React.createElement("h1", {
    style: {
      fontSize: 38,
      fontWeight: 600,
      letterSpacing: '-.03em',
      margin: '6px 0 0',
      color: T.ink
    }
  }, t, " ", serif && React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 500
    }
  }, serif))), right);
}
function Badge({
  ab,
  size = 28
}) {
  return React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
      background: c2(ab),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: size * 0.34,
      color: '#fff',
      flexShrink: 0
    }
  }, ab);
}
function PlayerAvatar({
  pos,
  team,
  size = 42,
  name
}) {
  const cc = c2(team);
  const isG = pos === 'G';
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  const glyph = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts.length === 1 ? parts[0].slice(0, 2) : pos || '·';
  return React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: isG ? '50%' : Math.round(size * 0.28),
      background: cc,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: '#fff',
      fontWeight: 700,
      fontSize: Math.round(size * 0.4),
      letterSpacing: '-.02em',
      lineHeight: 1
    }
  }, (glyph || '').toUpperCase()), React.createElement("span", {
    style: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      fontFamily: MONO,
      fontSize: Math.max(7, Math.round(size * 0.2)),
      fontWeight: 700,
      background: T.paper,
      color: cc,
      border: `1px solid ${cc}44`,
      borderRadius: 5,
      padding: '0 3px',
      lineHeight: 1.5
    }
  }, pos || '·'));
}
function Spark({
  data,
  color,
  w = 54,
  h = 16
}) {
  if (!data || !data.length) return null;
  const mx = Math.max(...data),
    mn = Math.min(...data);
  const p = data.map((v, i) => `${(i / (data.length - 1) * w).toFixed(1)},${(h - (v - mn) / Math.max(1, mx - mn) * h).toFixed(1)}`).join(' ');
  return React.createElement("svg", {
    width: w,
    height: h
  }, React.createElement("polyline", {
    points: p,
    fill: "none",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
function Pill({
  on,
  children,
  ...p
}) {
  return React.createElement("button", _extends({}, p, {
    style: {
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      padding: '6px 13px',
      borderRadius: 999,
      border: `1px solid ${on ? T.invBg : T.line2}`,
      background: on ? T.invBg : T.paper,
      color: on ? T.invFg : T.ink,
      fontWeight: 600,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }), children);
}
const ML = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  get color() {
    return T.faint;
  }
};
function StandingsPage({
  onTeam
}) {
  const [v, setV] = uS('League');
  const curSeasonId = window.NHL && window.NHL._season ? String(window.NHL._season) : window.BC && window.BC._seasonId || '20252026';
  const seasonList = uM(() => {
    const sy = +String(curSeasonId).slice(0, 4);
    return Array.from({
      length: 6
    }, (_, i) => {
      const a = sy - i;
      return String(a) + String(a + 1);
    });
  }, [curSeasonId]);
  const [season, setSeason] = uS(curSeasonId);
  const [seasonRows, setSeasonRows] = uS(null);
  const [seasonBusy, setSeasonBusy] = uS(false);
  const onSeason = e => {
    const s = e.target.value;
    setSeason(s);
    if (s === curSeasonId) {
      setSeasonRows(null);
      return;
    }
    setSeasonBusy(true);
    if (window.NHL && window.NHL.standingsForSeason) {
      window.NHL.standingsForSeason(s).then(r => {
        setSeasonRows(r && r.length ? r : []);
        setSeasonBusy(false);
      }).catch(() => {
        setSeasonRows([]);
        setSeasonBusy(false);
      });
    } else setSeasonBusy(false);
  };
  const STD = seasonRows && seasonRows.length ? seasonRows : D.STANDINGS;
  const seasSel = {
    fontFamily: MONO,
    fontSize: 12,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 8,
    padding: '6px 9px',
    color: T.ink,
    cursor: 'pointer'
  };
  const [sortK, setSortK] = uS(null);
  const [sortDir, setSortDir] = uS('desc');
  const views = ['League', 'Wild Card', 'Atlantic', 'Metro', 'Central', 'Pacific'];
  const baseRows = uM(() => v === 'League' ? STD : STD.filter(t => t.div === v), [v, seasonRows]);
  const sval = (t, k) => k === 'strk' ? (t.strk[0] === 'W' ? 1 : t.strk[0] === 'L' ? -1 : 0) * (parseInt(t.strk.slice(1), 10) || 0) : k === 'last10' ? parseInt(t.last10, 10) || 0 : t[k];
  const rows = uM(() => {
    if (!sortK) return baseRows;
    const r = [...baseRows].sort((a, b) => {
      const x = sval(a, sortK),
        y = sval(b, sortK);
      return sortDir === 'desc' ? y - x : x - y;
    });
    return r;
  }, [baseRows, sortK, sortDir]);
  const sortBy = k => {
    if (sortK === k) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortK(k);
      setSortDir(k === 'l' || k === 'ga' ? 'asc' : 'desc');
    }
  };
  const cut = v === 'League' ? 16 : 8;
  const confDivs = {
    East: ['Atlantic', 'Metro'],
    West: ['Central', 'Pacific']
  };
  const wildCard = conf => {
    const byDiv = confDivs[conf].map(d => ({
      d,
      teams: STD.filter(t => t.div === d).slice(0, 3)
    }));
    const top3 = new Set(byDiv.flatMap(x => x.teams.map(t => t.ab)));
    return {
      byDiv,
      wc: STD.filter(t => t.conf === conf && !top3.has(t.ab))
    };
  };
  const pstatus = uM(() => {
    const s = {};
    ['East', 'West'].forEach(conf => {
      const {
        byDiv,
        wc
      } = wildCard(conf);
      byDiv.forEach(x => x.teams.forEach(t => {
        s[t.ab] = 'clinch';
      }));
      wc.slice(0, 2).forEach(t => {
        s[t.ab] = 'wc';
      });
    });
    return s;
  }, [seasonRows]);
  const Mark = ({
    ab
  }) => {
    const st = pstatus[ab];
    if (!st) return null;
    if (st === 'clinch') return React.createElement("span", {
      title: "Clinched playoff position \u2014 division top 3",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 17,
        height: 17,
        borderRadius: 5,
        background: T.posBg,
        flexShrink: 0
      }
    }, React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: T.posFg,
      strokeWidth: "3.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, React.createElement("path", {
      d: "M5 13l4 4L19 7"
    })));
    return React.createElement("span", {
      title: "Wild card spot",
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '.04em',
        color: T.goldFg,
        background: T.goldBg,
        border: `1px solid ${T.goldLine}`,
        borderRadius: 5,
        padding: '1px 4px',
        flexShrink: 0
      }
    }, "WC");
  };
  const WCRow = ({
    t,
    seed,
    playoff
  }) => React.createElement("div", {
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'grid',
      gridTemplateColumns: '30px 1fr auto auto',
      alignItems: 'center',
      gap: 10,
      padding: '9px 14px',
      borderTop: `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: playoff ? '#1a8a4f' : T.faint,
      fontWeight: playoff ? 700 : 400
    }
  }, seed), React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      minWidth: 0
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 22
  }), React.createElement("span", {
    style: {
      color: T.ink,
      fontWeight: 600,
      fontSize: 13.5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, ct(t.ab), " ", nk(t.ab)), playoff && React.createElement(Mark, {
    ab: t.ab
  })), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut,
      whiteSpace: 'nowrap'
    }
  }, t.w, "-", t.l, "-", t.otl), React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      minWidth: 28,
      textAlign: 'right'
    }
  }, t.pts));
  const WCSection = ({
    label,
    sub,
    children
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '11px 14px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, React.createElement("span", {
    style: ML
  }, label), sub && React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, sub)), children);
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Standings",
    t: v === 'Wild Card' ? 'Wild Card' : 'League',
    serif: v === 'Wild Card' ? 'race' : 'table',
    right: React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center'
      }
    }, React.createElement("select", {
      value: season,
      onChange: onSeason,
      style: seasSel,
      title: "Season (this page only)"
    }, seasonList.map(s => React.createElement("option", {
      key: s,
      value: s
    }, s.slice(0, 4), "-", s.slice(6, 8)))), seasonBusy && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: T.faint
      }
    }, "loading\u2026"), views.map(x => React.createElement(Pill, {
      key: x,
      on: v === x,
      onClick: () => setV(x)
    }, x)))
  }), v === 'Wild Card' ? React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    },
    className: "g2"
  }, ['East', 'West'].map(conf => {
    const {
      byDiv,
      wc
    } = wildCard(conf);
    return React.createElement("div", {
      key: conf,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        fontSize: 12,
        color: T.ink,
        letterSpacing: '.1em'
      }
    }, conf === 'East' ? 'Eastern' : 'Western', " Conference"), byDiv.map(({
      d,
      teams
    }) => React.createElement(WCSection, {
      key: d,
      label: d,
      sub: "top 3"
    }, teams.map((t, i) => React.createElement(WCRow, {
      key: t.ab,
      t: t,
      seed: i + 1,
      playoff: true
    })))), React.createElement(WCSection, {
      label: "Wild Card",
      sub: "2 spots"
    }, wc.map((t, i) => React.createElement(React.Fragment, {
      key: t.ab
    }, React.createElement(WCRow, {
      t: t,
      seed: i < 2 ? `WC${i + 1}` : i + 1,
      playoff: i < 2
    }), i === 1 && React.createElement("div", {
      style: {
        borderTop: `1.5px dashed ${T.red}`,
        opacity: .5,
        padding: '2px 14px',
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: T.red,
        textAlign: 'center'
      }
    }, "playoff cut line")))));
  }), React.createElement("style", null, `@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`)) : React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "ed-scrollx ed-stickcol2",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 740,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, [['#', null], ['Team', null], ['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['OT', 'otl'], ['PTS', 'pts'], ['GF', 'gf'], ['GA', 'ga'], ['DIFF', 'diff'], ['L10', 'last10'], ['STRK', 'strk'], ['Trend', null]].map(([h, k], i) => React.createElement("th", {
    key: h,
    onClick: k ? () => sortBy(k) : undefined,
    style: {
      padding: '12px 10px',
      textAlign: i < 2 ? 'left' : 'center',
      fontWeight: 600,
      ...ML,
      cursor: k ? 'pointer' : 'default',
      color: sortK === k && k ? T.ink : undefined,
      whiteSpace: 'nowrap'
    }
  }, h, sortK === k && k ? sortDir === 'desc' ? ' ↓' : ' ↑' : '')))), React.createElement("tbody", null, rows.map((t, i) => React.createElement(React.Fragment, {
    key: t.ab
  }, React.createElement("tr", {
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      cursor: 'pointer',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '11px 10px',
      color: T.faint,
      fontFamily: MONO
    }
  }, String(i + 1).padStart(2, '0')), React.createElement("td", {
    style: {
      padding: '11px 10px'
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 24
  }), React.createElement("span", {
    style: {
      color: T.ink,
      fontWeight: 600
    }
  }, ct(t.ab), " ", nk(t.ab)), React.createElement(Mark, {
    ab: t.ab
  }))), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, t.gp), React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, t.w), React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, t.l), React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, t.otl), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontWeight: 700
    }
  }, t.pts), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, t.gf), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, t.ga), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: t.diff >= 0 ? '#1a8a4f' : T.red,
      fontWeight: 600
    }
  }, t.diff >= 0 ? '+' : '', t.diff), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut,
      fontFamily: MONO,
      fontSize: 12
    }
  }, t.last10), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontWeight: 700,
      color: t.strk[0] === 'W' ? '#1a8a4f' : t.strk[0] === 'L' ? T.red : T.faint,
      fontFamily: MONO,
      fontSize: 12
    }
  }, t.strk), React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-block'
    }
  }, React.createElement(Spark, {
    data: t.trend,
    color: t.diff >= 0 ? '#1a8a4f' : T.red,
    w: 42,
    h: 13
  })))), !sortK && cut === i + 1 && React.createElement("tr", null, React.createElement("td", {
    colSpan: 13,
    style: {
      borderTop: `1.5px dashed ${T.red}`,
      opacity: .5,
      padding: '2px 10px',
      fontFamily: MONO,
      fontSize: 9.5,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: T.red,
      textAlign: 'center'
    }
  }, "playoff cut line")))))))), v === 'League' && React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 12,
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement(Mark, {
    ab: STD[0].ab
  }), "clinched playoff spot (division top 3)"), React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 9,
      fontWeight: 700,
      color: T.goldFg,
      background: T.goldBg,
      border: `1px solid ${T.goldLine}`,
      borderRadius: 5,
      padding: '1px 4px'
    }
  }, "WC"), "wild card"))));
}
function TeamsPage({
  onTeam
}) {
  const [conf, setConf] = uS('All');
  const [q, setQ] = uS('');
  const DIVS = ['Atlantic', 'Metro', 'Central', 'Pacific'];
  const matchScope = t => conf === 'All' || t.conf === conf || t.div === conf;
  const rows = uM(() => D.STANDINGS.filter(t => matchScope(t) && `${ct(t.ab)} ${nk(t.ab)} ${t.ab}`.toLowerCase().includes(q.toLowerCase())), [conf, q]);
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Teams",
    t: "All 32",
    serif: "clubs",
    right: React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, React.createElement("input", {
      value: q,
      onChange: e => setQ(e.target.value),
      placeholder: "Search",
      style: {
        fontFamily: 'inherit',
        background: T.paper,
        border: `1px solid ${T.line2}`,
        borderRadius: 9,
        padding: '7px 12px',
        color: T.ink,
        fontSize: 13,
        outline: 'none'
      }
    }), ['All', 'East', 'West', ...DIVS].map(x => React.createElement(Pill, {
      key: x,
      on: conf === x,
      onClick: () => setConf(x)
    }, x)))
  }), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(248px,1fr))',
      gap: 14
    }
  }, rows.map(t => React.createElement("div", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "ec",
    style: {
      ...card,
      overflow: 'hidden',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      height: 4,
      background: c2(t.ab)
    }
  }), React.createElement("div", {
    style: {
      padding: 16
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 40
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, ct(t.ab)), React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.mut
    }
  }, nk(t.ab)))), React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 13,
      borderTop: `1px solid ${T.line}`,
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, React.createElement("span", null, "#", D.rankOf[t.ab], " \xB7 ", t.div), React.createElement("span", {
    style: {
      color: T.ink,
      fontWeight: 500,
      whiteSpace: 'nowrap'
    }
  }, t.w, "-", t.l, "-", t.otl)))))));
}
const ED_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ED_MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function TeamSchedule({
  ab,
  onGame
}) {
  const today = uM(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [mAnchor, setMAnchor] = uS(0);
  const dOf = o => {
    const d = new Date(today);
    d.setDate(d.getDate() + o);
    return d;
  };
  const offOf = d => Math.round((d - today) / 86400000);
  const liveSched = window.E_useLive(null, () => window.NHL.clubScheduleMapped(ab), [ab], 'clubSched:' + ab);
  const liveByDate = uM(() => {
    const m = {};
    (liveSched || []).forEach(g => {
      m[g._date] = g;
    });
    return m;
  }, [liveSched]);
  const ymdK = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const gameOn = o => {
    const k = ymdK(dOf(o));
    return liveByDate[k] || D.slate(o).find(g => g.a === ab || g.h === ab);
  };
  const open = g => {
    if (g) onGame(g);
  };
  const WeekCell = ({
    o
  }) => {
    const d = dOf(o),
      g = gameOn(o),
      isT = o === 0;
    const home = g && g.h === ab,
      opp = g ? home ? g.a : g.h : null;
    const final = g && g.st.startsWith('final');
    const won = final && (home && g.hs > g.as || !home && g.as > g.hs);
    return React.createElement("div", {
      onClick: () => open(g),
      className: g ? 'er' : '',
      style: {
        cursor: g ? 'pointer' : 'default',
        background: g ? `${c2(ab)}10` : T.paper,
        border: `1px solid ${g ? c2(ab) + '44' : T.line}`,
        borderRadius: 11,
        padding: '10px 11px',
        height: 92,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: isT ? T.red : T.faint
      }
    }, ED_WD[d.getDay()]), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 16
      }
    }, d.getDate())), g ? React.createElement("div", {
      style: {
        marginTop: 'auto'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9.5,
        color: T.faint
      }
    }, home ? 'vs' : '@'), React.createElement(Badge, {
      ab: opp,
      size: 17
    }), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        fontWeight: 600
      }
    }, opp)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: final ? won ? '#1a8a4f' : T.red : T.mut,
        marginTop: 2
      }
    }, final ? `${won ? 'W' : 'L'} ${home ? g.hs : g.as}–${home ? g.as : g.hs}` : g.start || '')) : React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        marginTop: 'auto'
      }
    }, "no game"));
  };
  const base = dOf(mAnchor),
    y = base.getFullYear(),
    m = base.getMonth();
  const lead = new Date(y, m, 1).getDay(),
    days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let dd = 1; dd <= days; dd++) cells.push(offOf(new Date(y, m, dd)));
  const monthGames = cells.filter(o => o !== null && gameOn(o)).length;
  const goMonth = delta => setMAnchor(offOf(new Date(y, m + delta, 1)));
  const curMonthOff = offOf(new Date(y, m, 1));
  const monthOpts = uM(() => {
    const b = new Date(today.getFullYear(), today.getMonth(), 1);
    const arr = [];
    for (let i = -3; i <= 9; i++) {
      const d = new Date(b.getFullYear(), b.getMonth() + i, 1);
      arr.push({
        off: offOf(d),
        label: `${ED_MO[d.getMonth()]} ${d.getFullYear()}`
      });
    }
    return arr;
  }, []);
  const navBtn = {
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    width: 30,
    height: 30,
    borderRadius: 8,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    color: T.mut,
    cursor: 'pointer'
  };
  const selSty = {
    fontFamily: MONO,
    fontSize: 11.5,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 8,
    padding: '6px 8px',
    color: T.ink,
    cursor: 'pointer'
  };
  const MCell = ({
    o
  }) => {
    const d = dOf(o),
      g = gameOn(o),
      cur = o === 0,
      isT = o === 0;
    const home = g && g.h === ab,
      opp = g ? home ? g.a : g.h : null;
    const final = g && g.st.startsWith('final');
    const won = final && (home && g.hs > g.as || !home && g.as > g.hs);
    return React.createElement("div", {
      onClick: () => open(g),
      className: g ? 'er' : '',
      style: {
        cursor: g ? 'pointer' : 'default',
        background: g ? `${c2(ab)}12` : T.paper,
        color: T.ink,
        border: `1px solid ${g ? c2(ab) + '55' : T.line}`,
        borderRadius: 8,
        padding: '6px 7px',
        height: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 12,
        color: isT ? T.red : T.ink
      }
    }, d.getDate()), g && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 8.5,
        color: T.faint
      }
    }, home ? 'VS' : '@')), g ? React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, React.createElement(Badge, {
      ab: opp,
      size: 15
    }), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        fontWeight: 600
      }
    }, opp), final && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: won ? '#1a8a4f' : T.faint
      }
    }, won ? 'W' : 'L')) : React.createElement("span", {
      style: {
        color: T.line2,
        fontSize: 11
      }
    }, "\xB7"));
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 12
    }
  }, "This week"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 8
    }
  }, Array.from({
    length: 7
  }, (_, i) => React.createElement(WeekCell, {
    key: i,
    o: 0 - dOf(0).getDay() + i
  })))), React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 12,
      flexWrap: 'wrap'
    }
  }, React.createElement("select", {
    value: curMonthOff,
    onChange: e => setMAnchor(+e.target.value),
    style: selSty
  }, monthOpts.map(o => React.createElement("option", {
    key: o.off,
    value: o.off
  }, o.label))), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, monthGames, " games"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, React.createElement("button", {
    onClick: () => goMonth(-1),
    style: navBtn,
    "aria-label": "Previous month"
  }, "\u2039"), React.createElement("button", {
    onClick: () => goMonth(1),
    style: navBtn,
    "aria-label": "Next month"
  }, "\u203A")))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 6
    }
  }, ED_WD.map(w => React.createElement("div", {
    key: w,
    style: {
      ...ML,
      fontSize: 9,
      textAlign: 'center',
      paddingBottom: 2
    }
  }, w[0])), cells.map((o, i) => o === null ? React.createElement("div", {
    key: i
  }) : React.createElement(MCell, {
    key: i,
    o: o
  }))), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint,
      marginTop: 12
    }
  }, "vs = home \xB7 @ = away \xB7 W/L shows finals \xB7 tap a game to open it")));
}
function Tabs({
  tabs,
  active,
  onChange
}) {
  return React.createElement("div", {
    className: "ed-tabscroll",
    style: {
      display: 'flex',
      gap: 24,
      borderBottom: `1px solid ${T.line}`,
      marginBottom: 20,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }
  }, tabs.map(t => React.createElement("button", {
    key: t,
    onClick: () => onChange(t),
    style: {
      fontFamily: 'inherit',
      background: 'none',
      border: 'none',
      borderBottom: `2px solid ${active === t ? T.ink : 'transparent'}`,
      color: active === t ? T.ink : T.mut,
      fontWeight: 600,
      fontSize: 14,
      padding: '10px 0',
      marginBottom: -1,
      cursor: 'pointer',
      flexShrink: 0,
      whiteSpace: 'nowrap'
    }
  }, t)));
}
function RankChip({
  rank
}) {
  if (!rank) return null;
  const tone = rank <= 5 ? [T.posBg, T.posFg] : rank >= 26 ? [T.negBg, T.negFg] : [T.bg, T.faint];
  return React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      fontWeight: 600,
      padding: '1px 6px',
      borderRadius: 5,
      background: tone[0],
      color: tone[1]
    }
  }, "#", rank);
}
function Metric({
  l,
  v,
  suf,
  rank
}) {
  return React.createElement("div", {
    style: {
      border: `1px solid ${T.line}`,
      borderRadius: 11,
      padding: '13px 15px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement(RankChip, {
    rank: rank
  })), React.createElement("div", {
    style: {
      fontSize: 23,
      fontWeight: 600,
      color: T.ink,
      marginTop: 3,
      letterSpacing: '-.02em'
    }
  }, v, suf || ''));
}
function TeamStatsTab({
  ab
}) {
  const [sub, setSub] = uS('Highlights');
  const ts = D.teamStatsFull(ab);
  const roster = D.teamRoster(ab).slice(0, 5);
  const Panel = ({
    title,
    children
  }) => React.createElement("div", {
    style: {
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: 16
    }
  }, React.createElement("div", {
    style: ML
  }, title), React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, children));
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, ['Highlights', 'Offense', 'Defense', 'Special Teams', 'Advanced'].map(s => React.createElement(Pill, {
    key: s,
    on: sub === s,
    onClick: () => setSub(s)
  }, s))), sub === 'Highlights' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement(Metric, {
    l: "Goals / game",
    v: ts.gfPg,
    rank: ts.ranks.gf
  }), React.createElement(Metric, {
    l: "GA / game",
    v: ts.gaPg,
    rank: ts.ranks.ga
  }), React.createElement(Metric, {
    l: "Power play",
    v: ts.pp,
    suf: "%",
    rank: ts.ranks.pp
  }), React.createElement(Metric, {
    l: "Penalty kill",
    v: ts.pk,
    suf: "%",
    rank: ts.ranks.pk
  }), React.createElement(Metric, {
    l: "Faceoff %",
    v: ts.fo,
    suf: "%",
    rank: ts.ranks.fo
  }), React.createElement(Metric, {
    l: "Point %",
    v: ts.ptPct,
    rank: ts.ranks.pt
  })), React.createElement(Panel, {
    title: "Top skaters"
  }, React.createElement("div", null, roster.map(p => React.createElement("div", {
    key: p.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement(Badge, {
    ab: p.team,
    size: 20
  }), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: T.ink
    }
  }, p.name, " ", React.createElement("span", {
    style: {
      color: T.faint
    }
  }, p.pos)), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, React.createElement("b", {
    style: {
      color: T.ink
    }
  }, p.p), " P")))))), sub === 'Offense' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12
    }
  }, React.createElement(Metric, {
    l: "Goals / game",
    v: ts.gfPg,
    rank: ts.ranks.gf
  }), React.createElement(Metric, {
    l: "Shots / game",
    v: ts.shotsFor
  }), React.createElement(Metric, {
    l: "Shooting %",
    v: ts.shPct,
    suf: "%"
  }), React.createElement(Metric, {
    l: "PP goals",
    v: ts.gfStr.pp
  })), sub === 'Defense' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12
    }
  }, React.createElement(Metric, {
    l: "GA / game",
    v: ts.gaPg,
    rank: ts.ranks.ga
  }), React.createElement(Metric, {
    l: "Shots against",
    v: ts.shotsAgainst
  }), React.createElement(Metric, {
    l: "Team SV%",
    v: ts.svPct
  }), React.createElement(Metric, {
    l: "PK goals against",
    v: ts.gaStr.pp
  })), sub === 'Special Teams' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12
    }
  }, React.createElement(Metric, {
    l: "Power play",
    v: ts.pp,
    suf: "%",
    rank: ts.ranks.pp
  }), React.createElement(Metric, {
    l: "Penalty kill",
    v: ts.pk,
    suf: "%",
    rank: ts.ranks.pk
  }), React.createElement(Metric, {
    l: "PP goals for",
    v: ts.gfStr.pp
  }), React.createElement(Metric, {
    l: "SH goals for",
    v: ts.gfStr.sh
  }), React.createElement(Metric, {
    l: "PP goals against",
    v: ts.gaStr.pp
  }), React.createElement(Metric, {
    l: "Faceoff %",
    v: ts.fo,
    suf: "%",
    rank: ts.ranks.fo
  })), sub === 'Advanced' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12
    }
  }, React.createElement(Metric, {
    l: "PDO",
    v: ts.pdo
  }), React.createElement(Metric, {
    l: "Point %",
    v: ts.ptPct,
    rank: ts.ranks.pt
  }), React.createElement(Metric, {
    l: "Shooting %",
    v: ts.shPct,
    suf: "%"
  }), React.createElement(Metric, {
    l: "Save %",
    v: ts.svPct
  }), React.createElement(Metric, {
    l: "Shots for",
    v: ts.shotsFor
  }), React.createElement(Metric, {
    l: "Shots against",
    v: ts.shotsAgainst
  })));
}
function MiniGame({
  g,
  onOpen
}) {
  const aw = g.st.startsWith('final') && g.as > g.hs,
    hw = g.st.startsWith('final') && g.hs > g.as;
  return React.createElement("div", {
    onClick: () => onOpen && onOpen(g),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: `1px solid ${T.line}`,
      cursor: onOpen ? 'pointer' : 'default'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement(Badge, {
    ab: g.a,
    size: 18
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: aw ? 700 : 500
    }
  }, ct(g.a))), React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement(Badge, {
    ab: g.h,
    size: 18
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: hw ? 700 : 500
    }
  }, ct(g.h)))), React.createElement("div", {
    style: {
      textAlign: 'right',
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, g.st.startsWith('final') ? React.createElement("span", {
    style: {
      color: T.ink,
      fontWeight: 600
    }
  }, g.as, "\u2013", g.hs) : g.st === 'live' ? React.createElement("span", {
    style: {
      color: T.red
    }
  }, "LIVE") : g.start));
}
function TeamDetailPage({
  ab,
  onBack,
  onPlayer,
  onGame
}) {
  const [tab, setTab] = uS('Hub');
  const t = D.standBy(ab);
  const gap = D.wildCardGap(ab);
  const _sid = window.NHL && window.NHL._season ? String(window.NHL._season) : window.BC && window.BC._seasonId || '';
  const _yr = _sid.length === 8 ? _sid.slice(4, 8) : '';
  const _titles = D.teamTitles ? D.teamTitles(ab) : null;
  const reigning = !!(_yr && _titles && _titles.stanleyCups && _titles.stanleyCups.length && String(_titles.stanleyCups[0]) === _yr);
  const _gold = T.mode === 'dark' ? '#cda85a' : '#9a7c2a';
  const roster = window.E_useLive(D.teamRoster(ab), () => new Promise(res => {
    window.BC.ensureRoster(ab, () => res(window.BC.teamRoster(ab)));
  }), [ab], 'roster:' + ab);
  const schedMock = uM(() => D.teamSchedule(ab), [ab]);
  const sched = window.E_useLive(schedMock, () => window.NHL.teamRecUp(ab), [ab], 'teamRecUp:' + ab);
  const prosMock = uM(() => D.prospects(ab), [ab]);
  const pros = window.E_useLive(prosMock, () => window.NHL.prospectsMapped(ab), [ab], 'prospects:' + ab);
  const fwd = roster.filter(p => p.pos !== 'D' && p.pos !== 'G'),
    def = roster.filter(p => p.pos === 'D');
  const rg = roster.filter(p => p._isGoalie || p.pos === 'G');
  const tg = rg.length ? rg.map(g => ({
    ...(D.goalies.find(x => String(x.id) === String(g.id)) || {}),
    ...g,
    pos: 'G'
  })) : D.goalies.filter(g => g.team === ab);
  const Stat = ({
    l,
    v
  }) => React.createElement("div", {
    style: {
      ...card,
      padding: '15px 16px'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 600,
      color: T.ink,
      marginTop: 4,
      letterSpacing: '-.02em'
    }
  }, v));
  const RT = ({
    title,
    rows,
    cols
  }) => rows.length ? React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 8
    }
  }, title), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, React.createElement("th", {
    style: {
      padding: '9px 14px',
      textAlign: 'left',
      fontWeight: 600,
      ...ML
    }
  }, "Player"), cols.map(([h]) => React.createElement("th", {
    key: h,
    style: {
      padding: '9px',
      textAlign: 'center',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, rows.map(p => React.createElement("tr", {
    key: p.id,
    onClick: () => onPlayer(p),
    className: "er",
    style: {
      cursor: 'pointer',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 14px',
      color: T.ink,
      fontWeight: 500
    }
  }, p.name, " ", React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11
    }
  }, "#", p.num)), cols.map(([h, k]) => React.createElement("td", {
    key: h,
    style: {
      textAlign: 'center',
      color: k === 'p' ? T.ink : T.mut,
      fontWeight: k === 'p' ? 700 : 400
    }
  }, k === 'pm' ? (p[k] >= 0 ? '+' : '') + p[k] : p[k])))))))) : null;
  const SC = [['Pos', 'pos'], ['GP', 'gp'], ['G', 'g'], ['A', 'a'], ['P', 'p'], ['+/-', 'pm']],
    GC = [['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['SV%', 'svp'], ['GAA', 'gaa']];
  const socialMock = uM(() => {
    const r = (roster || []).filter(p => p.pos !== 'G');
    const p0 = r[0] && r[0].name || 'the captain',
      p1 = r[1] && r[1].name || 'a depth forward';
    return [{
      kind: 'x',
      time: '2h',
      likes: '3.4K',
      rt: '412',
      text: `\uD83D\uDEA8 GAME DAY \uD83D\uDEA8 The ${nk(ab)} are back at it tonight. Puck drop soon \u2014 let\u2019s go.`
    }, {
      kind: 'recap',
      time: '1d',
      title: `Recap: ${ct(ab)} grind out a road win`,
      text: `${p0} and ${p1} powered a third-period push as ${ct(ab)} closed out a 4\u20132 victory.`
    }, {
      kind: 'x',
      time: '1d',
      likes: '1.2K',
      rt: '88',
      text: `Morning skate is in the books. ${p1} draws back into the lineup tonight.`
    }, {
      kind: 'news',
      time: '2d',
      source: 'Beat',
      title: `${ct(ab)} sign depth forward to a two-way deal`,
      text: `The club added organizational depth down the middle ahead of the stretch run.`
    }, {
      kind: 'x',
      time: '3d',
      likes: '5.8K',
      rt: '903',
      text: `WHAT A FINISH. ${p0} buries the overtime winner \uD83D\uDEA8`
    }, {
      kind: 'recap',
      time: '4d',
      title: `Recap: special teams carry the ${nk(ab)}`,
      text: `A 2-for-3 power play and a perfect penalty kill were the difference on the night.`
    }];
  }, [ab, roster]);
  const social = window.E_useLive(socialMock, () => window.NHL && window.NHL.teamSocial ? window.NHL.teamSocial(ab) : null, [ab], 'teamSocial:' + ab);
  const histSeasonsMock = uM(() => {
    const cy = 2024;
    return Array.from({
      length: 8
    }, (_, i) => ({
      id: `${cy - i}${cy - i + 1}`,
      label: `${cy - i}\u2013${String(cy - i + 1).slice(2)}`,
      playoffs: true
    }));
  }, []);
  const histSeasons = window.E_useLive(histSeasonsMock, () => window.NHL && window.NHL.clubStatsSeasons ? window.NHL.clubStatsSeasons(ab) : null, [ab], 'clubSeasons:' + ab);
  const [histSel, setHistSel] = React.useState(null);
  React.useEffect(() => {
    if (histSeasons && histSeasons.length && !histSel) setHistSel(histSeasons[0].id);
  }, [histSeasons]);
  const histMock = uM(() => {
    if (!histSel) return null;
    const sk = (roster || []).filter(p => p.pos !== 'G').slice(0, 18).map((p, i) => {
      const g = Math.max(0, 38 - i * 2),
        a = Math.max(1, 52 - i * 3);
      return {
        id: p.id,
        name: p.name,
        pos: p.pos,
        gp: 82 - i % 6,
        g,
        a,
        p: g + a,
        pm: 18 - i,
        pim: 8 + i * 3,
        ppg: Math.max(0, 11 - i),
        shots: 160 - i * 7
      };
    }).sort((a, b) => b.p - a.p);
    const go = D.goalies.filter(g => g.team === ab).slice(0, 2).map((g, i) => ({
      id: g.id,
      name: g.name,
      gp: 52 - i * 22,
      w: 31 - i * 12,
      l: 16 + i * 2,
      otl: 5,
      svp: g.svp,
      gaa: g.gaa,
      so: 4 - i
    }));
    return {
      season: histSel,
      skaters: sk,
      goalies: go
    };
  }, [histSel, ab, roster]);
  const histData = window.E_useLive(histMock, () => histSel && window.NHL && window.NHL.clubStatsForSeason ? window.NHL.clubStatsForSeason(ab, histSel, 2) : null, [histSel, ab]);
  const franchiseMock = uM(() => {
    const f = D.teamFranchiseRecords(ab);
    const a = f && f.allTime;
    return a ? {
      gp: null,
      w: a.wins,
      l: null,
      winPct: a.winPct,
      first: null,
      seasons: a.seasons,
      playoffs: null
    } : null;
  }, [ab]);
  const franchise = window.E_useLive(franchiseMock, () => window.NHL && window.NHL.teamFranchiseMapped ? window.NHL.teamFranchiseMapped(ab).then(d => d ? d.allTime : null) : null, [ab], 'franchise:' + ab);
  const seasonStory = (d, label) => {
    if (!d) return '';
    const sk = d.skaters || [],
      go = d.goalies || [];
    if (!sk.length && !go.length) return '';
    const team = `${ct(ab)} ${nk(ab)}`;
    const top = sk[0],
      g2 = sk[1];
    const topG = [...go].sort((a, b) => (b.w || 0) - (a.w || 0))[0];
    const totG = sk.reduce((s, p) => s + (p.g || 0), 0);
    const snipers = [...sk].sort((a, b) => (b.g || 0) - (a.g || 0))[0];
    const out = [];
    if (top) out.push(`In ${label}, ${top.name} paced the ${team} with ${top.p} points (${top.g} goals, ${top.a} assists) over ${top.gp} games` + (g2 ? `, with ${g2.name} close behind at ${g2.p}.` : '.'));
    if (snipers && top && snipers.id !== top.id) out.push(`${snipers.name} led the team in goals with ${snipers.g}.`);
    if (topG && topG.gp) out.push(`Between the pipes, ${topG.name} went ${topG.w}\u2013${topG.l}${topG.otl ? `\u2013${topG.otl}` : ''}` + (topG.svp ? ` with a ${typeof topG.svp === 'number' ? topG.svp.toFixed(3).slice(1) : topG.svp} save percentage` : '') + (topG.so ? ` and ${topG.so} shutouts.` : '.'));
    out.push(`As a group the roster combined for ${totG} goals across the season.`);
    return out.join(' ');
  };
  return React.createElement("div", null, React.createElement("button", {
    onClick: onBack,
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: '0 0 18px'
    }
  }, "\u2190 back to teams"), React.createElement("div", {
    style: {
      ...card,
      padding: 0,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      height: 5,
      background: reigning ? 'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)' : c2(ab)
    }
  }), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '24px',
      flexWrap: 'wrap'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 56
  }), React.createElement("div", null, React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-.02em',
      color: T.ink
    }
  }, ct(ab), " ", nk(ab)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut,
      marginTop: 3
    }
  }, t.div, " division \xB7 ", t.conf === 'East' ? 'eastern' : 'western', " conference"), reigning && React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      fontFamily: MONO,
      fontSize: 10.5,
      letterSpacing: '.04em',
      color: _gold,
      background: T.mode === 'dark' ? 'rgba(202,162,78,.14)' : 'rgba(202,162,78,.12)',
      border: `1px solid ${T.mode === 'dark' ? 'rgba(202,162,78,.35)' : '#e8dcb4'}`,
      borderRadius: 999,
      padding: '3px 10px'
    }
  }, React.createElement("span", null, "\uD83C\uDFC6"), _yr, " Stanley Cup Champions"))), gap && React.createElement("div", {
    style: {
      border: `1px solid ${T.line2}`,
      borderRadius: 11,
      padding: '10px 14px'
    }
  }, React.createElement("div", {
    style: ML
  }, "Wild-card gap"), React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: gap.inField ? '#1a8a4f' : T.red
    }
  }, gap.gap >= 0 ? '+' : '', gap.gap, " ", React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      fontWeight: 400,
      color: T.mut
    }
  }, gap.inField ? 'in field' : 'outside'))))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement(Stat, {
    l: "Record",
    v: `${t.w}-${t.l}-${t.otl}`
  }), React.createElement(Stat, {
    l: "League rank",
    v: `#${D.rankOf[ab]}`
  }), React.createElement(Stat, {
    l: "Goal diff",
    v: `${t.diff >= 0 ? '+' : ''}${t.diff}`
  }), React.createElement(Stat, {
    l: "Last 10",
    v: t.last10
  })), React.createElement(Tabs, {
    tabs: ['Hub', 'Buzz', 'Stats', 'Shot zones', 'Schedule', 'Roster', 'Prospects', 'History', 'Records'],
    active: tab,
    onChange: setTab
  }), tab === 'History' && (() => {
    const sel = (histSeasons || []).find(s => s.id === histSel);
    const story = seasonStory(histData, sel ? sel.label : '');
    const sk = histData && histData.skaters || [],
      go = histData && histData.goalies || [];
    const fmtSv = v => v == null ? '\u2014' : typeof v === 'number' ? v.toFixed(3).slice(1) : v;
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: 16,
        flexWrap: 'wrap'
      }
    }, React.createElement("div", {
      style: {
        ...ML
      }
    }, "Season"), React.createElement("select", {
      value: histSel || '',
      onChange: e => setHistSel(e.target.value),
      style: {
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 600,
        background: T.bg,
        border: `1px solid ${T.line2}`,
        borderRadius: 8,
        padding: '7px 10px',
        color: T.ink,
        cursor: 'pointer'
      }
    }, (histSeasons || []).map(s => React.createElement("option", {
      key: s.id,
      value: s.id
    }, s.label, s.playoffs ? ' \u00b7 made playoffs' : ''))), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#b5762a',
        border: '1px solid rgba(181,118,42,.35)',
        borderRadius: 5,
        padding: '2px 7px'
      },
      title: "Historical skater & goalie stats pulled live from the NHL on deploy"
    }, "History \xB7 beta")), story && React.createElement("div", {
      className: "ec",
      style: {
        ...card,
        padding: '16px 18px',
        marginBottom: 16,
        borderLeft: `3px solid ${c2(ab)}`
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: T.red
      }
    }, "Season story"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9.5,
        color: T.faint
      }
    }, "auto-generated from the box score")), React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontSize: 16.5,
        lineHeight: 1.5,
        color: T.ink
      }
    }, story)), RT({
      title: `Skaters \u00b7 ${sel ? sel.label : ''}`,
      rows: sk,
      cols: [['Pos', 'pos'], ['GP', 'gp'], ['G', 'g'], ['A', 'a'], ['P', 'p'], ['+/-', 'pm']]
    }), go.length > 0 && React.createElement("div", {
      style: {
        marginBottom: 18
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 8
      }
    }, "Goalies \xB7 ", sel ? sel.label : ''), React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13.5
      }
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      style: {
        padding: '9px 14px',
        textAlign: 'left',
        ...ML
      }
    }, "Goalie"), [['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['SO', 'so'], ['SV%', 'svp'], ['GAA', 'gaa']].map(([h]) => React.createElement("th", {
      key: h,
      style: {
        padding: '9px',
        textAlign: 'center',
        ...ML
      }
    }, h)))), React.createElement("tbody", null, go.map(p => React.createElement("tr", {
      key: p.id,
      onClick: () => onPlayer(p),
      className: "er",
      style: {
        cursor: 'pointer',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '9px 14px',
        color: T.ink,
        fontWeight: 500
      }
    }, p.name), [['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['SO', 'so'], ['SV%', 'svp'], ['GAA', 'gaa']].map(([h, k]) => React.createElement("td", {
      key: h,
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, k === 'svp' ? fmtSv(p[k]) : k === 'gaa' ? p[k] != null ? (+p[k]).toFixed(2) : '\u2014' : p[k])))))))), !sk.length && !go.length && React.createElement("div", {
      style: {
        ...card,
        padding: '40px 18px',
        textAlign: 'center',
        color: T.mut,
        fontSize: 14
      }
    }, "No stats on file for this season."), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        marginTop: 6,
        lineHeight: 1.6
      }
    }, "Season story is generated from the season's real box score \u2014 no external AI. Historical stats load live from the NHL on deploy."));
  })(), tab === 'Hub' && (() => {
    const news = D.teamNews(ab);
    const NACC = {
      pos: '#1a8a4f',
      neg: T.red,
      gold: '#b5762a',
      edge: '#1a8a4f',
      brand: c2(ab),
      mut: T.faint
    };
    const GameHero = ({
      label,
      g,
      emptyMsg
    }) => {
      if (!g) return React.createElement("div", {
        style: {
          ...card,
          padding: '16px 18px'
        }
      }, React.createElement("div", {
        style: ML
      }, label), React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 12,
          color: T.mut,
          marginTop: 10
        }
      }, emptyMsg || 'None scheduled'));
      const final = g.st.startsWith('final');
      const home = g.h === ab;
      const us = home ? g.hs : g.as,
        them = home ? g.as : g.hs;
      const won = final && us > them;
      const winAb = final ? g.as > g.hs ? g.a : g.h : null;
      return React.createElement("div", {
        onClick: () => onGame(g),
        className: "ec",
        style: {
          ...card,
          overflow: 'hidden',
          cursor: 'pointer'
        }
      }, React.createElement("div", {
        style: {
          padding: '11px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${T.line}`
        }
      }, React.createElement("span", {
        style: ML
      }, label), React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: final ? won ? '#1a8a4f' : T.red : '#1a8a4f',
          fontWeight: 600
        }
      }, final ? `${won ? 'W' : 'L'} ${us}–${them}` : g.start || 'Upcoming')), React.createElement("div", {
        style: {
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }
      }, [[g.a, g.as], [g.h, g.hs]].map(([tm, sc]) => React.createElement("div", {
        key: tm,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }
      }, React.createElement(Badge, {
        ab: tm,
        size: 26
      }), React.createElement("span", {
        style: {
          flex: 1,
          fontWeight: tm === ab ? 700 : 500,
          color: tm === ab ? T.ink : T.mut,
          fontSize: 14
        }
      }, ct(tm), " ", nk(tm)), final ? React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontWeight: tm === winAb ? 700 : 400,
          fontSize: 16,
          color: tm === winAb ? T.ink : T.faint
        }
      }, sc) : React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: T.faint,
          whiteSpace: 'nowrap'
        }
      }, D.standBy(tm).w, "-", D.standBy(tm).l, "-", D.standBy(tm).otl)))));
    };
    const NewsCard = ({
      c
    }) => {
      const click = c.kind === 'player' ? () => onPlayer(c.ref) : c.kind === 'game' ? () => onGame(c.ref) : () => setTab(c.ref);
      return React.createElement("div", {
        onClick: click,
        className: "ec",
        style: {
          ...card,
          padding: '16px 17px',
          cursor: 'pointer'
        }
      }, React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: NACC[c.accent] || T.red
        }
      }, c.tag), React.createElement("div", {
        style: {
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 1.25,
          color: T.ink,
          margin: '7px 0 5px'
        }
      }, c.headline), React.createElement("div", {
        style: {
          fontSize: 12.5,
          color: T.mut
        }
      }, c.sub));
    };
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 18
      },
      className: "g2"
    }, React.createElement(GameHero, {
      label: "Last game",
      g: sched.rec[0]
    }), React.createElement(GameHero, {
      label: "Next game",
      g: sched.up[0],
      emptyMsg: sched.rec && sched.rec.length ? 'Season complete' : 'None scheduled'
    })), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: ML
    }, ct(ab), " headlines"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#b5762a',
        border: '1px solid rgba(181,118,42,.35)',
        borderRadius: 5,
        padding: '2px 6px'
      },
      title: "Generated narrative from live standings & stats \u2014 not reporting"
    }, "Editorial")), React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 14,
        marginBottom: 18
      }
    }, news.map((c, i) => React.createElement(NewsCard, {
      key: i,
      c: c
    }))), (() => {
      const ti = D.teamTitles(ab);
      const Banner = ({
        label,
        years,
        tone,
        bg,
        bd
      }) => years.length > 0 && React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 15px',
          borderRadius: 12,
          background: bg,
          border: `1px solid ${bd}`,
          flex: '1 1 230px',
          minWidth: 0
        }
      }, React.createElement("span", {
        style: {
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 30,
          lineHeight: 1,
          color: tone,
          fontWeight: 600,
          flexShrink: 0
        }
      }, years.length), React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, React.createElement("div", {
        style: {
          fontWeight: 700,
          color: tone,
          fontSize: 14
        }
      }, label, years.length > 1 ? 's' : ''), React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: tone,
          opacity: .8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, years.join(' · '))));
      const has = ti.stanleyCups.length || ti.presidents.length;
      return React.createElement("div", {
        style: {
          ...card,
          padding: '16px 18px'
        }
      }, React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap'
        }
      }, React.createElement(Eyebrow, null, "Banners & honors"), React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: T.faint
        }
      }, ti.playoffApps, " playoff appearances", ti.lastCup ? ` · last Cup ${ti.lastCup}` : '')), React.createElement("div", {
        style: {
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: 14
        }
      }, React.createElement(Banner, {
        label: "Stanley Cup",
        years: ti.stanleyCups,
        tone: "#7a5c12",
        bg: "linear-gradient(135deg,#f6efd8,#fbf7ea)",
        bd: "#e8dcb4"
      }), React.createElement(Banner, {
        label: "Presidents' Trophy",
        years: ti.presidents,
        tone: "#1f5f8a",
        bg: "#eef4f9",
        bd: "#cfe0ee"
      }), React.createElement(Banner, {
        label: "Conference title",
        years: ti.conference,
        tone: T.ink,
        bg: T.bg,
        bd: T.line2
      }), React.createElement(Banner, {
        label: "Division title",
        years: ti.division,
        tone: T.mut,
        bg: T.bg,
        bd: T.line2
      }), !has && React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 12,
          color: T.mut,
          padding: '6px 0'
        }
      }, "No Stanley Cups or Presidents' Trophies on record yet.")));
    })());
  })(), tab === 'Stats' && React.createElement(TeamStatsTab, {
    ab: ab
  }), tab === 'Buzz' && (() => {
    const HANDLE = {
      ANA: 'AnaheimDucks',
      BOS: 'NHLBruins',
      BUF: 'BuffaloSabres',
      CGY: 'NHLFlames',
      CAR: 'Canes',
      CHI: 'NHLBlackhawks',
      COL: 'Avalanche',
      CBJ: 'BlueJacketsNHL',
      DAL: 'DallasStars',
      DET: 'DetroitRedWings',
      EDM: 'EdmontonOilers',
      FLA: 'FlaPanthers',
      LAK: 'LAKings',
      MIN: 'mnwild',
      MTL: 'CanadiensMTL',
      NSH: 'PredsNHL',
      NJD: 'NJDevils',
      NYI: 'NYIslanders',
      NYR: 'NYRangers',
      OTT: 'Senators',
      PHI: 'NHLFlyers',
      PIT: 'penguins',
      SJS: 'SanJoseSharks',
      SEA: 'SeattleKraken',
      STL: 'StLouisBlues',
      TBL: 'TBLightning',
      TOR: 'MapleLeafs',
      UTA: 'utahmammoth',
      VAN: 'Canucks',
      VGK: 'GoldenKnights',
      WSH: 'Capitals',
      WPG: 'NHLJets'
    };
    const h = HANDLE[ab] || ct(ab).replace(/\s/g, '') + nk(ab);
    const r = roster.filter(p => p.pos !== 'G');
    const p0 = r[0] && r[0].name || 'the captain',
      p1 = r[1] && r[1].name || 'a depth forward';
    const sample = [{
      kind: 'x',
      time: '2h',
      likes: '3.4K',
      rt: '412',
      text: `\uD83D\uDEA8 GAME DAY \uD83D\uDEA8 The ${nk(ab)} are back at it tonight. Puck drop soon \u2014 let\u2019s go.`
    }, {
      kind: 'recap',
      time: '1d',
      title: `Recap: ${ct(ab)} grind out a road win`,
      text: `${p0} and ${p1} powered a third-period push as ${ct(ab)} closed out a 4\u20132 victory.`
    }, {
      kind: 'x',
      time: '1d',
      likes: '1.2K',
      rt: '88',
      text: `Morning skate is in the books. ${p1} draws back into the lineup tonight.`
    }, {
      kind: 'news',
      time: '2d',
      source: 'Beat',
      title: `${ct(ab)} sign depth forward to a two-way deal`,
      text: `The club added organizational depth down the middle ahead of the stretch run.`
    }, {
      kind: 'x',
      time: '3d',
      likes: '5.8K',
      rt: '903',
      text: `WHAT A FINISH. ${p0} buries the overtime winner \uD83D\uDEA8`
    }, {
      kind: 'recap',
      time: '4d',
      title: `Recap: special teams carry the ${nk(ab)}`,
      text: `A 2-for-3 power play and a perfect penalty kill were the difference on the night.`
    }];
    const posts = social;
    const Av = ({
      size = 40
    }) => React.createElement("span", {
      style: {
        width: size,
        height: size,
        borderRadius: 99,
        background: c2(ab),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.34,
        flexShrink: 0
      }
    }, ab);
    const XMark = ({
      size = 18
    }) => React.createElement("span", {
      style: {
        width: size,
        height: size,
        borderRadius: 6,
        background: T.invBg,
        color: T.invFg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.62,
        flexShrink: 0
      }
    }, "X");
    const RedditMark = ({
      size = 18
    }) => React.createElement("span", {
      style: {
        width: size,
        height: size,
        borderRadius: 6,
        background: '#ff4500',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.46,
        flexShrink: 0
      }
    }, "r/");
    const Verified = () => React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      style: {
        flexShrink: 0
      }
    }, React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "11",
      fill: "#2a72c8"
    }), React.createElement("path", {
      d: "M7 12.5l3.2 3.2L17 8.5",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));
    const fmtN = n => typeof n === 'string' ? n : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n || 0);
    const Stat = ({
      icon,
      n
    }) => React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.9",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, icon), fmtN(n));
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: 16,
        flexWrap: 'wrap'
      }
    }, React.createElement(Av, null), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        color: T.ink,
        fontSize: 15
      }
    }, ct(ab), " ", nk(ab)), React.createElement("a", {
      href: `https://x.com/${h}`,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "el",
      style: {
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut,
        textDecoration: 'none'
      }
    }, "@", h, " \u2197")), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#b5762a',
        border: '1px solid rgba(181,118,42,.35)',
        borderRadius: 5,
        padding: '2px 7px'
      },
      title: "Recaps are real NHL data; social posts fill in from the team\u2019s public feed on deploy"
    }, "Buzz \xB7 beta")), React.createElement("div", {
      style: {
        display: 'grid',
        gap: 12
      }
    }, posts.map((p, i) => {
      const K = p.kind || 'x';
      const accent = K === 'recap' ? '#1a8a4f' : K === 'news' ? '#1f5f8a' : c2(ab);
      const tag = K === 'x' ? `@${h}` : K === 'recap' ? '\xB7 Game recap' : `\xB7 ${p.source || 'Team news'}`;
      return React.createElement("div", {
        key: i,
        className: "ec",
        style: {
          ...card,
          padding: '14px 16px',
          borderLeft: `3px solid ${accent}`
        }
      }, React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: 2
        }
      }, React.createElement(Av, {
        size: 40
      }), React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }
      }, React.createElement("span", {
        style: {
          fontSize: 13.5,
          fontWeight: 700,
          color: T.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, ct(ab), " ", nk(ab)), React.createElement(Verified, null), React.createElement("span", {
        style: {
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }
      }, React.createElement(Badge, {
        ab: ab,
        size: 14
      }), K === 'x' ? React.createElement(XMark, {
        size: 18
      }) : K === 'reddit' ? React.createElement(RedditMark, null) : React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: K === 'recap' ? '#1a8a4f' : '#1f5f8a',
          border: `1px solid ${K === 'recap' ? '#1a8a4f' : '#1f5f8a'}44`,
          borderRadius: 5,
          padding: '2px 6px'
        }
      }, K === 'recap' ? 'Recap' : p.source || 'News'))), React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: T.faint,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, K === 'x' ? `@${h}` : K === 'reddit' ? p.handle : K === 'recap' ? 'Game recap' : p.source || 'Team news', " \xB7 ", p.time))), p.title && React.createElement("div", {
        style: {
          fontFamily: SERIF,
          fontSize: 17,
          lineHeight: 1.3,
          color: T.ink,
          marginBottom: 5
        }
      }, p.title), React.createElement("div", {
        style: {
          fontSize: 14,
          lineHeight: 1.5,
          color: K === 'x' ? T.ink : T.mut
        }
      }, p.text), (K === 'x' || K === 'reddit') && React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          marginTop: 12,
          paddingTop: 11,
          borderTop: `1px solid ${T.line}`
        }
      }, React.createElement(Stat, {
        icon: React.createElement("path", {
          d: "M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1.9-4.5A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"
        }),
        n: p.replies != null ? p.replies : Math.max(1, Math.round((parseFloat(p.rt) || 12) * 0.6))
      }), K === 'x' && React.createElement(Stat, {
        icon: React.createElement(React.Fragment, null, React.createElement("path", {
          d: "M17 1l4 4-4 4"
        }), React.createElement("path", {
          d: "M3 11V9a4 4 0 0 1 4-4h14"
        }), React.createElement("path", {
          d: "M7 23l-4-4 4-4"
        }), React.createElement("path", {
          d: "M21 13v2a4 4 0 0 1-4 4H3"
        })),
        n: p.rt
      }), React.createElement(Stat, {
        icon: React.createElement("path", {
          d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"
        }),
        n: p.likes
      })));
    })), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        marginTop: 14,
        lineHeight: 1.6
      }
    }, "Game recaps come straight from NHL data. Social posts are sample content in preview and populate from the team\u2019s public feed once deployed \u2014 rendered natively, no third-party scripts. Not affiliated with the teams."));
  })(), tab === 'Shot zones' && window.E_ShotZones && React.createElement(window.E_ShotZones, {
    scope: "team",
    id: ab,
    teamAb: ab,
    name: `${ct(ab)} ${nk(ab)}`
  }), tab === 'Schedule' && React.createElement(TeamSchedule, {
    ab: ab,
    onGame: onGame
  }), tab === 'Roster' && React.createElement("div", null, React.createElement(RT, {
    title: "Forwards",
    rows: fwd,
    cols: SC
  }), React.createElement(RT, {
    title: "Defensemen",
    rows: def,
    cols: SC
  }), React.createElement(RT, {
    title: "Goalies",
    rows: tg,
    cols: GC
  })), tab === 'Prospects' && React.createElement("div", null, [['Forwards', pros.forwards], ['Defensemen', pros.defensemen], ['Goalies', pros.goalies]].map(([lab, list]) => React.createElement("div", {
    key: lab,
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 8
    }
  }, lab, " \xB7 ", list.length), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, list.map((p, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 10,
      padding: '10px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      color: T.ink
    }
  }, p.name, " ", React.createElement("span", {
    style: {
      color: T.faint
    }
  }, p.pos)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, p.league, " \xB7 age ", p.age, " \xB7 ", p.draftYr, " R", p.round)), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, p.gp, " GP \xB7 ", p.pts, " P"))))))), tab === 'Records' && (() => {
    const ti = D.teamTitles(ab);
    const rec = D.teamRecords(ab);
    const Big = ({
      l,
      v
    }) => React.createElement("div", {
      style: {
        ...card,
        padding: '15px 16px'
      }
    }, React.createElement("div", {
      style: ML
    }, l), React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 600,
        color: T.ink,
        marginTop: 4,
        letterSpacing: '-.02em'
      }
    }, v));
    const Rec = ({
      rec
    }) => React.createElement("div", {
      style: {
        ...card,
        padding: '15px 16px'
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        fontSize: 9.5
      }
    }, rec.label), React.createElement("div", {
      style: {
        fontSize: 30,
        fontWeight: 600,
        color: T.ink,
        letterSpacing: '-.02em',
        margin: '4px 0 2px'
      }
    }, rec.v), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, rec.s || rec.d));
    const Banner = ({
      label,
      years,
      tone,
      bg,
      bd
    }) => years.length > 0 && React.createElement("div", {
      style: {
        borderRadius: 13,
        padding: '15px 17px',
        background: bg,
        border: `1px solid ${bd}`
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: years.length > 1 ? 9 : 0
      }
    }, React.createElement("span", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 34,
        lineHeight: 1,
        color: tone,
        fontWeight: 600
      }
    }, years.length), React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        color: tone,
        fontSize: 15
      }
    }, label, years.length > 1 ? 's' : ''), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: tone,
        opacity: .7
      }
    }, years.length > 1 ? 'championship years' : 'won'))), React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, years.map(y => React.createElement("span", {
      key: y,
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        fontWeight: 600,
        color: tone,
        background: T.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.6)',
        border: `1px solid ${bd}`,
        borderRadius: 6,
        padding: '2px 8px'
      }
    }, y))));
    const anyTitle = ti.stanleyCups.length || ti.presidents.length || ti.conference.length || ti.division.length;
    return React.createElement("div", null, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 10
      }
    }, "Championships & banners"), anyTitle ? React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 12,
        marginBottom: 18
      }
    }, React.createElement(Banner, {
      label: "Stanley Cup",
      years: ti.stanleyCups,
      tone: "#7a5c12",
      bg: "linear-gradient(135deg,#f6efd8,#fbf7ea)",
      bd: "#e8dcb4"
    }), React.createElement(Banner, {
      label: "Presidents' Trophy",
      years: ti.presidents,
      tone: "#1f5f8a",
      bg: "#eef4f9",
      bd: "#cfe0ee"
    }), React.createElement(Banner, {
      label: "Conference title",
      years: ti.conference,
      tone: T.ink,
      bg: T.bg,
      bd: T.line2
    }), React.createElement(Banner, {
      label: "Division title",
      years: ti.division,
      tone: T.mut,
      bg: T.bg,
      bd: T.line2
    })) : React.createElement("div", {
      style: {
        ...card,
        padding: '15px 18px',
        marginBottom: 18,
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut
      }
    }, "No Stanley Cups or Presidents' Trophies on record yet."), franchise && React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 10
      }
    }, "All-time franchise record"), React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
        gap: 12,
        marginBottom: 8
      }
    }, franchise.gp != null && React.createElement(Big, {
      l: "Games",
      v: Number(franchise.gp).toLocaleString()
    }), franchise.w != null && React.createElement(Big, {
      l: "Wins",
      v: Number(franchise.w).toLocaleString()
    }), franchise.l != null && React.createElement(Big, {
      l: "Losses",
      v: Number(franchise.l).toLocaleString()
    }), franchise.winPct && React.createElement(Big, {
      l: "Win %",
      v: franchise.winPct
    }), franchise.first && React.createElement(Big, {
      l: "Since",
      v: franchise.first
    }), franchise.seasons && React.createElement(Big, {
      l: "Seasons",
      v: franchise.seasons
    })), franchise.playoffs && React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut,
        marginBottom: 18
      }
    }, "Playoffs all-time: ", franchise.playoffs.w, "\u2013", franchise.playoffs.l, " across ", Number(franchise.playoffs.gp).toLocaleString(), " games"), React.createElement("div", {
      style: {
        height: 6
      }
    })), React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 10
      }
    }, "Franchise career leaders"), React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: 12
      }
    }, rec.career.map((c, i) => React.createElement("div", {
      key: i,
      style: {
        ...card,
        padding: '15px 16px'
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        fontSize: 9.5
      }
    }, c.cat), React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 600,
        color: T.ink,
        marginTop: 6
      }
    }, c.rows[0] ? c.rows[0].name : '—')))));
  })());
}
function PlayersPage({
  onPlayer
}) {
  const teams = uM(() => [...D.ABBR].sort((a, b) => ct(a).localeCompare(ct(b))), []);
  const [scope, setScope] = uS('Skaters');
  const [team, setTeam] = uS('all');
  const [pos, setPos] = uS('All');
  const [q, setQ] = uS('');
  const [sortK, setSortK] = uS('name');
  const [sortDir, setSortDir] = uS('asc');
  const [showAll, setShowAll] = uS(false);
  const ql = q.trim().toLowerCase();
  const isG = scope === 'Goalies';
  const base = isG ? (D.goalies || []).map(g => ({
    ...g,
    type: 'goalie',
    pos: 'G'
  })) : D.allPlayers || [];
  const val = (p, k) => k === 'name' ? p.name.toLowerCase() : k === 'team' ? ct(p.team) : k === 'pos' ? p.pos || '' : k === 'svp' ? parseFloat(p.svp) || 0 : k === 'gaa' ? parseFloat(p.gaa) || 0 : +p[k] || 0;
  const dir = sortDir === 'asc' ? 1 : -1;
  const rows = base.filter(p => p && p.name).filter(p => team === 'all' || p.team === team).filter(p => isG || pos === 'All' || (pos === 'F' ? p.pos !== 'D' && p.pos !== 'G' : p.pos === pos)).filter(p => !ql || p.name.toLowerCase().includes(ql)).sort((a, b) => {
    const x = val(a, sortK),
      y = val(b, sortK);
    if (x < y) return -dir;
    if (x > y) return dir;
    return a.name.localeCompare(b.name);
  });
  const cols = isG ? [['Player', 'name', 'l'], ['Team', 'team', 'l'], ['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['SV%', 'svp'], ['GAA', 'gaa'], ['SO', 'so']] : [['Player', 'name', 'l'], ['Team', 'team', 'l'], ['Pos', 'pos'], ['GP', 'gp'], ['G', 'g'], ['A', 'a'], ['P', 'p'], ['+/-', 'pm']];
  const sortBy = k => {
    if (sortK === k) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortK(k);
      setSortDir(k === 'name' || k === 'team' || k === 'pos' || k === 'gaa' ? 'asc' : 'desc');
    }
  };
  const disp = (p, k) => k === 'pm' ? (p.pm > 0 ? '+' : '') + (p.pm || 0) : k === 'svp' ? p.svp : k === 'gaa' ? p.gaa : p[k] != null ? p[k] : '—';
  const CAP = 200;
  const shown = showAll ? rows : rows.slice(0, CAP);
  const sel = {
    fontFamily: 'inherit',
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 9,
    padding: '8px 12px',
    color: T.ink,
    fontSize: 13
  };
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Players",
    t: "Player",
    serif: "directory"
  }), React.createElement("div", {
    style: {
      ...card,
      padding: 14,
      marginBottom: 18,
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['Skaters', 'Goalies'].map(s => React.createElement(Pill, {
    key: s,
    on: scope === s,
    onClick: () => {
      setScope(s);
      setPos('All');
      setSortK('name');
      setSortDir('asc');
      setShowAll(false);
    }
  }, s))), React.createElement("select", {
    value: team,
    onChange: e => {
      setTeam(e.target.value);
      setShowAll(false);
    },
    style: sel
  }, React.createElement("option", {
    value: "all"
  }, "All teams"), teams.map(a => React.createElement("option", {
    key: a,
    value: a
  }, ct(a), " ", nk(a)))), !isG && React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, ['All', 'F', 'C', 'LW', 'RW', 'D'].map(pp => React.createElement(Pill, {
    key: pp,
    on: pos === pp,
    onClick: () => {
      setPos(pp);
      setShowAll(false);
    }
  }, pp === 'F' ? 'Forwards' : pp === 'D' ? 'Defense' : pp))), React.createElement("input", {
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setShowAll(false);
    },
    placeholder: "Search players",
    style: {
      ...sel,
      flex: 1,
      minWidth: 160,
      outline: 'none'
    }
  })), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '10px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    }
  }, React.createElement("span", {
    style: ML
  }, rows.length, " ", isG ? 'goalies' : 'skaters', team !== 'all' ? ` · ${ct(team)} ${nk(team)}` : ''), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "tap a column to sort \xB7 tap a row for detail")), React.createElement("div", {
    className: "ed-scrollx ed-stickcol2",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 620,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
    style: {
      padding: '10px 10px',
      textAlign: 'left',
      width: 34,
      ...ML
    }
  }, "#"), cols.map(([h, k, al]) => React.createElement("th", {
    key: h,
    onClick: () => sortBy(k),
    style: {
      padding: '10px 10px',
      textAlign: al === 'l' ? 'left' : 'center',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      color: sortK === k ? T.ink : undefined,
      ...ML
    }
  }, h, sortK === k ? sortDir === 'asc' ? ' ↑' : ' ↓' : '')))), React.createElement("tbody", null, shown.map((p, i) => React.createElement("tr", {
    key: p.id || p.name + i,
    onClick: () => onPlayer(p),
    className: "er",
    style: {
      cursor: 'pointer',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 10px',
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, i + 1), cols.map(([h, k]) => {
    if (k === 'name') return React.createElement("td", {
      key: h,
      style: {
        padding: '8px 10px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        minWidth: 0
      }
    }, React.createElement(PlayerAvatar, {
      pos: p.pos,
      team: p.team,
      name: p.name,
      size: 26
    }), React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink,
        whiteSpace: 'nowrap'
      }
    }, p.name), p.num ? React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint
      }
    }, "#", p.num) : null));
    if (k === 'team') return React.createElement("td", {
      key: h,
      style: {
        padding: '8px 10px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement(Badge, {
      ab: p.team,
      size: 18
    }), React.createElement("span", {
      style: {
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, p.team)));
    return React.createElement("td", {
      key: h,
      style: {
        padding: '8px 10px',
        textAlign: 'center',
        fontFamily: MONO,
        color: k === 'p' ? T.ink : T.mut,
        fontWeight: k === 'p' ? 700 : 400
      }
    }, disp(p, k));
  })))))), rows.length > CAP && !showAll && React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderTop: `1px solid ${T.line}`,
      textAlign: 'center'
    }
  }, React.createElement("button", {
    onClick: () => setShowAll(true),
    className: "el",
    style: {
      fontFamily: MONO,
      fontSize: 12,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 8,
      padding: '7px 14px',
      color: T.ink,
      cursor: 'pointer'
    }
  }, "Show all ", rows.length)), rows.length === 0 && React.createElement("div", {
    style: {
      padding: '24px 16px',
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 12,
      color: T.faint
    }
  }, "No players match these filters.")));
}
function PlayerDetailPage({
  p,
  onBack,
  onTeam,
  onPlayer
}) {
  const isG = p.type === 'goalie';
  const exMock = uM(() => D.playerExtras(p), [p.id]);
  const exLive = window.E_useLive(exMock, () => window.NHL.playerCard(p.id).then(c => c ? {
    ...exMock,
    ...c
  } : null), [p.id], 'playerExtras:' + p.id);
  const ex = {
    ...exMock,
    ...exLive
  };
  const edgeMock = uM(() => isG ? D.goalieEdge(p) : D.skaterEdge(p), [p.id]);
  const edge = window.E_useLive(edgeMock, () => (isG ? window.NHL.edgeGoalieMapped(p.id) : window.NHL.edgeSkaterMapped(p.id)).then(e => e ? {
    ...edgeMock,
    ...e
  } : null), [p.id], 'playerEdge:' + p.id);
  const log = uM(() => D.gameLog(p), [p.id]);
  const eglMock = uM(() => !isG && D.edgeGameLog ? D.edgeGameLog(p) : [], [p.id]);
  const egl = window.E_useLive(eglMock, () => !isG && window.NHL && window.NHL.edgeGameLog ? window.NHL.edgeGameLog(p.id).then(rows => rows && rows.length ? eglMock.map((m, i) => {
    const r = rows[i];
    return r ? {
      ...m,
      date: r.date || m.date,
      opp: r.opp || m.opp,
      home: r.home,
      topSpd: r.topSpd != null ? r.topSpd : m.topSpd,
      topShot: r.topShot != null ? r.topShot : m.topShot,
      dist: r.dist != null ? r.dist : m.dist,
      b20: r.b20 != null ? r.b20 : m.b20
    } : m;
  }) : null) : null, [p.id], 'playerEgl:' + p.id);
  const Stat = ({
    l,
    v
  }) => React.createElement("div", {
    style: {
      ...card,
      padding: 16,
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 600,
      color: T.ink,
      marginTop: 4,
      letterSpacing: '-.02em'
    }
  }, v));
  const Sec = ({
    k,
    children
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 18px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, k), children);
  return React.createElement("div", null, React.createElement("button", {
    onClick: onBack,
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: '0 0 18px'
    }
  }, "\u2190 back to players"), React.createElement("div", {
    style: {
      ...card,
      padding: 0,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      height: 5,
      background: c2(p.team)
    }
  }), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '24px'
    }
  }, React.createElement(PlayerAvatar, {
    pos: p.pos,
    team: p.team,
    name: p.name,
    size: 64
  }), React.createElement("div", null, React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-.02em',
      color: T.ink
    }
  }, p.name), React.createElement("button", {
    onClick: () => onTeam(p.team),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: T.mut,
      fontSize: 13,
      padding: '4px 0'
    }
  }, React.createElement(Badge, {
    ab: p.team,
    size: 20
  }), ct(p.team), " ", nk(p.team), " \xB7 ", p.pos), ex.bio && React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 14px',
      marginTop: 6,
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint
    }
  }, ex.bio.number != null && React.createElement("span", null, "#", ex.bio.number), ex.bio.ht && React.createElement("span", null, ex.bio.ht, ex.bio.wt ? `, ${ex.bio.wt}` : ''), ex.bio.shoots && React.createElement("span", null, isG ? 'Catches' : 'Shoots', " ", ex.bio.shoots), ex.bio.age != null && React.createElement("span", null, "Age ", ex.bio.age), ex.bio.born && React.createElement("span", null, ex.bio.born), ex.bio.draft && React.createElement("span", null, "Draft: ", ex.bio.draft))))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
      gap: 12,
      marginBottom: 16
    }
  }, (isG ? [['Record', `${p.w}-${p.l}`], ['SV%', p.svp], ['GAA', p.gaa], ['SO', p.so]] : [['Points', p.p], ['Goals', p.g], ['Assists', p.a], ['+/-', `${p.pm >= 0 ? '+' : ''}${p.pm}`]]).map(([l, v]) => React.createElement(Stat, {
    key: l,
    l: l,
    v: v
  }))), ex.honors.hasAny && React.createElement("div", {
    style: {
      ...card,
      padding: '18px 20px',
      marginBottom: 16
    }
  }, React.createElement(Eyebrow, null, "Honors & accolades"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginTop: 14
    }
  }, ex.honors.cups.length > 0 && React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 14px',
      borderRadius: 11,
      background: 'linear-gradient(135deg,#f6efd8,#fbf7ea)',
      border: '1px solid #e8dcb4'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 20,
      color: '#7a5c12',
      fontWeight: 600
    }
  }, ex.honors.cups.length > 1 ? `×${ex.honors.cups.length}` : '★'), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 700,
      color: '#7a5c12',
      fontSize: 14
    }
  }, "Stanley Cup", ex.honors.cups.length > 1 ? ' champion' : ''), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: '#9a7c2a'
    }
  }, ex.honors.cups.join(' · ')))), ex.honors.trophies.map(t => React.createElement("div", {
    key: t.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 14px',
      borderRadius: 11,
      background: T.bg,
      border: `1px solid ${T.line2}`
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 20,
      color: T.red,
      fontWeight: 600
    }
  }, t.count > 1 ? `×${t.count}` : '•'), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink,
      fontSize: 14
    }
  }, t.name, " Trophy"), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, t.desc, " \xB7 ", t.years.join(', '))))), ex.honors.allStar > 0 && React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 14px',
      borderRadius: 11,
      background: T.bg,
      border: `1px solid ${T.line2}`
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 20,
      color: T.ink,
      fontWeight: 600
    }
  }, "\xD7", ex.honors.allStar), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink,
      fontSize: 14
    }
  }, "All-Star selection", ex.honors.allStar > 1 ? 's' : ''), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, "career"))), ex.honors.milestones.map((m, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 14px',
      borderRadius: 11,
      background: T.bg,
      border: `1px solid ${T.line2}`
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: '#1a8a4f'
    }
  }), React.createElement("span", {
    style: {
      fontWeight: 600,
      color: T.ink,
      fontSize: 13.5
    }
  }, m.label))))), React.createElement("div", {
    style: {
      ...card,
      padding: 20,
      marginBottom: 16
    }
  }, React.createElement(Eyebrow, null, "NHL Edge \xB7 tracking detail"), (edge.seasons || []).length > 0 && React.createElement("div", {
    style: {
      marginTop: 10,
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "Tracked seasons \xB7 ", (edge.seasons || []).join('  ·  ')), React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "Live NHL EDGE tracking in-season \xB7 projected estimates when tracking isn't published."), isG ? React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    style: ML
  }, "Save quality by danger"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
      gap: 12,
      marginTop: 10
    }
  }, (edge.saveQ || []).map(([l, v, pc, avg, sh]) => React.createElement("div", {
    key: l,
    style: {
      border: `1px solid ${T.line}`,
      borderRadius: 11,
      padding: '13px 15px'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 600,
      margin: '5px 0'
    }
  }, v), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "pct ", pc, " \xB7 avg ", avg, " \xB7 ", sh, " shots"))))) : React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    style: ML
  }, "Speed + distance"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
      gap: 12,
      marginTop: 10
    }
  }, (edge.speed || []).map(([l, v, pc, avg]) => React.createElement("div", {
    key: l,
    style: {
      border: `1px solid ${T.line}`,
      borderRadius: 11,
      padding: '13px 15px'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: '5px 0'
    }
  }, v), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "pct ", pc, " \xB7 league avg ", avg)))), React.createElement("div", {
    style: {
      ...ML,
      marginTop: 16
    }
  }, "Zone time"), React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, (edge.zones || []).map(([z, pct]) => React.createElement("div", {
    key: z,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      width: 90,
      fontSize: 13,
      color: T.mut
    }
  }, z), React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct}%`,
      background: c2(p.team)
    }
  })), React.createElement("span", {
    style: {
      width: 44,
      textAlign: 'right',
      fontWeight: 600,
      fontFamily: MONO,
      fontSize: 12
    }
  }, pct, "%")))))), !isG && egl.length > 0 && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 18px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "NHL Edge \xB7 by game"), React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 440,
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, React.createElement("thead", null, React.createElement("tr", null, ['Game', 'Top speed', 'Top shot', 'Distance', '20+ bursts'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '9px 14px',
      textAlign: i ? 'center' : 'left',
      ...ML,
      whiteSpace: 'nowrap'
    }
  }, h)))), React.createElement("tbody", null, egl.map((g, i) => React.createElement("tr", {
    key: i,
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '8px 14px',
      whiteSpace: 'nowrap'
    }
  }, React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11.5
    }
  }, g.date), " ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, g.home ? 'vs' : '@', " ", g.opp)), React.createElement("td", {
    style: {
      padding: '8px 14px',
      textAlign: 'center',
      fontFamily: MONO,
      color: T.ink
    }
  }, g.topSpd, React.createElement("span", {
    style: {
      color: T.faint,
      fontSize: 10
    }
  }, " mph")), React.createElement("td", {
    style: {
      padding: '8px 14px',
      textAlign: 'center',
      fontFamily: MONO,
      color: T.ink
    }
  }, g.topShot, React.createElement("span", {
    style: {
      color: T.faint,
      fontSize: 10
    }
  }, " mph")), React.createElement("td", {
    style: {
      padding: '8px 14px',
      textAlign: 'center',
      fontFamily: MONO,
      color: T.ink
    }
  }, g.dist, React.createElement("span", {
    style: {
      color: T.faint,
      fontSize: 10
    }
  }, " mi")), React.createElement("td", {
    style: {
      padding: '8px 14px',
      textAlign: 'center',
      fontFamily: MONO,
      fontWeight: 600,
      color: T.ink
    }
  }, g.b20))))))), window.E_ShotZones && React.createElement(window.E_ShotZones, {
    scope: isG ? 'goalie' : 'skater',
    id: p.id,
    teamAb: p.team,
    name: p.name
  }), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 16
    },
    className: "g2"
  }, React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 18px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Career"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)'
    }
  }, (isG ? [['GP', ex.career.gp], ['W', ex.career.w], ['L', ex.career.l], ['SO', ex.career.so != null ? ex.career.so : '—']] : [['GP', ex.career.gp], ['G', ex.career.g], ['A', ex.career.a], ['P', ex.career.p]]).map(([l, v]) => React.createElement("div", {
    key: l,
    style: {
      padding: '14px',
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      marginTop: 3
    }
  }, v))))), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 18px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Last 5"), ex.last5.map((row, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 18px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: T.mut
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, row.date), row.home ? 'vs' : '@', " ", React.createElement(Badge, {
    ab: row.opp,
    size: 18
  })), React.createElement("span", {
    style: {
      fontWeight: 600,
      color: row.result[0] === 'W' ? '#1a8a4f' : T.red
    }
  }, row.result), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, row.p, " P"))))), ex.careerPO && React.createElement(Sec, {
    k: "Career \xB7 playoffs"
  }, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)'
    }
  }, (isG ? [['GP', ex.careerPO.gp], ['W', ex.careerPO.w], ['L', ex.careerPO.l], ['SO', ex.careerPO.so]] : [['GP', ex.careerPO.gp], ['G', ex.careerPO.g], ['A', ex.careerPO.a], ['P', ex.careerPO.p]]).map(([l, v]) => React.createElement("div", {
    key: l,
    style: {
      padding: '14px',
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: ML
  }, l), React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      marginTop: 3
    }
  }, v))))), React.createElement(Sec, {
    k: "Season history"
  }, React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 480,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, (isG ? ['Season', 'Team', 'GP', 'W', 'L', 'SV%', 'GAA'] : ['Season', 'Team', 'GP', 'G', 'A', 'P', '+/-']).map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '9px 14px',
      textAlign: i < 2 ? 'left' : 'center',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, ex.history.map((s, i) => React.createElement("tr", {
    key: i,
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 14px',
      color: T.ink,
      fontFamily: MONO,
      fontSize: 12
    }
  }, s.s), React.createElement("td", {
    style: {
      padding: '9px 14px'
    }
  }, React.createElement(Badge, {
    ab: s.team,
    size: 18
  })), (isG ? ['gp', 'w', 'l', 'svp', 'gaa'] : ['gp', 'g', 'a', 'p', 'pm']).map(k => React.createElement("td", {
    key: k,
    style: {
      textAlign: 'center',
      color: k === 'p' ? T.ink : T.mut,
      fontWeight: k === 'p' ? 700 : 400
    }
  }, k === 'pm' ? (s[k] >= 0 ? '+' : '') + s[k] : s[k])))))))), ex.awards.length > 0 && React.createElement(Sec, {
    k: "Awards"
  }, React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      padding: '14px 18px'
    }
  }, ex.awards.map((a, i) => React.createElement("span", {
    key: i,
    style: {
      fontFamily: MONO,
      fontSize: 12,
      padding: '5px 11px',
      borderRadius: 999,
      background: '#fdf6e6',
      color: '#9a6b1a',
      border: '1px solid #f0e2c0'
    }
  }, a.name, " \xB7 ", a.yr)))), React.createElement(Sec, {
    k: "Current teammates"
  }, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))'
    }
  }, ex.teammates.map((tm, i) => React.createElement("div", {
    key: tm.id,
    onClick: () => onPlayer && onPlayer(tm),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 18px',
      borderTop: `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 7,
      background: c2(tm.team),
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 11,
      fontWeight: 600
    }
  }, tm.num || tm.pos), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: T.ink
    }
  }, tm.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, tm.pos, " \xB7 ", tm.p, "P"))))), (() => {
    const slog = D.seasonLog(p);
    const pts = slog.map(r => isG ? parseFloat(r.svp) || 0 : r.p);
    const cols = isG ? ['Date', 'Opp', 'Result', 'GA', 'SV', 'SA', 'SV%', 'TOI'] : ['Date', 'Opp', 'Result', 'G', 'A', 'P', 'SOG', 'TOI'];
    const sum = isG ? null : slog.reduce((s, r) => s + r.p, 0);
    return React.createElement(Sec, {
      k: `Game log · ${slog.length} games${sum != null ? ` · ${sum} pts` : ''}`
    }, React.createElement("div", {
      style: {
        padding: '12px 18px',
        borderBottom: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, React.createElement("span", {
      style: {
        ...ML,
        fontSize: 9.5
      }
    }, isG ? 'SV% by game' : 'Points by game'), React.createElement("span", {
      style: {
        flex: 1
      }
    }, React.createElement(Spark, {
      data: pts.length ? pts : [0, 0],
      color: c2(p.team),
      w: 320,
      h: 26
    }))), React.createElement("div", {
      style: {
        overflowX: 'auto',
        maxHeight: 360,
        overflowY: 'auto'
      }
    }, React.createElement("table", {
      style: {
        width: '100%',
        minWidth: 520,
        borderCollapse: 'collapse',
        fontSize: 13.5
      }
    }, React.createElement("thead", null, React.createElement("tr", {
      style: ML
    }, cols.map((h, i) => React.createElement("th", {
      key: h,
      style: {
        padding: '9px 14px',
        textAlign: i < 3 ? 'left' : 'center',
        fontWeight: 600,
        ...ML,
        position: 'sticky',
        top: 0,
        background: T.paper
      }
    }, h)))), React.createElement("tbody", null, slog.map((row, i) => React.createElement("tr", {
      key: i,
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '9px 14px',
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, row.date), React.createElement("td", {
      style: {
        padding: '9px 14px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: T.mut
      }
    }, row.home ? 'vs' : '@', " ", React.createElement(Badge, {
      ab: row.opp,
      size: 18
    }))), React.createElement("td", {
      style: {
        padding: '9px 14px',
        fontWeight: 600,
        color: row.result[0] === 'W' ? '#1a8a4f' : T.red
      }
    }, row.result), isG ? React.createElement(React.Fragment, null, React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, row.ga), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, row.sv), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, row.sa), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontWeight: 700
      }
    }, row.svp)) : React.createElement(React.Fragment, null, React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, row.g), React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, row.a), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontWeight: 700
      }
    }, row.p), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, row.sog)), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, row.toi)))))));
  })());
}
function StatsTable({
  onPlayer
}) {
  const [scope, setScope] = uS('Skaters');
  const isG = scope === 'Goalies';
  const [posF, setPosF] = uS('All');
  const [team, setTeam] = uS('All');
  const [q, setQ] = uS('');
  const [sortK, setSortK] = uS('p');
  const [dir, setDir] = uS('desc');
  const teamsAZ = uM(() => [...D.ABBR].sort((a, b) => ct(a).localeCompare(ct(b))), []);
  const switchScope = s => {
    setScope(s);
    setSortK(s === 'Goalies' ? 'svp' : 'p');
    setDir('desc');
    setPosF('All');
  };
  const val = (p, k) => k === 'sh' ? p.g / Math.max(1, p.sog) : k === 'ppg' ? p.p / p.gp : k === 'svp' ? Number(p.svp) : k === 'gaa' ? Number(p.gaa) : p[k];
  const disp = (p, k) => k === 'sh' ? (p.g / Math.max(1, p.sog) * 100).toFixed(1) : k === 'ppg' ? (p.p / p.gp).toFixed(2) : k === 'pm' ? (p.pm > 0 ? '+' : '') + p.pm : k === 'svp' ? p.svp : k === 'gaa' ? p.gaa : p[k];
  const SC = [['GP', 'gp'], ['G', 'g'], ['A', 'a'], ['P', 'p'], ['+/-', 'pm'], ['SOG', 'sog'], ['SH%', 'sh'], ['P/GP', 'ppg']];
  const GC = [['GP', 'gp'], ['W', 'w'], ['L', 'l'], ['SV%', 'svp'], ['GAA', 'gaa'], ['SO', 'so']];
  const cols = isG ? GC : SC;
  const rows = uM(() => {
    let pool = isG ? D.goalieLeaders() : D.skaterLeaders('p');
    if (!isG) pool = pool.filter(p => posF === 'All' || (posF === 'Defense' ? p.pos === 'D' : p.pos !== 'D'));
    if (team !== 'All') pool = pool.filter(p => p.team === team);
    const ql = q.trim().toLowerCase();
    if (ql) pool = pool.filter(p => p.name.toLowerCase().includes(ql));
    return [...pool].sort((a, b) => {
      const x = val(a, sortK),
        y = val(b, sortK);
      return dir === 'desc' ? y - x : x - y;
    });
  }, [scope, posF, team, q, sortK, dir]);
  const sortBy = k => {
    if (sortK === k) setDir(d => d === 'desc' ? 'asc' : 'desc');else {
      setSortK(k);
      setDir('desc');
    }
  };
  const sel = {
    fontFamily: MONO,
    fontSize: 12,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 8,
    padding: '7px 9px',
    color: T.ink,
    cursor: 'pointer'
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['Skaters', 'Goalies'].map(s => React.createElement(Pill, {
    key: s,
    on: scope === s,
    onClick: () => switchScope(s)
  }, s))), !isG && React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['All', 'Forwards', 'Defense'].map(s => React.createElement(Pill, {
    key: s,
    on: posF === s,
    onClick: () => setPosF(s)
  }, s))), React.createElement("select", {
    value: team,
    onChange: e => setTeam(e.target.value),
    style: sel
  }, React.createElement("option", {
    value: "All"
  }, "All teams"), teamsAZ.map(a => React.createElement("option", {
    key: a,
    value: a
  }, ct(a), " ", nk(a)))), React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search player",
    style: {
      fontFamily: 'inherit',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 8,
      padding: '7px 11px',
      color: T.ink,
      fontSize: 13,
      outline: 'none',
      marginLeft: 'auto'
    }
  })), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "ed-scrollx",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: isG ? 620 : 780,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, React.createElement("th", {
    style: {
      padding: '11px 10px 11px 18px',
      textAlign: 'left',
      fontWeight: 600,
      ...ML
    }
  }, "#"), React.createElement("th", {
    style: {
      padding: '11px 10px',
      textAlign: 'left',
      fontWeight: 600,
      ...ML
    }
  }, "Player"), cols.map(([h, k]) => React.createElement("th", {
    key: k,
    onClick: () => sortBy(k),
    style: {
      padding: '11px 10px',
      textAlign: 'center',
      fontWeight: 600,
      ...ML,
      cursor: 'pointer',
      color: sortK === k ? T.ink : undefined,
      whiteSpace: 'nowrap'
    }
  }, h, sortK === k ? dir === 'desc' ? ' ↓' : ' ↑' : '')))), React.createElement("tbody", null, rows.map((p, i) => React.createElement("tr", {
    key: p.id,
    onClick: () => onPlayer(isG ? {
      ...p,
      type: 'goalie',
      pos: 'G'
    } : p),
    className: "er",
    style: {
      cursor: 'pointer',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 10px 9px 18px',
      color: T.faint,
      fontFamily: MONO,
      fontSize: 12
    }
  }, i + 1), React.createElement("td", {
    style: {
      padding: '9px 10px'
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: p.team,
    size: 22
  }), React.createElement("span", {
    style: {
      color: T.ink,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, p.name), React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11
    }
  }, isG ? 'G' : p.pos))), cols.map(([h, k]) => React.createElement("td", {
    key: k,
    style: {
      padding: '9px 10px',
      textAlign: 'center',
      fontFamily: k === 'svp' || k === 'gaa' || k === 'ppg' || k === 'sh' ? MONO : 'inherit',
      fontWeight: k === sortK ? 700 : 400,
      color: k === sortK ? T.ink : T.mut
    }
  }, disp(p, k))))))))), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      marginTop: 10
    }
  }, rows.length, " ", isG ? 'goalies' : 'skaters', " \xB7 tap a column to sort \xB7 tap a row for the full player page"));
}
function StatsCompare({
  onPlayer
}) {
  const [scope, setScope] = uS('Skaters');
  const isG = scope === 'Goalies';
  const sk = uM(() => D.skaterLeaders('p'), []);
  const go = uM(() => D.goalieLeaders(), []);
  const pool = isG ? go : sk;
  const [aId, setAId] = uS(sk[0].id);
  const [bId, setBId] = uS(sk[1].id);
  const switchScope = s => {
    const p = s === 'Goalies' ? go : sk;
    setScope(s);
    setAId(p[0].id);
    setBId(p[1].id);
  };
  const A = pool.find(p => p.id === aId) || pool[0];
  const B = pool.find(p => p.id === bId) || pool[1];
  const SM = [['Games', 'gp', 1], ['Goals', 'g', 1], ['Assists', 'a', 1], ['Points', 'p', 1], ['+/-', 'pm', 1], ['Shots', 'sog', 1], ['Shooting %', 'sh', 1], ['Points / GP', 'ppg', 1]];
  const GM = [['Games', 'gp', 1], ['Wins', 'w', 1], ['Losses', 'l', -1], ['Save %', 'svp', 1], ['GAA', 'gaa', -1], ['Shutouts', 'so', 1]];
  const metrics = isG ? GM : SM;
  const val = (p, k) => k === 'sh' ? p.g / Math.max(1, p.sog) * 100 : k === 'ppg' ? p.p / p.gp : k === 'svp' ? Number(p.svp) : k === 'gaa' ? Number(p.gaa) : p[k];
  const disp = (p, k) => k === 'sh' ? val(p, k).toFixed(1) + '%' : k === 'ppg' ? val(p, k).toFixed(2) : k === 'pm' ? (p.pm > 0 ? '+' : '') + p.pm : k === 'svp' ? p.svp : k === 'gaa' ? p.gaa : String(p[k]);
  const sel = {
    fontFamily: MONO,
    fontSize: 12,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 8,
    padding: '7px 9px',
    color: T.ink,
    cursor: 'pointer',
    width: '100%',
    maxWidth: 240
  };
  const Head = ({
    p,
    onPick
  }) => React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      textAlign: 'center'
    }
  }, React.createElement("button", {
    onClick: () => onPlayer(isG ? {
      ...p,
      type: 'goalie',
      pos: 'G'
    } : p),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      maxWidth: '100%'
    }
  }, React.createElement(PlayerAvatar, {
    pos: isG ? 'G' : p.pos,
    team: p.team,
    name: p.name,
    size: 52
  }), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 15,
      color: T.ink,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, ct(p.team), " \xB7 ", isG ? 'G' : p.pos))), React.createElement("div", null, React.createElement("select", {
    value: p.id,
    onChange: e => onPick(e.target.value),
    style: {
      ...sel,
      marginTop: 10
    }
  }, pool.map(x => React.createElement("option", {
    key: x.id,
    value: x.id
  }, x.name, " \xB7 ", x.team)))));
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 14
    }
  }, ['Skaters', 'Goalies'].map(s => React.createElement(Pill, {
    key: s,
    on: scope === s,
    onClick: () => switchScope(s)
  }, s))), React.createElement("div", {
    style: {
      ...card,
      padding: '20px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 20
    }
  }, React.createElement(Head, {
    p: A,
    onPick: setAId
  }), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 22,
      color: T.faint,
      paddingTop: 18
    }
  }, "vs"), React.createElement(Head, {
    p: B,
    onPick: setBId
  })), React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, metrics.map(([label, k, hb]) => {
    const va = val(A, k),
      vb = val(B, k);
    const base = Math.min(0, va, vb);
    const a = va - base,
      b = vb - base;
    const tot = a + b || 1;
    let sa = a / tot;
    if (hb < 0) sa = b / tot;
    const aWin = hb < 0 ? va < vb : va > vb,
      bWin = hb < 0 ? vb < va : vb > va;
    return React.createElement("div", {
      key: k
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        gap: 10
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: aWin ? 700 : 500,
        color: aWin ? T.ink : T.mut,
        width: 70
      }
    }, disp(A, k)), React.createElement("span", {
      style: {
        ...ML,
        textAlign: 'center'
      }
    }, label), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: bWin ? 700 : 500,
        color: bWin ? T.ink : T.mut,
        width: 70,
        textAlign: 'right'
      }
    }, disp(B, k))), React.createElement("div", {
      style: {
        display: 'flex',
        height: 7,
        borderRadius: 4,
        overflow: 'hidden',
        background: T.bg
      }
    }, React.createElement("div", {
      style: {
        width: `${(sa * 100).toFixed(1)}%`,
        background: c2(A.team),
        opacity: aWin ? 1 : .45
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        background: c2(B.team),
        opacity: bWin ? 1 : .45
      }
    })));
  })), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      marginTop: 16,
      textAlign: 'center'
    }
  }, "bolder side leads each metric \xB7 bar shows each player's share of the pair")));
}
function StatsPage({
  onPlayer,
  onTeam
}) {
  const [mode, setMode] = uS('Leaders');
  const [cat, setCat] = uS('Points');
  const [posF, setPosF] = uS('All');
  const isG = cat === 'Goalies';
  const CAT = {
    Points: {
      disp: p => String(p.p),
      val: p => p.p,
      sub: p => `${p.g} G · ${p.a} A`,
      label: 'points'
    },
    Goals: {
      disp: p => String(p.g),
      val: p => p.g,
      sub: p => `${p.p} P · ${p.a} A`,
      label: 'goals'
    },
    Assists: {
      disp: p => String(p.a),
      val: p => p.a,
      sub: p => `${p.g} G · ${p.p} P`,
      label: 'assists'
    },
    '+/-': {
      disp: p => (p.pm > 0 ? '+' : '') + p.pm,
      val: p => p.pm,
      sub: p => `${p.p} P · ${p.gp} GP`,
      label: 'plus / minus'
    },
    Shots: {
      disp: p => String(p.sog),
      val: p => p.sog,
      sub: p => `${p.g} G · ${(p.g / Math.max(1, p.sog) * 100).toFixed(1)}% SH`,
      label: 'shots on goal'
    },
    'P/GP': {
      disp: p => (p.p / p.gp).toFixed(2),
      val: p => p.p / p.gp,
      sub: p => `${p.p} P · ${p.gp} GP`,
      label: 'points per game'
    },
    Hits: {
      disp: p => String(D.leaderEx(p).hits),
      val: p => D.leaderEx(p).hits,
      sub: p => `${p.gp} GP`,
      label: 'hits'
    },
    Blocks: {
      disp: p => String(D.leaderEx(p).blk),
      val: p => D.leaderEx(p).blk,
      sub: p => `${p.pos} · ${p.gp} GP`,
      label: 'blocked shots'
    },
    'TOI/GP': {
      disp: p => D.leaderEx(p).toiPg.toFixed(1),
      val: p => D.leaderEx(p).toiPg,
      sub: p => `${p.gp} GP`,
      label: 'minutes / game'
    },
    'FO%': {
      disp: p => {
        const f = D.leaderEx(p).fo;
        return f ? f.toFixed(1) : '–';
      },
      val: p => D.leaderEx(p).fo,
      sub: p => `${p.pos} · ${p.gp} GP`,
      label: 'faceoff win %'
    },
    Goalies: {
      disp: g => g.svp,
      val: g => Number(g.svp),
      sub: g => `${g.w}-${g.l} · ${g.gaa} GAA`,
      label: 'save %'
    }
  };
  const conf = CAT[cat];
  const open = p => onPlayer(isG ? {
    ...p,
    type: 'goalie',
    pos: 'G'
  } : p);
  const rows = uM(() => {
    let pool = isG ? D.goalieLeaders().filter(g => g.gp >= 12) : D.skaterLeaders('p').filter(p => posF === 'All' || (posF === 'Defense' ? p.pos === 'D' : p.pos !== 'D'));
    let arr = pool.map(p => ({
      ...p,
      _v: conf.val(p)
    }));
    if (cat === 'FO%') arr = arr.filter(p => p._v > 0);
    return arr.sort((a, b) => b._v - a._v).slice(0, 15);
  }, [cat, posF]);
  const top = rows.slice(0, 3),
    list = rows.slice(3, 15);
  const vMax = rows.length ? rows[0]._v : 1,
    vMin = rows.length ? rows[rows.length - 1]._v : 0;
  const barPct = v => vMax === vMin ? 100 : Math.max(4, Math.round((v - vMin) / (vMax - vMin) * 100));
  const TS = uM(() => D.ABBR.map(ab => ({
    ab,
    ...D.teamStatsFull(ab)
  })), []);
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
  const totGF = D.STANDINGS.reduce((s, t) => s + t.gf, 0),
    totGP = D.STANDINGS.reduce((s, t) => s + t.gp, 0);
  const pulse = [['Goals / game', (totGF / totGP).toFixed(2)], ['Total goals', totGF.toLocaleString()], ['Avg power play', avg(TS.map(t => t.pp)).toFixed(1) + '%'], ['Avg penalty kill', avg(TS.map(t => t.pk)).toFixed(1) + '%'], ['Avg save %', '.' + Math.round(avg(TS.map(t => Number(t.svPct))) * 1000)], ['Shutouts', D.goalies.reduce((s, g) => s + (g.so || 0), 0)]];
  const tlead = (rk, d) => {
    const t = TS.find(x => x.ranks[rk] === 1) || TS[0];
    return {
      ab: t.ab,
      v: d(t)
    };
  };
  const teamLeaders = [['Best offense', tlead('gf', t => t.gfPg + ' GF/GP')], ['Best defense', tlead('ga', t => t.gaPg + ' GA/GP')], ['Power play', tlead('pp', t => t.pp + '%')], ['Penalty kill', tlead('pk', t => t.pk + '%')], ['Faceoffs', tlead('fo', t => t.fo + '%')]];
  const Podium = ({
    p,
    rank
  }) => React.createElement("div", {
    onClick: () => open(p),
    className: "ec",
    style: {
      ...card,
      overflow: 'hidden',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      height: 3,
      background: c2(p.team)
    }
  }), React.createElement("div", {
    style: {
      padding: '15px 16px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 30,
      color: rank === 1 ? T.red : T.faint,
      lineHeight: 1
    }
  }, rank), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, p.gp, " GP")), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      marginBottom: 12
    }
  }, React.createElement(PlayerAvatar, {
    pos: isG ? 'G' : p.pos,
    team: p.team,
    name: p.name,
    size: 42
  }), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: T.ink,
      lineHeight: 1.15,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      wordBreak: 'break-word'
    }
  }, p.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, ct(p.team), " \xB7 ", isG ? 'G' : p.pos))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 600,
      letterSpacing: '-.03em',
      color: T.ink,
      lineHeight: 1
    }
  }, conf.disp(p)), React.createElement("div", {
    style: {
      ...ML,
      marginTop: 4
    }
  }, conf.label)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      textAlign: 'right',
      paddingBottom: 2
    }
  }, conf.sub(p)))));
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Stats",
    t: "League",
    serif: "leaders",
    right: React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, ['Leaders', 'All players', 'Compare'].map(m => React.createElement(Pill, {
      key: m,
      on: mode === m,
      onClick: () => setMode(m)
    }, m)))
  }), mode === 'All players' && React.createElement(StatsTable, {
    onPlayer: onPlayer
  }), mode === 'Compare' && React.createElement(StatsCompare, {
    onPlayer: onPlayer
  }), mode === 'Leaders' && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, ['Points', 'Goals', 'Assists', '+/-', 'Shots', 'P/GP', 'Hits', 'Blocks', 'TOI/GP', 'FO%', 'Goalies'].map(x => React.createElement(Pill, {
    key: x,
    on: cat === x,
    onClick: () => setCat(x)
  }, x)), !isG && React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginLeft: 'auto'
    }
  }, ['All', 'Forwards', 'Defense'].map(x => React.createElement(Pill, {
    key: x,
    on: posF === x,
    onClick: () => setPosF(x)
  }, x)))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16,
      alignItems: 'start'
    },
    className: "sg"
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12,
      marginBottom: 14
    },
    className: "pod"
  }, top.map((p, i) => React.createElement(Podium, {
    key: p.id,
    p: p,
    rank: i + 1
  }))), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${T.line}`
    }
  }, React.createElement("span", {
    style: ML
  }, isG ? 'Goalie' : posF === 'All' ? 'Skater' : posF, " leaders \xB7 4\u201315"), React.createElement("span", {
    style: {
      ...ML,
      color: T.faint
    }
  }, conf.label)), list.map((p, i) => React.createElement("div", {
    key: p.id,
    onClick: () => open(p),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 18px',
      borderTop: `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 20,
      color: T.faint,
      fontFamily: MONO,
      fontSize: 12
    }
  }, i + 4), React.createElement(Badge, {
    ab: p.team,
    size: 24
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      color: T.ink,
      fontWeight: 600,
      fontSize: 13.5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name, " ", React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11,
      fontWeight: 400
    }
  }, isG ? 'G' : p.pos)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, conf.sub(p))), React.createElement("div", {
    className: "stat-bar",
    style: {
      width: 88,
      height: 6,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden',
      flexShrink: 0
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${barPct(p._v)}%`,
      background: c2(p.team),
      borderRadius: 3
    }
  })), React.createElement("span", {
    style: {
      width: 46,
      textAlign: 'right',
      fontWeight: 700,
      fontSize: 15.5,
      fontVariantNumeric: 'tabular-nums'
    }
  }, conf.disp(p)))))), React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px'
    }
  }, React.createElement("div", {
    style: ML
  }, "League pulse"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px 16px',
      marginTop: 13
    }
  }, pulse.map(([l, v]) => React.createElement("div", {
    key: l
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: T.ink,
      letterSpacing: '-.02em',
      lineHeight: 1.1
    }
  }, v), React.createElement("div", {
    style: {
      ...ML,
      marginTop: 3
    }
  }, l))))), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 18px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Team leaders"), teamLeaders.map(([l, t], i) => React.createElement("div", {
    key: l,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '11px 18px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      ...ML
    }
  }, l), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 5
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 20
  }), React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: T.ink
    }
  }, ct(t.ab)))), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 12.5,
      fontWeight: 700,
      color: T.ink
    }
  }, t.v))))))), React.createElement("style", null, `@media(max-width:760px){.sg{grid-template-columns:1fr!important}}@media(max-width:560px){.pod{grid-template-columns:1fr!important}.stat-bar{display:none!important}}`));
}
function Spotlight({
  title,
  p,
  metrics,
  onPlayer
}) {
  return React.createElement("div", {
    style: {
      ...card,
      padding: 20
    }
  }, React.createElement(Eyebrow, null, title), React.createElement("button", {
    onClick: () => onPlayer(p),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 0 4px'
    }
  }, React.createElement(Badge, {
    ab: p.team,
    size: 40
  }), React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, p.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, ct(p.team), " \xB7 ", p.pos || 'G'))), React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, metrics.map(([l, v, pc]) => React.createElement("div", {
    key: l,
    style: {
      marginBottom: 9
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12.5,
      marginBottom: 4
    }
  }, React.createElement("span", {
    style: {
      color: T.mut
    }
  }, l), React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, v)), React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${pc}%`,
      background: c2(p.team)
    }
  }))))));
}
function HockeyIQPage({
  onPlayer,
  onTeam
}) {
  const draft = [...D.STANDINGS].slice(-5).reverse();
  const [iqTab, setIqTab] = uS('Overview');
  const teamsAZ = uM(() => [...D.ABBR].sort((a, b) => ct(a).localeCompare(ct(b))), []);
  const [tcA, setTcA] = uS(D.STANDINGS[0].ab);
  const [tcB, setTcB] = uS(D.STANDINGS[1].ab);
  const [etA, setEtA] = uS(D.STANDINGS[0].ab);
  const [etB, setEtB] = uS(D.STANDINGS[2] ? D.STANDINGS[2].ab : D.STANDINGS[1].ab);
  const tcmp = D.teamCompare(tcA, tcB);
  const seeds = cf => D.STANDINGS.filter(t => t.conf === cf).slice(0, 8);
  const skList = uM(() => D.skaterLeaders('p').slice(0, 24), []);
  const goList = uM(() => D.goalieLeaders().filter(g => g.gp >= 12).slice(0, 20), []);
  const [skId, setSkId] = uS(skList[0].id);
  const [goId, setGoId] = uS(goList[0].id);
  const [cmpA, setCmpA] = uS(skList[0].id);
  const [cmpB, setCmpB] = uS(skList[1].id);
  const [cmpGA, setCmpGA] = uS(goList[0].id);
  const [cmpGB, setCmpGB] = uS(goList[1].id);
  const [boardM, setBoardM] = uS('top');
  const [ebMore, setEbMore] = uS(false);
  const [h2hMode, setH2hMode] = uS('Standard');
  const cmp = D.edgeCompare(cmpA, cmpB);
  const gcmp = D.goalieEdgeCompare(cmpGA, cmpGB);
  const teamDist = D.edgeTeamDistance();
  const topSk = skList.find(p => p.id === skId) || skList[0];
  const topG = {
    ...(goList.find(g => g.id === goId) || goList[0]),
    type: 'goalie'
  };
  const skE = D.skaterEdge(topSk);
  const gE = D.goalieEdge(topG);
  const sos = D.strengthOfSchedule();
  const rest = D.restTracker();
  const sel = {
    fontFamily: MONO,
    fontSize: 11,
    background: T.paper,
    border: `1px solid ${T.line2}`,
    borderRadius: 8,
    padding: '5px 8px',
    color: T.mut
  };
  const EdgeCard = ({
    title,
    metric,
    unit
  }) => {
    const rows = D.edgeLeaders(metric);
    return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: '12px 15px',
        fontSize: 13,
        fontWeight: 600,
        borderBottom: `1px solid ${T.line}`
      }
    }, title), rows.map((p, i) => React.createElement("div", {
      key: p.id,
      onClick: () => onPlayer(p),
      className: "er",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 15px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        cursor: 'pointer'
      }
    }, React.createElement("span", {
      style: {
        width: 14,
        color: T.faint,
        fontFamily: MONO,
        fontSize: 11
      }
    }, i + 1), React.createElement(Badge, {
      ab: p.team,
      size: 20
    }), React.createElement("span", {
      style: {
        flex: 1,
        color: T.ink,
        fontSize: 13
      }
    }, p.name), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontFamily: MONO,
        fontSize: 13
      }
    }, p._v, React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 400,
        color: T.faint
      }
    }, unit)))));
  };
  const Lead = ({
    title,
    list,
    k
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      fontSize: 14,
      fontWeight: 600,
      color: T.ink,
      borderBottom: `1px solid ${T.line}`
    }
  }, title), list.map((p, i) => React.createElement("div", {
    key: p.id,
    onClick: () => onPlayer(p),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 16,
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11
    }
  }, i + 1), React.createElement(Badge, {
    ab: p.team,
    size: 22
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: T.ink,
      fontSize: 13.5
    }
  }, p.name), React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, p[k]))));
  const EB_M = [['top', 'Top skating speed', 'mph'], ['shot', 'Max shot speed', 'mph'], ['savg', 'Avg shot speed', 'mph'], ['dist', 'Distance', 'mi'], ['b20', '20+ bursts', ''], ['b22', '22+ bursts', ''], ['oz', 'O-zone time', '%']];
  const EdgeBoard = () => {
    const m = boardM,
      setM = setBoardM;
    const meta = EB_M.find(x => x[0] === m) || EB_M[0];
    const rows = window.E_useLive(D.edgeBoard(m), () => window.NHL && window.NHL.edgeBoardLive ? window.NHL.edgeBoardLive(m) : Promise.resolve(null), [m], 'edgeBoard:' + m);
    const shown = ebMore ? rows : rows.slice(0, 5);
    return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        borderBottom: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600
      }
    }, "League EDGE leaderboard"), React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, EB_M.map(([k, lab]) => React.createElement("button", {
      key: k,
      onClick: () => setM(k),
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        padding: '4px 9px',
        borderRadius: 999,
        border: `1px solid ${m === k ? T.invBg : T.line2}`,
        background: m === k ? T.invBg : 'transparent',
        color: m === k ? T.invFg : T.mut,
        cursor: 'pointer'
      }
    }, lab)))), shown.map((p, i) => React.createElement("div", {
      key: p.id,
      onClick: () => onPlayer(p),
      className: "er",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        cursor: 'pointer'
      }
    }, React.createElement("span", {
      style: {
        width: 20,
        fontFamily: MONO,
        fontSize: 12,
        color: i < 3 ? T.red : T.faint,
        fontWeight: i < 3 ? 700 : 400
      }
    }, i + 1), React.createElement(Badge, {
      ab: p.team,
      size: 22
    }), React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13.5,
        color: T.ink,
        fontWeight: i < 3 ? 600 : 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, p.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        flexShrink: 0
      }
    }, p.team, " \xB7 ", p.pos), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 700,
        color: T.ink,
        minWidth: 60,
        textAlign: 'right'
      }
    }, p._v, meta[2] ? ' ' + meta[2] : ''))), rows.length > 5 && React.createElement("button", {
      onClick: () => setEbMore(v => !v),
      className: "er",
      style: {
        width: '100%',
        padding: '10px 16px',
        borderTop: `1px solid ${T.line}`,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: T.mut,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, ebMore ? 'Show less' : `Show all ${rows.length}`, React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      style: {
        transform: ebMore ? 'rotate(180deg)' : 'none',
        transition: 'transform .15s'
      }
    }, React.createElement("path", {
      d: "m6 9 6 6 6-6"
    }))));
  };
  const EdgeTeams = () => {
    const dist = D.edgeTeamDistance();
    const spd = D.edgeTeamSpeed ? D.edgeTeamSpeed() : [];
    const TB = ({
      title,
      rows,
      k,
      unit
    }) => React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        fontSize: 14,
        fontWeight: 600,
        borderBottom: `1px solid ${T.line}`
      }
    }, title), rows.map((t, i) => React.createElement("div", {
      key: t.ab,
      onClick: () => onTeam(t.ab),
      className: "er",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        cursor: 'pointer'
      }
    }, React.createElement("span", {
      style: {
        width: 16,
        color: T.faint,
        fontFamily: MONO,
        fontSize: 11
      }
    }, i + 1), React.createElement(Badge, {
      ab: t.ab,
      size: 22
    }), React.createElement("span", {
      style: {
        flex: 1,
        color: T.ink,
        fontSize: 13.5
      }
    }, ct(t.ab)), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontFamily: MONO,
        fontSize: 13
      }
    }, t[k], React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 400,
        color: T.faint
      }
    }, unit)))));
    return React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 16
      },
      className: "g2"
    }, React.createElement(TB, {
      title: "Team skating distance",
      rows: dist,
      k: "mi",
      unit: " mi/gm"
    }), React.createElement(TB, {
      title: "Team top skating speed",
      rows: spd,
      k: "top",
      unit: " mph"
    }));
  };
  const TList = ({
    title,
    rows,
    fmt
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      fontSize: 14,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, title), rows.map((t, i) => React.createElement("div", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 22
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: T.ink,
      fontSize: 13.5
    }
  }, ct(t.ab)), fmt(t))));
  const story = (tag, headline, sub, onClick, accent) => React.createElement("div", {
    onClick: onClick,
    className: "ec",
    style: {
      ...card,
      padding: '16px 17px',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: accent || T.red
    }
  }, tag), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 18,
      lineHeight: 1.25,
      color: T.ink,
      margin: '7px 0 5px'
    }
  }, headline), React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.mut
    }
  }, sub));
  const fastSk = D.edgeLeaders('top')[0],
    hardSh = D.edgeLeaders('shot')[0],
    burst = D.edgeLeaders('b22')[0];
  const hdGoalie = D.goalieHDLeaders()[0],
    distTeam = teamDist[0],
    b2b = rest.find(t => t.b2b),
    ptsL = D.skaterLeaders('p')[0];
  const SkSpot = () => React.createElement("div", {
    style: {
      ...card,
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement(Eyebrow, null, "Featured skater"), React.createElement("select", {
    value: skId,
    onChange: e => setSkId(e.target.value),
    style: sel
  }, skList.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name)))), React.createElement("button", {
    onClick: () => onPlayer(topSk),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 0 4px'
    }
  }, React.createElement(Badge, {
    ab: topSk.team,
    size: 40
  }), React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, topSk.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, ct(topSk.team), " \xB7 ", topSk.pos))), React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, skE.speed.slice(0, 4).map(([l, v, pc]) => React.createElement("div", {
    key: l,
    style: {
      marginBottom: 9
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12.5,
      marginBottom: 4
    }
  }, React.createElement("span", {
    style: {
      color: T.mut
    }
  }, l), React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, v)), React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${pc}%`,
      background: c2(topSk.team)
    }
  }))))));
  const GoSpot = () => React.createElement("div", {
    style: {
      ...card,
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement(Eyebrow, null, "Featured goalie"), React.createElement("select", {
    value: goId,
    onChange: e => setGoId(e.target.value),
    style: sel
  }, goList.map(g => React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name)))), React.createElement("button", {
    onClick: () => onPlayer(topG),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 0 4px'
    }
  }, React.createElement(Badge, {
    ab: topG.team,
    size: 40
  }), React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, topG.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, ct(topG.team), " \xB7 G"))), React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, gE.saveQ.map(([l, v, pc]) => React.createElement("div", {
    key: l,
    style: {
      marginBottom: 9
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12.5,
      marginBottom: 4
    }
  }, React.createElement("span", {
    style: {
      color: T.mut
    }
  }, l), React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, v)), React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${pc}%`,
      background: c2(topG.team)
    }
  }))))));
  const SkCompare = () => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Skater comparison \xB7 NHL Edge"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, React.createElement("select", {
    value: cmpA,
    onChange: e => setCmpA(e.target.value),
    style: sel
  }, skList.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "vs"), React.createElement("select", {
    value: cmpB,
    onChange: e => setCmpB(e.target.value),
    style: sel
  }, skList.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      gap: 12
    }
  }, React.createElement("button", {
    onClick: () => onPlayer(cmp.A),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: cmp.A.team,
    size: 28
  }), React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: T.ink
    }
  }, cmp.A.name)), React.createElement("button", {
    onClick: () => onPlayer(cmp.B),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: T.ink
    }
  }, cmp.B.name), React.createElement(Badge, {
    ab: cmp.B.team,
    size: 28
  }))), cmp.rows.map((r, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("span", {
    style: {
      textAlign: 'right',
      fontFamily: MONO,
      fontWeight: r.aWins ? 700 : 400,
      color: r.aWins ? T.ink : T.mut
    }
  }, r.a, r.u), React.createElement("span", {
    style: {
      ...ML,
      width: 120,
      textAlign: 'center'
    }
  }, r.l), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontWeight: !r.aWins ? 700 : 400,
      color: !r.aWins ? T.ink : T.mut
    }
  }, r.b, r.u))));
  const GoCompare = () => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Goalie comparison \xB7 NHL Edge"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, React.createElement("select", {
    value: cmpGA,
    onChange: e => setCmpGA(e.target.value),
    style: sel
  }, goList.map(g => React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name))), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "vs"), React.createElement("select", {
    value: cmpGB,
    onChange: e => setCmpGB(e.target.value),
    style: sel
  }, goList.map(g => React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name))))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      gap: 12
    }
  }, React.createElement("button", {
    onClick: () => onPlayer(gcmp.A),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: gcmp.A.team,
    size: 28
  }), React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: T.ink
    }
  }, gcmp.A.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, ct(gcmp.A.team), " \xB7 ", gcmp.A.w, "-", gcmp.A.l))), React.createElement("button", {
    onClick: () => onPlayer(gcmp.B),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: T.ink
    }
  }, gcmp.B.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, ct(gcmp.B.team), " \xB7 ", gcmp.B.w, "-", gcmp.B.l)), React.createElement(Badge, {
    ab: gcmp.B.team,
    size: 28
  }))), gcmp.rows.map((r, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("span", {
    style: {
      textAlign: 'right',
      fontFamily: MONO,
      fontWeight: r.aWins ? 700 : 400,
      color: r.aWins ? T.ink : T.mut
    }
  }, r.a, r.u), React.createElement("span", {
    style: {
      ...ML,
      width: 130,
      textAlign: 'center'
    }
  }, r.l), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontWeight: !r.aWins ? 700 : 400,
      color: !r.aWins ? T.ink : T.mut
    }
  }, r.b, r.u))));
  const Seeds = () => React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    },
    className: "g2"
  }, [['East', 'Eastern'], ['West', 'Western']].map(([cf, lab]) => React.createElement("div", {
    key: cf,
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      fontSize: 14,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, lab, " \xB7 playoff seeds"), seeds(cf).map((t, i) => React.createElement("div", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: 7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 11,
      fontWeight: 600,
      background: i < 3 ? T.invBg : T.bg,
      color: i < 3 ? T.invFg : T.mut
    }
  }, i + 1), React.createElement(Badge, {
    ab: t.ab,
    size: 20
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: T.ink,
      fontSize: 13.5
    }
  }, ct(t.ab)), React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, t.pts))))));
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Hockey IQ",
    t: "NHL Edge",
    serif: "analytics"
  }), React.createElement(Tabs, {
    tabs: ['Overview', 'Skaters', 'Goalies', 'Teams'],
    active: iqTab,
    onChange: setIqTab
  }), iqTab === 'Overview' && React.createElement("div", null, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, "Around the analytics desk"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 14,
      marginBottom: 18
    }
  }, fastSk && story('Top speed', `${fastSk.name} is the league's fastest`, `${fastSk._v} mph top skating speed`, () => onPlayer(fastSk), '#1a8a4f'), hardSh && story('Hardest shot', `${hardSh.name} is firing bullets`, `${hardSh._v} mph max shot speed`, () => onPlayer(hardSh)), hdGoalie && story('The wall', `${hdGoalie.name} owns the slot`, `${String(hdGoalie.hd).slice(1)} high-danger SV%`, () => onPlayer(hdGoalie), '#1f5f8a'), distTeam && story('Workhorses', `${ct(distTeam.ab)} skate the most`, `${distTeam.mi} mi/game as a team`, () => onTeam(distTeam.ab)), burst && story('High gear', `${burst.name} keeps hitting top speed`, `${burst._v} bursts of 22+ mph`, () => onPlayer(burst), '#1a8a4f'), b2b && story('Rest alert', `${ct(b2b.ab)} on a back-to-back`, 'fatigue could be a factor tonight', () => onTeam(b2b.ab), T.red)), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    },
    className: "g2"
  }, React.createElement(SkSpot, null), React.createElement(GoSpot, null))), iqTab === 'Skaters' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginBottom: 11,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Skater tracking leaders"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "NHL EDGE \xB7 live in-season, projected otherwise")), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14,
      marginBottom: 16
    }
  }, React.createElement(EdgeCard, {
    title: "Top skating speed",
    metric: "top",
    unit: " mph"
  }), React.createElement(EdgeCard, {
    title: "22+ mph bursts",
    metric: "b22",
    unit: ""
  }), React.createElement(EdgeCard, {
    title: "Max shot speed",
    metric: "shot",
    unit: " mph"
  }), React.createElement(EdgeCard, {
    title: "O-zone time",
    metric: "oz",
    unit: "%"
  })), React.createElement(EdgeBoard, null), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14,
      marginBottom: 16
    }
  }, React.createElement(Lead, {
    title: "Points leaders",
    list: D.skaterLeaders('p').slice(0, 5),
    k: "p"
  }), React.createElement(Lead, {
    title: "Goal leaders",
    list: D.skaterLeaders('g').slice(0, 5),
    k: "g"
  }), React.createElement(Lead, {
    title: "Assist leaders",
    list: D.skaterLeaders('a').slice(0, 5),
    k: "a"
  })), React.createElement(SkCompare, null)), iqTab === 'Goalies' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 16
    },
    className: "g2"
  }, React.createElement(GoSpot, null), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      fontSize: 14,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Goalie high-danger SV%"), D.goalieHDLeaders().map((g, i) => React.createElement("div", {
    key: g.id,
    onClick: () => onPlayer(g),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 16,
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11
    }
  }, i + 1), React.createElement(Badge, {
    ab: g.team,
    size: 22
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: T.ink,
      fontSize: 13.5
    }
  }, g.name), React.createElement("span", {
    style: {
      fontWeight: 700,
      fontFamily: MONO,
      fontSize: 13
    }
  }, String(g.hd).slice(1)))))), React.createElement(GoCompare, null)), iqTab === 'Teams' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      margin: '22px 0 11px',
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Team tracking leaders"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "NHL EDGE \xB7 live in-season, projected otherwise")), React.createElement(EdgeTeams, null), React.createElement("div", {
    style: {
      ...ML,
      margin: '22px 0 11px'
    }
  }, "Team head-to-head"), (() => {
    const Row = ({
      r
    }) => {
      const an = r.a,
        bn = r.b;
      const aw = r.low ? an <= bn : an >= bn;
      const tot = Math.abs(an) + Math.abs(bn) || 1;
      const ap = Math.round(Math.abs(an) / tot * 100);
      return React.createElement("div", {
        style: {
          padding: '9px 0',
          borderTop: `1px solid ${T.line}`
        }
      }, React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 12.5,
          marginBottom: 5
        }
      }, React.createElement("span", {
        style: {
          fontWeight: aw ? 700 : 400,
          color: c2(tcA),
          minWidth: 54
        }
      }, an, r.u || ''), React.createElement("span", {
        style: {
          ...ML,
          fontSize: 10
        }
      }, r.l), React.createElement("span", {
        style: {
          fontWeight: !aw ? 700 : 400,
          color: c2(tcB),
          minWidth: 54,
          textAlign: 'right'
        }
      }, bn, r.u || '')), React.createElement("div", {
        style: {
          display: 'flex',
          height: 5,
          borderRadius: 3,
          overflow: 'hidden',
          background: T.bg
        }
      }, React.createElement("div", {
        style: {
          width: `${ap}%`,
          background: c2(tcA),
          opacity: aw ? 1 : .35
        }
      }), React.createElement("div", {
        style: {
          flex: 1,
          background: c2(tcB),
          opacity: !aw ? 1 : .35
        }
      })));
    };
    const EdgeRow = ({
      row,
      i
    }) => {
      const aw = row.aPct >= row.bPct;
      return React.createElement("div", {
        style: {
          padding: '9px 0',
          borderTop: i ? `1px solid ${T.line}` : 'none'
        }
      }, React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: MONO,
          fontSize: 12.5,
          marginBottom: 6
        }
      }, React.createElement("span", {
        style: {
          fontWeight: aw ? 700 : 400,
          color: c2(tcA),
          minWidth: 60
        }
      }, row.a, row.unit === '%' ? '%' : ''), React.createElement("span", {
        style: {
          ...ML,
          fontSize: 10
        }
      }, row.label), React.createElement("span", {
        style: {
          fontWeight: !aw ? 700 : 400,
          color: c2(tcB),
          minWidth: 60,
          textAlign: 'right'
        }
      }, row.b, row.unit === '%' ? '%' : '')), React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, React.createElement("div", {
        style: {
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: T.bg,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-end'
        }
      }, React.createElement("div", {
        style: {
          width: `${row.aPct}%`,
          background: c2(tcA),
          opacity: aw ? 1 : .45
        }
      })), React.createElement("div", {
        style: {
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: T.bg,
          overflow: 'hidden',
          display: 'flex'
        }
      }, React.createElement("div", {
        style: {
          width: `${row.bPct}%`,
          background: c2(tcB),
          opacity: !aw ? 1 : .45
        }
      }))));
    };
    return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        borderBottom: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: ML
    }, "Team head-to-head"), React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, React.createElement("select", {
      value: tcA,
      onChange: e => setTcA(e.target.value),
      style: sel
    }, teamsAZ.map(a => React.createElement("option", {
      key: a,
      value: a
    }, ct(a), " ", nk(a)))), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, "vs"), React.createElement("select", {
      value: tcB,
      onChange: e => setTcB(e.target.value),
      style: sel
    }, teamsAZ.map(a => React.createElement("option", {
      key: a,
      value: a
    }, ct(a), " ", nk(a)))))), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        gap: 12
      }
    }, React.createElement("button", {
      onClick: () => onTeam(tcA),
      className: "el",
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, React.createElement(Badge, {
      ab: tcA,
      size: 30
    }), React.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: T.ink
      }
    }, ct(tcA)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, tcmp.sa.w, "-", tcmp.sa.l, "-", tcmp.sa.otl))), React.createElement("button", {
      onClick: () => onTeam(tcB),
      className: "el",
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: T.ink
      }
    }, ct(tcB)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, tcmp.sb.w, "-", tcmp.sb.l, "-", tcmp.sb.otl)), React.createElement(Badge, {
      ab: tcB,
      size: 30
    }))), React.createElement("div", {
      style: {
        padding: '0 16px 12px',
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, ['Standard', 'NHL EDGE'].map(mm => React.createElement(Pill, {
      key: mm,
      on: h2hMode === mm,
      onClick: () => setH2hMode(mm)
    }, mm)), React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontFamily: MONO,
        fontSize: 10,
        color: T.faint
      }
    }, h2hMode === 'NHL EDGE' ? 'percentile vs league' : 'season to date')), React.createElement("div", {
      style: {
        padding: '2px 16px 14px'
      }
    }, h2hMode === 'Standard' ? tcmp.rows.map((r, i) => React.createElement(Row, {
      key: i,
      r: r
    })) : D.edgeTeamCompare(tcA, tcB).map((row, i) => React.createElement(EdgeRow, {
      key: row.label,
      row: row,
      i: i
    }))), React.createElement("div", {
      style: {
        padding: '12px 16px',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 8
      }
    }, "Recent meetings"), tcmp.meet.map((m, i) => {
      const aw = m.as > m.hs;
      return React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 0',
          fontFamily: MONO,
          fontSize: 12.5
        }
      }, React.createElement("span", {
        style: {
          color: T.faint,
          width: 52
        }
      }, m.date), React.createElement("span", {
        style: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, React.createElement(Badge, {
        ab: m.away,
        size: 17
      }), React.createElement("span", {
        style: {
          fontWeight: aw ? 700 : 400
        }
      }, m.away), React.createElement("span", {
        style: {
          color: T.faint
        }
      }, m.as), React.createElement("span", {
        style: {
          color: T.faint
        }
      }, "@"), React.createElement("span", {
        style: {
          color: T.faint
        }
      }, m.hs), React.createElement("span", {
        style: {
          fontWeight: !aw ? 700 : 400
        }
      }, m.home), React.createElement(Badge, {
        ab: m.home,
        size: 17
      })), m.ot && React.createElement("span", {
        style: {
          color: T.faint,
          fontSize: 10
        }
      }, "OT"));
    })));
  })(), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 15px',
      fontSize: 13,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Team skating distance \xB7 mi/gm"), teamDist.map((t, i) => React.createElement("div", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 15px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      width: 14,
      color: T.faint,
      fontFamily: MONO,
      fontSize: 11
    }
  }, i + 1), React.createElement(Badge, {
    ab: t.ab,
    size: 20
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: T.ink,
      fontSize: 13
    }
  }, ct(t.ab)), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 13,
      fontWeight: 700
    }
  }, t.mi)))), React.createElement(TList, {
    title: "Strength of schedule",
    rows: sos,
    fmt: t => React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut
      }
    }, t.n, " next 5d")
  }), React.createElement(TList, {
    title: "Rest tracker",
    rows: rest,
    fmt: t => t.b2b ? React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.negFg,
        background: T.negBg,
        padding: '2px 7px',
        borderRadius: 5
      }
    }, "back-to-back") : React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut
      }
    }, t.days, "d rest")
  })), React.createElement(Seeds, null)), React.createElement("style", null, `@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`));
}
function GameBox({
  hiAb,
  loAb,
  hiW,
  loW,
  gameNo,
  onBack,
  onGame,
  onTeam
}) {
  const gd = D.gameDetail(hiAb, loAb, hiW, loW, gameNo);
  const total = D.seriesDetail(hiAb, loAb, hiW, loW).games.length;
  const hasNext = gameNo < total;
  const hw = gd.winner === 'hi';
  const cols = gd.ot ? ['1st', '2nd', '3rd', 'OT'] : ['1st', '2nd', '3rd'];
  const STR = {
    PP: '#9a6b1a',
    SH: '#1f5f8a',
    OT: T.red,
    EV: T.faint,
    EN: T.mut
  };
  const cmpNum = v => typeof v === 'number' ? v : parseFloat(v) || 0;
  const Cmp = ({
    label,
    a,
    b,
    fmt,
    hiBetter = true
  }) => {
    const na = cmpNum(a),
      nb = cmpNum(b);
    const aw = hiBetter ? na >= nb : na <= nb;
    const tot = Math.abs(na) + Math.abs(nb) || 1;
    const ap = Math.round(Math.abs(na) / tot * 100);
    return React.createElement("div", {
      style: {
        padding: '9px 0',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: MONO,
        fontSize: 12.5,
        marginBottom: 5
      }
    }, React.createElement("span", {
      style: {
        fontWeight: aw ? 700 : 400,
        color: aw ? T.ink : T.mut,
        minWidth: 54
      }
    }, fmt ? fmt(a) : a), React.createElement("span", {
      style: {
        ...ML,
        fontSize: 10
      }
    }, label), React.createElement("span", {
      style: {
        fontWeight: !aw ? 700 : 400,
        color: !aw ? T.ink : T.mut,
        minWidth: 54,
        textAlign: 'right'
      }
    }, fmt ? fmt(b) : b)), React.createElement("div", {
      style: {
        display: 'flex',
        height: 5,
        borderRadius: 3,
        overflow: 'hidden',
        background: T.bg
      }
    }, React.createElement("div", {
      style: {
        width: `${ap}%`,
        background: c2(hiAb),
        opacity: aw ? 1 : .35
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        background: c2(loAb),
        opacity: !aw ? 1 : .35
      }
    })));
  };
  const Sub = ({
    children
  }) => React.createElement("div", {
    style: {
      ...ML,
      fontSize: 10,
      color: T.ink,
      margin: '16px 0 2px'
    }
  }, children);
  const TH = ({
    ab,
    score,
    win
  }) => React.createElement("div", {
    onClick: () => onTeam(ab),
    className: "el",
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      cursor: 'pointer',
      flex: 1,
      opacity: win ? 1 : 0.6
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 42
  }), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: T.ink
    }
  }, ct(ab)), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 38,
      lineHeight: 1,
      color: win ? c2(ab) : T.faint
    }
  }, score));
  const th = gd.team[hiAb],
    to = gd.team[loAb];
  const pp = t => +(t.ppg / t.ppo * 100).toFixed(1);
  const SkTable = ({
    ab
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    onClick: () => onTeam(ab),
    className: "el",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '11px 15px',
      borderBottom: `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 20
  }), React.createElement("span", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, ct(ab), " ", nk(ab))), React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 320,
      borderCollapse: 'collapse',
      fontSize: 12.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['Skater', 'G', 'A', 'P', '+/-', 'S', 'Hits', 'Blk', 'TOI'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '7px 9px',
      textAlign: i ? 'center' : 'left',
      fontWeight: 600,
      ...ML,
      fontSize: 9
    }
  }, h)))), React.createElement("tbody", null, gd.skaters[ab].map((p, i) => React.createElement("tr", {
    key: i,
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '6px 9px',
      whiteSpace: 'nowrap'
    }
  }, p.name, " ", React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 10
    }
  }, p.pos)), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      fontWeight: p.g ? 700 : 400
    }
  }, p.g), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO
    }
  }, p.a), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      fontWeight: 700
    }
  }, p.p), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: p.pm >= 0 ? '#1a8a4f' : T.red
    }
  }, p.pm >= 0 ? '+' : '', p.pm), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.s), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.hits), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.blk), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.toi)))))), (() => {
    const g = gd.goalie[ab];
    return React.createElement("div", {
      style: {
        padding: '10px 15px',
        borderTop: `2px solid ${T.line2}`,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut
      }
    }, React.createElement("span", {
      style: {
        color: T.ink,
        fontWeight: 600
      }
    }, g.name, " ", React.createElement("span", {
      style: {
        color: g.dec === 'W' ? '#1a8a4f' : T.faint,
        fontWeight: 700
      }
    }, "(", g.dec, ")")), React.createElement("span", null, g.saves, "/", g.sf, " sv \xB7 ", g.svp, " SV% \xB7 ", g.ga, " GA"));
  })());
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 16
    }
  }, React.createElement("button", {
    onClick: onBack,
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: 0
    }
  }, "\u2190 back to series"), React.createElement("button", {
    onClick: () => hasNext ? onGame(gameNo + 1) : onBack(),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: hasNext ? T.ink : T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: 0,
      fontWeight: hasNext ? 600 : 400
    }
  }, hasNext ? `Game ${gameNo + 1} →` : 'series overview →')), React.createElement("div", {
    style: {
      ...card,
      padding: '20px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      textAlign: 'center',
      marginBottom: 14
    }
  }, "Game ", gd.gameNo, gd.ot ? ' · Overtime' : '', " \xB7 ", ct(hw ? hiAb : loAb), " win ", Math.max(gd.hs, gd.ls), "\u2013", Math.min(gd.hs, gd.ls)), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18
    }
  }, React.createElement(TH, {
    ab: hiAb,
    score: gd.hs,
    win: hw
  }), React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 15,
      color: T.faint
    }
  }, "vs"), React.createElement(TH, {
    ab: loAb,
    score: gd.ls,
    win: !hw
  })), React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: MONO,
      fontSize: 13
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['', ...cols, 'T', 'SOG'].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      padding: '7px 8px',
      textAlign: i ? 'center' : 'left',
      fontWeight: 600,
      ...ML,
      fontSize: 9.5
    }
  }, h)))), React.createElement("tbody", null, [hiAb, loAb].map(ab => {
    const ln = gd.line[ab];
    const tot = ln.reduce((s, v) => s + v, 0);
    const sog = gd.shots[ab].reduce((s, v) => s + v, 0);
    return React.createElement("tr", {
      key: ab,
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 18
    }), ab), cols.map((c, i) => React.createElement("td", {
      key: i,
      style: {
        textAlign: 'center',
        color: ln[i] ? T.ink : T.faint
      }
    }, ln[i])), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontWeight: 700
      }
    }, tot), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, sog));
  }))))), gd.stars.length > 0 && React.createElement("div", {
    style: {
      ...card,
      padding: '14px 18px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, "Three stars"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, gd.stars.map((s, i) => React.createElement("div", {
    key: i,
    onClick: () => onTeam(s.ab),
    className: "el",
    style: {
      flex: '1 1 150px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      borderRadius: 10,
      background: T.bg,
      border: `1px solid ${T.line2}`,
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 22,
      color: '#9a7c2a'
    }
  }, i + 1), React.createElement(Badge, {
    ab: s.ab,
    size: 22
  }), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      color: T.ink,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, s.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, s.note)))))), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Scoring summary"), gd.goals.length === 0 ? React.createElement("div", {
    style: {
      padding: 16,
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, "No goals.") : cols.map((cl, pi) => {
    const gs = gd.goals.filter(g => g.period === pi);
    if (!gs.length) return null;
    return React.createElement("div", {
      key: pi
    }, React.createElement("div", {
      style: {
        padding: '7px 16px',
        background: T.bg,
        ...ML,
        fontSize: 9.5
      }
    }, cl, " period"), gs.map((g, i) => React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 16px',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        width: 40
      }
    }, g.time), React.createElement(Badge, {
      ab: g.ab,
      size: 20
    }), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: T.ink,
        fontWeight: 600
      }
    }, g.scorer, " ", React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        fontWeight: 700,
        color: STR[g.str],
        letterSpacing: '.04em'
      }
    }, g.str !== 'EV' ? g.str : '')), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, g.a1 ? `${g.a1}${g.a2 ? ', ' + g.a2 : ''}` : 'unassisted')), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 700,
        color: T.ink
      }
    }, g.hs, "\u2013", g.ls))));
  })), React.createElement("div", {
    style: {
      ...card,
      padding: '8px 18px 16px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0 4px',
      fontFamily: MONO,
      fontSize: 12
    }
  }, React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement(Badge, {
    ab: hiAb,
    size: 20
  }), hiAb), React.createElement("span", {
    style: {
      ...ML,
      fontSize: 9.5,
      alignSelf: 'center'
    }
  }, "Game stats"), React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, loAb, React.createElement(Badge, {
    ab: loAb,
    size: 20
  }))), React.createElement(Cmp, {
    label: "Goals",
    a: th.goals,
    b: to.goals
  }), React.createElement(Cmp, {
    label: "Shots on goal",
    a: th.shots,
    b: to.shots
  }), React.createElement(Cmp, {
    label: "Power play %",
    a: pp(th),
    b: pp(to),
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Faceoff %",
    a: th.fo,
    b: to.fo,
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Hits",
    a: th.hits,
    b: to.hits
  }), React.createElement(Cmp, {
    label: "Blocked shots",
    a: th.blk,
    b: to.blk
  }), React.createElement(Cmp, {
    label: "Takeaways",
    a: th.take,
    b: to.take
  }), React.createElement(Cmp, {
    label: "Giveaways",
    a: th.give,
    b: to.give,
    hiBetter: false
  }), React.createElement(Cmp, {
    label: "Penalty minutes",
    a: th.pim,
    b: to.pim,
    hiBetter: false
  })), window.E_ShotMap && (() => {
    const homeAb = gd.home === 'hi' ? hiAb : loAb,
      awayAb = gd.home === 'hi' ? loAb : hiAb;
    const g = {
      id: `po-${hiAb}-${loAb}-${gameNo}`,
      st: 'pre',
      a: awayAb,
      h: homeAb,
      sa: gd.team[awayAb].shots,
      sh: gd.team[homeAb].shots,
      as: gd.team[awayAb].goals,
      hs: gd.team[homeAb].goals
    };
    return React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, React.createElement(window.E_ShotMap, {
      g: g
    }));
  })(), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    },
    className: "g2"
  }, React.createElement(SkTable, {
    ab: hiAb
  }), React.createElement(SkTable, {
    ab: loAb
  })));
}
function SeriesDetail({
  hiAb,
  loAb,
  hiW,
  loW,
  onBack,
  onTeam
}) {
  const sd = D.seriesDetail(hiAb, loAb, hiW, loW);
  const [tab, setTab] = uS('Team stats');
  const [gm, setGm] = uS(null);
  const [shotGame, setShotGame] = uS('series');
  if (gm) return React.createElement(GameBox, {
    hiAb: hiAb,
    loAb: loAb,
    hiW: hiW,
    loW: loW,
    gameNo: gm,
    onBack: () => setGm(null),
    onGame: n => {
      setGm(n);
      window.scrollTo(0, 0);
    },
    onTeam: onTeam
  });
  const TH = ({
    ab,
    score,
    win
  }) => React.createElement("div", {
    onClick: () => onTeam(ab),
    className: "el",
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      flex: 1,
      opacity: win ? 1 : 0.65
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 46
  }), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: T.ink,
      textAlign: 'center'
    }
  }, ct(ab), " ", nk(ab)), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 40,
      lineHeight: 1,
      color: win ? c2(ab) : T.faint
    }
  }, score));
  const Cmp = ({
    label,
    a,
    b,
    fmt,
    hiBetter = true
  }) => {
    const toNum = v => typeof v === 'number' ? v : /^\d+:\d+$/.test(v) ? +v.split(':')[0] * 60 + +v.split(':')[1] : parseFloat(v) || 0;
    const na = toNum(a),
      nb = toNum(b);
    const aWin = hiBetter ? na >= nb : na <= nb;
    const tot = Math.abs(na) + Math.abs(nb) || 1;
    const ap = Math.round(Math.abs(na) / tot * 100);
    return React.createElement("div", {
      style: {
        padding: '10px 0',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontFamily: MONO,
        fontSize: 13,
        marginBottom: 6
      }
    }, React.createElement("span", {
      style: {
        fontWeight: aWin ? 700 : 400,
        color: aWin ? T.ink : T.mut,
        minWidth: 64
      }
    }, fmt ? fmt(a) : a), React.createElement("span", {
      style: {
        ...ML,
        fontSize: 10
      }
    }, label), React.createElement("span", {
      style: {
        fontWeight: !aWin ? 700 : 400,
        color: !aWin ? T.ink : T.mut,
        minWidth: 64,
        textAlign: 'right'
      }
    }, fmt ? fmt(b) : b)), React.createElement("div", {
      style: {
        display: 'flex',
        height: 5,
        borderRadius: 3,
        overflow: 'hidden',
        background: T.bg
      }
    }, React.createElement("div", {
      style: {
        width: `${ap}%`,
        background: c2(hiAb),
        opacity: aWin ? 1 : .35
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        background: c2(loAb),
        opacity: !aWin ? 1 : .35
      }
    })));
  };
  const th = sd.team[hiAb],
    to = sd.team[loAb],
    eh = sd.edge[hiAb],
    eo = sd.edge[loAb];
  const pp = t => +(t.ppg / t.ppo * 100).toFixed(1);
  const shotPct = t => +(t.goals / t.shots * 100).toFixed(1);
  const savePct = (t, opp) => +((1 - opp.goals / t.shotsAgainst) * 100).toFixed(1);
  const svp = (self, opp) => +((opp.shots - self.goals) / opp.shots * 100).toFixed(1);
  const pdo = (self, opp) => +(shotPct(self) + svp(self, opp)).toFixed(1);
  const Sub = ({
    children
  }) => React.createElement("div", {
    style: {
      ...ML,
      fontSize: 10,
      color: T.ink,
      marginTop: 16,
      marginBottom: 2,
      paddingTop: 6
    }
  }, children);
  const LCard = ({
    ab
  }) => React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    onClick: () => onTeam(ab),
    className: "el",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '12px 15px',
      borderBottom: `1px solid ${T.line}`,
      cursor: 'pointer'
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 22
  }), React.createElement("span", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, ct(ab), " ", nk(ab))), React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 330,
      borderCollapse: 'collapse',
      fontSize: 12.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['Skater', 'G', 'A', 'P', '+/-', 'S', 'S%', 'PIM', 'TOI'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '8px 10px',
      textAlign: i ? 'center' : 'left',
      fontWeight: 600,
      ...ML,
      fontSize: 9
    }
  }, h)))), React.createElement("tbody", null, sd.skaters[ab].map((p, i) => React.createElement("tr", {
    key: i,
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '7px 10px',
      whiteSpace: 'nowrap'
    }
  }, React.createElement("span", {
    style: {
      color: T.ink
    }
  }, p.name), " ", React.createElement("span", {
    style: {
      color: T.faint,
      fontFamily: MONO,
      fontSize: 10
    }
  }, p.pos)), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO
    }
  }, p.g), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO
    }
  }, p.a), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      fontWeight: 700
    }
  }, p.p), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: p.pm >= 0 ? '#1a8a4f' : T.red
    }
  }, p.pm >= 0 ? '+' : '', p.pm), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.s), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.sp), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.pim), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      color: T.mut
    }
  }, p.toi)))))), (() => {
    const g = sd.goalie[ab];
    return React.createElement("div", {
      style: {
        padding: '11px 15px',
        borderTop: `2px solid ${T.line2}`,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6,
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut
      }
    }, React.createElement("span", {
      style: {
        color: T.ink,
        fontWeight: 600
      }
    }, g.name, " ", React.createElement("span", {
      style: {
        color: T.faint,
        fontWeight: 400
      }
    }, "G")), React.createElement("span", null, g.w, "-", g.l, " \xB7 ", g.svp, " SV% \xB7 ", g.gaa, " GAA \xB7 ", g.saves, "/", g.sf, " sv \xB7 ", g.so, " SO"));
  })());
  return React.createElement("div", null, React.createElement("button", {
    onClick: onBack,
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: '0 0 16px'
    }
  }, "\u2190 back to bracket"), React.createElement("div", {
    style: {
      ...card,
      padding: '20px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      textAlign: 'center',
      marginBottom: 14
    }
  }, sd.done ? 'Series result' : 'Series', " \xB7 ", sd.status), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement(TH, {
    ab: hiAb,
    score: hiW,
    win: hiW >= loW
  }), React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 16,
      color: T.faint
    }
  }, "vs"), React.createElement(TH, {
    ab: loAb,
    score: loW,
    win: loW > hiW
  })), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 18
    }
  }, sd.games.map(g => {
    const hw = g.winner === 'hi';
    return React.createElement("div", {
      key: g.game,
      onClick: () => setGm(g.game),
      className: "ec",
      style: {
        border: `1px solid ${T.line2}`,
        borderRadius: 9,
        padding: '7px 11px',
        textAlign: 'center',
        minWidth: 62,
        cursor: 'pointer'
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        fontSize: 9,
        marginBottom: 3
      }
    }, "Game ", g.game), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 13.5,
        fontWeight: 700,
        color: T.ink
      }
    }, React.createElement("span", {
      style: {
        color: hw ? c2(hiAb) : T.mut
      }
    }, g.hs), React.createElement("span", {
      style: {
        color: T.faint
      }
    }, "\u2013"), React.createElement("span", {
      style: {
        color: !hw ? c2(loAb) : T.mut
      }
    }, g.ls)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 8.5,
        color: T.faint
      }
    }, g.ot ? 'OT' : `${hw ? hiAb : loAb}`));
  })), React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 10,
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, "tap a game for its box score")), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, ['Team stats', 'Skaters', 'Goalies', 'Shot map', 'Edge'].map(s => React.createElement(Pill, {
    key: s,
    on: tab === s,
    onClick: () => setTab(s)
  }, s))), tab === 'Team stats' && React.createElement("div", {
    style: {
      ...card,
      padding: '8px 18px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0 4px',
      fontFamily: MONO,
      fontSize: 12
    }
  }, React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement(Badge, {
    ab: hiAb,
    size: 20
  }), hiAb), React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, loAb, React.createElement(Badge, {
    ab: loAb,
    size: 20
  }))), React.createElement(Sub, null, "Scoring"), React.createElement(Cmp, {
    label: "Goals",
    a: th.goals,
    b: to.goals
  }), React.createElement(Cmp, {
    label: "Even-strength goals",
    a: th.esg,
    b: to.esg
  }), React.createElement(Cmp, {
    label: "Power-play goals",
    a: th.ppg,
    b: to.ppg
  }), React.createElement(Cmp, {
    label: "Short-handed goals",
    a: th.shg,
    b: to.shg
  }), React.createElement(Cmp, {
    label: "Shooting %",
    a: shotPct(th),
    b: shotPct(to),
    fmt: v => v + '%'
  }), React.createElement(Sub, null, "Chances & possession"), React.createElement(Cmp, {
    label: "Shots on goal",
    a: th.shots,
    b: to.shots
  }), React.createElement(Cmp, {
    label: "High-danger chances",
    a: th.hd,
    b: to.hd
  }), React.createElement(Cmp, {
    label: "Expected goals (xG)",
    a: th.xg,
    b: to.xg,
    fmt: v => v.toFixed(1)
  }), React.createElement(Cmp, {
    label: "Faceoff %",
    a: th.fo,
    b: to.fo,
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Takeaways",
    a: th.take,
    b: to.take
  }), React.createElement(Cmp, {
    label: "Giveaways",
    a: th.give,
    b: to.give,
    hiBetter: false
  }), React.createElement(Sub, null, "Special teams & discipline"), React.createElement(Cmp, {
    label: "Power play %",
    a: pp(th),
    b: pp(to),
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Penalty kill %",
    a: th.pk,
    b: to.pk,
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Hits",
    a: th.hits,
    b: to.hits
  }), React.createElement(Cmp, {
    label: "Blocked shots",
    a: th.blk,
    b: to.blk
  }), React.createElement(Cmp, {
    label: "Penalty minutes",
    a: th.pim,
    b: to.pim,
    hiBetter: false
  }), React.createElement(Sub, null, "Goaltending"), React.createElement(Cmp, {
    label: "Save %",
    a: svp(th, to),
    b: svp(to, th),
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "PDO",
    a: pdo(th, to),
    b: pdo(to, th),
    fmt: v => v.toFixed(1)
  }), React.createElement(Sub, null, "Goals by period"), React.createElement("div", {
    className: "ed-scrollx ed-stickcol",
    style: {
      overflowX: 'auto',
      marginTop: 6
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
      fontFamily: MONO
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['', '1st', '2nd', '3rd', 'OT', 'Total'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '7px 8px',
      textAlign: i ? 'center' : 'left',
      fontWeight: 600,
      ...ML,
      fontSize: 9.5
    }
  }, h)))), React.createElement("tbody", null, [hiAb, loAb].map(ab => {
    const pg = sd.periods[ab];
    const tot = pg.reduce((s, v) => s + v, 0);
    return React.createElement("tr", {
      key: ab,
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 18
    }), ab), pg.map((v, i) => React.createElement("td", {
      key: i,
      style: {
        textAlign: 'center',
        color: v ? T.ink : T.faint
      }
    }, v)), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontWeight: 700
      }
    }, tot));
  }))))), tab === 'Skaters' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    },
    className: "g2"
  }, React.createElement(LCard, {
    ab: hiAb
  }), React.createElement(LCard, {
    ab: loAb
  })), tab === 'Goalies' && (() => {
    const gh = sd.goalie[hiAb],
      go = sd.goalie[loAb];
    const GH = ({
      ab,
      g,
      win
    }) => React.createElement("div", {
      onClick: () => onTeam(ab),
      className: "el",
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        cursor: 'pointer',
        flex: 1,
        opacity: win ? 1 : 0.7
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 34
    }), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: T.ink,
        textAlign: 'center'
      }
    }, g.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut
      }
    }, g.w, "-", g.l, " \xB7 ", g.gp, " GP"), React.createElement("span", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 30,
        lineHeight: 1,
        color: win ? c2(ab) : T.faint
      }
    }, g.svp), React.createElement("span", {
      style: {
        ...ML,
        fontSize: 9
      }
    }, "save %"));
    const gWin = gh.svpN >= go.svpN;
    return React.createElement("div", {
      style: {
        ...card,
        padding: '18px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6
      }
    }, React.createElement(GH, {
      ab: hiAb,
      g: gh,
      win: gWin
    }), React.createElement("span", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 15,
        color: T.faint
      }
    }, "vs"), React.createElement(GH, {
      ab: loAb,
      g: go,
      win: !gWin
    })), React.createElement(Sub, null, "Workload"), React.createElement(Cmp, {
      label: "Saves",
      a: gh.saves,
      b: go.saves
    }), React.createElement(Cmp, {
      label: "Shots against",
      a: gh.sf,
      b: go.sf
    }), React.createElement(Cmp, {
      label: "Shots against / game",
      a: gh.sapg,
      b: go.sapg
    }), React.createElement(Cmp, {
      label: "Goals against",
      a: gh.ga,
      b: go.ga,
      hiBetter: false
    }), React.createElement(Cmp, {
      label: "Goals-against average",
      a: gh.gaa,
      b: go.gaa,
      fmt: v => v.toFixed(2),
      hiBetter: false
    }), React.createElement(Sub, null, "Save % by danger"), React.createElement(Cmp, {
      label: "Overall SV%",
      a: gh.svpN,
      b: go.svpN,
      fmt: v => v + '%'
    }), React.createElement(Cmp, {
      label: "Even-strength SV%",
      a: gh.essv,
      b: go.essv,
      fmt: v => v + '%'
    }), React.createElement(Cmp, {
      label: "High-danger SV%",
      a: gh.hdsv,
      b: go.hdsv,
      fmt: v => v + '%'
    }), React.createElement(Cmp, {
      label: "Mid-danger SV%",
      a: gh.mdsv,
      b: go.mdsv,
      fmt: v => v + '%'
    }), React.createElement(Cmp, {
      label: "Low-danger SV%",
      a: gh.ldsv,
      b: go.ldsv,
      fmt: v => v + '%'
    }), React.createElement(Sub, null, "Value"), React.createElement(Cmp, {
      label: "Goals saved above expected",
      a: gh.gsax,
      b: go.gsax,
      fmt: v => (v >= 0 ? '+' : '') + v.toFixed(1)
    }), React.createElement(Cmp, {
      label: "Quality starts",
      a: gh.qs,
      b: go.qs
    }), React.createElement(Cmp, {
      label: "Shutouts",
      a: gh.so,
      b: go.so
    }));
  })(), tab === 'Shot map' && window.E_ShotMap && (() => {
    const tabs = [{
      key: 'series',
      label: 'Full series'
    }, ...sd.games.map(gg => ({
      key: String(gg.game),
      label: `Game ${gg.game}`
    }))];
    let g;
    if (shotGame === 'series') {
      g = {
        id: `po-${hiAb}-${loAb}-series`,
        st: 'pre',
        a: loAb,
        h: hiAb,
        sa: to.shots,
        sh: th.shots,
        as: to.goals,
        hs: th.goals
      };
    } else {
      const gn = +shotGame,
        gd = D.gameDetail(hiAb, loAb, hiW, loW, gn),
        homeAb = gd.home === 'hi' ? hiAb : loAb,
        awayAb = gd.home === 'hi' ? loAb : hiAb;
      g = {
        id: `po-${hiAb}-${loAb}-${gn}`,
        st: 'pre',
        a: awayAb,
        h: homeAb,
        sa: gd.team[awayAb].shots,
        sh: gd.team[homeAb].shots,
        as: gd.team[awayAb].goals,
        hs: gd.team[homeAb].goals
      };
    }
    return React.createElement(window.E_ShotMap, {
      g: g,
      gameTabs: tabs,
      activeGame: shotGame,
      onGame: setShotGame
    });
  })(), tab === 'Edge' && React.createElement("div", {
    style: {
      ...card,
      padding: '8px 18px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0 4px',
      fontFamily: MONO,
      fontSize: 12
    }
  }, React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement(Badge, {
    ab: hiAb,
    size: 20
  }), hiAb), React.createElement("span", {
    style: {
      ...ML,
      fontSize: 9.5,
      alignSelf: 'center'
    }
  }, "NHL Edge \xB7 series"), React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, loAb, React.createElement(Badge, {
    ab: loAb,
    size: 20
  }))), React.createElement(Sub, null, "Skating"), React.createElement(Cmp, {
    label: "Top skating speed",
    a: eh.topSkate,
    b: eo.topSkate,
    fmt: v => v + ' mph'
  }), React.createElement(Cmp, {
    label: "Avg skating speed",
    a: eh.avgSkate,
    b: eo.avgSkate,
    fmt: v => v + ' mph'
  }), React.createElement(Cmp, {
    label: "20+ mph bursts",
    a: eh.burst20,
    b: eo.burst20
  }), React.createElement(Cmp, {
    label: "22+ mph bursts",
    a: eh.burst22,
    b: eo.burst22
  }), React.createElement(Cmp, {
    label: "Skating distance",
    a: eh.dist,
    b: eo.dist,
    fmt: v => v + ' mi'
  }), React.createElement(Sub, null, "Shooting"), React.createElement(Cmp, {
    label: "Top shot speed",
    a: eh.topShot,
    b: eo.topShot,
    fmt: v => v + ' mph'
  }), React.createElement(Cmp, {
    label: "Avg shot speed",
    a: eh.avgShot,
    b: eo.avgShot,
    fmt: v => v + ' mph'
  }), React.createElement(Cmp, {
    label: "Shots 90+ mph",
    a: eh.shot90,
    b: eo.shot90
  }), React.createElement(Cmp, {
    label: "Shots 100+ mph",
    a: eh.shot100,
    b: eo.shot100
  }), React.createElement(Sub, null, "Zone & entries"), React.createElement(Cmp, {
    label: "O-zone time",
    a: eh.oz,
    b: eo.oz,
    fmt: v => v + '%'
  }), React.createElement(Cmp, {
    label: "Time on attack / gm",
    a: eh.toa,
    b: eo.toa
  }), React.createElement(Cmp, {
    label: "Controlled entries",
    a: eh.entries,
    b: eo.entries
  })));
}
function PlayoffsPage({
  onTeam
}) {
  const bMock = uM(() => D.playoffBracket(), []);
  const b = window.E_useLive(bMock, () => window.NHL.playoffFull(), [], 'playoffFull');
  const [sel, setSel] = uS(null);
  const [pview, setPview] = uS(() => {
    try {
      return localStorage.getItem('e_pview') || 'rink';
    } catch (e) {
      return 'rink';
    }
  });
  const dragRef = React.useRef({
    down: false,
    x: 0,
    sl: 0
  });
  const choosePview = v => {
    try {
      localStorage.setItem('e_pview', v);
    } catch (e) {}
    setPview(v);
  };
  const open = s => {
    if (s && s.hi && s.lo) setSel({
      hiAb: s.hi.ab,
      loAb: s.lo.ab,
      hiW: s.hiW,
      loW: s.loW
    });
  };
  if (sel) return React.createElement(SeriesDetail, _extends({}, sel, {
    onBack: () => setSel(null),
    onTeam: onTeam
  }));
  const Series = ({
    s,
    size
  }) => {
    if (!s || !s.hi) return React.createElement("div", {
      style: {
        height: size || 54
      }
    });
    const hiW = s.hiW >= s.loW;
    const Team = ({
      t,
      win,
      w
    }) => React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px 8px 11px',
        position: 'relative'
      }
    }, React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: win ? c2(t.ab) : 'transparent'
      }
    }), React.createElement(Badge, {
      ab: t.ab,
      size: 18
    }), React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 12.5,
        fontWeight: win ? 700 : 500,
        color: win ? T.ink : T.mut,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, t.ab), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12.5,
        fontWeight: win ? 700 : 400,
        color: win ? T.ink : T.faint
      }
    }, w));
    return React.createElement("div", {
      onClick: () => open(s),
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden',
        width: '100%',
        cursor: 'pointer'
      }
    }, React.createElement(Team, {
      t: s.hi,
      win: hiW,
      w: s.hiW
    }), React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }), React.createElement(Team, {
      t: s.lo,
      win: !hiW,
      w: s.loW
    }));
  };
  const Col = ({
    title,
    list,
    align
  }) => React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      textAlign: align || 'center',
      marginBottom: 10,
      fontSize: 9.5,
      whiteSpace: 'nowrap'
    }
  }, title), React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      gap: 12
    }
  }, list.map((s, i) => React.createElement(Series, {
    key: i,
    s: s
  }))));
  const f = b.final;
  const fHiW = f.hiW >= f.loW;
  const FinalRow = ({
    t,
    win,
    w
  }) => {
    const gold = T.mode === 'dark' ? '#cda85a' : '#9a7c2a';
    return React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 12px',
        position: 'relative'
      }
    }, React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: win ? c2(t.ab) : 'transparent'
      }
    }), React.createElement(Badge, {
      ab: t.ab,
      size: 22
    }), React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: win ? 700 : 500,
        fontSize: 13.5,
        color: win ? T.ink : T.mut,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, ct(t.ab)), win && React.createElement("span", {
      title: "Champion",
      style: {
        color: gold,
        fontSize: 13,
        lineHeight: 1
      }
    }, "\u2605"), React.createElement("span", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 22,
        lineHeight: 1,
        color: win ? T.ink : T.faint,
        minWidth: 16,
        textAlign: 'right'
      }
    }, w));
  };
  const CupCol = () => {
    const gold = T.mode === 'dark' ? '#cda85a' : '#9a7c2a';
    return React.createElement("div", {
      style: {
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, React.createElement("div", {
      onClick: () => open(f),
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 18px 42px -18px rgba(0,0,0,.42)'
      }
    }, React.createElement("div", {
      style: {
        height: 3,
        background: 'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)'
      }
    }), React.createElement("div", {
      style: {
        ...ML,
        textAlign: 'center',
        color: gold,
        padding: '11px 0 9px',
        fontSize: 9
      }
    }, "Stanley Cup Final"), React.createElement(FinalRow, {
      t: f.hi,
      win: fHiW,
      w: f.hiW
    }), React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }), React.createElement(FinalRow, {
      t: f.lo,
      win: !fHiW,
      w: f.loW
    })));
  };
  const RinkView = () => {
    const dark = T.mode === 'dark';
    const bl = '#2552c4';
    const onDown = e => {
      dragRef.current = {
        down: true,
        x: e.clientX,
        sl: e.currentTarget.scrollLeft
      };
      e.currentTarget.style.cursor = 'grabbing';
    };
    const onMove = e => {
      const d = dragRef.current;
      if (d.down) e.currentTarget.scrollLeft = d.sl - (e.clientX - d.x);
    };
    const onUp = e => {
      dragRef.current.down = false;
      e.currentTarget.style.cursor = 'grab';
    };
    return React.createElement("div", {
      style: {
        width: '94vw',
        maxWidth: 1380,
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        ...card,
        padding: 0,
        overflow: 'hidden',
        marginBottom: 18
      }
    }, React.createElement("div", {
      onMouseDown: onDown,
      onMouseMove: onMove,
      onMouseUp: onUp,
      onMouseLeave: onUp,
      style: {
        overflowX: 'auto',
        overflowY: 'hidden',
        cursor: 'grab',
        WebkitOverflowScrolling: 'touch'
      }
    }, React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        minWidth: 1280,
        height: 'min(660px,58vw)'
      }
    }, React.createElement("svg", {
      viewBox: "0 0 1140 640",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }
    }, React.createElement("defs", null, React.createElement("linearGradient", {
      id: "rkice",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, React.createElement("stop", {
      offset: "0",
      stopColor: dark ? '#141b27' : '#f1f5fc'
    }), React.createElement("stop", {
      offset: "1",
      stopColor: dark ? '#0f141d' : '#e9f0f9'
    }))), React.createElement("rect", {
      x: "8",
      y: "8",
      width: "1124",
      height: "624",
      rx: "74",
      fill: "url(#rkice)",
      stroke: T.line2,
      strokeWidth: "1.5"
    }), React.createElement("g", {
      opacity: "0.5"
    }, React.createElement("line", {
      x1: "570",
      y1: "12",
      x2: "570",
      y2: "628",
      stroke: T.red,
      strokeOpacity: "0.32",
      strokeWidth: "3"
    }), React.createElement("line", {
      x1: "400",
      y1: "12",
      x2: "400",
      y2: "628",
      stroke: bl,
      strokeOpacity: "0.3",
      strokeWidth: "6"
    }), React.createElement("line", {
      x1: "740",
      y1: "12",
      x2: "740",
      y2: "628",
      stroke: bl,
      strokeOpacity: "0.3",
      strokeWidth: "6"
    }), React.createElement("circle", {
      cx: "570",
      cy: "320",
      r: "124",
      fill: bl,
      fillOpacity: dark ? "0.08" : "0.05",
      stroke: bl,
      strokeOpacity: "0.3",
      strokeWidth: "2.5"
    }), React.createElement("circle", {
      cx: "570",
      cy: "320",
      r: "5",
      fill: T.red,
      fillOpacity: "0.4"
    }), React.createElement("line", {
      x1: "74",
      y1: "12",
      x2: "74",
      y2: "628",
      stroke: T.red,
      strokeOpacity: "0.26",
      strokeWidth: "2"
    }), React.createElement("line", {
      x1: "1066",
      y1: "12",
      x2: "1066",
      y2: "628",
      stroke: T.red,
      strokeOpacity: "0.26",
      strokeWidth: "2"
    }), React.createElement("path", {
      d: "M74 290 a32 32 0 0 1 0 60",
      fill: bl,
      fillOpacity: "0.1",
      stroke: T.red,
      strokeOpacity: "0.3",
      strokeWidth: "2"
    }), React.createElement("path", {
      d: "M1066 290 a32 32 0 0 0 0 60",
      fill: bl,
      fillOpacity: "0.1",
      stroke: T.red,
      strokeOpacity: "0.3",
      strokeWidth: "2"
    }), [[180, 210], [180, 430], [960, 210], [960, 430]].map(([cx, cy], i) => React.createElement("g", {
      key: i
    }, React.createElement("circle", {
      cx: cx,
      cy: cy,
      r: "50",
      fill: "none",
      stroke: T.red,
      strokeOpacity: "0.18",
      strokeWidth: "2"
    }), React.createElement("circle", {
      cx: cx,
      cy: cy,
      r: "3.5",
      fill: T.red,
      fillOpacity: "0.32"
    }))), [[440, 210], [440, 430], [700, 210], [700, 430]].map(([cx, cy], i) => React.createElement("circle", {
      key: i,
      cx: cx,
      cy: cy,
      r: "4",
      fill: bl,
      fillOpacity: "0.3"
    })))), [{
      x: 105,
      title: 'Round 1',
      list: b.east.r1
    }, {
      x: 250,
      title: 'Round 2',
      list: b.east.r2
    }, {
      x: 395,
      title: 'East Final',
      list: b.east.cf
    }, {
      x: 745,
      title: 'West Final',
      list: b.west.cf
    }, {
      x: 890,
      title: 'Round 2',
      list: b.west.r2
    }, {
      x: 1035,
      title: 'Round 1',
      list: b.west.r1
    }].map((c, ci) => React.createElement("div", {
      key: ci,
      style: {
        position: 'absolute',
        top: '3%',
        bottom: '3%',
        left: `${c.x / 1140 * 100}%`,
        transform: 'translateX(-50%)',
        width: 128,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        fontSize: 9,
        whiteSpace: 'nowrap',
        color: T.mut,
        background: T.mode === 'dark' ? 'rgba(28,29,35,.7)' : 'rgba(255,255,255,.72)',
        border: `1px solid ${T.line}`,
        borderRadius: 999,
        padding: '3px 11px',
        marginBottom: 11,
        backdropFilter: 'blur(3px)'
      }
    }, c.title), React.createElement("div", {
      style: {
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        gap: 11
      }
    }, c.list.map((s, i) => React.createElement(Series, {
      key: i,
      s: s
    }))))), React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${570 / 1140 * 100}%`,
        transform: 'translateX(-50%)',
        width: 196,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, React.createElement(CupCol, null)))), React.createElement("div", {
      style: {
        padding: '9px 16px',
        borderTop: `1px solid ${T.line}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint
      }
    }, React.createElement("span", {
      style: {
        color: c2(b.east.champ.ab),
        fontWeight: 600
      }
    }, "\u25C4 Eastern"), React.createElement("span", null, "drag to pan \xB7 tap a series for its detail"), React.createElement("span", {
      style: {
        color: c2(b.west.champ.ab),
        fontWeight: 600
      }
    }, "Western \u25BA")));
  };
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Playoffs",
    t: "Stanley Cup",
    serif: "bracket",
    right: React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, [['bracket', 'Bracket'], ['rink', 'On the rink']].map(([k, l]) => React.createElement(Pill, {
      key: k,
      on: pview === k,
      onClick: () => choosePview(k)
    }, l)))
  }), (() => {
    const decided = b.final && (b.final.hiW >= 4 || b.final.loW >= 4);
    const champ = b.cup.ab;
    const opp = decided ? b.final.hi.ab === champ ? b.final.lo : b.final.hi : null;
    const champW = decided ? Math.max(b.final.hiW, b.final.loW) : 0,
      oppW = decided ? Math.min(b.final.hiW, b.final.loW) : 0;
    const sid = window.NHL && window.NHL._season ? String(window.NHL._season) : window.BC && window.BC._seasonId || '';
    const yr = sid.length === 8 ? sid.slice(4, 8) : '';
    const gold = T.mode === 'dark' ? '#cda85a' : '#9a7c2a';
    if (decided) {
      const titles = (D.teamTitles ? D.teamTitles(champ) : {
        stanleyCups: []
      }) || {
        stanleyCups: []
      };
      const prevCups = (titles.stanleyCups || []).filter(y => String(y) !== String(yr));
      const tro = D.recordTrophiesList ? D.recordTrophiesList() : [];
      const cs = tro.find(t => /Conn Smythe/i.test(t.name));
      const smythe = cs && String(cs.year) === String(yr) ? cs.winner : null;
      const chip = {
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '.04em',
        color: gold,
        background: T.mode === 'dark' ? 'rgba(202,162,78,.14)' : 'rgba(202,162,78,.12)',
        border: `1px solid ${T.mode === 'dark' ? 'rgba(202,162,78,.35)' : '#e8dcb4'}`,
        borderRadius: 999,
        padding: '3px 9px'
      };
      return React.createElement("div", {
        style: {
          ...card,
          padding: '20px 22px',
          marginBottom: 18,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(110deg, ${c2(champ)}22, ${T.mode === 'dark' ? 'rgba(202,162,78,.12)' : 'rgba(240,221,156,.4)'} 55%, transparent)`,
          border: `1px solid ${T.mode === 'dark' ? 'rgba(202,162,78,.42)' : '#e8dcb4'}`
        }
      }, React.createElement("div", {
        style: {
          height: 3,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)',
          zIndex: 2
        }
      }), React.createElement("div", {
        className: "champ-shine",
        style: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-50%',
          width: '45%',
          background: 'linear-gradient(105deg,transparent,rgba(255,255,255,.4),transparent)',
          pointerEvents: 'none',
          zIndex: 1
        }
      }), React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
          zIndex: 2
        }
      }, React.createElement(Badge, {
        ab: champ,
        size: 52
      }), React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, React.createElement("div", {
        style: {
          ...ML,
          color: gold,
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, React.createElement("span", {
        style: {
          fontSize: 14
        }
      }, "\uD83C\uDFC6"), yr ? `${yr} ` : '', "Stanley Cup Champions"), React.createElement("div", {
        style: {
          fontFamily: SERIF,
          fontSize: 27,
          fontStyle: 'italic',
          color: T.ink,
          marginTop: 3
        }
      }, ct(champ), " ", nk(champ)), opp && React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 11.5,
          color: T.mut,
          marginTop: 4
        }
      }, "defeated ", ct(opp.ab), " ", nk(opp.ab), " ", champW, "\u2013", oppW, " in the Final"), React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 10,
          alignItems: 'center'
        }
      }, smythe && React.createElement("span", {
        style: chip
      }, "Conn Smythe \xB7 ", smythe), titles.stanleyCups.some(y => String(y) === String(yr)) && React.createElement("span", {
        style: chip
      }, "Cup #", titles.stanleyCups.length, " in franchise history"), prevCups.length > 0 ? React.createElement("span", {
        style: chip
      }, "Previous \xB7 ", prevCups.slice(0, 6).join(' · '), prevCups.length > 6 ? ' …' : '') : React.createElement("span", {
        style: chip
      }, "First Stanley Cup in franchise history")))), React.createElement("style", null, `@keyframes champShine{0%{left:-50%}60%,100%{left:120%}}@media(prefers-reduced-motion:no-preference){.champ-shine{animation:champShine 5s ease-in-out infinite}}`));
    }
    return React.createElement("div", {
      style: {
        ...card,
        padding: '18px 20px',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: `linear-gradient(110deg, ${c2(champ)}12, transparent)`
      }
    }, React.createElement(Badge, {
      ab: champ,
      size: 44
    }), React.createElement("div", null, React.createElement("div", {
      style: ML
    }, "Projected Cup champion"), React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontSize: 24,
        fontStyle: 'italic',
        color: T.ink,
        marginTop: 2
      }
    }, ct(champ), " ", nk(champ))));
  })(), pview === 'bracket' && React.createElement("div", {
    style: {
      ...card,
      padding: '18px 14px 22px',
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: {
      ...ML,
      fontSize: 11,
      color: c2(b.east.champ.ab)
    }
  }, "Eastern Conference"), React.createElement("span", {
    style: {
      ...ML,
      fontSize: 11,
      color: c2(b.west.champ.ab)
    }
  }, "Western Conference")), React.createElement("div", {
    className: "brkt",
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'stretch',
      minHeight: 430
    }
  }, React.createElement(Col, {
    title: "Round 1",
    list: b.east.r1,
    align: "left"
  }), React.createElement(Col, {
    title: "Round 2",
    list: b.east.r2
  }), React.createElement(Col, {
    title: "East Final",
    list: b.east.cf
  }), React.createElement("div", {
    style: {
      width: 1,
      background: T.line,
      margin: '24px 4px 0'
    }
  }), React.createElement(Col, {
    title: "West Final",
    list: b.west.cf
  }), React.createElement(Col, {
    title: "Round 2",
    list: b.west.r2
  }), React.createElement(Col, {
    title: "Round 1",
    list: b.west.r1,
    align: "right"
  })), React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 6
    }
  }, React.createElement("div", {
    style: {
      width: 1.5,
      height: 24,
      background: T.line2
    }
  }), React.createElement("div", {
    onClick: () => open(f),
    className: "ec",
    style: {
      ...card,
      overflow: 'hidden',
      width: 'min(380px,100%)',
      cursor: 'pointer',
      boxShadow: '0 18px 42px -18px rgba(0,0,0,.42)'
    }
  }, React.createElement("div", {
    style: {
      height: 3,
      background: 'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)'
    }
  }), React.createElement("div", {
    style: {
      ...ML,
      textAlign: 'center',
      color: T.mode === 'dark' ? '#cda85a' : '#9a7c2a',
      padding: '12px 0 9px'
    }
  }, "Stanley Cup Final"), React.createElement(FinalRow, {
    t: f.hi,
    win: fHiW,
    w: f.hiW
  }), React.createElement("div", {
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }), React.createElement(FinalRow, {
    t: f.lo,
    win: !fHiW,
    w: f.loW
  })))), pview === 'rink' && React.createElement(RinkView, null), React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, "Play-in race \xB7 the bubble"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    },
    className: "g2"
  }, [['East', 'Eastern'], ['West', 'Western']].map(([cf, lab]) => React.createElement("div", {
    key: cf,
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      fontSize: 14,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, lab, " \xB7 seeds 7\u201310"), D.playInRace(cf).map((t, i) => React.createElement("div", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      width: 18,
      color: i < 2 ? '#1a8a4f' : T.faint
    }
  }, i + 7), React.createElement(Badge, {
    ab: t.ab,
    size: 20
  }), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: T.ink
    }
  }, ct(t.ab), " ", nk(t.ab)), i < 2 && React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: '#1a8a4f',
      background: '#e7f5ec',
      padding: '2px 7px',
      borderRadius: 5
    }
  }, "WC", i + 1), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontWeight: 700,
      marginLeft: 8
    }
  }, t.pts)))))), React.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 18,
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "projected from current standings \xB7 live via /api/nhl/playoff-bracket"), React.createElement("style", null, `@media(max-width:680px){.g2{grid-template-columns:1fr!important}.brkt{overflow-x:auto;gap:10px!important}.brkt>div{min-width:104px!important}}`));
}
function RecordsPage({
  onTeam
}) {
  const [tab, setTab] = uS('All-time leaders');
  const recMock = uM(() => ({
    skaters: D.recordSkaters(),
    goalies: D.recordGoalies()
  }), []);
  const rec = window.E_useLive(recMock, () => window.NHL.recordsAllTime().then(r => r ? {
    ...recMock,
    ...r
  } : null), [], 'recordsMerged');
  const skaters = rec.skaters;
  const goalies = rec.goalies;
  const trophies = window.E_useLive(uM(() => D.recordTrophiesList(), []), () => window.NHL && window.NHL.awardsMapped ? window.NHL.awardsMapped() : null, [], 'awards');
  const franchise = D.recordFranchiseList();
  const season = D.recordSeason();
  const watch = window.E_useLive(uM(() => D.milestoneWatch(), []), () => window.NHL && window.NHL.milestonesMapped ? window.NHL.milestonesMapped() : null, [], 'milestones');
  const reports = D.statsReports();
  const [scope, setScope] = uS('skater');
  const [leadScope, setLeadScope] = uS('skater');
  const [frSort, setFrSort] = uS('wins');
  const [recTeam, setRecTeam] = uS('TOR');
  const teamsAZ = uM(() => [...D.ABBR].sort((a, b) => ct(a).localeCompare(ct(b))), []);
  const tRec = uM(() => D.teamRecords(recTeam), [recTeam]);
  const tTitles = uM(() => D.teamTitles(recTeam), [recTeam]);
  const streaks = D.recordStreaks();
  const leaders = leadScope === 'skater' ? skaters : goalies;
  const franchRows = franchise;
  const tabs = ['All-time leaders', 'Single season', 'Records by team', 'Streaks & feats', 'Trophies', 'Milestone watch', 'Franchise', 'Stat explorer'];
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Records",
    t: "The record",
    serif: "book"
  }), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, tabs.map(s => React.createElement(Pill, {
    key: s,
    on: tab === s,
    onClick: () => setTab(s)
  }, s))), tab === 'All-time leaders' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, ['skater', 'goalie'].map(s => React.createElement(Pill, {
    key: s,
    on: leadScope === s,
    onClick: () => setLeadScope(s)
  }, s === 'skater' ? 'Skaters' : 'Goalies'))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
      gap: 14
    }
  }, leaders.map(c => React.createElement("div", {
    key: c.cat,
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 15px',
      fontSize: 13,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, c.cat), c.rows.map((p, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 15px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      background: i === 0 ? T.goldBg : 'transparent'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: i === 0 ? T.goldFg : T.faint,
      width: 14,
      fontWeight: i === 0 ? 700 : 400
    }
  }, i + 1), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      color: T.ink,
      fontWeight: i === 0 ? 600 : 400
    }
  }, p.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontWeight: 700
    }
  }, p.v.toLocaleString()))))))), tab === 'Single season' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14
    }
  }, season.map(rec => React.createElement("div", {
    key: rec.label,
    style: {
      ...card,
      padding: '16px 17px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8
    }
  }, React.createElement("span", {
    style: ML
  }, rec.label), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 9.5,
      color: rec.kind === 'goalie' ? '#2a6f9e' : '#9a6b1a',
      background: rec.kind === 'goalie' ? '#eaf2f8' : '#fdf6e6',
      border: `1px solid ${rec.kind === 'goalie' ? '#cfe0ee' : '#f0e2c0'}`,
      borderRadius: 5,
      padding: '1px 5px'
    }
  }, rec.kind)), React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: '-.02em',
      color: T.ink,
      margin: '6px 0 2px'
    }
  }, rec.v), React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: T.ink
    }
  }, rec.holder), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, rec.season)))), tab === 'Records by team' && React.createElement("div", null, React.createElement("div", {
    style: {
      ...card,
      padding: 16,
      marginBottom: 16,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Club record book"), React.createElement("select", {
    value: recTeam,
    onChange: e => setRecTeam(e.target.value),
    style: {
      fontFamily: 'inherit',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 9,
      padding: '8px 12px',
      color: T.ink,
      fontSize: 13
    }
  }, teamsAZ.map(a => React.createElement("option", {
    key: a,
    value: a
  }, ct(a), " ", nk(a)))), React.createElement("span", {
    style: {
      flex: 1
    }
  }), React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: recTeam,
    size: 26
  }), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, tTitles.stanleyCups.length, " Cups \xB7 ", tTitles.presidents.length, " Presidents'"))), [['Career leaders', tRec.career], ['Single season', tRec.season]].map(([lab, cats]) => React.createElement("div", {
    key: lab,
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, lab), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14
    }
  }, cats.map(c => React.createElement("div", {
    key: c.cat,
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '11px 15px',
      fontSize: 13,
      fontWeight: 600,
      borderBottom: `1px solid ${T.line}`
    }
  }, c.cat), c.rows.map((p, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 15px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      background: i === 0 ? `linear-gradient(90deg,${c2(recTeam)}14,transparent)` : 'transparent'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: i === 0 ? c2(recTeam) : T.faint,
      width: 13,
      fontWeight: i === 0 ? 700 : 400
    }
  }, i + 1), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      color: T.ink,
      fontWeight: i === 0 ? 600 : 400
    }
  }, p.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontWeight: 700
    }
  }, p.v.toLocaleString()))))))))), tab === 'Streaks & feats' && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement("span", null, "League streaks & single-game feats"), React.createElement("span", {
    style: {
      color: T.faint
    }
  }, "all-time")), streaks.map((s, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 14,
      padding: '13px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("div", {
    style: {
      textAlign: 'center',
      width: 58,
      flexShrink: 0
    }
  }, React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 26,
      lineHeight: 1,
      color: T.red
    }
  }, s.v), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: T.faint
    }
  }, s.unit)), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: T.ink,
      fontSize: 14
    }
  }, s.label), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, s.holder)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.faint
    }
  }, s.year)))), tab === 'Trophies' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
      gap: 14
    }
  }, trophies.map(t => React.createElement("div", {
    key: t.name,
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '15px 16px',
      borderBottom: `1px solid ${T.line}`
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 19,
      color: T.ink
    }
  }, t.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, t.desc)), React.createElement("div", {
    style: {
      marginTop: 9,
      fontSize: 15,
      fontWeight: 600
    }
  }, t.winner), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.red
    }
  }, t.year, " winner")), React.createElement("div", {
    style: {
      padding: '10px 16px 12px'
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 6
    }
  }, "Recent"), t.history.slice(1).map(h => React.createElement("div", {
    key: h.yr,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut,
      padding: '2.5px 0'
    }
  }, React.createElement("span", null, h.yr), React.createElement("span", {
    style: {
      color: T.ink,
      whiteSpace: 'nowrap'
    }
  }, h.name))))))), tab === 'Milestone watch' && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement("span", null, "Active players chasing career milestones"), React.createElement("span", {
    style: {
      color: T.faint
    }
  }, "closest first")), watch.map((m, i) => React.createElement("div", {
    key: m.id,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 13,
      padding: '13px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      background: c2(m.team),
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 12,
      fontWeight: 700
    }
  }, m.num || m.pos), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 600,
      color: T.ink,
      fontSize: 14
    }
  }, m.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, m.team, " \xB7 ", m.pos)), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 6
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      background: T.bg,
      overflow: 'hidden',
      minWidth: 80
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${m.pct}%`,
      background: c2(m.team)
    }
  })), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      whiteSpace: 'nowrap'
    }
  }, m.career.toLocaleString(), " / ", m.target.toLocaleString(), " ", m.stat))), React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: T.red,
      letterSpacing: '-.02em'
    }
  }, m.remaining), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 9.5,
      color: T.faint,
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "away"))))), tab === 'Franchise' && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Most Stanley Cups"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "all-time \xB7 ", franchise.length, " champion franchises")), React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['#', 'Team', 'Stanley Cups', 'Last Cup'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '10px 14px',
      textAlign: i < 2 ? 'left' : 'center',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, franchRows.map((t, i) => React.createElement("tr", {
    key: t.ab,
    onClick: () => onTeam(t.ab),
    className: "er",
    style: {
      cursor: 'pointer',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 14px',
      fontFamily: MONO,
      color: i < 3 ? T.red : T.faint,
      fontWeight: i < 3 ? 700 : 400
    }
  }, i + 1), React.createElement("td", {
    style: {
      padding: '9px 14px'
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9
    }
  }, React.createElement(Badge, {
    ab: t.ab,
    size: 22
  }), React.createElement("span", {
    style: {
      fontWeight: 600,
      color: T.ink
    }
  }, ct(t.ab), " ", nk(t.ab)))), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontWeight: 700,
      color: T.ink
    }
  }, t.cups), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut,
      fontFamily: MONO
    }
  }, t.last)))))), tab === 'Stat explorer' && React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 6
    }
  }, "NHL stats API \xB7 report catalog"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: T.mut,
      marginBottom: 14
    }
  }, "Every report the Stats API exposes (from its ", React.createElement("span", {
    style: {
      fontFamily: MONO
    }
  }, "config"), " endpoint). Each is queryable live via ", React.createElement("span", {
    style: {
      fontFamily: MONO
    }
  }, "/api/nhl/stats/", scope, "/", '{report}'), "."), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, ['skater', 'goalie', 'team'].map(s => React.createElement(Pill, {
    key: s,
    on: scope === s,
    onClick: () => setScope(s)
  }, s))), React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, reports[scope].map(r => React.createElement("span", {
    key: r,
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      padding: '5px 10px',
      borderRadius: 7,
      background: T.bg,
      border: `1px solid ${T.line}`,
      color: T.ink
    }
  }, r))), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      marginTop: 14
    }
  }, reports[scope].length, " ", scope, " reports available")));
}
function DraftPage({
  onTeam
}) {
  const NOW = new Date();
  const curDraftYear = NOW.getMonth() >= 9 ? NOW.getFullYear() + 1 : NOW.getFullYear();
  const years = uM(() => Array.from({
    length: 6
  }, (_, i) => curDraftYear - i), [curDraftYear]);
  const [year, setYear] = uS(curDraftYear);
  const isUpcoming = year >= curDraftYear;
  const [tab, setTab] = uS('Draft order');
  const [doView, setDoView] = uS('result');
  const [round, setRound] = uS(1);
  const draftMock = uM(() => ({
    rankings: D.draftRankings(),
    picks: D.draftPicks()
  }), []);
  const draftLive = window.E_useLive(draftMock, () => window.NHL.draftFull(curDraftYear), [curDraftYear], 'draftFull:' + curDraftYear);
  const [draftOverride, setDraftOverride] = uS(null);
  React.useEffect(() => {
    if (!isUpcoming) return;
    let alive = true;
    const pull = () => {
      if (!alive || !window.NHL || !window.BC || !window.BC.LIVE) return;
      window.NHL.draftFull(curDraftYear).then(d => {
        if (alive && d) {
          if (window.__E_LIVE) window.__E_LIVE['draftFull:' + curDraftYear] = d;
          setDraftOverride(d);
        }
      }).catch(() => {});
    };
    const iv = setInterval(pull, 30000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [isUpcoming, curDraftYear]);
  const draft = draftOverride || draftLive;
  const rankings = draft.rankings;
  const picks = draft.picks;
  const lotWinners = uM(() => {
    const w = (picks || []).filter(p => p.lotteryWin).map(p => p.team);
    return w.length ? w : D.lotteryWinners();
  }, [picks]);
  const pastMock = uM(() => D.draftPastYear(year), [year]);
  const past = window.E_useLive(pastMock, () => window.NHL.draftYear(year), [year]);
  const predicted = uM(() => {
    const rev = [...D.STANDINGS].slice().reverse();
    return rev.map((t, i) => ({
      pick: i + 1,
      team: t.ab,
      name: rankings[i] && rankings[i].name || 'TBD',
      pos: rankings[i] && rankings[i].pos || '',
      league: rankings[i] && rankings[i].league || '',
      made: false
    }));
  }, [rankings]);
  const [liveMade, setLiveMade] = uS(null);
  React.useEffect(() => {
    if (!isUpcoming) return;
    let alive = true;
    const pull = () => {
      if (window.NHL && window.BC && window.BC.LIVE && window.NHL.draftLiveTracker) window.NHL.draftLiveTracker().then(made => {
        if (alive && made && made.length) setLiveMade(made);
      }).catch(() => {});
    };
    pull();
    const unsub = window.BC && window.BC.LIVE && window.LiveSocket && window.LiveSocket.subscribe ? window.LiveSocket.subscribe('draft', pull) : null;
    const iv = tab === 'Live tracker' ? setInterval(pull, 20000) : null;
    return () => {
      alive = false;
      if (iv) clearInterval(iv);
      if (unsub) unsub();
    };
  }, [isUpcoming, tab, curDraftYear]);
  const rankLookup = uM(() => {
    const m = {};
    (rankings || []).forEach((r, i) => {
      if (r.name) m[r.name] = i + 1;
    });
    return m;
  }, [rankings]);
  const tracker = uM(() => {
    if (!liveMade || !liveMade.length) return predicted;
    const by = {};
    liveMade.forEach(m => {
      by[m.pick] = m;
    });
    return predicted.map(p => {
      if (!by[p.pick]) return p;
      const made = {
        ...p,
        ...by[p.pick],
        made: true
      };
      const csRank = rankLookup[made.name];
      made.csRank = csRank ?? null;
      made.diff = csRank != null ? csRank - made.pick : null;
      return made;
    });
  }, [predicted, liveMade, rankLookup]);
  const madeCount = tracker.filter(p => p.made).length;
  const upTabs = ['Draft order', 'Prospect rankings', 'Mock first round', 'Live tracker'];
  const [rankCat, setRankCat] = uS('All');
  const rankFiltered = uM(() => {
    const r = rankings || [];
    if (rankCat === 'North American') return r.filter(p => !p.intl);
    if (rankCat === 'International') return r.filter(p => p.intl);
    return r;
  }, [rankings, rankCat]);
  React.useEffect(() => {
    setTab(isUpcoming ? 'Draft order' : 'Results');
    setRound(1);
  }, [year, isUpcoming]);
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "Draft",
    t: `${year} NHL`,
    serif: "Draft"
  }), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, React.createElement("select", {
    value: year,
    onChange: e => setYear(+e.target.value),
    style: {
      fontFamily: 'inherit',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 9,
      padding: '8px 12px',
      color: T.ink,
      fontSize: 13.5,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, years.map(y => React.createElement("option", {
    key: y,
    value: y
  }, y, y >= curDraftYear ? ' · projected' : ''))), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, isUpcoming ? 'Upcoming draft — projected order & prospect board' : 'Completed draft — full results')), React.createElement("div", {
    key: 'y' + year
  }, isUpcoming && React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, upTabs.map(s => React.createElement(Pill, {
    key: s,
    on: tab === s,
    onClick: () => setTab(s)
  }, s))), tab === 'Prospect rankings' && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Central Scouting \xB7 prospect board"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, ['All', 'North American', 'International'].map(c => React.createElement(Pill, {
    key: c,
    on: rankCat === c,
    onClick: () => setRankCat(c)
  }, c)))), React.createElement("div", {
    className: "ed-scrollx",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 640,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['#', 'Prospect', 'Pos', 'League', 'GP', 'Pts', 'Ht', 'Wt', 'Trend'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '10px 12px',
      textAlign: i < 2 ? 'left' : 'center',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, rankFiltered.map((p, i) => React.createElement("tr", {
    key: p.rank + '-' + i,
    className: "er",
    style: {
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("td", {
    style: {
      padding: '9px 12px',
      fontFamily: MONO,
      color: i < 5 ? T.red : T.faint,
      fontWeight: i < 5 ? 700 : 400
    }
  }, String(p.rank).padStart(2, '0')), React.createElement("td", {
    style: {
      padding: '9px 12px',
      fontWeight: 600,
      color: T.ink
    }
  }, React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, p.intl && React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 8.5,
      letterSpacing: '.06em',
      color: T.posFg,
      background: T.posBg,
      padding: '1px 5px',
      borderRadius: 4,
      flexShrink: 0
    }
  }, "INTL"), p.name)), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, p.pos), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, p.league), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: T.mut
    }
  }, p.gp != null ? p.gp : '—'), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontWeight: 700
    }
  }, p.pts != null ? p.pts : '—'), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, p.ht), React.createElement("td", {
    style: {
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, p.wt), React.createElement("td", {
    style: {
      textAlign: 'center',
      color: p.trend === '▲' ? '#1a8a4f' : p.trend === '▼' ? T.red : T.faint
    }
  }, p.trend)))))), React.createElement("div", {
    style: {
      padding: '10px 16px',
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      borderTop: `1px solid ${T.line}`
    }
  }, "CS rankings are per-category: NA Skaters (1\u2013N) \u2192 Intl Skaters \u2192 Goalies. Use the filter to view each list. INTL badge = international prospect.")), tab === 'Mock first round' && React.createElement("div", null, React.createElement("div", {
    style: {
      ...card,
      padding: '14px 16px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
      background: `linear-gradient(110deg, ${T.bg}, transparent)`
    }
  }, React.createElement("span", {
    style: {
      ...ML
    }
  }, "Lottery winners"), lotWinners.map(ab => {
    const p = picks.find(x => x.team === ab);
    if (!p) return null;
    return React.createElement("div", {
      key: ab,
      onClick: () => onTeam(ab),
      className: "el",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer'
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 24
    }), React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, ct(ab)), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: '#1a8a4f'
      }
    }, "#", p.pick, " \xB7 \u25B2", p.moved, " from #", p.slot));
  })), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginBottom: 12,
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      flexWrap: 'wrap',
      padding: '0 2px'
    }
  }, React.createElement("span", null, React.createElement("b", {
    style: {
      color: T.mut
    }
  }, "Expected"), " = pre-lottery slot (reverse standings)"), React.createElement("span", null, React.createElement("b", {
    style: {
      color: T.mut
    }
  }, "Landed"), " = post-lottery draft position"), React.createElement("span", {
    style: {
      color: '#1a8a4f'
    }
  }, "\u25B2 moved up"), React.createElement("span", {
    style: {
      color: T.red
    }
  }, "\u25BC slid back")), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
      gap: 12
    }
  }, picks.map(p => {
    const up = p.moved > 0,
      down = p.moved < 0;
    return React.createElement("div", {
      key: p.pick,
      className: "ec",
      style: {
        ...card,
        padding: '13px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        border: p.lotteryWin ? `1px solid ${T.posFg}55` : `1px solid ${T.line}`
      }
    }, React.createElement("div", {
      style: {
        textAlign: 'center',
        width: 40,
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 8.5,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.faint
      }
    }, "Landed"), React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 28,
        lineHeight: 1,
        color: p.lotteryWin ? '#1a8a4f' : T.ink
      }
    }, p.pick)), React.createElement("div", {
      onClick: () => onTeam(p.team),
      className: "el",
      style: {
        cursor: 'pointer',
        flexShrink: 0
      }
    }, React.createElement(Badge, {
      ab: p.team,
      size: 26
    })), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: T.ink
      }
    }, ct(p.team)), p.lotteryWin && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9.5,
        color: '#1a8a4f',
        background: '#e7f5ec',
        padding: '1px 6px',
        borderRadius: 5
      }
    }, "LOTTERY")), React.createElement("div", {
      style: {
        fontWeight: 600,
        color: T.ink,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginTop: 2
      }
    }, p.name), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, p.pos, " \xB7 ", p.league)), React.createElement("div", {
      style: {
        textAlign: 'right',
        flexShrink: 0,
        borderLeft: `1px solid ${T.line}`,
        paddingLeft: 12
      }
    }, React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 8.5,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.faint
      }
    }, "Expected"), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 16,
        fontWeight: 600,
        color: T.mut
      }
    }, "#", p.slot), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        color: up ? '#1a8a4f' : down ? T.red : T.faint
      }
    }, up ? `▲ ${p.moved}` : down ? `▼ ${Math.abs(p.moved)}` : '—')));
  }))), tab === 'Draft order' && React.createElement("div", null, (() => {
    const proj1 = picks.find(p => p.slot === 1),
      won1 = picks.find(p => p.pick === 1);
    const held = proj1 && won1 && proj1.team === won1.team;
    const Cell = ({
      k,
      p,
      tone
    }) => React.createElement("div", {
      onClick: () => onTeam(p.team),
      className: "el",
      style: {
        cursor: 'pointer',
        flex: '1 1 200px'
      }
    }, React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: tone
      }
    }, k), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 7
      }
    }, React.createElement(Badge, {
      ab: p.team,
      size: 34
    }), React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 16,
        color: T.ink
      }
    }, ct(p.team), " ", nk(p.team)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, k.includes('Projected') ? `pre-lottery slot #${p.slot}` : `won the draw · was slotted #${p.slot}`))));
    return React.createElement("div", {
      style: {
        ...card,
        padding: '16px 18px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap'
      }
    }, React.createElement(Cell, {
      k: "Projected 1st overall",
      p: proj1,
      tone: T.mut
    }), React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: 22,
        color: T.faint,
        textAlign: 'center'
      }
    }, held ? 'held' : '→'), React.createElement(Cell, {
      k: "Won the lottery \xB7 picks 1st",
      p: won1,
      tone: "#1a8a4f"
    }), !held && proj1 && React.createElement("div", {
      style: {
        flexBasis: '100%',
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut,
        borderTop: `1px solid ${T.line}`,
        paddingTop: 10
      }
    }, ct(won1.team), " leapt ", React.createElement("b", {
      style: {
        color: '#1a8a4f'
      }
    }, "\u25B2", won1.moved), " spots to grab the top pick \u2014 ", ct(proj1.team), ", the league's worst, slid to ", React.createElement("b", {
      style: {
        color: T.red
      }
    }, "#", proj1.pick), "."));
  })(), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, doView === 'result' ? 'First round · post-lottery order' : 'Projected order · pre-lottery (reverse standings)'), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [['result', 'Lottery result'], ['projected', 'Projected order']].map(([k, l]) => React.createElement(Pill, {
    key: k,
    on: doView === k,
    onClick: () => setDoView(k)
  }, l)))), React.createElement("div", {
    className: "ed-scrollx",
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 680,
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, [doView === 'result' ? 'Pick' : 'Proj', 'Team', 'Prospect', 'Pos', 'League', doView === 'result' ? 'Exp' : 'Landed', 'Move'].map((h, i) => React.createElement("th", {
    key: h,
    style: {
      padding: '11px 12px',
      textAlign: i === 1 || i === 2 ? 'left' : 'center',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, [...picks].sort((a, b) => doView === 'result' ? a.pick - b.pick : a.slot - b.slot).map(p => {
    const up = p.moved > 0,
      down = p.moved < 0;
    const hot = doView === 'result' ? p.lotteryWin : p.slot === 1;
    return React.createElement("tr", {
      key: p.pick,
      onClick: () => onTeam(p.team),
      className: "er",
      style: {
        cursor: 'pointer',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '10px 12px',
        fontFamily: MONO,
        fontWeight: 700,
        color: hot ? '#1a8a4f' : T.ink
      }
    }, String(doView === 'result' ? p.pick : p.slot).padStart(2, '0')), React.createElement("td", {
      style: {
        padding: '10px 12px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9
      }
    }, React.createElement(Badge, {
      ab: p.team,
      size: 22
    }), React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink
      }
    }, ct(p.team), " ", nk(p.team)), p.lotteryWin && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        color: '#1a8a4f',
        background: '#e7f5ec',
        padding: '1px 5px',
        borderRadius: 5
      }
    }, "LOTTERY"))), React.createElement("td", {
      style: {
        padding: '10px 12px',
        color: T.ink
      }
    }, p.name), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, p.pos), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, p.league), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontFamily: MONO,
        color: T.faint
      }
    }, "#", doView === 'result' ? p.slot : p.pick), React.createElement("td", {
      style: {
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#1a8a4f' : down ? T.red : T.faint
      }
    }, up ? `▲${p.moved}` : down ? `▼${Math.abs(p.moved)}` : '—'));
  })))), React.createElement("div", {
    style: {
      padding: '10px 16px',
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      borderTop: `1px solid ${T.line}`
    }
  }, doView === 'result' ? 'Pick = post-lottery position · Exp = pre-lottery slot (reverse standings)' : 'Proj = pre-lottery slot (reverse standings) · Landed = actual post-lottery pick', " \xB7 \u25B2\u25BC = lottery movement"))), tab === 'Live tracker' && (() => {
    const list = tracker;
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 12,
        alignItems: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        fontWeight: 600,
        color: T.ink
      }
    }, "First round"), React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontFamily: MONO,
        fontSize: 11,
        color: madeCount ? '#1a8a4f' : T.faint
      }
    }, madeCount ? `${madeCount} picks in` : 'Predicted order — updates live on draft night')), React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        ...ML,
        borderBottom: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, madeCount > 0 && React.createElement("span", {
      className: "ed-pulse",
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: T.red,
        display: 'inline-block'
      }
    }), "First round \xB7 ", list.length, " picks"), React.createElement("span", {
      style: {
        color: T.faint
      }
    }, list.length ? `picks ${list[0].pick}–${list[list.length - 1].pick}` : '')), React.createElement("div", null, list.map((p, i) => React.createElement("div", {
      key: p.pick,
      onClick: () => onTeam(p.team),
      className: "er",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        cursor: 'pointer',
        background: p.made ? 'rgba(26,138,79,.05)' : 'transparent'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        color: p.made ? '#1a8a4f' : T.faint,
        fontWeight: p.made ? 700 : 400,
        width: 30
      }
    }, p.pick), React.createElement(Badge, {
      ab: p.team,
      size: 22
    }), React.createElement("span", {
      style: {
        width: 40,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, p.team), React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: 600,
        color: T.ink,
        minWidth: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, p.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        padding: '1px 6px',
        borderRadius: 5,
        flexShrink: 0,
        ...(p.made ? {
          color: T.posFg,
          background: T.posBg
        } : {
          color: T.faint,
          background: T.bg
        })
      }
    }, p.made ? 'PICKED' : 'PROJECTED'), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0
      }
    }, p.made && p.diff != null && p.diff !== 0 && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        fontWeight: 700,
        color: p.diff > 0 ? '#1a8a4f' : T.red
      }
    }, p.diff > 0 ? `▲${p.diff}` : `▼${Math.abs(p.diff)}`), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut,
        whiteSpace: 'nowrap'
      }
    }, p.pos, " \xB7 ", p.league))))), React.createElement("div", {
      style: {
        padding: '10px 16px',
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        borderTop: `1px solid ${T.line}`
      }
    }, "PROJECTED = consensus prospect ranking \xB7 PICKED = real selection, live \xB7 \u25B2\u25BC = picked vs Central Scouting rank (e.g. \u25B23 = 3 spots earlier than ranked)")));
  })(), !isUpcoming && (() => {
    const rl = past.rounds || [1];
    const list = (past.picks || []).filter(p => p.round === round);
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, rl.map(n => React.createElement(Pill, {
      key: n,
      on: round === n,
      onClick: () => setRound(n)
    }, "Round ", n))), React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        ...ML,
        borderBottom: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }
    }, React.createElement("span", null, year, " Draft \xB7 Round ", round, " \xB7 ", list.length, " picks"), React.createElement("span", {
      style: {
        color: T.faint
      }
    }, list.length ? `picks ${list[0].pick}–${list[list.length - 1].pick}` : '')), React.createElement("div", {
      className: "ed-scrollx",
      style: {
        overflowX: 'auto'
      }
    }, React.createElement("table", {
      style: {
        width: '100%',
        minWidth: 680,
        borderCollapse: 'collapse',
        fontSize: 13.5
      }
    }, React.createElement("thead", null, React.createElement("tr", {
      style: ML
    }, ['#', 'Team', 'Player', 'Pos', 'League', 'Club'].map((h, i) => React.createElement("th", {
      key: h,
      style: {
        padding: '11px 12px',
        textAlign: i === 1 || i === 2 || i === 5 ? 'left' : 'center',
        fontWeight: 600,
        ...ML
      }
    }, h)))), React.createElement("tbody", null, list.map(p => React.createElement("tr", {
      key: p.pick,
      onClick: () => onTeam(p.team),
      className: "er",
      style: {
        cursor: 'pointer',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '10px 12px',
        fontFamily: MONO,
        fontWeight: 700,
        color: p.pick <= 3 ? T.red : T.ink
      }
    }, String(p.pick).padStart(2, '0')), React.createElement("td", {
      style: {
        padding: '10px 12px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9
      }
    }, React.createElement(Badge, {
      ab: p.team,
      size: 22
    }), React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink
      }
    }, ct(p.team) || p.team))), React.createElement("td", {
      style: {
        padding: '10px 12px',
        fontWeight: 600,
        color: T.ink
      }
    }, p.name || '—'), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut
      }
    }, p.pos), React.createElement("td", {
      style: {
        textAlign: 'center',
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, p.league), React.createElement("td", {
      style: {
        padding: '10px 12px',
        color: T.mut,
        fontFamily: MONO,
        fontSize: 12
      }
    }, p.club || '—')))))), React.createElement("div", {
      style: {
        padding: '10px 16px',
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        borderTop: `1px solid ${T.line}`
      }
    }, year, " NHL Draft \u2014 full results, all seven rounds")));
  })()));
}
window.E_TOK = {
  T,
  MONO,
  SERIF,
  card,
  ML
};
window.E_UI = {
  Eyebrow,
  PageHead,
  Badge,
  Spark,
  Pill,
  PlayerAvatar
};
function HighlightsPage({
  onGame,
  onTeam,
  onPlayer,
  onGo,
  favs,
  booting
}) {
  const fav = favs || [];
  const today = D.slate(0);
  const spotMock = uM(() => {
    const ss = D.skaterLeaders('p').slice(0, 8);
    return ss.map(p => ({
      id: p.id,
      name: p.name,
      pos: p.pos,
      num: p.num,
      team: p.team,
      headshot: null
    }));
  }, []);
  const spotlight = window.E_useLive(spotMock, () => window.NHL && window.NHL.spotlightMapped ? window.NHL.spotlightMapped() : null, []);
  const live = today.filter(g => g.st === 'live');
  const [railView, setRailView] = uS('Tonight');
  const [ldrCat, setLdrCat] = uS('Points');
  const railGames = railView === 'Tonight' ? today : railView === 'Recent' ? D.slate(-1) : D.slate(1);
  const gotn = (() => {
    if (live.length) return [...live].sort((a, b) => Math.abs(a.as - a.hs) - Math.abs(b.as - b.hs))[0];
    const pre = today.filter(g => g.st === 'pre');
    if (pre.length) return [...pre].sort((a, b) => D.rankOf[a.a] + D.rankOf[a.h] - (D.rankOf[b.a] + D.rankOf[b.h]))[0];
    return today[0] || D.slate(-1)[0] || D.slate(1)[0] || null;
  })();
  const topScorer = ab => D.teamRoster(ab)[0];
  const sv = s => {
    const k = s.strk[0],
      n = parseInt(s.strk.slice(1), 10) || 0;
    return k === 'W' ? n : k === 'L' ? -n : 0;
  };
  const hottest = [...D.STANDINGS].filter(t => t.strk[0] === 'W').sort((a, b) => sv(b) - sv(a))[0];
  const coldest = [...D.STANDINGS].filter(t => t.strk[0] === 'L').sort((a, b) => sv(a) - sv(b))[0];
  const wcBubble = D.STANDINGS.filter(t => t.conf === 'East')[7];
  const edgeStar = (D.edgeLeaders ? D.edgeLeaders('top') : [])[0];
  const ptsLeader = D.skaterLeaders('p')[0];
  const draftLeader = [...D.STANDINGS][D.STANDINGS.length - 1];
  const ldrKey = {
    Points: 'p',
    Goals: 'g',
    'Save%': 'svp'
  };
  const Hero = () => {
    const g = gotn;
    if (!g) return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        padding: '10px 18px',
        borderBottom: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: ML
    }, "Game of the night")), React.createElement("div", {
      style: {
        padding: '48px 18px',
        textAlign: 'center'
      }
    }, React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontSize: 22,
        color: T.ink,
        marginBottom: 6
      }
    }, "No games on the schedule"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: T.mut
      }
    }, "It's a quiet night around the league \u2014 check Scores for the full calendar.")));
    const aw = g.st.startsWith('final') && g.as > g.hs,
      hw = g.st.startsWith('final') && g.hs > g.as;
    const as_ = topScorer(g.a),
      hs_ = topScorer(g.h);
    return React.createElement("div", {
      onClick: () => onGame(g),
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: ML
    }, "Game of the night"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: g.st === 'live' ? T.red : g.st.startsWith('final') ? T.faint : '#1a8a4f',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, g.st === 'live' && React.createElement("span", {
      className: "ed-pulse",
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: T.red,
        display: 'inline-block'
      }
    }), g.st === 'live' ? `Live · ${g.per} ${g.clk}` : g.st.startsWith('final') ? g.ot ? 'Final/OT' : 'Final' : `Tonight · ${g.start}`)), React.createElement("div", {
      style: {
        padding: '24px 18px',
        background: `linear-gradient(110deg, ${c2(g.a)}0e, ${c2(g.h)}0e)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        flexWrap: 'wrap'
      }
    }, [[g.a, g.as, aw, as_], [g.h, g.hs, hw, hs_]].map(([ab, sc, won, star], idx) => React.createElement(React.Fragment, {
      key: ab
    }, React.createElement("div", {
      style: {
        textAlign: 'center',
        minWidth: 130
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 48
    }), React.createElement("div", {
      style: {
        fontWeight: 700,
        marginTop: 8,
        fontSize: 15
      }
    }, ct(ab), " ", nk(ab)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        marginTop: 2
      }
    }, "#", D.rankOf[ab], " \xB7 ", D.standBy(ab).w, "-", D.standBy(ab).l, "-", D.standBy(ab).otl), star && React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: T.mut,
        marginTop: 6
      }
    }, star.name.split(' ').slice(-1)[0], " \xB7 ", star.p, "P")), idx === 0 && React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, React.createElement("div", {
      style: {
        fontSize: 46,
        fontWeight: 600,
        letterSpacing: '-.03em',
        color: T.ink
      }
    }, g.st === 'pre' ? '@' : `${g.as}:${g.hs}`))))));
  };
  const story = (tag, headline, sub, onClick, accent) => React.createElement("div", {
    onClick: onClick,
    className: "ec",
    style: {
      ...card,
      padding: '16px 17px',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: accent || T.red
    }
  }, tag), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 18,
      lineHeight: 1.25,
      color: T.ink,
      margin: '7px 0 5px'
    }
  }, headline), React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.mut
    }
  }, sub));
  if (booting) return React.createElement("div", null, React.createElement(PageHead, {
    k: "The Lab",
    t: "Tonight around the",
    serif: "league"
  }), React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 230,
      borderRadius: 14,
      marginBottom: 16
    }
  }), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))',
      gap: 10,
      marginBottom: 16
    }
  }, Array.from({
    length: 8
  }, (_, i) => React.createElement("div", {
    key: i,
    className: "ed-skel",
    style: {
      height: 84,
      borderRadius: 12
    }
  }))), React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 13,
      width: 210,
      borderRadius: 7,
      marginBottom: 12
    }
  }), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 14,
      marginBottom: 18
    }
  }, Array.from({
    length: 6
  }, (_, i) => React.createElement("div", {
    key: i,
    className: "ed-skel",
    style: {
      height: 92,
      borderRadius: 12
    }
  }))), React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 300,
      borderRadius: 14
    }
  }));
  return React.createElement("div", null, React.createElement(PageHead, {
    k: "The Lab",
    t: "Tonight around the",
    serif: "league"
  }), spotlight && spotlight.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, "League spotlight"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      overflowY: 'hidden',
      paddingBottom: 4,
      WebkitOverflowScrolling: 'touch'
    }
  }, spotlight.slice(0, 12).map(p => React.createElement("div", {
    key: p.id,
    onClick: () => onPlayer({
      id: p.id,
      name: p.name,
      team: p.team,
      pos: p.pos
    }),
    className: "ec",
    style: {
      ...card,
      flex: '0 0 auto',
      width: 150,
      cursor: 'pointer',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      height: 3,
      background: c2(p.team)
    }
  }), React.createElement("div", {
    style: {
      padding: '12px 13px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, React.createElement(Badge, {
    ab: p.team,
    size: 30
  }), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, p.team, p.num ? ` · #${p.num}` : '')), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      lineHeight: 1.2,
      color: T.ink
    }
  }, p.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.mut,
      marginTop: 3
    }
  }, p.pos || '\u2014')))))), fav.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 10
    }
  }, "Your teams"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(255px,1fr))',
      gap: 12
    }
  }, fav.map(ab => {
    const s = D.teamSchedule(ab),
      st = D.standBy(ab),
      last = s.rec[0],
      next = s.up[0];
    const lastInfo = g => {
      if (!g) return null;
      const home = g.h === ab,
        us = home ? g.hs : g.as,
        them = home ? g.as : g.hs,
        won = us > them,
        opp = home ? g.a : g.h;
      return {
        won,
        txt: `${won ? 'W' : 'L'} ${us}–${them} ${home ? 'vs' : '@'} ${opp}`
      };
    };
    const li = lastInfo(last);
    return React.createElement("div", {
      key: ab,
      onClick: () => onTeam(ab),
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden',
        cursor: 'pointer'
      }
    }, React.createElement("div", {
      style: {
        height: 4,
        background: c2(ab)
      }
    }), React.createElement("div", {
      style: {
        padding: '12px 14px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 9
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 26
    }), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13.5,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, ct(ab), " ", nk(ab)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, st.w, "-", st.l, "-", st.otl, " \xB7 #", D.rankOf[ab]))), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
        fontFamily: MONO,
        fontSize: 11.5,
        padding: '5px 0',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: {
        color: T.faint
      }
    }, "LAST"), React.createElement("span", {
      style: {
        color: li ? li.won ? '#1a8a4f' : T.red : T.faint,
        fontWeight: 600
      }
    }, li ? li.txt : '—')), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
        fontFamily: MONO,
        fontSize: 11.5,
        padding: '5px 0',
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: {
        color: T.faint
      }
    }, "NEXT"), React.createElement("span", {
      style: {
        color: T.ink,
        fontWeight: 600
      }
    }, next ? `${next.h === ab ? 'vs' : '@'} ${next.h === ab ? next.a : next.h} · ${next.start || ''}` : '—'))));
  }))), React.createElement(Hero, null), React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '11px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${T.line}`,
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: {
      ...ML,
      whiteSpace: 'nowrap'
    }
  }, railView === 'Tonight' ? today.length ? `${today.length} games tonight` : 'No games tonight' : railView), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexShrink: 0
    }
  }, ['Recent', 'Tonight', 'Upcoming'].map(v => React.createElement(Pill, {
    key: v,
    on: railView === v,
    onClick: () => setRailView(v)
  }, v)))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))',
      marginTop: -1,
      marginLeft: -1
    }
  }, railGames.length ? railGames.map((g, i) => {
    const aw = g.st.startsWith('final') && g.as > g.hs,
      hw = g.st.startsWith('final') && g.hs > g.as;
    return React.createElement("div", {
      key: g.id,
      onClick: () => onGame(g),
      className: "er",
      style: {
        borderTop: `1px solid ${T.line}`,
        borderLeft: `1px solid ${T.line}`,
        padding: '12px 15px',
        cursor: 'pointer'
      }
    }, React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: g.st === 'live' ? T.red : T.faint,
        marginBottom: 7
      }
    }, g.st === 'live' ? `${g.per} ${g.clk}` : g.st.startsWith('final') ? g.ot ? 'F/OT' : 'Final' : g.start), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement(Badge, {
      ab: g.a,
      size: 16
    }), React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: aw ? 700 : 500
      }
    }, g.a)), g.st !== 'pre' && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontWeight: aw ? 700 : 400
      }
    }, g.as)), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement(Badge, {
      ab: g.h,
      size: 16
    }), React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: hw ? 700 : 500
      }
    }, g.h)), g.st !== 'pre' && React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontWeight: hw ? 700 : 400
      }
    }, g.hs)));
  }) : React.createElement("div", {
    style: {
      padding: '18px 16px',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, "no games"))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Storylines \xB7 what changed today"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: '#b5762a',
      border: '1px solid rgba(181,118,42,.35)',
      borderRadius: 5,
      padding: '2px 6px'
    },
    title: "Generated narrative from live standings & stats \u2014 not reporting"
  }, "Editorial")), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 14,
      marginBottom: 18
    }
  }, hottest && story('Hot streak', `${ct(hottest.ab)} are surging`, `${hottest.strk} · climbing the ${hottest.conf === 'East' ? 'East' : 'West'}`, () => onTeam(hottest.ab)), wcBubble && story('Wild-card race', `${ct(wcBubble.ab)} cling to the final spot`, `${wcBubble.pts} pts · East bubble — tap for the race`, () => onGo('standings'), '#b5762a'), edgeStar && story('NHL Edge', `${edgeStar.name} is flying`, `${edgeStar._v} mph top skating speed — league leader`, () => onPlayer(edgeStar), '#1a8a4f'), ptsLeader && story('Scoring watch', `${ptsLeader.name} pacing the league`, `${ptsLeader.p} pts · ${ptsLeader.g}G ${ptsLeader.a}A`, () => onPlayer(ptsLeader)), coldest && story('Cold snap', `${ct(coldest.ab)} can't buy a win`, `${coldest.strk} · sliding fast`, () => onTeam(coldest.ab), T.faint), draftLeader && story('Draft lottery', `${ct(draftLeader.ab)} lead the lottery odds`, `${draftLeader.pts} pts · eyes on the prize`, () => onGo('draft'), '#b5762a')), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: fav.length ? '1fr 1fr' : '1fr',
      gap: 16
    },
    className: "g2"
  }, React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${T.line}`,
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "League leaders"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['Points', 'Goals', 'Save%'].map(c => React.createElement(Pill, {
    key: c,
    on: ldrCat === c,
    onClick: () => setLdrCat(c)
  }, c)))), (ldrCat === 'Save%' ? D.goalieLeaders().filter(g => g.gp >= 12).slice(0, 6).map(g => ({
    ...g,
    type: 'goalie',
    _v: g.svp
  })) : D.skaterLeaders(ldrKey[ldrCat]).slice(0, 6).map(p => ({
    ...p,
    _v: p[ldrKey[ldrCat]]
  }))).map((p, i) => React.createElement("div", {
    key: p.id,
    onClick: () => onPlayer(p),
    className: "er",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      cursor: 'pointer'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: i === 0 ? T.red : T.faint,
      width: 14
    }
  }, i + 1), React.createElement(Badge, {
    ab: p.team,
    size: 20
  }), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 13,
      fontWeight: 700
    }
  }, p._v)))), fav.length > 0 && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Your teams"), fav.map((ab, i) => {
    const t = D.standBy(ab);
    if (!t) return null;
    let next = null;
    for (let o = 0; o <= 4 && !next; o++) D.slate(o).forEach(g => {
      if (!next && (g.a === ab || g.h === ab) && g.st !== 'final' && !g.st.startsWith('final')) next = g;
    });
    return React.createElement("div", {
      key: ab,
      onClick: () => onTeam(ab),
      className: "er",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        cursor: 'pointer'
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 26
    }), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600
      }
    }, ct(ab), " ", nk(ab)), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, "#", D.rankOf[ab], " \xB7 ", t.w, "-", t.l, "-", t.otl, " \xB7 ", t.pts, "p")), React.createElement("div", {
      style: {
        textAlign: 'right',
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, next ? `next ${next.a === ab ? 'vs ' + next.h : '@ ' + next.a}` : '—'));
  }))), !fav.length && React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px',
      marginTop: 16,
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut,
      textAlign: 'center'
    }
  }, "\u2605 Star a team (Teams page or \u2318K) to pin it here"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 12,
      marginTop: 16
    }
  }, [['Hockey IQ', 'iq', 'NHL Edge analytics'], ['Stats', 'stats', 'Leaders & totals'], ['Draft', 'draft', '2026 prospects'], ['Records', 'records', 'All-time book']].map(([lab, k, sub]) => React.createElement("div", {
    key: k,
    onClick: () => onGo(k),
    className: "ec",
    style: {
      ...card,
      padding: '15px 16px',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600
    }
  }, lab, " ", React.createElement("span", {
    style: {
      color: T.faint
    }
  }, "\u2192")), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut,
      marginTop: 3
    }
  }, sub)))), React.createElement("style", null, `@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`));
}
const LEGAL_DOCS = {
  terms: {
    title: 'Terms of Service',
    updated: 'June 1, 2026',
    body: [['Who we are', 'The Hockey Lab ("the Lab", "we", "us", "our") is an independent, non-commercial hockey-analytics project operated by an individual hobbyist. It is not an incorporated business. References to "we" describe the project operator, not a registered company. If the project is ever incorporated, this document will be updated to name the entity.'], ['Acceptance of these terms', 'By accessing or using The Hockey Lab you agree to these Terms of Service and to our Privacy, Cookie, and Acceptable Use policies. If you do not agree, please do not use the site. We may revise these Terms at any time by posting an updated version; the "last updated" date reflects the latest change, and continued use after a change means you accept it.'], ['Eligibility', 'The site is intended for a general audience interested in hockey statistics. It is not directed at children under 13, and we do not knowingly collect information from them (see the Privacy Policy).'], ['What the Lab provides', 'The Hockey Lab presents NHL scores, standings, schedules, player and team statistics, NHL EDGE tracking metrics, playoff projections, mock draft and lottery scenarios, and historical records. Much of this is aggregated from public NHL data sources and some is modeled or projected by us. It is provided for informational and entertainment purposes only.'], ['Accuracy & projections', 'We work to present data faithfully but make no warranty that any figure, projection, or model output is accurate, complete, or current. Projections — including playoff brackets, draft order, lottery outcomes, and EDGE estimates — are derived models and will differ from official results. Do not rely on the Lab for any decision that has financial, legal, or other consequences.'], ['Acceptable use', 'Your use of the Lab is governed by our Acceptable Use Policy. In short: personal, lawful, non-commercial use only; no scraping, bulk extraction, resale, or redistribution of the data; and no attempts to disrupt or misuse the service or its API proxy.'], ['Intellectual property', 'The Lab\'s original design, code, and written content are owned by the project operator (see the Copyright Notice). NHL data, team names, logos, and related marks belong to the National Hockey League and its clubs and are used here for informational and editorial purposes only. The Lab is not affiliated with, endorsed by, or sponsored by the NHL.'], ['Third-party links & services', 'The site may link to third-party sites (e.g. broadcasters, ticketing, or betting partners) and fetches data from public NHL APIs. We do not control and are not responsible for third-party content, availability, or practices. Some links may be affiliate links (see the Affiliate Disclosure).'], ['"As is" / no warranty', 'The Lab is provided "as is" and "as available," without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uptime, error-free operation, or that the site will be secure or free of harmful components.'], ['Limitation of liability', 'To the fullest extent permitted by law, the project operator will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising from your use of (or inability to use) the Lab. Because the Lab is a free, non-commercial project, any direct liability is limited to the amount you paid to use it — which is zero.'], ['Changes & discontinuation', 'As a hobby project, the Lab may change, pause, or shut down at any time without notice. Features may be added or removed at our discretion.'], ['Governing terms', 'These Terms, together with the policies linked in the footer, are the entire agreement between you and the Lab regarding the site. If any provision is unenforceable, the rest remains in effect.'], ['Contact', 'Questions about these Terms can be raised through the project\'s public repository on GitHub.']]
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'June 1, 2026',
    body: [['Our approach', 'The Hockey Lab is built to need as little of your data as possible. There are no user accounts, no sign-ups, and no profiles. We do not sell, rent, or trade personal information — we do not collect it in the first place.'], ['What we do not collect', 'We do not ask for your name, email, address, or payment details. We do not run advertising networks or third-party trackers that build a profile of you.'], ['Information stored on your device', 'Your preferences — followed teams and selected season — are saved in your browser\'s localStorage. This stays on your device, is readable only by this site, and is never transmitted to us. Clearing your browser storage removes it.'], ['Automatically-processed data', 'Like any website, when your browser requests pages or data, standard technical information (such as IP address and user-agent) is processed transiently by the hosting/CDN provider (Cloudflare) to deliver the site and protect against abuse. We do not use this to identify you, and we do not retain our own copy.'], ['Optional analytics', 'If privacy-respecting, cookie-free analytics are ever enabled, they collect only aggregate, anonymous metrics (e.g. page views, country, device type) and never personal data. This policy will name the provider if/when that happens.'], ['Third-party data sources', 'Game and player data is fetched through our edge proxy from public NHL APIs (api-web.nhle.com, api.nhle.com, records.nhl.com). Your browser does not call those services directly; the proxy does. Their data practices are their own.'], ['Children', 'The Lab is not directed at children under 13 and we do not knowingly collect their personal information. Since we collect no personal information from anyone, this is inherent to the design.'], ['Your choices', 'You can clear locally-stored preferences at any time via your browser settings. Because we hold no account or personal data, there is nothing for us to delete on our side.'], ['Changes', 'We may update this policy as the project evolves (for example, if it becomes an incorporated business or adds analytics). Material changes will be reflected in the "last updated" date.'], ['Contact', 'Privacy questions can be raised through the project\'s public GitHub repository.']]
  },
  cookies: {
    title: 'Cookie Policy',
    updated: 'June 1, 2026',
    body: [['Summary', 'The Hockey Lab does not use advertising or cross-site tracking cookies. We rely on a small amount of first-party browser storage to make personalization work.'], ['What we use', 'We use localStorage (not cookies) to remember your followed teams and chosen season so features like "Your teams" on the Highlights page persist between visits. This data is first-party, stays on your device, and is not shared.'], ['Strictly-necessary technology', 'Our host (Cloudflare) may set strictly-necessary cookies or tokens to deliver content securely and mitigate abuse. These are essential to the site functioning and are not used for advertising.'], ['No advertising or analytics cookies', 'We do not set marketing cookies, advertising pixels, or third-party analytics cookies. If cookie-based analytics are ever introduced, this policy and a consent mechanism will be added first.'], ['Managing storage', 'You can block or clear site storage and cookies in your browser settings. Doing so will reset your saved teams and season but will not prevent you from using the Lab.']]
  },
  copyright: {
    title: 'Copyright Notice',
    updated: 'June 1, 2026',
    body: [['Original content', 'The design, layout, source code, written copy, and original visualizations of The Hockey Lab are \u00A9 2026 the project operator. All rights reserved. The Lab is an independent project and not an incorporated business; rights are held by the individual operator until/unless a legal entity is formed.'], ['NHL data and marks', 'NHL game data, statistics, schedules, EDGE metrics, team names, logos, uniforms, and related trademarks are the property of the National Hockey League and its member clubs. They appear on the Lab solely for informational, editorial, and analytical purposes. The Lab claims no ownership of, and no affiliation with, the NHL or its marks.'], ['Permitted use', 'You may view the Lab and share links to it. You may quote small portions of our original commentary with attribution. You may not copy, scrape, or republish the Lab\'s code or content — or the underlying NHL data — for commercial purposes or as your own product.'], ['Requests', 'Permission requests and attribution questions can be directed to the operator via the project\'s GitHub repository.'], ['Reporting infringement', 'If you believe content on the Lab infringes your copyright, see our DMCA / Copyright Takedown Policy for how to file a notice.']]
  },
  dmca: {
    title: 'DMCA / Copyright Takedown Policy',
    updated: 'June 1, 2026',
    body: [['Our commitment', 'The Hockey Lab respects intellectual-property rights and will respond to clear, valid notices of alleged copyright infringement consistent with the principles of the U.S. Digital Millennium Copyright Act (DMCA), even though we are a small, unincorporated project.'], ['How to file a notice', 'Send a written notice through the project\'s GitHub repository that includes: (1) identification of the copyrighted work you claim is infringed; (2) the exact URL(s) of the material on the Lab; (3) your contact information; (4) a statement that you have a good-faith belief the use is not authorized by the owner, its agent, or the law; (5) a statement, under penalty of perjury, that the information is accurate and you are the owner or authorized to act for the owner; and (6) your physical or electronic signature.'], ['What we do', 'On receipt of a valid notice we will review and, where appropriate, promptly remove or disable access to the material and make a reasonable effort to note the action.'], ['Counter-notice', 'If you believe material was removed in error, you may submit a counter-notice containing the equivalent identifying information, your contact details, a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification, and your consent to jurisdiction. We may restore the material absent a subsequent court filing by the original complainant.'], ['Repeat infringers', 'We may remove content and restrict access for anyone who repeatedly posts or causes infringing material.'], ['Good faith', 'Because the Lab displays NHL data under fair, informational use and hosts little user content, most concerns can be resolved quickly and informally — but we take every notice seriously.']]
  },
  affiliate: {
    title: 'Affiliate Disclosure',
    updated: 'June 1, 2026',
    body: [['Current status', 'The Hockey Lab is a non-commercial hobby project and does not presently earn revenue. This disclosure is provided in advance so it is in place if that changes.'], ['If affiliate links appear', 'Should the Lab add affiliate links in the future (for example to ticketing, merchandise, or sportsbook partners), some outbound links may be affiliate links. If you click one and complete a purchase or sign-up, the Lab may earn a commission at no additional cost to you.'], ['Editorial independence', 'Any future affiliate or sponsorship relationship will never influence our statistics, rankings, projections, or editorial content. Data and storylines are generated independently of any commercial arrangement, and we will label sponsored or affiliate content clearly.'], ['Betting & odds', 'Where betting odds or partner links are shown, they are for information only and are not a recommendation to wager. Gambling carries risk; only participate if it is legal in your jurisdiction and you are of legal age. If you or someone you know has a gambling problem, seek help from a local support line.'], ['Questions', 'Reach out via the project\'s GitHub repository for details on any affiliate relationship in effect at the time you are reading this.']]
  },
  disclaimer: {
    title: 'Disclaimer',
    updated: 'June 1, 2026',
    body: [['Informational & entertainment only', 'All content on The Hockey Lab is provided for general informational and entertainment purposes. Nothing here is professional advice of any kind.'], ['No guarantee of accuracy', 'We make no representation or warranty about the accuracy, completeness, reliability, or timeliness of any score, statistic, metric, or projection. Live data can be delayed or incorrect, and upstream sources can change without notice.'], ['Projections are models', 'Playoff brackets, draft order, draft-lottery outcomes, EDGE estimates, and similar features are modeled projections created by the Lab. They are not predictions of official results and should be treated as illustrative.'], ['Not betting advice', 'Nothing on the Lab is gambling, investment, or financial advice. Do not place wagers based on Lab content. Bet only where legal, of legal age, and responsibly.'], ['Not affiliated with the NHL', 'The Hockey Lab is an independent project and is not affiliated with, endorsed by, or sponsored by the National Hockey League, its teams, or its partners.'], ['External sites', 'We are not responsible for the content, accuracy, or practices of any third-party website linked from the Lab.'], ['Use at your own risk', 'Your use of the Lab and reliance on any of its content is solely at your own risk.']]
  },
  aup: {
    title: 'Acceptable Use Policy',
    updated: 'June 1, 2026',
    body: [['Purpose', 'This policy describes how you may and may not use The Hockey Lab. It supplements the Terms of Service.'], ['Permitted use', 'Use the Lab for lawful, personal, non-commercial purposes — viewing scores, stats, and analytics in your browser.'], ['Prohibited conduct', 'You may not: scrape, crawl, or bulk-download data or content; resell, redistribute, or republish the data or the Lab\'s content as your own; attempt to access the API proxy programmatically or at volumes beyond normal interactive browsing; overload, disrupt, or degrade the service; probe, scan, or test the security of the site or its infrastructure; circumvent rate limits or access controls; misrepresent the source of the data; or use the Lab to break any law or infringe anyone\'s rights.'], ['Automated access', 'Our edge API proxy exists to serve the website. Automated or programmatic access beyond ordinary browsing is not permitted without prior written consent. If you want hockey data for your own project, use the public NHL APIs directly under their terms.'], ['Security', 'If you discover a vulnerability, please report it responsibly through the project\'s GitHub repository rather than exploiting or publicizing it.'], ['Enforcement', 'We may rate-limit, block, or restrict access — by IP or otherwise — for any use that violates this policy or threatens the stability or integrity of the service.']]
  }
};
function LegalPage({
  doc,
  onGo
}) {
  const d = LEGAL_DOCS[doc] || LEGAL_DOCS.terms;
  return React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto'
    }
  }, React.createElement("button", {
    onClick: () => onGo('highlights'),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      color: T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      padding: '0 0 18px'
    }
  }, "\u2190 back to the lab"), React.createElement("div", {
    style: ML
  }, "Legal"), React.createElement("h1", {
    style: {
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: '-.03em',
      margin: '6px 0 4px'
    }
  }, d.title), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint,
      marginBottom: 24
    }
  }, "Last updated ", d.updated), d.body.map(([h, p], i) => React.createElement("div", {
    key: i,
    style: {
      marginBottom: 22
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 20,
      color: T.ink,
      marginBottom: 7
    }
  }, h), React.createElement("p", {
    style: {
      fontSize: 14.5,
      lineHeight: 1.65,
      color: T.mut,
      margin: 0,
      textWrap: 'pretty'
    }
  }, p))), React.createElement("div", {
    style: {
      ...card,
      padding: '14px 16px',
      marginTop: 8,
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint,
      lineHeight: 1.7
    }
  }, "Template policy for The Hockey Lab. Not legal advice \\u2014 have counsel review before publishing. The Hockey Lab is an independent project, not affiliated with the NHL."), React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 20,
      paddingTop: 18,
      borderTop: `1px solid ${T.line}`
    }
  }, window.E_FOOTER_LINKS.filter(([k]) => k !== doc).map(([k, label]) => React.createElement("button", {
    key: k,
    onClick: () => onGo('legal/' + k),
    className: "el",
    style: {
      background: 'none',
      border: `1px solid ${T.line2}`,
      borderRadius: 8,
      padding: '6px 11px',
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut,
      cursor: 'pointer'
    }
  }, label))));
}
window.E_PAGES = {
  HighlightsPage,
  StandingsPage,
  TeamsPage,
  TeamDetailPage,
  PlayersPage,
  PlayerDetailPage,
  StatsPage,
  HockeyIQPage,
  DraftPage,
  PlayoffsPage,
  LegalPage,
  RecordsPage
};
window.E_FOOTER_LINKS = [['terms', 'Terms of Service'], ['privacy', 'Privacy Policy'], ['cookies', 'Cookie Policy'], ['copyright', 'Copyright Notice'], ['dmca', 'DMCA / Copyright Takedown'], ['affiliate', 'Affiliate Disclosure'], ['disclaimer', 'Disclaimer'], ['aup', 'Acceptable Use Policy']];
})();