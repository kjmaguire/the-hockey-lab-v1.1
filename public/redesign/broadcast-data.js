/* Broadcast — full data + theme for the flagship Scores experience. */
window.BC = (function () {
  const TEAMS = {
    TOR:['Maple Leafs','Toronto','#1c5dd6'], BOS:['Bruins','Boston','#FFB81C'],
    EDM:['Oilers','Edmonton','#FF4C00'], VGK:['Golden Knights','Vegas','#B4975A'],
    COL:['Avalanche','Colorado','#a3315a'], DAL:['Stars','Dallas','#1ba377'],
    NYR:['Rangers','New York','#3b6fe0'], CAR:['Hurricanes','Carolina','#e23a3a'],
    FLA:['Panthers','Florida','#e2453c'], TBL:['Lightning','Tampa Bay','#2b6cff'],
    WPG:['Jets','Winnipeg','#2c4f86'], MIN:['Wild','Minnesota','#1f7a4d'],
    VAN:['Canucks','Vancouver','#2a6fd6'], SEA:['Kraken','Seattle','#3fb0c8'],
    NJD:['Devils','New Jersey','#e23a3a'], NYI:['Islanders','New York','#2a72c8'],
    PIT:['Penguins','Pittsburgh','#e8c84a'], WSH:['Capitals','Washington','#e2453c'],
    LAK:['Kings','Los Angeles','#9aa0a6'], SJS:['Sharks','San Jose','#1aa3b0'],
    DET:['Red Wings','Detroit','#e2453c'], MTL:['Canadiens','Montréal','#e2453c'],
    OTT:['Senators','Ottawa','#e23a4a'], BUF:['Sabres','Buffalo','#3b6fe0'],
    CGY:['Flames','Calgary','#e23a3a'], CHI:['Blackhawks','Chicago','#e2533c'],
    STL:['Blues','St. Louis','#2b6cff'], NSH:['Predators','Nashville','#e8c84a'],
    UTA:['Hockey Club','Utah','#3aa0e0'], PHI:['Flyers','Philadelphia','#f0742a'],
    ANA:['Ducks','Anaheim','#f0863a'], CBJ:['Blue Jackets','Columbus','#2a4f86'],
  };
  // Normalize ANY team code (case / punctuation / alias / relocation) to the canonical
  // tricode before lookup, so a live feed code like "ARI", "L.A", "veg" never greys out
  // a logo/color or shows the wrong abbreviation.
  const TEAM_ALIAS={LA:'LAK',NJ:'NJD',SJ:'SJS',TB:'TBL',CBS:'CBJ',CLB:'CBJ',VEG:'VGK',LV:'VGK',WIN:'WPG',WPJ:'WPG',MON:'MTL',NAS:'NSH',CAL:'CGY',ARI:'UTA',PHX:'UTA',UTAH:'UTA',ANH:'ANA',SEA:'SEA'};
  const normAb=a=>{const s=String(a||'').toUpperCase().replace(/[^A-Z]/g,'');return TEAM_ALIAS[s]||s;};
  const col = a => (TEAMS[normAb(a)]||[])[2] || '#888';
  const nick = a => (TEAMS[normAb(a)]||[])[0] || a;
  const city = a => (TEAMS[normAb(a)]||[])[1] || a;
  const ABBR = Object.keys(TEAMS);

  // seeded rng for deterministic slates
  const seed = s => { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; };
  const rng = s => { let a=seed(s)>>>0; return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; };
  const ri=(r,lo,hi)=>lo+Math.floor(r()*(hi-lo+1));
  const pick=(r,a)=>a[Math.floor(r()*a.length)];

  function momentum(r){ return Array.from({length:10},()=>ri(r,2,8)); }

  function slate(offset){
    const r=rng('bc'+offset);
    const pool=[...ABBR].sort(()=>r()-0.5);
    const n=ri(r,5,8); const games=[];
    for(let i=0;i<n && pool.length>=2;i++){
      const a=pool.pop(), h=pool.pop();
      const id=`g${offset}_${i}`;
      let g={id,a,h,sa:0,sh:0};
      if(offset<0){ let as=ri(r,0,5),hs=ri(r,0,5); if(as===hs){r()<.5?as++:hs++;} g={...g,as,hs,st:'final',sa:ri(r,22,38),sh:ri(r,22,38),ot:Math.abs(as-hs)===1&&r()<.2,mom:momentum(r)}; }
      else if(offset===0){ const roll=r();
        if(roll<.45){ g={...g,as:ri(r,0,4),hs:ri(r,0,4),st:'live',per:pick(r,['1st','2nd','3rd']),clk:`${String(ri(r,1,18)).padStart(2,'0')}:${String(ri(r,0,59)).padStart(2,'0')}`,sa:ri(r,8,32),sh:ri(r,8,32),mom:momentum(r)}; }
        else if(roll<.72){ let as=ri(r,1,5),hs=ri(r,0,4); if(as===hs)hs--; g={...g,as,hs,st:'final',sa:ri(r,24,38),sh:ri(r,24,38),ot:r()<.2,mom:momentum(r)}; }
        else { g={...g,as:0,hs:0,st:'pre',start:`${ri(r,6,9)}:${pick(r,['00','30'])} PM`,mom:[]}; }
      }
      else { g={...g,as:0,hs:0,st:'pre',start:`${ri(r,6,10)}:${pick(r,['00','30'])} PM`,mom:[]}; }
      games.push(g);
    }
    return games;
  }
  const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function dateLabel(o){ const d=new Date(); d.setDate(d.getDate()+o); return `${DOW[d.getDay()]} · ${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`; }

  // scoring summary + skater lines for a game (for detail)
  // Fictional, nationality-flavoured name pools — each player draws a coherent first+last from one
  // origin, weighted to rough NHL demographics. Deliberately NOT real NHL players (no real names/likenesses).
  const NAMES={
    na:{f:['Tanner','Brayden','Reid','Cole','Easton','Casey','Declan','Kieran','Mason','Dane','Beck','Sawyer','Quinn','Holden','Rory','Cody','Brett','Nolan','Logan','Tyson'],
        l:['Holloway','Brannigan','Beaumont','Ostrander','Whitlock','Bellamy','Kerrigan','Hartwell','Brisbane','Calloway','Renner','Ackerman','Drummond','Thibault','Renaud','Provost','Veasey','Marchetti','Castellano','Bellerose']},
    swe:{f:['Mattias','Linus','Niklas','Emil','Calle','Jesper','Hugo','Nils','Elias','Otto','Viktor','Anton'],
         l:['Vesterlund','Halvorsen','Granholm','Nyberg','Dahlberg','Lindqvist','Forsell','Sundby','Norquist','Stahl','Bergstrom','Hedlund']},
    fin:{f:['Aleksi','Joonas','Aaro','Teemu','Sten','Rasmus','Eetu','Miro','Kasper','Lauri'],
         l:['Korhonen','Kallio','Makinen','Rautio','Lehto','Salo','Heikkila','Niemi','Koskela','Ahonen']},
    rus:{f:['Dmitri','Nikita','Artyom','Yegor','Maxim','Pavel','Kirill','Ilya','Andrei','Vadim'],
         l:['Sokolov','Volkov','Morozov','Antipov','Yegorov','Lebedev','Belov','Zhukov','Pankov','Davydov']},
    cze:{f:['Marek','Tobias','Lukas','Patrik','Radek','Ondrej','Filip','Jan','Petr','Vojtech'],
         l:['Hladik','Novotny','Cermak','Kolar','Stransky','Benes','Vrabel','Kovac','Zeman','Dolezal']},
  };
  const ORIGINS=['na','na','na','na','na','na','na','na','swe','fin','rus','cze']; // ~67% NA, rest Euro
  const fullName=r=>{const g=NAMES[pick(r,ORIGINS)];return `${pick(r,g.f)} ${pick(r,g.l)}`;};
  function roster(team,key){ const r=rng('ros'+team+key); return Array.from({length:12},(_,i)=>({name:fullName(r),pos:pick(r,['C','LW','RW','C','LW','RW','D','D','D']),num:ri(r,9,97)})); }
  function detail(g){
    const r=rng('det'+g.id);
    const lines=team=>roster(team,g.id).map(p=>{const gl=r()<.22?ri(r,1,2):0,a=r()<.3?ri(r,1,2):0;return{...p,g:gl,a,p:gl+a,pm:ri(r,-2,3),sog:ri(r,0,6),hits:ri(r,0,5),toi:`${ri(r,9,23)}:${String(ri(r,0,59)).padStart(2,'0')}`};});
    const goals=[]; const add=(t,n)=>{for(let i=0;i<n;i++){const pool=roster(t,g.id).slice(0,9);const sk=pick(r,pool);const helpers=pool.filter(p=>p.name!==sk.name).sort(()=>r()-0.5);const nA=r()<0.12?0:(r()<0.55?2:1);const assists=helpers.slice(0,nA).map(p=>p.name);goals.push({team:t,scorer:sk.name,assists,per:pick(r,['1st','2nd','3rd']),time:`${String(ri(r,0,19)).padStart(2,'0')}:${String(ri(r,0,59)).padStart(2,'0')}`,str:pick(r,['EV','EV','EV','PP','SH'])});}};
    add(g.a,g.as);add(g.h,g.hs);
    const ord={'1st':0,'2nd':1,'3rd':2}; goals.sort((x,y)=>ord[x.per]-ord[y.per]||x.time.localeCompare(y.time));
    const stars=g.st.startsWith('final')?[1,2,3].map(n=>{const w=g.as>g.hs?g.a:g.h;const p=pick(r,roster(w,g.id).slice(0,6));return{n,name:p.name,team:w,line:`${ri(r,0,2)}G ${ri(r,0,2)}A`};}):[];
    const ts=(sog)=>({sog,fo:`${(45+r()*12).toFixed(1)}%`,pp:`${ri(r,0,4)}/${ri(r,2,6)}`,hits:ri(r,12,32),blk:ri(r,8,22),pim:ri(r,4,16)});
    return {away:{lines:lines(g.a),team:ts(g.sa)},home:{lines:lines(g.h),team:ts(g.sh)},goals,stars,
      refs:[pick(r,['Wes Halverson','Kelly Pruitt','Chris Garrity','Garrett Brennan']),pick(r,['Marc Mercer','Steve Ostroski','Jean Langlois'])],
      venue:`${city(g.h)} Arena`, attendance:(16500+ri(r,0,3000)).toLocaleString()};
  }

  const DIV={TOR:'Atlantic',BOS:'Atlantic',TBL:'Atlantic',FLA:'Atlantic',DET:'Atlantic',MTL:'Atlantic',OTT:'Atlantic',BUF:'Atlantic',
    NYR:'Metro',CAR:'Metro',NJD:'Metro',NYI:'Metro',PIT:'Metro',WSH:'Metro',PHI:'Metro',CBJ:'Metro',
    COL:'Central',DAL:'Central',WPG:'Central',MIN:'Central',NSH:'Central',STL:'Central',UTA:'Central',CHI:'Central',
    VGK:'Pacific',EDM:'Pacific',LAK:'Pacific',VAN:'Pacific',SEA:'Pacific',CGY:'Pacific',ANA:'Pacific',SJS:'Pacific'};
  const conf=d=>(d==='Atlantic'||d==='Metro')?'East':'West';

  // standings
  const STANDINGS=(()=>{
    const list=ABBR.map(a=>{const r=rng('st'+a);const gp=41,w=ri(r,14,30),otl=ri(r,2,7),l=gp-w-otl,pts=w*2+otl,gf=ri(r,108,165),ga=ri(r,98,158);
      return{ab:a,div:DIV[a],conf:conf(DIV[a]),gp,w,l,otl,pts,gf,ga,diff:gf-ga,
        last10:`${ri(r,3,8)}-${ri(r,0,4)}-${ri(r,0,2)}`,strk:pick(r,['W','W','L','OT'])+ri(r,1,5),
        ppg:+(2.6+r()*1.4).toFixed(2),trend:Array.from({length:10},()=>ri(r,0,2))};})
      .sort((x,y)=>y.pts-x.pts||y.diff-x.diff);
    return list;
  })();
  const rankOf=Object.fromEntries(STANDINGS.map((t,i)=>[t.ab,i+1]));
  const standBy=a=>STANDINGS.find(t=>t.ab===a);

  // rosters with stats + league leaders
  const allPlayers=[];
  ABBR.forEach(a=>{const r=rng('pl'+a);const tier=(33-rankOf[a])/33;
    for(let i=0;i<10;i++){const g=Math.max(0,Math.round((20-i*1.4)*(0.5+tier*0.7)+r()*7)),as=Math.max(0,Math.round((24-i)*(0.5+tier*0.6)+r()*8));
      allPlayers.push({id:`${a}${i}`,name:fullName(r),team:a,pos:i<6?pick(r,['C','LW','RW']):'D',num:ri(r,9,97),gp:ri(r,38,41),g,a:as,p:g+as,pm:ri(r,-18,28),sog:g*ri(r,5,8)+ri(r,10,30),toi:`${ri(r,12,22)}:${String(ri(r,0,59)).padStart(2,'0')}`});}});
  const goalies=[];
  ABBR.forEach(a=>{const r=rng('go'+a);goalies.push({id:a+'g',name:fullName(r),team:a,gp:ri(r,20,38),w:ri(r,12,28),l:ri(r,6,18),svp:(0.895+r()*0.035).toFixed(3).slice(1),gaa:(2.1+r()*1.1).toFixed(2),so:ri(r,0,5)});});
  const skaterLeaders=k=>[...allPlayers].sort((x,y)=>y[k]-x[k]);
  const goalieLeaders=()=>[...goalies].sort((x,y)=>y.svp.localeCompare(x.svp));
  const teamRoster=a=>{const k=normAb(a);return allPlayers.filter(p=>p.team===k).sort((x,y)=>y.p-x.p);};

  const PLAYERS = Array.from({length:24},(_,i)=>{const r=rng('pl0'+i);return {name:fullName(r), team:ABBR[i%ABBR.length]};});
  return { TEAMS, col, nick, city, ABBR, slate, dateLabel, detail, PLAYERS,
    DIV, conf, STANDINGS, rankOf, standBy, allPlayers, goalies, skaterLeaders, goalieLeaders, teamRoster };
})();
