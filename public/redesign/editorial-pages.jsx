/* The Hockey Lab — Editorial theme · pages (Standings/Teams/Players/Stats/IQ + detail) */
const { useState: uS, useMemo: uM } = React;
const D = window.BC;
// Shared live-overlay hook: render `mock` immediately, then (only when deployed,
// i.e. BC.LIVE) call fetchLive() and swap in the mapped result if it resolves
// truthy. Any failure → stay on mock. Matches the shot-map live/sample pattern.
window.E_useLive = function(mock, fetchLive, deps){
  const [val,setVal] = React.useState(mock);
  const depRef = React.useRef(deps);
  // If deps changed since the last commit, `val` still holds the PREVIOUS inputs'
  // result (useState's initializer only runs on mount). Return the fresh `mock`
  // synchronously this render so we never serve a stale / cross-shaped object
  // (e.g. a skater's edge while now rendering a goalie). The effect then syncs val.
  const dprev = depRef.current, dnow = deps||[];
  const depsChanged = !dprev || dprev.length!==dnow.length || dnow.some((d,i)=>d!==dprev[i]);
  React.useEffect(()=>{ depRef.current = deps; let alive=true; setVal(mock);
    if(window.NHL && window.BC && window.BC.LIVE && typeof fetchLive==='function'){
      Promise.resolve().then(fetchLive).then(live=>{ if(alive && live) setVal(live); }).catch(()=>{});
    }
    return ()=>{ alive=false; };
  // eslint-disable-next-line
  }, deps);
  return depsChanged ? mock : val;
};
const c2=D.col, nk=D.nick, ct=D.city;
const LIGHT={mode:'light',ink:'#15161b',mut:'#62636a',faint:'#9b9ca3',line:'#e6e4de',line2:'#dad8d0',red:'#e5341f',paper:'#fff',bg:'#f5f4f0',glass:'rgba(245,244,240,.85)',invBg:'#15161b',invFg:'#fff',posBg:'#e7f5ec',posFg:'#1a8a4f',negBg:'#fdecea',negFg:'#c0392b',goldBg:'#fdf6e6',goldFg:'#9a6b1a',goldLine:'#f0e2c0'};
const DARK={mode:'dark',ink:'#ecedf0',mut:'#b4b6bf',faint:'#8a8c96',line:'#2a2c33',line2:'#3b3d46',red:'#ff5a45',paper:'#1c1d23',bg:'#141519',glass:'rgba(18,19,23,.82)',invBg:'#33343d',invFg:'#f3f3f5',posBg:'rgba(34,170,95,.18)',posFg:'#54d98c',negBg:'rgba(255,90,69,.16)',negFg:'#ff7d6d',goldBg:'rgba(202,150,70,.18)',goldFg:'#d8af68',goldLine:'rgba(202,150,70,.34)'};
const T={...LIGHT};
try{if(localStorage.getItem('e_theme')==='dark')Object.assign(T,DARK);}catch(e){}
window.E_applyTheme=m=>{Object.assign(T,m==='dark'?DARK:LIGHT);};
const MONO="'Geist Mono',monospace";
const SERIF="'Newsreader',serif";
const card={get background(){return T.paper;},get border(){return '1px solid '+T.line;},borderRadius:14};

function Eyebrow({children}){return <div style={{fontFamily:MONO,fontSize:11,letterSpacing:'.16em',textTransform:'uppercase',color:T.red}}>{children}</div>;}
function PageHead({k,t,serif,right}){return(
  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:14,flexWrap:'wrap',marginBottom:24}}>
    <div><Eyebrow>{k}</Eyebrow><h1 style={{fontSize:38,fontWeight:600,letterSpacing:'-.03em',margin:'6px 0 0',color:T.ink}}>{t} {serif&&<span style={{fontFamily:SERIF,fontStyle:'italic',fontWeight:500}}>{serif}</span>}</h1></div>
    {right}
  </div>);}
function Badge({ab,size=28}){return <span style={{width:size,height:size,borderRadius:Math.round(size*0.28),background:c2(ab),display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*0.34,color:'#fff',flexShrink:0}}>{ab}</span>;}
function PlayerAvatar({pos,team,size=42,name}){const cc=c2(team);const isG=pos==='G';
  const parts=(name||'').trim().split(/\s+/).filter(Boolean);
  const glyph=parts.length>=2?(parts[0][0]+parts[parts.length-1][0]):parts.length===1?parts[0].slice(0,2):(pos||'·');
  return(<span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}>
    <span style={{width:size,height:size,borderRadius:isG?'50%':Math.round(size*0.28),background:cc,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',color:'#fff',fontWeight:700,fontSize:Math.round(size*0.4),letterSpacing:'-.02em',lineHeight:1}}>{(glyph||'').toUpperCase()}</span>
    <span style={{position:'absolute',right:-4,bottom:-4,fontFamily:MONO,fontSize:Math.max(7,Math.round(size*0.2)),fontWeight:700,background:T.paper,color:cc,border:`1px solid ${cc}44`,borderRadius:5,padding:'0 3px',lineHeight:1.5}}>{pos||'·'}</span>
  </span>);}
function Spark({data,color,w=54,h=16}){if(!data||!data.length)return null;const mx=Math.max(...data),mn=Math.min(...data);const p=data.map((v,i)=>`${(i/(data.length-1)*w).toFixed(1)},${(h-(v-mn)/Math.max(1,mx-mn)*h).toFixed(1)}`).join(' ');return <svg width={w} height={h}><polyline points={p} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function Pill({on,children,...p}){return <button {...p} style={{fontFamily:'inherit',padding:'6px 13px',borderRadius:999,border:`1px solid ${on?T.invBg:T.line2}`,background:on?T.invBg:T.paper,color:on?T.invFg:T.ink,fontWeight:600,fontSize:12.5,cursor:'pointer'}}>{children}</button>;}
const ML={fontFamily:MONO,fontSize:10.5,letterSpacing:'.06em',textTransform:'uppercase',get color(){return T.faint;}};

/* ---------- STANDINGS ---------- */
function StandingsPage({onTeam}){
  const [v,setV]=uS('League');
  const curSeasonId=(window.NHL&&window.NHL._season)?String(window.NHL._season):((window.BC&&window.BC._seasonId)||'20252026');
  const seasonList=uM(()=>{const sy=+String(curSeasonId).slice(0,4);return Array.from({length:6},(_,i)=>{const a=sy-i;return String(a)+String(a+1);});},[curSeasonId]);
  const [season,setSeason]=uS(curSeasonId);
  const [,forceSeason]=uS(0);
  const onSeason=e=>{const s=e.target.value;setSeason(s);if(window.BC&&window.BC.hydrateSeason)window.BC.hydrateSeason(s,()=>forceSeason(x=>x+1));};
  const seasSel={fontFamily:MONO,fontSize:12,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'6px 9px',color:T.ink,cursor:'pointer'};
  const [sortK,setSortK]=uS(null);const [sortDir,setSortDir]=uS('desc');
  const views=['League','Wild Card','Atlantic','Metro','Central','Pacific'];
  const baseRows=uM(()=>v==='League'?D.STANDINGS:D.STANDINGS.filter(t=>t.div===v),[v]);
  const sval=(t,k)=>k==='strk'?(t.strk[0]==='W'?1:t.strk[0]==='L'?-1:0)*(parseInt(t.strk.slice(1),10)||0):k==='last10'?(parseInt(t.last10,10)||0):t[k];
  const rows=uM(()=>{if(!sortK)return baseRows;const r=[...baseRows].sort((a,b)=>{const x=sval(a,sortK),y=sval(b,sortK);return sortDir==='desc'?y-x:x-y;});return r;},[baseRows,sortK,sortDir]);
  const sortBy=k=>{if(sortK===k){setSortDir(d=>d==='desc'?'asc':'desc');}else{setSortK(k);setSortDir(k==='l'||k==='ga'?'asc':'desc');}};
  const cut=v==='League'?16:8;
  const confDivs={East:['Atlantic','Metro'],West:['Central','Pacific']};
  const wildCard=conf=>{
    const byDiv=confDivs[conf].map(d=>({d,teams:D.STANDINGS.filter(t=>t.div===d).slice(0,3)}));
    const top3=new Set(byDiv.flatMap(x=>x.teams.map(t=>t.ab)));
    return {byDiv,wc:D.STANDINGS.filter(t=>t.conf===conf&&!top3.has(t.ab))};
  };
  // playoff status per team: 'clinch' = division top 3, 'wc' = one of two wild-card spots
  const pstatus=uM(()=>{const s={};['East','West'].forEach(conf=>{const{byDiv,wc}=wildCard(conf);byDiv.forEach(x=>x.teams.forEach(t=>{s[t.ab]='clinch';}));wc.slice(0,2).forEach(t=>{s[t.ab]='wc';});});return s;},[]);
  const Mark=({ab})=>{const st=pstatus[ab];if(!st)return null;
    if(st==='clinch')return <span title="Clinched playoff position — division top 3" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:17,height:17,borderRadius:5,background:T.posBg,flexShrink:0}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.posFg} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>;
    return <span title="Wild card spot" style={{fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:'.04em',color:T.goldFg,background:T.goldBg,border:`1px solid ${T.goldLine}`,borderRadius:5,padding:'1px 4px',flexShrink:0}}>WC</span>;};
  const WCRow=({t,seed,playoff})=>(<div onClick={()=>onTeam(t.ab)} className="er" style={{display:'grid',gridTemplateColumns:'30px 1fr auto auto',alignItems:'center',gap:10,padding:'9px 14px',borderTop:`1px solid ${T.line}`,cursor:'pointer'}}>
    <span style={{fontFamily:MONO,fontSize:11.5,color:playoff?'#1a8a4f':T.faint,fontWeight:playoff?700:400}}>{seed}</span>
    <span style={{display:'inline-flex',alignItems:'center',gap:9,minWidth:0}}><Badge ab={t.ab} size={22}/><span style={{color:T.ink,fontWeight:600,fontSize:13.5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct(t.ab)} {nk(t.ab)}</span>{playoff&&<Mark ab={t.ab}/>}</span>
    <span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{t.w}-{t.l}-{t.otl}</span>
    <span style={{fontWeight:700,fontSize:14,minWidth:28,textAlign:'right'}}>{t.pts}</span>
  </div>);
  const WCSection=({label,sub,children})=><div style={{...card,overflow:'hidden'}}>
    <div style={{padding:'11px 14px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={ML}>{label}</span>{sub&&<span style={{fontFamily:MONO,fontSize:10,color:T.faint}}>{sub}</span>}</div>
    {children}</div>;
  return(<div>
    <PageHead k="Standings" t={v==='Wild Card'?'Wild Card':'League'} serif={v==='Wild Card'?'race':'table'} right={<div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}><select value={season} onChange={onSeason} style={seasSel} title="Season">{seasonList.map(s=><option key={s} value={s}>{s.slice(0,4)}-{s.slice(6,8)}</option>)}</select>{views.map(x=><Pill key={x} on={v===x} onClick={()=>setV(x)}>{x}</Pill>)}</div>}/>
    {v==='Wild Card'?
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}} className="g2">
        {['East','West'].map(conf=>{const{byDiv,wc}=wildCard(conf);return(<div key={conf} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{...ML,fontSize:12,color:T.ink,letterSpacing:'.1em'}}>{conf==='East'?'Eastern':'Western'} Conference</div>
          {byDiv.map(({d,teams})=><WCSection key={d} label={d} sub="top 3">{teams.map((t,i)=><WCRow key={t.ab} t={t} seed={i+1} playoff/>)}</WCSection>)}
          <WCSection label="Wild Card" sub="2 spots">
            {wc.map((t,i)=><React.Fragment key={t.ab}><WCRow t={t} seed={i<2?`WC${i+1}`:i+1} playoff={i<2}/>{i===1&&<div style={{borderTop:`1.5px dashed ${T.red}`,opacity:.5,padding:'2px 14px',fontFamily:MONO,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:T.red,textAlign:'center'}}>playoff cut line</div>}</React.Fragment>)}
          </WCSection>
        </div>);})}
        <style>{`@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`}</style>
      </div>
    :<>
    <div style={{...card,overflow:'hidden'}}>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:740,borderCollapse:'collapse',fontSize:13.5}}>
        <thead><tr style={ML}>{[['#',null],['Team',null],['GP','gp'],['W','w'],['L','l'],['OT','otl'],['PTS','pts'],['GF','gf'],['GA','ga'],['DIFF','diff'],['L10','last10'],['STRK','strk'],['Trend',null]].map(([h,k],i)=><th key={h} onClick={k?()=>sortBy(k):undefined} style={{padding:'12px 10px',textAlign:i<2?'left':'center',fontWeight:600,...ML,cursor:k?'pointer':'default',color:sortK===k&&k?T.ink:undefined,whiteSpace:'nowrap'}}>{h}{sortK===k&&k?(sortDir==='desc'?' ↓':' ↑'):''}</th>)}</tr></thead>
        <tbody>{rows.map((t,i)=>(<React.Fragment key={t.ab}>
          <tr onClick={()=>onTeam(t.ab)} className="er" style={{cursor:'pointer',borderTop:`1px solid ${T.line}`}}>
            <td style={{padding:'11px 10px',color:T.faint,fontFamily:MONO}}>{String(i+1).padStart(2,'0')}</td>
            <td style={{padding:'11px 10px'}}><span style={{display:'inline-flex',alignItems:'center',gap:9}}><Badge ab={t.ab} size={24}/><span style={{color:T.ink,fontWeight:600}}>{ct(t.ab)} {nk(t.ab)}</span><Mark ab={t.ab}/></span></td>
            <td style={{textAlign:'center',color:T.mut}}>{t.gp}</td><td style={{textAlign:'center'}}>{t.w}</td><td style={{textAlign:'center'}}>{t.l}</td><td style={{textAlign:'center'}}>{t.otl}</td>
            <td style={{textAlign:'center',fontWeight:700}}>{t.pts}</td><td style={{textAlign:'center',color:T.mut}}>{t.gf}</td><td style={{textAlign:'center',color:T.mut}}>{t.ga}</td>
            <td style={{textAlign:'center',color:t.diff>=0?'#1a8a4f':T.red,fontWeight:600}}>{t.diff>=0?'+':''}{t.diff}</td>
            <td style={{textAlign:'center',color:T.mut,fontFamily:MONO,fontSize:12}}>{t.last10}</td>
            <td style={{textAlign:'center',fontWeight:700,color:t.strk[0]==='W'?'#1a8a4f':t.strk[0]==='L'?T.red:T.faint,fontFamily:MONO,fontSize:12}}>{t.strk}</td>
            <td style={{textAlign:'center'}}><span style={{display:'inline-block'}}><Spark data={t.trend} color={t.diff>=0?'#1a8a4f':T.red} w={42} h={13}/></span></td>
          </tr>
          {!sortK&&cut===i+1&&<tr><td colSpan={13} style={{borderTop:`1.5px dashed ${T.red}`,opacity:.5,padding:'2px 10px',fontFamily:MONO,fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',color:T.red,textAlign:'center'}}>playoff cut line</td></tr>}
        </React.Fragment>))}</tbody>
      </table></div>
    </div>
    {v==='League'&&<div style={{display:'flex',gap:18,marginTop:12,fontFamily:MONO,fontSize:11,color:T.mut,flexWrap:'wrap'}}>
      <span style={{display:'inline-flex',alignItems:'center',gap:7}}><Mark ab={D.STANDINGS[0].ab}/>clinched playoff spot (division top 3)</span>
      <span style={{display:'inline-flex',alignItems:'center',gap:7}}><span style={{fontFamily:MONO,fontSize:9,fontWeight:700,color:T.goldFg,background:T.goldBg,border:`1px solid ${T.goldLine}`,borderRadius:5,padding:'1px 4px'}}>WC</span>wild card</span>
    </div>}
    </>}
  </div>);
}

/* ---------- TEAMS ---------- */
function TeamsPage({onTeam}){
  const [conf,setConf]=uS('All'); const [q,setQ]=uS('');
  const DIVS=['Atlantic','Metro','Central','Pacific'];
  const matchScope=t=>conf==='All'||t.conf===conf||t.div===conf;
  const rows=uM(()=>D.STANDINGS.filter(t=>matchScope(t)&&`${ct(t.ab)} ${nk(t.ab)} ${t.ab}`.toLowerCase().includes(q.toLowerCase())),[conf,q]);
  return(<div>
    <PageHead k="Teams" t="All 32" serif="clubs" right={<div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" style={{fontFamily:'inherit',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,padding:'7px 12px',color:T.ink,fontSize:13,outline:'none'}}/>
      {['All','East','West',...DIVS].map(x=><Pill key={x} on={conf===x} onClick={()=>setConf(x)}>{x}</Pill>)}</div>}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(248px,1fr))',gap:14}}>
      {rows.map(t=>(<div key={t.ab} onClick={()=>onTeam(t.ab)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer'}}>
        <div style={{height:4,background:c2(t.ab)}}/>
        <div style={{padding:16}}>
          <div style={{display:'flex',alignItems:'center',gap:11}}><Badge ab={t.ab} size={40}/><div><div style={{fontWeight:600,color:T.ink}}>{ct(t.ab)}</div><div style={{fontSize:13,color:T.mut}}>{nk(t.ab)}</div></div></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:13,borderTop:`1px solid ${T.line}`,fontFamily:MONO,fontSize:11.5,color:T.mut}}>
            <span>#{D.rankOf[t.ab]} · {t.div}</span><span style={{color:T.ink,fontWeight:500}}>{t.w}-{t.l}-{t.otl}</span></div>
        </div>
      </div>))}
    </div>
  </div>);
}

/* ---------- TEAM SCHEDULE (week strip + team month calendar) ---------- */
const ED_WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ED_MO=['January','February','March','April','May','June','July','August','September','October','November','December'];
function TeamSchedule({ab,onGame}){
  const today=uM(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const [mAnchor,setMAnchor]=uS(0);
  const dOf=o=>{const d=new Date(today);d.setDate(d.getDate()+o);return d;};
  const offOf=d=>Math.round((d-today)/86400000);
  // overlay the real full-season schedule when deployed (mock slate fallback otherwise)
  const liveSched=window.E_useLive(null,()=>window.NHL.clubScheduleMapped(ab),[ab]);
  const liveByDate=uM(()=>{const m={};(liveSched||[]).forEach(g=>{m[g._date]=g;});return m;},[liveSched]);
  const ymdK=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const gameOn=o=>{const k=ymdK(dOf(o));return liveByDate[k]||D.slate(o).find(g=>g.a===ab||g.h===ab);};
  const open=g=>{if(g)onGame(g);};
  const WeekCell=({o})=>{const d=dOf(o),g=gameOn(o),isT=o===0;const home=g&&g.h===ab,opp=g?(home?g.a:g.h):null;
    const final=g&&g.st.startsWith('final');const won=final&&((home&&g.hs>g.as)||(!home&&g.as>g.hs));
    return(<div onClick={()=>open(g)} className={g?'er':''} style={{cursor:g?'pointer':'default',background:g?`${c2(ab)}10`:T.paper,border:`1px solid ${g?c2(ab)+'44':T.line}`,borderRadius:11,padding:'10px 11px',height:92,display:'flex',flexDirection:'column',gap:5,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><span style={{fontFamily:MONO,fontSize:10,letterSpacing:'.05em',textTransform:'uppercase',color:isT?T.red:T.faint}}>{ED_WD[d.getDay()]}</span><span style={{fontWeight:700,fontSize:16}}>{d.getDate()}</span></div>
      {g?<div style={{marginTop:'auto'}}><div style={{display:'flex',alignItems:'center',gap:5}}><span style={{fontFamily:MONO,fontSize:9.5,color:T.faint}}>{home?'vs':'@'}</span><Badge ab={opp} size={17}/><span style={{fontFamily:MONO,fontSize:11.5,fontWeight:600}}>{opp}</span></div><div style={{fontFamily:MONO,fontSize:10,color:final?(won?'#1a8a4f':T.red):T.mut,marginTop:2}}>{final?`${won?'W':'L'} ${home?g.hs:g.as}–${home?g.as:g.hs}`:(g.start||'')}</div></div>:<span style={{fontFamily:MONO,fontSize:10.5,color:T.faint,marginTop:'auto'}}>no game</span>}
    </div>);};
  const base=dOf(mAnchor),y=base.getFullYear(),m=base.getMonth();
  const lead=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let dd=1;dd<=days;dd++)cells.push(offOf(new Date(y,m,dd)));
  const monthGames=cells.filter(o=>o!==null&&gameOn(o)).length;
  const goMonth=delta=>setMAnchor(offOf(new Date(y,m+delta,1)));
  const curMonthOff=offOf(new Date(y,m,1));
  const monthOpts=uM(()=>{const b=new Date(today.getFullYear(),today.getMonth(),1);const arr=[];for(let i=-3;i<=9;i++){const d=new Date(b.getFullYear(),b.getMonth()+i,1);arr.push({off:offOf(d),label:`${ED_MO[d.getMonth()]} ${d.getFullYear()}`});}return arr;},[]);
  const navBtn={fontFamily:'inherit',fontSize:14,fontWeight:600,width:30,height:30,borderRadius:8,background:T.paper,border:`1px solid ${T.line2}`,color:T.mut,cursor:'pointer'};
  const selSty={fontFamily:MONO,fontSize:11.5,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'6px 8px',color:T.ink,cursor:'pointer'};
  const MCell=({o})=>{const d=dOf(o),g=gameOn(o),cur=o===0,isT=o===0;const home=g&&g.h===ab,opp=g?(home?g.a:g.h):null;
    const final=g&&g.st.startsWith('final');const won=final&&((home&&g.hs>g.as)||(!home&&g.as>g.hs));
    return(<div onClick={()=>open(g)} className={g?'er':''} style={{cursor:g?'pointer':'default',background:g?`${c2(ab)}12`:T.paper,color:T.ink,border:`1px solid ${g?c2(ab)+'55':T.line}`,borderRadius:8,padding:'6px 7px',height:60,display:'flex',flexDirection:'column',justifyContent:'space-between',overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontWeight:700,fontSize:12,color:isT?T.red:T.ink}}>{d.getDate()}</span>{g&&<span style={{fontFamily:MONO,fontSize:8.5,color:T.faint}}>{home?'VS':'@'}</span>}</div>
      {g?<div style={{display:'flex',alignItems:'center',gap:4}}><Badge ab={opp} size={15}/><span style={{fontFamily:MONO,fontSize:10.5,fontWeight:600}}>{opp}</span>{final&&<span style={{fontFamily:MONO,fontSize:9,fontWeight:700,color:won?'#1a8a4f':T.faint}}>{won?'W':'L'}</span>}</div>:<span style={{color:T.line2,fontSize:11}}>·</span>}
    </div>);};
  return(<div>
    <div style={{...card,padding:'16px 18px',marginBottom:16}}>
      <div style={{...ML,marginBottom:12}}>This week</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>{Array.from({length:7},(_,i)=><WeekCell key={i} o={(0-dOf(0).getDay())+i}/>)}</div>
    </div>
    <div style={{...card,padding:'16px 18px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:12,flexWrap:'wrap'}}>
        <select value={curMonthOff} onChange={e=>setMAnchor(+e.target.value)} style={selSty}>{monthOpts.map(o=><option key={o.off} value={o.off}>{o.label}</option>)}</select>
        <div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{monthGames} games</span><div style={{display:'flex',gap:6}}><button onClick={()=>goMonth(-1)} style={navBtn} aria-label="Previous month">‹</button><button onClick={()=>goMonth(1)} style={navBtn} aria-label="Next month">›</button></div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>{ED_WD.map(w=><div key={w} style={{...ML,fontSize:9,textAlign:'center',paddingBottom:2}}>{w[0]}</div>)}{cells.map((o,i)=>o===null?<div key={i}/>:<MCell key={i} o={o}/>)}</div>
      <div style={{fontFamily:MONO,fontSize:10.5,color:T.faint,marginTop:12}}>vs = home · @ = away · W/L shows finals · tap a game to open it</div>
    </div>
  </div>);
}

/* ---------- TEAM DETAIL ---------- */
function Tabs({tabs,active,onChange}){return(<div className="ed-tabscroll" style={{display:'flex',gap:24,borderBottom:`1px solid ${T.line}`,marginBottom:20,overflowX:'auto',scrollbarWidth:'none'}}>
  {tabs.map(t=><button key={t} onClick={()=>onChange(t)} style={{fontFamily:'inherit',background:'none',border:'none',borderBottom:`2px solid ${active===t?T.ink:'transparent'}`,color:active===t?T.ink:T.mut,fontWeight:600,fontSize:14,padding:'10px 0',marginBottom:-1,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>{t}</button>)}</div>);}
function RankChip({rank}){if(!rank)return null;const tone=rank<=5?[T.posBg,T.posFg]:rank>=26?[T.negBg,T.negFg]:[T.bg,T.faint];return <span style={{fontFamily:MONO,fontSize:10.5,fontWeight:600,padding:'1px 6px',borderRadius:5,background:tone[0],color:tone[1]}}>#{rank}</span>;}
function Metric({l,v,suf,rank}){return <div style={{border:`1px solid ${T.line}`,borderRadius:11,padding:'13px 15px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={ML}>{l}</div><RankChip rank={rank}/></div><div style={{fontSize:23,fontWeight:600,color:T.ink,marginTop:3,letterSpacing:'-.02em'}}>{v}{suf||''}</div></div>;}

function TeamStatsTab({ab}){
  const [sub,setSub]=uS('Highlights'); const ts=D.teamStatsFull(ab); const roster=D.teamRoster(ab).slice(0,5);
  const Panel=({title,children})=><div style={{border:`1px solid ${T.line}`,borderRadius:12,padding:16}}><div style={ML}>{title}</div><div style={{marginTop:12}}>{children}</div></div>;
  return(<div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{['Highlights','Offense','Defense','Special Teams','Advanced'].map(s=><Pill key={s} on={sub===s} onClick={()=>setSub(s)}>{s}</Pill>)}</div>
    {sub==='Highlights'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:16}}>
        <Metric l="Goals / game" v={ts.gfPg} rank={ts.ranks.gf}/><Metric l="GA / game" v={ts.gaPg} rank={ts.ranks.ga}/><Metric l="Power play" v={ts.pp} suf="%" rank={ts.ranks.pp}/>
        <Metric l="Penalty kill" v={ts.pk} suf="%" rank={ts.ranks.pk}/><Metric l="Faceoff %" v={ts.fo} suf="%" rank={ts.ranks.fo}/><Metric l="Point %" v={ts.ptPct} rank={ts.ranks.pt}/>
      </div>
      <Panel title="Top skaters"><div>{roster.map(p=><div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderTop:`1px solid ${T.line}`}}><Badge ab={p.team} size={20}/><span style={{flex:1,fontSize:13.5,color:T.ink}}>{p.name} <span style={{color:T.faint}}>{p.pos}</span></span><span style={{fontFamily:MONO,fontSize:12,color:T.mut}}><b style={{color:T.ink}}>{p.p}</b> P</span></div>)}</div></Panel>
    </div>}
    {sub==='Offense'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}><Metric l="Goals / game" v={ts.gfPg} rank={ts.ranks.gf}/><Metric l="Shots / game" v={ts.shotsFor}/><Metric l="Shooting %" v={ts.shPct} suf="%"/><Metric l="PP goals" v={ts.gfStr.pp}/></div>}
    {sub==='Defense'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}><Metric l="GA / game" v={ts.gaPg} rank={ts.ranks.ga}/><Metric l="Shots against" v={ts.shotsAgainst}/><Metric l="Team SV%" v={ts.svPct}/><Metric l="PK goals against" v={ts.gaStr.pp}/></div>}
    {sub==='Special Teams'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}><Metric l="Power play" v={ts.pp} suf="%" rank={ts.ranks.pp}/><Metric l="Penalty kill" v={ts.pk} suf="%" rank={ts.ranks.pk}/><Metric l="PP goals for" v={ts.gfStr.pp}/><Metric l="SH goals for" v={ts.gfStr.sh}/><Metric l="PP goals against" v={ts.gaStr.pp}/><Metric l="Faceoff %" v={ts.fo} suf="%" rank={ts.ranks.fo}/></div>}
    {sub==='Advanced'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}><Metric l="PDO" v={ts.pdo}/><Metric l="Point %" v={ts.ptPct} rank={ts.ranks.pt}/><Metric l="Shooting %" v={ts.shPct} suf="%"/><Metric l="Save %" v={ts.svPct}/><Metric l="Shots for" v={ts.shotsFor}/><Metric l="Shots against" v={ts.shotsAgainst}/></div>}
  </div>);
}
function MiniGame({g,onOpen}){const aw=g.st.startsWith('final')&&g.as>g.hs,hw=g.st.startsWith('final')&&g.hs>g.as;return(
  <div onClick={()=>onOpen&&onOpen(g)} className="er" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:`1px solid ${T.line}`,cursor:onOpen?'pointer':'default'}}>
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <span style={{display:'flex',alignItems:'center',gap:8}}><Badge ab={g.a} size={18}/><span style={{fontSize:13,fontWeight:aw?700:500}}>{ct(g.a)}</span></span>
      <span style={{display:'flex',alignItems:'center',gap:8}}><Badge ab={g.h} size={18}/><span style={{fontSize:13,fontWeight:hw?700:500}}>{ct(g.h)}</span></span></div>
    <div style={{textAlign:'right',fontFamily:MONO,fontSize:11.5,color:T.mut}}>{g.st.startsWith('final')?<span style={{color:T.ink,fontWeight:600}}>{g.as}–{g.hs}</span>:g.st==='live'?<span style={{color:T.red}}>LIVE</span>:g.start}</div>
  </div>);}

