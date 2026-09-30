const DATA = __DATA__;
const UX=190, UY=100, NW=140, NH=50, PAD=34, TOP=26, MAXY=7.8, STEP=0.3, CENTRE=3.9, TRAY=9.0, TRAYMAX=12.0, TRAYW=22;
const DLCS=['Royalty','Ideology','Biotech','Anomaly','Odyssey'];
const nodes=DATA.nodes, byId={}; nodes.forEach(n=>byId[n.id]=n);
const K=(q,d)=>q+'>'+d, unK=k=>k.split('>');
const ORIGV=new Set(), ORIGH=new Set();
nodes.forEach(n=>{ n.pre.forEach(q=>byId[q]&&ORIGV.add(K(q,n.id))); n.hpre.forEach(q=>byId[q]&&ORIGH.add(K(q,n.id))) });
const $=id=>document.getElementById(id);
const stage=$('stage'), sizer=$('sizer'), world=$('world'), svg=$('links');
const cap=s=>s? s[0].toUpperCase()+s.slice(1):s;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r1=v=>Math.round(v*100)/100;
const same=(a,b)=>a&&b&&Math.abs(a[0]-b[0])<1e-6&&Math.abs(a[1]-b[1])<1e-6;
const placed=id=>pos[id][1]<=MAXY+1e-6;
const L=id=>cap(byId[id].l);
const srcName=n=>n.dlc==='Core'?'Vanilla':n.dlc==='Mod'?n.s:n.dlc+' DLC';

/* ---------- connections: links holds only edits, key "req>project" ---------- */
let links={}, locks=new Set();
function linkState(k,ed=links){
  const e=ed[k];
  if(ORIGV.has(k)) return e==='remove'?'removed':e==='hide'?'hidden':'visible';
  if(ORIGH.has(k)) return e==='remove'?'removed':e==='show'?'visible':'hidden';
  return e==='add'?'visible':e==='addHidden'?'hidden':null;
}
function effective(ed=links){
  const vis=[],hid=[],rem=[];
  new Set([...ORIGV,...ORIGH,...Object.keys(ed)]).forEach(k=>{
    const [q,d]=unK(k); if(!byId[q]||!byId[d]) return;
    const s=linkState(k,ed); if(s==='visible')vis.push([q,d]); else if(s==='hidden')hid.push([q,d]); else if(s==='removed')rem.push([q,d]);
  });
  return {vis,hid,rem};
}
let EFF=effective();
const needs=id=>EFF.vis.filter(e=>e[1]===id).map(e=>e[0]);
const needsHidden=id=>EFF.hid.filter(e=>e[1]===id).map(e=>e[0]);
const leadsTo=id=>EFF.vis.filter(e=>e[0]===id).map(e=>e[1]);
const leadsToHidden=id=>EFF.hid.filter(e=>e[0]===id).map(e=>e[1]);
const isAdded=k=>!ORIGV.has(k)&&!ORIGH.has(k);
function setLink(k,action){
  const before=snapshot(), added=isAdded(k);
  if(action==='restore'){ delete links[k] }
  else if(action==='remove'){ if(added) delete links[k]; else links[k]='remove' }
  else if(action==='hide'){ if(added) links[k]='addHidden'; else if(ORIGH.has(k)) delete links[k]; else links[k]='hide' }
  else if(action==='show'){ if(added) links[k]='add'; else if(ORIGV.has(k)) delete links[k]; else links[k]='show' }
  commit(before);
  const [q,d]=unK(k);
  toast(`${{remove:added?'Deleted':'Removed',hide:'Hidden',show:'Shown',restore:'Restored'}[action]}: ${L(q)} → ${L(d)}`,'ok');
}
function wouldCycle(q,d){
  const par={}; [...EFF.vis,...EFF.hid].forEach(([a,b])=>(par[b]??=[]).push(a));
  const seen=new Set(), st=[q];
  while(st.length){ const x=st.pop(); if(x===d) return true; if(seen.has(x))continue; seen.add(x); (par[x]||[]).forEach(p=>st.push(p)) }
  return false;
}
function addLink(q,d){
  if(q===d){ toast('A project cannot need itself.','bad'); return }
  const k=K(q,d), s=linkState(k);
  if(s==='visible'||s==='hidden'){ toast(`${L(d)} already needs ${L(q)}.`,'bad'); return }
  if(wouldCycle(q,d)){ toast(`Not possible: ${L(q)} already depends on ${L(d)}, so this would make a loop.`,'bad'); return }
  const before=snapshot();
  if(s==='removed') delete links[k]; else links[k]='add';
  commit(before); toast(`Added: ${L(d)} now needs ${L(q)}`,'ok');
}

/* ---------- starting layouts ---------- */
function packTray(p,ids){
  const taken=new Set(Object.entries(p).filter(([i,v])=>v&&v[1]>MAXY).map(([i,v])=>v[0]+':'+r1(v[1])));
  ids=[...ids].sort((a,b)=>byId[a].th-byId[b].th||byId[a].c-byId[b].c);
  let k=0;
  ids.forEach(id=>{ let x,y; do{ x=k%TRAYW; y=r1(TRAY+Math.floor(k/TRAYW)*0.6); k++ }while(taken.has(x+':'+y)); p[id]=[x,y]; taken.add(x+':'+y) });
  return p;
}
function vanillaLayout(){ const p={}; nodes.forEach(n=>{ if(n.v) p[n.id]=[...n.v] }); return packTray(p,nodes.filter(n=>!n.v).map(n=>n.id)) }
function modLayout(){ const p={}; nodes.forEach(n=>p[n.id]=[n.x,n.y]); return p }
function complete(p){ const q={}; const miss=[]; nodes.forEach(n=>{ if(Array.isArray(p?.[n.id])) q[n.id]=[+p[n.id][0],+p[n.id][1]]; else miss.push(n.id) }); return miss.length? packTray(q,miss):q }
const cleanLocks=a=>new Set((Array.isArray(a)?a:[]).filter(i=>byId[i]));
const cleanLinks=l=>{ const o={}; Object.entries(l||{}).forEach(([k,v])=>{ const [q,d]=unK(k); if(byId[q]&&byId[d]&&['remove','hide','show','add','addHidden'].includes(v)) o[k]=v }); return o };
const PRESETS=[
  {id:'preset-vanilla',name:'Vanilla RimWorld',note:'Vanilla and DLC on their vanilla spots, mod projects in the tray',make:vanillaLayout},
  {id:'preset-mod',name:'Unified Research Tree (in game now)',note:'The layout the mod uses today',make:modLayout},
];

/* ---------- state ---------- */
let pos=vanillaLayout();
let base={id:'preset-vanilla',name:'Vanilla RimWorld',pos:vanillaLayout(),links:{},locks:[]};
let sel=new Set(), selLink=null, pick=null, hoverId=null, showHidden=false;
let zoom=1, zoomFit=true;
let undoStack=[], redoStack=[], versions=[];
const INGAME=modLayout();
let COLS=TRAYW;

