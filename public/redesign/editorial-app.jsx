/* The Hockey Lab — Editorial theme · shell, Scores, GameDetail, routing */
const { useState, useEffect, useMemo, useRef } = React;
const BC=window.BC;
const {T,MONO,SERIF,card,ML}=window.E_TOK;
const {Eyebrow,Badge,PlayerAvatar}=window.E_UI;
const P=window.E_PAGES;
const {col,nick,city,slate,dateLabel,detail}=BC;

// ---- schedule calendar (week / month planner under the scores) ----
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MO=['January','February','March','April','May','June','July','August','September','October','November','December'];
function SchedCal({offset,setOffset,favs,view}){
  const [team,setTeam]=useState('all');
  const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const teamsAZ=useMemo(()=>[...BC.ABBR].sort((a,b)=>city(a).localeCompare(city(b))),[]);
  const dOf=o=>{const d=new Date(today);d.setDate(d.getDate()+o);return d;};
  const offOf=d=>Math.round((d-today)/86400000);
  const favG=gms=>gms.filter(g=>favs.includes(g.a)||favs.includes(g.h));
  const base=dOf(offset),y=base.getFullYear(),m=base.getMonth();
  if(view==='week'){const wk=offset-dOf(offset).getDay();
    const WeekCell=({o})=>{const d=dOf(o),gms=slate(o),fg=favG(gms),cur=o===offset,isT=o===0;
      return(<button onClick={()=>setOffset(o)} className="er" style={{textAlign:'left',cursor:'pointer',background:cur?T.invBg:T.paper,color:cur?T.invFg:T.ink,border:`1px solid ${cur?T.invBg:T.line}`,borderRadius:11,padding:'10px 11px',height:84,display:'flex',flexDirection:'column',gap:5,overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><span style={{fontFamily:MONO,fontSize:10,letterSpacing:'.05em',textTransform:'uppercase',color:cur?T.invFg:T.faint,opacity:cur?.7:1}}>{WD[d.getDay()]}</span><span style={{fontWeight:700,fontSize:16}}>{d.getDate()}</span></div>
        <span style={{fontFamily:MONO,fontSize:11,color:cur?T.invFg:T.mut,opacity:cur?.85:1,marginTop:'auto'}}>{gms.length?`${gms.length} game${gms.length>1?'s':''}`:'no games'}{isT?' · today':''}</span>
        <div style={{display:'flex',gap:4,height:7}}>{fg.slice(0,5).map((g,i)=>{const ab=favs.includes(g.a)?g.a:g.h;return <span key={i} style={{width:7,height:7,borderRadius:99,background:cur?T.invFg:col(ab)}}/>;})}</div>
      </button>);};
    return(<div style={{...card,padding:'16px 18px',marginBottom:18}}>
      <div style={{...ML,marginBottom:12}}>Schedule · this week</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>{Array.from({length:7},(_,i)=><WeekCell key={i} o={wk+i}/>)}</div>
    </div>);}
  // month — overview (counts) or a chosen team's schedule (opponent + home/away per day)
  const lead=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let dd=1;dd<=days;dd++)cells.push(offOf(new Date(y,m,dd)));
  const goMonth=delta=>setOffset(offOf(new Date(y,m+delta,1)));
  const navBtn={fontFamily:'inherit',fontSize:14,fontWeight:600,width:30,height:30,borderRadius:8,background:T.paper,border:`1px solid ${T.line2}`,color:T.mut,cursor:'pointer'};
  const selSty={fontFamily:MONO,fontSize:11.5,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'6px 8px',color:T.mut,cursor:'pointer',maxWidth:170};
  const monthGames=team==='all'?0:cells.filter(o=>o!==null).reduce((n,o)=>n+(slate(o).some(g=>g.a===team||g.h===team)?1:0),0);
  const MonthCell=({o})=>{const d=dOf(o),gms=slate(o),cur=o===offset,isT=o===0;
    if(team!=='all'){const g=gms.find(x=>x.a===team||x.h===team);const home=g&&g.h===team;const opp=g?(home?g.a:g.h):null;
      const final=g&&g.st.startsWith('final');const won=final&&((home&&g.hs>g.as)||(!home&&g.as>g.hs));
      return(<button onClick={()=>setOffset(o)} className="er" style={{textAlign:'left',cursor:'pointer',background:cur?T.invBg:(g?`${col(team)}12`:T.paper),color:cur?T.invFg:T.ink,border:`1px solid ${cur?T.invBg:(g?col(team)+'55':T.line)}`,borderRadius:8,padding:'6px 7px',height:60,display:'flex',flexDirection:'column',justifyContent:'space-between',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontWeight:700,fontSize:12,color:cur?T.invFg:(isT?T.red:T.ink)}}>{d.getDate()}</span>{g&&<span style={{fontFamily:MONO,fontSize:8.5,color:cur?T.invFg:T.faint,opacity:cur?.7:1}}>{home?'VS':'@'}</span>}</div>
        {g?<div style={{display:'flex',alignItems:'center',gap:4}}><Badge ab={opp} size={15}/><span style={{fontFamily:MONO,fontSize:10.5,fontWeight:600,color:cur?T.invFg:T.ink}}>{opp}</span>{final&&<span style={{fontFamily:MONO,fontSize:9,fontWeight:700,color:cur?T.invFg:(won?'#1a8a4f':T.faint)}}>{won?'W':'L'}</span>}</div>:<span style={{color:T.line2,fontSize:11}}>·</span>}
      </button>);}
    const hasFav=favG(gms).length>0;
    return(<button onClick={()=>setOffset(o)} className="er" style={{textAlign:'left',cursor:'pointer',background:cur?T.invBg:T.paper,color:cur?T.invFg:T.ink,border:`1px solid ${cur?T.invBg:T.line}`,borderRadius:8,padding:'7px 8px',height:52,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontWeight:700,fontSize:12.5,color:cur?T.invFg:(isT?T.red:T.ink)}}>{d.getDate()}</span>{hasFav&&<span style={{width:6,height:6,borderRadius:99,background:cur?T.invFg:T.red}}/>}</div>
      <span style={{fontFamily:MONO,fontSize:10,color:cur?T.invFg:T.faint,opacity:cur?.7:1}}>{gms.length?`${gms.length}`:''}</span>
    </button>);};
  return(<div style={{...card,padding:'16px 18px',marginTop:18}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:12,flexWrap:'wrap'}}>
      <span style={ML}>Schedule · {MO[m]} {y}</span>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <select value={team} onChange={e=>setTeam(e.target.value)} style={selSty}><option value="all">All teams</option>{teamsAZ.map(a=><option key={a} value={a}>{city(a)} {nick(a)}</option>)}</select>
        <div style={{display:'flex',gap:6}}><button onClick={()=>goMonth(-1)} style={navBtn} aria-label="Previous month">‹</button><button onClick={()=>goMonth(1)} style={navBtn} aria-label="Next month">›</button></div>
      </div>
    </div>
    {team!=='all'&&<div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12,padding:'9px 12px',borderRadius:10,background:`${col(team)}10`,border:`1px solid ${col(team)}33`}}><Badge ab={team} size={22}/><span style={{fontWeight:700,fontSize:14}}>{city(team)} {nick(team)}</span><span style={{fontFamily:MONO,fontSize:11.5,color:T.mut,marginLeft:'auto'}}>{monthGames} games in {MO[m]}</span></div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>{WD.map(w=><div key={w} style={{...ML,fontSize:9,textAlign:'center',paddingBottom:2}}>{w[0]}</div>)}{cells.map((o,i)=>o===null?<div key={i}/>:<MonthCell key={i} o={o}/>)}</div>
    <div style={{fontFamily:MONO,fontSize:10.5,color:T.faint,marginTop:12}}>{team==='all'?<span style={{display:'inline-flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>number = games that day · dot = a followed team plays · tap a day to view it</span>:'VS = home · @ = away · W/L shows final results · tap a day to view its slate'}</div>
  </div>);
}

const loadF=()=>{try{return JSON.parse(localStorage.getItem('e_favs')||'[]');}catch{return[];}};
const saveF=f=>localStorage.setItem('e_favs',JSON.stringify(f));

function Spark({data,color,w=54,h=16}){if(!data||!data.length)return null;const mx=Math.max(...data),mn=Math.min(...data);const p=data.map((v,i)=>`${(i/(data.length-1)*w).toFixed(1)},${(h-(v-mn)/Math.max(1,mx-mn)*h).toFixed(1)}`).join(' ');return <svg width={w} height={h}><polyline points={p} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;}

/* odometer score */
function Digit({v,size}){return(<span style={{display:'inline-block',height:size,overflow:'hidden',width:size*0.6,verticalAlign:'top'}}>
  <span className="ed-col" style={{display:'flex',flexDirection:'column',transform:`translateY(-${v*size}px)`}}>{[0,1,2,3,4,5,6,7,8,9].map(d=><span key={d} style={{height:size,lineHeight:`${size}px`,fontSize:size*0.92,fontWeight:600,fontVariantNumeric:'tabular-nums',textAlign:'center'}}>{d}</span>)}</span></span>);}
function Roll({n,size}){return <span style={{display:'inline-flex'}}>{String(n).split('').map((d,i)=><Digit key={i} v={+d} size={size}/>)}</span>;}

function useLive(g){
  const [s,setS]=useState({as:g.as,hs:g.hs,clk:g.clk});
  useEffect(()=>{setS({as:g.as,hs:g.hs,clk:g.clk});if(g.st!=='live')return;
    const t=setInterval(()=>setS(p=>{let[m,sec]=(p.clk||'20:00').split(':').map(Number);sec-=8;if(sec<0){sec+=60;m=Math.max(0,m-1);}const clk=`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;if(Math.random()<.22){const side=Math.random()<.5?'as':'hs';return{...p,[side]:p[side]+1,clk};}return{...p,clk};}),2800);
    return()=>clearInterval(t);},[g.id]);
  return s;
}
function useLiveEdge(g){
  const base=useMemo(()=>window.BC.liveEdge?BC.liveEdge(g):null,[g.id]);
  const [e,setE]=useState(base);
  useEffect(()=>{ setE(base); if(!base||g.st!=='live')return;
    const cl=(v,lo,hi)=>Math.max(lo,Math.min(hi,v)), R=()=>Math.random();
    const t=setInterval(()=>setE(p=>{ if(!p)return p;
      const att={a:p.att.a+(R()<.5?1:0),h:p.att.h+(R()<.5?1:0)};
      const xg={a:+(p.xg.a+(att.a>p.att.a?R()*0.14:0)).toFixed(2),h:+(p.xg.h+(att.h>p.att.h?R()*0.14:0)).toFixed(2)};
      const momentum=+cl(p.momentum+(R()*2-1)*0.16,-1,1).toFixed(2);
      const dist={a:+(p.dist.a+R()*0.35).toFixed(1),h:+(p.dist.h+R()*0.35).toFixed(1)};
      const oza=Math.round(cl(p.oz.a+(R()*2-1)*2,38,62)); const oz={a:oza,h:100-oza};
      const hits={a:p.hits.a+(R()<.28?1:0),h:p.hits.h+(R()<.28?1:0)};
      const hardest={...p.hardest}; if(R()<.22){const k=R()<.5?'a':'h';hardest[k]=Math.max(p.hardest[k],+cl(p.hardest[k]+(R()*4-1),80,106).toFixed(1));}
      const topspd={...p.topspd}; if(R()<.18){const k=R()<.5?'a':'h';topspd[k]=Math.max(p.topspd[k],+cl(p.topspd[k]+R()*0.6,20,25.9).toFixed(1));}
      return {...p,att,momentum,dist,oz,hits,hardest,topspd,xg};
    }),2600);
    return()=>clearInterval(t);},[g.id]);
  return e;
}
function useLivePlayers(g){
  const base=useMemo(()=>window.BC.liveGamePlayers?BC.liveGamePlayers(g):null,[g.id]);
  const [d,setD]=useState(base);
  useEffect(()=>{ setD(base); if(!base||g.st!=='live')return;
    const R=()=>Math.random();
    const step=arr=>{ let a=arr.map(p=>{
        if(p.isG){ let q={...p}; if(R()<0.16){ q.sa=p.sa+1; if(R()<0.86)q.saves=p.saves+1; else q.ga=p.ga+1; if(R()<0.4){q.hdSa=p.hdSa+1; if(R()<0.8)q.hdSaves=p.hdSaves+1;} } if(R()<0.08)q.freezes=p.freezes+1; q.toiSec=p.toiSec+3; return q; }
        return p.onIce?{...p,toiSec:p.toiSec+3,dist:+(p.dist+0.012+R()*0.01).toFixed(2),shiftSec:p.shiftSec+3}:p; });
      if(R()<0.5){ const sk=a.filter(p=>!p.isG),onIce=sk.filter(p=>p.onIce),bench=sk.filter(p=>!p.onIce); const out=onIce.filter(p=>p.shiftSec>40)[0];
        if(out&&bench.length){ const cand=bench.filter(p=>(p.pos==='D')===(out.pos==='D')); const pool=cand.length?cand:bench; const inn=pool[Math.floor(R()*pool.length)];
          a=a.map(p=>p.id===out.id?{...p,onIce:false,shiftSec:0}:p.id===inn.id?{...p,onIce:true,shiftSec:0,shifts:p.shifts+1}:p); } }
      return a.map(p=>{ if(p.isG)return p; let q=p; if(R()<0.06)q={...q,topSpd:Math.max(q.topSpd,+(q.topSpd+R()*0.5).toFixed(1))}; if(R()<0.05)q={...q,hardest:Math.max(q.hardest,+(q.hardest+R()*3).toFixed(1)),att:q.att+1}; if(R()<0.03)q={...q,sog:q.sog+1}; return q; });
    };
    const t=setInterval(()=>setD(prev=>prev?{...prev,[g.a]:step(prev[g.a]),[g.h]:step(prev[g.h])}:prev),2600);
    return()=>clearInterval(t);},[g.id]);
  return d;
}
function useLiveSituation(g){
  const [st,setSt]=useState({type:'EV',team:null,strength:'5-on-5',sec:0});
  useEffect(()=>{ setSt({type:'EV',team:null,strength:'5-on-5',sec:0}); if(g.st!=='live')return;
    const iv=setInterval(()=>setSt(p=>{
      if(p.type==='PP'){ const sec=p.sec-1; return sec<=0?{type:'EV',team:null,strength:'5-on-5',sec:0}:{...p,sec}; }
      if(Math.random()<0.06){ const team=Math.random()<0.5?g.a:g.h; const two=Math.random()<0.15; return {type:'PP',team,strength:two?'5-on-3':'5-on-4',sec:two?90:120,max:two?90:120}; }
      return p;
    }),1000);
    return ()=>clearInterval(iv);},[g.id,g.st]);
  return st;
}
function ProvTag({kind}){
  const map={live:['live feed',T.red,true],proj:['projected',T.faint,false],day:['official next-day',T.faint,false]};
  const [txt,clr,dot]=map[kind]||map.proj;
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:MONO,fontSize:9,letterSpacing:'.08em',textTransform:'uppercase',color:clr,border:`1px solid ${T.line2}`,borderRadius:5,padding:'2px 6px',whiteSpace:'nowrap'}}>{dot&&<span className="ed-pulse" style={{width:5,height:5,borderRadius:99,background:clr,display:'inline-block'}}/>}{txt}</span>;
}
function Star({on,onClick}){return <button onClick={e=>{e.stopPropagation();onClick();}} style={{background:'none',border:'none',cursor:'pointer',padding:3,lineHeight:0,color:on?T.red:T.faint}} aria-label="follow"><svg width="14" height="14" viewBox="0 0 24 24" fill={on?T.red:'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9"/></svg></button>;}

function GameCard({g,favs,toggleFav,onOpen}){
  const s=useLive(g);
  const le=useLiveEdge(g);
  const [exp,setExp]=useState(false);
  const x=useMemo(()=>g.st!=='pre'?BC.gameExtras(g):null,[g.id]);
  const live=g.st==='live',final=g.st.startsWith('final');
  const aw=final&&s.as>s.hs, hw=final&&s.hs>s.as;
  const clkPct=live?(()=>{const[m,sec]=(s.clk||'20:00').split(':').map(Number);return Math.max(2,Math.min(100,(1-(m*60+sec)/1200)*100));})():0;
  const Row=({ab,sc,won})=>(<div style={{display:'flex',alignItems:'center',gap:11,padding:'7px 0'}}>
    <span style={{width:3,height:26,borderRadius:2,background:col(ab)}}/><Badge ab={ab} size={28}/>
    <div style={{flex:1,minWidth:0}}><div style={{fontWeight:won?700:600,fontSize:14,color:T.ink}}>{city(ab)}</div><div style={{fontSize:11.5,color:T.mut}}>{nick(ab)}</div></div>
    {g.st!=='pre'?<Roll n={sc} size={24}/>:<span style={{color:T.faint,fontSize:18}}>–</span>}<Star on={favs.includes(ab)} onClick={()=>toggleFav(ab)}/></div>);
  return(<div className="ec" style={{...card,overflow:'hidden'}}>
    {live&&<div style={{height:2,background:T.line}}><div style={{height:'100%',width:`${clkPct}%`,background:T.red,transition:'width .6s linear'}}/></div>}
    <div onClick={()=>onOpen(g)} style={{padding:'13px 16px 4px',cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
        <span style={{fontFamily:MONO,fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',color:live?T.red:final?T.faint:'#1a8a4f',display:'inline-flex',alignItems:'center',gap:6}}>{live&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>}{live?`Live · ${g.per} ${s.clk}`:final?(g.ot?'Final/OT':'Final'):g.start}</span>
      </div>
      <Row ab={g.a} sc={s.as} won={aw}/><Row ab={g.h} sc={s.hs} won={hw}/>
    </div>
    {live&&le&&(()=>{const tot=le.att.a+le.att.h||1,ap=Math.round(le.att.a/tot*100);return(
      <div style={{padding:'0 16px 10px'}} title="Live shot-attempt share">
        <div style={{display:'flex',height:5,borderRadius:3,overflow:'hidden',background:T.bg}}>
          <div style={{width:`${ap}%`,background:col(g.a)}}/><div style={{flex:1,background:col(g.h)}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontFamily:MONO,fontSize:9.5,letterSpacing:'.04em',color:T.faint}}><span>{g.a} {le.att.a} ATT</span><span>{ap}% / {100-ap}%</span><span>{le.att.h} ATT {g.h}</span></div>
      </div>)})()}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px 12px'}}>
      <span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{g.st!=='pre'?`${g.sa}–${g.sh} SOG`:'puck drop soon'}</span>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        {g.st!=='pre'&&<Spark data={g.mom} color={s.as>=s.hs?col(g.a):col(g.h)}/>}
        {x&&<button onClick={()=>setExp(e=>!e)} style={{fontFamily:MONO,fontSize:10,letterSpacing:'.05em',textTransform:'uppercase',background:'none',border:'none',color:T.faint,cursor:'pointer'}}>{exp?'hide ▲':'details ▼'}</button>}
      </div>
    </div>
    {exp&&x&&<div style={{borderTop:`1px solid ${T.line}`,background:T.bg,padding:'12px 16px',fontFamily:MONO,fontSize:11.5,color:T.mut,lineHeight:1.7}}>
      {g.st!=='pre'&&<div style={{marginBottom:6}}>line: <span style={{color:T.ink}}>{g.a} {x.line.away.join('-')} · {g.h} {x.line.home.join('-')}</span></div>}
      <div>leaders: <span style={{color:T.ink}}>{x.leaders.away.name} ({g.a}, {x.leaders.away.p}P) · {x.leaders.home.name} ({g.h}, {x.leaders.home.p}P)</span></div>
      <div>goalies: <span style={{color:T.ink}}>{x.goalies.away?x.goalies.away.name:'TBD'} · {x.goalies.home?x.goalies.home.name:'TBD'}</span></div>
      {le&&g.st!=='pre'&&<div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${T.line}`}}>edge: <span style={{color:T.ink}}>⚡ {Math.max(le.hardest.a,le.hardest.h)} mph hardest · {Math.max(le.topspd.a,le.topspd.h)} mph top skate · {(le.dist.a+le.dist.h).toFixed(1)} mi skated</span></div>}
      {x.tv.length>0&&<div>tv: <span style={{color:T.ink}}>{x.tv.join(' · ')}</span></div>}
      <div>venue: <span style={{color:T.ink}}>{x.venue}</span></div>
      <button onClick={()=>onOpen(g)} className="el" style={{marginTop:8,background:'none',border:`1px solid ${T.line2}`,borderRadius:7,padding:'5px 10px',fontFamily:MONO,fontSize:10.5,color:T.ink,cursor:'pointer'}}>open game center →</button>
    </div>}
  </div>);
}

/* game detail */
function GameDetail({g,onBack,onTeam}){
  const dMock=useMemo(()=>detail(g),[g.id]);
  // live overlay: real scoring summary, three stars, team stats + box score / lineups
  const gl=window.E_useLive(null,()=>g.st!=='pre'&&window.NHL&&window.NHL.gameLive?window.NHL.gameLive(g.id):null,[g.id]);
  const d=gl?{...dMock,
    goals:(gl.goals&&gl.goals.length)?gl.goals:dMock.goals,
    stars:(gl.stars&&gl.stars.length)?gl.stars:dMock.stars,
    away:{...dMock.away,team:{...dMock.away.team,...(gl.teamA||{})}},
    home:{...dMock.home,team:{...dMock.home.team,...(gl.teamH||{})}}}:dMock;
  const series=useMemo(()=>BC.seasonSeries(g),[g.id]);
  const pbpMock=useMemo(()=>BC.playByPlay(g),[g.id]);
  const pbp=window.E_useLive(pbpMock,()=>g.st!=='pre'&&window.NHL&&window.NHL.gamePbp?window.NHL.gamePbp(g.id):null,[g.id]);
  const recapMock=useMemo(()=>g.st.startsWith('final')?BC.gameRecap(g):'',[g.id]);
  const recap=window.E_useLive(recapMock,()=>g.st.startsWith('final')&&window.NHL&&window.NHL.gameRecapMapped?window.NHL.gameRecapMapped(g.id):null,[g.id]);
  const bxMock=useMemo(()=>BC.broadcasts(g),[g.id]);
  // overlay real TV networks from the game landing when deployed
  const bx=window.E_useLive(bxMock,()=>g.st!=='pre'&&window.NHL&&window.NHL.gameBroadcasts?window.NHL.gameBroadcasts(g.id).then(b=>b?{...bxMock,...b}:null):null,[g.id]);
  const offMock=useMemo(()=>BC.officials?BC.officials(g):null,[g.id]);
  // overlay real referees + linesmen from the game landing when deployed
  const off=window.E_useLive(offMock,()=>g.st!=='pre'&&window.NHL&&window.NHL.gameOfficials?window.NHL.gameOfficials(g.id):null,[g.id]);
  const replays=useMemo(()=>g.st!=='pre'?BC.goalReplays(g):[],[g.id]);
  const [replayId,setReplayId]=useState(null);
  const [replayKey,setReplayKey]=useState(0);
  const shiftsMock=useMemo(()=>g.st!=='pre'?BC.shiftChart(g):{away:[],home:[]},[g.id]);
  const shifts=window.E_useLive(shiftsMock,()=>g.st!=='pre'&&window.NHL&&window.NHL.shiftChartMapped?window.NHL.shiftChartMapped(g.id,g.a,g.h):null,[g.id]);
  const shotData=useMemo(()=>g.st!=='pre'&&BC.shotMap?BC.shotMap(g):[],[g.id]);
  const boxMock=useMemo(()=>g.st!=='pre'&&BC.boxStats?BC.boxStats(g):null,[g.id]);
  const box=(()=>{
    const base=boxMock||null;
    if(!(gl&&gl.box))return base;
    const lb=gl.box;
    const teamOk=lb.team&&lb.team[g.a]&&lb.team[g.h];           // live team keyed to match this game's abbrevs
    const lineOk=lb.line&&lb.line.away&&lb.line.home;
    return {
      ...(base||{}),
      ...lb,
      team: teamOk?lb.team:((base&&base.team)||lb.team),
      line: lineOk?lb.line:((base&&base.line)||lb.line),
      periods: (lb.periods&&lb.periods.length)?lb.periods:((base&&base.periods)||lb.periods),
      skaters: lb.skaters||(base&&base.skaters),
      goalies: lb.goalies||(base&&base.goalies),
      scratches: lb.scratches||(base&&base.scratches)||{[g.a]:[],[g.h]:[]},
    };
  })();
  // safe team-stat accessor — never throws if a side is missing from the box
  const bt=ab=>(box&&box.team&&box.team[ab])||null;
  const [ev,setEv]=useState('All');
  const [shared,setShared]=useState(false);
  const copyLink=()=>{const url=location.href;const done=()=>{setShared(true);setTimeout(()=>setShared(false),1800);};try{navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(url).then(done,done):done();}catch(e){done();}};
  const feed=pbp.filter(e=>ev==='All'||e.type===ev);
  const final=g.st.startsWith('final');
  const live=g.st==='live', pre=g.st==='pre';
  const s=useLive(g);
  const le=useLiveEdge(g);
  const lp=useLivePlayers(g);
  const sit=useLiveSituation(g);
  const stt=window.BC.specialTeams?BC.specialTeams(g):null;
  const xgA=le?+le.xg.a:0, xgH=le?+le.xg.h:0;
  const clkRem=(()=>{const a=(s.clk||'20:00').split(':').map(Number);return (a[0]||0)*60+(a[1]||0);})();
  const perIdx={'1st':0,'2nd':1,'3rd':2,'OT':3}[g.per]||0;
  const elapsed=pre?0:final?1:Math.min(1,(perIdx*1200+(1200-clkRem))/3600);
  const wpA=pre?0.5:Math.max(0.01,Math.min(0.99,1/(1+Math.exp(-((s.as-s.hs)*0.72+(xgA-xgH)*0.32)*(0.7+elapsed*1.05)))));
  const [followAb,setFollowAb]=useState(g.a);
  const [followId,setFollowId]=useState(()=>{try{return localStorage.getItem('e_follow_'+g.id)||'';}catch(e){return '';}});
  const pickFollow=(ab,id)=>{setFollowAb(ab);setFollowId(id);try{localStorage.setItem('e_follow_'+g.id,id);}catch(e){}};
  const fmtTOI=sec=>`${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
  const fRoster=lp?lp[followAb]||[]:[];
  const fSel=fRoster.find(p=>p.id===followId)||fRoster[0];
  const liveLabel=live?'Live':'Game flow';
  const tabs=pre?['Box score']:[liveLabel,'Box score','Lineups'];
  const [tab,setTab]=useState(live?liveLabel:'Box score');
  const attTot=le?((le.att.a+le.att.h)||1):1;
  const aShare=le?Math.round(le.att.a/attTot*100):50;
  const hard=le?(le.hardest.a>=le.hardest.h?{mph:le.hardest.a,by:le.hardest.aby,team:g.a}:{mph:le.hardest.h,by:le.hardest.hby,team:g.h}):null;
  const fast=le?(le.topspd.a>=le.topspd.h?{mph:le.topspd.a,by:le.topspd.aby,team:g.a}:{mph:le.topspd.h,by:le.topspd.hby,team:g.h}):null;
  const mTeam=le?(le.momentum>=0?g.h:g.a):g.h, mAbs=le?Math.abs(le.momentum):0;
  const mTxt=mAbs<0.16?'Even play':`▲ ${mTeam} pushing`;
  const liveFeed=pbp.slice(-7).reverse();
  const StatBig=({label,value,unit,sub,team})=>(<div style={{...card,padding:'14px 16px'}}>
    <div style={ML}>{label}</div>
    <div style={{display:'flex',alignItems:'baseline',gap:4,marginTop:7}}><span style={{fontSize:33,fontWeight:600,letterSpacing:'-.03em',color:team?col(team):T.ink,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{value}</span>{unit&&<span style={{fontFamily:MONO,fontSize:12.5,color:T.mut}}>{unit}</span>}</div>
    {sub&&<div style={{fontFamily:MONO,fontSize:10.5,color:T.faint,marginTop:7,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{sub}</div>}
  </div>);
  const Lines=({side,ab})=>{const rows=(box&&box.skaters&&box.skaters[ab])||d[side].lines;const gb=box&&box.goalies&&box.goalies[ab];return (<div style={{...card,overflow:'hidden'}}>
    <div style={{display:'flex',alignItems:'center',gap:9,padding:'12px 16px',borderBottom:`1px solid ${T.line}`}}><Badge ab={ab} size={24}/><span style={{fontWeight:600}}>{city(ab)} {nick(ab)}</span></div>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:360,borderCollapse:'collapse',fontSize:13}}><thead><tr style={ML}>{['Skater','G','A','P','SOG','+/-','HIT','BLK','TOI'].map((h,i)=><th key={h} style={{padding:'8px 11px',textAlign:i?'center':'left',fontWeight:600,...ML,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
    <tbody>{rows.slice(0,8).map((p,i)=>(<tr key={i} style={{borderTop:`1px solid ${T.line}`}}>
      <td style={{padding:'7px 11px',color:T.ink,whiteSpace:'nowrap'}}>{p.name} <span style={{color:T.faint}}>{p.pos}</span></td>
      {[['g',p.g],['a',p.a],['p',p.p],['sog',p.sog],['pm',p.pm==null?'–':(p.pm>0?'+':'')+p.pm],['hits',p.hits==null?'–':p.hits],['blk',p.blk==null?'–':p.blk],['toi',p.toi]].map(([k,v])=><td key={k} style={{padding:'7px 11px',textAlign:'center',fontFamily:k==='toi'?MONO:'inherit',fontWeight:k==='p'?700:400,color:k==='p'?T.ink:T.mut}}>{v}</td>)}</tr>))}</tbody></table></div>
    {gb&&<div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderTop:`1px solid ${T.line}`,background:T.bg,flexWrap:'wrap'}}><span style={{...ML,fontSize:9}}>Goalie</span><span style={{fontWeight:600,color:T.ink,fontSize:13}}>{gb.name}</span><span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{gb.saves}/{gb.sa} SV · {gb.svp} · {gb.ga} GA · {gb.toi}{gb.dec!=='—'?` · ${gb.dec}`:''}</span></div>}
  </div>);};
  const liveView=(<div style={{display:'grid',gap:16}}>
    <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:MONO,fontSize:11,color:live?T.red:T.faint,flexWrap:'wrap'}}>
      {live&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>}
      <span style={{letterSpacing:'.1em',textTransform:'uppercase'}}>{live?`Live · ${g.per} ${s.clk}`:final?'Final · Edge summary':g.start}</span>
      <span style={{marginLeft:'auto',color:T.faint,letterSpacing:'.06em',textTransform:'uppercase'}}>NHL Edge · player &amp; puck tracking</span>
      <ProvTag kind="proj"/>
    </div>
    {(()=>{const pp=sit.type==='PP';const max=sit.max||(sit.strength==='5-on-3'?90:120);return <div style={{...card,padding:'12px 16px',boxShadow:pp?`inset 3px 0 0 ${col(sit.team)}`:'none'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        {pp?<React.Fragment>
          <span style={{fontFamily:MONO,fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,color:col(sit.team),display:'inline-flex',alignItems:'center',gap:7}}><span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:col(sit.team),display:'inline-block'}}/>Power play · {sit.team} {sit.strength}</span>
          <span style={{fontFamily:MONO,fontSize:14,fontWeight:700,color:T.ink}}>{fmtTOI(sit.sec)}</span>
          <div style={{flex:1,minWidth:80,height:6,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${sit.sec/max*100}%`,background:col(sit.team),transition:'width 1s linear'}}/></div>
        </React.Fragment>:<span style={{fontFamily:MONO,fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',color:T.mut}}>Even strength · 5-on-5</span>}
        <span style={{marginLeft:'auto'}}><ProvTag kind="live"/></span>
      </div>
      {stt&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px 22px',marginTop:10,paddingTop:10,borderTop:`1px solid ${T.line}`,fontFamily:MONO,fontSize:11,color:T.mut}}>
        {[g.a,g.h].map(ab=><span key={ab} style={{display:'inline-flex',alignItems:'center',gap:7}}><Badge ab={ab} size={15}/>PP <b style={{color:T.ink,fontWeight:600}}>{stt[ab].ppG}/{stt[ab].ppOpp}</b> · PK <b style={{color:T.ink,fontWeight:600}}>{stt[ab].pkK}/{stt[ab].pkFaced}</b></span>)}
      </div>}
    </div>;})()}
    <div style={{...card,padding:'16px 18px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:10,flexWrap:'wrap'}}><span style={ML}>Pressure · shot attempts</span><span style={{display:'inline-flex',alignItems:'center',gap:8}}><span style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>{mTxt}</span><ProvTag kind="live"/></span></div>
      <div style={{display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:12.5,fontWeight:700,marginBottom:7}}><span style={{color:col(g.a)}}>{g.a} {le?le.att.a:0}</span><span style={{color:col(g.h)}}>{le?le.att.h:0} {g.h}</span></div>
      <div style={{display:'flex',height:14,borderRadius:7,overflow:'hidden',background:T.bg,position:'relative'}}>
        <div style={{width:`${aShare}%`,background:col(g.a),transition:'width .8s ease'}}/><div style={{flex:1,background:col(g.h)}}/>
        <div style={{position:'absolute',left:'50%',top:-2,bottom:-2,width:2,background:T.paper}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontFamily:MONO,fontSize:10.5,color:T.faint}}><span>{aShare}%</span><span>{100-aShare}%</span></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}} className="g4">
      <StatBig label="Hardest shot" value={hard?hard.mph:'–'} unit="mph" sub={hard?`${hard.by} · ${hard.team}`:''} team={hard&&hard.team}/>
      <StatBig label="Top skating speed" value={fast?fast.mph:'–'} unit="mph" sub={fast?`${fast.by} · ${fast.team}`:''} team={fast&&fast.team}/>
      <StatBig label="Distance skated" value={le?(le.dist.a+le.dist.h).toFixed(1):'–'} unit="mi" sub="both teams"/>
      <StatBig label="Game pace" value={le?le.pace:'–'} unit="att/60" sub="combined attempts"/>
    </div>
    <div style={{...card,padding:'16px 18px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11,gap:10,flexWrap:'wrap'}}><span style={ML}>Win probability</span><ProvTag kind="proj"/></div>
      <div style={{display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:12.5,fontWeight:700,marginBottom:7}}><span style={{color:col(g.a)}}>{g.a} {Math.round(wpA*100)}%</span><span style={{color:col(g.h)}}>{100-Math.round(wpA*100)}% {g.h}</span></div>
      <div style={{display:'flex',height:14,borderRadius:7,overflow:'hidden',background:T.bg}}><div style={{width:`${wpA*100}%`,background:col(g.a),transition:'width 1s ease'}}/><div style={{flex:1,background:col(g.h)}}/></div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:14,paddingTop:13,borderTop:`1px solid ${T.line}`,flexWrap:'wrap',gap:10}}>
        <span style={ML}>Expected goals · xG</span>
        <span style={{fontFamily:MONO,fontSize:13,color:T.mut}}><b style={{color:col(g.a)}}>{xgA.toFixed(1)}</b> – <b style={{color:col(g.h)}}>{xgH.toFixed(1)}</b> xG <span style={{color:T.faint}}>· actual {s.as}–{s.hs}</span></span>
      </div>
    </div>
    {le&&<div style={{...card,padding:'14px 18px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><span style={ML}>Offensive-zone time</span><span style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>{g.a} {le.oz.a}% · {le.oz.h}% {g.h}</span></div>
      <div style={{display:'flex',height:10,borderRadius:5,overflow:'hidden',background:T.bg}}><div style={{width:`${le.oz.a}%`,background:col(g.a),transition:'width .8s ease'}}/><div style={{flex:1,background:col(g.h)}}/></div>
    </div>}
    {window.E_LiveRink&&<window.E_LiveRink g={g} focus={fSel} players={lp?[...(lp[g.a]||[]),...(lp[g.h]||[])].filter(p=>p.onIce):[]} onPick={p=>pickFollow(p.team,p.id)} shots={shotData}/>}
    {liveFeed.length>0&&<div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${T.line}`}}>{live&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>}<span style={ML}>{live?'Latest':'Key plays'}</span></div>
      {liveFeed.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderTop:i?`1px solid ${T.line}`:'none',fontSize:13}}><span style={{fontFamily:MONO,fontSize:11,color:T.faint,width:62}}>{e.per} {e.time}</span><span style={{width:7,height:7,borderRadius:99,background:col(e.team),flexShrink:0}}/><span style={{flex:1,color:e.type==='Goal'?T.ink:T.mut,fontWeight:e.type==='Goal'?600:400}}>{e.desc}</span></div>)}
    </div>}
  </div>);
  const lineupsView=(lp&&fSel)?(<div style={{display:'grid',gap:16}}>
    <div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${T.line}`,flexWrap:'wrap'}}>
        <span style={ML}>Lineups</span>
        <span style={{marginLeft:'auto',fontFamily:MONO,fontSize:10,color:T.faint}}>tap any name to follow · see them on Live</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,borderBottom:`1px solid ${T.line}`}} className="g2">
        {[g.a,g.h].map((ab,ci)=>(<div key={ab} style={{padding:'12px 14px',borderRight:ci===0?`1px solid ${T.line}`:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}><Badge ab={ab} size={18}/><span style={{fontSize:12.5,fontWeight:600,color:T.ink}}>{city(ab)}</span><span style={{marginLeft:'auto',fontFamily:MONO,fontSize:9.5,letterSpacing:'.05em',textTransform:'uppercase',color:'#1a8a4f'}}>{(lp[ab]||[]).filter(p=>p.onIce&&!p.isG).length} on ice</span></div>
          {[['On ice',p=>p.onIce&&!p.isG],['Goalie',p=>p.isG],['Bench',p=>!p.onIce&&!p.isG]].map(([grp,f])=>{const rows=(lp[ab]||[]).filter(f);if(!rows.length)return null;return <div key={grp} style={{marginBottom:7}}>
            <div style={{fontFamily:MONO,fontSize:8.5,letterSpacing:'.1em',textTransform:'uppercase',color:T.faint,margin:'0 0 3px 2px'}}>{grp}</div>
            {rows.map(p=>{const onSel=p.id===fSel.id;return <button key={p.id} onClick={()=>pickFollow(ab,p.id)} className="er" style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'5px 7px',borderRadius:7,border:'none',background:onSel?`${col(ab)}1c`:'transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
              <span style={{width:6,height:6,borderRadius:99,background:p.onIce?'#1a8a4f':T.line2,flexShrink:0}}/>
              <span style={{fontFamily:MONO,fontSize:11,color:onSel?T.ink:T.faint,width:24,flexShrink:0}}>#{p.num}</span>
              <span style={{flex:1,fontSize:12.5,fontWeight:onSel?700:500,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</span>
              <span style={{fontFamily:MONO,fontSize:10,color:T.faint,flexShrink:0}}>{p.pos}</span>
            </button>;})}
          </div>;})}
        </div>))}
      </div>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:16,flexWrap:'wrap'}}>
          <PlayerAvatar pos={fSel.pos} team={fSel.team} name={fSel.name} size={48}/>
          <div style={{minWidth:0}}><div style={{fontSize:17,fontWeight:600,color:T.ink}}>{fSel.name}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>#{fSel.num} · {city(fSel.team)} · {fSel.pos}</div></div>
          <span style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:7,fontFamily:MONO,fontSize:11,letterSpacing:'.05em',textTransform:'uppercase',padding:'6px 11px',borderRadius:999,background:fSel.onIce?T.posBg:T.bg,color:fSel.onIce?T.posFg:T.faint,border:`1px solid ${fSel.onIce?T.posFg+'55':T.line2}`}}>{fSel.onIce&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.posFg,display:'inline-block'}}/>}{fSel.isG?'In net':fSel.onIce?`On ice · ${fmtTOI(fSel.shiftSec)}`:'On bench'}</span>
        </div>
        {fSel.isG?(()=>{const fmtSv=v=>v>=1?'1.000':'.'+String(Math.round(v*1000)).padStart(3,'0');const sv=fSel.sa?fmtSv(fSel.saves/fSel.sa):'—',hd=fSel.hdSa?fmtSv(fSel.hdSaves/fSel.hdSa):'—';return <React.Fragment>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px 18px'}} className="g3">
            {[['Saves',fSel.saves,''],['Shots against',fSel.sa,''],['Save %',sv,''],['High-danger SV%',hd,''],['Goals against',fSel.ga,''],['Freezes',fSel.freezes,'']].map(([l,v,u])=>(
              <div key={l}><div style={{fontSize:24,fontWeight:600,color:T.ink,letterSpacing:'-.02em',lineHeight:1.1,fontVariantNumeric:'tabular-nums'}}>{v}<span style={{fontFamily:MONO,fontSize:12,color:T.mut,fontWeight:400}}>{u}</span></div><div style={{...ML,marginTop:3}}>{l}</div></div>))}
          </div>
          <div style={{marginTop:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={ML}>High-danger saves</span><span style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>{fSel.hdSaves}/{fSel.hdSa} stopped</span></div>
            <div style={{display:'flex',height:9,borderRadius:5,overflow:'hidden',background:T.bg}}><div style={{width:`${fSel.hdSa?fSel.hdSaves/fSel.hdSa*100:0}%`,background:col(fSel.team)}}/><div style={{flex:1,background:T.red,opacity:.5}}/></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:14,flexWrap:'wrap'}}>
            <span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>TOI {fmtTOI(fSel.toiSec)} · GA {fSel.ga}</span>
            <span style={{marginLeft:'auto',display:'inline-flex',gap:6}}><ProvTag kind="proj"/><ProvTag kind="day"/></span>
          </div>
        </React.Fragment>;})():<React.Fragment>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px 18px'}} className="g3">
          {[['Time on ice',fmtTOI(fSel.toiSec),''],['Shifts',fSel.shifts,''],['Top speed',fSel.topSpd,' mph'],['Distance',fSel.dist,' mi'],['Hardest shot',fSel.hardest,' mph'],['20+ bursts',fSel.b20,'']].map(([l,v,u])=>(
            <div key={l}><div style={{fontSize:24,fontWeight:600,color:T.ink,letterSpacing:'-.02em',lineHeight:1.1,fontVariantNumeric:'tabular-nums'}}>{v}<span style={{fontFamily:MONO,fontSize:12,color:T.mut,fontWeight:400}}>{u}</span></div><div style={{...ML,marginTop:3}}>{l}</div></div>))}
        </div>
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={ML}>Zone time</span><span style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>O {fSel.oz.o}% · N {fSel.oz.n}% · D {fSel.oz.d}%</span></div>
          <div style={{display:'flex',height:9,borderRadius:5,overflow:'hidden',background:T.bg}}><div style={{width:`${fSel.oz.o}%`,background:col(fSel.team)}}/><div style={{width:`${fSel.oz.n}%`,background:T.line2}}/><div style={{flex:1,background:T.faint}}/></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:14,flexWrap:'wrap'}}>
          <span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>SOG {fSel.sog} · ATT {fSel.att} · HIT {fSel.hits} · BLK {fSel.blk}</span>
          <span style={{marginLeft:'auto',display:'inline-flex',gap:6}}><ProvTag kind="proj"/><ProvTag kind="day"/></span>
        </div>
        </React.Fragment>}
      </div>
    </div>
    {(()=>{const pens=pbp.filter(e=>e.type==='Penalty');return <div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${T.line}`,flexWrap:'wrap'}}><span style={ML}>Officials &amp; penalties</span><span style={{marginLeft:'auto'}}><ProvTag kind="live"/></span></div>
      {off&&<div style={{display:'flex',flexWrap:'wrap',gap:'8px 24px',padding:'12px 16px',borderBottom:`1px solid ${T.line}`}}>
        <span style={{display:'inline-flex',flexDirection:'column',gap:2}}><span style={{...ML,fontSize:9}}>Referees</span><span style={{fontSize:13,color:T.ink}}>{off.refs.join(' · ')}</span></span>
        <span style={{display:'inline-flex',flexDirection:'column',gap:2}}><span style={{...ML,fontSize:9}}>Linesmen</span><span style={{fontSize:13,color:T.ink}}>{off.linesmen.join(' · ')}</span></span>
      </div>}
      {pens.length?pens.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',fontSize:13}}>
        <span style={{fontFamily:MONO,fontSize:11,color:T.faint,width:62,flexShrink:0}}>{e.per} {e.time}</span>
        <Badge ab={e.team} size={20}/>
        <span style={{flex:1,color:T.ink,fontWeight:600}}>{e.desc.split('—')[0].trim()}</span>
        <span style={{fontFamily:MONO,fontSize:11,color:T.mut,whiteSpace:'nowrap'}}>{e.desc.replace(/^.*?—\s*/,'')}</span>
      </div>):<div style={{padding:'14px 16px',fontFamily:MONO,fontSize:12,color:T.mut}}>No penalties yet.</div>}
    </div>;})()}
    {box&&box.scratches&&((box.scratches[g.a]||[]).length>0||(box.scratches[g.h]||[]).length>0)&&<div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'12px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Healthy scratches</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}} className="g2">
        {[g.a,g.h].map((ab,ci)=><div key={ab} style={{padding:'12px 16px',borderRight:ci===0?`1px solid ${T.line}`:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}><Badge ab={ab} size={18}/><span style={{fontSize:12.5,fontWeight:600,color:T.ink}}>{city(ab)}</span></div>
          {(box.scratches[ab]||[]).length?(box.scratches[ab]||[]).map((n,i)=><div key={i} style={{fontFamily:MONO,fontSize:12,color:T.mut,padding:'2px 0'}}>{n}</div>):<div style={{fontFamily:MONO,fontSize:11.5,color:T.faint}}>none</div>}
        </div>)}
      </div>
    </div>}
  </div>):<div style={{...card,padding:'40px 0',textAlign:'center',fontFamily:MONO,fontSize:12,color:T.mut}}>Lineups available at puck drop.</div>;
  const preView=(<div style={{display:'grid',gap:16}}>
    <div style={{...card,padding:'40px 18px',textAlign:'center'}}>
      <div style={{fontFamily:SERIF,fontSize:22,color:T.ink,marginBottom:6}}>Game hasn't started</div>
      <div style={{fontSize:13,color:T.mut,maxWidth:440,margin:'0 auto'}}>Faceoff {g.start||'TBD'}{(g._venue||d.venue)?` · ${g._venue||d.venue}`:''}. Box score, scoring and play-by-play appear once the puck drops.</div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}} className="g2">
      {[g.a,g.h].map(ab=>{const st=BC.standBy&&BC.standBy(ab);return(<div key={ab} style={{...card,padding:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:st?10:0}}><Badge ab={ab} size={28}/><div><div style={{fontWeight:700,color:T.ink}}>{city(ab)} {nick(ab)}</div>{st&&<div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{st.w}-{st.l}-{st.otl}{BC.rankOf&&BC.rankOf[ab]?` · #${BC.rankOf[ab]}`:''}</div>}</div></div>
        {st&&<div style={{display:'flex',gap:16,fontFamily:MONO,fontSize:11.5,color:T.mut,flexWrap:'wrap'}}><span>L10 <b style={{color:T.ink}}>{st.last10||'—'}</b></span><span>STRK <b style={{color:T.ink}}>{st.strk||'—'}</b></span><span>PTS <b style={{color:T.ink}}>{st.pts}</b></span></div>}
      </div>);})}
    </div>
  </div>);
  const boxScore=(<div>
    {d.stars.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}} className="g3">
      {d.stars.map(st=><div key={st.n} style={{...card,padding:'13px 15px',display:'flex',alignItems:'center',gap:11}}><span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:26,color:T.faint}}>{st.n}</span><Badge ab={st.team} size={28}/><div><div style={{fontWeight:600,fontSize:13.5}}>{st.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{st.line}</div></div></div>)}
    </div>}
    {box&&box.line&&box.line.away&&box.periods&&<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'12px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Scoring by period</div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:360,borderCollapse:'collapse',fontSize:13}}>
        <thead><tr style={ML}>{['Team',...box.periods,'Total'].map((h,i)=><th key={i} style={{padding:'9px 14px',textAlign:i?'center':'left',fontWeight:600,...ML}}>{h}</th>)}</tr></thead>
        <tbody>{[['away',g.a],['home',g.h]].map(([sd,ab])=>{const ln=box.line[sd];return <tr key={ab} style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'9px 14px'}}><span style={{display:'inline-flex',alignItems:'center',gap:8}}><Badge ab={ab} size={20}/><span style={{fontWeight:600,color:T.ink}}>{ab}</span></span></td>
          {ln.goals.map((gg,i)=><td key={i} style={{padding:'9px 14px',textAlign:'center'}}><span style={{fontWeight:700,color:T.ink}}>{gg}</span> <span style={{fontFamily:MONO,fontSize:10,color:T.faint}}>{ln.shots[i]}sh</span></td>)}
          <td style={{padding:'9px 14px',textAlign:'center'}}><span style={{fontWeight:700,fontSize:15,color:T.ink}}>{ln.total}</span> <span style={{fontFamily:MONO,fontSize:10,color:T.faint}}>{ln.sog}sh</span></td>
        </tr>;})}</tbody>
      </table></div>
    </div>}
    <div style={{...card,padding:'6px 18px',marginBottom:16}}>
      {(()=>{const rows=[['Shots on goal',g.sa,g.sh],['Faceoff %',d.away.team.fo,d.home.team.fo],['Power play',bt(g.a)?bt(g.a).pp:d.away.team.pp,bt(g.h)?bt(g.h).pp:d.home.team.pp],['Penalty kill',bt(g.a)&&bt(g.a).pk,bt(g.h)&&bt(g.h).pk],['Hits',d.away.team.hits,d.home.team.hits],['Blocked',d.away.team.blk,d.home.team.blk],['Giveaways',bt(g.a)&&bt(g.a).give,bt(g.h)&&bt(g.h).give],['Takeaways',bt(g.a)&&bt(g.a).take,bt(g.h)&&bt(g.h).take],['PIM',d.away.team.pim,d.home.team.pim]].filter(rw=>rw[1]!=null&&rw[1]!==false);
        return rows.map(([lab,av,hv],idx)=>(<div key={lab} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:14,padding:'9px 0',borderTop:idx?`1px solid ${T.line}`:'none'}}>
          <span style={{textAlign:'right',fontWeight:700}}>{av}</span><span style={{width:130,textAlign:'center',...ML}}>{lab}</span><span style={{fontWeight:700}}>{hv}</span></div>));})()}
    </div>
    {d.goals.length>0&&<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',...ML}}>Scoring</div>
      {d.goals.map((go,i)=><div key={i} style={{display:'flex',alignItems:'flex-start',gap:11,padding:'9px 16px',borderTop:`1px solid ${T.line}`}}><Badge ab={go.team} size={22}/><div style={{flex:1}}><span style={{color:T.ink,fontSize:13.5}}>{go.scorer} {go.str!=='EV'&&<span style={{fontFamily:MONO,fontSize:10,padding:'1px 5px',borderRadius:4,background:T.bg,color:T.mut,marginLeft:4}}>{go.str}</span>}</span>{go.assists&&go.assists.length>0?<div style={{fontFamily:MONO,fontSize:11,color:T.faint,marginTop:2}}>assists: {go.assists.join(', ')}</div>:<div style={{fontFamily:MONO,fontSize:11,color:T.faint,marginTop:2}}>unassisted</div>}</div><span style={{fontFamily:MONO,fontSize:11.5,color:T.faint,paddingTop:2}}>{go.per} {go.time}</span></div>)}
    </div>}
    {g.st!=='pre'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}} className="g2"><Lines side="away" ab={g.a}/><Lines side="home" ab={g.h}/></div>}
    <div style={{marginBottom:16}}>
      <div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Season series</div>
        {series.map((m,i)=>{const aw=m.as>m.hs;return <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',fontSize:13}}><span style={{fontFamily:MONO,fontSize:11.5,color:T.faint}}>{m.date}</span><span style={{display:'flex',alignItems:'center',gap:8}}><Badge ab={m.away} size={18}/><span style={{fontWeight:aw?700:400}}>{m.as}</span><span style={{color:T.faint}}>–</span><span style={{fontWeight:!aw?700:400}}>{m.hs}</span><Badge ab={m.home} size={18}/></span></div>;})}
      </div>
    </div>
    {recap&&<div style={{...card,padding:'16px 18px',marginBottom:16}}>
      <div style={{...ML,marginBottom:8}}>Recap</div>
      <p style={{fontFamily:SERIF,fontSize:17,lineHeight:1.5,color:T.ink,margin:0}}>{recap}</p>
    </div>}
    {replays.length>0&&<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}><span>Goal replays</span><span style={{fontFamily:MONO,fontSize:10,color:T.faint}}>tap to replay the puck path</span></div>
      <div style={{display:'flex',gap:12,overflowX:'auto',padding:'14px 16px'}}>
        {replays.map(go=>{const on=replayId===go.id;return <div key={go.id} onClick={()=>{setReplayId(go.id);setReplayKey(k=>k+1);}} style={{flexShrink:0,width:150,border:`1.5px solid ${on?col(go.team):T.line}`,borderRadius:11,overflow:'hidden',cursor:'pointer'}} className="ec">
          <div style={{height:84,background:`linear-gradient(135deg, ${col(go.team)}, ${col(go.team)}aa)`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{width:0,height:0,borderLeft:'16px solid #fff',borderTop:'10px solid transparent',borderBottom:'10px solid transparent',marginLeft:4}}/></div>
          <div style={{padding:'9px 11px'}}><div style={{fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{go.scorer}</div><div style={{fontFamily:MONO,fontSize:10.5,color:T.mut}}>{go.per} {go.time} · {go.str}</div></div>
        </div>;})}
      </div>
      {replayId!=null&&(()=>{const go=replays.find(x=>x.id===replayId)||replays[0];if(!go)return null;const seed=(go.id*37+(go.time?go.time.length:0)*7)%100;const oy=18+seed%64;const my=oy<50?oy+28:oy-28;return(
        <div style={{borderTop:`1px solid ${T.line}`,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}><span style={{fontWeight:600,color:T.ink,fontSize:13.5}}>{go.scorer}<span style={{fontFamily:MONO,fontSize:11,fontWeight:400,color:T.mut}}>{' · '}{go.assists&&go.assists.length?`assists: ${go.assists.join(', ')}`:'unassisted'}</span></span><span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{go.per} {go.time} · {go.str}</span></div>
          <div style={{position:'relative',width:'100%',maxWidth:540,margin:'0 auto'}}>
            <svg key={replayKey} viewBox="0 0 200 100" style={{width:'100%',height:'auto',display:'block'}}>
              <rect x="1" y="1" width="198" height="98" rx="14" fill={T.bg} stroke={T.line2}/>
              <line x1="100" y1="4" x2="100" y2="96" stroke={T.red} strokeOpacity=".22" strokeWidth="1"/>
              <line x1="170" y1="6" x2="170" y2="94" stroke={T.red} strokeOpacity=".4" strokeWidth="1.5"/>
              <path d="M170 40 a18 18 0 0 1 0 20" fill="none" stroke={T.red} strokeOpacity=".3" strokeWidth="1"/>
              <rect x="183" y="42" width="7" height="16" fill="none" stroke={col(go.team)} strokeWidth="2"/>
              <path d={`M20 ${oy} Q 118 ${my} 182 50`} fill="none" stroke={col(go.team)} strokeOpacity=".45" strokeWidth="2" strokeDasharray="3 3"/>
              <circle r="4" fill={col(go.team)}><animateMotion dur="1.15s" repeatCount="1" fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.3 0 0.5 1" path={`M20 ${oy} Q 118 ${my} 181 50`}/></circle>
              <circle cx="186" cy="50" r="3" fill={col(go.team)} opacity="0"><animate attributeName="opacity" values="0;0;1;0.2" keyTimes="0;0.82;0.9;1" dur="1.15s" repeatCount="1" fill="freeze"/><animate attributeName="r" values="3;3;10" keyTimes="0;0.85;1" dur="1.15s" repeatCount="1" fill="freeze"/></circle>
            </svg>
          </div>
        </div>);})()}
    </div>}
    {g.st!=='pre'&&<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Shift chart · time on ice</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}} className="g2">
        {[['away',g.a],['home',g.h]].map(([side,ab])=><div key={side} style={{padding:'12px 16px',borderRight:side==='away'?`1px solid ${T.line}`:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><Badge ab={ab} size={18}/><span style={{fontSize:12.5,fontWeight:600}}>{city(ab)}</span></div>
          {shifts[side].map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><span style={{fontSize:12,width:96,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:T.ink}}>{p.name}</span><div style={{flex:1,height:6,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${p.pct}%`,background:col(ab)}}/></div><span style={{fontFamily:MONO,fontSize:11,color:T.mut,width:42,textAlign:'right'}}>{p.toi}</span></div>)}
        </div>)}
      </div>
    </div>}
    {pbp.length>0&&<div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.line}`,flexWrap:'wrap',gap:8}}><span style={ML}>Play-by-play</span>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{['All','Goal','Penalty','Shot','Hit'].map(t=><button key={t} onClick={()=>setEv(t)} style={{fontFamily:MONO,fontSize:10.5,padding:'3px 9px',borderRadius:999,border:`1px solid ${ev===t?T.invBg:T.line2}`,background:ev===t?T.invBg:'transparent',color:ev===t?T.invFg:T.mut,cursor:'pointer'}}>{t}</button>)}</div>
      </div>
      <div style={{maxHeight:340,overflowY:'auto'}}>{feed.length?feed.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderTop:i?`1px solid ${T.line}`:'none',fontSize:13}}><span style={{fontFamily:MONO,fontSize:11,color:T.faint,width:62}}>{e.per} {e.time}</span><span style={{width:7,height:7,borderRadius:99,background:col(e.team),flexShrink:0}}/><span style={{flex:1,color:e.type==='Goal'?T.ink:T.mut,fontWeight:e.type==='Goal'?600:400}}>{e.desc}</span></div>):<div style={{padding:16,fontFamily:MONO,fontSize:12,color:T.mut}}>no events match.</div>}</div>
    </div>}
  </div>);
  return(<div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,paddingBottom:18}}>
      <button onClick={onBack} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:0}}>← back to scores</button>
      <button onClick={copyLink} className="el" aria-label="Share this game" style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:`1px solid ${shared?'#1a8a4f':T.line2}`,borderRadius:8,color:shared?'#1a8a4f':T.mut,cursor:'pointer',fontFamily:MONO,fontSize:11,letterSpacing:'.04em',textTransform:'uppercase',padding:'6px 11px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>{shared?'Link copied':'Share'}</button>
    </div>
    <div style={{...card,padding:0,overflow:'hidden',marginBottom:16,background:`linear-gradient(110deg, ${col(g.a)}0e, ${col(g.h)}0e)`}}>
      {live&&<div style={{height:2,background:T.line}}><div style={{height:'100%',width:`${(()=>{const[m,sec]=(s.clk||'20:00').split(':').map(Number);return Math.max(2,Math.min(100,(1-(m*60+sec)/1200)*100));})()}%`,background:T.red,transition:'width .6s linear'}}/></div>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:30,maxWidth:560,margin:'0 auto',padding:'30px 20px'}}>
        {[[g.a,s.as],[g.h,s.hs]].map(([ab,sc],idx)=>(<React.Fragment key={ab}>
          <button onClick={()=>onTeam(ab)} className="el" style={{background:'none',border:'none',cursor:'pointer',textAlign:'center',flex:1}}><Badge ab={ab} size={52}/><div style={{fontWeight:600,marginTop:8,color:T.ink}}>{city(ab)}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{nick(ab)}</div></button>
          {idx===0&&<div style={{textAlign:'center'}}><div style={{fontSize:44,fontWeight:600,letterSpacing:'-.03em',color:T.ink}}>{pre?'–':`${s.as}:${s.hs}`}</div><div style={{fontFamily:MONO,fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:live?T.red:final?T.faint:'#1a8a4f',marginTop:4}}>{live?`Live · ${g.per} ${s.clk}`:final?(g.ot?'Final/OT':'Final'):g.start}</div><div style={{fontFamily:MONO,fontSize:10,color:T.faint,marginTop:4,whiteSpace:'nowrap'}}>{g._venue||d.venue}</div></div>}
        </React.Fragment>))}
      </div>
    </div>
    {(g.st!=='pre'||true)&&<div style={{...card,padding:'11px 18px',marginBottom:16,display:'flex',flexWrap:'wrap',gap:'8px 22px',fontFamily:MONO,fontSize:12,color:T.mut,alignItems:'center'}}>
      <span style={{...ML}}>Broadcast</span>
      {(()=>{const tv=(g._tv&&g._tv.length)?g._tv:bx.tv;return tv.length>0&&<span>TV <span style={{color:T.ink}}>{tv.join(' · ')}</span></span>;})()}
      {bx.stream.length>0&&<span>Stream <span style={{color:T.ink}}>{bx.stream.join(' · ')}</span></span>}
      <span>Game Center <span style={{color:T.ink}}>Live stream</span></span>
      {bx.radio&&<span>Radio <span style={{color:T.ink}}>{bx.radio}</span></span>}
      {bx.odds&&<span style={{marginLeft:'auto'}}>Odds <span style={{color:T.ink}}>{bx.odds}</span></span>}
    </div>}
    {tabs.length>1&&<div style={{display:'inline-flex',gap:4,padding:4,background:T.bg,border:`1px solid ${T.line}`,borderRadius:12,marginBottom:18}}>
      {tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{fontFamily:MONO,fontSize:11.5,letterSpacing:'.04em',textTransform:'uppercase',padding:'7px 16px',borderRadius:9,border:'none',cursor:'pointer',background:tab===t?T.invBg:'transparent',color:tab===t?T.invFg:T.mut,display:'inline-flex',alignItems:'center',gap:7,transition:'background .15s'}}>{t===tabs[0]&&live&&<span className="ed-pulse" style={{width:5,height:5,borderRadius:99,background:tab===t?T.invFg:T.red,display:'inline-block'}}/>}{t}</button>)}
    </div>}
    {pre?preView:(tab===tabs[0]?liveView:tab==='Lineups'?lineupsView:boxScore)}
    <style>{`@media(max-width:680px){.g2,.g3{grid-template-columns:1fr!important}}@media(max-width:680px){.g4{grid-template-columns:1fr 1fr!important}}`}</style>
  </div>);
}