function TeamDetailPage({ab,onBack,onPlayer,onGame}){
  const [tab,setTab]=uS('Hub');
  const t=D.standBy(ab); const gap=D.wildCardGap(ab);
  // overlay the real full club roster (official roster endpoint) when deployed
  const roster=window.E_useLive(D.teamRoster(ab),()=>new Promise(res=>{window.BC.ensureRoster(ab,()=>res(window.BC.teamRoster(ab)));}),[ab]);
  const schedMock=uM(()=>D.teamSchedule(ab),[ab]);
  // overlay real Last/Next game from the full-season schedule when deployed
  const sched=window.E_useLive(schedMock,()=>window.NHL.teamRecUp(ab),[ab]);
  const prosMock=uM(()=>D.prospects(ab),[ab]);
  // overlay real club prospects when deployed
  const pros=window.E_useLive(prosMock,()=>window.NHL.prospectsMapped(ab),[ab]);
  const fwd=roster.filter(p=>p.pos!=='D'&&p.pos!=='G'),def=roster.filter(p=>p.pos==='D');const tg=D.goalies.filter(g=>g.team===ab);
  const Stat=({l,v})=><div style={{...card,padding:'15px 16px'}}><div style={ML}>{l}</div><div style={{fontSize:26,fontWeight:600,color:T.ink,marginTop:4,letterSpacing:'-.02em'}}>{v}</div></div>;
  const RT=({title,rows,cols})=>rows.length?<div style={{marginBottom:18}}><div style={{...ML,marginBottom:8}}>{title}</div><div style={{...card,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={ML}><th style={{padding:'9px 14px',textAlign:'left',fontWeight:600,...ML}}>Player</th>{cols.map(([h])=><th key={h} style={{padding:'9px',textAlign:'center',fontWeight:600,...ML}}>{h}</th>)}</tr></thead><tbody>{rows.map(p=><tr key={p.id} onClick={()=>onPlayer(p)} className="er" style={{cursor:'pointer',borderTop:`1px solid ${T.line}`}}><td style={{padding:'9px 14px',color:T.ink,fontWeight:500}}>{p.name} <span style={{color:T.faint,fontFamily:MONO,fontSize:11}}>#{p.num}</span></td>{cols.map(([h,k])=><td key={h} style={{textAlign:'center',color:k==='p'?T.ink:T.mut,fontWeight:k==='p'?700:400}}>{k==='pm'?(p[k]>=0?'+':'')+p[k]:p[k]}</td>)}</tr>)}</tbody></table></div></div>:null;
  const SC=[['Pos','pos'],['GP','gp'],['G','g'],['A','a'],['P','p'],['+/-','pm']],GC=[['GP','gp'],['W','w'],['L','l'],['SV%','svp'],['GAA','gaa']];
  return(<div>
    <button onClick={onBack} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:'0 0 18px'}}>← back to teams</button>
    <div style={{...card,padding:0,overflow:'hidden',marginBottom:16}}>
      <div style={{height:5,background:c2(ab)}}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'24px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}><Badge ab={ab} size={56}/>
          <div><h1 style={{fontSize:30,fontWeight:600,letterSpacing:'-.02em',color:T.ink}}>{ct(ab)} {nk(ab)}</h1><div style={{fontFamily:MONO,fontSize:12,color:T.mut,marginTop:3}}>{t.div} division · {t.conf==='East'?'eastern':'western'} conference</div></div></div>
        {gap&&<div style={{border:`1px solid ${T.line2}`,borderRadius:11,padding:'10px 14px'}}><div style={ML}>Wild-card gap</div><div style={{fontSize:17,fontWeight:700,color:gap.inField?'#1a8a4f':T.red}}>{gap.gap>=0?'+':''}{gap.gap} <span style={{fontFamily:MONO,fontSize:11,fontWeight:400,color:T.mut}}>{gap.inField?'in field':'outside'}</span></div></div>}
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:16}}>
      <Stat l="Record" v={`${t.w}-${t.l}-${t.otl}`}/><Stat l="League rank" v={`#${D.rankOf[ab]}`}/><Stat l="Goal diff" v={`${t.diff>=0?'+':''}${t.diff}`}/><Stat l="Last 10" v={t.last10}/>
    </div>
    <Tabs tabs={['Hub','Stats','Shot zones','Schedule','Roster','Prospects','Records']} active={tab} onChange={setTab}/>
    {tab==='Hub'&&(()=>{
      const news=D.teamNews(ab);
      const NACC={pos:'#1a8a4f',neg:T.red,gold:'#b5762a',edge:'#1a8a4f',brand:c2(ab),mut:T.faint};
      const GameHero=({label,g,emptyMsg})=>{ if(!g)return(<div style={{...card,padding:'16px 18px'}}><div style={ML}>{label}</div><div style={{fontFamily:MONO,fontSize:12,color:T.mut,marginTop:10}}>{emptyMsg||'None scheduled'}</div></div>);
        const final=g.st.startsWith('final');const home=g.h===ab;const us=home?g.hs:g.as,them=home?g.as:g.hs;const won=final&&us>them;const winAb=final?(g.as>g.hs?g.a:g.h):null;
        return(<div onClick={()=>onGame(g)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer'}}>
          <div style={{padding:'11px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.line}`}}>
            <span style={ML}>{label}</span>
            <span style={{fontFamily:MONO,fontSize:11,color:final?(won?'#1a8a4f':T.red):'#1a8a4f',fontWeight:600}}>{final?`${won?'W':'L'} ${us}–${them}`:(g.start||'Upcoming')}</span></div>
          <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
            {[[g.a,g.as],[g.h,g.hs]].map(([tm,sc])=>(<div key={tm} style={{display:'flex',alignItems:'center',gap:10}}>
              <Badge ab={tm} size={26}/><span style={{flex:1,fontWeight:tm===ab?700:500,color:tm===ab?T.ink:T.mut,fontSize:14}}>{ct(tm)} {nk(tm)}</span>
              {final?<span style={{fontFamily:MONO,fontWeight:tm===winAb?700:400,fontSize:16,color:tm===winAb?T.ink:T.faint}}>{sc}</span>
                :<span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{D.standBy(tm).w}-{D.standBy(tm).l}-{D.standBy(tm).otl}</span>}
            </div>))}
          </div>
        </div>);};
      const NewsCard=({c})=>{const click=c.kind==='player'?()=>onPlayer(c.ref):c.kind==='game'?()=>onGame(c.ref):()=>setTab(c.ref);
        return(<div onClick={click} className="ec" style={{...card,padding:'16px 17px',cursor:'pointer'}}>
          <div style={{fontFamily:MONO,fontSize:10.5,letterSpacing:'.12em',textTransform:'uppercase',color:NACC[c.accent]||T.red}}>{c.tag}</div>
          <div style={{fontFamily:SERIF,fontSize:18,lineHeight:1.25,color:T.ink,margin:'7px 0 5px'}}>{c.headline}</div>
          <div style={{fontSize:12.5,color:T.mut}}>{c.sub}</div>
        </div>);};
      return(<div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}} className="g2">
          <GameHero label="Last game" g={sched.rec[0]}/><GameHero label="Next game" g={sched.up[0]} emptyMsg={(sched.rec&&sched.rec.length)?'Season complete':'None scheduled'}/>
        </div>
        <div style={{...ML,marginBottom:10}}>{ct(ab)} headlines</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:18}}>
          {news.map((c,i)=><NewsCard key={i} c={c}/>)}
        </div>
        {(()=>{const ti=D.teamTitles(ab);const Banner=({label,years,tone,bg,bd})=>years.length>0&&(<div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 15px',borderRadius:12,background:bg,border:`1px solid ${bd}`,flex:'1 1 230px',minWidth:0}}>
            <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:30,lineHeight:1,color:tone,fontWeight:600,flexShrink:0}}>{years.length}</span>
            <div style={{minWidth:0}}><div style={{fontWeight:700,color:tone,fontSize:14}}>{label}{years.length>1?'s':''}</div><div style={{fontFamily:MONO,fontSize:11,color:tone,opacity:.8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{years.join(' · ')}</div></div>
          </div>);
          const has=ti.stanleyCups.length||ti.presidents.length;
          return(<div style={{...card,padding:'16px 18px'}}>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><Eyebrow>Banners &amp; honors</Eyebrow><span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{ti.playoffApps} playoff appearances{ti.lastCup?` · last Cup ${ti.lastCup}`:''}</span></div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
              <Banner label="Stanley Cup" years={ti.stanleyCups} tone="#7a5c12" bg="linear-gradient(135deg,#f6efd8,#fbf7ea)" bd="#e8dcb4"/>
              <Banner label="Presidents' Trophy" years={ti.presidents} tone="#1f5f8a" bg="#eef4f9" bd="#cfe0ee"/>
              <Banner label="Conference title" years={ti.conference} tone={T.ink} bg={T.bg} bd={T.line2}/>
              <Banner label="Division title" years={ti.division} tone={T.mut} bg={T.bg} bd={T.line2}/>
              {!has&&<div style={{fontFamily:MONO,fontSize:12,color:T.mut,padding:'6px 0'}}>No Stanley Cups or Presidents' Trophies on record yet.</div>}
            </div>
          </div>);})()}
      </div>);})()}
    {tab==='Stats'&&<TeamStatsTab ab={ab}/>}
    {tab==='Shot zones'&&window.E_ShotZones&&<window.E_ShotZones scope="team" id={ab} teamAb={ab} name={`${ct(ab)} ${nk(ab)}`}/>}
    {tab==='Schedule'&&<TeamSchedule ab={ab} onGame={onGame}/>}
    {tab==='Roster'&&<div><RT title="Forwards" rows={fwd} cols={SC}/><RT title="Defensemen" rows={def} cols={SC}/><RT title="Goalies" rows={tg} cols={GC}/></div>}
    {tab==='Prospects'&&<div>{[['Forwards',pros.forwards],['Defensemen',pros.defensemen],['Goalies',pros.goalies]].map(([lab,list])=><div key={lab} style={{marginBottom:18}}><div style={{...ML,marginBottom:8}}>{lab} · {list.length}</div><div style={{...card,overflow:'hidden'}}>{list.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:10,padding:'10px 16px',borderTop:i?`1px solid ${T.line}`:'none'}}><div><div style={{fontSize:13.5,fontWeight:500,color:T.ink}}>{p.name} <span style={{color:T.faint}}>{p.pos}</span></div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{p.league} · age {p.age} · {p.draftYr} R{p.round}</div></div><span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{p.gp} GP · {p.pts} P</span></div>)}</div></div>)}</div>}
    {tab==='Records'&&(()=>{const ti=D.teamTitles(ab);const rec=D.teamRecords(ab);
      const Big=({l,v})=><div style={{...card,padding:'15px 16px'}}><div style={ML}>{l}</div><div style={{fontSize:24,fontWeight:600,color:T.ink,marginTop:4,letterSpacing:'-.02em'}}>{v}</div></div>;
      const Rec=({rec})=>(<div style={{...card,padding:'15px 16px'}}>
        <div style={{...ML,fontSize:9.5}}>{rec.label}</div>
        <div style={{fontSize:30,fontWeight:600,color:T.ink,letterSpacing:'-.02em',margin:'4px 0 2px'}}>{rec.v}</div>
        <div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{rec.s||rec.d}</div>
      </div>);
      const Banner=({label,years,tone,bg,bd})=>years.length>0&&(<div style={{borderRadius:13,padding:'15px 17px',background:bg,border:`1px solid ${bd}`}}>
        <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:years.length>1?9:0}}>
          <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:34,lineHeight:1,color:tone,fontWeight:600}}>{years.length}</span>
          <div><div style={{fontWeight:700,color:tone,fontSize:15}}>{label}{years.length>1?'s':''}</div><div style={{fontFamily:MONO,fontSize:10,letterSpacing:'.06em',textTransform:'uppercase',color:tone,opacity:.7}}>{years.length>1?'championship years':'won'}</div></div>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{years.map(y=><span key={y} style={{fontFamily:MONO,fontSize:11.5,fontWeight:600,color:tone,background:T.mode==='dark'?'rgba(255,255,255,.08)':'rgba(255,255,255,.6)',border:`1px solid ${bd}`,borderRadius:6,padding:'2px 8px'}}>{y}</span>)}</div>
      </div>);
      const anyTitle=ti.stanleyCups.length||ti.presidents.length||ti.conference.length||ti.division.length;
      return(<div>
        <div style={{...ML,marginBottom:10}}>Championships &amp; banners</div>
        {anyTitle?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginBottom:18}}>
          <Banner label="Stanley Cup" years={ti.stanleyCups} tone="#7a5c12" bg="linear-gradient(135deg,#f6efd8,#fbf7ea)" bd="#e8dcb4"/>
          <Banner label="Presidents' Trophy" years={ti.presidents} tone="#1f5f8a" bg="#eef4f9" bd="#cfe0ee"/>
          <Banner label="Conference title" years={ti.conference} tone={T.ink} bg={T.bg} bd={T.line2}/>
          <Banner label="Division title" years={ti.division} tone={T.mut} bg={T.bg} bd={T.line2}/>
        </div>:<div style={{...card,padding:'15px 18px',marginBottom:18,fontFamily:MONO,fontSize:12,color:T.mut}}>No Stanley Cups or Presidents' Trophies on record yet.</div>}
        <div style={{...ML,marginBottom:10}}>Franchise career leaders</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {rec.career.map((c,i)=><div key={i} style={{...card,padding:'15px 16px'}}><div style={{...ML,fontSize:9.5}}>{c.cat}</div><div style={{fontSize:18,fontWeight:600,color:T.ink,marginTop:6}}>{c.rows[0]?c.rows[0].name:'—'}</div></div>)}
        </div>
      </div>);})()}
  </div>);
}