/* ---------- nodes ---------- */
const el={};
const LOCKSVG='<svg class="lockico" viewBox="0 0 11 12" aria-hidden="true"><rect x="1" y="5" width="9" height="7" rx="1.2" fill="currentColor"/><path d="M3 5V3.6a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
nodes.forEach(n=>{
  const d=document.createElement('div');
  d.className='node'+(n.ol?' ren':''); d.tabIndex=0; d.dataset.id=n.id; d.dataset.src=n.dlc;
  d.style.setProperty('--th',`var(--th${n.th})`);
  const nl=document.createElement('div'); nl.className='nl'; nl.textContent=cap(n.l); d.appendChild(nl);
  if(n.ol){ const no=document.createElement('div'); no.className='no'; no.textContent='vanilla: '+n.ol; d.appendChild(no) }
  const nc=document.createElement('div'); nc.className='nc'; nc.textContent=n.c.toLocaleString('en-US')+(n.dlc!=='Core'&&n.dlc!=='Mod'?' · '+n.dlc:''); d.appendChild(nc);
  d.insertAdjacentHTML('beforeend',LOCKSVG);
  d.setAttribute('aria-label',cap(n.l)+(n.ol?`, vanilla name ${n.ol}`:''));
  world.appendChild(d); el[n.id]=d;
});

/* ---------- legend bar + themes ---------- */
(function legend(){
  const bar=$('legendbar');
  const add=(html,title,fn)=>{ const b=document.createElement(fn?'button':'span'); b.className='lg'; b.innerHTML=html; if(title)b.title=title; if(fn)b.onclick=fn; bar.appendChild(b) };
  const selSrc=(src,label)=>()=>{ selectOnly(nodes.filter(n=>n.dlc===src).map(n=>n.id)); toast(`Selected ${sel.size}: ${label}`) };
  add(`<i class="sw" style="--src:var(--core)"></i>Vanilla`,'Select all vanilla projects',selSrc('Core','vanilla'));
  DLCS.forEach(x=>add(`<i class="sw dash" style="--src:var(--${x.toLowerCase()})"></i>${x}`,`Select all ${x} projects`,selSrc(x,x)));
  add(`<i class="sw dot" style="--src:var(--mod)"></i>Mod`,'Select all mod projects',selSrc('Mod','mod projects'));
  bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
  add('<i class="ln" style="--c:var(--link)"></i>required');
  add('<i class="ln" style="--c:var(--ok)"></i>added');
  add('<i class="ln dash" style="--c:var(--bad)"></i>removed');
  add('<i class="ln dash" style="--c:var(--hidden-link)"></i>hidden');
  DATA.lanes.forEach((name,i)=>{
    const b=document.createElement('button'); b.style.setProperty('--th',`var(--th${i})`); b.innerHTML='<i></i>'; b.append(name);
    b.onclick=()=>{ selectOnly(nodes.filter(n=>n.th===i).map(n=>n.id)); closePops(); toast(`Selected ${sel.size} projects in ${name}`) };
    $('themes').appendChild(b);
  });
})();

/* ---------- drawing ---------- */
const X=x=>PAD+x*UX, Y=y=>TOP+y*UY;
const worldW=()=>PAD*2+COLS*UX, worldH=()=>TOP+TRAYMAX*UY+NH+PAD;
function place(){
  COLS=Math.max(TRAYW,...Object.values(pos).map(p=>Math.ceil(p[0])+1));
  world.style.width=worldW()+'px'; world.style.height=worldH()+'px';
  svg.setAttribute('width',worldW()); svg.setAttribute('height',worldH());
  nodes.forEach(n=>{ el[n.id].style.left=X(pos[n.id][0])+'px'; el[n.id].style.top=Y(pos[n.id][1])+'px' });
  drawLinks(); applyZoom();
}
function drawLinks(){
  const W=worldW(); let g='';
  const gameBottom=Y(MAXY)+NH+14, trayTop=Y(TRAY)-30;
  g+=`<rect class="trayband" x="0" y="${gameBottom+8}" width="${W}" height="${worldH()-gameBottom-8}"/>`;
  g+=`<line class="edge" x1="0" x2="${W}" y1="${gameBottom}" y2="${gameBottom}"/>`;
  g+=`<text class="zonelabel" x="${PAD}" y="${trayTop}">Not placed yet · drag these up into the tree</text>`;
  for(let c=0;c<COLS;c++) g+=`<text class="colnum" x="${X(c)+NW/2}" y="16" text-anchor="middle">${c}</text>`;
  const cy=Y(CENTRE)+NH/2; g+=`<line class="guide centre" x1="0" x2="${W}" y1="${cy}" y2="${cy}"/>`;
  const gid=hoverId||(sel.size===1?[...sel][0]:null);
  if(gid&&byId[gid].v&&!same(pos[gid],byId[gid].v)){ const [vx,vy]=byId[gid].v; g+=`<rect class="ghost" x="${X(vx)}" y="${Y(vy)}" width="${NW}" height="${NH}" rx="3"/><text class="ghostlabel" x="${X(vx)+4}" y="${Y(vy)-5}">vanilla spot</text>` }
  const bad=new Set(problems().filter(p=>p.kind==='order').map(p=>K(p.q,p.d)));
  let hits='';
  const draw=(list,kind)=>list.forEach(([q,d])=>{
    const k=K(q,d), inTray=!placed(q)||!placed(d), rel=hoverId&&(d===hoverId||q===hoverId);
    if(inTray&&!rel&&selLink!==k) return;
    const a=pos[q], b=pos[d];
    let cls='lk'+(kind==='hid'?' hid':'')+(kind==='rm'?' rm':'')+(inTray?' tray':'')+(isAdded(k)?' add':'');
    if(bad.has(k)&&kind!=='rm') cls+=' badlk';
    if(hoverId&&kind!=='rm'){ if(d===hoverId) cls+=' up'; else if(q===hoverId) cls+=' down' }
    if(selLink===k) cls+=' selk';
    const c=`x1="${X(a[0])+NW}" y1="${Y(a[1])+NH/2}" x2="${X(b[0])}" y2="${Y(b[1])+NH/2}"`;
    g+=`<line class="${cls}" ${c}/>`; hits+=`<line class="hit" data-k="${esc(k)}" ${c}/>`;
  });
  draw(EFF.rem,'rm');
  draw(showHidden?EFF.hid:EFF.hid.filter(([q,d])=>K(q,d)===selLink),'hid');
  draw(EFF.vis,'vis');
  svg.innerHTML=g+hits;
}

