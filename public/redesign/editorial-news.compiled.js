(function(){
(function () {
  const {
    useState: uS,
    useMemo: uM
  } = React;
  const {
    T,
    MONO,
    SERIF,
    card,
    ML
  } = window.E_TOK;
  const {
    Badge,
    PageHead,
    Pill
  } = window.E_UI;
  const D = window.BC;
  const ct = a => D.city(a),
    nk = a => D.nick(a),
    c2 = a => D.col(a);
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : '' + n;
  const TCOL = {
    Trade: '#b5762a',
    Rumor: '#b5762a',
    Prospect: '#b5762a',
    Milestone: '#b5762a',
    Injury: T.red,
    Discipline: T.red,
    Signing: '#1a8a4f',
    Analysis: '#1a8a4f',
    Goalie: '#1a8a4f'
  };
  const tcol = t => TCOL[t] || T.mut;
  function OutletMark({
    outlet,
    size = 26
  }) {
    return React.createElement("span", {
      style: {
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: T.invBg,
        color: T.invFg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: size * 0.46,
        flexShrink: 0
      }
    }, outlet.init);
  }
  function Sparkle({
    c
  }) {
    return React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 12 12",
      fill: c,
      style: {
        flexShrink: 0
      }
    }, React.createElement("path", {
      d: "M6 0 L7.1 4.9 L12 6 L7.1 7.1 L6 12 L4.9 7.1 L0 6 L4.9 4.9 Z"
    }));
  }
  function AITag() {
    return React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: T.ink,
        background: T.bg,
        border: `1px solid ${T.line2}`,
        borderRadius: 6,
        padding: '2px 7px',
        flexShrink: 0
      }
    }, React.createElement(Sparkle, {
      c: T.red
    }), "AI summary");
  }
  function TopicTag({
    topic
  }) {
    return React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: tcol(topic),
        fontWeight: 600
      }
    }, topic);
  }
  function TeamChips({
    teams,
    onTeam
  }) {
    return React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 4
      }
    }, teams.map(ab => D.standBy && D.standBy(ab) ? React.createElement("button", {
      key: ab,
      onClick: e => {
        e.stopPropagation();
        onTeam(ab);
      },
      className: "el",
      title: `${ct(ab)} ${nk(ab)}`,
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        lineHeight: 0
      }
    }, React.createElement(Badge, {
      ab: ab,
      size: 18
    })) : null));
  }
  function ReadOriginal({
    a
  }) {
    return React.createElement("a", {
      href: 'https://' + a.outlet.domain,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: e => e.stopPropagation(),
      className: "el",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        textDecoration: 'none',
        whiteSpace: 'nowrap'
      }
    }, "Read original", React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, React.createElement("path", {
      d: "M7 17 17 7M9 7h8v8"
    })));
  }
  function Byline({
    a
  }) {
    return React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 0
      }
    }, React.createElement(OutletMark, {
      outlet: a.outlet
    }), React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: T.ink,
        whiteSpace: 'nowrap'
      }
    }, a.outlet.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        display: 'block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, a.byline, " \xB7 ", a.ago, " ago")));
  }
  function LeadStory({
    a,
    onTeam
  }) {
    return React.createElement("div", {
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden',
        marginBottom: 16
      }
    }, React.createElement("div", {
      className: "news-lead",
      style: {
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 0
      }
    }, React.createElement("div", {
      style: {
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 11
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: T.red
      }
    }, "Lead story"), React.createElement("span", {
      style: {
        width: 3,
        height: 3,
        borderRadius: 99,
        background: T.line2
      }
    }), React.createElement(TopicTag, {
      topic: a.topic
    })), React.createElement("h2", {
      style: {
        fontFamily: SERIF,
        fontSize: 30,
        lineHeight: 1.12,
        letterSpacing: '-.01em',
        color: T.ink,
        margin: '0 0 12px',
        textWrap: 'balance'
      }
    }, a.headline), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 9,
        flexWrap: 'wrap'
      }
    }, React.createElement(AITag, null), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint
      }
    }, a.min, " min read \xB7 summarized from ", a.outlet.name)), React.createElement("p", {
      style: {
        fontSize: 15.5,
        lineHeight: 1.6,
        color: T.mut,
        margin: '0 0 16px',
        textWrap: 'pretty'
      }
    }, a.summary), React.createElement("div", {
      style: {
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingTop: 14,
        borderTop: `1px solid ${T.line}`,
        flexWrap: 'wrap'
      }
    }, React.createElement(Byline, {
      a: a
    }), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, React.createElement(TeamChips, {
      teams: a.teams,
      onTeam: onTeam
    }), React.createElement(ReadOriginal, {
      a: a
    })))), React.createElement("div", {
      className: "news-lead-art",
      style: {
        position: 'relative',
        minHeight: 230,
        background: `repeating-linear-gradient(135deg, ${T.bg}, ${T.bg} 11px, ${T.paper} 11px, ${T.paper} 22px)`,
        borderLeft: `1px solid ${T.line}`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        background: T.glass,
        border: `1px solid ${T.line}`,
        borderRadius: 7,
        padding: '4px 8px',
        margin: 12
      }
    }, "wire photo \xB7 ", a.teams.join(' / ')))));
  }
  function ArticleRow({
    a,
    onTeam,
    mode
  }) {
    if (mode === 'headlines') {
      return React.createElement("div", {
        className: "ec",
        style: {
          ...card,
          overflow: 'hidden'
        }
      }, React.createElement("div", {
        style: {
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }
      }, React.createElement("span", {
        title: a.topic,
        style: {
          width: 7,
          height: 7,
          borderRadius: 99,
          background: tcol(a.topic),
          flexShrink: 0
        }
      }), React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0,
          fontSize: 14.5,
          fontWeight: 600,
          color: T.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, a.headline), React.createElement("span", {
        className: "news-hl-meta",
        style: {
          fontFamily: MONO,
          fontSize: 10.5,
          color: T.faint,
          whiteSpace: 'nowrap',
          flexShrink: 0
        }
      }, a.outlet.name, " \xB7 ", a.ago), React.createElement(TeamChips, {
        teams: a.teams,
        onTeam: onTeam
      }), React.createElement("a", {
        href: 'https://' + a.outlet.domain,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: e => e.stopPropagation(),
        className: "el",
        "aria-label": "Read original",
        style: {
          color: T.mut,
          lineHeight: 0,
          flexShrink: 0
        }
      }, React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, React.createElement("path", {
        d: "M7 17 17 7M9 7h8v8"
      })))));
    }
    const brief = mode === 'brief';
    return React.createElement("div", {
      className: "ec",
      style: {
        ...card,
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        padding: brief ? '13px 16px' : '15px 17px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 9
      }
    }, React.createElement(Byline, {
      a: a
    }), React.createElement(TopicTag, {
      topic: a.topic
    })), React.createElement("h3", {
      style: {
        fontSize: 17,
        fontWeight: 600,
        lineHeight: 1.28,
        letterSpacing: '-.01em',
        color: T.ink,
        margin: '0 0 9px',
        textWrap: 'pretty'
      }
    }, a.headline), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 8,
        flexWrap: 'wrap'
      }
    }, React.createElement(AITag, null), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: T.faint
      }
    }, a.min, " min read")), React.createElement("p", {
      style: brief ? {
        fontSize: 13.8,
        lineHeight: 1.55,
        color: T.mut,
        margin: '0 0 12px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      } : {
        fontSize: 13.8,
        lineHeight: 1.58,
        color: T.mut,
        margin: '0 0 13px',
        textWrap: 'pretty'
      }
    }, a.summary), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingTop: brief ? 10 : 12,
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement(TeamChips, {
      teams: a.teams,
      onTeam: onTeam
    }), React.createElement(ReadOriginal, {
      a: a
    }))));
  }
  function XMark({
    size = 20
  }) {
    return React.createElement("span", {
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
  }
  function Verified() {
    return React.createElement("svg", {
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
  }
  function Avatar({
    t
  }) {
    const cc = c2(t.team);
    return React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 99,
        background: cc,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0
      }
    }, t.name[0]);
  }
  function Stat({
    icon,
    n
  }) {
    return React.createElement("span", {
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
    }, icon), fmt(n));
  }
  function TweetCard({
    t
  }) {
    return React.createElement("div", {
      style: {
        ...card,
        padding: '13px 15px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }
    }, React.createElement(Avatar, {
      t: t
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
    }, t.name), t.verified && React.createElement(Verified, null), React.createElement("span", {
      style: {
        marginLeft: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }
    }, React.createElement(Badge, {
      ab: t.team,
      size: 14
    })), React.createElement(XMark, {
      size: 18
    }))), React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, "@", t.handle, " \xB7 ", t.role, " \xB7 ", t.ago))), React.createElement("p", {
      style: {
        fontSize: 13.8,
        lineHeight: 1.52,
        color: T.ink,
        margin: '10px 0 0',
        textWrap: 'pretty'
      }
    }, t.body), t.quote && React.createElement("div", {
      style: {
        marginTop: 10,
        border: `1px solid ${T.line2}`,
        borderRadius: 11,
        padding: '10px 12px'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 4,
        minWidth: 0
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        color: T.ink,
        whiteSpace: 'nowrap'
      }
    }, t.quote.name), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, "@", t.quote.handle)), React.createElement("p", {
      style: {
        fontSize: 12.8,
        lineHeight: 1.5,
        color: T.mut,
        margin: 0
      }
    }, t.quote.body)), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginTop: 12,
        paddingTop: 11,
        borderTop: `1px solid ${T.line}`
      }
    }, React.createElement(Stat, {
      icon: React.createElement("path", {
        d: "M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1.9-4.5A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"
      }),
      n: t.replies
    }), React.createElement(Stat, {
      icon: React.createElement(React.Fragment, null, React.createElement("path", {
        d: "M17 1l4 4-4 4"
      }), React.createElement("path", {
        d: "M3 11V9a4 4 0 0 1 4-4h14"
      }), React.createElement("path", {
        d: "M7 23l-4-4 4-4"
      }), React.createElement("path", {
        d: "M21 13v2a4 4 0 0 1-4 4H3"
      })),
      n: t.reposts
    }), React.createElement(Stat, {
      icon: React.createElement("path", {
        d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"
      }),
      n: t.likes
    })));
  }
  function Ticker({
    items,
    onTeam
  }) {
    const Run = () => items.map((it, i) => React.createElement("button", {
      key: i,
      onClick: () => onTeam(it.ab),
      className: "el",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap'
      }
    }, React.createElement(Badge, {
      ab: it.ab,
      size: 16
    }), React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: T.mut
      }
    }, it.text), React.createElement("span", {
      style: {
        color: T.line2,
        marginLeft: 4
      }
    }, "/")));
    return React.createElement("div", {
      className: "news-tick",
      style: {
        ...card,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        overflow: 'hidden',
        marginBottom: 18,
        borderRadius: 12
      }
    }, React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: T.red,
        padding: '12px 14px',
        borderRight: `1px solid ${T.line}`,
        flexShrink: 0,
        background: T.paper,
        zIndex: 2
      }
    }, React.createElement("span", {
      className: "ed-pulse",
      style: {
        width: 6,
        height: 6,
        borderRadius: 99,
        background: T.red,
        display: 'inline-block'
      }
    }), "Around the league"), React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'hidden',
        padding: '0 16px'
      }
    }, React.createElement("div", {
      className: "news-tick-track"
    }, React.createElement(Run, null), React.createElement(Run, null))));
  }
  function NewsPage({
    favs,
    onTeam,
    onGame,
    onPlayer,
    onGo
  }) {
    const wire = uM(() => D.newsWire(), []);
    const {
      articles,
      tweets,
      ticker,
      topics
    } = wire;
    const [topic, setTopic] = uS('All');
    const [following, setFollowing] = uS(false);
    const [density, setDensity] = uS('Brief');
    const mode = density === 'Headlines' ? 'headlines' : density === 'Full' ? 'full' : 'brief';
    const fav = favs || [];
    const inFav = teams => teams && teams.some(ab => fav.includes(ab));
    const filtered = articles.filter(a => (topic === 'All' || a.topic === topic) && (!following || inFav(a.teams)));
    const lead = filtered.find(a => a.lead) || filtered[0];
    const rest = filtered.filter(a => a !== lead);
    const tw = following ? tweets.filter(t => inFav(t.teams)) : tweets;
    return React.createElement("div", null, React.createElement(PageHead, {
      k: "News",
      t: "The",
      serif: "Wire",
      right: React.createElement("button", {
        onClick: () => setFollowing(f => !f),
        style: {
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          borderRadius: 999,
          border: `1px solid ${following ? T.red : T.line2}`,
          background: following ? '#fdecea' : T.paper,
          color: following ? T.red : T.mut,
          fontWeight: 600,
          fontSize: 12.5,
          cursor: 'pointer'
        }
      }, "\u2605 Following", fav.length ? ` · ${fav.length}` : '')
    }), React.createElement(Ticker, {
      items: ticker,
      onTeam: onTeam
    }), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        margin: '2px 0 16px',
        padding: '9px 13px',
        borderRadius: 9,
        background: T.mode === 'dark' ? 'rgba(181,118,42,.12)' : 'rgba(181,118,42,.08)',
        border: `1px solid ${T.mode === 'dark' ? 'rgba(181,118,42,.32)' : 'rgba(181,118,42,.25)'}`
      }
    }, React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#b5762a',
        border: '1px solid rgba(181,118,42,.4)',
        borderRadius: 5,
        padding: '2px 6px',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, "Editorial \xB7 sample"), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.mut,
        lineHeight: 1.5
      }
    }, "Storylines and posts here are illustrative editorial content \u2014 not live reporting, real quotes, or real accounts.")), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 18
      }
    }, topics.map(x => React.createElement(Pill, {
      key: x,
      on: topic === x,
      onClick: () => setTopic(x)
    }, x)), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginLeft: 'auto'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        background: T.paper,
        border: `1px solid ${T.line2}`,
        borderRadius: 9,
        padding: 3
      }
    }, ['Headlines', 'Brief', 'Full'].map(d => React.createElement("button", {
      key: d,
      onClick: () => setDensity(d),
      style: {
        fontFamily: 'inherit',
        fontSize: 11.5,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 6,
        background: density === d ? T.invBg : 'transparent',
        color: density === d ? T.invFg : T.mut,
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, d))), React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint
      }
    }, filtered.length, " ", filtered.length === 1 ? 'story' : 'stories'))), following && fav.length === 0 && React.createElement("div", {
      style: {
        ...card,
        padding: '16px 18px',
        marginBottom: 18,
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut,
        textAlign: 'center'
      }
    }, "\u2605 Star a team (Teams page or \u2318K) to personalize your wire."), React.createElement("div", {
      className: "news-grid",
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: 20,
        alignItems: 'start'
      }
    }, React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, lead ? React.createElement(LeadStory, {
      a: lead,
      onTeam: onTeam
    }) : null, rest.length ? React.createElement("div", {
      style: {
        display: 'grid',
        gap: mode === 'headlines' ? 8 : mode === 'full' ? 14 : 12
      }
    }, rest.map(a => React.createElement(ArticleRow, {
      key: a.id,
      a: a,
      onTeam: onTeam,
      mode: mode
    }))) : !lead ? React.createElement("div", {
      style: {
        ...card,
        padding: '48px 0',
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: 13,
        color: T.mut
      }
    }, "No stories match this filter.") : null), React.createElement("aside", {
      className: "news-rail",
      style: {
        position: 'sticky',
        top: 74,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '2px 2px'
      }
    }, React.createElement(XMark, {
      size: 22
    }), React.createElement("span", {
      style: ML
    }, "On X"), React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontFamily: MONO,
        fontSize: 10.5,
        color: T.faint
      }
    }, tw.length, " posts")), tw.length ? tw.map(t => React.createElement(TweetCard, {
      key: t.id,
      t: t
    })) : React.createElement("div", {
      style: {
        ...card,
        padding: '24px 16px',
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: 12,
        color: T.mut
      }
    }, "No posts for your teams."), React.createElement("div", {
      style: {
        ...card,
        padding: '13px 15px'
      }
    }, React.createElement("div", {
      style: {
        ...ML,
        marginBottom: 9
      }
    }, "Jump to"), React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 7
      }
    }, [['Scores', 'scores'], ['Standings', 'standings'], ['Hockey IQ', 'iq'], ['Draft', 'draft']].map(([lab, k]) => React.createElement("button", {
      key: k,
      onClick: () => onGo(k),
      className: "el",
      style: {
        fontFamily: MONO,
        fontSize: 11,
        background: T.bg,
        border: `1px solid ${T.line2}`,
        borderRadius: 8,
        padding: '6px 10px',
        color: T.mut,
        cursor: 'pointer'
      }
    }, lab, " \u2192")))))), React.createElement("p", {
      style: {
        textAlign: 'center',
        marginTop: 26,
        fontFamily: MONO,
        fontSize: 11,
        color: T.faint,
        lineHeight: 1.7
      }
    }, "Summaries are AI-generated digests of third-party reporting \xB7 always read the original \xB7 posts shown are illustrative"), React.createElement("style", null, `
        @media(max-width:860px){
          .news-grid{grid-template-columns:1fr!important}
          .news-rail{position:static!important}
        }
        @media(max-width:560px){ .news-hl-meta{display:none!important} }
        @media(max-width:620px){
          .news-lead{grid-template-columns:1fr!important}
          .news-lead-art{min-height:120px!important;border-left:none!important;border-top:1px solid ${T.line}!important;grid-row:1}
        }
      `));
  }
  window.E_PAGES = Object.assign(window.E_PAGES || {}, {
    NewsPage
  });
})();
})();