/* ---------- PLAYERS ---------- */
function PlayersPage({onPlayer}){
  const teams=uM(()=>[...D.ABBR].sort((a,b)=>ct(a).localeCompare(ct(b))),[]);
  const [team,setTeam]=uS(teams[0]); const [filter,setFilter]=uS('All'); const [q,setQ]=uS('');
  const ql=q.toLowerCase();
  // pull the real full roster for the selected team when deployed
  const liveRoster=window.E_useLive(D.teamRoster(team),()=>new Promise(res=>{window.BC.ensureRoster(team,()=>res(window.BC.teamRoster(team)));}),[team]);
  const roster=liveRoster.filter(p=>p.name.toLowerCase().includes(ql));
  const fwd=roster.filter(p=>p.pos!=='D'&&p.pos!=='G'), def=roster.filter(p=>p.pos==='D');
  const goalies=D.goalies.filter(g=>g.team===team&&g.name.toLowerCase().includes(ql)).map(g=>({...g,type:'goalie',pos:'G'}));
  const PC=({p})=>(<div onClick={()=>onPlayer(p)} className="ec" style={{...card,padding:'13px 15px',cursor:'pointer'}}>
    <div style={{display:'flex',alignItems:'center',gap:13}}><PlayerAvatar pos={p.pos} team={p.team} name={p.name} size={42}/>
      <div style={{flex:1}}><div style={{fontWeight:600,color:T.ink}}>{p.name}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{p.num?`#${p.num} · `:''}{p.pos}</div></div></div>
    <div style={{display:'flex',gap:16,marginTop:11,fontFamily:MONO,fontSize:12,color:T.mut}}>
      {p.type==='goalie'?<><span><b style={{color:T.ink}}>{p.svp}</b> SV%</span><span>{p.gaa} GAA</span><span>{p.w}-{p.l}</span><span>{p.gp} GP</span></>
        :<><span><b style={{color:T.ink}}>{p.p}</b> P</span><span>{p.g} G</span><span>{p.a} A</span><span>{p.gp} GP</span></>}</div>
  </div>);
  const Grp=({label,list})=>list.length?(<div style={{marginBottom:20}}><div style={{...ML,marginBottom:11}}>{label} · {list.length}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(228px,1fr))',gap:12}}>{list.map(p=><PC key={p.id} p={p}/>)}</div></div>):null;
  return(<div>
    <PageHead k="Players" t="Roster" serif="explorer"/>
    <div style={{...card,padding:16,marginBottom:20,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
      <select value={team} onChange={e=>setTeam(e.target.value)} style={{fontFamily:'inherit',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,padding:'8px 12px',color:T.ink,fontSize:13}}>{teams.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search roster" style={{fontFamily:'inherit',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,padding:'8px 12px',color:T.ink,fontSize:13,outline:'none',flex:1,minWidth:150}}/>
      {['All','Forwards','Defensemen','Goalies'].map(f=><Pill key={f} on={filter===f} onClick={()=>setFilter(f)}>{f}</Pill>)}
    </div>
    {(filter==='All'||filter==='Forwards')&&<Grp label="Forwards" list={fwd}/>}
    {(filter==='All'||filter==='Defensemen')&&<Grp label="Defensemen" list={def}/>}
    {(filter==='All'||filter==='Goalies')&&<Grp label="Goalies" list={goalies}/>}
  </div>);
}

/* ---------- PLAYER DETAIL ---------- */
function PlayerDetailPage({p,onBack,onTeam,onPlayer}){
  const isG=p.type==='goalie';
  const exMock=uM(()=>D.playerExtras(p),[p.id]);
  // overlay real career history / season totals / awards from player landing when live
  const ex=window.E_useLive(exMock,()=>window.NHL.playerCard(p.id).then(c=>c?{...exMock,...c}:null),[p.id]);
  const edgeMock=uM(()=>isG?D.goalieEdge(p):D.skaterEdge(p),[p.id]);
  // overlay real NHL EDGE tracking when deployed (partial → merged over mock)
  const edge=window.E_useLive(edgeMock,()=>(isG?window.NHL.edgeGoalieMapped(p.id):window.NHL.edgeSkaterMapped(p.id)).then(e=>e?{...edgeMock,...e}:null),[p.id]);
  const log=uM(()=>D.gameLog(p),[p.id]);
  const eglMock=uM(()=>(!isG&&D.edgeGameLog)?D.edgeGameLog(p):[],[p.id]);
  // overlay real game identity (date/opponent) + any live per-game EDGE from the game-log
  const egl=window.E_useLive(eglMock,()=>(!isG&&window.NHL&&window.NHL.edgeGameLog)?window.NHL.edgeGameLog(p.id).then(rows=>(rows&&rows.length)?eglMock.map((m,i)=>{const r=rows[i];return r?{...m,date:r.date||m.date,opp:r.opp||m.opp,home:r.home,topSpd:r.topSpd!=null?r.topSpd:m.topSpd,topShot:r.topShot!=null?r.topShot:m.topShot,dist:r.dist!=null?r.dist:m.dist,b20:r.b20!=null?r.b20:m.b20}:m;}):null):null,[p.id]);
  const Stat=({l,v})=><div style={{...card,padding:16,textAlign:'center'}}><div style={ML}>{l}</div><div style={{fontSize:30,fontWeight:600,color:T.ink,marginTop:4,letterSpacing:'-.02em'}}>{v}</div></div>;
  const Sec=({k,children})=><div style={{...card,overflow:'hidden',marginBottom:16}}><div style={{padding:'13px 18px',...ML,borderBottom:`1px solid ${T.line}`}}>{k}</div>{children}</div>;
  return(<div>
    <button onClick={onBack} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:'0 0 18px'}}>← back to players</button>
    <div style={{...card,padding:0,overflow:'hidden',marginBottom:16}}>
      <div style={{height:5,background:c2(p.team)}}/>
      <div style={{display:'flex',alignItems:'center',gap:18,padding:'24px'}}>
        <PlayerAvatar pos={p.pos} team={p.team} name={p.name} size={64}/>
        <div><h1 style={{fontSize:30,fontWeight:600,letterSpacing:'-.02em',color:T.ink}}>{p.name}</h1>
        <button onClick={()=>onTeam(p.team)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,color:T.mut,fontSize:13,padding:'4px 0'}}><Badge ab={p.team} size={20}/>{ct(p.team)} {nk(p.team)} · {p.pos}</button></div>
      </div>
    </div>
    {/* featured */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:12,marginBottom:16}}>
      {(isG?[['Record',`${p.w}-${p.l}`],['SV%',p.svp],['GAA',p.gaa],['SO',p.so]]:[['Points',p.p],['Goals',p.g],['Assists',p.a],['+/-',`${p.pm>=0?'+':''}${p.pm}`]]).map(([l,v])=><Stat key={l} l={l} v={v}/>)}
    </div>
    {/* honors & accolades */}
    {ex.honors.hasAny&&<div style={{...card,padding:'18px 20px',marginBottom:16}}>
      <Eyebrow>Honors &amp; accolades</Eyebrow>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
        {ex.honors.cups.length>0&&<div style={{display:'flex',alignItems:'center',gap:11,padding:'10px 14px',borderRadius:11,background:'linear-gradient(135deg,#f6efd8,#fbf7ea)',border:'1px solid #e8dcb4'}}>
          <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:20,color:'#7a5c12',fontWeight:600}}>{ex.honors.cups.length>1?`×${ex.honors.cups.length}`:'★'}</span><div><div style={{fontWeight:700,color:'#7a5c12',fontSize:14}}>Stanley Cup{ex.honors.cups.length>1?' champion':''}</div><div style={{fontFamily:MONO,fontSize:11,color:'#9a7c2a'}}>{ex.honors.cups.join(' · ')}</div></div>
        </div>}
        {ex.honors.trophies.map(t=><div key={t.name} style={{display:'flex',alignItems:'center',gap:11,padding:'10px 14px',borderRadius:11,background:T.bg,border:`1px solid ${T.line2}`}}>
          <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:20,color:T.red,fontWeight:600}}>{t.count>1?`×${t.count}`:'•'}</span>
          <div><div style={{fontWeight:600,color:T.ink,fontSize:14}}>{t.name} Trophy</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{t.desc} · {t.years.join(', ')}</div></div>
        </div>)}
        {ex.honors.allStar>0&&<div style={{display:'flex',alignItems:'center',gap:11,padding:'10px 14px',borderRadius:11,background:T.bg,border:`1px solid ${T.line2}`}}>
          <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:20,color:T.ink,fontWeight:600}}>×{ex.honors.allStar}</span>
          <div><div style={{fontWeight:600,color:T.ink,fontSize:14}}>All-Star selection{ex.honors.allStar>1?'s':''}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>career</div></div>
        </div>}
        {ex.honors.milestones.map((m,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:9,padding:'10px 14px',borderRadius:11,background:T.bg,border:`1px solid ${T.line2}`}}>
          <span style={{width:8,height:8,borderRadius:99,background:'#1a8a4f'}}/><span style={{fontWeight:600,color:T.ink,fontSize:13.5}}>{m.label}</span>
        </div>)}
      </div>
    </div>}
    {/* edge */}
    <div style={{...card,padding:20,marginBottom:16}}>
      <Eyebrow>NHL Edge · tracking detail</Eyebrow>
      <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>{(edge.seasons||[]).map(s=><span key={s} style={{fontFamily:MONO,fontSize:11,border:`1px solid ${T.line2}`,borderRadius:999,padding:'4px 10px',color:T.mut}}>{s}</span>)}</div>
      {isG?(<div style={{marginTop:16}}><div style={ML}>Save quality by danger</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,marginTop:10}}>{(edge.saveQ||[]).map(([l,v,pc,avg,sh])=><div key={l} style={{border:`1px solid ${T.line}`,borderRadius:11,padding:'13px 15px'}}><div style={ML}>{l}</div><div style={{fontSize:19,fontWeight:600,margin:'5px 0'}}>{v}</div><div style={{fontFamily:MONO,fontSize:11,color:T.faint}}>pct {pc} · avg {avg} · {sh} shots</div></div>)}</div></div>):(
        <div style={{marginTop:16}}><div style={ML}>Speed + distance</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:10}}>{(edge.speed||[]).map(([l,v,pc,avg])=><div key={l} style={{border:`1px solid ${T.line}`,borderRadius:11,padding:'13px 15px'}}><div style={ML}>{l}</div><div style={{fontSize:18,fontWeight:600,margin:'5px 0'}}>{v}</div><div style={{fontFamily:MONO,fontSize:11,color:T.faint}}>pct {pc} · league avg {avg}</div></div>)}</div>
        <div style={{...ML,marginTop:16}}>Zone time</div><div style={{marginTop:10}}>{(edge.zones||[]).map(([z,pct])=><div key={z} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}><span style={{width:90,fontSize:13,color:T.mut}}>{z}</span><div style={{flex:1,height:6,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:c2(p.team)}}/></div><span style={{width:44,textAlign:'right',fontWeight:600,fontFamily:MONO,fontSize:12}}>{pct}%</span></div>)}</div></div>
      )}
    </div>
    {!isG&&egl.length>0&&<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 18px',...ML,borderBottom:`1px solid ${T.line}`}}>NHL Edge · by game</div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:440,borderCollapse:'collapse',fontSize:13}}>
        <thead><tr>{['Game','Top speed','Top shot','Distance','20+ bursts'].map((h,i)=><th key={h} style={{padding:'9px 14px',textAlign:i?'center':'left',...ML,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
        <tbody>{egl.map((g,i)=><tr key={i} style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'8px 14px',whiteSpace:'nowrap'}}><span style={{color:T.faint,fontFamily:MONO,fontSize:11.5}}>{g.date}</span> <span style={{color:T.ink}}>{g.home?'vs':'@'} {g.opp}</span></td>
          <td style={{padding:'8px 14px',textAlign:'center',fontFamily:MONO,color:T.ink}}>{g.topSpd}<span style={{color:T.faint,fontSize:10}}> mph</span></td>
          <td style={{padding:'8px 14px',textAlign:'center',fontFamily:MONO,color:T.ink}}>{g.topShot}<span style={{color:T.faint,fontSize:10}}> mph</span></td>
          <td style={{padding:'8px 14px',textAlign:'center',fontFamily:MONO,color:T.ink}}>{g.dist}<span style={{color:T.faint,fontSize:10}}> mi</span></td>
          <td style={{padding:'8px 14px',textAlign:'center',fontFamily:MONO,fontWeight:600,color:T.ink}}>{g.b20}</td>
        </tr>)}</tbody>
      </table></div>
    </div>}
    {/* shot zones (NHL Edge season aggregate) */}
    {window.E_ShotZones&&<window.E_ShotZones scope={isG?'goalie':'skater'} id={p.id} teamAb={p.team} name={p.name}/>}
    {/* career + last5 */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}} className="g2">
      <div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 18px',...ML,borderBottom:`1px solid ${T.line}`}}>Career</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>{(isG?[['GP',ex.career.gp],['W',ex.career.w],['L',ex.career.l],['SO','—']]:[['GP',ex.career.gp],['G',ex.career.g],['A',ex.career.a],['P',ex.career.p]]).map(([l,v])=><div key={l} style={{padding:'14px',textAlign:'center'}}><div style={ML}>{l}</div><div style={{fontSize:22,fontWeight:600,marginTop:3}}>{v}</div></div>)}</div></div>
      <div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 18px',...ML,borderBottom:`1px solid ${T.line}`}}>Last 5</div>{ex.last5.map((row,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 18px',borderTop:i?`1px solid ${T.line}`:'none',fontSize:13}}><span style={{display:'inline-flex',alignItems:'center',gap:8,color:T.mut}}><span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{row.date}</span>{row.home?'vs':'@'} <Badge ab={row.opp} size={18}/></span><span style={{fontWeight:600,color:row.result[0]==='W'?'#1a8a4f':T.red}}>{row.result}</span><span style={{fontFamily:MONO,fontSize:12,color:T.mut}}>{row.p} P</span></div>)}</div>
    </div>
    {/* season history */}
    <Sec k="Season history"><div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:480,borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={ML}>{(isG?['Season','Team','GP','W','L','SV%','GAA']:['Season','Team','GP','G','A','P','+/-']).map((h,i)=><th key={h} style={{padding:'9px 14px',textAlign:i<2?'left':'center',fontWeight:600,...ML}}>{h}</th>)}</tr></thead><tbody>{ex.history.map((s,i)=><tr key={i} style={{borderTop:`1px solid ${T.line}`}}><td style={{padding:'9px 14px',color:T.ink,fontFamily:MONO,fontSize:12}}>{s.s}</td><td style={{padding:'9px 14px'}}><Badge ab={s.team} size={18}/></td>{(isG?['gp','w','l','svp','gaa']:['gp','g','a','p','pm']).map(k=><td key={k} style={{textAlign:'center',color:k==='p'?T.ink:T.mut,fontWeight:k==='p'?700:400}}>{k==='pm'?(s[k]>=0?'+':'')+s[k]:s[k]}</td>)}</tr>)}</tbody></table></div></Sec>
    {/* awards */}
    {ex.awards.length>0&&<Sec k="Awards"><div style={{display:'flex',flexWrap:'wrap',gap:8,padding:'14px 18px'}}>{ex.awards.map((a,i)=><span key={i} style={{fontFamily:MONO,fontSize:12,padding:'5px 11px',borderRadius:999,background:'#fdf6e6',color:'#9a6b1a',border:'1px solid #f0e2c0'}}>{a.name} · {a.yr}</span>)}</div></Sec>}
    {/* teammates */}
    <Sec k="Current teammates"><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))'}}>{ex.teammates.map((tm,i)=><div key={tm.id} onClick={()=>onPlayer&&onPlayer(tm)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',borderTop:`1px solid ${T.line}`,cursor:'pointer'}}><span style={{width:26,height:26,borderRadius:7,background:c2(tm.team),color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:MONO,fontSize:11,fontWeight:600}}>{tm.num}</span><span style={{flex:1,fontSize:13.5,color:T.ink}}>{tm.name}</span><span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{tm.pos} · {tm.p}P</span></div>)}</div></Sec>
    {/* game log */}
    {/* game log — full season w/ trend */}
    {(()=>{const slog=D.seasonLog(p);const pts=slog.map(r=>isG?(parseFloat(r.svp)||0):r.p);
      const cols=isG?['Date','Opp','Result','GA','SV','SA','SV%','TOI']:['Date','Opp','Result','G','A','P','SOG','TOI'];
      const sum=isG?null:slog.reduce((s,r)=>s+r.p,0);
      return(<Sec k={`Game log · ${slog.length} games${sum!=null?` · ${sum} pts`:''}`}>
        <div style={{padding:'12px 18px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',gap:12}}>
          <span style={{...ML,fontSize:9.5}}>{isG?'SV% by game':'Points by game'}</span>
          <span style={{flex:1}}><Spark data={pts.length?pts:[0,0]} color={c2(p.team)} w={320} h={26}/></span>
        </div>
        <div style={{overflowX:'auto',maxHeight:360,overflowY:'auto'}}><table style={{width:'100%',minWidth:520,borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={ML}>{cols.map((h,i)=><th key={h} style={{padding:'9px 14px',textAlign:i<3?'left':'center',fontWeight:600,...ML,position:'sticky',top:0,background:T.paper}}>{h}</th>)}</tr></thead>
        <tbody>{slog.map((row,i)=><tr key={i} style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'9px 14px',color:T.mut,fontFamily:MONO,fontSize:12}}>{row.date}</td>
          <td style={{padding:'9px 14px'}}><span style={{display:'inline-flex',alignItems:'center',gap:6,color:T.mut}}>{row.home?'vs':'@'} <Badge ab={row.opp} size={18}/></span></td>
          <td style={{padding:'9px 14px',fontWeight:600,color:row.result[0]==='W'?'#1a8a4f':T.red}}>{row.result}</td>
          {isG?<><td style={{textAlign:'center'}}>{row.ga}</td><td style={{textAlign:'center',color:T.mut}}>{row.sv}</td><td style={{textAlign:'center',color:T.mut}}>{row.sa}</td><td style={{textAlign:'center',fontWeight:700}}>{row.svp}</td></>
            :<><td style={{textAlign:'center'}}>{row.g}</td><td style={{textAlign:'center'}}>{row.a}</td><td style={{textAlign:'center',fontWeight:700}}>{row.p}</td><td style={{textAlign:'center',color:T.mut}}>{row.sog}</td></>}
          <td style={{textAlign:'center',color:T.mut,fontFamily:MONO,fontSize:12}}>{row.toi}</td></tr>)}</tbody></table></div>
      </Sec>);})()}
  </div>);
}