/* ---------- zoom ---------- */
function applyZoom(){
  if(zoomFit) zoom=Math.max(0.25,Math.min(1.2,(stage.clientHeight-18)/worldH()));
  world.style.transform=`scale(${zoom})`;
  sizer.style.width=worldW()*zoom+'px'; sizer.style.height=worldH()*zoom+'px';
  $('zFit').textContent=zoomFit?'Fit':Math.round(zoom*100)+'%';
}
function setZoom(z,ax,ay){
  const r=stage.getBoundingClientRect();
  const px=ax??r.width/2, py=ay??r.height/2;
  const wx=(stage.scrollLeft+px)/zoom, wy=(stage.scrollTop+py)/zoom;
  zoomFit=false; zoom=Math.max(0.2,Math.min(1.6,z)); applyZoom();
  stage.scrollLeft=wx*zoom-px; stage.scrollTop=wy*zoom-py;
}
$('zIn').onclick=()=>setZoom(zoom*1.2);
$('zOut').onclick=()=>setZoom(zoom/1.2);
$('zFit').onclick=()=>{ zoomFit=true; applyZoom() };
stage.addEventListener('wheel',ev=>{ if(!(ev.ctrlKey||ev.metaKey))return; ev.preventDefault(); const r=stage.getBoundingClientRect(); setZoom(zoom*Math.exp(-ev.deltaY*0.01),ev.clientX-r.left,ev.clientY-r.top) },{passive:false});
window.addEventListener('resize',()=>{ if(zoomFit) applyZoom(); closePops() });

/* ---------- metrics & problems ---------- */
function orient(ax,ay,bx,by,cx,cy){const v=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);return v>1e-9?1:v<-1e-9?-1:0}
function crosses(s,t){
  if(Math.max(s.x1,s.x2)<=Math.min(t.x1,t.x2)||Math.max(t.x1,t.x2)<=Math.min(s.x1,s.x2))return false;
  return orient(s.x1,s.y1,s.x2,s.y2,t.x1,t.y1)*orient(s.x1,s.y1,s.x2,s.y2,t.x2,t.y2)<0 && orient(t.x1,t.y1,t.x2,t.y2,s.x1,s.y1)*orient(t.x1,t.y1,t.x2,t.y2,s.x2,s.y2)<0;
}
function metricsFor(p,vis){
  const on=id=>p[id][1]<=MAXY+1e-6;
  const S=vis.filter(([q,d])=>on(q)&&on(d)).map(([q,d])=>({q,d,x1:p[q][0]+NW/UX,y1:p[q][1],x2:p[d][0],y2:p[d][1]}));
  const P=nodes.filter(n=>on(n.id)); let cr=0, box=0;
  for(let i=0;i<S.length;i++){
    const s=S[i];
    for(let j=i+1;j<S.length;j++){const t=S[j]; if(s.q===t.q||s.q===t.d||s.d===t.q||s.d===t.d)continue; if(crosses(s,t))cr++}
    if(s.x2<=s.x1) continue;
    for(const n of P){ if(n.id===s.q||n.id===s.d)continue; const [nx,ny]=p[n.id];
      const bx1=nx+NW/UX; if(s.x2<=nx||s.x1>=bx1)continue;
      for(const t of [nx,nx+NW/UX/2,bx1]){ if(t<s.x1||t>s.x2)continue; const yy=s.y1+(s.y2-s.y1)*(t-s.x1)/(s.x2-s.x1); if(Math.abs(yy-ny)<(NH/UY)/2+0.03){box++;break} } }
  }
  const offV=nodes.filter(n=>n.v&&!same(p[n.id],n.v)).length;
  return {cr,box,unplaced:nodes.length-P.length,offV};
}
function problems(){
  const out=[], ids=nodes.map(n=>n.id).sort((a,b)=>pos[a][0]-pos[b][0]);
  for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++){
    const a=pos[ids[i]], b=pos[ids[j]]; if(b[0]-a[0]>=NW/UX) break;
    if(Math.abs(a[1]-b[1])<0.55) out.push({kind:'overlap',a:ids[i],b:ids[j]});
  }
  [...EFF.vis.map(e=>[...e,false]),...EFF.hid.map(e=>[...e,true])].forEach(([q,d,h])=>{
    if(placed(q)&&placed(d)&&pos[q][0]>=pos[d][0]) out.push({kind:'order',q,d,h}) });
  return out;
}
const INGAME_M=metricsFor(INGAME,effective({}).vis);
const VANILLA_N=nodes.filter(n=>n.v).length;
let M=null, PROBS=[];
const movedIds=()=>nodes.filter(n=>!same(pos[n.id],base.pos[n.id])).map(n=>n.id);
function refreshHeader(){
  M=metricsFor(pos,EFF.vis); PROBS=problems();
  const all=!M.unplaced;
  const chip=(label,val,baseV,tip)=>{
    const diff=val-baseV, d=all&&diff?`<span class="d ${diff<0?'better':'worse'}">${diff>0?'+':''}${diff}</span>`:'';
    return `<span class="chip" title="${tip}"><span>${label}</span><b>${val}</b>${d}</span>` };
  const cmp='Green or red compares with the layout in the game now, once every project is placed';
  const nCh=Object.keys(links).length+movedIds().length;
  $('metrics').innerHTML=
    chip('Crossings',M.cr,INGAME_M.cr,'Places where two lines cross. '+cmp)+
    chip('Behind boxes',M.box,INGAME_M.box,'Lines that pass behind a project box. '+cmp)+
    `<span class="chip" title="Vanilla and DLC projects not on their vanilla spot"><span>Off vanilla</span><b>${M.offV}/${VANILLA_N}</b></span>`+
    (M.unplaced?`<span class="chip" title="Mod projects still waiting in the tray"><span>In tray</span><b>${M.unplaced}</b></span>`:'')+
    `<button class="chip ${PROBS.length?'alert':''}" data-pop="popProblems" aria-haspopup="dialog"><span>Problems</span><b>${PROBS.length}</b></button>`+
    `<button class="chip ${nCh?'has':''}" data-pop="popChanges" aria-haspopup="dialog" title="Changes since you opened ${esc(base.name)}"><span>Changes</span><b>${nCh}</b></button>`;
  document.querySelectorAll('.node.prob').forEach(e=>e.classList.remove('prob'));
  PROBS.forEach(p=>{ if(p.kind==='overlap'){ el[p.a].classList.add('prob'); el[p.b].classList.add('prob') } else el[p.d].classList.add('prob') });
  $('verName').innerHTML=`${esc(base.name)}${isEdited()?' <span class="ed">· edited</span>':''}`;
  $('undo').disabled=!undoStack.length; $('redo').disabled=!redoStack.length;
  if(!$('popProblems').hidden) renderProblems();
  if(!$('popChanges').hidden) renderChanges();
  if(!$('popVersions').hidden) renderVersions();
}
$('metrics').addEventListener('click',ev=>{ const b=ev.target.closest('[data-pop]'); if(b) togglePop(b.dataset.pop,b) });

