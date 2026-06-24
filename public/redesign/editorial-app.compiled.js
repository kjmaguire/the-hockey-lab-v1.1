(function(){
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const BC = window.BC;
const {
  T,
  MONO,
  SERIF,
  card,
  ML
} = window.E_TOK;
const {
  Eyebrow,
  Badge,
  PlayerAvatar
} = window.E_UI;
const P = window.E_PAGES;
const {
  col,
  nick,
  city,
  slate,
  dateLabel,
  detail
} = BC;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function SchedCal({
  offset,
  setOffset,
  favs,
  view
}) {
  const [team, setTeam] = useState('all');
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const teamsAZ = useMemo(() => [...BC.ABBR].sort((a, b) => city(a).localeCompare(city(b))), []);
  const dOf = o => {
    const d = new Date(today);
    d.setDate(d.getDate() + o);
    return d;
  };
  const offOf = d => Math.round((d - today) / 86400000);
  const favG = gms => gms.filter(g => favs.includes(g.a) || favs.includes(g.h));
  const base = dOf(offset),
    y = base.getFullYear(),
    m = base.getMonth();
  if (view === 'week') {
    const wk = offset - dOf(offset).getDay();
    const WeekCell = ({
      o
    }) => {
      const d = dOf(o),
        gms = slate(o),
        fg = favG(gms),
        cur = o === offset,
        isT = o === 0;
      return React.createElement("button", {
        onClick: () => setOffset(o),
        className: "er",
        style: {
          textAlign: 'left',
          cursor: 'pointer',
          background: cur ? T.invBg : T.paper,
          color: cur ? T.invFg : T.ink,
          border: `1px solid ${cur ? T.invBg : T.line}`,
          borderRadius: 11,
          padding: '10px 11px',
          height: 84,
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
          color: cur ? T.invFg : T.faint,
          opacity: cur ? .7 : 1
        }
      }, WD[d.getDay()]), React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 16
        }
      }, d.getDate())), React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: cur ? T.invFg : T.mut,
          opacity: cur ? .85 : 1,
          marginTop: 'auto'
        }
      }, gms.length ? `${gms.length} game${gms.length > 1 ? 's' : ''}` : 'no games', isT ? ' · today' : ''), React.createElement("div", {
        style: {
          display: 'flex',
          gap: 4,
          height: 7
        }
      }, fg.slice(0, 5).map((g, i) => {
        const ab = favs.includes(g.a) ? g.a : g.h;
        return React.createElement("span", {
          key: i,
          style: {
            width: 7,
            height: 7,
            borderRadius: 99,
            background: cur ? T.invFg : col(ab)
          }
        });
      })));
    };
    return React.createElement("div", {
      style: {
        ...card,
        padding: '16px 18px',
        marginBottom: 18
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 12
      }
    }, "Schedule \xB7 this week"), React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7,1fr)',
        gap: 8
      }
    }, Array.from({
      length: 7
    }, (_, i) => React.createElement(WeekCell, {
      key: i,
      o: wk + i
    }))));
  }
  const lead = new Date(y, m, 1).getDay(),
    days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let dd = 1; dd <= days; dd++) cells.push(offOf(new Date(y, m, dd)));
  const goMonth = delta => setOffset(offOf(new Date(y, m + delta, 1)));
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
    color: T.mut,
    cursor: 'pointer',
    maxWidth: 170
  };
  const monthGames = team === 'all' ? 0 : cells.filter(o => o !== null).reduce((n, o) => n + (slate(o).some(g => g.a === team || g.h === team) ? 1 : 0), 0);
  const MonthCell = ({
    o
  }) => {
    const d = dOf(o),
      gms = slate(o),
      cur = o === offset,
      isT = o === 0;
    if (team !== 'all') {
      const g = gms.find(x => x.a === team || x.h === team);
      const home = g && g.h === team;
      const opp = g ? home ? g.a : g.h : null;
      const final = g && g.st.startsWith('final');
      const won = final && (home && g.hs > g.as || !home && g.as > g.hs);
      return React.createElement("button", {
        onClick: () => setOffset(o),
        className: "er",
        style: {
          textAlign: 'left',
          cursor: 'pointer',
          background: cur ? T.invBg : g ? `${col(team)}12` : T.paper,
          color: cur ? T.invFg : T.ink,
          border: `1px solid ${cur ? T.invBg : g ? col(team) + '55' : T.line}`,
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
          color: cur ? T.invFg : isT ? T.red : T.ink
        }
      }, d.getDate()), g && React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 8.5,
          color: cur ? T.invFg : T.faint,
          opacity: cur ? .7 : 1
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
          fontWeight: 600,
          color: cur ? T.invFg : T.ink
        }
      }, opp), final && React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          color: cur ? T.invFg : won ? '#1a8a4f' : T.faint
        }
      }, won ? 'W' : 'L')) : React.createElement("span", {
        style: {
          color: T.line2,
          fontSize: 11
        }
      }, "\xB7"));
    }
    const hasFav = favG(gms).length > 0;
    return React.createElement("button", {
      onClick: () => setOffset(o),
      className: "er",
      style: {
        textAlign: 'left',
        cursor: 'pointer',
        background: cur ? T.invBg : T.paper,
        color: cur ? T.invFg : T.ink,
        border: `1px solid ${cur ? T.invBg : T.line}`,
        borderRadius: 8,
        padding: '7px 8px',
        height: 52,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
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
        fontSize: 12.5,
        color: cur ? T.invFg : isT ? T.red : T.ink
      }
    }, d.getDate()), hasFav && React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: cur ? T.invFg : T.red
      }
    })), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: cur ? T.invFg : T.faint,
        opacity: cur ? .7 : 1
      }
    }, gms.length ? `${gms.length}` : ''));
  };
  return React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px',
      marginTop: 18
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
  }, React.createElement("span", {
    style: ML
  }, "Schedule \xB7 ", MO[m], " ", y), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, React.createElement("select", {
    value: team,
    onChange: e => setTeam(e.target.value),
    style: selSty
  }, React.createElement("option", {
    value: "all"
  }, "All teams"), teamsAZ.map(a => React.createElement("option", {
    key: a,
    value: a
  }, city(a), " ", nick(a)))), React.createElement("div", {
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
  }, "\u203A")))), team !== 'all' && React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: 12,
      padding: '9px 12px',
      borderRadius: 10,
      background: `${col(team)}10`,
      border: `1px solid ${col(team)}33`
    }
  }, React.createElement(Badge, {
    ab: team,
    size: 22
  }), React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, city(team), " ", nick(team)), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut,
      marginLeft: 'auto'
    }
  }, monthGames, " games in ", MO[m])), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 6
    }
  }, WD.map(w => React.createElement("div", {
    key: w,
    style: {
      ...ML,
      fontSize: 9,
      textAlign: 'center',
      paddingBottom: 2
    }
  }, w[0])), cells.map((o, i) => o === null ? React.createElement("div", {
    key: i
  }) : React.createElement(MonthCell, {
    key: i,
    o: o
  }))), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint,
      marginTop: 12
    }
  }, team === 'all' ? React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.red,
      display: 'inline-block'
    }
  }), "number = games that day \xB7 dot = a followed team plays \xB7 tap a day to view it") : 'VS = home · @ = away · W/L shows final results · tap a day to view its slate'));
}
const loadF = () => {
  try {
    return JSON.parse(localStorage.getItem('e_favs') || '[]');
  } catch {
    return [];
  }
};
const saveF = f => localStorage.setItem('e_favs', JSON.stringify(f));
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
function Digit({
  v,
  size
}) {
  return React.createElement("span", {
    style: {
      display: 'inline-block',
      height: size,
      overflow: 'hidden',
      width: size * 0.6,
      verticalAlign: 'top'
    }
  }, React.createElement("span", {
    className: "ed-col",
    style: {
      display: 'flex',
      flexDirection: 'column',
      transform: `translateY(-${v * size}px)`
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => React.createElement("span", {
    key: d,
    style: {
      height: size,
      lineHeight: `${size}px`,
      fontSize: size * 0.92,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center'
    }
  }, d))));
}
function Roll({
  n,
  size
}) {
  return React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, String(n).split('').map((d, i) => React.createElement(Digit, {
    key: i,
    v: +d,
    size: size
  })));
}
function useLive(g) {
  const [s, setS] = useState({
    as: g.as,
    hs: g.hs,
    clk: g.clk
  });
  useEffect(() => {
    setS({
      as: g.as,
      hs: g.hs,
      clk: g.clk
    });
    if (g.st !== 'live') return;
    const t = setInterval(() => setS(p => {
      let [m, sec] = (p.clk || '20:00').split(':').map(Number);
      sec -= 8;
      if (sec < 0) {
        sec += 60;
        m = Math.max(0, m - 1);
      }
      const clk = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      if (Math.random() < .22) {
        const side = Math.random() < .5 ? 'as' : 'hs';
        return {
          ...p,
          [side]: p[side] + 1,
          clk
        };
      }
      return {
        ...p,
        clk
      };
    }), 2800);
    return () => clearInterval(t);
  }, [g.id]);
  return s;
}
function useLiveEdge(g) {
  const base = useMemo(() => window.BC.liveEdge ? BC.liveEdge(g) : null, [g.id]);
  const [e, setE] = useState(base);
  useEffect(() => {
    setE(base);
    if (!base || g.st !== 'live') return;
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
      R = () => Math.random();
    const t = setInterval(() => setE(p => {
      if (!p) return p;
      const att = {
        a: p.att.a + (R() < .5 ? 1 : 0),
        h: p.att.h + (R() < .5 ? 1 : 0)
      };
      const xg = {
        a: +(p.xg.a + (att.a > p.att.a ? R() * 0.14 : 0)).toFixed(2),
        h: +(p.xg.h + (att.h > p.att.h ? R() * 0.14 : 0)).toFixed(2)
      };
      const momentum = +cl(p.momentum + (R() * 2 - 1) * 0.16, -1, 1).toFixed(2);
      const dist = {
        a: +(p.dist.a + R() * 0.35).toFixed(1),
        h: +(p.dist.h + R() * 0.35).toFixed(1)
      };
      const oza = Math.round(cl(p.oz.a + (R() * 2 - 1) * 2, 38, 62));
      const oz = {
        a: oza,
        h: 100 - oza
      };
      const hits = {
        a: p.hits.a + (R() < .28 ? 1 : 0),
        h: p.hits.h + (R() < .28 ? 1 : 0)
      };
      const hardest = {
        ...p.hardest
      };
      if (R() < .22) {
        const k = R() < .5 ? 'a' : 'h';
        hardest[k] = Math.max(p.hardest[k], +cl(p.hardest[k] + (R() * 4 - 1), 80, 106).toFixed(1));
      }
      const topspd = {
        ...p.topspd
      };
      if (R() < .18) {
        const k = R() < .5 ? 'a' : 'h';
        topspd[k] = Math.max(p.topspd[k], +cl(p.topspd[k] + R() * 0.6, 20, 25.9).toFixed(1));
      }
      return {
        ...p,
        att,
        momentum,
        dist,
        oz,
        hits,
        hardest,
        topspd,
        xg
      };
    }), 2600);
    return () => clearInterval(t);
  }, [g.id]);
  return e;
}
function useLivePlayers(g) {
  const base = useMemo(() => window.BC.liveGamePlayers ? BC.liveGamePlayers(g) : null, [g.id]);
  const [d, setD] = useState(base);
  useEffect(() => {
    setD(base);
    if (!base || g.st !== 'live') return;
    const R = () => Math.random();
    const step = arr => {
      let a = arr.map(p => {
        if (p.isG) {
          let q = {
            ...p
          };
          if (R() < 0.16) {
            q.sa = p.sa + 1;
            if (R() < 0.86) q.saves = p.saves + 1;else q.ga = p.ga + 1;
            if (R() < 0.4) {
              q.hdSa = p.hdSa + 1;
              if (R() < 0.8) q.hdSaves = p.hdSaves + 1;
            }
          }
          if (R() < 0.08) q.freezes = p.freezes + 1;
          q.toiSec = p.toiSec + 3;
          return q;
        }
        return p.onIce ? {
          ...p,
          toiSec: p.toiSec + 3,
          dist: +(p.dist + 0.012 + R() * 0.01).toFixed(2),
          shiftSec: p.shiftSec + 3
        } : p;
      });
      if (R() < 0.5) {
        const sk = a.filter(p => !p.isG),
          onIce = sk.filter(p => p.onIce),
          bench = sk.filter(p => !p.onIce);
        const out = onIce.filter(p => p.shiftSec > 40)[0];
        if (out && bench.length) {
          const cand = bench.filter(p => p.pos === 'D' === (out.pos === 'D'));
          const pool = cand.length ? cand : bench;
          const inn = pool[Math.floor(R() * pool.length)];
          a = a.map(p => p.id === out.id ? {
            ...p,
            onIce: false,
            shiftSec: 0
          } : p.id === inn.id ? {
            ...p,
            onIce: true,
            shiftSec: 0,
            shifts: p.shifts + 1
          } : p);
        }
      }
      return a.map(p => {
        if (p.isG) return p;
        let q = p;
        if (R() < 0.06) q = {
          ...q,
          topSpd: Math.max(q.topSpd, +(q.topSpd + R() * 0.5).toFixed(1))
        };
        if (R() < 0.05) q = {
          ...q,
          hardest: Math.max(q.hardest, +(q.hardest + R() * 3).toFixed(1)),
          att: q.att + 1
        };
        if (R() < 0.03) q = {
          ...q,
          sog: q.sog + 1
        };
        return q;
      });
    };
    const t = setInterval(() => setD(prev => prev ? {
      ...prev,
      [g.a]: step(prev[g.a]),
      [g.h]: step(prev[g.h])
    } : prev), 2600);
    return () => clearInterval(t);
  }, [g.id]);
  return d;
}
function useLiveSituation(g) {
  const [st, setSt] = useState({
    type: 'EV',
    team: null,
    strength: '5-on-5',
    sec: 0
  });
  useEffect(() => {
    setSt({
      type: 'EV',
      team: null,
      strength: '5-on-5',
      sec: 0
    });
    if (g.st !== 'live') return;
    const iv = setInterval(() => setSt(p => {
      if (p.type === 'PP') {
        const sec = p.sec - 1;
        return sec <= 0 ? {
          type: 'EV',
          team: null,
          strength: '5-on-5',
          sec: 0
        } : {
          ...p,
          sec
        };
      }
      if (Math.random() < 0.06) {
        const team = Math.random() < 0.5 ? g.a : g.h;
        const two = Math.random() < 0.15;
        return {
          type: 'PP',
          team,
          strength: two ? '5-on-3' : '5-on-4',
          sec: two ? 90 : 120,
          max: two ? 90 : 120
        };
      }
      return p;
    }), 1000);
    return () => clearInterval(iv);
  }, [g.id, g.st]);
  return st;
}
function ProvTag({
  kind
}) {
  const map = {
    live: ['live feed', T.red, true],
    proj: ['projected', T.faint, false],
    day: ['official next-day', T.faint, false]
  };
  const [txt, clr, dot] = map[kind] || map.proj;
  return React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: clr,
      border: `1px solid ${T.line2}`,
      borderRadius: 5,
      padding: '2px 6px',
      whiteSpace: 'nowrap'
    }
  }, dot && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: clr,
      display: 'inline-block'
    }
  }), txt);
}
function Star({
  on,
  onClick
}) {
  return React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 3,
      lineHeight: 0,
      color: on ? T.red : T.faint
    },
    "aria-label": "follow"
  }, React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: on ? T.red : 'none',
    stroke: "currentColor",
    strokeWidth: "2"
  }, React.createElement("polygon", {
    points: "12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9"
  })));
}
function GameCard({
  g,
  favs,
  toggleFav,
  onOpen
}) {
  const s = useLive(g);
  const le = useLiveEdge(g);
  const [exp, setExp] = useState(false);
  const x = useMemo(() => g.st !== 'pre' ? BC.gameExtras(g) : null, [g.id]);
  const live = g.st === 'live',
    final = g.st.startsWith('final');
  const aw = final && s.as > s.hs,
    hw = final && s.hs > s.as;
  const clkPct = live ? (() => {
    const [m, sec] = (s.clk || '20:00').split(':').map(Number);
    return Math.max(2, Math.min(100, (1 - (m * 60 + sec) / 1200) * 100));
  })() : 0;
  const Row = ({
    ab,
    sc,
    won
  }) => React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '7px 0'
    }
  }, React.createElement("span", {
    style: {
      width: 3,
      height: 26,
      borderRadius: 2,
      background: col(ab)
    }
  }), React.createElement(Badge, {
    ab: ab,
    size: 28
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: won ? 700 : 600,
      fontSize: 14,
      color: T.ink
    }
  }, city(ab)), React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.mut
    }
  }, nick(ab))), g.st !== 'pre' ? React.createElement(Roll, {
    n: sc,
    size: 24
  }) : React.createElement("span", {
    style: {
      color: T.faint,
      fontSize: 18
    }
  }, "\u2013"), React.createElement(Star, {
    on: favs.includes(ab),
    onClick: () => toggleFav(ab)
  }));
  return React.createElement("div", {
    className: "ec",
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, live && React.createElement("div", {
    style: {
      height: 2,
      background: T.line
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${clkPct}%`,
      background: T.red,
      transition: 'width .6s linear'
    }
  })), React.createElement("div", {
    onClick: () => onOpen(g),
    style: {
      padding: '13px 16px 4px',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: live ? T.red : final ? T.faint : '#1a8a4f',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, live && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.red,
      display: 'inline-block'
    }
  }), live ? `Live · ${g.per} ${s.clk}` : final ? g.ot ? 'Final/OT' : 'Final' : g.start)), React.createElement(Row, {
    ab: g.a,
    sc: s.as,
    won: aw
  }), React.createElement(Row, {
    ab: g.h,
    sc: s.hs,
    won: hw
  })), live && le && (() => {
    const tot = le.att.a + le.att.h || 1,
      ap = Math.round(le.att.a / tot * 100);
    return React.createElement("div", {
      style: {
        padding: '0 16px 10px'
      },
      title: "Live shot-attempt share"
    }, React.createElement("div", {
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
        background: col(g.a)
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        background: col(g.h)
      }
    })), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: '.04em',
        color: T.faint
      }
    }, React.createElement("span", null, g.a, " ", le.att.a, " ATT"), React.createElement("span", null, ap, "% / ", 100 - ap, "%"), React.createElement("span", null, le.att.h, " ATT ", g.h)));
  })(), React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px 12px'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, g.st !== 'pre' ? `${g.sa}–${g.sh} SOG` : 'puck drop soon'), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, g.st !== 'pre' && React.createElement(Spark, {
    data: g.mom,
    color: s.as >= s.hs ? col(g.a) : col(g.h)
  }), x && React.createElement("button", {
    onClick: () => setExp(e => !e),
    style: {
      fontFamily: MONO,
      fontSize: 10,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      background: 'none',
      border: 'none',
      color: T.faint,
      cursor: 'pointer'
    }
  }, exp ? 'hide ▲' : 'details ▼'))), exp && x && React.createElement("div", {
    style: {
      borderTop: `1px solid ${T.line}`,
      background: T.bg,
      padding: '12px 16px',
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut,
      lineHeight: 1.7
    }
  }, g.st !== 'pre' && React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, "line: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, g.a, " ", x.line.away.join('-'), " \xB7 ", g.h, " ", x.line.home.join('-'))), React.createElement("div", null, "leaders: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, x.leaders.away.name, " (", g.a, ", ", x.leaders.away.p, "P) \xB7 ", x.leaders.home.name, " (", g.h, ", ", x.leaders.home.p, "P)")), React.createElement("div", null, "goalies: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, x.goalies.away ? x.goalies.away.name : 'TBD', " \xB7 ", x.goalies.home ? x.goalies.home.name : 'TBD')), le && g.st !== 'pre' && React.createElement("div", {
    style: {
      marginTop: 6,
      paddingTop: 6,
      borderTop: `1px solid ${T.line}`
    }
  }, "edge: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, "\u26A1 ", Math.max(le.hardest.a, le.hardest.h), " mph hardest \xB7 ", Math.max(le.topspd.a, le.topspd.h), " mph top skate \xB7 ", (le.dist.a + le.dist.h).toFixed(1), " mi skated")), x.tv.length > 0 && React.createElement("div", null, "tv: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, x.tv.join(' · '))), React.createElement("div", null, "venue: ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, x.venue)), React.createElement("button", {
    onClick: () => onOpen(g),
    className: "el",
    style: {
      marginTop: 8,
      background: 'none',
      border: `1px solid ${T.line2}`,
      borderRadius: 7,
      padding: '5px 10px',
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.ink,
      cursor: 'pointer'
    }
  }, "open game center \u2192")));
}
function GameDetail({
  g,
  onBack,
  onTeam
}) {
  const dMock = useMemo(() => detail(g), [g.id]);
  const gl = window.E_useLive(null, () => g.st !== 'pre' && window.NHL && window.NHL.gameLive ? window.NHL.gameLive(g.id) : null, [g.id]);
  const d = gl ? {
    ...dMock,
    goals: gl.goals && gl.goals.length ? gl.goals : dMock.goals,
    stars: gl.stars && gl.stars.length ? gl.stars : dMock.stars,
    away: {
      ...dMock.away,
      team: {
        ...dMock.away.team,
        ...(gl.teamA || {})
      }
    },
    home: {
      ...dMock.home,
      team: {
        ...dMock.home.team,
        ...(gl.teamH || {})
      }
    }
  } : dMock;
  const series = useMemo(() => BC.seasonSeries(g), [g.id]);
  const pbpMock = useMemo(() => BC.playByPlay(g), [g.id]);
  const pbp = window.E_useLive(pbpMock, () => g.st !== 'pre' && window.NHL && window.NHL.gamePbp ? window.NHL.gamePbp(g.id) : null, [g.id]);
  const recapMock = useMemo(() => g.st.startsWith('final') ? BC.gameRecap(g) : '', [g.id]);
  const recap = window.E_useLive(recapMock, () => g.st.startsWith('final') && window.NHL && window.NHL.gameRecapMapped ? window.NHL.gameRecapMapped(g.id) : null, [g.id]);
  const bxMock = useMemo(() => BC.broadcasts(g), [g.id]);
  const bx = window.E_useLive(bxMock, () => g.st !== 'pre' && window.NHL && window.NHL.gameBroadcasts ? window.NHL.gameBroadcasts(g.id).then(b => b ? {
    ...bxMock,
    ...b
  } : null) : null, [g.id]);
  const offMock = useMemo(() => BC.officials ? BC.officials(g) : null, [g.id]);
  const off = window.E_useLive(offMock, () => g.st !== 'pre' && window.NHL && window.NHL.gameOfficials ? window.NHL.gameOfficials(g.id) : null, [g.id]);
  const replays = useMemo(() => g.st !== 'pre' ? BC.goalReplays(g) : [], [g.id]);
  const [replayId, setReplayId] = useState(null);
  const [replayKey, setReplayKey] = useState(0);
  const shiftsMock = useMemo(() => g.st !== 'pre' ? BC.shiftChart(g) : {
    away: [],
    home: []
  }, [g.id]);
  const shifts = window.E_useLive(shiftsMock, () => g.st !== 'pre' && window.NHL && window.NHL.shiftChartMapped ? window.NHL.shiftChartMapped(g.id, g.a, g.h) : null, [g.id]);
  const shotData = useMemo(() => g.st !== 'pre' && BC.shotMap ? BC.shotMap(g) : [], [g.id]);
  const boxMock = useMemo(() => g.st !== 'pre' && BC.boxStats ? BC.boxStats(g) : null, [g.id]);
  const box = (() => {
    const base = boxMock || null;
    if (!(gl && gl.box)) return base;
    const lb = gl.box;
    const teamOk = lb.team && lb.team[g.a] && lb.team[g.h];
    const lineOk = lb.line && lb.line.away && lb.line.home;
    return {
      ...(base || {}),
      ...lb,
      team: teamOk ? lb.team : base && base.team || lb.team,
      line: lineOk ? lb.line : base && base.line || lb.line,
      periods: lb.periods && lb.periods.length ? lb.periods : base && base.periods || lb.periods,
      skaters: lb.skaters || base && base.skaters,
      goalies: lb.goalies || base && base.goalies,
      scratches: lb.scratches || base && base.scratches || {
        [g.a]: [],
        [g.h]: []
      }
    };
  })();
  const bt = ab => box && box.team && box.team[ab] || null;
  const [ev, setEv] = useState('All');
  const [shared, setShared] = useState(false);
  const copyLink = () => {
    const url = location.href;
    const done = () => {
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    };
    try {
      navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url).then(done, done) : done();
    } catch (e) {
      done();
    }
  };
  const feed = pbp.filter(e => ev === 'All' || e.type === ev);
  const final = g.st.startsWith('final');
  const live = g.st === 'live',
    pre = g.st === 'pre';
  const s = useLive(g);
  const le = useLiveEdge(g);
  const lp = useLivePlayers(g);
  const sit = useLiveSituation(g);
  const stt = window.BC.specialTeams ? BC.specialTeams(g) : null;
  const xgA = le ? +le.xg.a : 0,
    xgH = le ? +le.xg.h : 0;
  const clkRem = (() => {
    const a = (s.clk || '20:00').split(':').map(Number);
    return (a[0] || 0) * 60 + (a[1] || 0);
  })();
  const perIdx = {
    '1st': 0,
    '2nd': 1,
    '3rd': 2,
    'OT': 3
  }[g.per] || 0;
  const elapsed = pre ? 0 : final ? 1 : Math.min(1, (perIdx * 1200 + (1200 - clkRem)) / 3600);
  const wpA = pre ? 0.5 : Math.max(0.01, Math.min(0.99, 1 / (1 + Math.exp(-((s.as - s.hs) * 0.72 + (xgA - xgH) * 0.32) * (0.7 + elapsed * 1.05)))));
  const [followAb, setFollowAb] = useState(g.a);
  const [followId, setFollowId] = useState(() => {
    try {
      return localStorage.getItem('e_follow_' + g.id) || '';
    } catch (e) {
      return '';
    }
  });
  const pickFollow = (ab, id) => {
    setFollowAb(ab);
    setFollowId(id);
    try {
      localStorage.setItem('e_follow_' + g.id, id);
    } catch (e) {}
  };
  const fmtTOI = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  const fRoster = lp ? lp[followAb] || [] : [];
  const fSel = fRoster.find(p => p.id === followId) || fRoster[0];
  const liveLabel = live ? 'Live' : 'Game flow';
  const tabs = pre ? ['Box score'] : [liveLabel, 'Box score', 'Lineups'];
  const [tab, setTab] = useState(live ? liveLabel : 'Box score');
  const attTot = le ? le.att.a + le.att.h || 1 : 1;
  const aShare = le ? Math.round(le.att.a / attTot * 100) : 50;
  const hard = le ? le.hardest.a >= le.hardest.h ? {
    mph: le.hardest.a,
    by: le.hardest.aby,
    team: g.a
  } : {
    mph: le.hardest.h,
    by: le.hardest.hby,
    team: g.h
  } : null;
  const fast = le ? le.topspd.a >= le.topspd.h ? {
    mph: le.topspd.a,
    by: le.topspd.aby,
    team: g.a
  } : {
    mph: le.topspd.h,
    by: le.topspd.hby,
    team: g.h
  } : null;
  const mTeam = le ? le.momentum >= 0 ? g.h : g.a : g.h,
    mAbs = le ? Math.abs(le.momentum) : 0;
  const mTxt = mAbs < 0.16 ? 'Even play' : `▲ ${mTeam} pushing`;
  const liveFeed = pbp.slice(-7).reverse();
  const StatBig = ({
    label,
    value,
    unit,
    sub,
    team
  }) => React.createElement("div", {
    style: {
      ...card,
      padding: '14px 16px'
    }
  }, React.createElement("div", {
    style: ML
  }, label), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4,
      marginTop: 7
    }
  }, React.createElement("span", {
    style: {
      fontSize: 33,
      fontWeight: 600,
      letterSpacing: '-.03em',
      color: team ? col(team) : T.ink,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), unit && React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 12.5,
      color: T.mut
    }
  }, unit)), sub && React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint,
      marginTop: 7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, sub));
  const Lines = ({
    side,
    ab
  }) => {
    const rows = box && box.skaters && box.skaters[ab] || d[side].lines;
    const gb = box && box.goalies && box.goalies[ab];
    return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '12px 16px',
        borderBottom: `1px solid ${T.line}`
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 24
    }), React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, city(ab), " ", nick(ab))), React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, React.createElement("table", {
      style: {
        width: '100%',
        minWidth: 360,
        borderCollapse: 'collapse',
        fontSize: 13
      }
    }, React.createElement("thead", null, React.createElement("tr", {
      style: ML
    }, ['Skater', 'G', 'A', 'P', 'SOG', '+/-', 'HIT', 'BLK', 'TOI'].map((h, i) => React.createElement("th", {
      key: h,
      style: {
        padding: '8px 11px',
        textAlign: i ? 'center' : 'left',
        fontWeight: 600,
        ...ML,
        whiteSpace: 'nowrap'
      }
    }, h)))), React.createElement("tbody", null, rows.slice(0, 8).map((p, i) => React.createElement("tr", {
      key: i,
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '7px 11px',
        color: T.ink,
        whiteSpace: 'nowrap'
      }
    }, p.name, " ", React.createElement("span", {
      style: {
        color: T.faint
      }
    }, p.pos)), [['g', p.g], ['a', p.a], ['p', p.p], ['sog', p.sog], ['pm', p.pm == null ? '–' : (p.pm > 0 ? '+' : '') + p.pm], ['hits', p.hits == null ? '–' : p.hits], ['blk', p.blk == null ? '–' : p.blk], ['toi', p.toi]].map(([k, v]) => React.createElement("td", {
      key: k,
      style: {
        padding: '7px 11px',
        textAlign: 'center',
        fontFamily: k === 'toi' ? MONO : 'inherit',
        fontWeight: k === 'p' ? 700 : 400,
        color: k === 'p' ? T.ink : T.mut
      }
    }, v))))))), gb && React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderTop: `1px solid ${T.line}`,
        background: T.bg,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: {
        ...ML,
        fontSize: 9
      }
    }, "Goalie"), React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink,
        fontSize: 13
      }
    }, gb.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut
      }
    }, gb.saves, "/", gb.sa, " SV \xB7 ", gb.svp, " \xB7 ", gb.ga, " GA \xB7 ", gb.toi, gb.dec !== '—' ? ` · ${gb.dec}` : '')));
  };
  const liveView = React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: MONO,
      fontSize: 11,
      color: live ? T.red : T.faint,
      flexWrap: 'wrap'
    }
  }, live && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.red,
      display: 'inline-block'
    }
  }), React.createElement("span", {
    style: {
      letterSpacing: '.1em',
      textTransform: 'uppercase'
    }
  }, live ? `Live · ${g.per} ${s.clk}` : final ? 'Final · Edge summary' : g.start), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: T.faint,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, "NHL Edge \xB7 player & puck tracking"), React.createElement(ProvTag, {
    kind: "proj"
  })), (() => {
    const pp = sit.type === 'PP';
    const max = sit.max || (sit.strength === '5-on-3' ? 90 : 120);
    return React.createElement("div", {
      style: {
        ...card,
        padding: '12px 16px',
        boxShadow: pp ? `inset 3px 0 0 ${col(sit.team)}` : 'none'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, pp ? React.createElement(React.Fragment, null, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: col(sit.team),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement("span", {
      className: "ed-pulse",
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: col(sit.team),
        display: 'inline-block'
      }
    }), "Power play \xB7 ", sit.team, " ", sit.strength), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: 700,
        color: T.ink
      }
    }, fmtTOI(sit.sec)), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 80,
        height: 6,
        borderRadius: 3,
        background: T.bg,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        height: '100%',
        width: `${sit.sec / max * 100}%`,
        background: col(sit.team),
        transition: 'width 1s linear'
      }
    }))) : React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: T.mut
      }
    }, "Even strength \xB7 5-on-5"), React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, React.createElement(ProvTag, {
      kind: "live"
    }))), stt && React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 22px',
        marginTop: 10,
        paddingTop: 10,
        borderTop: `1px solid ${T.line}`,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, [g.a, g.h].map(ab => React.createElement("span", {
      key: ab,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 15
    }), "PP ", React.createElement("b", {
      style: {
        color: T.ink,
        fontWeight: 600
      }
    }, stt[ab].ppG, "/", stt[ab].ppOpp), " \xB7 PK ", React.createElement("b", {
      style: {
        color: T.ink,
        fontWeight: 600
      }
    }, stt[ab].pkK, "/", stt[ab].pkFaced)))));
  })(), React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Pressure \xB7 shot attempts"), React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, mTxt), React.createElement(ProvTag, {
    kind: "live"
  }))), React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 12.5,
      fontWeight: 700,
      marginBottom: 7
    }
  }, React.createElement("span", {
    style: {
      color: col(g.a)
    }
  }, g.a, " ", le ? le.att.a : 0), React.createElement("span", {
    style: {
      color: col(g.h)
    }
  }, le ? le.att.h : 0, " ", g.h)), React.createElement("div", {
    style: {
      display: 'flex',
      height: 14,
      borderRadius: 7,
      overflow: 'hidden',
      background: T.bg,
      position: 'relative'
    }
  }, React.createElement("div", {
    style: {
      width: `${aShare}%`,
      background: col(g.a),
      transition: 'width .8s ease'
    }
  }), React.createElement("div", {
    style: {
      flex: 1,
      background: col(g.h)
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: -2,
      bottom: -2,
      width: 2,
      background: T.paper
    }
  })), React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 6,
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, React.createElement("span", null, aShare, "%"), React.createElement("span", null, 100 - aShare, "%"))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12
    },
    className: "g4"
  }, React.createElement(StatBig, {
    label: "Hardest shot",
    value: hard ? hard.mph : '–',
    unit: "mph",
    sub: hard ? `${hard.by} · ${hard.team}` : '',
    team: hard && hard.team
  }), React.createElement(StatBig, {
    label: "Top skating speed",
    value: fast ? fast.mph : '–',
    unit: "mph",
    sub: fast ? `${fast.by} · ${fast.team}` : '',
    team: fast && fast.team
  }), React.createElement(StatBig, {
    label: "Distance skated",
    value: le ? (le.dist.a + le.dist.h).toFixed(1) : '–',
    unit: "mi",
    sub: "both teams"
  }), React.createElement(StatBig, {
    label: "Game pace",
    value: le ? le.pace : '–',
    unit: "att/60",
    sub: "combined attempts"
  })), React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11,
      gap: 10,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Win probability"), React.createElement(ProvTag, {
    kind: "proj"
  })), React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 12.5,
      fontWeight: 700,
      marginBottom: 7
    }
  }, React.createElement("span", {
    style: {
      color: col(g.a)
    }
  }, g.a, " ", Math.round(wpA * 100), "%"), React.createElement("span", {
    style: {
      color: col(g.h)
    }
  }, 100 - Math.round(wpA * 100), "% ", g.h)), React.createElement("div", {
    style: {
      display: 'flex',
      height: 14,
      borderRadius: 7,
      overflow: 'hidden',
      background: T.bg
    }
  }, React.createElement("div", {
    style: {
      width: `${wpA * 100}%`,
      background: col(g.a),
      transition: 'width 1s ease'
    }
  }), React.createElement("div", {
    style: {
      flex: 1,
      background: col(g.h)
    }
  })), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 13,
      borderTop: `1px solid ${T.line}`,
      flexWrap: 'wrap',
      gap: 10
    }
  }, React.createElement("span", {
    style: ML
  }, "Expected goals \xB7 xG"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 13,
      color: T.mut
    }
  }, React.createElement("b", {
    style: {
      color: col(g.a)
    }
  }, xgA.toFixed(1)), " \u2013 ", React.createElement("b", {
    style: {
      color: col(g.h)
    }
  }, xgH.toFixed(1)), " xG ", React.createElement("span", {
    style: {
      color: T.faint
    }
  }, "\xB7 actual ", s.as, "\u2013", s.hs)))), le && React.createElement("div", {
    style: {
      ...card,
      padding: '14px 18px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, React.createElement("span", {
    style: ML
  }, "Offensive-zone time"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, g.a, " ", le.oz.a, "% \xB7 ", le.oz.h, "% ", g.h)), React.createElement("div", {
    style: {
      display: 'flex',
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      background: T.bg
    }
  }, React.createElement("div", {
    style: {
      width: `${le.oz.a}%`,
      background: col(g.a),
      transition: 'width .8s ease'
    }
  }), React.createElement("div", {
    style: {
      flex: 1,
      background: col(g.h)
    }
  }))), window.E_LiveRink && React.createElement(window.E_LiveRink, {
    g: g,
    focus: fSel,
    players: lp ? [...(lp[g.a] || []), ...(lp[g.h] || [])].filter(p => p.onIce) : [],
    onPick: p => pickFollow(p.team, p.id),
    shots: shotData
  }), liveFeed.length > 0 && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderBottom: `1px solid ${T.line}`
    }
  }, live && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.red,
      display: 'inline-block'
    }
  }), React.createElement("span", {
    style: ML
  }, live ? 'Latest' : 'Key plays')), liveFeed.map((e, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      width: 62
    }
  }, e.per, " ", e.time), React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: col(e.team),
      flexShrink: 0
    }
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: e.type === 'Goal' ? T.ink : T.mut,
      fontWeight: e.type === 'Goal' ? 600 : 400
    }
  }, e.desc)))));
  const lineupsView = lp && fSel ? React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
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
      gap: 10,
      borderBottom: `1px solid ${T.line}`,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: ML
  }, "Lineups"), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "tap any name to follow \xB7 see them on Live")), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      borderBottom: `1px solid ${T.line}`
    },
    className: "g2"
  }, [g.a, g.h].map((ab, ci) => React.createElement("div", {
    key: ab,
    style: {
      padding: '12px 14px',
      borderRight: ci === 0 ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 18
  }), React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: T.ink
    }
  }, city(ab)), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: MONO,
      fontSize: 9.5,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: '#1a8a4f'
    }
  }, (lp[ab] || []).filter(p => p.onIce && !p.isG).length, " on ice")), [['On ice', p => p.onIce && !p.isG], ['Goalie', p => p.isG], ['Bench', p => !p.onIce && !p.isG]].map(([grp, f]) => {
    const rows = (lp[ab] || []).filter(f);
    if (!rows.length) return null;
    return React.createElement("div", {
      key: grp,
      style: {
        marginBottom: 7
      }
    }, React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 8.5,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: T.faint,
        margin: '0 0 3px 2px'
      }
    }, grp), rows.map(p => {
      const onSel = p.id === fSel.id;
      return React.createElement("button", {
        key: p.id,
        onClick: () => pickFollow(ab, p.id),
        className: "er",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '5px 7px',
          borderRadius: 7,
          border: 'none',
          background: onSel ? `${col(ab)}1c` : 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left'
        }
      }, React.createElement("span", {
        style: {
          width: 6,
          height: 6,
          borderRadius: 99,
          background: p.onIce ? '#1a8a4f' : T.line2,
          flexShrink: 0
        }
      }), React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 11,
          color: onSel ? T.ink : T.faint,
          width: 24,
          flexShrink: 0
        }
      }, "#", p.num), React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 12.5,
          fontWeight: onSel ? 700 : 500,
          color: T.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, p.name), React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 10,
          color: T.faint,
          flexShrink: 0
        }
      }, p.pos));
    }));
  })))), React.createElement("div", {
    style: {
      padding: '16px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, React.createElement(PlayerAvatar, {
    pos: fSel.pos,
    team: fSel.team,
    name: fSel.name,
    size: 48
  }), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: T.ink
    }
  }, fSel.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, "#", fSel.num, " \xB7 ", city(fSel.team), " \xB7 ", fSel.pos)), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      padding: '6px 11px',
      borderRadius: 999,
      background: fSel.onIce ? T.posBg : T.bg,
      color: fSel.onIce ? T.posFg : T.faint,
      border: `1px solid ${fSel.onIce ? T.posFg + '55' : T.line2}`
    }
  }, fSel.onIce && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.posFg,
      display: 'inline-block'
    }
  }), fSel.isG ? 'In net' : fSel.onIce ? `On ice · ${fmtTOI(fSel.shiftSec)}` : 'On bench')), fSel.isG ? (() => {
    const fmtSv = v => v >= 1 ? '1.000' : '.' + String(Math.round(v * 1000)).padStart(3, '0');
    const sv = fSel.sa ? fmtSv(fSel.saves / fSel.sa) : '—',
      hd = fSel.hdSa ? fmtSv(fSel.hdSaves / fSel.hdSa) : '—';
    return React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: '14px 18px'
      },
      className: "g3"
    }, [['Saves', fSel.saves, ''], ['Shots against', fSel.sa, ''], ['Save %', sv, ''], ['High-danger SV%', hd, ''], ['Goals against', fSel.ga, ''], ['Freezes', fSel.freezes, '']].map(([l, v, u]) => React.createElement("div", {
      key: l
    }, React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 600,
        color: T.ink,
        letterSpacing: '-.02em',
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums'
      }
    }, v, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut,
        fontWeight: 400
      }
    }, u)), React.createElement("div", {
      style: {
        ...ML,
        marginTop: 3
      }
    }, l)))), React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 6
      }
    }, React.createElement("span", {
      style: ML
    }, "High-danger saves"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint
      }
    }, fSel.hdSaves, "/", fSel.hdSa, " stopped")), React.createElement("div", {
      style: {
        display: 'flex',
        height: 9,
        borderRadius: 5,
        overflow: 'hidden',
        background: T.bg
      }
    }, React.createElement("div", {
      style: {
        width: `${fSel.hdSa ? fSel.hdSaves / fSel.hdSa * 100 : 0}%`,
        background: col(fSel.team)
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        background: T.red,
        opacity: .5
      }
    }))), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, "TOI ", fmtTOI(fSel.toiSec), " \xB7 GA ", fSel.ga), React.createElement("span", {
      style: {
        marginLeft: 'auto',
        display: 'inline-flex',
        gap: 6
      }
    }, React.createElement(ProvTag, {
      kind: "proj"
    }), React.createElement(ProvTag, {
      kind: "day"
    }))));
  })() : React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '14px 18px'
    },
    className: "g3"
  }, [['Time on ice', fmtTOI(fSel.toiSec), ''], ['Shifts', fSel.shifts, ''], ['Top speed', fSel.topSpd, ' mph'], ['Distance', fSel.dist, ' mi'], ['Hardest shot', fSel.hardest, ' mph'], ['20+ bursts', fSel.b20, '']].map(([l, v, u]) => React.createElement("div", {
    key: l
  }, React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 600,
      color: T.ink,
      letterSpacing: '-.02em',
      lineHeight: 1.1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, v, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut,
      fontWeight: 400
    }
  }, u)), React.createElement("div", {
    style: {
      ...ML,
      marginTop: 3
    }
  }, l)))), React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: ML
  }, "Zone time"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      color: T.faint
    }
  }, "O ", fSel.oz.o, "% \xB7 N ", fSel.oz.n, "% \xB7 D ", fSel.oz.d, "%")), React.createElement("div", {
    style: {
      display: 'flex',
      height: 9,
      borderRadius: 5,
      overflow: 'hidden',
      background: T.bg
    }
  }, React.createElement("div", {
    style: {
      width: `${fSel.oz.o}%`,
      background: col(fSel.team)
    }
  }), React.createElement("div", {
    style: {
      width: `${fSel.oz.n}%`,
      background: T.line2
    }
  }), React.createElement("div", {
    style: {
      flex: 1,
      background: T.faint
    }
  }))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "SOG ", fSel.sog, " \xB7 ATT ", fSel.att, " \xB7 HIT ", fSel.hits, " \xB7 BLK ", fSel.blk), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      gap: 6
    }
  }, React.createElement(ProvTag, {
    kind: "proj"
  }), React.createElement(ProvTag, {
    kind: "day"
  })))))), (() => {
    const pens = pbp.filter(e => e.type === 'Penalty');
    return React.createElement("div", {
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: `1px solid ${T.line}`,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", {
      style: ML
    }, "Officials & penalties"), React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, React.createElement(ProvTag, {
      kind: "live"
    }))), off && React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 24px',
        padding: '12px 16px',
        borderBottom: `1px solid ${T.line}`
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 2
      }
    }, React.createElement("span", {
      style: {
        ...ML,
        fontSize: 9
      }
    }, "Referees"), React.createElement("span", {
      style: {
        fontSize: 13,
        color: T.ink
      }
    }, off.refs.join(' · '))), React.createElement("span", {
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 2
      }
    }, React.createElement("span", {
      style: {
        ...ML,
        fontSize: 9
      }
    }, "Linesmen"), React.createElement("span", {
      style: {
        fontSize: 13,
        color: T.ink
      }
    }, off.linesmen.join(' · ')))), pens.length ? pens.map((e, i) => React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        fontSize: 13
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        width: 62,
        flexShrink: 0
      }
    }, e.per, " ", e.time), React.createElement(Badge, {
      ab: e.team,
      size: 20
    }), React.createElement("span", {
      style: {
        flex: 1,
        color: T.ink,
        fontWeight: 600
      }
    }, e.desc.split('—')[0].trim()), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        whiteSpace: 'nowrap'
      }
    }, e.desc.replace(/^.*?—\s*/, '')))) : React.createElement("div", {
      style: {
        padding: '14px 16px',
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut
      }
    }, "No penalties yet."));
  })(), box && box.scratches && ((box.scratches[g.a] || []).length > 0 || (box.scratches[g.h] || []).length > 0) && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Healthy scratches"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0
    },
    className: "g2"
  }, [g.a, g.h].map((ab, ci) => React.createElement("div", {
    key: ab,
    style: {
      padding: '12px 16px',
      borderRight: ci === 0 ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 7
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 18
  }), React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: T.ink
    }
  }, city(ab))), (box.scratches[ab] || []).length ? (box.scratches[ab] || []).map((n, i) => React.createElement("div", {
    key: i,
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut,
      padding: '2px 0'
    }
  }, n)) : React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint
    }
  }, "none")))))) : React.createElement("div", {
    style: {
      ...card,
      padding: '40px 0',
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, "Lineups available at puck drop.");
  const preView = React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      ...card,
      padding: '40px 18px',
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 22,
      color: T.ink,
      marginBottom: 6
    }
  }, "Game hasn't started"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.mut,
      maxWidth: 440,
      margin: '0 auto'
    }
  }, "Faceoff ", g.start || 'TBD', g._venue || d.venue ? ` · ${g._venue || d.venue}` : '', ". Box score, scoring and play-by-play appear once the puck drops.")), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    },
    className: "g2"
  }, [g.a, g.h].map(ab => {
    const st = BC.standBy && BC.standBy(ab);
    return React.createElement("div", {
      key: ab,
      style: {
        ...card,
        padding: '16px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: st ? 10 : 0
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 28
    }), React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        color: T.ink
      }
    }, city(ab), " ", nick(ab)), st && React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut
      }
    }, st.w, "-", st.l, "-", st.otl, BC.rankOf && BC.rankOf[ab] ? ` · #${BC.rankOf[ab]}` : ''))), st && React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.mut,
        flexWrap: 'wrap'
      }
    }, React.createElement("span", null, "L10 ", React.createElement("b", {
      style: {
        color: T.ink
      }
    }, st.last10 || '—')), React.createElement("span", null, "STRK ", React.createElement("b", {
      style: {
        color: T.ink
      }
    }, st.strk || '—')), React.createElement("span", null, "PTS ", React.createElement("b", {
      style: {
        color: T.ink
      }
    }, st.pts))));
  })));
  const boxScore = React.createElement("div", null, d.stars.length > 0 && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12,
      marginBottom: 16
    },
    className: "g3"
  }, d.stars.map(st => React.createElement("div", {
    key: st.n,
    style: {
      ...card,
      padding: '13px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: 26,
      color: T.faint
    }
  }, st.n), React.createElement(Badge, {
    ab: st.team,
    size: 28
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, st.name), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, st.line))))), box && box.line && box.line.away && box.periods && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`
    }
  }, "Scoring by period"), React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 360,
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: ML
  }, ['Team', ...box.periods, 'Total'].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      padding: '9px 14px',
      textAlign: i ? 'center' : 'left',
      fontWeight: 600,
      ...ML
    }
  }, h)))), React.createElement("tbody", null, [['away', g.a], ['home', g.h]].map(([sd, ab]) => {
    const ln = box.line[sd];
    return React.createElement("tr", {
      key: ab,
      style: {
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement("td", {
      style: {
        padding: '9px 14px'
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 20
    }), React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink
      }
    }, ab))), ln.goals.map((gg, i) => React.createElement("td", {
      key: i,
      style: {
        padding: '9px 14px',
        textAlign: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700,
        color: T.ink
      }
    }, gg), " ", React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: T.faint
      }
    }, ln.shots[i], "sh"))), React.createElement("td", {
      style: {
        padding: '9px 14px',
        textAlign: 'center'
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 15,
        color: T.ink
      }
    }, ln.total), " ", React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: T.faint
      }
    }, ln.sog, "sh")));
  }))))), React.createElement("div", {
    style: {
      ...card,
      padding: '6px 18px',
      marginBottom: 16
    }
  }, (() => {
    const rows = [['Shots on goal', g.sa, g.sh], ['Faceoff %', d.away.team.fo, d.home.team.fo], ['Power play', bt(g.a) ? bt(g.a).pp : d.away.team.pp, bt(g.h) ? bt(g.h).pp : d.home.team.pp], ['Penalty kill', bt(g.a) && bt(g.a).pk, bt(g.h) && bt(g.h).pk], ['Hits', d.away.team.hits, d.home.team.hits], ['Blocked', d.away.team.blk, d.home.team.blk], ['Giveaways', bt(g.a) && bt(g.a).give, bt(g.h) && bt(g.h).give], ['Takeaways', bt(g.a) && bt(g.a).take, bt(g.h) && bt(g.h).take], ['PIM', d.away.team.pim, d.home.team.pim]].filter(rw => rw[1] != null && rw[1] !== false);
    return rows.map(([lab, av, hv], idx) => React.createElement("div", {
      key: lab,
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 14,
        padding: '9px 0',
        borderTop: idx ? `1px solid ${T.line}` : 'none'
      }
    }, React.createElement("span", {
      style: {
        textAlign: 'right',
        fontWeight: 700
      }
    }, av), React.createElement("span", {
      style: {
        width: 130,
        textAlign: 'center',
        ...ML
      }
    }, lab), React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, hv)));
  })()), d.goals.length > 0 && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML
    }
  }, "Scoring"), d.goals.map((go, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 11,
      padding: '9px 16px',
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement(Badge, {
    ab: go.team,
    size: 22
  }), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("span", {
    style: {
      color: T.ink,
      fontSize: 13.5
    }
  }, go.scorer, " ", go.str !== 'EV' && React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      padding: '1px 5px',
      borderRadius: 4,
      background: T.bg,
      color: T.mut,
      marginLeft: 4
    }
  }, go.str)), go.assists && go.assists.length > 0 ? React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      marginTop: 2
    }
  }, "assists: ", go.assists.join(', ')) : React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      marginTop: 2
    }
  }, "unassisted")), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint,
      paddingTop: 2
    }
  }, go.per, " ", go.time)))), g.st !== 'pre' && React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 16
    },
    className: "g2"
  }, React.createElement(Lines, {
    side: "away",
    ab: g.a
  }), React.createElement(Lines, {
    side: "home",
    ab: g.h
  })), React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
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
  }, "Season series"), series.map((m, i) => {
    const aw = m.as > m.hs;
    return React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 16px',
        borderTop: i ? `1px solid ${T.line}` : 'none',
        fontSize: 13
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11.5,
        color: T.faint
      }
    }, m.date), React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, React.createElement(Badge, {
      ab: m.away,
      size: 18
    }), React.createElement("span", {
      style: {
        fontWeight: aw ? 700 : 400
      }
    }, m.as), React.createElement("span", {
      style: {
        color: T.faint
      }
    }, "\u2013"), React.createElement("span", {
      style: {
        fontWeight: !aw ? 700 : 400
      }
    }, m.hs), React.createElement(Badge, {
      ab: m.home,
      size: 18
    })));
  }))), recap && React.createElement("div", {
    style: {
      ...card,
      padding: '16px 18px',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...ML,
      marginBottom: 8
    }
  }, "Recap"), React.createElement("p", {
    style: {
      fontFamily: SERIF,
      fontSize: 17,
      lineHeight: 1.5,
      color: T.ink,
      margin: 0
    }
  }, recap)), replays.length > 0 && React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      padding: '13px 16px',
      ...ML,
      borderBottom: `1px solid ${T.line}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("span", null, "Goal replays"), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "tap to replay the puck path")), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      padding: '14px 16px'
    }
  }, replays.map(go => {
    const on = replayId === go.id;
    return React.createElement("div", {
      key: go.id,
      onClick: () => {
        setReplayId(go.id);
        setReplayKey(k => k + 1);
      },
      style: {
        flexShrink: 0,
        width: 150,
        border: `1.5px solid ${on ? col(go.team) : T.line}`,
        borderRadius: 11,
        overflow: 'hidden',
        cursor: 'pointer'
      },
      className: "ec"
    }, React.createElement("div", {
      style: {
        height: 84,
        background: `linear-gradient(135deg, ${col(go.team)}, ${col(go.team)}aa)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, React.createElement("span", {
      style: {
        width: 0,
        height: 0,
        borderLeft: '16px solid #fff',
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        marginLeft: 4
      }
    })), React.createElement("div", {
      style: {
        padding: '9px 11px'
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, go.scorer), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.mut
      }
    }, go.per, " ", go.time, " \xB7 ", go.str)));
  })), replayId != null && (() => {
    const go = replays.find(x => x.id === replayId) || replays[0];
    if (!go) return null;
    const seed = (go.id * 37 + (go.time ? go.time.length : 0) * 7) % 100;
    const oy = 18 + seed % 64;
    const my = oy < 50 ? oy + 28 : oy - 28;
    return React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.line}`,
        padding: '14px 16px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 600,
        color: T.ink,
        fontSize: 13.5
      }
    }, go.scorer, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 400,
        color: T.mut
      }
    }, ' · ', go.assists && go.assists.length ? `assists: ${go.assists.join(', ')}` : 'unassisted')), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, go.per, " ", go.time, " \xB7 ", go.str)), React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        maxWidth: 540,
        margin: '0 auto'
      }
    }, React.createElement("svg", {
      key: replayKey,
      viewBox: "0 0 200 100",
      style: {
        width: '100%',
        height: 'auto',
        display: 'block'
      }
    }, React.createElement("rect", {
      x: "1",
      y: "1",
      width: "198",
      height: "98",
      rx: "14",
      fill: T.bg,
      stroke: T.line2
    }), React.createElement("line", {
      x1: "100",
      y1: "4",
      x2: "100",
      y2: "96",
      stroke: T.red,
      strokeOpacity: ".22",
      strokeWidth: "1"
    }), React.createElement("line", {
      x1: "170",
      y1: "6",
      x2: "170",
      y2: "94",
      stroke: T.red,
      strokeOpacity: ".4",
      strokeWidth: "1.5"
    }), React.createElement("path", {
      d: "M170 40 a18 18 0 0 1 0 20",
      fill: "none",
      stroke: T.red,
      strokeOpacity: ".3",
      strokeWidth: "1"
    }), React.createElement("rect", {
      x: "183",
      y: "42",
      width: "7",
      height: "16",
      fill: "none",
      stroke: col(go.team),
      strokeWidth: "2"
    }), React.createElement("path", {
      d: `M20 ${oy} Q 118 ${my} 182 50`,
      fill: "none",
      stroke: col(go.team),
      strokeOpacity: ".45",
      strokeWidth: "2",
      strokeDasharray: "3 3"
    }), React.createElement("circle", {
      r: "4",
      fill: col(go.team)
    }, React.createElement("animateMotion", {
      dur: "1.15s",
      repeatCount: "1",
      fill: "freeze",
      keyPoints: "0;1",
      keyTimes: "0;1",
      calcMode: "spline",
      keySplines: "0.3 0 0.5 1",
      path: `M20 ${oy} Q 118 ${my} 181 50`
    })), React.createElement("circle", {
      cx: "186",
      cy: "50",
      r: "3",
      fill: col(go.team),
      opacity: "0"
    }, React.createElement("animate", {
      attributeName: "opacity",
      values: "0;0;1;0.2",
      keyTimes: "0;0.82;0.9;1",
      dur: "1.15s",
      repeatCount: "1",
      fill: "freeze"
    }), React.createElement("animate", {
      attributeName: "r",
      values: "3;3;10",
      keyTimes: "0;0.85;1",
      dur: "1.15s",
      repeatCount: "1",
      fill: "freeze"
    })))));
  })()), g.st !== 'pre' && React.createElement("div", {
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
  }, "Shift chart \xB7 time on ice"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0
    },
    className: "g2"
  }, [['away', g.a], ['home', g.h]].map(([side, ab]) => React.createElement("div", {
    key: side,
    style: {
      padding: '12px 16px',
      borderRight: side === 'away' ? `1px solid ${T.line}` : 'none'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 18
  }), React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600
    }
  }, city(ab))), shifts[side].map((p, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      width: 96,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: T.ink
    }
  }, p.name), React.createElement("div", {
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
      width: `${p.pct}%`,
      background: col(ab)
    }
  })), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut,
      width: 42,
      textAlign: 'right'
    }
  }, p.toi))))))), pbp.length > 0 && React.createElement("div", {
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
      flexWrap: 'wrap',
      gap: 8
    }
  }, React.createElement("span", {
    style: ML
  }, "Play-by-play"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap'
    }
  }, ['All', 'Goal', 'Penalty', 'Shot', 'Hit'].map(t => React.createElement("button", {
    key: t,
    onClick: () => setEv(t),
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      padding: '3px 9px',
      borderRadius: 999,
      border: `1px solid ${ev === t ? T.invBg : T.line2}`,
      background: ev === t ? T.invBg : 'transparent',
      color: ev === t ? T.invFg : T.mut,
      cursor: 'pointer'
    }
  }, t)))), React.createElement("div", {
    style: {
      maxHeight: 340,
      overflowY: 'auto'
    }
  }, feed.length ? feed.map((e, i) => React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      borderTop: i ? `1px solid ${T.line}` : 'none',
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      width: 62
    }
  }, e.per, " ", e.time), React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: col(e.team),
      flexShrink: 0
    }
  }), React.createElement("span", {
    style: {
      flex: 1,
      color: e.type === 'Goal' ? T.ink : T.mut,
      fontWeight: e.type === 'Goal' ? 600 : 400
    }
  }, e.desc))) : React.createElement("div", {
    style: {
      padding: 16,
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, "no events match."))));
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingBottom: 18
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
  }, "\u2190 back to scores"), React.createElement("button", {
    onClick: copyLink,
    className: "el",
    "aria-label": "Share this game",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'none',
      border: `1px solid ${shared ? '#1a8a4f' : T.line2}`,
      borderRadius: 8,
      color: shared ? '#1a8a4f' : T.mut,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      padding: '6px 11px'
    }
  }, React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "3"
  }), React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "3"
  }), React.createElement("circle", {
    cx: "18",
    cy: "19",
    r: "3"
  }), React.createElement("path", {
    d: "M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"
  })), shared ? 'Link copied' : 'Share')), React.createElement("div", {
    style: {
      ...card,
      padding: 0,
      overflow: 'hidden',
      marginBottom: 16,
      background: `linear-gradient(110deg, ${col(g.a)}0e, ${col(g.h)}0e)`
    }
  }, live && React.createElement("div", {
    style: {
      height: 2,
      background: T.line
    }
  }, React.createElement("div", {
    style: {
      height: '100%',
      width: `${(() => {
        const [m, sec] = (s.clk || '20:00').split(':').map(Number);
        return Math.max(2, Math.min(100, (1 - (m * 60 + sec) / 1200) * 100));
      })()}%`,
      background: T.red,
      transition: 'width .6s linear'
    }
  })), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 30,
      maxWidth: 560,
      margin: '0 auto',
      padding: '30px 20px'
    }
  }, [[g.a, s.as], [g.h, s.hs]].map(([ab, sc], idx) => React.createElement(React.Fragment, {
    key: ab
  }, React.createElement("button", {
    onClick: () => onTeam(ab),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'center',
      flex: 1
    }
  }, React.createElement(Badge, {
    ab: ab,
    size: 52
  }), React.createElement("div", {
    style: {
      fontWeight: 600,
      marginTop: 8,
      color: T.ink
    }
  }, city(ab)), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.mut
    }
  }, nick(ab))), idx === 0 && React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 44,
      fontWeight: 600,
      letterSpacing: '-.03em',
      color: T.ink
    }
  }, pre ? '–' : `${s.as}:${s.hs}`), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      color: live ? T.red : final ? T.faint : '#1a8a4f',
      marginTop: 4
    }
  }, live ? `Live · ${g.per} ${s.clk}` : final ? g.ot ? 'Final/OT' : 'Final' : g.start), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint,
      marginTop: 4,
      whiteSpace: 'nowrap'
    }
  }, g._venue || d.venue)))))), (g.st !== 'pre' || true) && React.createElement("div", {
    style: {
      ...card,
      padding: '11px 18px',
      marginBottom: 16,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 22px',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut,
      alignItems: 'center'
    }
  }, React.createElement("span", {
    style: {
      ...ML
    }
  }, "Broadcast"), (() => {
    const tv = g._tv && g._tv.length ? g._tv : bx.tv;
    return tv.length > 0 && React.createElement("span", null, "TV ", React.createElement("span", {
      style: {
        color: T.ink
      }
    }, tv.join(' · ')));
  })(), bx.stream.length > 0 && React.createElement("span", null, "Stream ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, bx.stream.join(' · '))), React.createElement("span", null, "Game Center ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, "Live stream")), bx.radio && React.createElement("span", null, "Radio ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, bx.radio)), bx.odds && React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, "Odds ", React.createElement("span", {
    style: {
      color: T.ink
    }
  }, bx.odds))), tabs.length > 1 && React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 4,
      padding: 4,
      background: T.bg,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      marginBottom: 18
    }
  }, tabs.map(t => React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      padding: '7px 16px',
      borderRadius: 9,
      border: 'none',
      cursor: 'pointer',
      background: tab === t ? T.invBg : 'transparent',
      color: tab === t ? T.invFg : T.mut,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      transition: 'background .15s'
    }
  }, t === tabs[0] && live && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: tab === t ? T.invFg : T.red,
      display: 'inline-block'
    }
  }), t))), pre ? preView : tab === tabs[0] ? liveView : tab === 'Lineups' ? lineupsView : boxScore, React.createElement("style", null, `@media(max-width:680px){.g2,.g3{grid-template-columns:1fr!important}}@media(max-width:680px){.g4{grid-template-columns:1fr 1fr!important}}`));
}
function NationalTV() {
  const mock = useMemo(() => BC.tvSchedule ? BC.tvSchedule() : [], []);
  const tv = window.E_useLive(mock, () => window.NHL && window.NHL.tvScheduleMapped ? window.NHL.tvScheduleMapped() : null, []);
  if (!tv || !tv.length) return null;
  return React.createElement("div", {
    style: {
      ...card,
      overflow: 'hidden',
      margin: '4px 0 16px'
    }
  }, React.createElement("div", {
    style: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderBottom: `1px solid ${T.line}`,
      flexWrap: 'wrap'
    }
  }, React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: T.mut,
    strokeWidth: "2"
  }, React.createElement("rect", {
    x: "2",
    y: "7",
    width: "20",
    height: "13",
    rx: "2"
  }), React.createElement("path", {
    d: "M8 3l4 4 4-4"
  })), React.createElement("span", {
    style: ML
  }, "On national TV"), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: MONO,
      fontSize: 10,
      color: T.faint
    }
  }, "tonight")), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      padding: '12px 16px'
    }
  }, tv.map((g, i) => React.createElement("div", {
    key: i,
    style: {
      flexShrink: 0,
      minWidth: 152,
      border: `1px solid ${T.line}`,
      borderRadius: 10,
      padding: '10px 12px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 7
    }
  }, React.createElement(Badge, {
    ab: g.away,
    size: 20
  }), React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, "@"), React.createElement(Badge, {
    ab: g.home,
    size: 20
  })), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.mut
    }
  }, g.time), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      marginTop: 6
    }
  }, g.networks.map(n => React.createElement("span", {
    key: n,
    style: {
      fontFamily: MONO,
      fontSize: 9.5,
      letterSpacing: '.05em',
      padding: '2px 6px',
      borderRadius: 5,
      background: T.invBg,
      color: T.invFg
    }
  }, n)))))));
}
function Palette({
  open,
  onClose,
  onTeam,
  onPlayer,
  onGame
}) {
  const [q, setQ] = useState('');
  const inp = useRef(null);
  const [ai, setAi] = useState(0);
  const [liveP, setLiveP] = useState([]);
  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inp.current && inp.current.focus(), 40);
    }
  }, [open]);
  useEffect(() => {
    let on = true;
    const t = q.trim();
    if (t.length < 2 || !(window.NHL && window.NHL.playerSearchMapped && window.BC && BC.LIVE)) {
      setLiveP([]);
      return;
    }
    const id = setTimeout(() => {
      window.NHL.playerSearchMapped(t).then(rows => {
        if (on && rows && rows.length) setLiveP(rows.map(p => ({
          type: 'player',
          ...p
        })));
      }).catch(() => {});
    }, 220);
    return () => {
      on = false;
      clearTimeout(id);
    };
  }, [q]);
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return BC.ABBR.slice(0, 6).map(a => ({
      type: 'team',
      ab: a
    }));
    const mt = a => `${city(a)} ${nick(a)} ${a}`.toLowerCase().includes(t);
    const teams = BC.ABBR.filter(mt).map(a => ({
      type: 'team',
      ab: a
    }));
    const pool = BC.allPlayers || BC.PLAYERS || [];
    const players = liveP.length ? liveP : pool.filter(p => p.name.toLowerCase().includes(t)).slice(0, 6).map(p => ({
      type: 'player',
      ...p
    }));
    const gpool = [...slate(-1), ...slate(0), ...slate(1)];
    const games = gpool.filter(g => mt(g.a) || mt(g.h)).slice(0, 4).map(g => ({
      type: 'game',
      g
    }));
    return [...teams.slice(0, 4), ...players, ...games].slice(0, 12);
  }, [q, liveP]);
  if (!open) return null;
  const Tag = ({
    children
  }) => React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: T.faint,
      border: `1px solid ${T.line2}`,
      borderRadius: 5,
      padding: '1px 5px',
      flexShrink: 0
    }
  }, children);
  const act = r => {
    if (r.type === 'player' && onPlayer) onPlayer(r);else if (r.type === 'game' && onGame) onGame(r.g);else onTeam(r.ab || r.team);
    onClose();
  };
  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAi(a => Math.min(res.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAi(a => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = res[ai];
      if (r) act(r);
    }
  };
  return React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 80,
      background: 'rgba(8,9,12,.5)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '12vh'
    }
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(540px,92vw)',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0,0,0,.35)'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      borderBottom: `1px solid ${T.line}`
    }
  }, React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: T.faint,
    strokeWidth: "2"
  }, React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), React.createElement("input", {
    ref: inp,
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setAi(0);
    },
    onKeyDown: onKey,
    "aria-label": "Search teams, players and games",
    placeholder: "Search teams, players, games\u2026",
    style: {
      flex: 1,
      background: 'none',
      border: 'none',
      outline: 'none',
      color: T.ink,
      fontSize: 15,
      fontFamily: 'inherit'
    }
  }), React.createElement("kbd", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      padding: '2px 7px',
      borderRadius: 5,
      background: T.bg,
      color: T.mut
    }
  }, "Esc")), React.createElement("div", {
    role: "listbox",
    "aria-label": "Search results",
    style: {
      maxHeight: 360,
      overflowY: 'auto',
      padding: 6
    }
  }, res.length === 0 ? React.createElement("div", {
    style: {
      padding: '18px',
      fontFamily: MONO,
      fontSize: 12.5,
      color: T.mut,
      textAlign: 'center'
    }
  }, "No matches for \u201C", q, "\u201D.") : res.map((r, i) => React.createElement("button", {
    key: i,
    role: "option",
    "aria-selected": i === ai,
    onMouseEnter: () => setAi(i),
    onClick: () => act(r),
    className: "epr",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      width: '100%',
      padding: '9px 11px',
      borderRadius: 9,
      background: i === ai ? T.bg : 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, r.type === 'player' ? React.createElement(PlayerAvatar, {
    pos: r.pos,
    team: r.team,
    name: r.name,
    size: 26
  }) : r.type === 'game' ? React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 2
    }
  }, React.createElement(Badge, {
    ab: r.g.a,
    size: 22
  }), React.createElement(Badge, {
    ab: r.g.h,
    size: 22
  })) : React.createElement(Badge, {
    ab: r.ab,
    size: 26
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: T.ink,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, r.type === 'player' ? r.name : r.type === 'game' ? `${r.g.a} @ ${r.g.h}` : `${city(r.ab)} ${nick(r.ab)}`), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint
    }
  }, r.type === 'player' ? `${r.team} · ${r.pos || 'player'}${r.p != null ? ` · ${r.p}P` : ''}` : r.type === 'game' ? r.g.st === 'live' ? `live · ${r.g.per} ${r.g.clk}` : r.g.st.startsWith('final') ? `final · ${r.g.as}–${r.g.hs}` : r.g.start || 'upcoming' : 'team')), React.createElement(Tag, null, r.type))))));
}
function Onboarding({
  favs,
  onDone
}) {
  const [sel, setSel] = useState(() => favs.slice());
  const teams = useMemo(() => [...BC.ABBR].sort((a, b) => city(a).localeCompare(city(b))), []);
  const tog = ab => setSel(s => s.includes(ab) ? s.filter(x => x !== ab) : [...s, ab]);
  return React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(8,9,12,.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '6vh 16px',
      overflowY: 'auto'
    }
  }, React.createElement("div", {
    style: {
      width: 'min(620px,96vw)',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0,0,0,.4)'
    }
  }, React.createElement("div", {
    style: {
      padding: '22px 24px 16px',
      borderBottom: `1px solid ${T.line}`
    }
  }, React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: T.red,
      marginBottom: 8
    }
  }, "Welcome"), React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 26,
      color: T.ink,
      letterSpacing: '-.01em'
    }
  }, "Follow your teams"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: T.mut,
      marginTop: 6,
      lineHeight: 1.5,
      maxWidth: 460
    }
  }, "Pick the clubs you care about and we\u2019ll surface their games, news and schedule first. Change anytime with the \u2605 on any team.")), React.createElement("div", {
    style: {
      padding: '16px 24px',
      maxHeight: '44vh',
      overflowY: 'auto'
    }
  }, React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
      gap: 8
    }
  }, teams.map(ab => {
    const on = sel.includes(ab);
    return React.createElement("button", {
      key: ab,
      onClick: () => tog(ab),
      "aria-pressed": on,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 11px',
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        background: on ? `${col(ab)}1a` : T.bg,
        border: `1.5px solid ${on ? col(ab) : T.line}`,
        transition: 'background .12s, border-color .12s'
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 24
    }), React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        fontWeight: on ? 700 : 500,
        color: T.ink,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, city(ab)), on && React.createElement("span", {
      style: {
        color: col(ab),
        fontSize: 13,
        flexShrink: 0
      }
    }, "\u2713"));
  }))), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '16px 24px',
      borderTop: `1px solid ${T.line}`,
      flexWrap: 'wrap'
    }
  }, React.createElement("button", {
    onClick: () => onDone(null),
    style: {
      fontFamily: 'inherit',
      background: 'none',
      border: 'none',
      color: T.mut,
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "Skip for now"), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint
    }
  }, sel.length, " selected"), React.createElement("button", {
    onClick: () => onDone(sel),
    style: {
      fontFamily: 'inherit',
      background: T.invBg,
      color: T.invFg,
      border: 'none',
      borderRadius: 10,
      padding: '11px 20px',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer'
    }
  }, sel.length ? `Follow ${sel.length} team${sel.length > 1 ? 's' : ''}` : 'Get started')))));
}
const NAV = ['Highlights', 'News', 'Scores', 'Standings', 'Teams', 'Players', 'Stats', 'Hockey IQ', 'Playoffs', 'Draft', 'Records'];
const NK = {
  'Highlights': 'highlights',
  'News': 'news',
  'Scores': 'scores',
  'Standings': 'standings',
  'Teams': 'teams',
  'Players': 'players',
  'Stats': 'stats',
  'Hockey IQ': 'iq',
  'Playoffs': 'playoffs',
  'Draft': 'draft',
  'Records': 'records'
};
function PriorityNav({
  active,
  onGo
}) {
  const GAP = 2,
    MOREW = 92;
  const wrapRef = useRef(null),
    measRef = useRef(null);
  const [vis, setVis] = useState(NAV.length);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const wrap = wrapRef.current,
      meas = measRef.current;
    if (!wrap || !meas) return;
    const compute = () => {
      const avail = wrap.clientWidth;
      if (!avail) return;
      const ws = [...meas.children].map(el => el.getBoundingClientRect().width);
      const sumAll = ws.reduce((a, b) => a + b, 0) + GAP * Math.max(0, ws.length - 1);
      if (sumAll <= avail + 0.5) {
        setVis(NAV.length);
        return;
      }
      let t = 0,
        c = 0;
      for (let i = 0; i < ws.length; i++) {
        const add = ws[i] + (c > 0 ? GAP : 0);
        if (t + add <= avail - MOREW) {
          t += add;
          c++;
        } else break;
      }
      setVis(Math.max(1, c));
    };
    compute();
    let ro;
    try {
      ro = new ResizeObserver(compute);
      ro.observe(wrap);
    } catch (e) {}
    window.addEventListener('resize', compute);
    return () => {
      ro && ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (!wrapRef.current || !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const btn = on => ({
    fontFamily: 'inherit',
    background: on ? T.invBg : 'none',
    color: on ? T.invFg : T.mut,
    border: 'none',
    fontWeight: 600,
    fontSize: 13.5,
    padding: '6px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0
  });
  const visItems = NAV.slice(0, vis),
    overflow = NAV.slice(vis),
    overflowActive = overflow.some(n => NK[n] === active);
  return React.createElement("nav", {
    ref: wrapRef,
    className: "ed-nav",
    style: {
      display: 'flex',
      gap: GAP,
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      position: 'relative'
    }
  }, React.createElement("div", {
    ref: measRef,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: 0,
      overflow: 'hidden',
      display: 'flex',
      gap: GAP,
      visibility: 'hidden',
      pointerEvents: 'none'
    }
  }, NAV.map(n => React.createElement("button", {
    key: n,
    tabIndex: -1,
    style: btn(false)
  }, n))), visItems.map(n => {
    const on = NK[n] === active;
    return React.createElement("button", {
      key: n,
      onClick: () => onGo(NK[n]),
      style: btn(on)
    }, n);
  }), overflow.length > 0 && React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-haspopup": "true",
    "aria-expanded": open,
    style: {
      ...btn(overflowActive),
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      position: 'relative'
    }
  }, "More", React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    style: {
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform .15s'
    }
  }, React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })), overflowActive && React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: T.red,
      position: 'absolute',
      top: 3,
      right: 3
    }
  })), open && React.createElement("div", {
    role: "menu",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      minWidth: 184,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 12,
      boxShadow: '0 16px 44px -14px rgba(0,0,0,.32)',
      padding: 6,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, overflow.map(n => {
    const on = NK[n] === active;
    return React.createElement("button", {
      key: n,
      role: "menuitem",
      onClick: () => {
        onGo(NK[n]);
        setOpen(false);
      },
      style: {
        fontFamily: 'inherit',
        textAlign: 'left',
        background: on ? T.invBg : 'none',
        color: on ? T.invFg : T.ink,
        border: 'none',
        fontWeight: 600,
        fontSize: 14,
        padding: '9px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, n);
  }))));
}
class EB extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      err: false
    };
  }
  static getDerivedStateFromError() {
    return {
      err: true
    };
  }
  componentDidCatch(err, info) {
    try {
      console.error('Route render error:', err, info && info.componentStack);
    } catch (e) {}
  }
  componentDidUpdate(prev) {
    if (prev.routeKey !== this.props.routeKey && this.state.err) this.setState({
      err: false
    });
  }
  render() {
    if (this.state.err) return React.createElement("div", {
      style: {
        ...card,
        padding: '44px 24px',
        textAlign: 'center',
        maxWidth: 520,
        margin: '30px auto'
      }
    }, React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontSize: 25,
        color: T.ink,
        marginBottom: 8
      }
    }, "This view hit a snag"), React.createElement("div", {
      style: {
        fontSize: 14,
        color: T.mut,
        lineHeight: 1.55,
        marginBottom: 20
      }
    }, "Something went wrong rendering this page. The rest of the app is unaffected \u2014 head back and try another section."), React.createElement("button", {
      onClick: () => {
        this.setState({
          err: false
        });
        this.props.onReset && this.props.onReset();
      },
      style: {
        fontFamily: 'inherit',
        background: T.invBg,
        color: T.invFg,
        border: 'none',
        borderRadius: 9,
        padding: '10px 18px',
        fontWeight: 600,
        fontSize: 13.5,
        cursor: 'pointer'
      }
    }, "\u2190 Back to Highlights"));
    return this.props.children;
  }
}
function App() {
  const [offset, setOffset] = useState(0);
  const [season, setSeason] = useState('cur');
  const [favs, setFavs] = useState(loadF);
  const [followOnly, setFollowOnly] = useState(false);
  const [pal, setPal] = useState(false);
  const [menu, setMenu] = useState(false);
  const [onboard, setOnboard] = useState(() => {
    try {
      return !localStorage.getItem('e_onboarded');
    } catch (e) {
      return false;
    }
  });
  const finishOnboard = sel => {
    if (sel && sel.length) {
      setFavs(sel);
      saveF(sel);
    }
    try {
      localStorage.setItem('e_onboarded', '1');
    } catch (e) {}
    setOnboard(false);
  };
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('e_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });
  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    window.E_applyTheme && window.E_applyTheme(n);
    try {
      localStorage.setItem('e_theme', n);
    } catch (e) {}
    setTheme(n);
  };
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  }, [theme]);
  const [route, setRoute] = useState('highlights');
  const [game, setGame] = useState(null);
  const [team, setTeam] = useState(null);
  const [player, setPlayer] = useState(null);
  const [hv, setHv] = useState(0);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [booting, setBooting] = useState(!!(window.BC && window.BC.hydrate));
  const curIdRef = React.useRef('20252026');
  {
    const liveS = window.NHL && window.NHL._season ? String(window.NHL._season) : null;
    if (liveS && /^\d{8}$/.test(liveS) && liveS > curIdRef.current) curIdRef.current = liveS;
  }
  const curId = curIdRef.current;
  const SEASONS = useMemo(() => {
    const top = parseInt(curId.slice(0, 4), 10) || 2025;
    const a = [];
    for (let y = top; y >= 2010; y--) a.push(`${y}${y + 1}`);
    return a;
  }, [curId]);
  const seasonLabel = v => v === 'cur' ? `${curId.slice(0, 4)}\u2013${curId.slice(6, 8)}` : `${v.slice(0, 4)}\u2013${v.slice(6, 8)}`;
  const changeSeason = v => {
    setSeason(v);
    const id = v === 'cur' ? curId : v;
    if (window.BC && BC.LIVE && BC.hydrateSeason) {
      setLoading(true);
      BC.hydrateSeason(id, () => {
        setHv(x => x + 1);
        setLoading(false);
      });
    }
    window.scrollTo(0, 0);
  };
  const [legalDoc, setLegalDoc] = useState('terms');
  const [statusF, setStatusF] = useState('all');
  const games = useMemo(() => slate(offset), [offset, hv]);
  useEffect(() => {
    if (window.BC && BC.ensureSlate) {
      for (let o = offset - 1; o <= offset + 1; o++) BC.ensureSlate(o, () => setHv(v => v + 1));
    }
  }, [offset, hv]);
  const toggleFav = ab => setFavs(f => {
    const n = f.includes(ab) ? f.filter(x => x !== ab) : [...f, ab];
    saveF(n);
    return n;
  });
  const isFav = g => favs.includes(g.a) || favs.includes(g.h);
  const baseGames = followOnly ? games.filter(isFav) : games;
  const stN = {
    live: baseGames.filter(g => g.st === 'live').length,
    final: baseGames.filter(g => g.st.startsWith('final')).length,
    pre: baseGames.filter(g => g.st === 'pre').length
  };
  const shown = statusF === 'all' ? baseGames : baseGames.filter(g => statusF === 'live' ? g.st === 'live' : statusF === 'final' ? g.st.startsWith('final') : g.st === 'pre');
  const go = r => {
    setRoute(r);
    setGame(null);
    setTeam(null);
    setPlayer(null);
    setMenu(false);
    window.scrollTo(0, 0);
    if (window.location.hash.slice(1) !== r) window.location.hash = r;
  };
  const openTeam = ab => {
    setTeam(ab);
    setPlayer(null);
    setGame(null);
    setMenu(false);
    window.scrollTo(0, 0);
    window.location.hash = 'team/' + ab;
  };
  const openPlayer = p => {
    setPlayer(p);
    setTeam(null);
    setGame(null);
    setMenu(false);
    window.scrollTo(0, 0);
    if (p && p.id) window.location.hash = 'player/' + p.id;
  };
  const findGame = id => {
    for (let o = -5; o <= 9; o++) {
      const g = slate(o).find(x => String(x.id) === String(id));
      if (g) return g;
    }
    return null;
  };
  const openGame = g => {
    setGame(g);
    setTeam(null);
    setPlayer(null);
    setMenu(false);
    window.scrollTo(0, 0);
    if (g && g.id != null) window.location.hash = 'game/' + g.id;
  };
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.slice(1);
      if (!h) {
        return;
      }
      const [k, arg] = h.split('/');
      if (k === 'team' && arg) {
        setTeam(arg);
        setPlayer(null);
        setGame(null);
      } else if (k === 'player' && arg) {
        const p = (BC.allPlayers || []).find(x => String(x.id) === arg) || (BC.goalies || []).find(x => String(x.id) === arg);
        if (p) {
          setPlayer(p.gp != null && p.svp ? {
            ...p,
            type: 'goalie'
          } : p);
          setTeam(null);
          setGame(null);
        }
      } else if (k === 'game' && arg) {
        const g = findGame(arg);
        if (g) {
          setGame(g);
          setTeam(null);
          setPlayer(null);
        } else if (window.BC && BC.ensureSlate) {
          for (let o = -7; o <= 9; o++) BC.ensureSlate(o, () => {
            const gg = findGame(arg);
            if (gg) {
              setGame(gg);
              setTeam(null);
              setPlayer(null);
            }
          });
        }
      } else if (k === 'legal') {
        setLegalDoc(arg || 'terms');
        setRoute('legal');
        setTeam(null);
        setPlayer(null);
        setGame(null);
      } else if (NK[Object.keys(NK).find(n => NK[n] === k)] || ['highlights', 'news', 'scores', 'standings', 'teams', 'players', 'stats', 'iq', 'draft', 'records', 'playoffs'].includes(k)) {
        setRoute(k);
        setTeam(null);
        setPlayer(null);
        setGame(null);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPal(p => !p);
      }
      if (e.key === 'Escape') setPal(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    let stop = () => {};
    if (window.BC && BC.hydrate) {
      setLoading(true);
      const off = BC.onError && BC.onError(m => setToast(m));
      BC.hydrate(() => setHv(v => v + 1)).then(live => {
        setLoading(false);
        setBooting(false);
        if (live) {
          setIsLive(true);
          stop = BC.startPolling(() => setHv(v => v + 1));
        }
      }).catch(() => {
        setLoading(false);
        setBooting(false);
      });
      return () => {
        stop();
        off && off();
      };
    }
  }, []);
  const live = games.filter(g => g.st === 'live').length;
  let content;
  if (game) content = React.createElement(GameDetail, {
    g: game,
    onBack: () => setGame(null),
    onTeam: openTeam
  });else if (player) content = React.createElement(P.PlayerDetailPage, {
    p: player,
    onBack: () => setPlayer(null),
    onTeam: openTeam,
    onPlayer: openPlayer
  });else if (team) content = React.createElement(P.TeamDetailPage, {
    ab: team,
    onBack: () => setTeam(null),
    onPlayer: openPlayer,
    onGame: openGame
  });else if (route === 'highlights') content = React.createElement(P.HighlightsPage, {
    games: games,
    favs: favs,
    booting: booting,
    onGame: openGame,
    onTeam: openTeam,
    onPlayer: openPlayer,
    onGo: go
  });else if (route === 'news') content = React.createElement(P.NewsPage, {
    favs: favs,
    onTeam: openTeam,
    onGame: openGame,
    onPlayer: openPlayer,
    onGo: go
  });else if (route === 'standings') content = React.createElement(P.StandingsPage, {
    onTeam: openTeam
  });else if (route === 'teams') content = React.createElement(P.TeamsPage, {
    onTeam: openTeam
  });else if (route === 'players') content = React.createElement(P.PlayersPage, {
    onPlayer: openPlayer
  });else if (route === 'stats') content = React.createElement(P.StatsPage, {
    onPlayer: openPlayer,
    onTeam: openTeam
  });else if (route === 'iq') content = React.createElement(P.HockeyIQPage, {
    onPlayer: openPlayer,
    onTeam: openTeam
  });else if (route === 'draft') content = React.createElement(P.DraftPage, {
    onTeam: openTeam
  });else if (route === 'playoffs') content = React.createElement(P.PlayoffsPage, {
    onTeam: openTeam
  });else if (route === 'legal') content = React.createElement(P.LegalPage, {
    doc: legalDoc,
    onGo: go
  });else if (route === 'records') content = React.createElement(P.RecordsPage, {
    onTeam: openTeam
  });else content = React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24,
      flexWrap: 'wrap'
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: T.red,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, live > 0 && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: T.red
    }
  }), "Scoreboard", live > 0 ? ` · ${live} live` : ''), React.createElement("h1", {
    style: {
      fontSize: 38,
      fontWeight: 600,
      letterSpacing: '-.03em',
      margin: '6px 0 0'
    }
  }, offset === 0 ? React.createElement(React.Fragment, null, "Tonight", React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 500
    }
  }, ".")) : dateLabel(offset))), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, React.createElement("button", {
    onClick: () => setFollowOnly(f => !f),
    style: {
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 13px',
      borderRadius: 999,
      border: `1px solid ${followOnly ? T.red : T.line2}`,
      background: followOnly ? '#fdecea' : T.paper,
      color: followOnly ? T.red : T.mut,
      fontWeight: 600,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, "\u2605 Following", favs.length ? ` · ${favs.length}` : ''), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 10,
      padding: 3
    }
  }, [['‹', -1], ['Today', 0], ['›', 1]].map(([t, o]) => React.createElement("button", {
    key: t,
    onClick: () => o === 0 ? setOffset(0) : setOffset(v => v + o),
    style: {
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      padding: '5px 11px',
      borderRadius: 7,
      background: t === 'Today' && offset === 0 ? T.invBg : 'transparent',
      color: t === 'Today' && offset === 0 ? T.invFg : T.mut,
      border: 'none',
      cursor: 'pointer'
    }
  }, t))))), React.createElement(SchedCal, {
    offset: offset,
    setOffset: setOffset,
    favs: favs,
    view: "week"
  }), offset === 0 && React.createElement(NationalTV, null), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      margin: '4px 0 16px',
      flexWrap: 'wrap'
    }
  }, [['all', 'All', baseGames.length], ['live', 'Live', stN.live], ['final', 'Final', stN.final], ['pre', 'Upcoming', stN.pre]].map(([k, lab, n]) => React.createElement("button", {
    key: k,
    onClick: () => setStatusF(k),
    style: {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      padding: '6px 13px',
      borderRadius: 999,
      border: `1px solid ${statusF === k ? T.invBg : T.line2}`,
      background: statusF === k ? T.invBg : 'transparent',
      color: statusF === k ? T.invFg : T.mut,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, k === 'live' && n > 0 && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: statusF === k ? T.invFg : T.red,
      display: 'inline-block'
    }
  }), lab, React.createElement("span", {
    style: {
      opacity: .55
    }
  }, n)))), loading && shown.length === 0 ? React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
      gap: 14
    }
  }, Array.from({
    length: 6
  }, (_, i) => React.createElement("div", {
    key: i,
    style: {
      ...card,
      padding: '14px 16px'
    }
  }, React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 12,
      width: '40%',
      marginBottom: 14
    }
  }), React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 18,
      width: '72%',
      marginBottom: 9
    }
  }), React.createElement("div", {
    className: "ed-skel",
    style: {
      height: 18,
      width: '64%'
    }
  })))) : shown.length === 0 ? React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '70px 0',
      color: T.mut,
      fontFamily: MONO,
      fontSize: 13
    }
  }, followOnly ? 'no followed teams play in this slate.' : 'no games scheduled.') : React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
      gap: 14
    }
  }, shown.map(g => React.createElement(GameCard, {
    key: g.id,
    g: g,
    favs: favs,
    toggleFav: toggleFav,
    onOpen: openGame
  }))), React.createElement(SchedCal, {
    offset: offset,
    setOffset: setOffset,
    favs: favs,
    view: "month"
  }), React.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 30,
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.faint
    }
  }, "scores update live \xB7 \u2318K to search \xB7 \u2605 a team to follow"));
  return React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: T.bg,
      color: T.ink
    }
  }, loading && React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 90,
      background: `linear-gradient(90deg,transparent,${T.red},transparent)`,
      backgroundSize: '40% 100%',
      animation: 'edload 1s linear infinite'
    }
  }), toast && React.createElement("div", {
    onClick: () => setToast(null),
    style: {
      position: 'fixed',
      bottom: 18,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      background: T.invBg,
      color: T.invFg,
      fontSize: 13,
      padding: '10px 16px',
      borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,.25)',
      cursor: 'pointer',
      fontFamily: MONO
    }
  }, toast, " \xB7 tap to dismiss"), React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: T.glass,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${T.line}`
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: '0 auto',
      padding: '0 24px',
      height: 58,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, React.createElement("div", {
    onClick: () => go('highlights'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      cursor: 'pointer',
      flexShrink: 0
    }
  }, React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: T.invBg,
      color: T.invFg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 13,
      flexShrink: 0
    }
  }, "H"), React.createElement("span", {
    style: {
      fontWeight: 700,
      whiteSpace: 'nowrap'
    }
  }, "The Hockey Lab")), React.createElement("a", {
    href: "The Hockey Lab - Landing.html",
    title: "Lab home",
    "aria-label": "Lab home",
    style: {
      color: T.faint,
      fontSize: 17,
      textDecoration: 'none'
    }
  }, "\u2302"), React.createElement("span", {
    className: "ed-demo",
    title: isLive ? "Live NHL feeds connected — updating in real time" : "Projected/sample data for demo — live NHL feeds fill in on deploy",
    style: {
      fontFamily: MONO,
      fontSize: 9.5,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: isLive ? '#1a8a4f' : T.mut,
      background: T.bg,
      border: `1px solid ${isLive ? '#1a8a4f55' : T.line2}`,
      borderRadius: 999,
      padding: '3px 8px',
      flexShrink: 0,
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, isLive && React.createElement("span", {
    className: "ed-pulse",
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: '#1a8a4f',
      display: 'inline-block'
    }
  }), isLive ? 'live · NHL' : 'demo data'), React.createElement(PriorityNav, {
    active: !team && !player && !game ? route : null,
    onGo: go
  }), React.createElement("select", {
    value: season,
    onChange: e => changeSeason(e.target.value),
    "aria-label": "Season",
    title: isLive ? 'Pick a season \u2014 historical standings, stats, rosters & leaders' : 'Historical seasons load when live NHL feeds are connected',
    className: "ed-season",
    style: {
      fontFamily: MONO,
      fontSize: 12,
      fontWeight: 600,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 9,
      padding: '7px 8px',
      color: T.ink,
      cursor: 'pointer',
      flexShrink: 0,
      maxWidth: 130
    }
  }, React.createElement("option", {
    value: "cur"
  }, seasonLabel('cur'), " \xB7 Current"), SEASONS.slice(1).map(s => React.createElement("option", {
    key: s,
    value: s
  }, seasonLabel(s)))), React.createElement("button", {
    onClick: toggleTheme,
    "aria-label": "Toggle theme",
    title: "Toggle light/dark",
    style: {
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 34,
      borderRadius: 9,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      color: T.mut,
      cursor: 'pointer',
      flexShrink: 0
    }
  }, theme === 'dark' ? React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.2"
  }), React.createElement("path", {
    d: "M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"
  })) : React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"
  }))), React.createElement("button", {
    onClick: () => setPal(true),
    "aria-label": "Search",
    style: {
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 11px',
      borderRadius: 9,
      background: T.paper,
      border: `1px solid ${T.line2}`,
      color: T.mut,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), React.createElement("span", {
    className: "ed-searchlabel"
  }, "Search"), React.createElement("kbd", {
    className: "ed-kbd",
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      padding: '1px 5px',
      borderRadius: 4,
      background: T.bg
    }
  }, "\u2318K")), React.createElement("button", {
    className: "ed-burger",
    onClick: () => setMenu(true),
    "aria-label": "Menu",
    style: {
      display: 'none',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 9,
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0
    }
  }, React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: T.ink,
    strokeWidth: "2"
  }, React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "21",
    y2: "18"
  }))))), season !== 'cur' && React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '12px 24px 0'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      flexWrap: 'wrap',
      background: T.paper,
      border: `1px solid ${T.line2}`,
      borderRadius: 11,
      padding: '10px 14px'
    }
  }, React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 10.5,
      letterSpacing: '.07em',
      textTransform: 'uppercase',
      color: T.invFg,
      background: T.invBg,
      borderRadius: 999,
      padding: '4px 9px',
      flexShrink: 0
    }
  }, seasonLabel(season), " season"), React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: T.mut,
      flex: 1,
      minWidth: 180
    }
  }, "Historical standings, stats, rosters & leaders.", !isLive && ' Live data loads on deploy.', " EDGE tracking reflects the current season only \u2014 league-wide tracking began 2021\u201322. The scoreboard stays on today."), React.createElement("button", {
    onClick: () => changeSeason('cur'),
    style: {
      fontFamily: 'inherit',
      fontSize: 12,
      fontWeight: 600,
      color: T.invFg,
      background: T.invBg,
      border: 'none',
      borderRadius: 8,
      padding: '7px 12px',
      cursor: 'pointer',
      flexShrink: 0
    }
  }, "Back to current"))), menu && React.createElement("div", {
    onClick: () => setMenu(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(20,21,26,.4)',
      backdropFilter: 'blur(2px)'
    }
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 'min(280px,80vw)',
      background: T.paper,
      borderLeft: `1px solid ${T.line2}`,
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      boxShadow: '-12px 0 40px rgba(0,0,0,.12)'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      ...ML
    }
  }, "Menu"), React.createElement("button", {
    onClick: () => setMenu(false),
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      fontSize: 22,
      color: T.mut,
      cursor: 'pointer',
      lineHeight: 1
    }
  }, "\xD7")), NAV.map(n => {
    const k = NK[n];
    const on = route === k && !team && !player && !game;
    return React.createElement("button", {
      key: n,
      onClick: () => go(k),
      style: {
        fontFamily: 'inherit',
        textAlign: 'left',
        background: on ? T.invBg : 'none',
        color: on ? T.invFg : T.ink,
        border: 'none',
        fontWeight: 600,
        fontSize: 16,
        padding: '12px 14px',
        borderRadius: 10,
        cursor: 'pointer'
      }
    }, n);
  }), React.createElement("div", {
    style: {
      marginTop: 8,
      paddingTop: 12,
      borderTop: `1px solid ${T.line}`
    }
  }, React.createElement("label", {
    style: {
      ...ML,
      display: 'block',
      marginBottom: 6
    }
  }, "Season"), React.createElement("select", {
    value: season,
    onChange: e => {
      changeSeason(e.target.value);
    },
    "aria-label": "Season",
    style: {
      fontFamily: MONO,
      fontSize: 14,
      fontWeight: 600,
      background: T.bg,
      border: `1px solid ${T.line2}`,
      borderRadius: 10,
      padding: '11px 12px',
      color: T.ink,
      cursor: 'pointer',
      width: '100%'
    }
  }, React.createElement("option", {
    value: "cur"
  }, seasonLabel('cur'), " \xB7 Current"), SEASONS.slice(1).map(s => React.createElement("option", {
    key: s,
    value: s
  }, seasonLabel(s))))), React.createElement("button", {
    onClick: () => {
      setMenu(false);
      setPal(true);
    },
    style: {
      fontFamily: 'inherit',
      textAlign: 'left',
      marginTop: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: T.bg,
      color: T.mut,
      border: `1px solid ${T.line2}`,
      fontWeight: 600,
      fontSize: 15,
      padding: '12px 14px',
      borderRadius: 10,
      cursor: 'pointer'
    }
  }, React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), "Search"), React.createElement("a", {
    href: "The Hockey Lab - Landing.html",
    style: {
      textAlign: 'left',
      marginTop: 4,
      color: T.faint,
      fontFamily: MONO,
      fontSize: 12,
      textDecoration: 'none',
      padding: '8px 14px'
    }
  }, "\u2302 Lab home"))), React.createElement("main", {
    id: "main",
    tabIndex: -1,
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '30px 24px 50px',
      outline: 'none'
    }
  }, React.createElement(EB, {
    key: 'season-' + season,
    routeKey: route + '|' + (team || '') + '|' + (player && player.id || '') + '|' + (game && game.id || ''),
    onReset: () => go('highlights')
  }, content)), React.createElement("footer", {
    style: {
      borderTop: `1px solid ${T.line}`,
      marginTop: 20
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '26px 24px 36px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: 14
    }
  }, React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 6,
      background: T.invBg,
      color: T.invFg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 12
    }
  }, "H"), React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, "The Hockey Lab")), React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 20px',
      marginBottom: 16
    }
  }, window.E_FOOTER_LINKS.map(([k, label]) => React.createElement("button", {
    key: k,
    onClick: () => go('legal/' + k),
    className: "el",
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontFamily: MONO,
      fontSize: 12,
      color: T.mut
    }
  }, label))), React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 11,
      color: T.faint,
      lineHeight: 1.7
    }
  }, "\xA9 2026 The Hockey Lab \xB7 Independent project \u2014 not affiliated with the NHL \xB7 Data via public NHL APIs"))), React.createElement(Palette, {
    open: pal,
    onClose: () => setPal(false),
    onTeam: openTeam,
    onPlayer: openPlayer,
    onGame: openGame
  }), onboard && React.createElement(Onboarding, {
    favs: favs,
    onDone: finishOnboard
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
})();