/* ---------- STATS ---------- */
function StatsTable({onPlayer}){
  const [scope,setScope]=uS('Skaters'); const isG=scope==='Goalies';
  const [posF,setPosF]=uS('All'); const [team,setTeam]=uS('All'); const [q,setQ]=uS('');
  const [sortK,setSortK]=uS('p'); const [dir,setDir]=uS('desc');
  const teamsAZ=uM(()=>[...D.ABBR].sort((a,b)=>ct(a).localeCompare(ct(b))),[]);
  const switchScope=s=>{setScope(s);setSortK(s==='Goalies'?'svp':'p');setDir('desc');setPosF('All');};
  const val=(p,k)=>k==='sh'?p.g/Math.max(1,p.sog):k==='ppg'?p.p/p.gp:k==='svp'?Number(p.svp):k==='gaa'?Number(p.gaa):p[k];
  const disp=(p,k)=>k==='sh'?(p.g/Math.max(1,p.sog)*100).toFixed(1):k==='ppg'?(p.p/p.gp).toFixed(2):k==='pm'?((p.pm>0?'+':'')+p.pm):k==='svp'?p.svp:k==='gaa'?p.gaa:p[k];
  const SC=[['GP','gp'],['G','g'],['A','a'],['P','p'],['+/-','pm'],['SOG','sog'],['SH%','sh'],['P/GP','ppg']];
  const GC=[['GP','gp'],['W','w'],['L','l'],['SV%','svp'],['GAA','gaa'],['SO','so']];
  const cols=isG?GC:SC;
  const rows=uM(()=>{
    let pool=isG?D.goalieLeaders():D.skaterLeaders('p');
    if(!isG)pool=pool.filter(p=>posF==='All'||(posF==='Defense'?p.pos==='D':p.pos!=='D'));
    if(team!=='All')pool=pool.filter(p=>p.team===team);
    const ql=q.trim().toLowerCase(); if(ql)pool=pool.filter(p=>p.name.toLowerCase().includes(ql));
    return [...pool].sort((a,b)=>{const x=val(a,sortK),y=val(b,sortK);return dir==='desc'?y-x:x-y;});
  },[scope,posF,team,q,sortK,dir]);
  const sortBy=k=>{if(sortK===k)setDir(d=>d==='desc'?'asc':'desc');else{setSortK(k);setDir('desc');}};
  const sel={fontFamily:MONO,fontSize:12,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'7px 9px',color:T.ink,cursor:'pointer'};
  return(<div>
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:14}}>
      <div style={{display:'flex',gap:6}}>{['Skaters','Goalies'].map(s=><Pill key={s} on={scope===s} onClick={()=>switchScope(s)}>{s}</Pill>)}</div>
      {!isG&&<div style={{display:'flex',gap:6}}>{['All','Forwards','Defense'].map(s=><Pill key={s} on={posF===s} onClick={()=>setPosF(s)}>{s}</Pill>)}</div>}
      <select value={team} onChange={e=>setTeam(e.target.value)} style={sel}><option value="All">All teams</option>{teamsAZ.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search player" style={{fontFamily:'inherit',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'7px 11px',color:T.ink,fontSize:13,outline:'none',marginLeft:'auto'}}/>
    </div>
    <div style={{...card,overflow:'hidden'}}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',minWidth:isG?620:780,borderCollapse:'collapse',fontSize:13.5}}>
          <thead><tr style={ML}>
            <th style={{padding:'11px 10px 11px 18px',textAlign:'left',fontWeight:600,...ML}}>#</th>
            <th style={{padding:'11px 10px',textAlign:'left',fontWeight:600,...ML}}>Player</th>
            {cols.map(([h,k])=><th key={k} onClick={()=>sortBy(k)} style={{padding:'11px 10px',textAlign:'center',fontWeight:600,...ML,cursor:'pointer',color:sortK===k?T.ink:undefined,whiteSpace:'nowrap'}}>{h}{sortK===k?(dir==='desc'?' ↓':' ↑'):''}</th>)}
          </tr></thead>
          <tbody>{rows.map((p,i)=>(<tr key={p.id} onClick={()=>onPlayer(isG?{...p,type:'goalie',pos:'G'}:p)} className="er" style={{cursor:'pointer',borderTop:`1px solid ${T.line}`}}>
            <td style={{padding:'9px 10px 9px 18px',color:T.faint,fontFamily:MONO,fontSize:12}}>{i+1}</td>
            <td style={{padding:'9px 10px'}}><span style={{display:'inline-flex',alignItems:'center',gap:9}}><Badge ab={p.team} size={22}/><span style={{color:T.ink,fontWeight:600,whiteSpace:'nowrap'}}>{p.name}</span><span style={{color:T.faint,fontFamily:MONO,fontSize:11}}>{isG?'G':p.pos}</span></span></td>
            {cols.map(([h,k])=><td key={k} style={{padding:'9px 10px',textAlign:'center',fontFamily:(k==='svp'||k==='gaa'||k==='ppg'||k==='sh')?MONO:'inherit',fontWeight:k===sortK?700:400,color:k===sortK?T.ink:T.mut}}>{disp(p,k)}</td>)}
          </tr>))}</tbody>
        </table>
      </div>
    </div>
    <div style={{fontFamily:MONO,fontSize:11,color:T.faint,marginTop:10}}>{rows.length} {isG?'goalies':'skaters'} · tap a column to sort · tap a row for the full player page</div>
  </div>);
}
function StatsCompare({onPlayer}){
  const [scope,setScope]=uS('Skaters'); const isG=scope==='Goalies';
  const sk=uM(()=>D.skaterLeaders('p'),[]); const go=uM(()=>D.goalieLeaders(),[]);
  const pool=isG?go:sk;
  const [aId,setAId]=uS(sk[0].id); const [bId,setBId]=uS(sk[1].id);
  const switchScope=s=>{const p=s==='Goalies'?go:sk;setScope(s);setAId(p[0].id);setBId(p[1].id);};
  const A=pool.find(p=>p.id===aId)||pool[0]; const B=pool.find(p=>p.id===bId)||pool[1];
  const SM=[['Games','gp',1],['Goals','g',1],['Assists','a',1],['Points','p',1],['+/-','pm',1],['Shots','sog',1],['Shooting %','sh',1],['Points / GP','ppg',1]];
  const GM=[['Games','gp',1],['Wins','w',1],['Losses','l',-1],['Save %','svp',1],['GAA','gaa',-1],['Shutouts','so',1]];
  const metrics=isG?GM:SM;
  const val=(p,k)=>k==='sh'?p.g/Math.max(1,p.sog)*100:k==='ppg'?p.p/p.gp:k==='svp'?Number(p.svp):k==='gaa'?Number(p.gaa):p[k];
  const disp=(p,k)=>k==='sh'?val(p,k).toFixed(1)+'%':k==='ppg'?val(p,k).toFixed(2):k==='pm'?((p.pm>0?'+':'')+p.pm):k==='svp'?p.svp:k==='gaa'?p.gaa:String(p[k]);
  const sel={fontFamily:MONO,fontSize:12,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'7px 9px',color:T.ink,cursor:'pointer',width:'100%',maxWidth:240};
  const Head=({p,onPick})=>(<div style={{flex:1,minWidth:0,textAlign:'center'}}>
    <button onClick={()=>onPlayer(isG?{...p,type:'goalie',pos:'G'}:p)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'inline-flex',flexDirection:'column',alignItems:'center',gap:8,maxWidth:'100%'}}>
      <PlayerAvatar pos={isG?'G':p.pos} team={p.team} name={p.name} size={52}/>
      <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:15,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{ct(p.team)} · {isG?'G':p.pos}</div></div>
    </button>
    <div><select value={p.id} onChange={e=>onPick(e.target.value)} style={{...sel,marginTop:10}}>{pool.map(x=><option key={x.id} value={x.id}>{x.name} · {x.team}</option>)}</select></div>
  </div>);
  return(<div>
    <div style={{display:'flex',gap:6,marginBottom:14}}>{['Skaters','Goalies'].map(s=><Pill key={s} on={scope===s} onClick={()=>switchScope(s)}>{s}</Pill>)}</div>
    <div style={{...card,padding:'20px 18px'}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:20}}>
        <Head p={A} onPick={setAId}/>
        <div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:22,color:T.faint,paddingTop:18}}>vs</div>
        <Head p={B} onPick={setBId}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:13}}>
        {metrics.map(([label,k,hb])=>{const va=val(A,k),vb=val(B,k);
          const base=Math.min(0,va,vb); const a=va-base,b=vb-base; const tot=(a+b)||1;
          let sa=a/tot; if(hb<0)sa=b/tot;
          const aWin=hb<0?va<vb:va>vb, bWin=hb<0?vb<va:vb>va;
          return(<div key={k}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5,gap:10}}>
              <span style={{fontFamily:MONO,fontSize:14,fontWeight:aWin?700:500,color:aWin?T.ink:T.mut,width:70}}>{disp(A,k)}</span>
              <span style={{...ML,textAlign:'center'}}>{label}</span>
              <span style={{fontFamily:MONO,fontSize:14,fontWeight:bWin?700:500,color:bWin?T.ink:T.mut,width:70,textAlign:'right'}}>{disp(B,k)}</span>
            </div>
            <div style={{display:'flex',height:7,borderRadius:4,overflow:'hidden',background:T.bg}}>
              <div style={{width:`${(sa*100).toFixed(1)}%`,background:c2(A.team),opacity:aWin?1:.45}}/>
              <div style={{flex:1,background:c2(B.team),opacity:bWin?1:.45}}/>
            </div>
          </div>);})}
      </div>
      <div style={{fontFamily:MONO,fontSize:11,color:T.faint,marginTop:16,textAlign:'center'}}>bolder side leads each metric · bar shows each player's share of the pair</div>
    </div>
  </div>);
}
function StatsPage({onPlayer,onTeam}){
  const [mode,setMode]=uS('Leaders');
  const [cat,setCat]=uS('Points'); const [posF,setPosF]=uS('All');
  const isG=cat==='Goalies';
  const CAT={
    Points:{disp:p=>String(p.p),val:p=>p.p,sub:p=>`${p.g} G · ${p.a} A`,label:'points'},
    Goals:{disp:p=>String(p.g),val:p=>p.g,sub:p=>`${p.p} P · ${p.a} A`,label:'goals'},
    Assists:{disp:p=>String(p.a),val:p=>p.a,sub:p=>`${p.g} G · ${p.p} P`,label:'assists'},
    '+/-':{disp:p=>(p.pm>0?'+':'')+p.pm,val:p=>p.pm,sub:p=>`${p.p} P · ${p.gp} GP`,label:'plus / minus'},
    Shots:{disp:p=>String(p.sog),val:p=>p.sog,sub:p=>`${p.g} G · ${(p.g/Math.max(1,p.sog)*100).toFixed(1)}% SH`,label:'shots on goal'},
    'P/GP':{disp:p=>(p.p/p.gp).toFixed(2),val:p=>p.p/p.gp,sub:p=>`${p.p} P · ${p.gp} GP`,label:'points per game'},
    Hits:{disp:p=>String(D.leaderEx(p).hits),val:p=>D.leaderEx(p).hits,sub:p=>`${p.gp} GP`,label:'hits'},
    Blocks:{disp:p=>String(D.leaderEx(p).blk),val:p=>D.leaderEx(p).blk,sub:p=>`${p.pos} · ${p.gp} GP`,label:'blocked shots'},
    'TOI/GP':{disp:p=>D.leaderEx(p).toiPg.toFixed(1),val:p=>D.leaderEx(p).toiPg,sub:p=>`${p.gp} GP`,label:'minutes / game'},
    'FO%':{disp:p=>{const f=D.leaderEx(p).fo;return f?f.toFixed(1):'–';},val:p=>D.leaderEx(p).fo,sub:p=>`${p.pos} · ${p.gp} GP`,label:'faceoff win %'},
    Goalies:{disp:g=>g.svp,val:g=>Number(g.svp),sub:g=>`${g.w}-${g.l} · ${g.gaa} GAA`,label:'save %'},
  };
  const conf=CAT[cat];
  const open=p=>onPlayer(isG?{...p,type:'goalie',pos:'G'}:p);
  const rows=uM(()=>{
    let pool=isG?D.goalieLeaders().filter(g=>g.gp>=12):D.skaterLeaders('p').filter(p=>posF==='All'||(posF==='Defense'?p.pos==='D':p.pos!=='D'));
    let arr=pool.map(p=>({...p,_v:conf.val(p)}));
    if(cat==='FO%')arr=arr.filter(p=>p._v>0);
    return arr.sort((a,b)=>b._v-a._v).slice(0,15);
  },[cat,posF]);
  const top=rows.slice(0,3), list=rows.slice(3,15);
  const vMax=rows.length?rows[0]._v:1, vMin=rows.length?rows[rows.length-1]._v:0;
  const barPct=v=>vMax===vMin?100:Math.max(4,Math.round((v-vMin)/(vMax-vMin)*100));
  const TS=uM(()=>D.ABBR.map(ab=>({ab,...D.teamStatsFull(ab)})),[]);
  const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const totGF=D.STANDINGS.reduce((s,t)=>s+t.gf,0), totGP=D.STANDINGS.reduce((s,t)=>s+t.gp,0);
  const pulse=[
    ['Goals / game',(totGF/totGP).toFixed(2)],['Total goals',totGF.toLocaleString()],
    ['Avg power play',avg(TS.map(t=>t.pp)).toFixed(1)+'%'],['Avg penalty kill',avg(TS.map(t=>t.pk)).toFixed(1)+'%'],
    ['Avg save %','.'+Math.round(avg(TS.map(t=>Number(t.svPct)))*1000)],['Shutouts',D.goalies.reduce((s,g)=>s+(g.so||0),0)],
  ];
  const tlead=(rk,d)=>{const t=TS.find(x=>x.ranks[rk]===1)||TS[0];return{ab:t.ab,v:d(t)};};
  const teamLeaders=[
    ['Best offense',tlead('gf',t=>t.gfPg+' GF/GP')],['Best defense',tlead('ga',t=>t.gaPg+' GA/GP')],
    ['Power play',tlead('pp',t=>t.pp+'%')],['Penalty kill',tlead('pk',t=>t.pk+'%')],['Faceoffs',tlead('fo',t=>t.fo+'%')],
  ];
  const Podium=({p,rank})=>(<div onClick={()=>open(p)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer'}}>
    <div style={{height:3,background:c2(p.team)}}/>
    <div style={{padding:'15px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
        <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:30,color:rank===1?T.red:T.faint,lineHeight:1}}>{rank}</span>
        <span style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>{p.gp} GP</span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:12}}>
        <PlayerAvatar pos={isG?'G':p.pos} team={p.team} name={p.name} size={42}/>
        <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:14,color:T.ink,lineHeight:1.15,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',wordBreak:'break-word'}}>{p.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{ct(p.team)} · {isG?'G':p.pos}</div></div>
      </div>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:8}}>
        <div><div style={{fontSize:32,fontWeight:600,letterSpacing:'-.03em',color:T.ink,lineHeight:1}}>{conf.disp(p)}</div><div style={{...ML,marginTop:4}}>{conf.label}</div></div>
        <div style={{fontFamily:MONO,fontSize:11,color:T.faint,textAlign:'right',paddingBottom:2}}>{conf.sub(p)}</div>
      </div>
    </div>
  </div>);
  return(<div>
    <PageHead k="Stats" t="League" serif="leaders" right={<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{['Leaders','All players','Compare'].map(m=><Pill key={m} on={mode===m} onClick={()=>setMode(m)}>{m}</Pill>)}</div>}/>
    {mode==='All players'&&<StatsTable onPlayer={onPlayer}/>}
    {mode==='Compare'&&<StatsCompare onPlayer={onPlayer}/>}
    {mode==='Leaders'&&<React.Fragment>
    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:16}}>
      {['Points','Goals','Assists','+/-','Shots','P/GP','Hits','Blocks','TOI/GP','FO%','Goalies'].map(x=><Pill key={x} on={cat===x} onClick={()=>setCat(x)}>{x}</Pill>)}
      {!isG&&<div style={{display:'flex',gap:6,marginLeft:'auto'}}>{['All','Forwards','Defense'].map(x=><Pill key={x} on={posF===x} onClick={()=>setPosF(x)}>{x}</Pill>)}</div>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,alignItems:'start'}} className="sg">
      <div style={{minWidth:0}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}} className="pod">{top.map((p,i)=><Podium key={p.id} p={p} rank={i+1}/>)}</div>
        <div style={{...card,overflow:'hidden'}}>
          <div style={{padding:'12px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.line}`}}><span style={ML}>{isG?'Goalie':posF==='All'?'Skater':posF} leaders · 4–15</span><span style={{...ML,color:T.faint}}>{conf.label}</span></div>
          {list.map((p,i)=>(<div key={p.id} onClick={()=>open(p)} className="er" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 18px',borderTop:`1px solid ${T.line}`,cursor:'pointer'}}>
            <span style={{width:20,color:T.faint,fontFamily:MONO,fontSize:12}}>{i+4}</span>
            <Badge ab={p.team} size={24}/>
            <div style={{flex:1,minWidth:0}}><div style={{color:T.ink,fontWeight:600,fontSize:13.5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name} <span style={{color:T.faint,fontFamily:MONO,fontSize:11,fontWeight:400}}>{isG?'G':p.pos}</span></div><div style={{fontFamily:MONO,fontSize:10.5,color:T.faint}}>{conf.sub(p)}</div></div>
            <div className="stat-bar" style={{width:88,height:6,borderRadius:3,background:T.bg,overflow:'hidden',flexShrink:0}}><div style={{height:'100%',width:`${barPct(p._v)}%`,background:c2(p.team),borderRadius:3}}/></div>
            <span style={{width:46,textAlign:'right',fontWeight:700,fontSize:15.5,fontVariantNumeric:'tabular-nums'}}>{conf.disp(p)}</span>
          </div>))}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={{...card,padding:'16px 18px'}}>
          <div style={ML}>League pulse</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px 16px',marginTop:13}}>{pulse.map(([l,v])=><div key={l}><div style={{fontSize:22,fontWeight:600,color:T.ink,letterSpacing:'-.02em',lineHeight:1.1}}>{v}</div><div style={{...ML,marginTop:3}}>{l}</div></div>)}</div>
        </div>
        <div style={{...card,overflow:'hidden'}}>
          <div style={{padding:'13px 18px',...ML,borderBottom:`1px solid ${T.line}`}}>Team leaders</div>
          {teamLeaders.map(([l,t],i)=>(<div key={l} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:11,padding:'11px 18px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
            <div style={{flex:1,minWidth:0}}><div style={{...ML}}>{l}</div><div style={{display:'flex',alignItems:'center',gap:8,marginTop:5}}><Badge ab={t.ab} size={20}/><span style={{fontSize:13.5,fontWeight:600,color:T.ink}}>{ct(t.ab)}</span></div></div>
            <span style={{fontFamily:MONO,fontSize:12.5,fontWeight:700,color:T.ink}}>{t.v}</span>
          </div>))}
        </div>
      </div>
    </div>
    </React.Fragment>}
    <style>{`@media(max-width:760px){.sg{grid-template-columns:1fr!important}}@media(max-width:560px){.pod{grid-template-columns:1fr!important}.stat-bar{display:none!important}}`}</style>
  </div>);
}