/* ---------- popovers ---------- */
const POPS={popVersions:()=>renderVersions(),popProblems:()=>renderProblems(),popChanges:()=>renderChanges(),popView:()=>{}};
let popAnchor=null;
function closePops(){ Object.keys(POPS).forEach(id=>$(id).hidden=true); document.querySelectorAll('[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false')); popAnchor=null }
function togglePop(id,btnEl){
  const open=!$(id).hidden; closePops(); if(open||!btnEl) return;
  POPS[id](); const p=$(id); p.hidden=false; popAnchor=btnEl;
  const r=btnEl.getBoundingClientRect(), w=p.offsetWidth;
  p.style.top=(r.bottom+6)+'px'; p.style.left=Math.max(16,Math.min(window.innerWidth-w-16,r.left))+'px';
  btnEl.setAttribute('aria-expanded','true');
  if(id==='popVersions') $('verInput').focus();
}
document.addEventListener('pointerdown',ev=>{ if(popAnchor&&!ev.target.closest('.pop')&&!ev.target.closest('[aria-haspopup]')) closePops() },true);
$('verBtn').onclick=()=>togglePop('popVersions',$('verBtn'));
$('viewBtn').onclick=()=>togglePop('popView',$('viewBtn'));
function renderProblems(){
  const box=$('probList'); box.innerHTML='';
  if(!PROBS.length){ box.innerHTML='<div class="empty">None. Every placed project sits right of what it needs, and nothing overlaps.</div>'; return }
  PROBS.slice(0,60).forEach(p=>{
    const b=document.createElement('button'); b.className='bad';
    if(p.kind==='overlap'){ b.textContent=`${L(p.a)} and ${L(p.b)} overlap`; b.onclick=()=>{ closePops(); focusNode(p.a) } }
    else { b.textContent=`${L(p.d)} should be right of ${L(p.q)}${p.h?' (hidden requirement)':''}`; b.onclick=()=>{ closePops(); focusNode(p.d) } }
    box.appendChild(b);
  });
  if(PROBS.length>60) box.insertAdjacentHTML('beforeend',`<div class="empty">and ${PROBS.length-60} more</div>`);
}
const EDIT_LABEL={remove:['Removed','rm'],hide:['Hidden','hid'],show:['Shown','add'],add:['Added','add'],addHidden:['Added, hidden','add']};
function renderChanges(){
  const box=$('lkList'); box.innerHTML='';
  const ks=Object.keys(links).sort((a,b)=>links[a].localeCompare(links[b]));
  if(!ks.length) box.innerHTML='<div class="empty">No connections changed.</div>';
  ks.forEach(k=>{
    const [q,d]=unK(k), [lab,cls]=EDIT_LABEL[links[k]];
    const r=document.createElement('div'); r.className='conn always';
    r.innerHTML=`<span class="st ${cls}">${lab}</span>`;
    const go=document.createElement('button'); go.className='to'; go.textContent=`${L(q)} → ${L(d)}`; go.onclick=()=>{ closePops(); selectLink(k,true) };
    const ops=document.createElement('span'); ops.className='ops';
    ops.appendChild(btn('Undo','mini',()=>{ const b=snapshot(); delete links[k]; commit(b); toast(`Put back: ${L(q)} → ${L(d)}`,'ok') }));
    r.append(go,ops); box.appendChild(r);
  });
  const ml=$('movedList'); ml.innerHTML=''; const moved=movedIds();
  $('movedHead').textContent=`Moved since opening ${base.name}`;
  if(!moved.length) ml.innerHTML='<div class="empty">Nothing moved.</div>';
  moved.forEach(id=>{ const s=document.createElement('button'); s.className='pill'; s.textContent=L(id); s.onclick=()=>{ closePops(); focusNode(id) }; ml.appendChild(s) });
}

