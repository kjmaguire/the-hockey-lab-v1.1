/* The Hockey Lab — editorial data extensions (depth layer on top of window.BC) */
(function(){
  const B=window.BC;
  const seed=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
  const rng=s=>{let a=seed(s)>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  const ri=(r,lo,hi)=>lo+Math.floor(r()*(hi-lo+1));
  const pick=(r,a)=>a[Math.floor(r()*a.length)];

  // ---- rank helper across league ----
  const rankCache={};
  function rankField(vals,asc){ // vals: {ab:number}
    const order=Object.entries(vals).sort((a,b)=>asc?a[1]-b[1]:b[1]-a[1]);
    const m={};order.forEach(([ab],i)=>m[ab]=i+1);return m;
  }

  // ---- team stats (full) ----
  const TS={};
  B.ABBR.forEach(ab=>{const t=B.standBy(ab),r=rng('ts'+ab);
    TS[ab]={ gfPg:+(t.gf/t.gp).toFixed(2), gaPg:+(t.ga/t.gp).toFixed(2),
      pp:+(16+r()*12).toFixed(1), pk:+(74+r()*14).toFixed(1), fo:+(45+r()*10).toFixed(1),
      ptPct:+(t.pts/(t.gp*2)).toFixed(3), shotsFor:+(28+r()*6).toFixed(1), shotsAgainst:+(27+r()*6).toFixed(1),
      shPct:+(8+r()*4).toFixed(1), svPct:(0.895+r()*0.02).toFixed(3).slice(1), pdo:+(0.985+r()*0.03).toFixed(3),
      byPeriod:[ri(r,30,55),ri(r,30,55),ri(r,30,58)],
      gfStr:{ev:ri(r,80,120),pp:ri(r,28,55),sh:ri(r,2,10)}, gaStr:{ev:ri(r,80,120),pp:ri(r,24,50),sh:ri(r,1,9)} };
  });
  const rkGf=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].gfPg])),false);
  const rkGa=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].gaPg])),true);
  const rkPp=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].pp])),false);
  const rkPk=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].pk])),false);
  const rkFo=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].fo])),false);
  const rkPt=rankField(Object.fromEntries(B.ABBR.map(a=>[a,TS[a].ptPct])),false);
  B.teamStatsFull=ab=>({...TS[ab],ranks:{gf:rkGf[ab],ga:rkGa[ab],pp:rkPp[ab],pk:rkPk[ab],fo:rkFo[ab],pt:rkPt[ab]}});

  // ---- wild-card gap ----
  B.wildCardGap=ab=>{const t=B.standBy(ab);const conf=B.STANDINGS.filter(x=>x.conf===t.conf);
    const wc2=conf[7]; if(!wc2)return null; const rank=conf.findIndex(x=>x.ab===ab);
    return {gap:t.pts-wc2.pts, inField:rank<8};};

  // ---- prospects ----
  const FN=['Liam','Noah','Owen','Lucas','Jack','Cole','Wyatt','Felix','Mason','Adam','Leo','Theo','Emil','Anton','Niko'];
  const LN=['Cooley','Wright','Bedard','Michkov','Carlsson','Fantilli','Greig','Lindstrom','Mercer','Stankoven','Knies','Lundell','Holtz','Sennecke','Demidov'];
  const LEAGUES=['OHL','WHL','QMJHL','NCAA','AHL','Liiga','SHL','KHL'];
  const PROS={};
  B.ABBR.forEach(ab=>{const r=rng('pro'+ab);const mk=pos=>({name:`${pick(r,FN)} ${pick(r,LN)}`,pos,league:pick(r,LEAGUES),age:ri(r,18,22),draftYr:2021+ri(r,0,3),round:ri(r,1,5),gp:ri(r,20,55),pts:ri(r,8,62)});
    PROS[ab]={forwards:Array.from({length:ri(r,3,4)},()=>mk(pick(r,['C','LW','RW']))),defensemen:Array.from({length:ri(r,2,3)},()=>mk('D')),goalies:Array.from({length:ri(r,1,2)},()=>mk('G'))};});
  B.prospects=ab=>PROS[ab];

  // ---- player game log + extras ----
  const TROPHIES=['Art Ross','Hart','Rocket Richard','Norris','Selke','Lady Byng','Calder'];
  B.gameLog=p=>{const r=rng('log'+p.id);return Array.from({length:10},()=>{const opp=pick(r,B.ABBR.filter(a=>a!==p.team));const g=r()<.4?ri(r,1,2):0,a=r()<.45?ri(r,1,2):0,home=r()<.5,tf=ri(r,1,5),ta=ri(r,0,5);return{date:`${pick(r,['Jan','Feb'])} ${ri(r,1,28)}`,opp,home,result:`${tf>ta?'W':'L'} ${tf}-${ta}`,g,a,p:g+a,sog:ri(r,1,7),toi:`${ri(r,11,24)}:${String(ri(r,0,59)).padStart(2,'0')}`,pm:ri(r,-3,3)};});};
  B.seasonLog=p=>{const r=rng('slog'+p.id);const isG=p.type==='goalie';const MOS=['Oct','Nov','Dec','Jan','Feb','Mar'];const N=p.gp?Math.min(p.gp,32):28;
    return Array.from({length:N},(_,i)=>{const opp=pick(r,B.ABBR.filter(a=>a!==p.team));const home=r()<.5,tf=ri(r,1,6),ta=ri(r,0,5);const won=tf>ta;
      if(isG){const sa=ri(r,18,40),ga=ri(r,0,5);return{date:`${MOS[Math.floor(i/N*MOS.length)]} ${ri(r,1,28)}`,opp,home,result:`${won?'W':'L'} ${tf}-${ta}`,ga,sv:sa-ga,sa,svp:sa?((sa-ga)/sa).toFixed(3).replace(/^0/,''):'—',toi:'60:00'};}
      const g=r()<.42?ri(r,1,2):0,a=r()<.46?ri(r,1,2):0;return{date:`${MOS[Math.floor(i/N*MOS.length)]} ${ri(r,1,28)}`,opp,home,result:`${won?'W':'L'} ${tf}-${ta}`,g,a,p:g+a,sog:ri(r,0,7),toi:`${ri(r,11,24)}:${String(ri(r,0,59)).padStart(2,'0')}`,pm:ri(r,-3,3)};});};
  B.playerExtras=p=>{const r=rng('ext'+p.id);const isG=p.type==='goalie';
    const seasons=['2024-25','2023-24','2022-23','2021-22','2020-21'];
    const history=seasons.map((s,i)=>{const team=i<2?p.team:pick(r,B.ABBR);const gp=i===0?p.gp:ri(r,55,82);      return isG?{s,team,gp,w:ri(r,18,40),l:ri(r,12,30),svp:(0.895+r()*0.03).toFixed(3).slice(1),gaa:(2.2+r()*0.9).toFixed(2)}:
        (()=>{const g=i===0?p.g:ri(r,8,48),a=i===0?p.a:ri(r,12,60);return{s,team,gp,g,a,p:g+a,pm:ri(r,-18,28)};})();});
    const career=isG?history.reduce((c,s)=>({gp:c.gp+s.gp,w:c.w+s.w,l:c.l+s.l}),{gp:0,w:0,l:0}):history.reduce((c,s)=>({gp:c.gp+s.gp,g:c.g+s.g,a:c.a+s.a,p:c.p+s.p}),{gp:0,g:0,a:0,p:0});
    const star=p.p>=55||(isG&&p.gp>=24);
    const awards=star?Array.from({length:ri(r,1,3)},()=>({yr:`20${ri(r,18,24)}`,name:pick(r,TROPHIES)})):[];
    // structured honors: trophies grouped w/ years + count, all-star selections, career milestones
    const TROPHY_DESC={'Art Ross':'Scoring leader','Hart':'League MVP','Rocket Richard':'Goal-scoring leader','Norris':'Top defenseman','Selke':'Top defensive forward','Lady Byng':'Sportsmanship','Calder':'Rookie of the year','Vezina':'Top goaltender','Conn Smythe':'Playoff MVP'};
    const poolT=isG?['Vezina','Hart','Conn Smythe']:(p.pos==='D'?['Norris','Hart','Art Ross','Conn Smythe']:['Art Ross','Hart','Rocket Richard','Selke','Lady Byng','Conn Smythe']);
    const won={};if(star){const n=ri(r,1,3);for(let i=0;i<n;i++){const t=pick(r,poolT);(won[t]=won[t]||[]).push(2018+ri(r,0,7));}}
    const trophies=Object.entries(won).map(([name,yrs])=>({name,desc:TROPHY_DESC[name]||'',years:[...new Set(yrs)].sort((a,b)=>b-a),count:[...new Set(yrs)].length}));
    const allStar=star?ri(r,1,8):(r()<.3?ri(r,1,2):0);
    const cup=r()<(star?.34:.16);const cupYears=cup?[2017+ri(r,0,8)]:[];
    const milestones=[];
    if(!isG){if(p.g>=30)milestones.push({label:`${Math.floor((400+p.g*4)/100)*100}+ career goals`,hit:true});if(p.p>=55)milestones.push({label:`${Math.floor((600+p.p*4)/100)*100}+ career points`,hit:true});}
    else{if(p.w>=15)milestones.push({label:`${Math.floor((200+p.w*6)/50)*50}+ career wins`,hit:true});}
    const honors={trophies,allStar,cups:cupYears,milestones,hasAny:trophies.length>0||allStar>0||cup||milestones.length>0};
    const teammates=B.teamRoster(p.team).filter(x=>x.id!==p.id).slice(0,6);
    return{history,career,awards,honors,last5:B.gameLog(p).slice(0,5),teammates};};

  // ---- edge detail ----
  const epct=r=>Math.round(40+r()*59);
  function rawSkater(p){const r=rng('se'+p.id);return{top:+(20.5+r()*3.6).toFixed(2),shot:+(70+r()*28).toFixed(1),savg:+(55+r()*18).toFixed(1),b20:ri(r,8,140),b22:ri(r,0,42),dist:+(120+r()*70).toFixed(1),oz:+(40+r()*22).toFixed(1)};}
  B.edgeSkaterRaw=rawSkater;
  B.skaterEdge=p=>{const e=rawSkater(p);const r=rng('sepct'+p.id);
    const oz=e.oz,dz=+((100-oz)*0.46).toFixed(1),nz=+(100-oz-dz).toFixed(1);
    return{seasons:['2024-25 (Regular)','2023-24 (Regular)','2022-23 (Regular)'],
      summary:[['Top skating speed',`${e.top} mph`],['Bursts 20+',e.b20],['Bursts 22+',e.b22],['Top shot speed',`${e.shot} mph`],['Avg shot speed',`${e.savg} mph`],['O-zone time',`${oz}%`]],
      speed:[['Top shot speed',`${e.shot} mph`,epct(r),`${(e.shot*0.84).toFixed(1)} mph`],['Max skating speed',`${e.top} mph`,epct(r),`${(e.top*0.92).toFixed(1)} mph`],['Total distance',`${e.dist} mi`,epct(r),`${(e.dist*0.9).toFixed(0)} mi`],['Bursts over 20',e.b20,epct(r),Math.round(e.b20*0.8)],['Bursts over 22',e.b22,epct(r),Math.round(e.b22*0.7)],['O-zone time',`${oz}%`,epct(r),`${(oz*0.9).toFixed(0)}%`]],
      zones:[['Offensive',oz],['Neutral',nz],['Defensive',dz]]};};
  B.goalieEdge=g=>{const r=rng('ge'+g.id);return{seasons:['2024-25 (Regular)','2023-24 (Regular)'],
    summary:[['Overall SV%',g.svp],['GAA',g.gaa],['Shutouts',g.so],['Record',`${g.w}-${g.l}`]],
    saveQ:[['High-danger SV%',(0.80+r()*0.09).toFixed(3).slice(1),epct(r),'.812',ri(r,120,260)],['Mid-danger SV%',(0.88+r()*0.07).toFixed(3).slice(1),epct(r),'.910',ri(r,300,520)],['Low-danger SV%',(0.96+r()*0.03).toFixed(3).slice(1),epct(r),'.975',ri(r,400,700)]]};};

  // ---- edge leaderboards (skater tracking + goalie high-danger) ----
  B.goalieHD=g=>{const r=rng('ge'+g.id);return +(0.80+r()*0.09).toFixed(3);};
  const _el={};
  B.edgeLeaders=metric=>{ if(_el[metric])return _el[metric];
    const arr=B.allPlayers.map(p=>({p,v:rawSkater(p)[metric]})).sort((a,b)=>b.v-a.v).slice(0,5).map(x=>({...x.p,_v:x.v}));
    _el[metric]=arr; return arr; };
  // team skating distance (miles/game) leaderboard
  B.edgeTeamDistance=()=>{ if(_el._dist)return _el._dist;
    const arr=B.ABBR.map(ab=>{const r=rng('td'+ab);return{ab,mi:+(58+r()*14).toFixed(1),top:+(21.5+r()*2.4).toFixed(1)};}).sort((a,b)=>b.mi-a.mi).slice(0,6);
    _el._dist=arr; return arr; };
  // head-to-head skater comparison on edge metrics
  B.edgeCompare=(idA,idB)=>{const A=B.allPlayers.find(p=>p.id===idA)||B.allPlayers[0];const B2=B.allPlayers.find(p=>p.id===idB)||B.allPlayers[1];
    const ea=rawSkater(A),eb=rawSkater(B2);
    const rows=[['Top skating speed','top',' mph'],['Top shot speed','shot',' mph'],['20+ mph bursts','b20',''],['Distance / gm','dist',' mi'],['O-zone time','oz','%']];
    return {A,B:B2,rows:rows.map(([l,k,u])=>({l,u,a:ea[k],b:eb[k],aWins:ea[k]>=eb[k]}))};};
  // head-to-head goalie comparison on edge save metrics
  function rawGoalie(g){const r=rng('gec'+g.id);return{hd:+(80+r()*9).toFixed(1),md:+(88+r()*7).toFixed(1),ld:+(96+r()*3).toFixed(1),
    gsax:+((r()*3-0.8)*5).toFixed(1),reb:+(70+r()*22).toFixed(1),hf:+(9+r()*5).toFixed(1)};}
  B.goalieEdgeCompare=(idA,idB)=>{const gs=B.goalies;const A=gs.find(g=>g.id===idA)||gs[0];const B2=gs.find(g=>g.id===idB)||gs[1];
    const ra=rawGoalie(A),rb=rawGoalie(B2);const svN=s=>parseFloat(s);
    const rows=[
      {l:'Save %',u:'',a:A.svp,b:B2.svp,aWins:svN(A.svp)>=svN(B2.svp)},
      {l:'Goals-against avg',u:'',a:A.gaa,b:B2.gaa,aWins:A.gaa<=B2.gaa},
      {l:'High-danger SV%',u:'%',a:ra.hd,b:rb.hd,aWins:ra.hd>=rb.hd},
      {l:'Mid-danger SV%',u:'%',a:ra.md,b:rb.md,aWins:ra.md>=rb.md},
      {l:'Low-danger SV%',u:'%',a:ra.ld,b:rb.ld,aWins:ra.ld>=rb.ld},
      {l:'Goals saved a.e.',u:'',a:(ra.gsax>=0?'+':'')+ra.gsax,b:(rb.gsax>=0?'+':'')+rb.gsax,aWins:ra.gsax>=rb.gsax},
      {l:'Rebound control',u:'%',a:ra.reb,b:rb.reb,aWins:ra.reb>=rb.reb},
      {l:'HD shots faced/60',u:'',a:ra.hf,b:rb.hf,aWins:ra.hf>=rb.hf},
    ];
    return {A:{...A,type:'goalie'},B:{...B2,type:'goalie'},rows};};
  B.goalieHDLeaders=()=>{ if(_el._hd)return _el._hd;
    const arr=B.goalies.filter(g=>g.gp>=12).map(g=>({...g,type:'goalie',hd:B.goalieHD(g)})).sort((a,b)=>b.hd-a.hd).slice(0,5);
    _el._hd=arr; return arr; };

  // ---- shot location map (SVG rink coords: 0-200 x / 0-85 y, away attacks right) ----
  const SHOT_TYPES=['Wrist','Slap','Snap','Backhand','Tip-In','Wrap-around','Deflected'];
  B.shotMap=g=>{const r=rng('shot'+g.id);const out=[];
    const roster=t=>B.teamRoster(t).slice(0,12);
    // side 'R' => away net at x≈189; 'L' => home net at x≈11
    const gen=(team,side,sog,goals)=>{
      const rs=roster(team); const netX=side==='R'?189:11;
      const place=(t)=>{ // returns {x,y} for a shot of given kind, clustered toward the right net then mirrored for L
        let x,y;
        if(t==='goal'){x=155+r()*30;y=27+r()*31;}            // slot / high-danger
        else if(t==='on'){x=128+r()*58;y=12+r()*61;}          // offensive zone, on net
        else if(t==='miss'){x=120+r()*72;y=6+r()*73;}         // wider, can sail wide/long
        else {x=112+r()*44;y=10+r()*65;}                      // blocked: nearer the blue line
        if(side==='L'){x=200-x;y=85-y;}                        // mirror to the left end
        return{x:+x.toFixed(1),y:+y.toFixed(1)};
      };
      const emit=(t,n)=>{for(let i=0;i<n;i++){const{x,y}=place(t);
        const dist=Math.round(Math.hypot(netX-x,42.5-y));
        out.push({team,x,y,goal:t==='goal',type:t,shooter:pick(r,rs).name,
          shotType:pick(r,SHOT_TYPES),per:pick(r,['1st','2nd','3rd']),
          time:`${String(ri(r,0,19)).padStart(2,'0')}:${String(ri(r,0,59)).padStart(2,'0')}`,dist});}};
      emit('goal',goals);
      emit('on',Math.max(0,sog-goals));
      emit('miss',Math.round(sog*0.55));
      emit('block',Math.round(sog*0.45));
    };
    gen(g.a,'R',g.sa||0,g.as||0); gen(g.h,'L',g.sh||0,g.hs||0);
    return out;};

  // ---- season-long aggregate shot zones (NHL Edge: shots/goals/sh% per zone vs league) ----
  // volWeight ~ share of shots; baseSh = league-avg shooting %, baseSv = league-avg save %
  const ZONE_BASE=[
    ['net','Net-front',0.11,17.5,82.5],
    ['slot','Slot',0.20,13.5,86.5],
    ['highslot','High slot',0.14,7.5,92.5],
    ['lcircle','Left circle',0.145,9.0,91.0],
    ['rcircle','Right circle',0.145,9.0,91.0],
    ['lpoint','Left point',0.095,4.0,96.0],
    ['rpoint','Right point',0.095,4.0,96.0],
    ['behind','Below goal line',0.06,5.0,95.0],
  ];
  B.shotZones=(scope,id)=>{const r=rng('zones'+scope+id);
    const goalie=scope==='goalie';
    const total=scope==='team'?ri(r,2300,2780):goalie?ri(r,1280,1820):ri(r,150,330);
    const zones=ZONE_BASE.map(([key,label,w,sh,sv])=>{
      const shots=Math.max(1,Math.round(total*w*(0.82+r()*0.42)));
      const lg=goalie?sv:sh;
      const pct=+Math.max(0,(lg+(r()*2-1)*(goalie?2.4:3.4))).toFixed(1); // own rate, near league ± edge
      const made=goalie?Math.round(shots*(1-pct/100)):Math.round(shots*pct/100); // GA or goals
      return {key,label,shots,made,pct,lg:+lg.toFixed(1),share:0};
    });
    const tShots=zones.reduce((s,z)=>s+z.shots,0);
    zones.forEach(z=>{z.share=+(z.shots/tShots).toFixed(4);});
    const tMade=zones.reduce((s,z)=>s+z.made,0);
    const overall=+((goalie?(1-tMade/tShots):(tMade/tShots))*100).toFixed(1);
    return {scope,source:'sample',shots:tShots,made:tMade,pct:overall,zones};};

  // ---- season series + play-by-play ----
  B.seasonSeries=g=>{const r=rng('ss'+g.a+g.h);return Array.from({length:3},(_,i)=>{const home=i%2===0?g.h:g.a,away=i%2===0?g.a:g.h;const hs=ri(r,1,5),as=ri(r,0,4)+(hs===0?1:0);return{date:`${pick(r,['Oct','Nov','Dec'])} ${ri(r,1,28)}`,away,home,as,hs};});};
  const EVT=['Goal','Shot','Penalty','Hit','Faceoff','Giveaway','Takeaway','Block'];
  const INFRACTIONS=['Tripping','Hooking','Slashing','Interference','Roughing','High-sticking','Holding','Cross-checking','Boarding','Delay of game','Too many men','Goaltender interference'];
  B.playByPlay=g=>{if(g.st==='pre')return[];const r=rng('pbp'+g.id);const out=[];['1st','2nd','3rd'].forEach(per=>{let sec=0;const n=ri(r,9,16);for(let i=0;i<n;i++){sec+=ri(r,25,80);if(sec>1200)break;const team=r()<.5?g.a:g.h;const type=pick(r,EVT);const pl=pick(r,B.teamRoster(team).slice(0,12));const mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');const infraction=type==='Penalty'?pick(r,INFRACTIONS):null;out.push({per,time:`${mm}:${ss}`,team,type,infraction,desc:edesc(type,pl.name,team,infraction)});}});return out;};
  function edesc(t,n,tm,inf){switch(t){case'Goal':return`GOAL — ${n} (${tm})`;case'Shot':return`${n} shot on goal`;case'Penalty':return`${n} — 2 min, ${inf}`;case'Hit':return`${n} hit`;case'Faceoff':return`Faceoff won by ${tm}`;case'Giveaway':return`Giveaway by ${n}`;case'Takeaway':return`Takeaway by ${n}`;default:return`Blocked shot — ${n}`;}}

  // ---- scores expandable extras ----
  const VEN={TOR:'Scotiabank Arena',BOS:'TD Garden',NYR:'Madison Square Garden',MTL:'Bell Centre',EDM:'Rogers Place',VGK:'T-Mobile Arena',COL:'Ball Arena',DAL:'American Airlines Center',TBL:'Amalie Arena',CHI:'United Center'};
  const TV=['ESPN','TNT','ABC','SN','NESN','MSG','BSSO','SN360'];
  B.gameExtras=g=>{const r=rng('gx'+g.id);const tv=[pick(r,TV),r()<.45?pick(r,TV):null].filter(Boolean);
    const al=B.teamRoster(g.a),hl=B.teamRoster(g.h);const ag=B.goalies.find(x=>x.team===g.a),hg=B.goalies.find(x=>x.team===g.h);
    const split=tot=>{const a=ri(r,0,Math.max(0,tot));const b=ri(r,0,Math.max(0,tot-a));return[a,b,tot-a-b];};
    return{tv,venue:VEN[g.h]||`${B.city(g.h)} Arena`,leaders:{away:al[0],home:hl[0]},goalies:{away:ag,home:hg},line:{away:split(g.as),home:split(g.hs)}};};

  // ---- team schedule next5/last5 ----
  B.teamSchedule=ab=>{const rec=[],up=[];for(let o=-6;o<=0;o++)B.slate(o).forEach(g=>{if((g.a===ab||g.h===ab)&&g.st.startsWith('final'))rec.push(g);});for(let o=0;o<=6;o++)B.slate(o).forEach(g=>{if((g.a===ab||g.h===ab)&&!g.st.startsWith('final')&&g.st!=='final')up.push(g);});return{up:up.slice(0,5),rec:rec.slice(-5).reverse()};};

  // ---- team head-to-head comparison ----
  B._tc={};
  B.teamCompare=(aAb,bAb)=>{const key=aAb+'|'+bAb;if(B._tc[key])return B._tc[key];
    const sa=B.standBy(aAb),sb=B.standBy(bAb);const r=rng('tcmp'+key);
    const st=ab=>{const rr=rng('tcst'+ab);return{pp:+(15.5+rr()*12).toFixed(1),pk:+(74+rr()*14).toFixed(1),fo:+(46+rr()*9).toFixed(1),shots:+(28+rr()*7).toFixed(1),hits:+(17+rr()*13).toFixed(1),dist:+(70+rr()*5).toFixed(1),topSpd:+(22+rr()*2.6).toFixed(1)};};
    const ea=st(aAb),eb=st(bAb);const pg=(s,k)=>s.gp?+(s[k]/s.gp).toFixed(2):0;
    const rows=[
      {l:'Points',a:sa.pts,b:sb.pts},
      {l:'Wins',a:sa.w,b:sb.w},
      {l:'Goals for / gm',a:pg(sa,'gf'),b:pg(sb,'gf')},
      {l:'Goals against / gm',a:pg(sa,'ga'),b:pg(sb,'ga'),low:true},
      {l:'Power play %',a:ea.pp,b:eb.pp,u:'%'},
      {l:'Penalty kill %',a:ea.pk,b:eb.pk,u:'%'},
      {l:'Faceoff %',a:ea.fo,b:eb.fo,u:'%'},
      {l:'Shots / gm',a:ea.shots,b:eb.shots},
      {l:'Hits / gm',a:ea.hits,b:eb.hits},
      {l:'Top skating speed',a:ea.topSpd,b:eb.topSpd,u:' mph'},
      {l:'Skating dist / gm',a:ea.dist,b:eb.dist,u:' mi'},
    ];
    const N=ri(r,2,4);const meet=Array.from({length:N},()=>{const home=r()<.5?aAb:bAb,away=home===aAb?bAb:aAb;const hs=ri(r,1,6),as=ri(r,0,5);return{home,away,hs,as,date:`${pick(r,['Oct','Nov','Dec','Jan','Feb'])} ${ri(r,1,28)}`,ot:Math.abs(hs-as)===1&&r()<.35};});
    const out={a:aAb,b:bAb,sa,sb,rows,meet};B._tc[key]=out;return out;};
  // ---- franchise (team-level) records ----
  B._tfr={};
  B.teamFranchiseRecords=ab=>{ if(B._tfr[ab])return B._tfr[ab]; const r=rng('tfr'+ab);
    const SEAS=['2018-19','2005-06','1976-77','1995-96','2022-23','1983-84','2009-10','1992-93','2014-15','1988-89'];
    const ys=()=>pick(r,SEAS); const opp=()=>`${B.city(pick(r,B.ABBR.filter(a=>a!==ab)))}`;
    const season=[
      {label:'Most wins',v:ri(r,54,63),s:ys()},
      {label:'Most points',v:ri(r,118,135),s:ys()},
      {label:'Most goals for',v:ri(r,300,340),s:ys()},
      {label:'Fewest goals against',v:ri(r,162,196),s:ys()},
      {label:'Best points %',v:(0.74+r()*0.1).toFixed(3).replace(/^0/,''),s:ys()},
      {label:'Longest win streak',v:`${ri(r,12,18)} GP`,s:ys()},
      {label:'Longest point streak',v:`${ri(r,16,25)} GP`,s:ys()},
      {label:'Most home wins',v:ri(r,28,34),s:ys()},
      {label:'Most road wins',v:ri(r,23,30),s:ys()},
      {label:'Most shutouts',v:ri(r,9,14),s:ys()},
    ];
    const game=[
      {label:'Most goals, game',v:ri(r,10,14),d:`vs ${opp()}`},
      {label:'Largest margin',v:`${ri(r,8,11)} goals`,d:`vs ${opp()}`},
      {label:'Most shots, game',v:ri(r,52,62),d:`vs ${opp()}`},
      {label:'Most goals, period',v:ri(r,5,7),d:`vs ${opp()}`},
    ];
    const tt=B.teamTitles?B.teamTitles(ab):{playoffApps:0};
    const allTime={wins:ri(r,1400,3300),seasons:ri(r,30,108),playoffApps:tt.playoffApps,winPct:(0.46+r()*0.12).toFixed(3).replace(/^0/,'')};
    B._tfr[ab]={season,game,allTime}; return B._tfr[ab]; };

  // ---- team hub news feed (front-page storylines, team-driven) ----
  B._tn={};
  B.teamNews=ab=>{ if(B._tn[ab])return B._tn[ab]; const r=rng('news'+ab);
    const rs=B.teamRoster(ab); const top=rs[0],second=rs[1]||rs[0];
    const gs=(B.goalies||[]).filter(x=>x.team===ab).slice().sort((a,b)=>parseFloat(b.svp)-parseFloat(a.svp)); const g1=gs[0];
    const st=B.standBy(ab); const pros=B.prospects(ab); const topPro=pros.forwards[0]||pros.defensemen[0]||pros.goalies[0];
    const gap=B.wildCardGap?B.wildCardGap(ab):null;
    const k=st.strk[0],n=parseInt(st.strk.slice(1),10)||0;
    const cards=[];
    cards.push({kind:'player',ref:top,accent:'brand',tag:'Team leader',headline:`${top.name} is pacing the offense`,sub:`${top.p} PTS · ${top.g}G ${top.a}A · ${top.gp} GP`});
    if(k==='W'&&n>=2)cards.push({kind:'tab',ref:'Schedule',accent:'pos',tag:'Hot streak',headline:`${B.city(ab)} have won ${n} straight`,sub:`${st.strk} · ${st.w}-${st.l}-${st.otl} · climbing the standings`});
    else if(k==='L'&&n>=2)cards.push({kind:'tab',ref:'Schedule',accent:'neg',tag:'Cold snap',headline:`${B.city(ab)} dropped ${n} in a row`,sub:`${st.strk} · ${st.w}-${st.l}-${st.otl} · searching for answers`});
    else cards.push({kind:'tab',ref:'Schedule',accent:'mut',tag:'Current form',headline:`${B.city(ab)} sitting ${st.last10} over their last 10`,sub:`${st.strk} · ${st.w}-${st.l}-${st.otl}`});
    cards.push({kind:'player',ref:second,accent:'edge',tag:'NHL Edge',headline:`${second.name} clocking ${(21+r()*3).toFixed(1)} mph`,sub:`among the league's fastest — full tracking on the Edge tab`});
    if(g1)cards.push({kind:'player',ref:{...g1,type:'goalie',pos:'G'},accent:'brand',tag:'Between the pipes',headline:`${g1.name} steady in the crease`,sub:`${g1.svp} SV% · ${g1.gaa} GAA · ${g1.w}-${g1.l}`});
    if(topPro)cards.push({kind:'tab',ref:'Prospects',accent:'gold',tag:'Pipeline',headline:`${topPro.name} turning heads in the system`,sub:`${topPro.league} · ${topPro.pts} pts · ${topPro.draftYr} R${topPro.round}`});
    if(gap)cards.push({kind:'tab',ref:'Schedule',accent:gap.inField?'pos':'neg',tag:'Playoff picture',headline:gap.inField?`${B.city(ab)} hold a playoff spot`:`${B.city(ab)} are chasing the cut line`,sub:`${gap.gap>=0?'+':''}${gap.gap} on the wild-card line`});
    B._tn[ab]=cards; return cards; };

  // ---- hockey IQ extras ----
  B.restTracker=()=>B.ABBR.map(ab=>{const d=(ab.charCodeAt(0)+ab.charCodeAt(2))%4;return{ab,days:d,b2b:d===0};}).sort((a,b)=>a.days-b.days).slice(0,6);
  B.strengthOfSchedule=()=>{const c=Object.fromEntries(B.ABBR.map(a=>[a,0]));for(let o=1;o<=5;o++)B.slate(o).forEach(g=>{c[g.a]++;c[g.h]++;});return Object.entries(c).map(([ab,n])=>({ab,n})).sort((a,b)=>b.n-a.n).slice(0,6);};

  // ---- DRAFT ----
  const PFN=['Gavin','Michael','Cole','Porter','Berkly','Cayden','Roger','James','Malcolm','Trevor','Lukas','Ivan','Anton','Viktor','Emil','Sascha','Carter','Brady','Will','Beckett'];
  const PLN=['McKenna','Misa','Hagens','Martone','Catton','Lin','McQueen','Hagens','Spence','Connelly','Frondell','Ryabkin','Eklund','Reschny','Mrtka','Boumedienne','Aitcheson','Smith','Horcoff','OByrne'];
  const PLEAGUES=['WHL','OHL','QMJHL','USHL','NCAA','Liiga','SHL','J20 Nationell'];
  const DRAFT_POS=['C','LW','RW','D','D','G'];
  B.draftRankings=()=>{ if(B._dr)return B._dr;
    const r=rng('draft2026');
    const list=Array.from({length:32},(_,i)=>({rank:i+1,name:`${pick(r,PFN)} ${pick(r,PLN)}`,pos:pick(r,DRAFT_POS),league:pick(r,PLEAGUES),gp:ri(r,40,68),pts:ri(r,30,120),ht:`${ri(r,5,6)}'${ri(r,8,11)}"`,wt:ri(r,165,215),trend:pick(r,['▲','▬','▼','▲','▬'])}));
    B._dr=list; return list; };
  B.draftPicks=()=>{ if(B._dp)return B._dp;
    const r=rng('picks2026'); const ranked=B.draftRankings();
    // pre-lottery order: 16 non-playoff teams, worst record picks first (slot 1)
    const nonPlayoff=[...B.STANDINGS].slice(16).reverse(); // worst first
    const preOrder=nonPlayoff.map((t,i)=>({ab:t.ab,slot:i+1,pts:t.pts}));
    // lottery: two winners jump to picks 1 & 2 (NHL allows max 10-spot jump)
    const eligible=preOrder.slice(0,12);
    const w1=eligible[2+Math.floor(r()*8)]; // a mid-lottery team jumps to #1
    let w2=eligible[1+Math.floor(r()*7)]; if(w2.ab===w1.ab) w2=eligible[0];
    const winners=[w1.ab,w2.ab];
    // build post-lottery order: winners first, then everyone else by slot
    const rest=preOrder.filter(t=>!winners.includes(t.ab));
    const ordered=[{...w1},{...w2},...rest];
    const list=ordered.map((t,i)=>{const p=ranked[i]||ranked[ranked.length-1];
      return {pick:i+1, team:t.ab, slot:t.slot, moved:t.slot-(i+1), lotteryWin:winners.includes(t.ab),
        name:p.name, pos:p.pos, league:p.league};});
    B._dp=list; B._lotteryWinners=winners; return list; };
  B.lotteryWinners=()=>{ B.draftPicks(); return B._lotteryWinners; };
  B.draftTracker=()=>B.draftPicks().slice(0,10);
  // full 7-round order (32 picks/round = 224). Round 1 applies the lottery; later rounds follow reverse standings.
  B.draftRounds=()=>{ if(B._drnds)return B._drnds; const r=rng('drounds');
    const base=[...B.STANDINGS].slice().reverse().map((t,i)=>({ab:t.ab,slot:i+1})); // all 32, worst first
    const winners=B.lotteryWinners();
    const rest=base.filter(t=>!winners.includes(t.ab));
    const r1order=[...winners.map(ab=>base.find(t=>t.ab===ab)).filter(Boolean),...rest];
    const ranked=B.draftRankings();
    const mk=()=>({name:`${pick(r,PFN)} ${pick(r,PLN)}`,pos:pick(r,DRAFT_POS),league:pick(r,PLEAGUES)});
    const rounds=[];
    for(let rd=1;rd<=7;rd++){const order=rd===1?r1order:base;
      rounds.push(order.map((t,i)=>{const overall=(rd-1)*32+i+1;const pr=rd===1?(ranked[i]||mk()):mk();
        const traded=r()<0.17; const pickedBy=traded?pick(r,B.ABBR.filter(a=>a!==t.ab)):t.ab;
        return {round:rd,pick:i+1,overall,team:t.ab,pickedBy,traded,name:pr.name,pos:pr.pos,league:pr.league,lotteryWin:rd===1&&winners.includes(t.ab)};}));}
    B._drnds=rounds; return B._drnds; };

  // ---- game detail extras: recap, broadcasts, shift chart, goal replays ----
  B.gameRecap=g=>{const r=rng('rec'+g.id);const w=g.as>g.hs?g.a:g.h,wn=B.city(w);const star=pick(r,B.teamRoster(w).slice(0,4));
    return `${wn} ${g.as>g.hs?'held off':'edged'} ${B.city(g.as>g.hs?g.h:g.a)} ${Math.max(g.as,g.hs)}-${Math.min(g.as,g.hs)} behind ${star.name}'s multi-point night and ${ri(r,24,38)} saves. The result moves ${B.nick(w)} in a tight ${B.standBy(w)?B.standBy(w).conf:'conference'} race.`;};
  B.broadcasts=g=>{const r=rng('bx'+g.id);const tv=['ESPN','TNT','SN','NESN','MSG','BSSO','TVAS'];return{tv:[pick(r,tv),r()<.4?pick(r,tv):null].filter(Boolean),stream:['ESPN+','Max'].slice(0,ri(r,1,2)),radio:`${g.a} Radio · ${g.h} Radio`,odds:`${g.a} ${r()<.5?'-':'+'}${ri(r,110,180)} · ${g.h} ${r()<.5?'-':'+'}${ri(r,110,180)}`};};
  B.shiftChart=g=>{const r=rng('sh'+g.id);const mk=team=>B.teamRoster(team).slice(0,6).map(p=>({name:p.name,pos:p.pos,toi:`${ri(r,11,24)}:${String(ri(r,0,59)).padStart(2,'0')}`,shifts:ri(r,18,32),pct:ri(r,28,62)}));return{away:mk(g.a),home:mk(g.h)};};
  B.goalReplays=g=>{const goals=B.detail(g).goals;return goals.map((go,i)=>({...go,id:i,clip:`Goal ${i+1}`}));};

  // ---- live NHL Edge snapshot for a single game (second-screen) ----
  B._le={};
  B.liveEdge=g=>{ if(B._le[g.id])return B._le[g.id];
    const r=rng('le'+g.id);
    const aR=B.teamRoster(g.a),hR=B.teamRoster(g.h);
    const aAtt=ri(r,30,64),hAtt=ri(r,30,64);
    const oz=ri(r,40,60);
    const base={
      att:{a:aAtt,h:hAtt},
      momentum:+(r()*1.2-0.6).toFixed(2),                 // -.6..+.6, + = home pressure
      hardest:{a:+(86+r()*18).toFixed(1),h:+(86+r()*18).toFixed(1),aby:pick(r,aR).name,hby:pick(r,hR).name},
      topspd:{a:+(21.4+r()*3.6).toFixed(1),h:+(21.4+r()*3.6).toFixed(1),aby:pick(r,aR).name,hby:pick(r,hR).name},
      dist:{a:+(40+r()*40).toFixed(1),h:+(40+r()*40).toFixed(1)},   // combined skater miles so far
      hits:{a:ri(r,3,26),h:ri(r,3,26)},
      oz:{a:oz,h:100-oz},
      xg:{a:+(0.6+r()*2.2).toFixed(2),h:+(0.6+r()*2.2).toFixed(2)},
      pace:ri(r,52,78),                                   // shot attempts / 60, both teams
    };
    B._le[g.id]=base; return base; };

  // ---- tonight's special-teams tally (from play-by-play penalties) ----
  B._st={};
  B.specialTeams=g=>{ if(B._st[g.id])return B._st[g.id];
    const r=rng('st'+g.id); const pens={};
    B.playByPlay(g).filter(e=>e.type==='Penalty').forEach(e=>{pens[e.team]=(pens[e.team]||0)+1;});
    const oppOf={[g.a]:g.h,[g.h]:g.a}; const ppOpp={},ppG={};
    [g.a,g.h].forEach(ab=>{ ppOpp[ab]=pens[oppOf[ab]]||0; ppG[ab]=ppOpp[ab]?ri(r,0,Math.min(2,ppOpp[ab])):0; });
    const mk=ab=>{ const pkFaced=ppOpp[oppOf[ab]]; return {ppG:ppG[ab],ppOpp:ppOpp[ab],pkFaced,pkK:Math.max(0,pkFaced-ppG[oppOf[ab]])}; };
    B._st[g.id]={[g.a]:mk(g.a),[g.h]:mk(g.h)}; return B._st[g.id]; };

  // ---- per-player live tracking for a game (follow-a-player second screen) ----
  B._lgp={};
  B.liveGamePlayers=g=>{ if(B._lgp[g.id])return B._lgp[g.id];
    const r=rng('lgp'+g.id);
    const mkG=ab=>{ const gi=(B.goalies||[]).find(x=>x.team===ab)||{name:'Starter'};
      const sa=ri(r,9,27),ga=ri(r,0,4),hdSa=ri(r,3,11),hdGa=Math.min(ga,ri(r,0,3));
      return {id:ab+'g',name:gi.name,team:ab,pos:'G',num:ri(r,30,39),onIce:true,isG:true,
        sa,saves:sa-ga,ga,hdSa,hdSaves:hdSa-hdGa,freezes:ri(r,3,12),toiSec:ri(r,600,2400)}; };
    const mk=ab=>{ const sk=B.teamRoster(ab).slice(0,10).map((p,i)=>{ const onIce=i<5;
      return {id:p.id,name:p.name,team:ab,pos:p.pos,num:p.num,onIce,
        toiSec:ri(r,180,940),shifts:ri(r,6,18),shiftSec:onIce?ri(r,4,64):0,
        topSpd:+(20.4+r()*4.4).toFixed(1),dist:+(1.2+r()*3.4).toFixed(2),
        hardest:p.pos==='D'?+(82+r()*22).toFixed(1):+(72+r()*28).toFixed(1),
        b20:ri(r,2,22),b22:ri(r,0,8),sog:ri(r,0,5),att:ri(r,0,9),hits:ri(r,0,6),blk:ri(r,0,5),
        oz:(()=>{const o=ri(r,30,60),d=Math.round((100-o)*0.45);return{o,n:100-o-d,d};})()};
    }); sk.push(mkG(ab)); return sk; };
    B._lgp[g.id]={[g.a]:mk(g.a),[g.h]:mk(g.h)}; return B._lgp[g.id]; };

  // ---- on-ice officials (from the game feed, not tracking) ----
  B._off={};
  B.officials=g=>{ if(B._off[g.id])return B._off[g.id];
    const r=rng('off'+g.id);
    const FN=['Wes','Chris','Kelly','Garrett','Dan','Steve','Gord','Trevor','Brad','Jean','Frederick','Pierre'];
    const LN=['McCauley','Rooney','Sutherland','Pollock','Marchand','Devorski','Walsh','Hanson','Murray','Cormier','Nicholson','Schlenker'];
    const nm=()=>`${pick(r,FN)} ${pick(r,LN)}`;
    B._off[g.id]={refs:[nm(),nm()],linesmen:[nm(),nm()]}; return B._off[g.id]; };

  // ---- box-score depth: goalies, line score, team extras, scratches, enriched skaters ----
  B._box={};
  B.boxStats=g=>{ if(B._box[g.id])return B._box[g.id];
    const r=rng('box'+g.id); const det=B.detail(g); const final=g.st.startsWith('final'), ot=!!g.ot;
    const periods=['1st','2nd','3rd'];
    const gper=(team,per)=>det.goals.filter(x=>x.team===team&&x.per===per).length;
    const splitShots=tot=>{const base=Math.max(0,tot);let rem=base;const a=[];for(let i=0;i<3;i++){const take=i===2?rem:Math.round(base*(0.28+r()*0.12));const v=Math.min(rem,Math.max(0,take));a.push(v);rem-=v;}if(rem>0)a[2]+=rem;return a;};
    const line={periods,
      away:{goals:periods.map(p=>gper(g.a,p)),shots:splitShots(g.sa),total:g.as,sog:g.sa},
      home:{goals:periods.map(p=>gper(g.h,p)),shots:splitShots(g.sh),total:g.hs,sog:g.sh}};
    const mkG=(team,sa,ga,won)=>{const gi=(B.goalies||[]).find(x=>x.team===team)||{name:'Starter'};const saves=Math.max(0,sa-ga);
      const svp=sa?(saves/sa).toFixed(3).slice(1):'.000';
      return {name:gi.name,sa,saves,ga,svp,toi:final?(ot?'62:'+String(ri(r,10,59)).padStart(2,'0'):'60:00'):`${ri(r,20,55)}:${String(ri(r,0,59)).padStart(2,'0')}`,dec:!final?'—':won?'W':(ot?'OTL':'L')};};
    const goalies={[g.a]:mkG(g.a,g.sh,g.hs,final&&g.as>g.hs),[g.h]:mkG(g.h,g.sa,g.as,final&&g.hs>g.as)};
    const teamX=(ab,side)=>({pk:`${ri(r,1,4)}/${ri(r,3,5)}`,give:ri(r,4,14),take:ri(r,3,12),pp:det[side].team.pp,fo:det[side].team.fo});
    const team={[g.a]:teamX(g.a,'away'),[g.h]:teamX(g.h,'home')};
    const SFN=['Tyler','Mason','Cole','Luke','Owen','Riley','Carter','Liam','Noah','Evan','Reid','Dawson'];
    const SLN=['Brodie','Foegele','Carrick','Gaudette','Holloway','Bjorkstrand','Dvorak','Lafferty','Greer','Nieto','Joshua','Kampf'];
    const scr=ab=>{const n=ri(r,1,3);return Array.from({length:n},()=>`${pick(r,SFN)} ${pick(r,SLN)} (${pick(r,['C','LW','RW','D','D'])})`);};
    const scratches={[g.a]:scr(g.a),[g.h]:scr(g.h)};
    const enrich=side=>det[side].lines.map(p=>({...p,pm:ri(r,-2,3),hits:ri(r,0,6),blk:ri(r,0,4)}));
    const skaters={[g.a]:enrich('away'),[g.h]:enrich('home')};
    B._box[g.id]={goalies,line,team,scratches,skaters,periods}; return B._box[g.id]; };


  // ---- records.nhl.com (all-time records / awards) mock ----
  const HFN=['Wayne','Gordie','Mario','Bobby','Mark','Steve','Jaromir','Sidney','Alex','Nicklas','Ray','Patrick','Connor','Joe','Mike'];
  const HLN=['Gretzky','Howe','Lemieux','Orr','Messier','Yzerman','Jagr','Crosby','Ovechkin','Lidstrom','Bourque','Roy','McDavid','Sakic','Bossy'];
  B.recordSkaters=()=>{ if(B._rs)return B._rs; const r=rng('recsk');
    const cats=[['Goals',894],['Assists',1963],['Points',2857],['Games',1779],['Power-play goals',274],['Game-winning goals',135]];
    B._rs=cats.map(([cat,top])=>({cat,rows:Array.from({length:5},(_,i)=>({name:`${pick(r,HFN)} ${pick(r,HLN)}`,v:Math.round(top*(1-i*0.07)-ri(r,0,40))}))})); return B._rs; };
  const GFN=['Martin','Patrick','Roberto','Henrik','Marc-André','Dominik','Ed','Tony','Terry','Glenn','Curtis','Grant'];
  const GLN=['Brodeur','Roy','Luongo','Lundqvist','Fleury','Hasek','Belfour','Esposito','Sawchuk','Hall','Joseph','Fuhr'];
  B.recordGoalies=()=>{ if(B._rg)return B._rg; const r=rng('recg');
    const cats=[['Wins',691],['Shutouts',125],['Saves',28928],['Games',1266]];
    B._rg=cats.map(([cat,top])=>({cat,rows:Array.from({length:5},(_,i)=>({name:`${pick(r,GFN)} ${pick(r,GLN)}`,v:Math.round(top*(1-i*0.055)-ri(r,0,18))}))})); return B._rg; };
  // single-season records (skater + goalie), with holder + season
  const SEASONS=['1981-82','1985-86','1970-71','1988-89','1992-93','1995-96','2018-19','1944-45','1976-77','2022-23'];
  B.recordSeason=()=>{ if(B._rsn)return B._rsn; const r=rng('recsn');
    const recs=[['Goals, one season',92,'skater'],['Assists, one season',163,'skater'],['Points, one season',215,'skater'],['Points, defenseman',139,'skater'],['Goals, rookie',76,'skater'],['Wins, goalie',48,'goalie'],['Shutouts, one season',22,'goalie'],['Save %, qualified','.940','goalie']];
    B._rsn=recs.map(([label,v,kind])=>({label,v:typeof v==='number'?v:v,holder:`${pick(r,kind==='goalie'?GFN:HFN)} ${pick(r,kind==='goalie'?GLN:HLN)}`,season:pick(r,SEASONS),kind})); return B._rsn; };
  B.recordTrophiesList=()=>{ if(B._rt)return B._rt; const r=rng('rectr');
    const tro=[['Hart','MVP'],['Art Ross','Scoring'],['Rocket Richard','Goals'],['Norris','Top D'],['Vezina','Top G'],['Selke','Defensive F'],['Conn Smythe','Playoff MVP'],['Calder','Rookie']];
    B._rt=tro.map(([name,desc])=>({name,desc,winner:`${pick(r,HFN)} ${pick(r,HLN)}`,year:'2025',
      history:Array.from({length:5},(_,i)=>({yr:2025-i,name:`${pick(r,HFN)} ${pick(r,HLN)}`}))})); return B._rt; };
  // active players chasing career milestones — progress to next round number
  B.milestoneWatch=()=>{ if(B._mw)return B._mw; const r=rng('mw');
    const MS=[['points',1000],['goals',500],['points',500],['goals',300],['assists',600],['games',1000]];
    const pool=[...B.allPlayers].sort((a,b)=>b.p-a.p).slice(0,6);
    B._mw=pool.map((p,i)=>{const [stat,target]=MS[i%MS.length];const remaining=ri(r,4,72);const career=target-remaining;
      return {id:p.id,name:p.name,team:p.team,pos:p.pos,num:p.num,stat,target,career,remaining,pct:Math.round(career/target*100)};})
      .sort((a,b)=>a.remaining-b.remaining); return B._mw; };
  B.recordFranchiseList=()=>{ if(B._rf)return B._rf; const r=rng('recfr');
    B._rf=B.ABBR.map(ab=>({ab,wins:ri(r,1400,3200),cups:ri(r,0,13),seasons:ri(r,7,108)})).sort((a,b)=>b.wins-a.wins).slice(0,10); return B._rf; };
  // per-team championships & banners (deterministic)
  B._tt={};
  B.teamTitles=ab=>{ if(B._tt[ab])return B._tt[ab]; const r=rng('titles'+ab);
    const yrs=(n,lo)=>{const out=new Set();for(let i=0;i<n;i++)out.add(lo+ri(r,0,2025-lo));return[...out].sort((a,b)=>b-a);};
    const cupN=r()<.28?ri(r,1,6):(r()<.6?ri(r,0,2):0);
    const presN=r()<.4?ri(r,0,4):0;
    const confN=cupN+ri(r,0,3);
    const divN=ri(r,0,9);
    const titles={ab,stanleyCups:yrs(cupN,1955),presidents:yrs(presN,1986),conference:yrs(confN,1980),division:yrs(divN,1975),
      playoffApps:ri(r,18,52),lastCup:null};
    titles.lastCup=titles.stanleyCups[0]||null;
    B._tt[ab]=titles; return titles; };
  // single-club record book (career + single-season leaders for one franchise)
  B.teamRecords=ab=>{ const r=rng('trec'+ab); const rs=B.teamRoster(ab);
    const nm=()=>`${pick(r,HFN)} ${pick(r,HLN)}`;
    const mk=(cat,top,unit)=>({cat,unit,rows:Array.from({length:5},(_,i)=>({name:i<rs.length&&r()<.4?rs[i].name:nm(),v:Math.round(top*(1-i*0.08)-ri(r,0,top*0.04))}))});
    return {career:[mk('Goals',612),mk('Assists',901),mk('Points',1408),mk('Games',1310),mk('Wins (G)',389)],
      season:[mk('Goals, season',76),mk('Assists, season',102),mk('Points, season',152),mk('Wins, season',47)]}; };
  // streaks & feats (league records)
  B.recordStreaks=()=>{ if(B._rst)return B._rst; const r=rng('streaks');
    const nm=()=>`${pick(r,HFN)} ${pick(r,HLN)}`;
    const feats=[['Longest point streak',51,'games',nm()],['Longest goal streak',16,'games',nm()],['Consecutive games played',964,'games',nm()],['Longest team win streak',17,'games',pick(r,B.ABBR)+' (team)'],['Longest team unbeaten run',35,'games',pick(r,B.ABBR)+' (team)'],['Fastest hat trick',21,'seconds',nm()],['Most goals, one game',7,'goals',nm()],['Most points, one game',10,'points',nm()],['Longest shutout streak',6,'games',nm()],['Fastest two goals',4,'seconds',nm()]];
    B._rst=feats.map(([label,v,unit,holder])=>({label,v,unit,holder,year:1955+ri(r,0,70)})); return B._rst; };

  // ---- stats config (self-documenting report list) mock ----
  B.statsReports=()=>({
    skater:['summary','bios','faceoffpercentages','faceoffwins','goalsForAgainst','realtime','penalties','penaltykill','powerplay','puckPossessions','summaryshooting','percentages','scoringRates','scoringpergame','shootout','shottype','timeonice','toioffense','toidefense'],
    goalie:['summary','advanced','bios','daysrest','penaltyShots','savesByStrength','shootout','startedVsRelieved'],
    team:['summary','faceoffpercentages','faceoffwins','goalsForAgainst','realtime','penalties','penaltykill','penaltykilltime','powerplay','powerplaytime','summaryshooting','percentages','scoretrailfirst','shootout','shottype','goalgames','leadingtrailing','outshootoutshotby'],
  });

  // ---- playoff bracket ----
  // 16-team bracket from current standings: top-3 per division + 2 wild cards per conf.
  B.playoffBracket=()=>{ if(B._pb)return B._pb;
    const r=rng('bracket');
    const seedConf=cf=>{
      const cTeams=B.STANDINGS.filter(t=>t.conf===cf);
      const divs={};cTeams.forEach(t=>{(divs[t.div]=divs[t.div]||[]).push(t);});
      const leaders=[]; const pool=[];
      Object.values(divs).forEach(list=>{list.forEach((t,i)=>{if(i<3)leaders.push(t);else pool.push(t);});});
      leaders.sort((a,b)=>b.pts-a.pts);
      pool.sort((a,b)=>b.pts-a.pts); const wc=pool.slice(0,2);
      // matchups: top division winner vs WC2, 2nd vs 3rd within each division group (NHL bracket format)
      const d1=leaders[0],d2=leaders[1],d3=leaders[2];
      return {leaders,wc,seeds:[...leaders,...wc],
        r1:[ {hi:d1,lo:wc[1],label:'A1'},{hi:leaders[1],lo:leaders[2],label:'A2'},{hi:d2,lo:wc[0],label:'M1'},{hi:leaders[3]||wc[0],lo:leaders[4]||wc[1],label:'M2'} ]};
    };
    const mkSeries=(hi,lo)=>{const w=ri(r,0,4),l=ri(r,0,Math.min(3,4-(w===4?0:0)));const hw=r()<0.62;const a=hw?4:ri(r,1,3),b=hw?ri(r,0,3):4;return {hi,lo,hiW:a,loW:b,done:Math.max(a,b)===4};};
    const round=(pairs)=>pairs.map(p=>({...p,...mkSeries(p.hi,p.lo)}));
    const east=seedConf('East'),west=seedConf('West');
    const buildConf=conf=>{
      const r1=round(conf.r1);
      const adv=s=>s.hiW>=s.loW?s.hi:s.lo;
      const r2=round([{hi:adv(r1[0]),lo:adv(r1[1])},{hi:adv(r1[2]),lo:adv(r1[3])}]);
      const cf=round([{hi:adv(r2[0]),lo:adv(r2[1])}]);
      return {r1,r2,cf,champ:adv(cf[0])};
    };
    const e=buildConf(east),w=buildConf(west);
    const final=round([{hi:e.champ,lo:w.champ}]);
    const cup=final[0].hiW>=final[0].loW?final[0].hi:final[0].lo;
    B._pb={east:e,west:w,final:final[0],cup}; return B._pb;
  };
  // play-in bubble: teams 7-10 by conference
  B.playInRace=cf=>{const s=B.STANDINGS.filter(t=>t.conf===cf);return s.slice(6,10);};
  // ---- series detail (game log + team/player/edge stats for one matchup) ----
  B._sd={};
  B.seriesDetail=(hiAb,loAb,hiW,loW)=>{ const key=`${hiAb}-${loAb}-${hiW}-${loW}`;
    if(B._sd[key])return B._sd[key];
    const r=rng('series'+key); const total=Math.max(1,hiW+loW); const winnerHi=hiW>=loW;
    // game-by-game winner sequence (force the clinching game to the series winner)
    const wins=[...Array(hiW).fill('hi'),...Array(loW).fill('lo')];
    for(let i=wins.length-1;i>0;i--){const j=ri(r,0,i);[wins[i],wins[j]]=[wins[j],wins[i]];}
    const wTok=winnerHi?'hi':'lo'; const li=wins.lastIndexOf(wTok); if(li>=0){wins.splice(li,1);wins.push(wTok);}
    const games=wins.map((w,i)=>{const ws=ri(r,2,6);const ls=ri(r,0,Math.max(1,ws-1));const ot=ls===ws-1&&r()<0.28;
      return {game:i+1,winner:w,hs:w==='hi'?ws:ls,ls:w==='hi'?ls:ws,ot,home:i%2===0?'hi':'lo'};});
    const sumGoals=ab=>games.reduce((s,gm)=>s+(ab===hiAb?gm.hs:gm.ls),0);
    const otG=ab=>games.filter(g=>g.ot&&((g.winner==='hi')===(ab===hiAb))).length;
    const tstat=ab=>{const goals=sumGoals(ab);const ppg=Math.min(goals,ri(r,1,2+total));const shg=r()<0.45?ri(r,0,1):0;
      const shots=ri(r,total*26,total*36);
      return {ab,goals,ppg,ppo:ri(r,3*total,5*total),shg,esg:Math.max(0,goals-ppg-shg),
        shots,hd:ri(r,total*8,total*16),xg:+(goals*(0.82+r()*0.4)).toFixed(1),
        give:ri(r,total*4,total*10),take:ri(r,total*4,total*9),
        pk:+(74+r()*16).toFixed(1),fo:+(45+r()*12).toFixed(1),
        hits:ri(r,total*16,total*30),blk:ri(r,total*9,total*19),pim:ri(r,total*6,total*16)};};
    // regulation goals split across 3 periods (+ OT column)
    const periods=ab=>{const ot=otG(ab);let reg=sumGoals(ab)-ot;const p=[];for(let i=0;i<3;i++){const v=i===2?Math.max(0,reg):ri(r,0,Math.max(0,reg));p.push(v);reg-=v;}p.push(ot);return p;};
    const skaters=ab=>B.teamRoster(ab).slice(0,8).map(p=>{const g=ri(r,0,total),a=ri(r,0,total+1);const sh=ri(r,total*2,total*5);
      return {name:p.name,pos:p.pos,num:p.num,g,a,p:g+a,pm:ri(r,-4,6),s:sh,sp:sh?+(g/sh*100).toFixed(1):0,
        ppp:Math.min(g+a,ri(r,0,total)),pim:ri(r,0,total*3),toi:`${ri(r,15,23)}:${String(ri(r,0,59)).padStart(2,'0')}`};}).sort((a,b)=>b.p-a.p||b.g-a.g);
    const gtot=ab=>{const go=(B.goalies||[]).find(x=>x.team===ab);const wins=ab===hiAb?hiW:loW,losses=ab===hiAb?loW:hiW;
      const ga=ab===hiAb?games.reduce((s,g)=>s+g.ls,0):games.reduce((s,g)=>s+g.hs,0);
      const sf=ri(r,total*27,total*36),saves=Math.max(ga,sf)-ga;const tsf=ga+saves;const sp=saves/tsf;
      const hdsa=ri(r,total*7,total*12),hdsv=+(78+r()*14).toFixed(1);
      const mdsv=+(88+r()*8).toFixed(1),ldsv=+(96+r()*3.4).toFixed(1);
      return {name:go?go.name:'Starter',gp:total,w:wins,l:losses,ga,sf:tsf,saves,
        svp:sp.toFixed(3).replace(/^0/,''),svpN:+(sp*100).toFixed(1),gaa:+(ga/total).toFixed(2),so:ri(r,0,1),
        essv:+(sp*100+ (r()*1.2-0.2)).toFixed(1),hdsv,mdsv,ldsv,hdsa,
        gsax:+((r()*2.6-0.8)*Math.max(1,total/2)).toFixed(1),qs:Math.min(total,wins+ (r()<0.4?1:0)),
        sapg:+(tsf/total).toFixed(1)};};
    const edge=ab=>({topSkate:+(21.5+r()*3).toFixed(1),avgSkate:+(15.5+r()*2.5).toFixed(1),burst20:ri(r,total*6,total*16),burst22:ri(r,total*2,total*7),dist:+(total*(2.6+r()*0.7)).toFixed(1),
      topShot:+(88+r()*12).toFixed(1),avgShot:+(53+r()*8).toFixed(1),shot90:ri(r,total*3,total*9),shot100:ri(r,0,total*2),
      oz:+(46+r()*10).toFixed(1),toa:`${ri(r,8,12)}:${String(ri(r,0,59)).padStart(2,'0')}`,entries:ri(r,total*8,total*16)});
    const status=Math.max(hiW,loW)>=4?`${ct(winnerHi?hiAb:loAb)} ${nk(winnerHi?hiAb:loAb)} win ${Math.max(hiW,loW)}–${Math.min(hiW,loW)}`
      :hiW===loW?`Series tied ${hiW}–${loW}`:`${ct(hiW>loW?hiAb:loAb)} lead ${Math.max(hiW,loW)}–${Math.min(hiW,loW)}`;
    B._sd[key]={hiAb,loAb,hiW,loW,games,status,done:Math.max(hiW,loW)>=4,
      team:{[hiAb]:tstat(hiAb),[loAb]:tstat(loAb)},periods:{[hiAb]:periods(hiAb),[loAb]:periods(loAb)},
      skaters:{[hiAb]:skaters(hiAb),[loAb]:skaters(loAb)},
      goalie:{[hiAb]:gtot(hiAb),[loAb]:gtot(loAb)},edge:{[hiAb]:edge(hiAb),[loAb]:edge(loAb)}};
    return B._sd[key];};
  // ---- single-game box score (consistent with the series game's final score) ----
  B._gd={};
  B.gameDetail=(hiAb,loAb,hiW,loW,gameNo)=>{ const sKey=`${hiAb}-${loAb}-${hiW}-${loW}`,key=sKey+'#'+gameNo;
    if(B._gd[key])return B._gd[key];
    const sd=B.seriesDetail(hiAb,loAb,hiW,loW); const g=sd.games[gameNo-1]; const r=rng('gd'+key); const hw=g.winner==='hi';
    const top={[hiAb]:B.teamRoster(hiAb).slice(0,9),[loAb]:B.teamRoster(loAb).slice(0,9)};
    const lineFor=(total,isWinner)=>{const ot=g.ot&&isWinner?1:0;let reg=total-ot;const p=[];for(let i=0;i<3;i++){const v=i===2?Math.max(0,reg):ri(r,0,Math.max(0,reg));p.push(v);reg-=v;}p.push(ot);return p;};
    const line={[hiAb]:lineFor(g.hs,hw),[loAb]:lineFor(g.ls,!hw)};
    const shotsLine=()=>{const p=[ri(r,7,14),ri(r,7,14),ri(r,7,14)];if(g.ot)p.push(ri(r,2,6));return p;};
    const shots={[hiAb]:shotsLine(),[loAb]:shotsLine()};
    // scoring summary (chronological), consistent with line score
    const goals=[];
    [hiAb,loAb].forEach(ab=>{const opp=ab===hiAb?loAb:hiAb;line[ab].forEach((cnt,pi)=>{for(let k=0;k<cnt;k++){
      const rs=top[ab];const scorer=pick(r,rs);const a1=pick(r,rs.filter(x=>x.id!==scorer.id));const a2=r()<0.58?pick(r,rs.filter(x=>x.id!==scorer.id&&x.id!==a1.id)):null;
      const str=pi===3?'OT':(r()<0.22?'PP':(r()<0.05?'SH':'EV'));const max=pi===3?9:20;const mm=ri(r,0,max-1),ss=ri(r,0,59);
      goals.push({ab,opp,period:pi,t:mm*60+ss,time:`${mm}:${String(ss).padStart(2,'0')}`,scorer:scorer.name,a1:a1.name,a2:a2?a2.name:null,str});}});});
    goals.sort((a,b)=>a.period-b.period||a.t-b.t);
    let hs=0,ls=0;goals.forEach(go=>{if(go.ab===hiAb)hs++;else ls++;go.hs=hs;go.ls=ls;});
    const sumShots=ab=>shots[ab].reduce((s,v)=>s+v,0);
    const tstat=(ab,gf)=>({ab,goals:gf,shots:sumShots(ab),ppg:ri(r,0,2),ppo:ri(r,2,5),fo:+(44+r()*14).toFixed(1),hits:ri(r,13,30),blk:ri(r,6,18),pim:ri(r,2,14),give:ri(r,3,10),take:ri(r,3,9)});
    const skaters=ab=>top[ab].slice(0,8).map(p=>{const gl=goals.filter(x=>x.ab===ab&&x.scorer===p.name).length;const as=goals.filter(x=>x.ab===ab&&(x.a1===p.name||x.a2===p.name)).length;
      return {name:p.name,pos:p.pos,g:gl,a:as,p:gl+as,pm:ri(r,-2,3),s:ri(r,0,6),hits:ri(r,0,6),blk:ri(r,0,4),toi:`${ri(r,12,24)}:${String(ri(r,0,59)).padStart(2,'0')}`};}).sort((a,b)=>b.p-a.p||b.g-a.g);
    const sk={[hiAb]:skaters(hiAb),[loAb]:skaters(loAb)};
    const goalie=ab=>{const opp=ab===hiAb?loAb:hiAb;const sf=sumShots(opp);const ga=ab===hiAb?g.ls:g.hs;
      return {name:((B.goalies||[]).find(x=>x.team===ab)||{}).name||'Starter',sf,ga,saves:sf-ga,svp:sf?(((sf-ga)/sf).toFixed(3)).replace(/^0/,''):'—',dec:ab===(hw?hiAb:loAb)?'W':'L'};};
    // three stars
    const all=[...sk[hiAb].map(s=>({...s,ab:hiAb})),...sk[loAb].map(s=>({...s,ab:loAb}))].filter(s=>s.p>0).sort((a,b)=>b.p-a.p||b.g-a.g);
    const wAb=hw?hiAb:loAb, wg=goalie(wAb); const stars=[];
    if(all[0])stars.push({name:all[0].name,ab:all[0].ab,note:`${all[0].g}G ${all[0].a}A`});
    if(wg.ga<=2)stars.push({name:wg.name,ab:wAb,note:`${wg.saves} sv · ${wg.ga} GA`});
    else if(all[1])stars.push({name:all[1].name,ab:all[1].ab,note:`${all[1].g}G ${all[1].a}A`});
    if(all[1]&&stars.length<3&&!stars.find(s=>s.name===all[1].name))stars.push({name:all[1].name,ab:all[1].ab,note:`${all[1].g}G ${all[1].a}A`});
    else if(all[2]&&stars.length<3)stars.push({name:all[2].name,ab:all[2].ab,note:`${all[2].g}G ${all[2].a}A`});
    B._gd[key]={gameNo,ot:g.ot,hiAb,loAb,hs:g.hs,ls:g.ls,winner:g.winner,home:g.home,
      line,shots,goals,team:{[hiAb]:tstat(hiAb,g.hs),[loAb]:tstat(loAb,g.ls)},skaters:sk,
      goalie:{[hiAb]:goalie(hiAb),[loAb]:goalie(loAb)},stars};
    return B._gd[key];};

  // ---- NEWS WIRE: AI-summarized articles (of others' reporting) + styled X posts ----
  B.newsWire=()=>{ if(B._news)return B._news;
    const r=rng('newswire');
    const pl=(ab,i)=>{const rs=B.teamRoster(ab);return ((rs&&rs[i])||(rs&&rs[0])||{name:'a key skater'}).name;};
    const ln=s=>s.split(' ').slice(-1)[0];
    const go=ab=>((B.goalies||[]).find(g=>g.team===ab)||{name:'their starter'}).name;
    // original (fictional) outlets — the Lab summarizes their reporting
    const OUT={
      farpost:{name:'The Far Post',init:'F',domain:'thefarpost.io'},
      blue:{name:'Blue Line Report',init:'B',domain:'bluelinereport.com'},
      redline:{name:'North of the Red Line',init:'N',domain:'northredline.com'},
      crease:{name:'Crease & Cup',init:'C',domain:'creaseandcup.com'},
      openice:{name:'Open Ice',init:'O',domain:'openice.hockey'},
      back:{name:'Backcheck Daily',init:'B',domain:'backcheckdaily.com'},
      shelf:{name:'Top Shelf Times',init:'T',domain:'topshelftimes.com'},
      twoline:{name:'Two-Line Pass',init:'2',domain:'twolinepass.news'},
    };
    const A=[]; const add=o=>A.push({id:'a'+(A.length+1),...o});
    // a marquee recent final to anchor the recap card
    const recap=(B.slate(-1)||[]).concat(B.slate(0)||[]).find(g=>g.st&&g.st.startsWith('final'));
    add({topic:'Trade',lead:true,outlet:OUT.farpost,byline:'Marcus Devlin',ago:'18m',min:4,teams:['TOR','CHI'],
      headline:`Maple Leafs land ${ln(pl('CHI',0))} from Chicago in deadline blockbuster`,
      summary:`Toronto added top-six scoring on Sunday, sending a 2026 first-round pick, a prospect, and ${ln(pl('TOR',6))} to Chicago for winger ${pl('CHI',0)}. The 27-year-old gives the Leafs the right-shot finisher they have chased since camp and slots onto the top power-play unit immediately. Chicago retains 25% of salary, keeping Toronto a sliver under the cap for the stretch run.`});
    add({topic:'Injury',outlet:OUT.crease,byline:'Priya Anand',ago:'42m',min:3,teams:['EDM'],
      headline:`Oilers' ${ln(pl('EDM',0))} week-to-week with lower-body injury`,
      summary:`Edmonton will be without leading scorer ${pl('EDM',0)} for at least two weeks after he blocked a shot in the third period Saturday. The club called the injury day-to-day publicly but internally expects a multi-week absence, per the report. Expect ${ln(pl('EDM',2))} to move up the middle while the top line is reshuffled.`});
    add({topic:'Signing',outlet:OUT.blue,byline:'Tom Walsh',ago:'1h',min:3,teams:['FLA'],
      headline:`Panthers ink ${ln(pl('FLA',1))} to seven-year extension`,
      summary:`Florida locked up cornerstone defenseman ${pl('FLA',1)} on a seven-year deal reported at roughly $8.2M per season, beginning next year. The contract carries modest signing-bonus structure and a full no-move clause for the first four years. It is the franchise's largest blue-line commitment to date.`});
    if(recap){const w=recap.as>recap.hs?recap.a:recap.h,l=w===recap.a?recap.h:recap.a;
      add({topic:'Recap',outlet:OUT.back,byline:'Staff',ago:'3h',min:2,teams:[recap.a,recap.h],gameId:recap.id,
        headline:`${B.city(w)} ${B.nick(w)} ${recap.as>recap.hs===(w===recap.a)?'hold off':'edge'} ${B.city(l)} ${Math.max(recap.as,recap.hs)}–${Math.min(recap.as,recap.hs)}`,
        summary:`${B.gameRecap(recap)} Tap through for the full box score, scoring summary, and the shot map.`});}
    add({topic:'Rumor',outlet:OUT.openice,byline:'D. Carrington',ago:'4h',min:3,teams:['VAN','NJD'],
      headline:`Canucks gauging the market on veteran ${ln(pl('VAN',2))}`,
      summary:`Vancouver has quietly let teams know it would listen on veteran ${pl('VAN',2)}, with New Jersey and two unnamed contenders said to have checked in. No deal is imminent and the asking price — a roster defenseman plus a pick — is considered steep. The Canucks are not actively shopping the player but are open to being overwhelmed.`});
    add({topic:'Analysis',outlet:OUT.twoline,byline:'Elena Ruiz',ago:'5h',min:6,teams:['COL'],
      headline:`The skating data behind Colorado's even-strength surge`,
      summary:`Colorado is generating the league's highest rate of controlled zone entries, and the tracking data explains why: three of their top four forwards rank in the 90th percentile for top skating speed. The piece argues their forecheck speed, not finishing luck, is driving the run. It pairs neatly with the Edge metrics on the Lab's Hockey IQ tab.`});
    add({topic:'Goalie',outlet:OUT.shelf,byline:'Greg Halvorsen',ago:'7h',min:3,teams:['NYR'],
      headline:`${ln(go('NYR'))} has quietly been the league's best goalie for a month`,
      summary:`Over his last 12 starts, ${go('NYR')} owns a save percentage north of .940 and has stolen at least three games outright, per the report. The analysis credits a calmer depth in his crease and a Rangers structure that funnels shots to the perimeter. It makes a Vezina case that has gone underreported nationally.`});
    add({topic:'Coaching',outlet:OUT.redline,byline:'Sam Okafor',ago:'9h',min:4,teams:['CGY'],
      headline:`Pressure mounting on the Flames' bench amid skid`,
      summary:`Calgary's front office has given public backing to its head coach, but the report describes a room searching for answers after a prolonged slide. Player usage and a stagnant power play are the focal points of internal review. Management is said to prefer continuity through the deadline before any decision.`});
    add({topic:'Prospect',outlet:OUT.farpost,byline:'Marcus Devlin',ago:'11h',min:3,teams:['SJS'],
      headline:`Sharks recall blue-chip rookie ${ln(pl('SJS',3))} from the AHL`,
      summary:`San Jose has summoned 19-year-old ${pl('SJS',3)} after a dominant stretch in the minors, and the plan is to play him in the top nine right away. The club will manage his games to preserve a slide-rule on his entry-level deal. Scouts quoted in the piece call his hands "NHL-ready today."`});
    add({topic:'Power Rankings',outlet:OUT.openice,byline:'Open Ice Desk',ago:'14h',min:5,teams:['DAL','WPG','CAR'],
      headline:`Power Rankings: a new team takes the top spot`,
      summary:`This week's poll moves Dallas to No. 1 on the strength of a seven-game point streak and the league's stingiest defense. Winnipeg and Carolina round out the top three, while two playoff hopefuls tumble after rough weeks. The full ballot and movement notes are in the original.`});
    add({topic:'Discipline',outlet:OUT.blue,byline:'Tom Walsh',ago:'17h',min:2,teams:['PHI'],
      headline:`Flyers forward ${ln(pl('PHI',4))} fined for slashing`,
      summary:`The Department of Player Safety fined ${pl('PHI',4)} the maximum allowable amount for a slash in Tuesday's game, stopping short of a suspension. It is his first supplementary-discipline incident of the season. Philadelphia had no further comment.`});
    const mw=(B.milestoneWatch&&B.milestoneWatch()[0])||null;
    if(mw)add({topic:'Milestone',outlet:OUT.crease,byline:'Priya Anand',ago:'1d',min:3,teams:[mw.team],playerId:mw.id,
      headline:`${ln(mw.name)} closing in on ${mw.target} career ${mw.stat}`,
      summary:`${mw.name} sits just ${mw.remaining} ${mw.stat} shy of the ${mw.target} milestone and could reach it on the current homestand. The report walks through the pace, the likely night, and where it ranks among active players. Follow the live milestone tracker on the Lab's Records page.`});
    add({topic:'Cap',outlet:OUT.twoline,byline:'Elena Ruiz',ago:'1d',min:4,teams:['VGK'],
      headline:`How Vegas is threading another deadline cap crunch`,
      summary:`The Golden Knights are once again pressed against the ceiling, and the breakdown explains the LTIR mechanics they will lean on to add at the deadline. It projects the exact space they can manufacture and the contracts most likely to move. As ever, the margins are razor-thin.`});

    // ---- styled X posts (original, fictional accounts — not real handles) ----
    const TW=[]; const tw=o=>TW.push({id:'x'+(TW.length+1),...o});
    tw({name:'Rinkside Report',handle:'RinksideRpt',verified:true,role:'Insider',team:'TOR',ago:'15m',
      body:`BREAKING: The ${B.nick('TOR')} have acquired ${pl('CHI',0)} from ${B.city('CHI')}. Package is a 2026 1st, a prospect, and ${ln(pl('TOR',6))}. ${B.city('CHI')} retains 25%. Physicals underway — announcement expected within the hour.`,
      replies:512,reposts:2400,likes:11200,teams:['TOR','CHI']});
    tw({name:'Cap Space Watch',handle:'CapSpaceWatch',verified:true,role:'Cap analyst',team:'CHI',ago:'9m',
      body:`With 25% retained, ${pl('CHI',0)}'s cap hit drops to a tidy number for ${B.city('TOR')}. ${B.city('TOR')} now sits ~$310K under the ceiling with the deadline still days away. Tight, but workable.`,
      replies:88,reposts:340,likes:2100,teams:['TOR','CHI']});
    tw({name:pl('CHI',0),handle:ln(pl('CHI',0)).toLowerCase()+'_91',verified:true,role:'Player',team:'CHI',ago:'5m',
      body:`Thank you ${B.city('CHI')} — this city, this room, the fans. You gave me everything. Forever grateful. On to the next chapter. 🙏`,
      replies:1900,reposts:1500,likes:24000,teams:['CHI','TOR']});
    tw({name:'Open Ice',handle:'OpenIceHockey',verified:true,role:'Fan media',team:'COL',ago:'1h',
      body:`Colorado leads the NHL in controlled zone entries per 60 this season. It is not close. The forecheck speed is breaking teams before they can set up. Full skating-data breakdown ⬇️`,
      replies:64,reposts:430,likes:3300,teams:['COL'],
      quote:{name:'Two-Line Pass',handle:'TwoLinePass',body:`New: the skating data behind Colorado's even-strength surge. Three of their top four forwards are 90th-percentile speed.`}});
    tw({name:'Frozen Faceoff',handle:'FrozenFaceoff',verified:false,role:'Beat writer',team:'EDM',ago:'46m',
      body:`Coach confirms ${ln(pl('EDM',0))} is "day-to-day," but he was in a walking boot leaving the rink. Read between the lines. ${ln(pl('EDM',2))} likely bumps up to 1C tonight.`,
      replies:210,reposts:520,likes:4800,teams:['EDM']});
    tw({name:'Crease & Cup',handle:'CreaseAndCup',verified:true,role:'Fan media',team:'NYR',ago:'2h',
      body:`${ln(go('NYR'))} since the calendar flipped: .941 SV%, 3 shutouts, a .500 team somehow in a playoff spot because of him. Where is the Vezina noise?`,
      replies:140,reposts:610,likes:5200,teams:['NYR']});
    tw({name:'The Fourth Line',handle:'TheFourthLine',verified:false,role:'Analytics',team:'DAL',ago:'3h',
      body:`Power Rankings dropped. Dallas to No. 1 — and the underlying numbers back it up: best xGA/60 in the league over the last month. This is not a fluke run.`,
      replies:73,reposts:280,likes:2600,teams:['DAL','WPG','CAR']});
    tw({name:'Backcheck Daily',handle:'BackcheckDaily',verified:true,role:'Fan media',team:'SJS',ago:'5h',
      body:`It is happening: ${pl('SJS',3)} gets the call. 19 years old, top-nine minutes from night one. The rebuild just got a lot more fun to watch in ${B.city('SJS')}.`,
      replies:96,reposts:340,likes:3900,teams:['SJS']});

    // ---- around-the-league headline ticker ----
    const TICK=[
      {ab:'TOR',text:`Leafs acquire ${ln(pl('CHI',0))} in deadline blockbuster`},
      {ab:'EDM',text:`${ln(pl('EDM',0))} week-to-week, lower body`},
      {ab:'FLA',text:`Panthers extend ${ln(pl('FLA',1))} — 7 years`},
      {ab:'NYR',text:`${ln(go('NYR'))} riding a .940 SV% over 12 starts`},
      {ab:'SJS',text:`Sharks recall rookie ${ln(pl('SJS',3))}`},
      {ab:'CGY',text:`Pressure building on the Flames' bench`},
      {ab:'DAL',text:`Stars climb to No. 1 in this week's rankings`},
      {ab:'PHI',text:`${ln(pl('PHI',4))} fined for slashing`},
      {ab:'VGK',text:`Vegas working the LTIR math again`},
      {ab:'VAN',text:`Canucks listening on ${ln(pl('VAN',2))}`},
    ];
    B._news={articles:A,tweets:TW,ticker:TICK,topics:['All','Trade','Rumor','Injury','Signing','Recap','Analysis']};
    return B._news; };
})();
