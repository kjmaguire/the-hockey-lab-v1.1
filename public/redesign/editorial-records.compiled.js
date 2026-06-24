(function(){
(function () {
  const {
    useState: uS,
    useMemo: uM
  } = React;
  const D = window.BC;
  const c2 = D.col,
    nk = D.nick,
    ct = D.city;
  const {
    T,
    MONO,
    SERIF,
    card,
    ML
  } = window.E_TOK;
  const {
    Eyebrow,
    PageHead,
    Badge,
    Spark,
    Pill,
    PlayerAvatar
  } = window.E_UI;
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
    } : null), []);
    const skaters = rec.skaters;
    const goalies = rec.goalies;
    const trophies = window.E_useLive(uM(() => D.recordTrophiesList(), []), () => window.NHL && window.NHL.awardsMapped ? window.NHL.awardsMapped() : null, []);
    const franchise = D.recordFranchiseList();
    const season = D.recordSeason();
    const watch = window.E_useLive(uM(() => D.milestoneWatch(), []), () => window.NHL && window.NHL.milestonesMapped ? window.NHL.milestonesMapped() : null, []);
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
  window.E_PAGES = window.E_PAGES || {};
  window.E_PAGES.RecordsPage = RecordsPage;
})();
})();