/* ---------- context rail ---------- */
function btn(text,cls,fn,title){ const b=document.createElement('button'); b.className=cls||''; b.textContent=text; if(title)b.title=title; b.onclick=fn; return b }
function connRow(q,d,which){
  const k=K(q,d), st=linkState(k), row=document.createElement('div'); row.className='conn';
  const go=document.createElement('button'); go.className='to'+(st==='hidden'?' hid':'')+(st==='removed'?' rm':''); go.textContent=L(which); go.title='Go to '+L(which);
  go.onclick=()=>focusNode(which); row.appendChild(go);
  const tag=isAdded(k)?['added','add']:st==='hidden'?['hidden','hid']:st==='removed'?['removed','rm']:null;
  if(tag) row.insertAdjacentHTML('beforeend',`<span class="st ${tag[1]}">${tag[0]}</span>`);
  const ops=document.createElement('span'); ops.className='ops';
  if(st==='removed') ops.appendChild(btn('Restore','mini',()=>setLink(k,'restore')));
  else { ops.appendChild(btn(st==='hidden'?'Show':'Hide','mini',()=>setLink(k,st==='hidden'?'show':'hide'),st==='hidden'?'Draw this line':'Still required, line not drawn'));
         ops.appendChild(btn(isAdded(k)?'Delete':'Remove','mini',()=>setLink(k,'remove'),'No longer required')) }
  row.appendChild(ops); return row;
}
function section(title,rows,addFn,addTitle){
  const s=document.createElement('div'); s.className='sect';
  const head=document.createElement('div'); head.style.cssText='display:flex;align-items:center;justify-content:space-between';
  head.innerHTML=`<p class="eyebrow">${title}</p>`;
  if(addFn) head.appendChild(btn('+ Add','ghost small',addFn,addTitle));
  s.appendChild(head);
  if(rows.length) rows.forEach(r=>s.appendChild(r)); else s.insertAdjacentHTML('beforeend','<div class="empty">Nothing</div>');
  return s;
}
function renderCtx(){
  const box=$('ctx'); box.innerHTML='';
  if(pick){
    const c=document.createElement('div'); c.className='pickcard';
    c.append(pick.dir==='req'?`Click the project that ${L(pick.id)} should need.`:`Click the project that should need ${L(pick.id)}.`);
    c.appendChild(btn('Cancel','small',cancelPick)); box.appendChild(c); renderKeys('pick'); return;
  }
  if(selLink){ renderLinkCtx(box); renderKeys('link'); return }
  if(sel.size===1){ renderNodeCtx(box,[...sel][0]); renderKeys('one'); return }
  if(sel.size>1){ renderMultiCtx(box); renderKeys('multi'); return }
  renderIdleCtx(box); renderKeys('idle');
}
function renderIdleCtx(box){
  box.insertAdjacentHTML('beforeend',`<div><p class="eyebrow">Nothing selected</p><h2 style="margin-top:4px">Click a project or a line to edit it</h2></div>`);
  if(M&&M.unplaced){
    const c=document.createElement('div'); c.className='card';
    c.innerHTML=`<p><b>${M.unplaced} mod projects</b> are waiting in the tray under the tree.</p>`;
    c.appendChild(btn('Show the tray','small',()=>stage.scrollTo({top:Y(TRAY)*zoom-60,behavior:'smooth'})));
    box.appendChild(c);
  }
  if(PROBS.length){
    const c=document.createElement('div'); c.className='card warn';
    c.innerHTML=`<p><b>${PROBS.length} problem${PROBS.length>1?'s':''}</b> to fix: overlapping boxes, or projects left of what they need.</p>`;
    c.appendChild(btn('Review','small',()=>togglePop('popProblems',document.querySelector('[data-pop="popProblems"]'))));
    box.appendChild(c);
  }
  if(M&&!M.unplaced&&!PROBS.length){
    const c=document.createElement('div'); c.className='card';
    c.innerHTML='<p><b>Ready for the game.</b> Every project is placed and nothing is broken. Save a version, then ask Claude to apply it.</p>';
    c.appendChild(btn('Save a version','small primary',()=>togglePop('popVersions',$('verBtn'))));
    box.appendChild(c);
  }
}
function renderNodeCtx(box,id){
  const n=byId[id], [x,y]=pos[id], locked=locks.has(id), onV=n.v&&same(pos[id],n.v);
  const head=document.createElement('div');
  head.innerHTML=`<p class="eyebrow">${esc(srcName(n))}</p><h2 style="margin-top:4px">${esc(cap(n.l))}</h2>${n.ol?`<p class="was">vanilla: ${esc(n.ol)}</p>`:''}`;
  box.appendChild(head);
  const where=placed(id)?`col ${r1(x)} · row ${r1(y).toFixed(1)}`:'in the tray';
  box.insertAdjacentHTML('beforeend',`<div class="meta"><span>${esc(n.t||'')}</span><span class="num">${n.c.toLocaleString('en-US')}</span><span>${esc(DATA.lanes[n.th]||'')}</span></div>
    <div class="meta"><span class="num">${where}</span>${n.v?(onV?'<span class="okk">on vanilla spot</span>':`<span>vanilla: col ${n.v[0]} · row ${n.v[1].toFixed(1)}</span>`):''}${locked?'<span class="lockd">locked</span>':''}</div>`);
  const acts=document.createElement('div'); acts.className='actions';
  acts.appendChild(btn(locked?'Unlock':'Lock','small',()=>toggleLock([id])));
  if(n.v&&!onV&&!locked) acts.appendChild(btn('Back to vanilla spot','small',()=>toVanilla([id])));
  box.appendChild(acts);
  const rem=EFF.rem;
  const nr=[...needs(id),...needsHidden(id),...rem.filter(e=>e[1]===id).map(e=>e[0])].map(q=>connRow(q,id,q));
  const lr=[...leadsTo(id),...leadsToHidden(id),...rem.filter(e=>e[0]===id).map(e=>e[1])].map(d=>connRow(id,d,d));
  box.appendChild(section('Needs',nr,()=>startPick(id,'req'),'Add a requirement (R)'));
  box.appendChild(section('Leads to',lr,()=>startPick(id,'lead'),'Add a project that needs this one (⇧R)'));
  if(n.un){ const d=document.createElement('details'); d.className='unl'; d.innerHTML=`<summary>Unlocks ${n.un}</summary><p>${esc(n.u.join(', '))}${n.un>n.u.length?' …':''}</p>`; box.appendChild(d) }
}
function renderMultiCtx(box){
  const ids=[...sel], nl=ids.filter(i=>locks.has(i)).length, off=ids.filter(i=>byId[i].v&&!same(pos[i],byId[i].v)&&!locks.has(i));
  box.insertAdjacentHTML('beforeend',`<div><p class="eyebrow">Selection</p><h2 style="margin-top:4px">${ids.length} projects</h2></div>
    <div class="meta"><span>${nl} locked</span><span>${off.length} vanilla off their spot</span></div>`);
  const acts=document.createElement('div'); acts.className='actions';
  const allL=ids.every(i=>locks.has(i));
  acts.appendChild(btn(allL?'Unlock all':'Lock all','small',()=>toggleLock(ids)));
  if(off.length) acts.appendChild(btn('Back to vanilla spots','small',()=>toVanilla(off)));
  acts.appendChild(btn('Deselect','small ghost',clearSel));
  box.appendChild(acts);
  const d=document.createElement('details'); d.className='unl'; d.innerHTML=`<summary>Show names</summary><p>${esc(ids.map(L).join(', '))}</p>`; box.appendChild(d);
}
function renderLinkCtx(box){
  const k=selLink, [q,d]=unK(k), st=linkState(k);
  const desc={visible:'Required, and the line is drawn.',hidden:'Required, but the line is not drawn.',removed:'Flagged: no longer required.'}[st]||'';
  box.insertAdjacentHTML('beforeend',`<div><p class="eyebrow">Connection${isAdded(k)?' · added by you':''}</p><h2 style="margin-top:4px">${esc(L(q))} → ${esc(L(d))}</h2><p class="was" style="font-style:normal">${esc(L(d))} needs ${esc(L(q))}. ${desc}</p></div>`);
  const acts=document.createElement('div'); acts.className='actions';
  if(st==='removed') acts.appendChild(btn('Restore','small primary',()=>setLink(k,'restore')));
  else { acts.appendChild(btn(st==='hidden'?'Show line':'Hide line','small',()=>setLink(k,st==='hidden'?'show':'hide')));
         acts.appendChild(btn(isAdded(k)?'Delete':'Remove','small danger',()=>setLink(k,'remove'))) }
  box.appendChild(acts);
  const nav=document.createElement('div'); nav.className='actions';
  nav.appendChild(btn('Go to '+L(q),'small ghost',()=>focusNode(q))); nav.appendChild(btn('Go to '+L(d),'small ghost',()=>focusNode(d)));
  box.appendChild(nav);
}
const KEYS={
  idle:[['m:Drag','Move a project'],['⇧+m:click','Add to selection'],['m:Drag on space','Box-select'],['m:Click a line','Edit a connection'],['/','Find a project'],['⌘+m:scroll','Zoom'],['⌘+Z','Undo']],
  one:[['↑+↓+←+→','Nudge'],['L','Lock / unlock'],['R','Add requirement'],['⇧+R','Add “leads to”'],['V','Back to vanilla spot'],['m:Drag to edge','Scrolls the tree'],['Esc','Deselect']],
  multi:[['m:Drag','Move the group'],['↑+↓+←+→','Nudge the group'],['L','Lock / unlock all'],['V','Back to vanilla spots'],['⇧+m:click','Add or drop one'],['Esc','Deselect']],
  link:[['Delete','Remove / restore'],['H','Hide / show line'],['m:Click a line','Pick another'],['Esc','Deselect']],
  pick:[['m:Click','Pick the project'],['Esc','Cancel']],
};
function renderKeys(ctx){
  $('keys').innerHTML=KEYS[ctx].map(([k,t])=>`<span class="kk">${k.split('+').map(x=>x.startsWith('m:')?`<span class="mouse">${esc(x.slice(2))}</span>`:`<kbd>${esc(x)}</kbd>`).join('')}</span><span class="kt">${esc(t)}</span>`).join('');
}