/* ---------- HOCKEY IQ ---------- */
function Spotlight({title,p,metrics,onPlayer}){return(
  <div style={{...card,padding:20}}><Eyebrow>{title}</Eyebrow>
    <button onClick={()=>onPlayer(p)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:11,padding:'12px 0 4px'}}><Badge ab={p.team} size={40}/><div style={{textAlign:'left'}}><div style={{fontWeight:600,color:T.ink}}>{p.name}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{ct(p.team)} · {p.pos||'G'}</div></div></button>
    <div style={{marginTop:10}}>{metrics.map(([l,v,pc])=><div key={l} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:T.mut}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div><div style={{height:5,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${pc}%`,background:c2(p.team)}}/></div></div>)}</div>
  </div>);}
function HockeyIQPage({onPlayer,onTeam}){
  const draft=[...D.STANDINGS].slice(-5).reverse();
  const [iqTab,setIqTab]=uS('Overview');
  const teamsAZ=uM(()=>[...D.ABBR].sort((a,b)=>ct(a).localeCompare(ct(b))),[]);
  const [tcA,setTcA]=uS(D.STANDINGS[0].ab); const [tcB,setTcB]=uS(D.STANDINGS[1].ab);
  const [etA,setEtA]=uS(D.STANDINGS[0].ab); const [etB,setEtB]=uS(D.STANDINGS[2]?D.STANDINGS[2].ab:D.STANDINGS[1].ab);
  const tcmp=D.teamCompare(tcA,tcB);
  const seeds=cf=>D.STANDINGS.filter(t=>t.conf===cf).slice(0,8);
  const skList=uM(()=>D.skaterLeaders('p').slice(0,24),[]);
  const goList=uM(()=>D.goalieLeaders().filter(g=>g.gp>=12).slice(0,20),[]);
  const [skId,setSkId]=uS(skList[0].id); const [goId,setGoId]=uS(goList[0].id);
  const [cmpA,setCmpA]=uS(skList[0].id); const [cmpB,setCmpB]=uS(skList[1].id);
  const [cmpGA,setCmpGA]=uS(goList[0].id); const [cmpGB,setCmpGB]=uS(goList[1].id);
  const cmp=D.edgeCompare(cmpA,cmpB);
  const gcmp=D.goalieEdgeCompare(cmpGA,cmpGB);
  const teamDist=D.edgeTeamDistance();
  const topSk=skList.find(p=>p.id===skId)||skList[0];
  const topG={...(goList.find(g=>g.id===goId)||goList[0]),type:'goalie'};
  const skE=D.skaterEdge(topSk); const gE=D.goalieEdge(topG);
  const sos=D.strengthOfSchedule(); const rest=D.restTracker();
  const sel={fontFamily:MONO,fontSize:11,background:T.paper,border:`1px solid ${T.line2}`,borderRadius:8,padding:'5px 8px',color:T.mut};
  const EdgeCard=({title,metric,unit})=>{const rows=D.edgeLeaders(metric);return(
    <div style={{...card,overflow:'hidden'}}><div style={{padding:'12px 15px',fontSize:13,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>{title}</div>
      {rows.map((p,i)=><div key={p.id} onClick={()=>onPlayer(p)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 15px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><span style={{width:14,color:T.faint,fontFamily:MONO,fontSize:11}}>{i+1}</span><Badge ab={p.team} size={20}/><span style={{flex:1,color:T.ink,fontSize:13}}>{p.name}</span><span style={{fontWeight:700,fontFamily:MONO,fontSize:13}}>{p._v}<span style={{fontSize:10,fontWeight:400,color:T.faint}}>{unit}</span></span></div>)}</div>);};
  const Lead=({title,list,k})=>(<div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,color:T.ink,borderBottom:`1px solid ${T.line}`}}>{title}</div>
    {list.map((p,i)=><div key={p.id} onClick={()=>onPlayer(p)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
      <span style={{width:16,color:T.faint,fontFamily:MONO,fontSize:11}}>{i+1}</span><Badge ab={p.team} size={22}/><span style={{flex:1,color:T.ink,fontSize:13.5}}>{p.name}</span><span style={{fontWeight:700}}>{p[k]}</span></div>)}</div>);
  const EB_M=[['top','Top skating speed','mph'],['shot','Max shot speed','mph'],['savg','Avg shot speed','mph'],['dist','Distance','mi'],['b20','20+ bursts',''],['b22','22+ bursts',''],['oz','O-zone time','%']];
  const EdgeBoard=()=>{const [m,setM]=uS('top');const meta=EB_M.find(x=>x[0]===m)||EB_M[0];const rows=window.E_useLive(D.edgeBoard(m),()=>(window.NHL&&window.NHL.edgeBoardLive)?window.NHL.edgeBoardLive(m):Promise.resolve(null),[m]);return(
    <div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
        <span style={{fontSize:14,fontWeight:600}}>League EDGE leaderboard</span>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{EB_M.map(([k,lab])=><button key={k} onClick={()=>setM(k)} style={{fontFamily:MONO,fontSize:10.5,padding:'4px 9px',borderRadius:999,border:`1px solid ${m===k?T.invBg:T.line2}`,background:m===k?T.invBg:'transparent',color:m===k?T.invFg:T.mut,cursor:'pointer'}}>{lab}</button>)}</div>
      </div>
      {rows.map((p,i)=><div key={p.id} onClick={()=>onPlayer(p)} className="er" style={{display:'flex',alignItems:'center',gap:11,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
        <span style={{width:20,fontFamily:MONO,fontSize:12,color:i<3?T.red:T.faint,fontWeight:i<3?700:400}}>{i+1}</span>
        <Badge ab={p.team} size={22}/><span style={{flex:1,minWidth:0,fontSize:13.5,color:T.ink,fontWeight:i<3?600:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</span>
        <span style={{fontFamily:MONO,fontSize:11,color:T.faint,flexShrink:0}}>{p.team} · {p.pos}</span>
        <span style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:T.ink,minWidth:60,textAlign:'right'}}>{p._v}{meta[2]?(' '+meta[2]):''}</span>
      </div>)}
    </div>);};
  const EdgeTeams=()=>{const dist=D.edgeTeamDistance();const spd=D.edgeTeamSpeed?D.edgeTeamSpeed():[];const TB=({title,rows,k,unit})=>(
    <div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>{title}</div>
      {rows.map((t,i)=><div key={t.ab} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><span style={{width:16,color:T.faint,fontFamily:MONO,fontSize:11}}>{i+1}</span><Badge ab={t.ab} size={22}/><span style={{flex:1,color:T.ink,fontSize:13.5}}>{ct(t.ab)}</span><span style={{fontWeight:700,fontFamily:MONO,fontSize:13}}>{t[k]}<span style={{fontSize:10,fontWeight:400,color:T.faint}}>{unit}</span></span></div>)}</div>);
    return(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}} className="g2"><TB title="Team skating distance" rows={dist} k="mi" unit=" mi/gm"/><TB title="Team top skating speed" rows={spd} k="top" unit=" mph"/></div>);};
  const TList=({title,rows,fmt})=>(<div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>{title}</div>
    {rows.map((t,i)=><div key={t.ab} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><Badge ab={t.ab} size={22}/><span style={{flex:1,color:T.ink,fontSize:13.5}}>{ct(t.ab)}</span>{fmt(t)}</div>)}</div>);
  const story=(tag,headline,sub,onClick,accent)=>(<div onClick={onClick} className="ec" style={{...card,padding:'16px 17px',cursor:'pointer'}}>
    <div style={{fontFamily:MONO,fontSize:10.5,letterSpacing:'.12em',textTransform:'uppercase',color:accent||T.red}}>{tag}</div>
    <div style={{fontFamily:SERIF,fontSize:18,lineHeight:1.25,color:T.ink,margin:'7px 0 5px'}}>{headline}</div>
    <div style={{fontSize:12.5,color:T.mut}}>{sub}</div></div>);
  const fastSk=D.edgeLeaders('top')[0],hardSh=D.edgeLeaders('shot')[0],burst=D.edgeLeaders('b22')[0];
  const hdGoalie=D.goalieHDLeaders()[0],distTeam=teamDist[0],b2b=rest.find(t=>t.b2b),ptsL=D.skaterLeaders('p')[0];
  // featured spotlight cards (shared)
  const SkSpot=()=>(<div style={{...card,padding:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><Eyebrow>Featured skater</Eyebrow><select value={skId} onChange={e=>setSkId(e.target.value)} style={sel}>{skList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <button onClick={()=>onPlayer(topSk)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:11,padding:'12px 0 4px'}}><Badge ab={topSk.team} size={40}/><div style={{textAlign:'left'}}><div style={{fontWeight:600,color:T.ink}}>{topSk.name}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{ct(topSk.team)} · {topSk.pos}</div></div></button>
    <div style={{marginTop:10}}>{skE.speed.slice(0,4).map(([l,v,pc])=><div key={l} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:T.mut}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div><div style={{height:5,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${pc}%`,background:c2(topSk.team)}}/></div></div>)}</div></div>);
  const GoSpot=()=>(<div style={{...card,padding:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><Eyebrow>Featured goalie</Eyebrow><select value={goId} onChange={e=>setGoId(e.target.value)} style={sel}>{goList.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
    <button onClick={()=>onPlayer(topG)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:11,padding:'12px 0 4px'}}><Badge ab={topG.team} size={40}/><div style={{textAlign:'left'}}><div style={{fontWeight:600,color:T.ink}}>{topG.name}</div><div style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{ct(topG.team)} · G</div></div></button>
    <div style={{marginTop:10}}>{gE.saveQ.map(([l,v,pc])=><div key={l} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:T.mut}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div><div style={{height:5,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{height:'100%',width:`${pc}%`,background:c2(topG.team)}}/></div></div>)}</div></div>);
  const SkCompare=()=>(<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><span style={ML}>Skater comparison · NHL Edge</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={cmpA} onChange={e=>setCmpA(e.target.value)} style={sel}>{skList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>vs</span>
          <select value={cmpB} onChange={e=>setCmpB(e.target.value)} style={sel}>{skList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',gap:12}}>
        <button onClick={()=>onPlayer(cmp.A)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><Badge ab={cmp.A.team} size={28}/><span style={{fontWeight:600,fontSize:14}}>{cmp.A.name}</span></button>
        <button onClick={()=>onPlayer(cmp.B)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><span style={{fontWeight:600,fontSize:14}}>{cmp.B.name}</span><Badge ab={cmp.B.team} size={28}/></button>
      </div>
      {cmp.rows.map((r,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:12,padding:'8px 16px',borderTop:`1px solid ${T.line}`}}>
        <span style={{textAlign:'right',fontFamily:MONO,fontWeight:r.aWins?700:400,color:r.aWins?T.ink:T.mut}}>{r.a}{r.u}</span>
        <span style={{...ML,width:120,textAlign:'center'}}>{r.l}</span>
        <span style={{fontFamily:MONO,fontWeight:!r.aWins?700:400,color:!r.aWins?T.ink:T.mut}}>{r.b}{r.u}</span>
      </div>)}
    </div>);
  const GoCompare=()=>(<div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><span style={ML}>Goalie comparison · NHL Edge</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={cmpGA} onChange={e=>setCmpGA(e.target.value)} style={sel}>{goList.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
          <span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>vs</span>
          <select value={cmpGB} onChange={e=>setCmpGB(e.target.value)} style={sel}>{goList.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',gap:12}}>
        <button onClick={()=>onPlayer(gcmp.A)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><Badge ab={gcmp.A.team} size={28}/><div style={{textAlign:'left'}}><div style={{fontWeight:600,fontSize:14}}>{gcmp.A.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{ct(gcmp.A.team)} · {gcmp.A.w}-{gcmp.A.l}</div></div></button>
        <button onClick={()=>onPlayer(gcmp.B)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><div style={{textAlign:'right'}}><div style={{fontWeight:600,fontSize:14}}>{gcmp.B.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{ct(gcmp.B.team)} · {gcmp.B.w}-{gcmp.B.l}</div></div><Badge ab={gcmp.B.team} size={28}/></button>
      </div>
      {gcmp.rows.map((r,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:12,padding:'8px 16px',borderTop:`1px solid ${T.line}`}}>
        <span style={{textAlign:'right',fontFamily:MONO,fontWeight:r.aWins?700:400,color:r.aWins?T.ink:T.mut}}>{r.a}{r.u}</span>
        <span style={{...ML,width:130,textAlign:'center'}}>{r.l}</span>
        <span style={{fontFamily:MONO,fontWeight:!r.aWins?700:400,color:!r.aWins?T.ink:T.mut}}>{r.b}{r.u}</span>
      </div>)}
    </div>);
  const Seeds=()=>(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}} className="g2">
      {[['East','Eastern'],['West','Western']].map(([cf,lab])=>(<div key={cf} style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>{lab} · playoff seeds</div>
        {seeds(cf).map((t,i)=><div key={t.ab} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
          <span style={{width:22,height:22,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:MONO,fontSize:11,fontWeight:600,background:i<3?T.invBg:T.bg,color:i<3?T.invFg:T.mut}}>{i+1}</span>
          <Badge ab={t.ab} size={20}/><span style={{flex:1,color:T.ink,fontSize:13.5}}>{ct(t.ab)}</span><span style={{fontWeight:700}}>{t.pts}</span></div>)}</div>))}
    </div>);
  return(<div>
    <PageHead k="Hockey IQ" t="NHL Edge" serif="analytics"/>
    <Tabs tabs={['Overview','Skaters','Goalies','Teams']} active={iqTab} onChange={setIqTab}/>
    {iqTab==='Overview'&&<div>
      <div style={{...ML,marginBottom:10}}>Around the analytics desk</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:18}}>
        {fastSk&&story('Top speed',`${fastSk.name} is the league's fastest`,`${fastSk._v} mph top skating speed`,()=>onPlayer(fastSk),'#1a8a4f')}
        {hardSh&&story('Hardest shot',`${hardSh.name} is firing bullets`,`${hardSh._v} mph max shot speed`,()=>onPlayer(hardSh))}
        {hdGoalie&&story('The wall',`${hdGoalie.name} owns the slot`,`${String(hdGoalie.hd).slice(1)} high-danger SV%`,()=>onPlayer(hdGoalie),'#1f5f8a')}
        {distTeam&&story('Workhorses',`${ct(distTeam.ab)} skate the most`,`${distTeam.mi} mi/game as a team`,()=>onTeam(distTeam.ab))}
        {burst&&story('High gear',`${burst.name} keeps hitting top speed`,`${burst._v} bursts of 22+ mph`,()=>onPlayer(burst),'#1a8a4f')}
        {b2b&&story('Rest alert',`${ct(b2b.ab)} on a back-to-back`,'fatigue could be a factor tonight',()=>onTeam(b2b.ab),T.red)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}} className="g2"><SkSpot/><GoSpot/></div>
    </div>}
    {iqTab==='Skaters'&&<div>
      <div style={{...ML,marginBottom:11}}>Skater tracking leaders</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:16}}>
        <EdgeCard title="Top skating speed" metric="top" unit=" mph"/><EdgeCard title="22+ mph bursts" metric="b22" unit=""/><EdgeCard title="Max shot speed" metric="shot" unit=" mph"/><EdgeCard title="O-zone time" metric="oz" unit="%"/>
      </div>
      <EdgeBoard/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:16}}>
        <Lead title="Points leaders" list={D.skaterLeaders('p').slice(0,5)} k="p"/>
        <Lead title="Goal leaders" list={D.skaterLeaders('g').slice(0,5)} k="g"/>
        <Lead title="Assist leaders" list={D.skaterLeaders('a').slice(0,5)} k="a"/>
      </div>
      <SkCompare/>
    </div>}
    {iqTab==='Goalies'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}} className="g2">
        <GoSpot/>
        <div style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>Goalie high-danger SV%</div>
          {D.goalieHDLeaders().map((g,i)=><div key={g.id} onClick={()=>onPlayer(g)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><span style={{width:16,color:T.faint,fontFamily:MONO,fontSize:11}}>{i+1}</span><Badge ab={g.team} size={22}/><span style={{flex:1,color:T.ink,fontSize:13.5}}>{g.name}</span><span style={{fontWeight:700,fontFamily:MONO,fontSize:13}}>{String(g.hd).slice(1)}</span></div>)}</div>
      </div>
      <GoCompare/>
    </div>}
    {iqTab==='Teams'&&<div>
      <div style={{...ML,marginBottom:11}}>Team tracking leaders</div>
      <EdgeTeams/>
      <div style={{...ML,margin:'22px 0 11px'}}>Team EDGE head-to-head</div>
      <div style={{...card,padding:'16px 18px',marginBottom:16}}>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:14}}>
          <select value={etA} onChange={e=>setEtA(e.target.value)} style={{...sel,fontSize:12.5,padding:'7px 10px'}}>{teamsAZ.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select>
          <span style={{fontFamily:SERIF,fontStyle:'italic',color:T.faint}}>vs</span>
          <select value={etB} onChange={e=>setEtB(e.target.value)} style={{...sel,fontSize:12.5,padding:'7px 10px'}}>{teamsAZ.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select>
          <span style={{marginLeft:'auto',fontFamily:MONO,fontSize:10,color:T.faint}}>percentile vs league</span>
        </div>
        {D.edgeTeamCompare(etA,etB).map((row,i)=>{const aw=row.aPct>=row.bPct;return(
          <div key={row.label} style={{padding:'9px 0',borderTop:i?`1px solid ${T.line}`:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',fontFamily:MONO,fontSize:12.5,marginBottom:6}}>
              <span style={{fontWeight:aw?700:400,color:aw?c2(etA):T.mut,minWidth:60}}>{row.a}{row.unit==='%'?'%':''}</span>
              <span style={{...ML,fontSize:10}}>{row.label}</span>
              <span style={{fontWeight:!aw?700:400,color:!aw?c2(etB):T.mut,minWidth:60,textAlign:'right'}}>{row.b}{row.unit==='%'?'%':''}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{flex:1,height:6,borderRadius:3,background:T.bg,overflow:'hidden',display:'flex',justifyContent:'flex-end'}}><div style={{width:`${row.aPct}%`,background:c2(etA),opacity:aw?1:.45}}/></div>
              <div style={{flex:1,height:6,borderRadius:3,background:T.bg,overflow:'hidden'}}><div style={{width:`${row.bPct}%`,background:c2(etB),opacity:!aw?1:.45}}/></div>
            </div>
          </div>);})}
      </div>
      {(()=>{const Row=({r})=>{const an=r.a,bn=r.b;const aw=r.low?an<=bn:an>=bn;const tot=(Math.abs(an)+Math.abs(bn))||1;const ap=Math.round(Math.abs(an)/tot*100);
        return(<div style={{padding:'9px 0',borderTop:`1px solid ${T.line}`}}>
          <div style={{display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:12.5,marginBottom:5}}><span style={{fontWeight:aw?700:400,color:aw?T.ink:T.mut,minWidth:54}}>{an}{r.u||''}</span><span style={{...ML,fontSize:10}}>{r.l}</span><span style={{fontWeight:!aw?700:400,color:!aw?T.ink:T.mut,minWidth:54,textAlign:'right'}}>{bn}{r.u||''}</span></div>
          <div style={{display:'flex',height:5,borderRadius:3,overflow:'hidden',background:T.bg}}><div style={{width:`${ap}%`,background:c2(tcA),opacity:aw?1:.35}}/><div style={{flex:1,background:c2(tcB),opacity:!aw?1:.35}}/></div></div>);};
        return(<div style={{...card,overflow:'hidden',marginBottom:16}}>
          <div style={{padding:'13px 16px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><span style={ML}>Compare teams · head-to-head</span>
            <div style={{display:'flex',gap:8,alignItems:'center'}}><select value={tcA} onChange={e=>setTcA(e.target.value)} style={sel}>{teamsAZ.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select><span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>vs</span><select value={tcB} onChange={e=>setTcB(e.target.value)} style={sel}>{teamsAZ.map(a=><option key={a} value={a}>{ct(a)} {nk(a)}</option>)}</select></div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',gap:12}}>
            <button onClick={()=>onTeam(tcA)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><Badge ab={tcA} size={30}/><div style={{textAlign:'left'}}><div style={{fontWeight:700,fontSize:14}}>{ct(tcA)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{tcmp.sa.w}-{tcmp.sa.l}-{tcmp.sa.otl}</div></div></button>
            <button onClick={()=>onTeam(tcB)} className="el" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}><div style={{textAlign:'right'}}><div style={{fontWeight:700,fontSize:14}}>{ct(tcB)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{tcmp.sb.w}-{tcmp.sb.l}-{tcmp.sb.otl}</div></div><Badge ab={tcB} size={30}/></button>
          </div>
          <div style={{padding:'2px 16px 14px'}}>{tcmp.rows.map((r,i)=><Row key={i} r={r}/>)}</div>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.line}`}}><div style={{...ML,marginBottom:8}}>Recent meetings</div>
            {tcmp.meet.map((m,i)=>{const aw=m.as>m.hs;return(<div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',fontFamily:MONO,fontSize:12.5}}><span style={{color:T.faint,width:52}}>{m.date}</span><span style={{flex:1,display:'flex',alignItems:'center',gap:7}}><Badge ab={m.away} size={17}/><span style={{fontWeight:aw?700:400}}>{m.away}</span><span style={{color:T.faint}}>{m.as}</span><span style={{color:T.faint}}>@</span><span style={{color:T.faint}}>{m.hs}</span><span style={{fontWeight:!aw?700:400}}>{m.home}</span><Badge ab={m.home} size={17}/></span>{m.ot&&<span style={{color:T.faint,fontSize:10}}>OT</span>}</div>);})}
          </div>
        </div>);})()}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:16}}>
        <div style={{...card,overflow:'hidden'}}><div style={{padding:'12px 15px',fontSize:13,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>Team skating distance · mi/gm</div>
          {teamDist.map((t,i)=><div key={t.ab} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 15px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><span style={{width:14,color:T.faint,fontFamily:MONO,fontSize:11}}>{i+1}</span><Badge ab={t.ab} size={20}/><span style={{flex:1,color:T.ink,fontSize:13}}>{ct(t.ab)}</span><span style={{fontFamily:MONO,fontSize:13,fontWeight:700}}>{t.mi}</span></div>)}</div>
        <TList title="Strength of schedule" rows={sos} fmt={t=><span style={{fontFamily:MONO,fontSize:12,color:T.mut}}>{t.n} next 5d</span>}/>
        <TList title="Rest tracker" rows={rest} fmt={t=>t.b2b?<span style={{fontFamily:MONO,fontSize:11,color:T.negFg,background:T.negBg,padding:'2px 7px',borderRadius:5}}>back-to-back</span>:<span style={{fontFamily:MONO,fontSize:12,color:T.mut}}>{t.days}d rest</span>}/>
      </div>
      <Seeds/>
    </div>}
    <style>{`@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`}</style>
  </div>);
}

/* ---------- GAME BOX SCORE ---------- */
function GameBox({hiAb,loAb,hiW,loW,gameNo,onBack,onGame,onTeam}){
  const gd=D.gameDetail(hiAb,loAb,hiW,loW,gameNo);
  const total=D.seriesDetail(hiAb,loAb,hiW,loW).games.length;
  const hasNext=gameNo<total;
  const hw=gd.winner==='hi';
  const cols=gd.ot?['1st','2nd','3rd','OT']:['1st','2nd','3rd'];
  const STR={PP:'#9a6b1a',SH:'#1f5f8a',OT:T.red,EV:T.faint,EN:T.mut};
  const cmpNum=v=>typeof v==='number'?v:parseFloat(v)||0;
  const Cmp=({label,a,b,fmt,hiBetter=true})=>{const na=cmpNum(a),nb=cmpNum(b);const aw=hiBetter?na>=nb:na<=nb;const tot=(Math.abs(na)+Math.abs(nb))||1;const ap=Math.round(Math.abs(na)/tot*100);
    return(<div style={{padding:'9px 0',borderTop:`1px solid ${T.line}`}}>
      <div style={{display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:12.5,marginBottom:5}}>
        <span style={{fontWeight:aw?700:400,color:aw?T.ink:T.mut,minWidth:54}}>{fmt?fmt(a):a}</span><span style={{...ML,fontSize:10}}>{label}</span><span style={{fontWeight:!aw?700:400,color:!aw?T.ink:T.mut,minWidth:54,textAlign:'right'}}>{fmt?fmt(b):b}</span></div>
      <div style={{display:'flex',height:5,borderRadius:3,overflow:'hidden',background:T.bg}}><div style={{width:`${ap}%`,background:c2(hiAb),opacity:aw?1:.35}}/><div style={{flex:1,background:c2(loAb),opacity:!aw?1:.35}}/></div></div>);};
  const Sub=({children})=><div style={{...ML,fontSize:10,color:T.ink,margin:'16px 0 2px'}}>{children}</div>;
  const TH=({ab,score,win})=>(<div onClick={()=>onTeam(ab)} className="el" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',flex:1,opacity:win?1:0.6}}>
    <Badge ab={ab} size={42}/><div style={{fontWeight:700,fontSize:14,color:T.ink}}>{ct(ab)}</div><div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:38,lineHeight:1,color:win?c2(ab):T.faint}}>{score}</div></div>);
  const th=gd.team[hiAb],to=gd.team[loAb];const pp=t=>+(t.ppg/t.ppo*100).toFixed(1);
  const SkTable=({ab})=>(<div style={{...card,overflow:'hidden'}}>
    <div onClick={()=>onTeam(ab)} className="el" style={{display:'flex',alignItems:'center',gap:9,padding:'11px 15px',borderBottom:`1px solid ${T.line}`,cursor:'pointer'}}><Badge ab={ab} size={20}/><span style={{fontWeight:600,color:T.ink}}>{ct(ab)} {nk(ab)}</span></div>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:320,borderCollapse:'collapse',fontSize:12.5}}>
      <thead><tr style={ML}>{['Skater','G','A','P','+/-','S','Hits','Blk','TOI'].map((h,i)=><th key={h} style={{padding:'7px 9px',textAlign:i?'center':'left',fontWeight:600,...ML,fontSize:9}}>{h}</th>)}</tr></thead>
      <tbody>{gd.skaters[ab].map((p,i)=><tr key={i} style={{borderTop:`1px solid ${T.line}`}}>
        <td style={{padding:'6px 9px',whiteSpace:'nowrap'}}>{p.name} <span style={{color:T.faint,fontFamily:MONO,fontSize:10}}>{p.pos}</span></td>
        <td style={{textAlign:'center',fontFamily:MONO,fontWeight:p.g?700:400}}>{p.g}</td><td style={{textAlign:'center',fontFamily:MONO}}>{p.a}</td><td style={{textAlign:'center',fontFamily:MONO,fontWeight:700}}>{p.p}</td>
        <td style={{textAlign:'center',fontFamily:MONO,color:p.pm>=0?'#1a8a4f':T.red}}>{p.pm>=0?'+':''}{p.pm}</td><td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.s}</td>
        <td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.hits}</td><td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.blk}</td><td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.toi}</td></tr>)}</tbody>
    </table></div>
    {(()=>{const g=gd.goalie[ab];return(<div style={{padding:'10px 15px',borderTop:`2px solid ${T.line2}`,display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:11.5,color:T.mut}}><span style={{color:T.ink,fontWeight:600}}>{g.name} <span style={{color:g.dec==='W'?'#1a8a4f':T.faint,fontWeight:700}}>({g.dec})</span></span><span>{g.saves}/{g.sf} sv · {g.svp} SV% · {g.ga} GA</span></div>);})()}
  </div>);
  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,paddingBottom:16}}>
      <button onClick={onBack} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:0}}>← back to series</button>
      <button onClick={()=>hasNext?onGame(gameNo+1):onBack()} className="el" style={{background:'none',border:'none',color:hasNext?T.ink:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:0,fontWeight:hasNext?600:400}}>{hasNext?`Game ${gameNo+1} →`:'series overview →'}</button>
    </div>
    {/* header + line score */}
    <div style={{...card,padding:'20px',marginBottom:16}}>
      <div style={{...ML,textAlign:'center',marginBottom:14}}>Game {gd.gameNo}{gd.ot?' · Overtime':''} · {ct(hw?hiAb:loAb)} win {Math.max(gd.hs,gd.ls)}–{Math.min(gd.hs,gd.ls)}</div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
        <TH ab={hiAb} score={gd.hs} win={hw}/><span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:15,color:T.faint}}>vs</span><TH ab={loAb} score={gd.ls} win={!hw}/>
      </div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontFamily:MONO,fontSize:13}}>
        <thead><tr style={ML}>{['',...cols,'T','SOG'].map((h,i)=><th key={i} style={{padding:'7px 8px',textAlign:i?'center':'left',fontWeight:600,...ML,fontSize:9.5}}>{h}</th>)}</tr></thead>
        <tbody>{[hiAb,loAb].map(ab=>{const ln=gd.line[ab];const tot=ln.reduce((s,v)=>s+v,0);const sog=gd.shots[ab].reduce((s,v)=>s+v,0);return(<tr key={ab} style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'8px',display:'flex',alignItems:'center',gap:7}}><Badge ab={ab} size={18}/>{ab}</td>
          {cols.map((c,i)=><td key={i} style={{textAlign:'center',color:ln[i]?T.ink:T.faint}}>{ln[i]}</td>)}
          <td style={{textAlign:'center',fontWeight:700}}>{tot}</td><td style={{textAlign:'center',color:T.mut}}>{sog}</td></tr>);})}</tbody>
      </table></div>
    </div>
    {/* three stars */}
    {gd.stars.length>0&&<div style={{...card,padding:'14px 18px',marginBottom:16}}>
      <div style={{...ML,marginBottom:10}}>Three stars</div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{gd.stars.map((s,i)=><div key={i} onClick={()=>onTeam(s.ab)} className="el" style={{flex:'1 1 150px',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,background:T.bg,border:`1px solid ${T.line2}`,cursor:'pointer'}}>
        <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:22,color:'#9a7c2a'}}>{i+1}</span><Badge ab={s.ab} size={22}/>
        <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{s.note}</div></div></div>)}</div>
    </div>}
    {/* scoring summary */}
    <div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Scoring summary</div>
      {gd.goals.length===0?<div style={{padding:16,fontFamily:MONO,fontSize:12,color:T.mut}}>No goals.</div>:
        cols.map((cl,pi)=>{const gs=gd.goals.filter(g=>g.period===pi);if(!gs.length)return null;return(<div key={pi}>
          <div style={{padding:'7px 16px',background:T.bg,...ML,fontSize:9.5}}>{cl} period</div>
          {gs.map((g,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'9px 16px',borderTop:`1px solid ${T.line}`}}>
            <span style={{fontFamily:MONO,fontSize:11,color:T.faint,width:40}}>{g.time}</span><Badge ab={g.ab} size={20}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,color:T.ink,fontWeight:600}}>{g.scorer} <span style={{fontFamily:MONO,fontSize:10.5,fontWeight:700,color:STR[g.str],letterSpacing:'.04em'}}>{g.str!=='EV'?g.str:''}</span></div>
              <div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{g.a1?`${g.a1}${g.a2?', '+g.a2:''}`:'unassisted'}</div></div>
            <span style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:T.ink}}>{g.hs}–{g.ls}</span></div>)}
        </div>);})}
    </div>
    {/* team stats */}
    <div style={{...card,padding:'8px 18px 16px',marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 4px',fontFamily:MONO,fontSize:12}}><span style={{display:'flex',alignItems:'center',gap:7}}><Badge ab={hiAb} size={20}/>{hiAb}</span><span style={{...ML,fontSize:9.5,alignSelf:'center'}}>Game stats</span><span style={{display:'flex',alignItems:'center',gap:7}}>{loAb}<Badge ab={loAb} size={20}/></span></div>
      <Cmp label="Goals" a={th.goals} b={to.goals}/>
      <Cmp label="Shots on goal" a={th.shots} b={to.shots}/>
      <Cmp label="Power play %" a={pp(th)} b={pp(to)} fmt={v=>v+'%'}/>
      <Cmp label="Faceoff %" a={th.fo} b={to.fo} fmt={v=>v+'%'}/>
      <Cmp label="Hits" a={th.hits} b={to.hits}/>
      <Cmp label="Blocked shots" a={th.blk} b={to.blk}/>
      <Cmp label="Takeaways" a={th.take} b={to.take}/>
      <Cmp label="Giveaways" a={th.give} b={to.give} hiBetter={false}/>
      <Cmp label="Penalty minutes" a={th.pim} b={to.pim} hiBetter={false}/>
    </div>
    {/* shot locations on ice */}
    {window.E_ShotMap&&(()=>{const homeAb=gd.home==='hi'?hiAb:loAb,awayAb=gd.home==='hi'?loAb:hiAb;
      const g={id:`po-${hiAb}-${loAb}-${gameNo}`,st:'pre',a:awayAb,h:homeAb,sa:gd.team[awayAb].shots,sh:gd.team[homeAb].shots,as:gd.team[awayAb].goals,hs:gd.team[homeAb].goals};
      return <div style={{marginTop:16}}><window.E_ShotMap g={g}/></div>;})()}
    {/* skaters */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}} className="g2"><SkTable ab={hiAb}/><SkTable ab={loAb}/></div>
  </div>);
}

/* ---------- SERIES DETAIL ---------- */
function SeriesDetail({hiAb,loAb,hiW,loW,onBack,onTeam}){
  const sd=D.seriesDetail(hiAb,loAb,hiW,loW);
  const [tab,setTab]=uS('Team stats');
  const [gm,setGm]=uS(null);
  const [shotGame,setShotGame]=uS('series');
  if(gm)return <GameBox hiAb={hiAb} loAb={loAb} hiW={hiW} loW={loW} gameNo={gm} onBack={()=>setGm(null)} onGame={n=>{setGm(n);window.scrollTo(0,0);}} onTeam={onTeam}/>;
  const TH=({ab,score,win})=>(<div onClick={()=>onTeam(ab)} className="el" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',flex:1,opacity:win?1:0.65}}>
    <Badge ab={ab} size={46}/><div style={{fontWeight:700,fontSize:15,color:T.ink,textAlign:'center'}}>{ct(ab)} {nk(ab)}</div>
    <div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:40,lineHeight:1,color:win?c2(ab):T.faint}}>{score}</div></div>);
  const Cmp=({label,a,b,fmt,hiBetter=true})=>{const toNum=v=>typeof v==='number'?v:(/^\d+:\d+$/.test(v)?(+v.split(':')[0]*60+ +v.split(':')[1]):parseFloat(v)||0);
    const na=toNum(a),nb=toNum(b);const aWin=hiBetter?na>=nb:na<=nb;const tot=(Math.abs(na)+Math.abs(nb))||1;const ap=Math.round(Math.abs(na)/tot*100);
    return(<div style={{padding:'10px 0',borderTop:`1px solid ${T.line}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',fontFamily:MONO,fontSize:13,marginBottom:6}}>
        <span style={{fontWeight:aWin?700:400,color:aWin?T.ink:T.mut,minWidth:64}}>{fmt?fmt(a):a}</span>
        <span style={{...ML,fontSize:10}}>{label}</span>
        <span style={{fontWeight:!aWin?700:400,color:!aWin?T.ink:T.mut,minWidth:64,textAlign:'right'}}>{fmt?fmt(b):b}</span>
      </div>
      <div style={{display:'flex',height:5,borderRadius:3,overflow:'hidden',background:T.bg}}>
        <div style={{width:`${ap}%`,background:c2(hiAb),opacity:aWin?1:.35}}/><div style={{flex:1,background:c2(loAb),opacity:!aWin?1:.35}}/>
      </div></div>);};
  const th=sd.team[hiAb],to=sd.team[loAb],eh=sd.edge[hiAb],eo=sd.edge[loAb];
  const pp=t=>+(t.ppg/t.ppo*100).toFixed(1);
  const shotPct=t=>+(t.goals/t.shots*100).toFixed(1);
  const savePct=(t,opp)=>+((1-opp.goals/t.shotsAgainst)*100).toFixed(1); // unused fallback
  const svp=(self,opp)=>+(((opp.shots-self.goals)/opp.shots)*100).toFixed(1); // team save% = saves/shots faced (shots faced = opp shots)
  const pdo=(self,opp)=>+(shotPct(self)+svp(self,opp)).toFixed(1);
  const Sub=({children})=><div style={{...ML,fontSize:10,color:T.ink,marginTop:16,marginBottom:2,paddingTop:6}}>{children}</div>;
  const LCard=({ab})=>(<div style={{...card,overflow:'hidden'}}>
    <div onClick={()=>onTeam(ab)} className="el" style={{display:'flex',alignItems:'center',gap:9,padding:'12px 15px',borderBottom:`1px solid ${T.line}`,cursor:'pointer'}}><Badge ab={ab} size={22}/><span style={{fontWeight:600,color:T.ink}}>{ct(ab)} {nk(ab)}</span></div>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:330,borderCollapse:'collapse',fontSize:12.5}}>
      <thead><tr style={ML}>{['Skater','G','A','P','+/-','S','S%','PIM','TOI'].map((h,i)=><th key={h} style={{padding:'8px 10px',textAlign:i?'center':'left',fontWeight:600,...ML,fontSize:9}}>{h}</th>)}</tr></thead>
      <tbody>{sd.skaters[ab].map((p,i)=><tr key={i} style={{borderTop:`1px solid ${T.line}`}}>
        <td style={{padding:'7px 10px',whiteSpace:'nowrap'}}><span style={{color:T.ink}}>{p.name}</span> <span style={{color:T.faint,fontFamily:MONO,fontSize:10}}>{p.pos}</span></td>
        <td style={{textAlign:'center',fontFamily:MONO}}>{p.g}</td><td style={{textAlign:'center',fontFamily:MONO}}>{p.a}</td><td style={{textAlign:'center',fontFamily:MONO,fontWeight:700}}>{p.p}</td>
        <td style={{textAlign:'center',fontFamily:MONO,color:p.pm>=0?'#1a8a4f':T.red}}>{p.pm>=0?'+':''}{p.pm}</td>
        <td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.s}</td><td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.sp}</td>
        <td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.pim}</td><td style={{textAlign:'center',fontFamily:MONO,color:T.mut}}>{p.toi}</td></tr>)}</tbody>
    </table></div>
    {(()=>{const g=sd.goalie[ab];return(<div style={{padding:'11px 15px',borderTop:`2px solid ${T.line2}`,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6,fontFamily:MONO,fontSize:11.5,color:T.mut}}>
      <span style={{color:T.ink,fontWeight:600}}>{g.name} <span style={{color:T.faint,fontWeight:400}}>G</span></span>
      <span>{g.w}-{g.l} · {g.svp} SV% · {g.gaa} GAA · {g.saves}/{g.sf} sv · {g.so} SO</span></div>);})()}
  </div>);
  return(<div>
    <button onClick={onBack} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:'0 0 16px'}}>← back to bracket</button>
    {/* header */}
    <div style={{...card,padding:'20px',marginBottom:16}}>
      <div style={{...ML,textAlign:'center',marginBottom:14}}>{sd.done?'Series result':'Series'} · {sd.status}</div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <TH ab={hiAb} score={hiW} win={hiW>=loW}/>
        <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:16,color:T.faint}}>vs</span>
        <TH ab={loAb} score={loW} win={loW>hiW}/>
      </div>
      {/* game-by-game */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginTop:18}}>
        {sd.games.map(g=>{const hw=g.winner==='hi';return(<div key={g.game} onClick={()=>setGm(g.game)} className="ec" style={{border:`1px solid ${T.line2}`,borderRadius:9,padding:'7px 11px',textAlign:'center',minWidth:62,cursor:'pointer'}}>
          <div style={{...ML,fontSize:9,marginBottom:3}}>Game {g.game}</div>
          <div style={{fontFamily:MONO,fontSize:13.5,fontWeight:700,color:T.ink}}><span style={{color:hw?c2(hiAb):T.mut}}>{g.hs}</span><span style={{color:T.faint}}>–</span><span style={{color:!hw?c2(loAb):T.mut}}>{g.ls}</span></div>
          <div style={{fontFamily:MONO,fontSize:8.5,color:T.faint}}>{g.ot?'OT':`${hw?hiAb:loAb}`}</div>
        </div>);})}
      </div>
      <div style={{textAlign:'center',marginTop:10,fontFamily:MONO,fontSize:10.5,color:T.faint}}>tap a game for its box score</div>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>{['Team stats','Skaters','Goalies','Shot map','Edge'].map(s=><Pill key={s} on={tab===s} onClick={()=>setTab(s)}>{s}</Pill>)}</div>
    {tab==='Team stats'&&<div style={{...card,padding:'8px 18px 18px'}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 4px',fontFamily:MONO,fontSize:12}}><span style={{display:'flex',alignItems:'center',gap:7}}><Badge ab={hiAb} size={20}/>{hiAb}</span><span style={{display:'flex',alignItems:'center',gap:7}}>{loAb}<Badge ab={loAb} size={20}/></span></div>
      <Sub>Scoring</Sub>
      <Cmp label="Goals" a={th.goals} b={to.goals}/>
      <Cmp label="Even-strength goals" a={th.esg} b={to.esg}/>
      <Cmp label="Power-play goals" a={th.ppg} b={to.ppg}/>
      <Cmp label="Short-handed goals" a={th.shg} b={to.shg}/>
      <Cmp label="Shooting %" a={shotPct(th)} b={shotPct(to)} fmt={v=>v+'%'}/>
      <Sub>Chances &amp; possession</Sub>
      <Cmp label="Shots on goal" a={th.shots} b={to.shots}/>
      <Cmp label="High-danger chances" a={th.hd} b={to.hd}/>
      <Cmp label="Expected goals (xG)" a={th.xg} b={to.xg} fmt={v=>v.toFixed(1)}/>
      <Cmp label="Faceoff %" a={th.fo} b={to.fo} fmt={v=>v+'%'}/>
      <Cmp label="Takeaways" a={th.take} b={to.take}/>
      <Cmp label="Giveaways" a={th.give} b={to.give} hiBetter={false}/>
      <Sub>Special teams &amp; discipline</Sub>
      <Cmp label="Power play %" a={pp(th)} b={pp(to)} fmt={v=>v+'%'}/>
      <Cmp label="Penalty kill %" a={th.pk} b={to.pk} fmt={v=>v+'%'}/>
      <Cmp label="Hits" a={th.hits} b={to.hits}/>
      <Cmp label="Blocked shots" a={th.blk} b={to.blk}/>
      <Cmp label="Penalty minutes" a={th.pim} b={to.pim} hiBetter={false}/>
      <Sub>Goaltending</Sub>
      <Cmp label="Save %" a={svp(th,to)} b={svp(to,th)} fmt={v=>v+'%'}/>
      <Cmp label="PDO" a={pdo(th,to)} b={pdo(to,th)} fmt={v=>v.toFixed(1)}/>
      <Sub>Goals by period</Sub>
      <div style={{overflowX:'auto',marginTop:6}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,fontFamily:MONO}}>
        <thead><tr style={ML}>{['','1st','2nd','3rd','OT','Total'].map((h,i)=><th key={h} style={{padding:'7px 8px',textAlign:i?'center':'left',fontWeight:600,...ML,fontSize:9.5}}>{h}</th>)}</tr></thead>
        <tbody>{[hiAb,loAb].map(ab=>{const pg=sd.periods[ab];const tot=pg.reduce((s,v)=>s+v,0);return(<tr key={ab} style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'8px',display:'flex',alignItems:'center',gap:7}}><Badge ab={ab} size={18}/>{ab}</td>
          {pg.map((v,i)=><td key={i} style={{textAlign:'center',color:v?T.ink:T.faint}}>{v}</td>)}
          <td style={{textAlign:'center',fontWeight:700}}>{tot}</td></tr>);})}</tbody>
      </table></div>
    </div>}
    {tab==='Skaters'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}} className="g2"><LCard ab={hiAb}/><LCard ab={loAb}/></div>}
    {tab==='Goalies'&&(()=>{const gh=sd.goalie[hiAb],go=sd.goalie[loAb];
      const GH=({ab,g,win})=>(<div onClick={()=>onTeam(ab)} className="el" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',flex:1,opacity:win?1:0.7}}>
        <Badge ab={ab} size={34}/><span style={{fontWeight:700,fontSize:14,color:T.ink,textAlign:'center'}}>{g.name}</span>
        <span style={{fontFamily:MONO,fontSize:11.5,color:T.mut}}>{g.w}-{g.l} · {g.gp} GP</span>
        <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:30,lineHeight:1,color:win?c2(ab):T.faint}}>{g.svp}</span>
        <span style={{...ML,fontSize:9}}>save %</span></div>);
      const gWin=gh.svpN>=go.svpN;
      return(<div style={{...card,padding:'18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}><GH ab={hiAb} g={gh} win={gWin}/><span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:15,color:T.faint}}>vs</span><GH ab={loAb} g={go} win={!gWin}/></div>
        <Sub>Workload</Sub>
        <Cmp label="Saves" a={gh.saves} b={go.saves}/>
        <Cmp label="Shots against" a={gh.sf} b={go.sf}/>
        <Cmp label="Shots against / game" a={gh.sapg} b={go.sapg}/>
        <Cmp label="Goals against" a={gh.ga} b={go.ga} hiBetter={false}/>
        <Cmp label="Goals-against average" a={gh.gaa} b={go.gaa} fmt={v=>v.toFixed(2)} hiBetter={false}/>
        <Sub>Save % by danger</Sub>
        <Cmp label="Overall SV%" a={gh.svpN} b={go.svpN} fmt={v=>v+'%'}/>
        <Cmp label="Even-strength SV%" a={gh.essv} b={go.essv} fmt={v=>v+'%'}/>
        <Cmp label="High-danger SV%" a={gh.hdsv} b={go.hdsv} fmt={v=>v+'%'}/>
        <Cmp label="Mid-danger SV%" a={gh.mdsv} b={go.mdsv} fmt={v=>v+'%'}/>
        <Cmp label="Low-danger SV%" a={gh.ldsv} b={go.ldsv} fmt={v=>v+'%'}/>
        <Sub>Value</Sub>
        <Cmp label="Goals saved above expected" a={gh.gsax} b={go.gsax} fmt={v=>(v>=0?'+':'')+v.toFixed(1)}/>
        <Cmp label="Quality starts" a={gh.qs} b={go.qs}/>
        <Cmp label="Shutouts" a={gh.so} b={go.so}/>
      </div>);})()}
    {tab==='Shot map'&&window.E_ShotMap&&(()=>{
      const tabs=[{key:'series',label:'Full series'},...sd.games.map(gg=>({key:String(gg.game),label:`Game ${gg.game}`}))];
      let g;
      if(shotGame==='series'){g={id:`po-${hiAb}-${loAb}-series`,st:'pre',a:loAb,h:hiAb,sa:to.shots,sh:th.shots,as:to.goals,hs:th.goals};}
      else{const gn=+shotGame,gd=D.gameDetail(hiAb,loAb,hiW,loW,gn),homeAb=gd.home==='hi'?hiAb:loAb,awayAb=gd.home==='hi'?loAb:hiAb;
        g={id:`po-${hiAb}-${loAb}-${gn}`,st:'pre',a:awayAb,h:homeAb,sa:gd.team[awayAb].shots,sh:gd.team[homeAb].shots,as:gd.team[awayAb].goals,hs:gd.team[homeAb].goals};}
      return <window.E_ShotMap g={g} gameTabs={tabs} activeGame={shotGame} onGame={setShotGame}/>;})()}
    {tab==='Edge'&&<div style={{...card,padding:'8px 18px 18px'}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 4px',fontFamily:MONO,fontSize:12}}><span style={{display:'flex',alignItems:'center',gap:7}}><Badge ab={hiAb} size={20}/>{hiAb}</span><span style={{...ML,fontSize:9.5,alignSelf:'center'}}>NHL Edge · series</span><span style={{display:'flex',alignItems:'center',gap:7}}>{loAb}<Badge ab={loAb} size={20}/></span></div>
      <Sub>Skating</Sub>
      <Cmp label="Top skating speed" a={eh.topSkate} b={eo.topSkate} fmt={v=>v+' mph'}/>
      <Cmp label="Avg skating speed" a={eh.avgSkate} b={eo.avgSkate} fmt={v=>v+' mph'}/>
      <Cmp label="20+ mph bursts" a={eh.burst20} b={eo.burst20}/>
      <Cmp label="22+ mph bursts" a={eh.burst22} b={eo.burst22}/>
      <Cmp label="Skating distance" a={eh.dist} b={eo.dist} fmt={v=>v+' mi'}/>
      <Sub>Shooting</Sub>
      <Cmp label="Top shot speed" a={eh.topShot} b={eo.topShot} fmt={v=>v+' mph'}/>
      <Cmp label="Avg shot speed" a={eh.avgShot} b={eo.avgShot} fmt={v=>v+' mph'}/>
      <Cmp label="Shots 90+ mph" a={eh.shot90} b={eo.shot90}/>
      <Cmp label="Shots 100+ mph" a={eh.shot100} b={eo.shot100}/>
      <Sub>Zone &amp; entries</Sub>
      <Cmp label="O-zone time" a={eh.oz} b={eo.oz} fmt={v=>v+'%'}/>
      <Cmp label="Time on attack / gm" a={eh.toa} b={eo.toa}/>
      <Cmp label="Controlled entries" a={eh.entries} b={eo.entries}/>
    </div>}
  </div>);
}