/* national TV schedule — tonight's nationally-broadcast slate (mock; live via NHL.tvScheduleMapped) */
function NationalTV(){
  const isLive=!!(window.BC&&window.BC.LIVE);
  const mock=useMemo(()=>(!isLive&&BC.tvSchedule)?BC.tvSchedule():[],[isLive]); // live: never fabricate — real schedule only
  const tv=window.E_useLive(mock,()=>window.NHL&&window.NHL.tvScheduleMapped?window.NHL.tvScheduleMapped():null,[]);
  if(!tv||!tv.length)return null;
  return(<div style={{...card,overflow:'hidden',margin:'4px 0 16px'}}>
    <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${T.line}`,flexWrap:'wrap'}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.mut} strokeWidth="2"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/></svg>
      <span style={ML}>On national TV</span>
      <span style={{marginLeft:'auto',fontFamily:MONO,fontSize:10,color:T.faint}}>tonight</span>
    </div>
    <div style={{display:'flex',gap:10,overflowX:'auto',padding:'12px 16px'}}>
      {tv.map((g,i)=><div key={i} style={{flexShrink:0,minWidth:152,border:`1px solid ${T.line}`,borderRadius:10,padding:'10px 12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}><Badge ab={g.away} size={20}/><span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>@</span><Badge ab={g.home} size={20}/></div>
        <div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{g.time}</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:6}}>{g.networks.map(n=><span key={n} style={{fontFamily:MONO,fontSize:9.5,letterSpacing:'.05em',padding:'2px 6px',borderRadius:5,background:T.invBg,color:T.invFg}}>{n}</span>)}</div>
      </div>)}
    </div>
  </div>);
}

/* command palette */
function Palette({open,onClose,onTeam,onPlayer,onGame}){
  const [q,setQ]=useState(''); const inp=useRef(null); const [ai,setAi]=useState(0);
  const [liveP,setLiveP]=useState([]);
  useEffect(()=>{if(open){setQ('');setTimeout(()=>inp.current&&inp.current.focus(),40);}},[open]);
  useEffect(()=>{let on=true;const t=q.trim();if(t.length<2||!(window.NHL&&window.NHL.playerSearchMapped&&window.BC&&BC.LIVE)){setLiveP([]);return;}const id=setTimeout(()=>{window.NHL.playerSearchMapped(t).then(rows=>{if(on&&rows&&rows.length)setLiveP(rows.map(p=>({type:'player',...p})));}).catch(()=>{});},220);return()=>{on=false;clearTimeout(id);};},[q]);
  const res=useMemo(()=>{const t=q.trim().toLowerCase();if(!t)return BC.ABBR.slice(0,6).map(a=>({type:'team',ab:a}));
    const mt=a=>`${city(a)} ${nick(a)} ${a}`.toLowerCase().includes(t);
    const teams=BC.ABBR.filter(mt).map(a=>({type:'team',ab:a}));
    const pool=(BC.allPlayers||BC.PLAYERS||[]);
    const players=(liveP.length?liveP:pool.filter(p=>p.name.toLowerCase().includes(t)).slice(0,6).map(p=>({type:'player',...p})));
    const gpool=[...slate(-1),...slate(0),...slate(1)];
    const games=gpool.filter(g=>mt(g.a)||mt(g.h)).slice(0,4).map(g=>({type:'game',g}));
    return[...teams.slice(0,4),...players,...games].slice(0,12);},[q,liveP]);
  if(!open)return null;
  const Tag=({children})=><span style={{fontFamily:MONO,fontSize:9,letterSpacing:'.08em',textTransform:'uppercase',color:T.faint,border:`1px solid ${T.line2}`,borderRadius:5,padding:'1px 5px',flexShrink:0}}>{children}</span>;
  const act=r=>{if(r.type==='player'&&onPlayer)onPlayer(r);else if(r.type==='game'&&onGame)onGame(r.g);else onTeam(r.ab||r.team);onClose();};
  const onKey=e=>{if(e.key==='ArrowDown'){e.preventDefault();setAi(a=>Math.min(res.length-1,a+1));}else if(e.key==='ArrowUp'){e.preventDefault();setAi(a=>Math.max(0,a-1));}else if(e.key==='Enter'){e.preventDefault();const r=res[ai];if(r)act(r);}};
  return(<div onClick={onClose} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(8,9,12,.5)',backdropFilter:'blur(3px)',display:'flex',justifyContent:'center',alignItems:'flex-start',paddingTop:'12vh'}}>
    <div onClick={e=>e.stopPropagation()} style={{width:'min(540px,92vw)',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:16,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.35)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:`1px solid ${T.line}`}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input ref={inp} value={q} onChange={e=>{setQ(e.target.value);setAi(0);}} onKeyDown={onKey} aria-label="Search teams, players and games" placeholder="Search teams, players, games…" style={{flex:1,background:'none',border:'none',outline:'none',color:T.ink,fontSize:15,fontFamily:'inherit'}}/>
        <kbd style={{fontFamily:MONO,fontSize:11,padding:'2px 7px',borderRadius:5,background:T.bg,color:T.mut}}>Esc</kbd></div>
      <div role="listbox" aria-label="Search results" style={{maxHeight:360,overflowY:'auto',padding:6}}>{res.length===0?<div style={{padding:'18px',fontFamily:MONO,fontSize:12.5,color:T.mut,textAlign:'center'}}>No matches for “{q}”.</div>:res.map((r,i)=>(<button key={i} role="option" aria-selected={i===ai} onMouseEnter={()=>setAi(i)} onClick={()=>act(r)} className="epr" style={{display:'flex',alignItems:'center',gap:11,width:'100%',padding:'9px 11px',borderRadius:9,background:i===ai?T.bg:'none',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
        {r.type==='player'?<PlayerAvatar pos={r.pos} team={r.team} name={r.name} size={26}/>:r.type==='game'?<span style={{display:'inline-flex',gap:2}}><Badge ab={r.g.a} size={22}/><Badge ab={r.g.h} size={22}/></span>:<Badge ab={r.ab} size={26}/>}
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:600,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.type==='player'?r.name:r.type==='game'?`${r.g.a} @ ${r.g.h}`:`${city(r.ab)} ${nick(r.ab)}`}</div><div style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{r.type==='player'?`${r.team} · ${r.pos||'player'}${r.p!=null?` · ${r.p}P`:''}`:r.type==='game'?(r.g.st==='live'?`live · ${r.g.per} ${r.g.clk}`:r.g.st.startsWith('final')?`final · ${r.g.as}–${r.g.hs}`:r.g.start||'upcoming'):'team'}</div></div>
        <Tag>{r.type}</Tag></button>))}</div>
    </div>
  </div>);
}

/* first-visit onboarding — pick favourite teams, persisted to localStorage (no account needed) */
function Onboarding({favs,onDone}){
  const [sel,setSel]=useState(()=>favs.slice());
  const teams=useMemo(()=>[...BC.ABBR].sort((a,b)=>city(a).localeCompare(city(b))),[]);
  const tog=ab=>setSel(s=>s.includes(ab)?s.filter(x=>x!==ab):[...s,ab]);
  return(<div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(8,9,12,.55)',backdropFilter:'blur(4px)',display:'flex',justifyContent:'center',alignItems:'flex-start',padding:'6vh 16px',overflowY:'auto'}}>
    <div style={{width:'min(620px,96vw)',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:18,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.4)'}}>
      <div style={{padding:'22px 24px 16px',borderBottom:`1px solid ${T.line}`}}>
        <div style={{fontFamily:MONO,fontSize:11,letterSpacing:'.16em',textTransform:'uppercase',color:T.red,marginBottom:8}}>Welcome</div>
        <div style={{fontFamily:SERIF,fontSize:26,color:T.ink,letterSpacing:'-.01em'}}>Follow your teams</div>
        <div style={{fontSize:14,color:T.mut,marginTop:6,lineHeight:1.5,maxWidth:460}}>Pick the clubs you care about and we’ll surface their games, news and schedule first. Change anytime with the ★ on any team.</div>
      </div>
      <div style={{padding:'16px 24px',maxHeight:'44vh',overflowY:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
          {teams.map(ab=>{const on=sel.includes(ab);return <button key={ab} onClick={()=>tog(ab)} aria-pressed={on} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:10,cursor:'pointer',textAlign:'left',fontFamily:'inherit',background:on?`${col(ab)}1a`:T.bg,border:`1.5px solid ${on?col(ab):T.line}`,transition:'background .12s, border-color .12s'}}>
            <Badge ab={ab} size={24}/><span style={{flex:1,minWidth:0,fontSize:13,fontWeight:on?700:500,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{city(ab)}</span>
            {on&&<span style={{color:col(ab),fontSize:13,flexShrink:0}}>✓</span>}
          </button>;})}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'16px 24px',borderTop:`1px solid ${T.line}`,flexWrap:'wrap'}}>
        <button onClick={()=>onDone(null)} style={{fontFamily:'inherit',background:'none',border:'none',color:T.mut,fontSize:13,cursor:'pointer',fontWeight:600}}>Skip for now</button>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontFamily:MONO,fontSize:11.5,color:T.faint}}>{sel.length} selected</span>
          <button onClick={()=>onDone(sel)} style={{fontFamily:'inherit',background:T.invBg,color:T.invFg,border:'none',borderRadius:10,padding:'11px 20px',fontWeight:700,fontSize:14,cursor:'pointer'}}>{sel.length?`Follow ${sel.length} team${sel.length>1?'s':''}`:'Get started'}</button>
        </div>
      </div>
    </div>
  </div>);
}
const NAV=['Highlights','News','Scores','Standings','Teams','Players','Stats','Hockey IQ','Playoffs','Draft','Records'];
const NK={'Highlights':'highlights','News':'news','Scores':'scores','Standings':'standings','Teams':'teams','Players':'players','Stats':'stats','Hockey IQ':'iq','Playoffs':'playoffs','Draft':'draft','Records':'records'};
/* priority+ nav: fits as many tabs inline as the width allows, the rest collapse into a "More" menu */
function PriorityNav({active,onGo}){
  const GAP=2, MOREW=92;
  const wrapRef=useRef(null), measRef=useRef(null);
  const [vis,setVis]=useState(NAV.length);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const wrap=wrapRef.current, meas=measRef.current; if(!wrap||!meas) return;
    const compute=()=>{
      const avail=wrap.clientWidth; if(!avail) return;
      const ws=[...meas.children].map(el=>el.getBoundingClientRect().width);
      const sumAll=ws.reduce((a,b)=>a+b,0)+GAP*Math.max(0,ws.length-1);
      if(sumAll<=avail+0.5){ setVis(NAV.length); return; }
      let t=0,c=0;
      for(let i=0;i<ws.length;i++){ const add=ws[i]+(c>0?GAP:0); if(t+add<=avail-MOREW){ t+=add; c++; } else break; }
      setVis(Math.max(1,c));
    };
    compute();
    let ro; try{ro=new ResizeObserver(compute); ro.observe(wrap);}catch(e){}
    window.addEventListener('resize',compute);
    return ()=>{ro&&ro.disconnect(); window.removeEventListener('resize',compute);};
  },[]);
  useEffect(()=>{
    if(!open) return;
    const onDoc=e=>{ if(!wrapRef.current||!wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey=e=>{ if(e.key==='Escape') setOpen(false); };
    document.addEventListener('mousedown',onDoc); document.addEventListener('keydown',onKey);
    return ()=>{document.removeEventListener('mousedown',onDoc); document.removeEventListener('keydown',onKey);};
  },[open]);
  const btn=on=>({fontFamily:'inherit',background:on?T.invBg:'none',color:on?T.invFg:T.mut,border:'none',fontWeight:600,fontSize:13.5,padding:'6px 12px',borderRadius:8,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0});
  const visItems=NAV.slice(0,vis), overflow=NAV.slice(vis), overflowActive=overflow.some(n=>NK[n]===active);
  return(<nav ref={wrapRef} className="ed-nav" style={{display:'flex',gap:GAP,flex:1,minWidth:0,alignItems:'center',position:'relative'}}>
    <div ref={measRef} aria-hidden="true" style={{position:'absolute',left:0,top:0,height:0,overflow:'hidden',display:'flex',gap:GAP,visibility:'hidden',pointerEvents:'none'}}>
      {NAV.map(n=><button key={n} tabIndex={-1} style={btn(false)}>{n}</button>)}
    </div>
    {visItems.map(n=>{const on=NK[n]===active;return <button key={n} onClick={()=>onGo(NK[n])} style={btn(on)}>{n}</button>;})}
    {overflow.length>0&&<div style={{position:'relative',flexShrink:0}}>
      <button onClick={()=>setOpen(o=>!o)} aria-haspopup="true" aria-expanded={open} style={{...btn(overflowActive),display:'inline-flex',alignItems:'center',gap:5,position:'relative'}}>More
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform:open?'rotate(180deg)':'none',transition:'transform .15s'}}><path d="m6 9 6 6 6-6"/></svg>
        {overflowActive&&<span style={{width:5,height:5,borderRadius:99,background:T.red,position:'absolute',top:3,right:3}}/>}
      </button>
      {open&&<div role="menu" style={{position:'absolute',top:'calc(100% + 8px)',right:0,minWidth:184,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:12,boxShadow:'0 16px 44px -14px rgba(0,0,0,.32)',padding:6,zIndex:50,display:'flex',flexDirection:'column',gap:2}}>
        {overflow.map(n=>{const on=NK[n]===active;return <button key={n} role="menuitem" onClick={()=>{onGo(NK[n]);setOpen(false);}} style={{fontFamily:'inherit',textAlign:'left',background:on?T.invBg:'none',color:on?T.invFg:T.ink,border:'none',fontWeight:600,fontSize:14,padding:'9px 12px',borderRadius:8,cursor:'pointer',whiteSpace:'nowrap'}}>{n}</button>;})}
      </div>}
    </div>}
  </nav>);
}
/* error boundary — a render error in any one page falls back here instead of blanking the whole shell */
class EB extends React.Component{
  constructor(p){super(p);this.state={err:false};}
  static getDerivedStateFromError(){return {err:true};}
  componentDidCatch(err,info){try{console.error('Route render error:',err,info&&info.componentStack);}catch(e){}}
  componentDidUpdate(prev){if(prev.routeKey!==this.props.routeKey&&this.state.err)this.setState({err:false});}
  render(){
    if(this.state.err)return(<div style={{...card,padding:'44px 24px',textAlign:'center',maxWidth:520,margin:'30px auto'}}>
      <div style={{fontFamily:SERIF,fontSize:25,color:T.ink,marginBottom:8}}>This view hit a snag</div>
      <div style={{fontSize:14,color:T.mut,lineHeight:1.55,marginBottom:20}}>Something went wrong rendering this page. The rest of the app is unaffected — head back and try another section.</div>
      <button onClick={()=>{this.setState({err:false});this.props.onReset&&this.props.onReset();}} style={{fontFamily:'inherit',background:T.invBg,color:T.invFg,border:'none',borderRadius:9,padding:'10px 18px',fontWeight:600,fontSize:13.5,cursor:'pointer'}}>← Back to Highlights</button>
    </div>);
    return this.props.children;
  }
}
function App(){
  const [offset,setOffset]=useState(0);
  const [season,setSeason]=useState('cur'); // 'cur' = league's current season; otherwise an 8-digit season id
  const [favs,setFavs]=useState(loadF);
  const [followOnly,setFollowOnly]=useState(false);
  const [pal,setPal]=useState(false);
  const [menu,setMenu]=useState(false);
  const [onboard,setOnboard]=useState(()=>{try{return !localStorage.getItem('e_onboarded');}catch(e){return false;}});
  const finishOnboard=sel=>{if(sel&&sel.length){setFavs(sel);saveF(sel);}try{localStorage.setItem('e_onboarded','1');}catch(e){}setOnboard(false);};
  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('e_theme')||'light';}catch(e){return 'light';}});
  const toggleTheme=()=>{const n=theme==='dark'?'light':'dark';window.E_applyTheme&&window.E_applyTheme(n);try{localStorage.setItem('e_theme',n);}catch(e){}setTheme(n);};
  useEffect(()=>{try{document.documentElement.setAttribute('data-theme',theme);}catch(e){}},[theme]);
  const [route,setRoute]=useState('highlights');
  const [game,setGame]=useState(null);const [team,setTeam]=useState(null);const [player,setPlayer]=useState(null);
  const [hv,setHv]=useState(0); // hydration version: bumps to re-render when live data lands
  const [toast,setToast]=useState(null);
  const [loading,setLoading]=useState(false);
  const [isLive,setIsLive]=useState(false); // true once live NHL feeds hydrate (flips the header badge)
  // booting = the very first live hydrate is still in flight. The front page (Highlights)
  // shows skeletons during this window instead of the mock data, so the user never sees
  // a flash of fake numbers before the real feed lands. Starts true only when a live
  // hydrate will actually be attempted; resolves false the moment hydrate settles (live
  // OR mock-fallback), so preview / a failed proxy degrade to real content, never a hang.
  const [booting,setBooting]=useState(!!(window.BC&&window.BC.hydrate));
  // Stable LEAGUE-current season id: the MAX season ever observed. Derived from the
  // active fetch season (NHL._season), but never shrinks when the user views a PAST
  // season — otherwise the dropdown would drop the current/newer years after switching.
  // LEAGUE-current season id. Track it ONLY while the user is viewing 'cur' (then
  // NHL._season is the real current). While viewing a PAST season we keep the cached
  // current, so the dropdown never loses the current/newer years and 'cur' always maps
  // to the real current season — not a hardcoded future/empty one or the last-picked past.
  const curIdRef=React.useRef(null);
  const _liveS=(window.NHL&&window.NHL._season)?String(window.NHL._season):null;
  if(season==='cur'&&_liveS&&/^\d{8}$/.test(_liveS))curIdRef.current=_liveS;
  const curId=curIdRef.current||_liveS||'20252026';
  const SEASONS=useMemo(()=>{const top=parseInt(curId.slice(0,4),10)||2025;const a=[];for(let y=top;y>=2010;y--)a.push(`${y}${y+1}`);return a;},[curId]);
  const seasonLabel=v=>v==='cur'?`${curId.slice(0,4)}\u2013${curId.slice(6,8)}`:`${v.slice(0,4)}\u2013${v.slice(6,8)}`;
  const changeSeason=v=>{ setSeason(v); const id=v==='cur'?curId:v; if(window.BC&&BC.LIVE&&BC.hydrateSeason){ setLoading(true); BC.hydrateSeason(id,()=>{setHv(x=>x+1);setLoading(false);}); } window.scrollTo(0,0); };
  const [legalDoc,setLegalDoc]=useState('terms');
  const [statusF,setStatusF]=useState('all');
  const games=useMemo(()=>slate(offset),[offset,hv]);
  // On-demand live slate fetch: scrubbing the Scores calendar past the pre-fetched
  // ±2-day window (or deep-linking an older game) pulls that day's real games.
  useEffect(()=>{ if(window.BC&&BC.ensureSlate){ for(let o=offset-1;o<=offset+1;o++) BC.ensureSlate(o,()=>setHv(v=>v+1)); } },[offset,hv]);
  const toggleFav=ab=>setFavs(f=>{const n=f.includes(ab)?f.filter(x=>x!==ab):[...f,ab];saveF(n);return n;});
  const isFav=g=>favs.includes(g.a)||favs.includes(g.h);
  const baseGames=followOnly?games.filter(isFav):games;
  const stN={live:baseGames.filter(g=>g.st==='live').length,final:baseGames.filter(g=>g.st.startsWith('final')).length,pre:baseGames.filter(g=>g.st==='pre').length};
  const shown=statusF==='all'?baseGames:baseGames.filter(g=>statusF==='live'?g.st==='live':statusF==='final'?g.st.startsWith('final'):g.st==='pre');
  const go=r=>{setRoute(r);setGame(null);setTeam(null);setPlayer(null);setMenu(false);window.scrollTo(0,0);if(window.location.hash.slice(1)!==r)window.location.hash=r;};
  const openTeam=ab=>{setTeam(ab);setPlayer(null);setGame(null);setMenu(false);window.scrollTo(0,0);window.location.hash='team/'+ab;};
  const openPlayer=p=>{setPlayer(p);setTeam(null);setGame(null);setMenu(false);window.scrollTo(0,0);if(p&&p.id)window.location.hash='player/'+p.id;};
  const findGame=id=>{for(let o=-5;o<=9;o++){const g=slate(o).find(x=>String(x.id)===String(id));if(g)return g;}return null;};
  const openGame=g=>{setGame(g);setTeam(null);setPlayer(null);setMenu(false);window.scrollTo(0,0);if(g&&g.id!=null)window.location.hash='game/'+g.id;};
  // deep-linking: parse hash on load + back/forward
  useEffect(()=>{
    const apply=()=>{const h=window.location.hash.slice(1);if(!h){return;}
      const [k,arg]=h.split('/');
      if(k==='team'&&arg){setTeam(arg);setPlayer(null);setGame(null);}
      else if(k==='player'&&arg){const p=(BC.allPlayers||[]).find(x=>String(x.id)===arg)||(BC.goalies||[]).find(x=>String(x.id)===arg);if(p){setPlayer(p.gp!=null&&p.svp?{...p,type:'goalie'}:p);setTeam(null);setGame(null);}}
      else if(k==='game'&&arg){const g=findGame(arg);if(g){setGame(g);setTeam(null);setPlayer(null);}
        else if(window.BC&&BC.ensureSlate){ for(let o=-7;o<=9;o++) BC.ensureSlate(o,()=>{ const gg=findGame(arg); if(gg){setGame(gg);setTeam(null);setPlayer(null);} }); }}
      else if(k==='legal'){setLegalDoc(arg||'terms');setRoute('legal');setTeam(null);setPlayer(null);setGame(null);}
      else if(NK[Object.keys(NK).find(n=>NK[n]===k)]||['highlights','news','scores','standings','teams','players','stats','iq','draft','records','playoffs'].includes(k)){setRoute(k);setTeam(null);setPlayer(null);setGame(null);}
    };
    apply(); window.addEventListener('hashchange',apply); return()=>window.removeEventListener('hashchange',apply);
  },[]);
  useEffect(()=>{const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setPal(p=>!p);}if(e.key==='Escape')setPal(false);};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[]);
  useEffect(()=>{ let stop=()=>{}; if(window.BC&&BC.hydrate){ setLoading(true); const off=BC.onError&&BC.onError(m=>setToast(m)); BC.hydrate(()=>setHv(v=>v+1)).then(live=>{ setLoading(false); setBooting(false); if(live){ setIsLive(true); stop=BC.startPolling(()=>setHv(v=>v+1)); } }).catch(()=>{setLoading(false);setBooting(false);}); return ()=>{stop();off&&off();}; } },[]);
  const live=games.filter(g=>g.st==='live').length;

  let content;
  if(game)content=<GameDetail g={game} onBack={()=>setGame(null)} onTeam={openTeam}/>;
  else if(player)content=<P.PlayerDetailPage p={player} onBack={()=>setPlayer(null)} onTeam={openTeam} onPlayer={openPlayer}/>;
  else if(team)content=<P.TeamDetailPage ab={team} onBack={()=>setTeam(null)} onPlayer={openPlayer} onGame={openGame}/>;
  else if(route==='highlights')content=<P.HighlightsPage games={games} favs={favs} booting={booting} onGame={openGame} onTeam={openTeam} onPlayer={openPlayer} onGo={go}/>;
  else if(route==='news')content=<P.NewsPage favs={favs} onTeam={openTeam} onGame={openGame} onPlayer={openPlayer} onGo={go}/>;
  else if(route==='standings')content=<P.StandingsPage onTeam={openTeam}/>;
  else if(route==='teams')content=<P.TeamsPage onTeam={openTeam}/>;
  else if(route==='players')content=<P.PlayersPage onPlayer={openPlayer}/>;
  else if(route==='stats')content=<P.StatsPage onPlayer={openPlayer} onTeam={openTeam}/>;
  else if(route==='iq')content=<P.HockeyIQPage onPlayer={openPlayer} onTeam={openTeam}/>;
  else if(route==='draft')content=<P.DraftPage onTeam={openTeam}/>;
  else if(route==='playoffs')content=<P.PlayoffsPage onTeam={openTeam}/>;
  else if(route==='legal')content=<P.LegalPage doc={legalDoc} onGo={go}/>;
  else if(route==='records')content=<P.RecordsPage onTeam={openTeam}/>;
  else content=(<div>
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16,marginBottom:24,flexWrap:'wrap'}}>
      <div><div style={{fontFamily:MONO,fontSize:11,letterSpacing:'.16em',textTransform:'uppercase',color:T.red,display:'inline-flex',alignItems:'center',gap:7}}>{live>0&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red}}/>}Scoreboard{live>0?` · ${live} live`:''}</div>
        <h1 style={{fontSize:38,fontWeight:600,letterSpacing:'-.03em',margin:'6px 0 0'}}>{offset===0?<>Tonight<span style={{fontFamily:SERIF,fontStyle:'italic',fontWeight:500}}>.</span></>:dateLabel(offset)}</h1></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button onClick={()=>setFollowOnly(f=>!f)} style={{fontFamily:'inherit',display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:999,border:`1px solid ${followOnly?T.red:T.line2}`,background:followOnly?'#fdecea':T.paper,color:followOnly?T.red:T.mut,fontWeight:600,fontSize:12.5,cursor:'pointer'}}>★ Following{favs.length?` · ${favs.length}`:''}</button>
        <div style={{display:'flex',gap:3,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:10,padding:3}}>{[['‹',-1],['Today',0],['›',1]].map(([t,o])=><button key={t} onClick={()=>o===0?setOffset(0):setOffset(v=>v+o)} style={{fontFamily:'inherit',fontSize:13,fontWeight:600,padding:'5px 11px',borderRadius:7,background:(t==='Today'&&offset===0)?T.invBg:'transparent',color:(t==='Today'&&offset===0)?T.invFg:T.mut,border:'none',cursor:'pointer'}}>{t}</button>)}</div>
      </div>
    </div>
    <SchedCal offset={offset} setOffset={setOffset} favs={favs} view="week"/>
    {offset===0&&games.length>0&&<NationalTV/>}
    <div style={{display:'flex',gap:6,margin:'4px 0 16px',flexWrap:'wrap'}}>
      {[['all','All',baseGames.length],['live','Live',stN.live],['final','Final',stN.final],['pre','Upcoming',stN.pre]].map(([k,lab,n])=><button key={k} onClick={()=>setStatusF(k)} style={{fontFamily:MONO,fontSize:11,letterSpacing:'.04em',textTransform:'uppercase',padding:'6px 13px',borderRadius:999,border:`1px solid ${statusF===k?T.invBg:T.line2}`,background:statusF===k?T.invBg:'transparent',color:statusF===k?T.invFg:T.mut,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}>{k==='live'&&n>0&&<span className="ed-pulse" style={{width:5,height:5,borderRadius:99,background:statusF===k?T.invFg:T.red,display:'inline-block'}}/>}{lab}<span style={{opacity:.55}}>{n}</span></button>)}
    </div>
    {loading&&shown.length===0?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>{Array.from({length:6},(_,i)=><div key={i} style={{...card,padding:'14px 16px'}}><div className="ed-skel" style={{height:12,width:'40%',marginBottom:14}}/><div className="ed-skel" style={{height:18,width:'72%',marginBottom:9}}/><div className="ed-skel" style={{height:18,width:'64%'}}/></div>)}</div>
    :shown.length===0?<div style={{textAlign:'center',padding:'70px 0',color:T.mut,fontFamily:MONO,fontSize:13}}>{followOnly?'no followed teams play in this slate.':'no games scheduled.'}</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>{shown.map(g=><GameCard key={g.id} g={g} favs={favs} toggleFav={toggleFav} onOpen={openGame}/>)}</div>}
    <SchedCal offset={offset} setOffset={setOffset} favs={favs} view="month"/>
    <p style={{textAlign:'center',marginTop:30,fontFamily:MONO,fontSize:11.5,color:T.faint}}>scores update live · ⌘K to search · ★ a team to follow</p>
  </div>);

  return(<div style={{minHeight:'100vh',background:T.bg,color:T.ink}}>
    {loading&&<div style={{position:'fixed',top:0,left:0,right:0,height:2,zIndex:90,background:`linear-gradient(90deg,transparent,${T.red},transparent)`,backgroundSize:'40% 100%',animation:'edload 1s linear infinite'}}/>}
    {toast&&<div onClick={()=>setToast(null)} style={{position:'fixed',bottom:18,left:'50%',transform:'translateX(-50%)',zIndex:90,background:T.invBg,color:T.invFg,fontSize:13,padding:'10px 16px',borderRadius:10,boxShadow:'0 8px 30px rgba(0,0,0,.25)',cursor:'pointer',fontFamily:MONO}}>{toast} · tap to dismiss</div>}
    <header style={{position:'sticky',top:0,zIndex:40,background:T.glass,backdropFilter:'blur(10px)',borderBottom:`1px solid ${T.line}`}}>
      <div style={{maxWidth:1600,margin:'0 auto',padding:'0 24px',height:58,display:'flex',alignItems:'center',gap:14}}>
        <div onClick={()=>go('highlights')} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',flexShrink:0}}><span style={{width:28,height:28,borderRadius:7,background:T.invBg,color:T.invFg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>H</span><span style={{fontWeight:700,whiteSpace:'nowrap'}}>The Hockey Lab</span></div>
        <a href="The Hockey Lab - Landing.html" title="Lab home" aria-label="Lab home" style={{color:T.faint,fontSize:17,textDecoration:'none'}}>⌂</a>
        <span className="ed-demo" title={isLive?"Live NHL feeds connected — updating in real time":"Projected/sample data for demo — live NHL feeds fill in on deploy"} style={{fontFamily:MONO,fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:isLive?'#1a8a4f':T.mut,background:T.bg,border:`1px solid ${isLive?'#1a8a4f55':T.line2}`,borderRadius:999,padding:'3px 8px',flexShrink:0,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:5}}>{isLive&&<span className="ed-pulse" style={{width:5,height:5,borderRadius:99,background:'#1a8a4f',display:'inline-block'}}/>}{isLive?'live · NHL':'demo data'}</span>
        <PriorityNav active={(!team&&!player&&!game)?route:null} onGo={go}/>
        {route!=='standings'&&<select value={season} onChange={e=>changeSeason(e.target.value)} aria-label="Season" title={isLive?'Pick a season \u2014 historical standings, stats, rosters & leaders':'Historical seasons load when live NHL feeds are connected'} className="ed-season" style={{fontFamily:MONO,fontSize:12,fontWeight:600,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,padding:'7px 8px',color:T.ink,cursor:'pointer',flexShrink:0,maxWidth:130}}>
          <option value="cur">{seasonLabel('cur')}</option>
          {SEASONS.slice(1).map(s=><option key={s} value={s}>{seasonLabel(s)}</option>)}
        </select>}
        <button onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark" style={{fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:9,background:T.paper,border:`1px solid ${T.line2}`,color:T.mut,cursor:'pointer',flexShrink:0}}>
          {theme==='dark'
            ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>
            :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/></svg>}
        </button>
        <button onClick={()=>setPal(true)} aria-label="Search" style={{fontFamily:'inherit',display:'flex',alignItems:'center',gap:8,padding:'7px 11px',borderRadius:9,background:T.paper,border:`1px solid ${T.line2}`,color:T.mut,fontSize:12.5,cursor:'pointer'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><span className="ed-searchlabel">Search</span><kbd className="ed-kbd" style={{fontFamily:MONO,fontSize:10.5,padding:'1px 5px',borderRadius:4,background:T.bg}}>⌘K</kbd></button>
        <button className="ed-burger" onClick={()=>setMenu(true)} aria-label="Menu" style={{display:'none',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,width:38,height:38,alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </header>
    {season!=='cur'&&<div style={{maxWidth:1080,margin:'0 auto',padding:'12px 24px 0'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,flexWrap:'wrap',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:11,padding:'10px 14px'}}>
        <span style={{fontFamily:MONO,fontSize:10.5,letterSpacing:'.07em',textTransform:'uppercase',color:T.invFg,background:T.invBg,borderRadius:999,padding:'4px 9px',flexShrink:0}}>{seasonLabel(season)} season</span>
        <span style={{fontSize:12.5,color:T.mut,flex:1,minWidth:180}}>Historical standings, stats, rosters &amp; leaders.{!isLive&&' Live data loads on deploy.'} EDGE tracking reflects the current season only — league-wide tracking began 2021–22. The scoreboard stays on today.</span>
        <button onClick={()=>changeSeason('cur')} style={{fontFamily:'inherit',fontSize:12,fontWeight:600,color:T.invFg,background:T.invBg,border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer',flexShrink:0}}>Back to current</button>
      </div>
    </div>}
    {menu&&<div onClick={()=>setMenu(false)} style={{position:'fixed',inset:0,zIndex:60,background:'rgba(20,21,26,.4)',backdropFilter:'blur(2px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:0,right:0,bottom:0,width:'min(280px,80vw)',background:T.paper,borderLeft:`1px solid ${T.line2}`,padding:'18px',display:'flex',flexDirection:'column',gap:6,boxShadow:'-12px 0 40px rgba(0,0,0,.12)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><span style={{...ML}}>Menu</span><button onClick={()=>setMenu(false)} aria-label="Close" style={{background:'none',border:'none',fontSize:22,color:T.mut,cursor:'pointer',lineHeight:1}}>×</button></div>
        {NAV.map(n=>{const k=NK[n];const on=route===k&&!team&&!player&&!game;return <button key={n} onClick={()=>go(k)} style={{fontFamily:'inherit',textAlign:'left',background:on?T.invBg:'none',color:on?T.invFg:T.ink,border:'none',fontWeight:600,fontSize:16,padding:'12px 14px',borderRadius:10,cursor:'pointer'}}>{n}</button>;})}
        <div style={{marginTop:8,paddingTop:12,borderTop:`1px solid ${T.line}`}}>
          <label style={{...ML,display:'block',marginBottom:6}}>Season</label>
          <select value={season} onChange={e=>{changeSeason(e.target.value);}} aria-label="Season" style={{fontFamily:MONO,fontSize:14,fontWeight:600,background:T.bg,border:`1px solid ${T.line2}`,borderRadius:10,padding:'11px 12px',color:T.ink,cursor:'pointer',width:'100%'}}>
            <option value="cur">{seasonLabel('cur')}</option>
            {SEASONS.slice(1).map(s=><option key={s} value={s}>{seasonLabel(s)}</option>)}
          </select>
        </div>
        <button onClick={()=>{setMenu(false);setPal(true);}} style={{fontFamily:'inherit',textAlign:'left',marginTop:8,display:'flex',alignItems:'center',gap:10,background:T.bg,color:T.mut,border:`1px solid ${T.line2}`,fontWeight:600,fontSize:15,padding:'12px 14px',borderRadius:10,cursor:'pointer'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>Search</button>
        <a href="The Hockey Lab - Landing.html" style={{textAlign:'left',marginTop:4,color:T.faint,fontFamily:MONO,fontSize:12,textDecoration:'none',padding:'8px 14px'}}>⌂ Lab home</a>
      </div>
    </div>}
    <main id="main" tabIndex={-1} style={{maxWidth:1080,margin:'0 auto',padding:'30px 24px 50px',outline:'none'}}><EB key={'season-'+season} routeKey={route+'|'+(team||'')+'|'+(player&&player.id||'')+'|'+(game&&game.id||'')} onReset={()=>go('highlights')}>{content}</EB></main>
    <footer style={{borderTop:`1px solid ${T.line}`,marginTop:20}}>
      <div style={{maxWidth:1080,margin:'0 auto',padding:'26px 24px 36px'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:14}}><span style={{width:24,height:24,borderRadius:6,background:T.invBg,color:T.invFg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>H</span><span style={{fontWeight:700,fontSize:14}}>The Hockey Lab</span></div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px 20px',marginBottom:16}}>
          {window.E_FOOTER_LINKS.map(([k,label])=><button key={k} onClick={()=>go('legal/'+k)} className="el" style={{background:'none',border:'none',padding:0,cursor:'pointer',fontFamily:MONO,fontSize:12,color:T.mut}}>{label}</button>)}
        </div>
        <div style={{fontFamily:MONO,fontSize:11,color:T.faint,lineHeight:1.7}}>© 2026 The Hockey Lab · Independent project — not affiliated with the NHL · Data via public NHL APIs · news via Google News &amp; Reddit · all sources linked, not affiliated</div>
      </div>
    </footer>
    <Palette open={pal} onClose={()=>setPal(false)} onTeam={openTeam} onPlayer={openPlayer} onGame={openGame}/>
    {onboard&&<Onboarding favs={favs} onDone={finishOnboard}/>}
  </div>);
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