/* ---------- selection ---------- */
function paintSel(){ nodes.forEach(n=>el[n.id].classList.toggle('sel',sel.has(n.id))) }
function paintLocks(){ nodes.forEach(n=>el[n.id].classList.toggle('locked',locks.has(n.id))) }
function selectOnly(ids){ selLink=null; sel=new Set(ids); paintSel(); drawLinks(); renderCtx() }
function clearSel(){ sel.clear(); selLink=null; paintSel(); drawLinks(); renderCtx() }
function selectLink(k,scroll){
  selLink=k; sel.clear(); paintSel(); drawLinks(); renderCtx();
  if(scroll){ const [q,d]=unK(k); const x=(pos[q][0]+pos[d][0])/2, y=(pos[q][1]+pos[d][1])/2;
    stage.scrollTo({left:Math.max(0,X(x)*zoom-stage.clientWidth/2),top:Math.max(0,Y(y)*zoom-stage.clientHeight/2),behavior:'smooth'}) }
}
function focusNode(id){
  selectOnly([id]);
  const [x,y]=pos[id];
  stage.scrollTo({left:Math.max(0,X(x)*zoom-stage.clientWidth/2+NW*zoom/2),top:Math.max(0,Y(y)*zoom-stage.clientHeight/2),behavior:'smooth'});
  el[id].focus({preventScroll:true});
}
function toggleLock(ids){
  if(!ids.length) return;
  const before=snapshot(), unlock=ids.every(i=>locks.has(i));
  ids.forEach(i=>unlock?locks.delete(i):locks.add(i));
  commit(before);
  toast(ids.length===1?`${unlock?'Unlocked':'Locked'} ${L(ids[0])}`:`${unlock?'Unlocked':'Locked'} ${ids.length} projects`,'ok');
}
function toVanilla(ids){
  ids=ids.filter(i=>byId[i].v&&!locks.has(i)&&!same(pos[i],byId[i].v));
  if(!ids.length){ toast('Already on their vanilla spots (locked ones stay put).'); return }
  const before=snapshot(); ids.forEach(i=>pos[i]=[...byId[i].v]); commit(before);
  toast(ids.length===1?`${L(ids[0])} is back on its vanilla spot`:`${ids.length} projects back on their vanilla spots`,'ok');
}
function startPick(id,dir){ pick={id,dir}; stage.classList.add('picking'); svg.classList.add('picking'); renderCtx() }
function cancelPick(){ pick=null; stage.classList.remove('picking'); svg.classList.remove('picking'); renderCtx() }
function setHover(id){
  if(hoverId===id)return; hoverId=id;
  world.classList.toggle('focusing',!!id);
  document.querySelectorAll('.node.rel').forEach(e=>e.classList.remove('rel','upn','dnn'));
  if(id){
    el[id].classList.add('rel');
    [...needs(id),...(showHidden?needsHidden(id):[])].forEach(q=>el[q].classList.add('rel','upn'));
    [...leadsTo(id),...(showHidden?leadsToHidden(id):[])].forEach(k=>el[k].classList.add('rel','dnn'));
  }
  drawLinks();
}

/* ---------- history ---------- */
const snapshot=()=>JSON.stringify({pos,links,locks:[...locks].sort()});
function restore(s){ const o=JSON.parse(s); pos=o.pos; links=o.links||{}; locks=new Set(o.locks||[]) }
function commit(before){ if(before===snapshot())return; undoStack.push({state:before,base:JSON.stringify(base)}); if(undoStack.length>200)undoStack.shift(); redoStack=[]; changed() }
function changed(){ EFF=effective(); paintLocks(); place(); refreshHeader(); renderCtx(); scheduleSave() }
function undo(){ if(!undoStack.length)return; redoStack.push({state:snapshot(),base:JSON.stringify(base)}); const s=undoStack.pop(); restore(s.state); base=JSON.parse(s.base); changed(); toast('Undone') }
function redo(){ if(!redoStack.length)return; undoStack.push({state:snapshot(),base:JSON.stringify(base)}); const s=redoStack.pop(); restore(s.state); base=JSON.parse(s.base); changed(); toast('Redone') }
$('undo').onclick=undo; $('redo').onclick=redo;

/* ---------- pointer ---------- */
let drag=null, lastPt=null, autoRAF=null;
function toWorld(pt){const r=world.getBoundingClientRect();return {x:(pt.clientX-r.left)/zoom,y:(pt.clientY-r.top)/zoom}}
function settleY(y){ if(y>MAXY+1e-6&&y<TRAY-1e-6) return (y-MAXY<TRAY-y)?MAXY:TRAY; return y }
world.addEventListener('pointerdown',ev=>{
  if(ev.button!==0)return;
  const nodeEl=ev.target.closest('.node'), hit=ev.target.closest('.hit'), p=toWorld(ev);
  if(pick){
    if(nodeEl){ const other=nodeEl.dataset.id, {id,dir}=pick; pick=null; stage.classList.remove('picking'); svg.classList.remove('picking'); dir==='req'?addLink(other,id):addLink(id,other); selectOnly([id]) }
    ev.preventDefault(); return;
  }
  if(hit&&!nodeEl){ selectLink(hit.dataset.k); ev.preventDefault(); return }
  if(nodeEl){
    const id=nodeEl.dataset.id; selLink=null;
    if(ev.shiftKey||ev.metaKey||ev.ctrlKey){ sel.has(id)?sel.delete(id):sel.add(id) } else if(!sel.has(id)) sel=new Set([id]);
    paintSel(); renderCtx(); drawLinks();
    const movable=[...sel].filter(i=>!locks.has(i));
    if(!movable.length){ if(locks.has(id)) toast(`${L(id)} is locked. Press L to unlock it.`); ev.preventDefault(); return }
    drag={kind:'move',start:p,ids:movable,from:Object.fromEntries(movable.map(i=>[i,[...pos[i]]])),before:snapshot(),moved:false};
    nodeEl.setPointerCapture(ev.pointerId);
  } else {
    selLink=null;
    const m=document.createElement('div'); m.className='marquee'; world.appendChild(m);
    drag={kind:'box',start:p,m,add:ev.shiftKey?new Set(sel):new Set()}; world.setPointerCapture(ev.pointerId);
  }
  lastPt={clientX:ev.clientX,clientY:ev.clientY}; if(!autoRAF) autoRAF=requestAnimationFrame(autoScroll);
  ev.preventDefault();
});
world.addEventListener('pointermove',ev=>{
  if(!drag){ const n=ev.target.closest('.node'); setHover(n?n.dataset.id:null); return }
  lastPt={clientX:ev.clientX,clientY:ev.clientY}; updateDrag(lastPt);
});
function updateDrag(pt){
  const p=toWorld(pt);
  if(drag.kind==='move'){
    const F=drag.from, ids=drag.ids;
    const minY=Math.min(...ids.map(i=>F[i][1])), maxY=Math.max(...ids.map(i=>F[i][1])), minX=Math.min(...ids.map(i=>F[i][0]));
    let sdy=Math.round((p.y-drag.start.y)/UY/STEP)*STEP; sdy=Math.max(-minY,Math.min(TRAYMAX-maxY,sdy));
    const sdx=Math.max(-minX,Math.round((p.x-drag.start.x)/UX));
    if(!drag.moved&&(sdx||Math.abs(sdy)>1e-6)){ drag.moved=true; ids.forEach(i=>el[i].classList.add('dragging')) }
    ids.forEach(i=>{ pos[i]=[r1(F[i][0]+sdx),r1(settleY(F[i][1]+sdy))]; el[i].style.left=X(pos[i][0])+'px'; el[i].style.top=Y(pos[i][1])+'px' });
    drawLinks();
  } else {
    const a=drag.start, x0=Math.min(a.x,p.x), y0=Math.min(a.y,p.y), x1=Math.max(a.x,p.x), y1=Math.max(a.y,p.y);
    Object.assign(drag.m.style,{left:x0+'px',top:y0+'px',width:(x1-x0)+'px',height:(y1-y0)+'px'});
    sel=new Set(drag.add); nodes.forEach(n=>{const nx=X(pos[n.id][0]),ny=Y(pos[n.id][1]); if(nx+NW>x0&&nx<x1&&ny+NH>y0&&ny<y1) sel.add(n.id)}); paintSel();
  }
}
const EDGE=56, SPEED=26;
function edgeSpeed(p,lo,hi){ if(p<lo+EDGE) return -SPEED*Math.min(1,(lo+EDGE-p)/EDGE); if(p>hi-EDGE) return SPEED*Math.min(1,(p-(hi-EDGE))/EDGE); return 0 }
function autoScroll(){
  autoRAF=null; if(!drag) return;
  if(lastPt){
    const r=stage.getBoundingClientRect();
    const dx=edgeSpeed(lastPt.clientX,r.left,r.right), dy=edgeSpeed(lastPt.clientY,r.top,r.bottom);
    if(dx||dy){ const bl=stage.scrollLeft, bt=stage.scrollTop; stage.scrollLeft+=dx; stage.scrollTop+=dy; if(stage.scrollLeft!==bl||stage.scrollTop!==bt) updateDrag(lastPt) }
  }
  autoRAF=requestAnimationFrame(autoScroll);
}
function endDrag(){
  if(!drag)return;
  if(autoRAF){ cancelAnimationFrame(autoRAF); autoRAF=null } lastPt=null;
  if(drag.kind==='move'){ drag.ids.forEach(i=>el[i].classList.remove('dragging')); if(drag.moved){ commit(drag.before) } }
  else { drag.m.remove(); drawLinks(); renderCtx() }
  drag=null;
}
world.addEventListener('pointerup',endDrag); world.addEventListener('pointercancel',endDrag);
world.addEventListener('pointerleave',()=>{ if(!drag) setHover(null) });