/* ---------- PLAYOFFS ---------- */
function PlayoffsPage({onTeam}){
  const bMock=uM(()=>D.playoffBracket(),[]);
  // overlay the real bracket (series carousel) seeded to live standings when deployed
  const b=window.E_useLive(bMock,()=>window.NHL.playoffFull(),[]);
  const [sel,setSel]=uS(null);
  const [pview,setPview]=uS(()=>{try{return localStorage.getItem('e_pview')||'rink';}catch(e){return 'rink';}});
  const dragRef=React.useRef({down:false,x:0,sl:0});
  const choosePview=v=>{try{localStorage.setItem('e_pview',v);}catch(e){}setPview(v);};
  const open=s=>{ if(s&&s.hi&&s.lo)setSel({hiAb:s.hi.ab,loAb:s.lo.ab,hiW:s.hiW,loW:s.loW}); };
  if(sel)return <SeriesDetail {...sel} onBack={()=>setSel(null)} onTeam={onTeam}/>;
  const Series=({s,size})=>{ if(!s||!s.hi)return <div style={{height:size||54}}/>;
    const hiW=s.hiW>=s.loW;
    const Team=({t,win,w})=>(<div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px 8px 11px',position:'relative'}}>
      <span style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:win?c2(t.ab):'transparent'}}/>
      <Badge ab={t.ab} size={18}/><span style={{flex:1,fontSize:12.5,fontWeight:win?700:500,color:win?T.ink:T.mut,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.ab}</span><span style={{fontFamily:MONO,fontSize:12.5,fontWeight:win?700:400,color:win?T.ink:T.faint}}>{w}</span></div>);
    return(<div onClick={()=>open(s)} className="ec" style={{...card,overflow:'hidden',width:'100%',cursor:'pointer'}}><Team t={s.hi} win={hiW} w={s.hiW}/><div style={{borderTop:`1px solid ${T.line}`}}/><Team t={s.lo} win={!hiW} w={s.loW}/></div>);};
  const Col=({title,list,align})=>(<div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
    <div style={{...ML,textAlign:align||'center',marginBottom:10,fontSize:9.5,whiteSpace:'nowrap'}}>{title}</div>
    <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-around',gap:12}}>{list.map((s,i)=><Series key={i} s={s}/>)}</div>
  </div>);
  // Cup-final hero (East champ vs West champ)
  const f=b.final; const fHiW=f.hiW>=f.loW;
  const FinalRow=({t,win,w})=>{const gold=T.mode==='dark'?'#cda85a':'#9a7c2a';
    return(<div style={{display:'flex',alignItems:'center',gap:9,padding:'10px 12px',position:'relative'}}>
      <span style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:win?c2(t.ab):'transparent'}}/>
      <Badge ab={t.ab} size={22}/>
      <span style={{flex:1,fontWeight:win?700:500,fontSize:13.5,color:win?T.ink:T.mut,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct(t.ab)}</span>
      {win&&<span title="Champion" style={{color:gold,fontSize:13,lineHeight:1}}>★</span>}
      <span style={{fontFamily:SERIF,fontStyle:'italic',fontSize:22,lineHeight:1,color:win?T.ink:T.faint,minWidth:16,textAlign:'right'}}>{w}</span>
    </div>);};
  const CupCol=()=>{const gold=T.mode==='dark'?'#cda85a':'#9a7c2a';
    return(<div style={{minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center'}}>
      <div onClick={()=>open(f)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer',boxShadow:'0 18px 42px -18px rgba(0,0,0,.42)'}}>
        <div style={{height:3,background:'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)'}}/>
        <div style={{...ML,textAlign:'center',color:gold,padding:'11px 0 9px',fontSize:9}}>Stanley Cup Final</div>
        <FinalRow t={f.hi} win={fHiW} w={f.hiW}/>
        <div style={{borderTop:`1px solid ${T.line}`}}/>
        <FinalRow t={f.lo} win={!fHiW} w={f.loW}/>
      </div></div>);};
  const RinkView=()=>{const dark=T.mode==='dark';const bl='#2552c4';
    const onDown=e=>{dragRef.current={down:true,x:e.clientX,sl:e.currentTarget.scrollLeft};e.currentTarget.style.cursor='grabbing';};
    const onMove=e=>{const d=dragRef.current;if(d.down)e.currentTarget.scrollLeft=d.sl-(e.clientX-d.x);};
    const onUp=e=>{dragRef.current.down=false;e.currentTarget.style.cursor='grab';};
    return(<div style={{width:'94vw',maxWidth:1380,position:'relative',left:'50%',transform:'translateX(-50%)',...card,padding:0,overflow:'hidden',marginBottom:18}}>
      <div onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{overflowX:'auto',cursor:'grab',WebkitOverflowScrolling:'touch'}}>
        <div style={{position:'relative',width:'100%',minWidth:1280,height:'min(660px,58vw)'}}>
          <svg viewBox="0 0 1140 640" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
            <defs><linearGradient id="rkice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={dark?'#141b27':'#f1f5fc'}/><stop offset="1" stopColor={dark?'#0f141d':'#e9f0f9'}/></linearGradient></defs>
            <rect x="8" y="8" width="1124" height="624" rx="74" fill="url(#rkice)" stroke={T.line2} strokeWidth="1.5"/>
            {/* atmospheric rink markings — anatomically real, intentionally faint */}
            <g opacity="0.5">
              <line x1="570" y1="12" x2="570" y2="628" stroke={T.red} strokeOpacity="0.32" strokeWidth="3"/>
              <line x1="400" y1="12" x2="400" y2="628" stroke={bl} strokeOpacity="0.3" strokeWidth="6"/>
              <line x1="740" y1="12" x2="740" y2="628" stroke={bl} strokeOpacity="0.3" strokeWidth="6"/>
              <circle cx="570" cy="320" r="124" fill={bl} fillOpacity={dark?"0.08":"0.05"} stroke={bl} strokeOpacity="0.3" strokeWidth="2.5"/><circle cx="570" cy="320" r="5" fill={T.red} fillOpacity="0.4"/>
              <line x1="74" y1="12" x2="74" y2="628" stroke={T.red} strokeOpacity="0.26" strokeWidth="2"/><line x1="1066" y1="12" x2="1066" y2="628" stroke={T.red} strokeOpacity="0.26" strokeWidth="2"/>
              <path d="M74 290 a32 32 0 0 1 0 60" fill={bl} fillOpacity="0.1" stroke={T.red} strokeOpacity="0.3" strokeWidth="2"/>
              <path d="M1066 290 a32 32 0 0 0 0 60" fill={bl} fillOpacity="0.1" stroke={T.red} strokeOpacity="0.3" strokeWidth="2"/>
              {[[180,210],[180,430],[960,210],[960,430]].map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="50" fill="none" stroke={T.red} strokeOpacity="0.18" strokeWidth="2"/><circle cx={cx} cy={cy} r="3.5" fill={T.red} fillOpacity="0.32"/></g>)}
              {[[440,210],[440,430],[700,210],[700,430]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="4" fill={bl} fillOpacity="0.3"/>)}
            </g>
          </svg>
          {[
            {x:105,title:'Round 1',list:b.east.r1},
            {x:250,title:'Round 2',list:b.east.r2},
            {x:395,title:'East Final',list:b.east.cf},
            {x:745,title:'West Final',list:b.west.cf},
            {x:890,title:'Round 2',list:b.west.r2},
            {x:1035,title:'Round 1',list:b.west.r1},
          ].map((c,ci)=>(
            <div key={ci} style={{position:'absolute',top:'3%',bottom:'3%',left:`${c.x/1140*100}%`,transform:'translateX(-50%)',width:128,display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{...ML,fontSize:9,whiteSpace:'nowrap',color:T.mut,background:T.mode==='dark'?'rgba(28,29,35,.7)':'rgba(255,255,255,.72)',border:`1px solid ${T.line}`,borderRadius:999,padding:'3px 11px',marginBottom:11,backdropFilter:'blur(3px)'}}>{c.title}</div>
              <div style={{flex:1,width:'100%',display:'flex',flexDirection:'column',justifyContent:'space-around',gap:11}}>{c.list.map((s,i)=><Series key={i} s={s}/>)}</div>
            </div>
          ))}
          <div style={{position:'absolute',top:0,bottom:0,left:`${570/1140*100}%`,transform:'translateX(-50%)',width:196,display:'flex',flexDirection:'column',justifyContent:'center'}}><CupCol/></div>
        </div>
      </div>
      <div style={{padding:'9px 16px',borderTop:`1px solid ${T.line}`,display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:MONO,fontSize:10.5,color:T.faint}}><span style={{color:c2(b.east.champ.ab),fontWeight:600}}>◄ Eastern</span><span>drag to pan · tap a series for its detail</span><span style={{color:c2(b.west.champ.ab),fontWeight:600}}>Western ►</span></div>
    </div>);
  };
  return(<div>
    <PageHead k="Playoffs" t="Stanley Cup" serif="bracket" right={<div style={{display:'flex',gap:6}}>{[['bracket','Bracket'],['rink','On the rink']].map(([k,l])=><Pill key={k} on={pview===k} onClick={()=>choosePview(k)}>{l}</Pill>)}</div>}/>
    {/* champion banner */}
    <div style={{...card,padding:'18px 20px',marginBottom:18,display:'flex',alignItems:'center',gap:16,background:`linear-gradient(110deg, ${c2(b.cup.ab)}12, transparent)`}}>
      <Badge ab={b.cup.ab} size={44}/>
      <div><div style={ML}>Projected Cup champion</div><div style={{fontFamily:SERIF,fontSize:24,fontStyle:'italic',color:T.ink,marginTop:2}}>{ct(b.cup.ab)} {nk(b.cup.ab)}</div></div>
    </div>
    {/* bracket — two conference wings converging to the center */}
    {pview==='bracket'&&<div style={{...card,padding:'18px 14px 22px',marginBottom:18}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{...ML,fontSize:11,color:c2(b.east.champ.ab)}}>Eastern Conference</span>
        <span style={{...ML,fontSize:11,color:c2(b.west.champ.ab)}}>Western Conference</span>
      </div>
      <div className="brkt" style={{display:'flex',gap:8,alignItems:'stretch',minHeight:430}}>
        <Col title="Round 1" list={b.east.r1} align="left"/>
        <Col title="Round 2" list={b.east.r2}/>
        <Col title="East Final" list={b.east.cf}/>
        <div style={{width:1,background:T.line,margin:'24px 4px 0'}}/>
        <Col title="West Final" list={b.west.cf}/>
        <Col title="Round 2" list={b.west.r2}/>
        <Col title="Round 1" list={b.west.r1} align="right"/>
      </div>
      {/* Cup Final hero */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:6}}>
        <div style={{width:1.5,height:24,background:T.line2}}/>
        <div onClick={()=>open(f)} className="ec" style={{...card,overflow:'hidden',width:'min(380px,100%)',cursor:'pointer',boxShadow:'0 18px 42px -18px rgba(0,0,0,.42)'}}>
          <div style={{height:3,background:'linear-gradient(90deg,#caa24e,#f0dd9c,#caa24e)'}}/>
          <div style={{...ML,textAlign:'center',color:T.mode==='dark'?'#cda85a':'#9a7c2a',padding:'12px 0 9px'}}>Stanley Cup Final</div>
          <FinalRow t={f.hi} win={fHiW} w={f.hiW}/>
          <div style={{borderTop:`1px solid ${T.line}`}}/>
          <FinalRow t={f.lo} win={!fHiW} w={f.loW}/>
        </div>
      </div>
    </div>}
    {pview==='rink'&&<RinkView/>}
    {/* play-in race */}
    <div style={{...ML,marginBottom:10}}>Play-in race · the bubble</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}} className="g2">
      {[['East','Eastern'],['West','Western']].map(([cf,lab])=>(<div key={cf} style={{...card,overflow:'hidden'}}><div style={{padding:'13px 16px',fontSize:14,fontWeight:600,borderBottom:`1px solid ${T.line}`}}>{lab} · seeds 7–10</div>
        {D.playInRace(cf).map((t,i)=><div key={t.ab} onClick={()=>onTeam(t.ab)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
          <span style={{fontFamily:MONO,fontSize:11,width:18,color:i<2?'#1a8a4f':T.faint}}>{i+7}</span><Badge ab={t.ab} size={20}/><span style={{flex:1,fontSize:13.5,color:T.ink}}>{ct(t.ab)} {nk(t.ab)}</span>{i<2&&<span style={{fontFamily:MONO,fontSize:10,color:'#1a8a4f',background:'#e7f5ec',padding:'2px 7px',borderRadius:5}}>WC{i+1}</span>}<span style={{fontFamily:MONO,fontWeight:700,marginLeft:8}}>{t.pts}</span></div>)}</div>))}
    </div>
    <p style={{textAlign:'center',marginTop:18,fontFamily:MONO,fontSize:11,color:T.faint}}>projected from current standings · live via /api/nhl/playoff-bracket</p>
    <style>{`@media(max-width:680px){.g2{grid-template-columns:1fr!important}.brkt{overflow-x:auto;gap:10px!important}.brkt>div{min-width:104px!important}}`}</style>
  </div>);
}