/* ---------- keyboard ---------- */
document.addEventListener('keydown',ev=>{
  const mod=ev.metaKey||ev.ctrlKey, key=ev.key.toLowerCase();
  if(ev.key==='Escape'){ if(popAnchor){ closePops(); return } if(pick){ cancelPick(); return } if(ev.target.matches('input')){ ev.target.blur(); return } clearSel(); return }
  if(ev.target.matches('input'))return;
  if(mod&&key==='z'){ ev.preventDefault(); ev.shiftKey?redo():undo(); return }
  if(mod) return;
  if(ev.key==='/'){ ev.preventDefault(); $('search').focus(); return }
  if(ev.key==='='||ev.key==='+'){ setZoom(zoom*1.2); return }
  if(ev.key==='-'){ setZoom(zoom/1.2); return }
  if(ev.key==='0'){ zoomFit=true; applyZoom(); return }
  if(selLink){
    if(ev.key==='Delete'||ev.key==='Backspace'){ ev.preventDefault(); setLink(selLink,linkState(selLink)==='removed'?'restore':'remove'); return }
    if(key==='h'){ const s=linkState(selLink); if(s!=='removed') setLink(selLink,s==='hidden'?'show':'hide'); return }
  }
  if(!sel.size) return;
  if(key==='l'){ toggleLock([...sel]); return }
  if(key==='v'){ toVanilla([...sel]); return }
  if(key==='r'&&sel.size===1){ startPick([...sel][0],ev.shiftKey?'lead':'req'); return }
  const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-STEP],ArrowDown:[0,STEP]}[ev.key];
  if(k){
    ev.preventDefault(); const ids=[...sel].filter(i=>!locks.has(i)); if(!ids.length){ toast('Locked projects stay put.'); return }
    if(ids.some(i=>pos[i][0]+k[0]<0||pos[i][1]+k[1]<-1e-6||pos[i][1]+k[1]>TRAYMAX+1e-6)) return;
    const b=snapshot(); ids.forEach(i=>pos[i]=[r1(pos[i][0]+k[0]),r1(settleY(pos[i][1]+k[1]))]); commit(b);
  }
});

/* ---------- search, view ---------- */
const matchQ=(n,q)=>n.l.toLowerCase().includes(q)||(n.ol||'').toLowerCase().includes(q);
$('search').addEventListener('input',()=>{ const q=$('search').value.trim().toLowerCase(); nodes.forEach(n=>el[n.id].classList.toggle('match',!!q&&matchQ(n,q))) });
$('search').addEventListener('keydown',ev=>{ if(ev.key==='Enter'){ const q=$('search').value.trim().toLowerCase(); const n=q&&nodes.find(n=>matchQ(n,q)); if(n){ focusNode(n.id); $('search').blur() } else if(q) toast('No project with that name.','bad') } });
$('showHidden').onchange=ev=>{ showHidden=ev.target.checked; drawLinks() };
$('copy').onclick=async()=>{
  const lk=Object.entries(links).map(([k,v])=>{ const [q,d]=unK(k); return `${v} | ${q} -> ${d} | ${L(q)} -> ${L(d)}` });
  const t='Research tree layout (defName | label | column,row; tray = not placed; locked marked *)\n'+nodes.map(n=>`${n.id} | ${cap(n.l)} | ${placed(n.id)?pos[n.id].join(','):'tray'}${locks.has(n.id)?' *':''}`).join('\n')
    +'\n\nConnection changes (edit | requirement -> project)\n'+(lk.join('\n')||'none');
  try{ await navigator.clipboard.writeText(t); toast('Copied. Paste it to Claude.','ok') } catch(e){ toast('The browser blocked copying.','bad') }
};

/* ---------- toast & save state ---------- */
let toastT=null;
function toast(t,kind){ const e=$('toast'); e.textContent=t; e.className='toast show'+(kind?' '+kind:''); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove('show'),2800) }
function setSave(t,bad){ const e=$('saveState'); e.textContent=t; e.className='savestate'+(bad?' bad':'') }

/* ---------- versions ---------- */
function openLayout(v,p,l,lk){
  const before=snapshot(), prevBase=JSON.stringify(base);
  pos=complete(p); links=cleanLinks(l); locks=cleanLocks(lk);
  base={id:v.id,name:v.name,pos:JSON.parse(JSON.stringify(pos)),links:{...links},locks:[...locks]};
  if(before!==snapshot()){ undoStack.push({state:before,base:prevBase}); redoStack=[] }
  sel.clear(); selLink=null; paintSel(); closePops(); changed();
  toast(`Opened ${v.name}. Undo takes you back.`,'ok');
}
function isEdited(){
  return nodes.some(n=>!same(pos[n.id],base.pos[n.id]))
    ||JSON.stringify([...locks].sort())!==JSON.stringify([...(base.locks||[])].sort())
    ||JSON.stringify(Object.entries(links).sort())!==JSON.stringify(Object.entries(base.links||{}).sort());
}
const fmtDate=s=>{ try{ return new Date(s).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) }catch(e){ return '' } };
let armedDelete=null;
function renderVersions(){
  const list=$('versions'); list.innerHTML='';
  const row=(v,meta,actions,isOpen)=>{
    const r=document.createElement('div'); r.className='ver'+(isOpen?' open':'');
    const nm=document.createElement('div'); nm.className='vn'; nm.textContent=v.name;
    if(isOpen) nm.insertAdjacentHTML('beforeend',`<span class="tag">${isEdited()?'open · edited':'open'}</span>`);
    const mt=document.createElement('div'); mt.className='vm'; mt.textContent=meta;
    const ac=document.createElement('div'); ac.className='va'; actions.forEach(a=>ac.appendChild(a));
    r.append(nm,ac,mt); list.appendChild(r);
  };
  versions.forEach(v=>{
    const acts=[];
    if(base.id===v.id&&isEdited()) acts.push(btn('Update','small primary',()=>updateVersion(v),'Save your edits into this version'));
    acts.push(btn('Open','small',()=>openLayout(v,v.pos,v.links,v.locks)));
    acts.push(btn(armedDelete===v.id?'Sure?':'Delete','small danger',()=>deleteVersion(v)));
    const nl=Object.keys(v.links||{}).length, nk=(v.locks||[]).length;
    row(v,[fmtDate(v.savedAt),`${v.cr??'?'} crossings`,v.unplaced?`${v.unplaced} in tray`:'all placed',nl?`${nl} conn.`:'',nk?`${nk} locked`:''].filter(Boolean).join(' · '),acts,base.id===v.id);
  });
  PRESETS.forEach(v=>row(v,v.note,[btn('Open','small',()=>openLayout(v,v.make(),{},[]))],base.id===v.id));
  if(!db) list.insertAdjacentHTML('afterbegin','<div class="empty">Saving versions needs the Claude app. Use View → Copy layout instead.</div>');
}
function versionBody(name){ const m=metricsFor(pos,EFF.vis); return {name,pos:JSON.parse(JSON.stringify(pos)),links:{...links},locks:[...locks],savedAt:new Date().toISOString(),cr:m.cr,box:m.box,unplaced:m.unplaced,offV:m.offV} }
$('saveVer').onclick=async()=>{
  if(!db){ toast('Saving versions is unavailable here. Use View → Copy layout.','bad'); return }
  const name=$('verInput').value.trim()||`Version ${versions.length+1}`;
  try{ const ref=await db.collection('versions').add(versionBody(name));
    base={id:ref.id,name,pos:JSON.parse(JSON.stringify(pos)),links:{...links},locks:[...locks]}; $('verInput').value=''; refreshHeader(); scheduleSave(); toast(`Saved version “${name}”`,'ok') }
  catch(e){ toast(e&&e.code==='quota_exceeded'?'No room for more versions. Delete an old one first.':'Could not save the version. Try again.','bad') }
};
$('verInput').addEventListener('keydown',ev=>{ if(ev.key==='Enter') $('saveVer').click() });
async function updateVersion(v){
  try{ await db.doc('versions/'+v.id).set(versionBody(v.name)); base={id:v.id,name:v.name,pos:JSON.parse(JSON.stringify(pos)),links:{...links},locks:[...locks]}; refreshHeader(); scheduleSave(); toast(`Updated “${v.name}”`,'ok') }
  catch(e){ toast('Could not update the version. Try again.','bad') }
}
async function deleteVersion(v){
  if(armedDelete!==v.id){ armedDelete=v.id; renderVersions(); setTimeout(()=>{ if(armedDelete===v.id){ armedDelete=null; if(!$('popVersions').hidden) renderVersions() } },3000); return }
  armedDelete=null;
  try{ await db.doc('versions/'+v.id).delete(); toast(`Deleted “${v.name}”`) } catch(e){ toast('Could not delete the version.','bad') }
}

/* ---------- autosave & boot ---------- */
let db=null, saveTimer=null, saving=false, dirty=false;
const DRAFT='layouts/current';
function scheduleSave(){ dirty=true; if(!db) return; setSave('Saving…'); clearTimeout(saveTimer); saveTimer=setTimeout(saveDraft,1200) }
async function saveDraft(){
  if(saving||!db||!dirty)return; saving=true; dirty=false;
  const m=metricsFor(pos,EFF.vis);
  const body={pos:JSON.parse(JSON.stringify(pos)),links:{...links},locks:[...locks],base:{id:base.id,name:base.name,pos:base.pos,links:base.links||{},locks:base.locks||[]},savedAt:new Date().toISOString(),unplaced:m.unplaced,cr:m.cr};
  try{ await db.doc(DRAFT).set(body); setSave('Saved') }
  catch(e){ dirty=true; setSave('Not saved, retrying on your next change',true) }
  saving=false; if(dirty) scheduleSave();
}
async function boot(){
  paintLocks(); place(); refreshHeader(); renderCtx(); setSave('Connecting…');
  try{ db = window.claude?.use ? await window.claude.use('db') : null }catch(e){ db=null }
  if(!db){ setSave('Saving unavailable here',true); return }
  db.collection('versions').onSnapshot(s=>{
    versions=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.savedAt||'').localeCompare(a.savedAt||''));
    if(!$('popVersions').hidden) renderVersions();
  },()=>{});
  try{
    const snap=await db.doc(DRAFT).get();
    if(snap.exists){
      const d=snap.data();
      pos=complete(d.pos); links=cleanLinks(d.links); locks=cleanLocks(d.locks);
      base=d.base&&d.base.pos? {id:d.base.id,name:d.base.name,pos:complete(d.base.pos),links:cleanLinks(d.base.links),locks:[...cleanLocks(d.base.locks)]} : {id:'draft',name:'Earlier draft',pos:complete(d.pos),links:{...links},locks:[...locks]};
      EFF=effective(); paintLocks(); place(); refreshHeader(); renderCtx();
      setSave('Saved'); toast(`Picked up where you left off: ${base.name}`,'ok');
    } else { setSave('Saved'); toast('Started from vanilla RimWorld. Your work saves by itself.','ok') }
  }catch(e){ setSave('Could not load your autosave',true) }
}
boot();