window.E_TOK={T,MONO,SERIF,card,ML};
function DraftPage({onTeam}){
  const NOW=new Date();
  const curDraftYear=NOW.getMonth()>=9?NOW.getFullYear()+1:NOW.getFullYear();
  const years=uM(()=>Array.from({length:6},(_,i)=>curDraftYear-i),[curDraftYear]);
  const [year,setYear]=uS(curDraftYear);
  const isUpcoming=year>=curDraftYear;
  const [tab,setTab]=uS('Draft order');
  const [doView,setDoView]=uS('result');
  const [round,setRound]=uS(1);
  // upcoming draft: projected order (reverse standings) + prospect board + live tracker
  const draftMock=uM(()=>({rankings:D.draftRankings(),picks:D.draftPicks()}),[]);
  const draftLive=window.E_useLive(draftMock,()=>window.NHL.draftFull(curDraftYear),[curDraftYear]);
  const rankings=draftLive.rankings;
  const picks=draftLive.picks;
  // lottery winners come from the REAL post-lottery order when available
  // (buildLotteryPicks flags them); fall back to the editorial sim otherwise.
  const lotWinners=uM(()=>{const w=(picks||[]).filter(p=>p.lotteryWin).map(p=>p.team);return w.length?w:D.lotteryWinners();},[picks]);
  // past draft: real results for the chosen year (mock fallback in preview)
  const pastMock=uM(()=>D.draftPastYear(year),[year]);
  const past=window.E_useLive(pastMock,()=>window.NHL.draftYear(year),[year]);
  // live tracker: prospect-ranking-based predicted FIRST ROUND (32 teams, reverse
  // standings), swapped to the real selection as each pick lands on draft night
  const predicted=uM(()=>{const rev=[...D.STANDINGS].slice().reverse();return rev.map((t,i)=>({pick:i+1,team:t.ab,name:(rankings[i]&&rankings[i].name)||'TBD',pos:(rankings[i]&&rankings[i].pos)||'',league:(rankings[i]&&rankings[i].league)||'',made:false}));},[rankings]);
  const tracker=window.E_useLive(predicted,()=>window.NHL.draftLiveTracker().then(made=>{if(!made||!made.length)return null;const by={};made.forEach(m=>{by[m.pick]=m;});return predicted.map(p=>by[p.pick]?{...p,...by[p.pick],made:true}:p);}),[predicted]);
  const madeCount=tracker.filter(p=>p.made).length;
  const upTabs=['Draft order','Prospect rankings','Mock first round','Live tracker'];
  React.useEffect(()=>{ setTab(isUpcoming?'Draft order':'Results'); setRound(1); },[year,isUpcoming]);
  return(<div>
    <PageHead k="Draft" t={`${year} NHL`} serif="Draft"/>
    <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:16}}>
      <select value={year} onChange={e=>setYear(+e.target.value)} style={{fontFamily:'inherit',background:T.paper,border:`1px solid ${T.line2}`,borderRadius:9,padding:'8px 12px',color:T.ink,fontSize:13.5,fontWeight:600,cursor:'pointer'}}>
        {years.map(y=><option key={y} value={y}>{y}{y>=curDraftYear?' · projected':''}</option>)}
      </select>
      <span style={{fontFamily:MONO,fontSize:11,color:T.faint}}>{isUpcoming?'Upcoming draft — projected order & prospect board':'Completed draft — full results'}</span>
    </div>
    <div key={'y'+year}>
    {isUpcoming&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{upTabs.map(s=><Pill key={s} on={tab===s} onClick={()=>setTab(s)}>{s}</Pill>)}</div>}
    {tab==='Prospect rankings'&&<div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Central Scouting · top 32 prospects</div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:640,borderCollapse:'collapse',fontSize:13.5}}>
        <thead><tr style={ML}>{['#','Prospect','Pos','League','GP','Pts','Ht','Wt','Trend'].map((h,i)=><th key={h} style={{padding:'10px 12px',textAlign:i<2?'left':'center',fontWeight:600,...ML}}>{h}</th>)}</tr></thead>
        <tbody>{rankings.map(p=>(<tr key={p.rank} className="er" style={{borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'9px 12px',fontFamily:MONO,color:p.rank<=5?T.red:T.faint,fontWeight:p.rank<=5?700:400}}>{String(p.rank).padStart(2,'0')}</td>
          <td style={{padding:'9px 12px',fontWeight:600,color:T.ink}}>{p.name}</td>
          <td style={{textAlign:'center',color:T.mut}}>{p.pos}</td><td style={{textAlign:'center',color:T.mut}}>{p.league}</td>
          <td style={{textAlign:'center',color:T.mut}}>{p.gp}</td><td style={{textAlign:'center',fontWeight:700}}>{p.pts}</td>
          <td style={{textAlign:'center',fontFamily:MONO,fontSize:12,color:T.mut}}>{p.ht}</td><td style={{textAlign:'center',fontFamily:MONO,fontSize:12,color:T.mut}}>{p.wt}</td>
          <td style={{textAlign:'center',color:p.trend==='▲'?'#1a8a4f':p.trend==='▼'?T.red:T.faint}}>{p.trend}</td>
        </tr>))}</tbody>
      </table></div>
    </div>}
    {tab==='Mock first round'&&<div>
      <div style={{...card,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',background:`linear-gradient(110deg, ${T.bg}, transparent)`}}>
        <span style={{...ML}}>Lottery winners</span>
        {lotWinners.map(ab=>{const p=picks.find(x=>x.team===ab);if(!p)return null;return(
          <div key={ab} onClick={()=>onTeam(ab)} className="el" style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
            <Badge ab={ab} size={24}/><span style={{fontWeight:600,fontSize:13}}>{ct(ab)}</span>
            <span style={{fontFamily:MONO,fontSize:11,color:'#1a8a4f'}}>#{p.pick} · ▲{p.moved} from #{p.slot}</span>
          </div>);})}
      </div>
      <div style={{display:'flex',gap:16,marginBottom:12,fontFamily:MONO,fontSize:11,color:T.faint,flexWrap:'wrap',padding:'0 2px'}}>
        <span><b style={{color:T.mut}}>Expected</b> = pre-lottery slot (reverse standings)</span>
        <span><b style={{color:T.mut}}>Landed</b> = post-lottery draft position</span>
        <span style={{color:'#1a8a4f'}}>▲ moved up</span><span style={{color:T.red}}>▼ slid back</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
      {picks.map(p=>{const up=p.moved>0,down=p.moved<0;return(
        <div key={p.pick} className="ec" style={{...card,padding:'13px 15px',display:'flex',alignItems:'center',gap:13,border:p.lotteryWin?`1px solid ${T.posFg}55`:`1px solid ${T.line}`}}>
        <div style={{textAlign:'center',width:40,flexShrink:0}}>
          <div style={{fontFamily:MONO,fontSize:8.5,letterSpacing:'.08em',textTransform:'uppercase',color:T.faint}}>Landed</div>
          <div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:28,lineHeight:1,color:p.lotteryWin?'#1a8a4f':T.ink}}>{p.pick}</div>
        </div>
        <div onClick={()=>onTeam(p.team)} className="el" style={{cursor:'pointer',flexShrink:0}}><Badge ab={p.team} size={26}/></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:13,fontWeight:600,color:T.ink}}>{ct(p.team)}</span>{p.lotteryWin&&<span style={{fontFamily:MONO,fontSize:9.5,color:'#1a8a4f',background:'#e7f5ec',padding:'1px 6px',borderRadius:5}}>LOTTERY</span>}</div>
          <div style={{fontWeight:600,color:T.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginTop:2}}>{p.name}</div>
          <div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{p.pos} · {p.league}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0,borderLeft:`1px solid ${T.line}`,paddingLeft:12}}>
          <div style={{fontFamily:MONO,fontSize:8.5,letterSpacing:'.08em',textTransform:'uppercase',color:T.faint}}>Expected</div>
          <div style={{fontFamily:MONO,fontSize:16,fontWeight:600,color:T.mut}}>#{p.slot}</div>
          <div style={{fontFamily:MONO,fontSize:11,fontWeight:700,color:up?'#1a8a4f':down?T.red:T.faint}}>{up?`▲ ${p.moved}`:down?`▼ ${Math.abs(p.moved)}`:'—'}</div>
        </div>
      </div>);})}
      </div>
    </div>}
    {tab==='Draft order'&&<div>
      {(()=>{const proj1=picks.find(p=>p.slot===1),won1=picks.find(p=>p.pick===1);const held=proj1&&won1&&proj1.team===won1.team;
        const Cell=({k,p,tone})=>(<div onClick={()=>onTeam(p.team)} className="el" style={{cursor:'pointer',flex:'1 1 200px'}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:'.08em',textTransform:'uppercase',color:tone}}>{k}</div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:7}}><Badge ab={p.team} size={34}/><div><div style={{fontWeight:700,fontSize:16,color:T.ink}}>{ct(p.team)} {nk(p.team)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{k.includes('Projected')?`pre-lottery slot #${p.slot}`:`won the draw · was slotted #${p.slot}`}</div></div></div>
        </div>);
        return(<div style={{...card,padding:'16px 18px',marginBottom:14,display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
          <Cell k="Projected 1st overall" p={proj1} tone={T.mut}/>
          <div style={{fontFamily:SERIF,fontStyle:'italic',fontSize:22,color:T.faint,textAlign:'center'}}>{held?'held':'→'}</div>
          <Cell k="Won the lottery · picks 1st" p={won1} tone="#1a8a4f"/>
          {!held&&proj1&&<div style={{flexBasis:'100%',fontFamily:MONO,fontSize:11.5,color:T.mut,borderTop:`1px solid ${T.line}`,paddingTop:10}}>{ct(won1.team)} leapt <b style={{color:'#1a8a4f'}}>▲{won1.moved}</b> spots to grab the top pick — {ct(proj1.team)}, the league's worst, slid to <b style={{color:T.red}}>#{proj1.pick}</b>.</div>}
        </div>);})()}
      <div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
        <span style={ML}>{doView==='result'?'First round · post-lottery order':'Projected order · pre-lottery (reverse standings)'}</span>
        <div style={{display:'flex',gap:6}}>{[['result','Lottery result'],['projected','Projected order']].map(([k,l])=><Pill key={k} on={doView===k} onClick={()=>setDoView(k)}>{l}</Pill>)}</div>
      </div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:680,borderCollapse:'collapse',fontSize:13.5}}>
        <thead><tr style={ML}>{[doView==='result'?'Pick':'Proj','Team','Prospect','Pos','League',doView==='result'?'Exp':'Landed','Move'].map((h,i)=><th key={h} style={{padding:'11px 12px',textAlign:i===1||i===2?'left':'center',fontWeight:600,...ML}}>{h}</th>)}</tr></thead>
        <tbody>{[...picks].sort((a,b)=>doView==='result'?a.pick-b.pick:a.slot-b.slot).map(p=>{const up=p.moved>0,down=p.moved<0;const hot=doView==='result'?p.lotteryWin:p.slot===1;return(<tr key={p.pick} onClick={()=>onTeam(p.team)} className="er" style={{cursor:'pointer',borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'10px 12px',fontFamily:MONO,fontWeight:700,color:hot?'#1a8a4f':T.ink}}>{String(doView==='result'?p.pick:p.slot).padStart(2,'0')}</td>
          <td style={{padding:'10px 12px'}}><span style={{display:'inline-flex',alignItems:'center',gap:9}}><Badge ab={p.team} size={22}/><span style={{fontWeight:600,color:T.ink}}>{ct(p.team)} {nk(p.team)}</span>{p.lotteryWin&&<span style={{fontFamily:MONO,fontSize:9,color:'#1a8a4f',background:'#e7f5ec',padding:'1px 5px',borderRadius:5}}>LOTTERY</span>}</span></td>
          <td style={{padding:'10px 12px',color:T.ink}}>{p.name}</td>
          <td style={{textAlign:'center',color:T.mut}}>{p.pos}</td>
          <td style={{textAlign:'center',color:T.mut,fontFamily:MONO,fontSize:12}}>{p.league}</td>
          <td style={{textAlign:'center',fontFamily:MONO,color:T.faint}}>#{doView==='result'?p.slot:p.pick}</td>
          <td style={{textAlign:'center',fontFamily:MONO,fontSize:12,fontWeight:700,color:up?'#1a8a4f':down?T.red:T.faint}}>{up?`▲${p.moved}`:down?`▼${Math.abs(p.moved)}`:'—'}</td>
        </tr>);})}</tbody>
      </table></div>
      <div style={{padding:'10px 16px',fontFamily:MONO,fontSize:11,color:T.faint,borderTop:`1px solid ${T.line}`}}>{doView==='result'?'Pick = post-lottery position · Exp = pre-lottery slot (reverse standings)':'Proj = pre-lottery slot (reverse standings) · Landed = actual post-lottery pick'} · ▲▼ = lottery movement</div>
    </div>
    </div>}
    {tab==='Live tracker'&&(()=>{const list=tracker;return(<div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
        <span style={{fontFamily:MONO,fontSize:11.5,fontWeight:600,color:T.ink}}>First round</span>
        <span style={{marginLeft:'auto',fontFamily:MONO,fontSize:11,color:madeCount?'#1a8a4f':T.faint}}>{madeCount?`${madeCount} picks in`:'Predicted order — updates live on draft night'}</span>
      </div>
      <div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><span style={{display:'inline-flex',alignItems:'center',gap:8}}>{madeCount>0&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>}First round · {list.length} picks</span><span style={{color:T.faint}}>{list.length?`picks ${list[0].pick}–${list[list.length-1].pick}`:''}</span></div>
      <div>{list.map((p,i)=>(<div key={p.pick} onClick={()=>onTeam(p.team)} className="er" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer',background:p.made?'rgba(26,138,79,.05)':'transparent'}}>
        <span style={{fontFamily:MONO,fontSize:12,color:p.made?'#1a8a4f':T.faint,fontWeight:p.made?700:400,width:30}}>{p.pick}</span>
        <Badge ab={p.team} size={22}/>
        <span style={{width:40,fontFamily:MONO,fontSize:11,color:T.mut}}>{p.team}</span>
        <span style={{flex:1,fontWeight:600,color:T.ink,minWidth:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</span>
        <span style={{fontFamily:MONO,fontSize:9,padding:'1px 6px',borderRadius:5,flexShrink:0,...(p.made?{color:T.posFg,background:T.posBg}:{color:T.faint,background:T.bg})}}>{p.made?'PICKED':'PROJECTED'}</span>
        <span style={{fontFamily:MONO,fontSize:11.5,color:T.mut,whiteSpace:'nowrap',width:92,textAlign:'right'}}>{p.pos} · {p.league}</span>
      </div>))}</div>
      <div style={{padding:'10px 16px',fontFamily:MONO,fontSize:11,color:T.faint,borderTop:`1px solid ${T.line}`}}>PROJECTED = consensus prospect ranking slotted into the projected order · PICKED = the real selection, swapped in live as it's announced</div>
    </div>
    </div>);})()}
    {!isUpcoming&&(()=>{const rl=past.rounds||[1];const list=(past.picks||[]).filter(p=>p.round===round);return(<div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>{rl.map(n=><Pill key={n} on={round===n} onClick={()=>setRound(n)}>Round {n}</Pill>)}</div>
      <div style={{...card,overflow:'hidden'}}>
      <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><span>{year} Draft · Round {round} · {list.length} picks</span><span style={{color:T.faint}}>{list.length?`picks ${list[0].pick}–${list[list.length-1].pick}`:''}</span></div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',minWidth:680,borderCollapse:'collapse',fontSize:13.5}}>
        <thead><tr style={ML}>{['#','Team','Player','Pos','League','Club'].map((h,i)=><th key={h} style={{padding:'11px 12px',textAlign:i===1||i===2||i===5?'left':'center',fontWeight:600,...ML}}>{h}</th>)}</tr></thead>
        <tbody>{list.map(p=>(<tr key={p.pick} onClick={()=>onTeam(p.team)} className="er" style={{cursor:'pointer',borderTop:`1px solid ${T.line}`}}>
          <td style={{padding:'10px 12px',fontFamily:MONO,fontWeight:700,color:p.pick<=3?T.red:T.ink}}>{String(p.pick).padStart(2,'0')}</td>
          <td style={{padding:'10px 12px'}}><span style={{display:'inline-flex',alignItems:'center',gap:9}}><Badge ab={p.team} size={22}/><span style={{fontWeight:600,color:T.ink}}>{ct(p.team)||p.team}</span></span></td>
          <td style={{padding:'10px 12px',fontWeight:600,color:T.ink}}>{p.name||'—'}</td>
          <td style={{textAlign:'center',color:T.mut}}>{p.pos}</td>
          <td style={{textAlign:'center',color:T.mut,fontFamily:MONO,fontSize:12}}>{p.league}</td>
          <td style={{padding:'10px 12px',color:T.mut,fontFamily:MONO,fontSize:12}}>{p.club||'—'}</td>
        </tr>))}</tbody>
      </table></div>
      <div style={{padding:'10px 16px',fontFamily:MONO,fontSize:11,color:T.faint,borderTop:`1px solid ${T.line}`}}>{year} NHL Draft — full results, all seven rounds</div>
    </div>
    </div>);})()}
    </div>
  </div>);
}

window.E_TOK={T,MONO,SERIF,card,ML};
window.E_UI={Eyebrow,PageHead,Badge,Spark,Pill,PlayerAvatar};

/* ---------- HIGHLIGHTS (the Lab front page) ---------- */
function HighlightsPage({onGame,onTeam,onPlayer,onGo,favs,booting}){
  const fav=favs||[];
  const today=D.slate(0);
  const live=today.filter(g=>g.st==='live');
  const [railView,setRailView]=uS('Tonight');
  const [ldrCat,setLdrCat]=uS('Points');
  const railGames=railView==='Tonight'?today:railView==='Recent'?D.slate(-1):D.slate(1);

  // Game of the Night: closest live game, else marquee upcoming (best combined rank),
  // else a recent final. Recomputed every render so it tracks live slates as they load.
  const gotn=(()=>{
    if(live.length) return [...live].sort((a,b)=>Math.abs(a.as-a.hs)-Math.abs(b.as-b.hs))[0];
    const pre=today.filter(g=>g.st==='pre'); if(pre.length) return [...pre].sort((a,b)=>(D.rankOf[a.a]+D.rankOf[a.h])-(D.rankOf[b.a]+D.rankOf[b.h]))[0];
    return today[0]||D.slate(-1)[0]||D.slate(1)[0]||null;
  })();
  const topScorer=ab=>D.teamRoster(ab)[0];

  // storylines: one curated card per domain
  const sv=s=>{const k=s.strk[0],n=parseInt(s.strk.slice(1),10)||0;return k==='W'?n:k==='L'?-n:0;};
  const hottest=[...D.STANDINGS].filter(t=>t.strk[0]==='W').sort((a,b)=>sv(b)-sv(a))[0];
  const coldest=[...D.STANDINGS].filter(t=>t.strk[0]==='L').sort((a,b)=>sv(a)-sv(b))[0];
  const wcBubble=D.STANDINGS.filter(t=>t.conf==='East')[7];
  const edgeStar=(D.edgeLeaders?D.edgeLeaders('top'):[])[0];
  const ptsLeader=D.skaterLeaders('p')[0];
  const draftLeader=[...D.STANDINGS][D.STANDINGS.length-1];
  const ldrKey={Points:'p',Goals:'g','Save%':'svp'};

  const Hero=()=>{const g=gotn; if(!g)return(
    <div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'10px 18px',borderBottom:`1px solid ${T.line}`}}><span style={ML}>Game of the night</span></div>
      <div style={{padding:'48px 18px',textAlign:'center'}}>
        <div style={{fontFamily:SERIF,fontSize:22,color:T.ink,marginBottom:6}}>No games on the schedule</div>
        <div style={{fontSize:13,color:T.mut}}>It's a quiet night around the league — check Scores for the full calendar.</div>
      </div>
    </div>);
    const aw=g.st.startsWith('final')&&g.as>g.hs,hw=g.st.startsWith('final')&&g.hs>g.as;
    const as_=topScorer(g.a),hs_=topScorer(g.h);
    return(<div onClick={()=>onGame(g)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer',marginBottom:16}}>
      <div style={{padding:'10px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.line}`}}>
        <span style={ML}>Game of the night</span>
        <span style={{fontFamily:MONO,fontSize:11,color:g.st==='live'?T.red:g.st.startsWith('final')?T.faint:'#1a8a4f',display:'inline-flex',alignItems:'center',gap:6}}>{g.st==='live'&&<span className="ed-pulse" style={{width:6,height:6,borderRadius:99,background:T.red,display:'inline-block'}}/>}{g.st==='live'?`Live · ${g.per} ${g.clk}`:g.st.startsWith('final')?(g.ot?'Final/OT':'Final'):`Tonight · ${g.start}`}</span>
      </div>
      <div style={{padding:'24px 18px',background:`linear-gradient(110deg, ${c2(g.a)}0e, ${c2(g.h)}0e)`,display:'flex',alignItems:'center',justifyContent:'center',gap:24,flexWrap:'wrap'}}>
        {[[g.a,g.as,aw,as_],[g.h,g.hs,hw,hs_]].map(([ab,sc,won,star],idx)=>(<React.Fragment key={ab}>
          <div style={{textAlign:'center',minWidth:130}}><Badge ab={ab} size={48}/><div style={{fontWeight:700,marginTop:8,fontSize:15}}>{ct(ab)} {nk(ab)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut,marginTop:2}}>#{D.rankOf[ab]} · {D.standBy(ab).w}-{D.standBy(ab).l}-{D.standBy(ab).otl}</div>{star&&<div style={{fontSize:11.5,color:T.mut,marginTop:6}}>{star.name.split(' ').slice(-1)[0]} · {star.p}P</div>}</div>
          {idx===0&&<div style={{textAlign:'center'}}><div style={{fontSize:46,fontWeight:600,letterSpacing:'-.03em',color:T.ink}}>{g.st==='pre'?'@':`${g.as}:${g.hs}`}</div></div>}
        </React.Fragment>))}
      </div>
    </div>);};

  const story=(tag,headline,sub,onClick,accent)=>(<div onClick={onClick} className="ec" style={{...card,padding:'16px 17px',cursor:'pointer'}}>
    <div style={{fontFamily:MONO,fontSize:10.5,letterSpacing:'.12em',textTransform:'uppercase',color:accent||T.red}}>{tag}</div>
    <div style={{fontFamily:SERIF,fontSize:18,lineHeight:1.25,color:T.ink,margin:'7px 0 5px'}}>{headline}</div>
    <div style={{fontSize:12.5,color:T.mut}}>{sub}</div>
  </div>);

  // First live hydrate still in flight → show the page's shape as skeletons rather than
  // a flash of mock numbers. Resolves to real content the instant the feed lands (and to
  // mock if there's no live feed, so it never hangs on shimmer).
  if(booting) return(<div>
    <PageHead k="The Lab" t="Tonight around the" serif="league"/>
    <div className="ed-skel" style={{height:230,borderRadius:14,marginBottom:16}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(158px,1fr))',gap:10,marginBottom:16}}>
      {Array.from({length:8},(_,i)=><div key={i} className="ed-skel" style={{height:84,borderRadius:12}}/>)}
    </div>
    <div className="ed-skel" style={{height:13,width:210,borderRadius:7,marginBottom:12}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:18}}>
      {Array.from({length:6},(_,i)=><div key={i} className="ed-skel" style={{height:92,borderRadius:12}}/>)}
    </div>
    <div className="ed-skel" style={{height:300,borderRadius:14}}/>
  </div>);

  return(<div>
    <PageHead k="The Lab" t="Tonight around the" serif="league"/>
    {fav.length>0&&<div style={{marginBottom:18}}>
      <div style={{...ML,marginBottom:10}}>Your teams</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:12}}>
        {fav.map(ab=>{const s=D.teamSchedule(ab),st=D.standBy(ab),last=s.rec[0],next=s.up[0];
          const lastInfo=g=>{if(!g)return null;const home=g.h===ab,us=home?g.hs:g.as,them=home?g.as:g.hs,won=us>them,opp=home?g.a:g.h;return{won,txt:`${won?'W':'L'} ${us}–${them} ${home?'vs':'@'} ${opp}`};};
          const li=lastInfo(last);
          return(<div key={ab} onClick={()=>onTeam(ab)} className="ec" style={{...card,overflow:'hidden',cursor:'pointer'}}>
            <div style={{height:4,background:c2(ab)}}/>
            <div style={{padding:'12px 14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}><Badge ab={ab} size={26}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13.5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ct(ab)} {nk(ab)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>{st.w}-{st.l}-{st.otl} · #{D.rankOf[ab]}</div></div></div>
              <div style={{display:'flex',justifyContent:'space-between',gap:8,fontFamily:MONO,fontSize:11.5,padding:'5px 0',borderTop:`1px solid ${T.line}`}}><span style={{color:T.faint}}>LAST</span><span style={{color:li?(li.won?'#1a8a4f':T.red):T.faint,fontWeight:600}}>{li?li.txt:'—'}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',gap:8,fontFamily:MONO,fontSize:11.5,padding:'5px 0',borderTop:`1px solid ${T.line}`}}><span style={{color:T.faint}}>NEXT</span><span style={{color:T.ink,fontWeight:600}}>{next?`${next.h===ab?'vs':'@'} ${next.h===ab?next.a:next.h} · ${next.start||''}`:'—'}</span></div>
            </div>
          </div>);})}
      </div>
    </div>}
    <Hero/>
    {/* tonight rail */}
    <div style={{...card,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'11px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.line}`,gap:8,flexWrap:'wrap'}}>
        <span style={ML}>{railView==='Tonight'?(today.length?`${today.length} games tonight`:'No games tonight'):railView}</span>
        <div style={{display:'flex',gap:6}}>{['Recent','Tonight','Upcoming'].map(v=><Pill key={v} on={railView===v} onClick={()=>setRailView(v)}>{v}</Pill>)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(158px,1fr))',marginTop:-1,marginLeft:-1}}>
        {railGames.length?railGames.map((g,i)=>{const aw=g.st.startsWith('final')&&g.as>g.hs,hw=g.st.startsWith('final')&&g.hs>g.as;return(
          <div key={g.id} onClick={()=>onGame(g)} className="er" style={{borderTop:`1px solid ${T.line}`,borderLeft:`1px solid ${T.line}`,padding:'12px 15px',cursor:'pointer'}}>
            <div style={{fontFamily:MONO,fontSize:10,color:g.st==='live'?T.red:T.faint,marginBottom:7}}>{g.st==='live'?`${g.per} ${g.clk}`:g.st.startsWith('final')?(g.ot?'F/OT':'Final'):g.start}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:4}}><span style={{display:'flex',alignItems:'center',gap:6}}><Badge ab={g.a} size={16}/><span style={{fontSize:12.5,fontWeight:aw?700:500}}>{g.a}</span></span>{g.st!=='pre'&&<span style={{fontFamily:MONO,fontWeight:aw?700:400}}>{g.as}</span>}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6}}><span style={{display:'flex',alignItems:'center',gap:6}}><Badge ab={g.h} size={16}/><span style={{fontSize:12.5,fontWeight:hw?700:500}}>{g.h}</span></span>{g.st!=='pre'&&<span style={{fontFamily:MONO,fontWeight:hw?700:400}}>{g.hs}</span>}</div>
          </div>);}):<div style={{padding:'18px 16px',fontFamily:MONO,fontSize:12,color:T.mut}}>no games</div>}
      </div>
    </div>
    {/* storylines — one curated card per domain */}
    <div style={{...ML,marginBottom:10}}>Storylines · what changed today</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:18}}>
      {hottest&&story('Hot streak',`${ct(hottest.ab)} are surging`,`${hottest.strk} · climbing the ${hottest.conf==='East'?'East':'West'}`,()=>onTeam(hottest.ab))}
      {wcBubble&&story('Wild-card race',`${ct(wcBubble.ab)} cling to the final spot`,`${wcBubble.pts} pts · East bubble — tap for the race`,()=>onGo('standings'),'#b5762a')}
      {edgeStar&&story('NHL Edge',`${edgeStar.name} is flying`,`${edgeStar._v} mph top skating speed — league leader`,()=>onPlayer(edgeStar),'#1a8a4f')}
      {ptsLeader&&story('Scoring watch',`${ptsLeader.name} pacing the league`,`${ptsLeader.p} pts · ${ptsLeader.g}G ${ptsLeader.a}A`,()=>onPlayer(ptsLeader))}
      {coldest&&story('Cold snap',`${ct(coldest.ab)} can't buy a win`,`${coldest.strk} · sliding fast`,()=>onTeam(coldest.ab),T.faint)}
      {draftLeader&&story('Draft lottery',`${ct(draftLeader.ab)} lead the lottery odds`,`${draftLeader.pts} pts · eyes on the prize`,()=>onGo('draft'),'#b5762a')}
    </div>
    {/* leaders peek + your teams */}
    <div style={{display:'grid',gridTemplateColumns:fav.length?'1fr 1fr':'1fr',gap:16}} className="g2">
      <div style={{...card,overflow:'hidden'}}>
        <div style={{padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.line}`,gap:8,flexWrap:'wrap'}}><span style={ML}>League leaders</span><div style={{display:'flex',gap:6}}>{['Points','Goals','Save%'].map(c=><Pill key={c} on={ldrCat===c} onClick={()=>setLdrCat(c)}>{c}</Pill>)}</div></div>
        {(ldrCat==='Save%'?D.goalieLeaders().filter(g=>g.gp>=12).slice(0,6).map(g=>({...g,type:'goalie',_v:g.svp})):D.skaterLeaders(ldrKey[ldrCat]).slice(0,6).map(p=>({...p,_v:p[ldrKey[ldrCat]]}))).map((p,i)=>(
          <div key={p.id} onClick={()=>onPlayer(p)} className="er" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}><span style={{fontFamily:MONO,fontSize:11,color:i===0?T.red:T.faint,width:14}}>{i+1}</span><Badge ab={p.team} size={20}/><span style={{flex:1,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</span><span style={{fontFamily:MONO,fontSize:13,fontWeight:700}}>{p._v}</span></div>))}
      </div>
      {fav.length>0&&<div style={{...card,overflow:'hidden'}}>
        <div style={{padding:'13px 16px',...ML,borderBottom:`1px solid ${T.line}`}}>Your teams</div>
        {fav.map((ab,i)=>{const t=D.standBy(ab);if(!t)return null;let next=null;for(let o=0;o<=4&&!next;o++)D.slate(o).forEach(g=>{if(!next&&(g.a===ab||g.h===ab)&&g.st!=='final'&&!g.st.startsWith('final'))next=g;});
          return(<div key={ab} onClick={()=>onTeam(ab)} className="er" style={{display:'flex',alignItems:'center',gap:11,padding:'11px 16px',borderTop:i?`1px solid ${T.line}`:'none',cursor:'pointer'}}>
            <Badge ab={ab} size={26}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:600}}>{ct(ab)} {nk(ab)}</div><div style={{fontFamily:MONO,fontSize:11,color:T.mut}}>#{D.rankOf[ab]} · {t.w}-{t.l}-{t.otl} · {t.pts}p</div></div>
            <div style={{textAlign:'right',fontFamily:MONO,fontSize:11,color:T.faint}}>{next?`next ${next.a===ab?'vs '+next.h:'@ '+next.a}`:'—'}</div>
          </div>);})}
      </div>}
    </div>
    {!fav.length&&<div style={{...card,padding:'16px 18px',marginTop:16,fontFamily:MONO,fontSize:12,color:T.mut,textAlign:'center'}}>★ Star a team (Teams page or ⌘K) to pin it here</div>}
    {/* jump tiles */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginTop:16}}>
      {[['Hockey IQ','iq','NHL Edge analytics'],['Stats','stats','Leaders & totals'],['Draft','draft','2026 prospects'],['Records','records','All-time book']].map(([lab,k,sub])=>(
        <div key={k} onClick={()=>onGo(k)} className="ec" style={{...card,padding:'15px 16px',cursor:'pointer'}}><div style={{fontSize:15,fontWeight:600}}>{lab} <span style={{color:T.faint}}>→</span></div><div style={{fontFamily:MONO,fontSize:11,color:T.mut,marginTop:3}}>{sub}</div></div>))}
    </div>
    <style>{`@media(max-width:680px){.g2{grid-template-columns:1fr!important}}`}</style>
  </div>);
}

/* ---------- LEGAL ---------- */
const LEGAL_DOCS={
  terms:{title:'Terms of Service',updated:'June 1, 2026',body:[
    ['Who we are','The Hockey Lab ("the Lab", "we", "us", "our") is an independent, non-commercial hockey-analytics project operated by an individual hobbyist. It is not an incorporated business. References to "we" describe the project operator, not a registered company. If the project is ever incorporated, this document will be updated to name the entity.'],
    ['Acceptance of these terms','By accessing or using The Hockey Lab you agree to these Terms of Service and to our Privacy, Cookie, and Acceptable Use policies. If you do not agree, please do not use the site. We may revise these Terms at any time by posting an updated version; the "last updated" date reflects the latest change, and continued use after a change means you accept it.'],
    ['Eligibility','The site is intended for a general audience interested in hockey statistics. It is not directed at children under 13, and we do not knowingly collect information from them (see the Privacy Policy).'],
    ['What the Lab provides','The Hockey Lab presents NHL scores, standings, schedules, player and team statistics, NHL EDGE tracking metrics, playoff projections, mock draft and lottery scenarios, and historical records. Much of this is aggregated from public NHL data sources and some is modeled or projected by us. It is provided for informational and entertainment purposes only.'],
    ['Accuracy & projections','We work to present data faithfully but make no warranty that any figure, projection, or model output is accurate, complete, or current. Projections — including playoff brackets, draft order, lottery outcomes, and EDGE estimates — are derived models and will differ from official results. Do not rely on the Lab for any decision that has financial, legal, or other consequences.'],
    ['Acceptable use','Your use of the Lab is governed by our Acceptable Use Policy. In short: personal, lawful, non-commercial use only; no scraping, bulk extraction, resale, or redistribution of the data; and no attempts to disrupt or misuse the service or its API proxy.'],
    ['Intellectual property','The Lab\'s original design, code, and written content are owned by the project operator (see the Copyright Notice). NHL data, team names, logos, and related marks belong to the National Hockey League and its clubs and are used here for informational and editorial purposes only. The Lab is not affiliated with, endorsed by, or sponsored by the NHL.'],
    ['Third-party links & services','The site may link to third-party sites (e.g. broadcasters, ticketing, or betting partners) and fetches data from public NHL APIs. We do not control and are not responsible for third-party content, availability, or practices. Some links may be affiliate links (see the Affiliate Disclosure).'],
    ['"As is" / no warranty','The Lab is provided "as is" and "as available," without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uptime, error-free operation, or that the site will be secure or free of harmful components.'],
    ['Limitation of liability','To the fullest extent permitted by law, the project operator will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising from your use of (or inability to use) the Lab. Because the Lab is a free, non-commercial project, any direct liability is limited to the amount you paid to use it — which is zero.'],
    ['Changes & discontinuation','As a hobby project, the Lab may change, pause, or shut down at any time without notice. Features may be added or removed at our discretion.'],
    ['Governing terms','These Terms, together with the policies linked in the footer, are the entire agreement between you and the Lab regarding the site. If any provision is unenforceable, the rest remains in effect.'],
    ['Contact','Questions about these Terms can be raised through the project\'s public repository on GitHub.'],
  ]},
  privacy:{title:'Privacy Policy',updated:'June 1, 2026',body:[
    ['Our approach','The Hockey Lab is built to need as little of your data as possible. There are no user accounts, no sign-ups, and no profiles. We do not sell, rent, or trade personal information — we do not collect it in the first place.'],
    ['What we do not collect','We do not ask for your name, email, address, or payment details. We do not run advertising networks or third-party trackers that build a profile of you.'],
    ['Information stored on your device','Your preferences — followed teams and selected season — are saved in your browser\'s localStorage. This stays on your device, is readable only by this site, and is never transmitted to us. Clearing your browser storage removes it.'],
    ['Automatically-processed data','Like any website, when your browser requests pages or data, standard technical information (such as IP address and user-agent) is processed transiently by the hosting/CDN provider (Cloudflare) to deliver the site and protect against abuse. We do not use this to identify you, and we do not retain our own copy.'],
    ['Optional analytics','If privacy-respecting, cookie-free analytics are ever enabled, they collect only aggregate, anonymous metrics (e.g. page views, country, device type) and never personal data. This policy will name the provider if/when that happens.'],
    ['Third-party data sources','Game and player data is fetched through our edge proxy from public NHL APIs (api-web.nhle.com, api.nhle.com, records.nhl.com). Your browser does not call those services directly; the proxy does. Their data practices are their own.'],
    ['Children','The Lab is not directed at children under 13 and we do not knowingly collect their personal information. Since we collect no personal information from anyone, this is inherent to the design.'],
    ['Your choices','You can clear locally-stored preferences at any time via your browser settings. Because we hold no account or personal data, there is nothing for us to delete on our side.'],
    ['Changes','We may update this policy as the project evolves (for example, if it becomes an incorporated business or adds analytics). Material changes will be reflected in the "last updated" date.'],
    ['Contact','Privacy questions can be raised through the project\'s public GitHub repository.'],
  ]},
  cookies:{title:'Cookie Policy',updated:'June 1, 2026',body:[
    ['Summary','The Hockey Lab does not use advertising or cross-site tracking cookies. We rely on a small amount of first-party browser storage to make personalization work.'],
    ['What we use','We use localStorage (not cookies) to remember your followed teams and chosen season so features like "Your teams" on the Highlights page persist between visits. This data is first-party, stays on your device, and is not shared.'],
    ['Strictly-necessary technology','Our host (Cloudflare) may set strictly-necessary cookies or tokens to deliver content securely and mitigate abuse. These are essential to the site functioning and are not used for advertising.'],
    ['No advertising or analytics cookies','We do not set marketing cookies, advertising pixels, or third-party analytics cookies. If cookie-based analytics are ever introduced, this policy and a consent mechanism will be added first.'],
    ['Managing storage','You can block or clear site storage and cookies in your browser settings. Doing so will reset your saved teams and season but will not prevent you from using the Lab.'],
  ]},
  copyright:{title:'Copyright Notice',updated:'June 1, 2026',body:[
    ['Original content','The design, layout, source code, written copy, and original visualizations of The Hockey Lab are \u00A9 2026 the project operator. All rights reserved. The Lab is an independent project and not an incorporated business; rights are held by the individual operator until/unless a legal entity is formed.'],
    ['NHL data and marks','NHL game data, statistics, schedules, EDGE metrics, team names, logos, uniforms, and related trademarks are the property of the National Hockey League and its member clubs. They appear on the Lab solely for informational, editorial, and analytical purposes. The Lab claims no ownership of, and no affiliation with, the NHL or its marks.'],
    ['Permitted use','You may view the Lab and share links to it. You may quote small portions of our original commentary with attribution. You may not copy, scrape, or republish the Lab\'s code or content — or the underlying NHL data — for commercial purposes or as your own product.'],
    ['Requests','Permission requests and attribution questions can be directed to the operator via the project\'s GitHub repository.'],
    ['Reporting infringement','If you believe content on the Lab infringes your copyright, see our DMCA / Copyright Takedown Policy for how to file a notice.'],
  ]},
  dmca:{title:'DMCA / Copyright Takedown Policy',updated:'June 1, 2026',body:[
    ['Our commitment','The Hockey Lab respects intellectual-property rights and will respond to clear, valid notices of alleged copyright infringement consistent with the principles of the U.S. Digital Millennium Copyright Act (DMCA), even though we are a small, unincorporated project.'],
    ['How to file a notice','Send a written notice through the project\'s GitHub repository that includes: (1) identification of the copyrighted work you claim is infringed; (2) the exact URL(s) of the material on the Lab; (3) your contact information; (4) a statement that you have a good-faith belief the use is not authorized by the owner, its agent, or the law; (5) a statement, under penalty of perjury, that the information is accurate and you are the owner or authorized to act for the owner; and (6) your physical or electronic signature.'],
    ['What we do','On receipt of a valid notice we will review and, where appropriate, promptly remove or disable access to the material and make a reasonable effort to note the action.'],
    ['Counter-notice','If you believe material was removed in error, you may submit a counter-notice containing the equivalent identifying information, your contact details, a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification, and your consent to jurisdiction. We may restore the material absent a subsequent court filing by the original complainant.'],
    ['Repeat infringers','We may remove content and restrict access for anyone who repeatedly posts or causes infringing material.'],
    ['Good faith','Because the Lab displays NHL data under fair, informational use and hosts little user content, most concerns can be resolved quickly and informally — but we take every notice seriously.'],
  ]},
  affiliate:{title:'Affiliate Disclosure',updated:'June 1, 2026',body:[
    ['Current status','The Hockey Lab is a non-commercial hobby project and does not presently earn revenue. This disclosure is provided in advance so it is in place if that changes.'],
    ['If affiliate links appear','Should the Lab add affiliate links in the future (for example to ticketing, merchandise, or sportsbook partners), some outbound links may be affiliate links. If you click one and complete a purchase or sign-up, the Lab may earn a commission at no additional cost to you.'],
    ['Editorial independence','Any future affiliate or sponsorship relationship will never influence our statistics, rankings, projections, or editorial content. Data and storylines are generated independently of any commercial arrangement, and we will label sponsored or affiliate content clearly.'],
    ['Betting & odds','Where betting odds or partner links are shown, they are for information only and are not a recommendation to wager. Gambling carries risk; only participate if it is legal in your jurisdiction and you are of legal age. If you or someone you know has a gambling problem, seek help from a local support line.'],
    ['Questions','Reach out via the project\'s GitHub repository for details on any affiliate relationship in effect at the time you are reading this.'],
  ]},
  disclaimer:{title:'Disclaimer',updated:'June 1, 2026',body:[
    ['Informational & entertainment only','All content on The Hockey Lab is provided for general informational and entertainment purposes. Nothing here is professional advice of any kind.'],
    ['No guarantee of accuracy','We make no representation or warranty about the accuracy, completeness, reliability, or timeliness of any score, statistic, metric, or projection. Live data can be delayed or incorrect, and upstream sources can change without notice.'],
    ['Projections are models','Playoff brackets, draft order, draft-lottery outcomes, EDGE estimates, and similar features are modeled projections created by the Lab. They are not predictions of official results and should be treated as illustrative.'],
    ['Not betting advice','Nothing on the Lab is gambling, investment, or financial advice. Do not place wagers based on Lab content. Bet only where legal, of legal age, and responsibly.'],
    ['Not affiliated with the NHL','The Hockey Lab is an independent project and is not affiliated with, endorsed by, or sponsored by the National Hockey League, its teams, or its partners.'],
    ['External sites','We are not responsible for the content, accuracy, or practices of any third-party website linked from the Lab.'],
    ['Use at your own risk','Your use of the Lab and reliance on any of its content is solely at your own risk.'],
  ]},
  aup:{title:'Acceptable Use Policy',updated:'June 1, 2026',body:[
    ['Purpose','This policy describes how you may and may not use The Hockey Lab. It supplements the Terms of Service.'],
    ['Permitted use','Use the Lab for lawful, personal, non-commercial purposes — viewing scores, stats, and analytics in your browser.'],
    ['Prohibited conduct','You may not: scrape, crawl, or bulk-download data or content; resell, redistribute, or republish the data or the Lab\'s content as your own; attempt to access the API proxy programmatically or at volumes beyond normal interactive browsing; overload, disrupt, or degrade the service; probe, scan, or test the security of the site or its infrastructure; circumvent rate limits or access controls; misrepresent the source of the data; or use the Lab to break any law or infringe anyone\'s rights.'],
    ['Automated access','Our edge API proxy exists to serve the website. Automated or programmatic access beyond ordinary browsing is not permitted without prior written consent. If you want hockey data for your own project, use the public NHL APIs directly under their terms.'],
    ['Security','If you discover a vulnerability, please report it responsibly through the project\'s GitHub repository rather than exploiting or publicizing it.'],
    ['Enforcement','We may rate-limit, block, or restrict access — by IP or otherwise — for any use that violates this policy or threatens the stability or integrity of the service.'],
  ]},
};
function LegalPage({doc,onGo}){
  const d=LEGAL_DOCS[doc]||LEGAL_DOCS.terms;
  return(<div style={{maxWidth:760,margin:'0 auto'}}>
    <button onClick={()=>onGo('highlights')} className="el" style={{background:'none',border:'none',color:T.mut,cursor:'pointer',fontFamily:MONO,fontSize:12,padding:'0 0 18px'}}>← back to the lab</button>
    <div style={ML}>Legal</div>
    <h1 style={{fontSize:34,fontWeight:600,letterSpacing:'-.03em',margin:'6px 0 4px'}}>{d.title}</h1>
    <div style={{fontFamily:MONO,fontSize:11.5,color:T.faint,marginBottom:24}}>Last updated {d.updated}</div>
    {d.body.map(([h,p],i)=><div key={i} style={{marginBottom:22}}>
      <h2 style={{fontFamily:SERIF,fontStyle:'italic',fontSize:20,color:T.ink,marginBottom:7}}>{h}</h2>
      <p style={{fontSize:14.5,lineHeight:1.65,color:T.mut,margin:0,textWrap:'pretty'}}>{p}</p>
    </div>)}
    <div style={{...card,padding:'14px 16px',marginTop:8,fontFamily:MONO,fontSize:11.5,color:T.faint,lineHeight:1.7}}>
      Template policy for The Hockey Lab. Not legal advice \u2014 have counsel review before publishing. The Hockey Lab is an independent project, not affiliated with the NHL.
    </div>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:20,paddingTop:18,borderTop:`1px solid ${T.line}`}}>
      {window.E_FOOTER_LINKS.filter(([k])=>k!==doc).map(([k,label])=><button key={k} onClick={()=>onGo('legal/'+k)} className="el" style={{background:'none',border:`1px solid ${T.line2}`,borderRadius:8,padding:'6px 11px',fontFamily:MONO,fontSize:11,color:T.mut,cursor:'pointer'}}>{label}</button>)}
    </div>
  </div>);
}

window.E_PAGES={HighlightsPage,StandingsPage,TeamsPage,TeamDetailPage,PlayersPage,PlayerDetailPage,StatsPage,HockeyIQPage,DraftPage,PlayoffsPage,LegalPage};
window.E_FOOTER_LINKS=[
  ['terms','Terms of Service'],['privacy','Privacy Policy'],['cookies','Cookie Policy'],
  ['copyright','Copyright Notice'],['dmca','DMCA / Copyright Takedown'],['affiliate','Affiliate Disclosure'],
  ['disclaimer','Disclaimer'],['aup','Acceptable Use Policy'],
];
