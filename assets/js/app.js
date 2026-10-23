/* ═══════════════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS & STATE
═══════════════════════════════════════════════════════════════════════════ */
const ALL_CATS=Object.keys(CAT);

/* ── Lazy per-category data loader (data/tools/<category>.js) ─────────── */
let TOOLS=[];
let ALL_READY=false;
const _catLoads={};
function loadCat(cat){
  if(_catLoads[cat]) return _catLoads[cat];
  return _catLoads[cat]=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='data/tools/'+CAT_FILE[cat]+'.js';
    s.onload=()=>{TOOLS.push(...((window.TS_DATA||{})[cat]||[]));resolve()};
    s.onerror=()=>{delete _catLoads[cat];reject(new Error('Failed to load '+cat))};
    document.head.appendChild(s);
  });
}
function loadAll(){return Promise.all(ALL_CATS.map(loadCat)).then(()=>{ALL_READY=true})}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// Pre-compute RGBA cache (#22)
const RGBA_CACHE={};
function hex2rgba(hex,a){
  const k=hex+a;
  if(RGBA_CACHE[k]) return RGBA_CACHE[k];
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return RGBA_CACHE[k]=`rgba(${r},${g},${b},${a})`;
}
function catColor(cat){return CAT[cat]?.c||'#c0392b'}

function makeTag(label,color,size=10){
  return `<span class="tag" style="background:${hex2rgba(color,.13)};color:${color};border:1px solid ${hex2rgba(color,.32)};font-size:${size}px">${esc(label)}</span>`;
}
function statusBadge(oss){
  return oss?'<span class="badge-oss">OSS</span>':'<span class="badge-com">COMM</span>';
}

// ── State ────────────────────────────────────────────────────────────────────
let activeTab='__home__';
let activeRb=null;
let gSearch='';       // kept for home hero input compatibility
let cSearch='';
let fSubcat=[];
let fType=[];
let fEv=[];

// Bookmarks as Set for O(1) lookup (#20)
let bookmarkSet=new Set(JSON.parse(localStorage.getItem('ts_bookmarks')||'[]'));

// Recently viewed (last 10) (#11)
let recentViewed=JSON.parse(localStorage.getItem('ts_recent')||'[]');
let currentBmTab='bookmarks';

// Modal navigation state
let modalFilteredTools=[];
let modalCurrentIdx=-1;

// Keyboard nav
let kbdIdx=-1;
let kbdCards=[];

// Debounce timer
let searchTimer=null;
let gsTimer=null;
let gsActive=false;
let gsIdx=-1;
let gsResults=[];

// ── Bookmark helpers ─────────────────────────────────────────────────────────
function saveBm(){localStorage.setItem('ts_bookmarks',JSON.stringify([...bookmarkSet]))}
function isStarred(name){return bookmarkSet.has(name)}
function toggleBm(name,e){
  if(e){e.stopPropagation();e.preventDefault()}
  if(bookmarkSet.has(name)) bookmarkSet.delete(name); else bookmarkSet.add(name);
  saveBm(); updateBmBadge(); if(document.getElementById('bm-panel').classList.contains('open')) renderBmPanel();
  document.querySelectorAll(`[data-tool="${CSS.escape(name)}"] .bm-star`).forEach(s=>{
    s.classList.toggle('starred',bookmarkSet.has(name));
    s.textContent=bookmarkSet.has(name)?'★':'☆';
  });
}
function updateBmBadge(){
  const badge=document.getElementById('bm-count');
  badge.textContent=bookmarkSet.size;
  badge.style.display=bookmarkSet.size?'flex':'none';
}

// ── Recently viewed ───────────────────────────────────────────────────────────
function addRecent(name){
  recentViewed=recentViewed.filter(x=>x!==name);
  recentViewed.unshift(name);
  if(recentViewed.length>10) recentViewed=recentViewed.slice(0,10);
  localStorage.setItem('ts_recent',JSON.stringify(recentViewed));
}

function renderBmPanel(){
  if(!ALL_READY){loadAll().then(renderBmPanel).catch(console.error);return}
  const body=document.getElementById('bm-panel-body');
  const isRecent=currentBmTab==='recent';
  const items=isRecent
    ? recentViewed.map(name=>TOOLS.find(x=>x.n===name)).filter(Boolean)
    : [...bookmarkSet].map(name=>TOOLS.find(x=>x.n===name)).filter(Boolean);

  if(!items.length){
    body.innerHTML=`<div class="empty" style="padding:32px 10px"><div class="ico">${isRecent?'⏱':'☆'}</div><div style="font-size:12px">${isRecent?'No recently viewed tools yet.':'No bookmarks yet.<br>Click ☆ on any tool card.'}</div></div>`;
    return;
  }
  body.innerHTML=items.map(t=>{
    const cc=catColor(t.c);
    return `<div class="bm-tool-row" data-bm-tool="${esc(t.n)}">
      <span style="font-size:16px">${CAT[t.c]?.i||'🔧'}</span>
      <div style="flex:1;min-width:0">
        <div class="mono" style="color:${cc};font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.n)}</div>
        <div style="font-size:10px;color:var(--text4);margin-top:2px">${esc(t.c)}${t.sub?' · '+esc(t.sub):''}</div>
      </div>
      ${!isRecent?`<button class="bm-remove" data-bm-rm="${esc(t.n)}">✕</button>`:''}
    </div>`;
  }).join('');

  // Export button for bookmarks
  if(!isRecent&&bookmarkSet.size>0){
    body.insertAdjacentHTML('beforeend',`<button class="bm-export-btn" id="bm-export">↓ Export bookmarks</button>`);
    document.getElementById('bm-export').onclick=exportBookmarks;
  }

  body.querySelectorAll('[data-bm-tool]').forEach(el=>el.addEventListener('click',e=>{
    if(e.target.dataset.bmRm) return;
    closePanel(); openModal(el.dataset.bmTool);
  }));
  body.querySelectorAll('[data-bm-rm]').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation();
    bookmarkSet.delete(btn.dataset.bmRm);
    saveBm(); updateBmBadge(); renderBmPanel();
    document.querySelectorAll(`[data-tool="${CSS.escape(btn.dataset.bmRm)}"] .bm-star`).forEach(s=>{s.classList.remove('starred');s.textContent='☆'});
  }));
}

function exportBookmarks(){
  const items=[...bookmarkSet].map(name=>{
    const t=TOOLS.find(x=>x.n===name);
    return t?{name:t.n,category:t.c,subcategory:t.sub||'',type:t.t||'CLI',purpose:t.p||'',oss:t.oss}:{name};
  });
  const md=items.map(t=>`- **${t.name}** (${t.category}${t.subcategory?' / '+t.subcategory:''}) — ${t.purpose||''}`).join('\n');
  const blob=new Blob([md],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tsurugi-bookmarks.md';a.click();
}

function closePanel(){document.getElementById('bm-panel').classList.remove('open')}

// ── URL Hash Routing (#2) ─────────────────────────────────────────────────────
function pushHash(){
  const parts=[];
  if(activeTab!=='__home__') parts.push('tab='+encodeURIComponent(activeTab));
  if(activeRb) parts.push('rb='+encodeURIComponent(activeRb.id));
  const ts=document.getElementById('topbar-search').value.trim();
  if(ts) parts.push('q='+encodeURIComponent(ts));
  const h=parts.length?'#'+parts.join('&'):'#';
  history.replaceState(null,'',h||location.pathname);
}

function readHash(){
  const h=location.hash.slice(1);
  if(!h) return;
  const params={};
  h.split('&').forEach(p=>{const [k,v]=p.split('=');if(k) params[k]=decodeURIComponent(v||'')});
  if(params.tab) activeTab=params.tab;
  if(params.rb){
    activeRb=RUNBOOKS.find(r=>r.id===params.rb)||null;
    if(activeRb&&activeTab==='__home__') activeTab='__runbooks__';
  }
  if(params.q){
    document.getElementById('topbar-search').value=params.q;
    gSearch=params.q;
  }
}

// ── Theme ─────────────────────────────────────────────────────────────────────
let theme=localStorage.getItem('ts_theme')||'dark';
function applyTheme(t){
  theme=t;
  document.documentElement.setAttribute('data-theme',t);
  document.getElementById('theme-toggle').textContent=t==='dark'?'🌙':'☀️';
  localStorage.setItem('ts_theme',t);
}
applyTheme(theme);

/* ═══════════════════════════════════════════════════════════════════════════
   TABS & NAV
═══════════════════════════════════════════════════════════════════════════ */
function buildTabs(){
  const bar=document.getElementById('tabbar');
  bar.innerHTML=TAB_GROUPS.map(grp=>{
    const tabs=grp.tabs.map(id=>{
      if(id==='__home__') return `<button class="tab${activeTab===id?' active':''}" data-tid="__home__" style="--tc:var(--accent)">🏠 Home</button>`;
      if(id==='__runbooks__') return `<button class="tab${activeTab===id?' active':''}" data-tid="__runbooks__" style="--tc:var(--accent2)">📚 Runbooks</button>`;
      const m=CAT[id];if(!m) return '';
      return `<button class="tab${activeTab===id?' active':''}" data-tid="${esc(id)}" style="--tc:${m.c}">${m.i} ${esc(id)}</button>`;
    }).join('');
    if(grp.tabs.length===1&&(grp.tabs[0]==='__home__'||grp.tabs[0]==='__runbooks__')){
      return tabs;
    }
    return `<div class="tab-group"><span class="tab-group-label">${esc(grp.label)}</span>${tabs}</div>`;
  }).join('');
  bar.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>goTab(b.dataset.tid)));
}

function goTab(id){
  activeTab=id; activeRb=null; cSearch=''; fSubcat=[]; fType=[]; fEv=[];
  buildTabs(); render(); pushHash();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goTabFiltered(id,sub){
  activeTab=id; activeRb=null; cSearch=''; fSubcat=sub?[sub]:[]; fType=[]; fEv=[];
  buildTabs(); render(); pushHash();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL SEARCH DROPDOWN (#3)
═══════════════════════════════════════════════════════════════════════════ */
function openGsDropdown(q){
  const overlay=document.getElementById('gs-overlay');
  const drop=document.getElementById('gs-dropdown');
  if(!q.trim()){closeGsDropdown();return}
  const ql=q.trim().toLowerCase();
  gsResults=TOOLS.filter(t=>
    t.n.toLowerCase().includes(ql)||(t.p||'').toLowerCase().includes(ql)||
    t.c.toLowerCase().includes(ql)||(t.sub||'').toLowerCase().includes(ql)||
    (t.s||'').toLowerCase().includes(ql)
  ).slice(0,40);

  const badge=document.getElementById('ts-results-badge');
  badge.textContent=TOOLS.filter(t=>t.n.toLowerCase().includes(ql)||(t.p||'').toLowerCase().includes(ql)||t.c.toLowerCase().includes(ql)||(t.sub||'').toLowerCase().includes(ql)||(t.s||'').toLowerCase().includes(ql)).length+' results';
  badge.style.display=q.trim()?'block':'none';

  if(!gsResults.length){
    drop.innerHTML=`<div class="gs-no-results">No tools matched "<strong>${esc(q)}</strong>"</div>`;
  } else {
    // Group by category
    const byCat={};
    gsResults.forEach(t=>{if(!byCat[t.c]) byCat[t.c]=[];byCat[t.c].push(t)});
    drop.innerHTML=Object.entries(byCat).map(([cat,tools])=>{
      const cc=catColor(cat);
      const hdr=`<div class="gs-section-header" style="color:${cc}">${CAT[cat]?.i||''} ${esc(cat)}</div>`;
      const rows=tools.map((t,i)=>{
        const gi=gsResults.indexOf(t);
        return `<div class="gs-result" data-gs-idx="${gi}" role="option" tabindex="-1">
          <span style="color:${cc};font-size:13px">${CAT[cat]?.i||'🔧'}</span>
          <span class="gs-result-name" style="color:${cc}">${esc(t.n)}</span>
          <span class="gs-result-cat">${esc(t.sub||t.t||'CLI')}</span>
          ${statusBadge(t.oss)}
        </div>`;
      }).join('');
      return hdr+rows;
    }).join('');
  }

  overlay.classList.add('open');
  drop.style.display='block';
  gsActive=true; gsIdx=-1;
  drop.querySelectorAll('.gs-result').forEach(el=>{
    el.addEventListener('click',()=>{
      const t=gsResults[parseInt(el.dataset.gsIdx)];
      if(t){closeGsDropdown();openModal(t.n)}
    });
    el.addEventListener('mouseenter',()=>{
      gsIdx=parseInt(el.dataset.gsIdx);
      drop.querySelectorAll('.gs-result').forEach(r=>r.classList.toggle('active',parseInt(r.dataset.gsIdx)===gsIdx));
    });
  });
}
function closeGsDropdown(){
  document.getElementById('gs-overlay').classList.remove('open');
  document.getElementById('gs-dropdown').style.display='none';
  document.getElementById('ts-results-badge').style.display='none';
  gsActive=false; gsIdx=-1; gsResults=[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER DISPATCHER
═══════════════════════════════════════════════════════════════════════════ */
function render(){
  const need=activeTab==='__home__'?[]:activeTab==='__runbooks__'?ALL_CATS:[activeTab];
  Promise.all(need.map(loadCat)).then(doRender).catch(err=>{
    const el=document.getElementById('content');
    el.innerHTML='<div class="empty"><div class="ico">⚠️</div><div style="font-size:12px">Could not load this category\'s data file.</div></div>';
    el.style.opacity='1';console.error(err);
  });
}
function doRender(){
  kbdIdx=-1; kbdCards=[];
  const el=document.getElementById('content');
  el.style.opacity='0';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      if(activeTab==='__home__') el.innerHTML=renderHome();
      else if(activeTab==='__runbooks__') el.innerHTML=activeRb?renderRbDetail():renderRbList();
      else el.innerHTML=renderCat(activeTab);
      el.style.cssText='opacity:1;transition:opacity .15s';
      bindEvents();
      updateKbdCards();
      pushHash();
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════════════════════ */
function renderHome(){
  const catGrid=ALL_CATS.map(cat=>{
    const m=CAT[cat],cc=m.c,count=COUNTS[cat]||0;
    return `<div class="cat-card" data-goto="${esc(cat)}" style="--cc:${cc}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <span style="font-size:22px;line-height:1">${m.i}</span>
        <span class="cat-count" style="background:${hex2rgba(cc,.12)};color:${cc};border:1px solid ${hex2rgba(cc,.28)}">${count}</span>
      </div>
      <div style="font-weight:600;font-size:12px;color:var(--text1);margin-bottom:4px;letter-spacing:.3px">${esc(cat)}</div>
      <div style="font-size:10px;color:var(--text4);line-height:1.5;font-family:'Inter',sans-serif">${esc(m.d)}</div>
    </div>`;
  }).join('');

  const rbPreview=RUNBOOKS.slice(0,3).map(rb=>`
    <div class="rb-card" data-rb="${esc(rb.id)}" style="padding:16px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <span style="font-size:22px;flex-shrink:0;line-height:1;margin-top:1px">${rb.icon}</span>
        <div>
          <div style="font-weight:600;font-size:12px;color:var(--text1);margin-bottom:4px;letter-spacing:.2px">${esc(rb.title)}</div>
          <div style="font-size:10px;color:var(--text4);font-family:'Inter',sans-serif">${esc(rb.inv)} &nbsp;·&nbsp; ${rb.steps.length} steps</div>
        </div>
        <span style="margin-left:auto;color:var(--accent3);font-size:11px;flex-shrink:0;opacity:.7">→</span>
      </div>
    </div>`).join('');

  return `
    <div id="hero">
      <div class="hero-rule"><div></div><span>Tsurugi Linux · LAB Edition</span><div></div></div>
      <h1 class="hero-title">Tsurugi <em>Scroll</em></h1>
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px">
        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;padding:2px 10px;border-radius:2px;background:rgba(192,57,43,.1);color:rgba(192,57,43,.65);border:1px solid rgba(192,57,43,.25);letter-spacing:1.5px">TOOLS LISTING 26.03</span>
      </div>
      <p class="hero-sub">${TOTAL} tools &nbsp;·&nbsp; ${ALL_CATS.length} categories &nbsp;·&nbsp; ${RUNBOOKS.length} runbooks<br>
        <span style="font-size:10px;color:var(--text4)">Use the search bar above or browse categories below</span>
      </p>
    </div>
    <div class="wrap">
      <div class="sec-lbl">Browse by Category</div>
      <div class="grid-cats">${catGrid}</div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div class="sec-lbl" style="margin-bottom:0">Investigation Runbooks</div>
        <button onclick="goTab('__runbooks__')" style="font-size:10px;color:var(--accent3);font-weight:600;letter-spacing:.5px;text-transform:uppercase;font-family:'Inter',sans-serif">View all ${RUNBOOKS.length} →</button>
      </div>
      <div class="grid-rb">${rbPreview}</div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY VIEW
═══════════════════════════════════════════════════════════════════════════ */
function renderCat(cat){
  const m=CAT[cat],cc=m.c;
  const all=TOOLS.filter(t=>t.c===cat);
  const subcats=(SUBCATS[cat]||[]).slice().sort();
  const types=[...new Set(all.map(t=>t.t||'CLI'))].filter(Boolean).sort();
  const evPresent=[...new Set(all.flatMap(t=>t.ev||[]))].filter(e=>EV_TYPES.includes(e));

  let shown=all;
  if(fSubcat.length) shown=shown.filter(t=>fSubcat.includes(t.sub));
  if(fType.length)   shown=shown.filter(t=>fType.includes(t.t||'CLI'));
  if(fEv.length)     shown=shown.filter(t=>t.ev&&t.ev.some(e=>fEv.includes(e)));
  if(cSearch.trim()){const q=cSearch.trim().toLowerCase();shown=shown.filter(t=>t.n.toLowerCase().includes(q)||(t.p||'').toLowerCase().includes(q)||(t.s||'').toLowerCase().includes(q))}

  const activeFilters=fSubcat.length+fType.length+fEv.length;

  // Chip counts (#5)
  function chipCount(ftype,val){
    let base=all;
    if(ftype==='sub') return base.filter(t=>t.sub===val).length;
    if(ftype==='type') return base.filter(t=>(t.t||'CLI')===val).length;
    if(ftype==='ev') return base.filter(t=>t.ev&&t.ev.includes(val)).length;
    return 0;
  }

  function makeChip(label,on,color,ftype,val){
    const n=chipCount(ftype,val);
    const style=on?`style="--cc:${hex2rgba(color,.18)};--cl:${color};--cb:${hex2rgba(color,.5)}"`:'';
    return `<button class="chip${on?' on':''} filter-chip" data-ftype="${esc(ftype)}" data-val="${esc(val)}" ${style}>${esc(label)}<span class="chip-count"> (${n})</span></button>`;
  }

  const subcatRow=subcats.length>1?`<div class="filter-row"><span class="filter-label">Subcategory</span>${subcats.map(s=>makeChip(s,fSubcat.includes(s),cc,'sub',s)).join('')}</div>`:'';
  const typeRow=types.length>1?`<div class="filter-row"><span class="filter-label">Type</span>${types.map(tp=>makeChip(tp,fType.includes(tp),'#b89050','type',tp)).join('')}</div>`:'';
  const evRow=evPresent.length?`<div class="filter-row"><span class="filter-label">Evidence</span>${evPresent.map(e=>makeChip(e,fEv.includes(e),'#a07050','ev',e)).join('')}</div>`:'';

  return `
    <div class="wrap">
      <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid var(--border2)">
        <span style="font-size:26px;line-height:1;flex-shrink:0;margin-top:2px">${m.i}</span>
        <div style="flex:1">
          <h2 style="font-family:'Cinzel',serif;font-size:17px;font-weight:700;color:${cc};letter-spacing:.5px;margin-bottom:4px">${esc(cat)}</h2>
          <p style="font-size:11px;color:var(--text4);font-family:'Inter',sans-serif">${esc(m.d)} &nbsp;·&nbsp; <span style="color:${cc}">${shown.length}</span>${shown.length!==all.length?` of ${all.length}`:''} tools</p>
        </div>
      </div>
      <div class="filterbar">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:${subcats.length>1||types.length>1||evPresent.length?'10px':'0'}">
          <div class="searchbox" style="flex:1">
            <span class="icon" style="font-size:14px">⌕</span>
            <input id="c-search" placeholder="Filter within ${esc(cat)}…" value="${esc(cSearch)}" style="padding-top:9px;padding-bottom:9px;font-size:12px">
          </div>
          ${activeFilters?`<button id="clr-filters" class="clear-btn">✕ Clear ${activeFilters}</button>`:''}
        </div>
        ${subcatRow}${typeRow}${evRow}
      </div>
      ${shown.length?`<div class="grid-tools fade-in" id="tool-grid">${shown.map(toolCard).join('')}</div>`
        :`<div class="empty"><div class="ico">🔍</div><div style="font-size:12px;font-family:'Inter',sans-serif">No tools match the active filters.</div></div>`}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOOL CARD
═══════════════════════════════════════════════════════════════════════════ */
function toolCard(t){
  const cc=catColor(t.c);
  const starred=isStarred(t.n);
  return `<div class="tool-card" data-tool="${esc(t.n)}" style="--cc:${cc}" tabindex="0">
    <div style="display:flex;align-items:flex-start;gap:6px;padding-right:24px">
      <span class="mono" style="color:${cc};font-weight:600;font-size:12px;line-height:1.3;flex:1;letter-spacing:.2px">${esc(t.n)}</span>
      <div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0;margin-top:1px">
        ${makeTag(t.t||'CLI',cc,8)}
        ${statusBadge(t.oss)}
      </div>
    </div>
    ${t.p?`<p class="tool-card-purpose">${esc(t.p)}</p>`:''}
    ${t.sub?`<div style="font-size:9px;color:var(--text4);font-family:'JetBrains Mono',monospace;letter-spacing:.5px">${esc(t.sub)}</div>`:''}
    <button class="bm-star${starred?' starred':''}" data-star="${esc(t.n)}" title="Bookmark">${starred?'★':'☆'}</button>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RUNBOOK LIST
═══════════════════════════════════════════════════════════════════════════ */
function renderRbList(){
  return `<div class="wrap-sm">
    <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border2)">
      <div class="sec-lbl" style="margin-bottom:8px">Investigation Runbooks</div>
      <h2 style="font-family:'Cinzel',serif;font-size:20px;font-weight:700;color:var(--accent3);margin-bottom:8px;letter-spacing:.5px">Step-by-Step SOPs</h2>
      <p style="font-size:12px;color:var(--text4);line-height:1.7;font-family:'Inter',sans-serif">Complete workflows linking tools across categories for structured forensic investigation.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${RUNBOOKS.map(rb=>`
        <div class="rb-card" data-rb="${esc(rb.id)}">
          <div style="display:flex;gap:14px;align-items:flex-start">
            <span style="font-size:24px;flex-shrink:0;margin-top:2px">${rb.icon}</span>
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px;color:var(--text1);margin-bottom:5px;letter-spacing:.2px">${esc(rb.title)}</div>
              <p style="font-size:11px;color:var(--text4);line-height:1.6;margin-bottom:10px;font-family:'Inter',sans-serif">${esc(rb.desc)}</p>
              <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
                <span style="font-size:10px;color:var(--text4);font-family:'Inter',sans-serif">🔎 ${esc(rb.inv)}</span>
                <span style="color:var(--text4);margin:0 4px;opacity:.4">·</span>
                <span style="font-size:10px;color:var(--text4);font-family:'JetBrains Mono',monospace">${rb.steps.length} steps</span>
                <span style="margin:0 4px;color:var(--text4);opacity:.4">·</span>
                ${rb.tags.map(tg=>makeTag(tg,'#a07050',8)).join('')}
              </div>
            </div>
            <span style="color:var(--accent3);font-size:11px;font-weight:600;flex-shrink:0;opacity:.6;margin-top:2px">→</span>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RUNBOOK DETAIL
═══════════════════════════════════════════════════════════════════════════ */
function renderRbDetail(){
  const rb=activeRb;
  const steps=rb.steps.map((step,i)=>{
    const tool=TOOLS.find(x=>x.n.toLowerCase()===step.tool.toLowerCase())||TOOLS.find(x=>x.n.toLowerCase().includes(step.tool.toLowerCase()));
    const cc=tool?catColor(tool.c):'var(--accent)';
    return `<div class="rb-step">
      <div class="step-num" style="border-color:${cc};color:${cc}">${i+1}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">
          <button ${tool?`data-tool="${esc(tool.n)}"`:''}
            class="mono${tool?' tool-link':''}"
            style="color:${cc};font-weight:600;font-size:12px;background:none;border:none;cursor:${tool?'pointer':'default'};padding:0;text-align:left;letter-spacing:.2px">
            ${esc(step.tool)}
          </button>
          ${tool?`${makeTag(tool.t||'CLI',cc,8)} ${statusBadge(tool.oss)}`:''}
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--text1);margin-bottom:4px;font-family:'Inter',sans-serif">${esc(step.action)}</div>
        <div style="font-size:11px;color:var(--text4);line-height:1.6;font-family:'Inter',sans-serif">💡 ${esc(step.note)}</div>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="rb-breadcrumb">
      <button id="rb-back" style="color:var(--accent3);font-weight:600;font-size:10px;padding:4px 12px;border:1px solid rgba(212,170,112,.3);border-radius:2px;background:rgba(212,170,112,.06);letter-spacing:.5px;text-transform:uppercase;font-family:'Inter',sans-serif">← Runbooks</button>
      <span style="opacity:.3">›</span><span style="font-size:11px">${esc(rb.title)}</span>
    </div>
    <div class="wrap-sm">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border2)">
        <span style="font-size:30px;flex-shrink:0;line-height:1;margin-top:3px">${rb.icon}</span>
        <div>
          <h2 style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:var(--accent3);margin-bottom:8px;letter-spacing:.5px">${esc(rb.title)}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">
            ${rb.tags.map(tg=>makeTag(tg,'#a07050',8)).join('')}
            <span style="font-size:10px;color:var(--text4);display:flex;align-items:center;font-family:'Inter',sans-serif">🔎 ${esc(rb.inv)}</span>
          </div>
          <p style="font-size:12px;color:var(--text4);line-height:1.65;font-family:'Inter',sans-serif">${esc(rb.desc)}</p>
        </div>
      </div>
      ${steps}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL (with copy, related tools, prev/next navigation)
═══════════════════════════════════════════════════════════════════════════ */
function openModal(name,filteredList){
  const t=TOOLS.find(x=>x.n===name);
  if(!t) return;

  // Update recently viewed
  addRecent(name);
  if(document.getElementById('bm-panel').classList.contains('open')&&currentBmTab==='recent') renderBmPanel();

  // Modal navigation list
  if(filteredList) modalFilteredTools=filteredList;
  else if(!modalFilteredTools.length) modalFilteredTools=kbdCards.map(c=>c.dataset.tool).filter(Boolean).map(n=>TOOLS.find(x=>x.n===n)).filter(Boolean);
  if(!modalFilteredTools.length) modalFilteredTools=[t];
  modalCurrentIdx=modalFilteredTools.findIndex(x=>x.n===name);

  const cc=catColor(t.c),cat=CAT[t.c]||{};
  const starred=isStarred(t.n);
  const canPrev=modalCurrentIdx>0;
  const canNext=modalCurrentIdx<modalFilteredTools.length-1;

  // Evidence tags (with backfill)
  const evList=t.ev&&t.ev.length?t.ev:(CAT_EV_DEFAULTS[t.c]||[]);
  const evTags=evList.length
    ?evList.map(e=>makeTag(e,'#a07050',8)).join(' ')
    :`<span style="font-size:11px;color:var(--text4);font-family:'Inter',sans-serif">—</span>`;

  // Related tools (#16): same subcategory, different tool
  const relatedTools=t.sub
    ? TOOLS.filter(r=>r.c===t.c&&r.sub===t.sub&&r.n!==t.n).slice(0,4)
    : TOOLS.filter(r=>r.c===t.c&&r.n!==t.n).slice(0,4);

  const relatedHtml=relatedTools.length?`
    <div class="modal-sec">
      <div class="modal-sec-title" style="color:var(--text3)">Related Tools</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${relatedTools.map(r=>{
          const rc=catColor(r.c);
          return `<button class="related-tool-chip" data-tool="${esc(r.n)}" style="border-color:${hex2rgba(rc,.3)}">
            <span style="color:${rc};font-size:11px">${esc(r.n)}</span>
            ${makeTag(r.t||'CLI',rc,7)}
          </button>`;
        }).join('')}
      </div>
    </div>`:'';

  // Command block content
  const cmdText=`# ${t.n}  [${t.t||'CLI'}]  ${t.oss?'[OSS]':'[COMMERCIAL]'}
# Category : ${t.c}${t.sub?' / '+t.sub:''}
# Purpose  : ${t.p||'See documentation'}

${t.n.includes(' ')||t.n.includes('/')?'# See official documentation for usage and flags':`${t.n} --help\nman ${t.n}`}`;

  document.getElementById('modal').innerHTML=`
    <div class="modal-nav">
      <button class="modal-nav-btn" id="modal-prev" title="Previous tool (←)" ${canPrev?'':'disabled'}>←</button>
      <span style="font-size:9px;color:var(--text4);padding:0 4px;line-height:30px;font-family:'JetBrains Mono',monospace">${modalCurrentIdx+1}/${modalFilteredTools.length}</span>
      <button class="modal-nav-btn" id="modal-next" title="Next tool (→)" ${canNext?'':'disabled'}>→</button>
    </div>
    <button class="modal-close" id="mcl">✕</button>
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:10px;padding-bottom:14px;border-bottom:1px solid var(--border2)">
      <span style="font-size:24px;flex-shrink:0;line-height:1;margin-top:3px">${cat.i||'🔧'}</span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:7px">
          <span class="mono" style="font-size:16px;font-weight:600;color:${cc};letter-spacing:.3px">${esc(t.n)}</span>
          ${makeTag(t.t||'CLI',cc,8)}
          ${t.sub?makeTag(t.sub,'#8a7050',8):''}
          ${makeTag(t.c,cc,8)}
          ${statusBadge(t.oss)}
          <button id="modal-star" title="Bookmark (S)" style="font-size:15px;color:${starred?'var(--accent3)':'var(--text4)'};transition:color .15s;padding:0 4px">${starred?'★':'☆'}</button>
        </div>
        ${t.p?`<p style="font-size:12px;color:var(--text3);line-height:1.55;font-family:'Inter',sans-serif">${esc(t.p)}</p>`:''}
      </div>
    </div>
    ${t.s?`<div class="modal-sec"><div class="modal-sec-title" style="color:var(--accent3)">DFIR Scenario</div><p style="font-size:12px;color:var(--text3);line-height:1.7;font-family:'Inter',sans-serif">${esc(t.s)}</p></div>`:''}
    <div class="modal-sec" style="border-color:${hex2rgba(cc,.25)}">
      <div class="modal-sec-title" style="color:${cc}">
        Quick Reference
        <button class="copy-btn" id="copy-cmd" title="Copy command (C)">⎘ Copy</button>
      </div>
      <pre id="cmd-block" style="font-size:11px;color:#8aaa70;line-height:1.8">${esc(cmdText)}</pre>
    </div>
    <div class="modal-sec">
      <div class="modal-sec-title" style="color:var(--accent3)">Evidence Types</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">${evTags}</div>
    </div>
    ${relatedHtml}
    <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:7px">
      <button onclick="goTab('${esc(t.c)}');closeModal()" style="background:${hex2rgba(cc,.1)};color:${cc};border:1px solid ${hex2rgba(cc,.28)};border-radius:2px;padding:5px 14px;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;font-family:'Inter',sans-serif">Browse ${esc(t.c)} →</button>
      ${t.sub?`<button onclick="goTabFiltered('${esc(t.c)}','${esc(t.sub)}');closeModal()" style="background:${hex2rgba(cc,.07)};color:${cc};border:1px solid ${hex2rgba(cc,.22)};border-radius:2px;padding:5px 14px;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;font-family:'Inter',sans-serif">Filter: ${esc(t.sub)} →</button>`:''}
    </div>`;

  document.getElementById('overlay').classList.add('open');
  document.getElementById('mcl').onclick=closeModal;

  // Prev/Next (#10)
  document.getElementById('modal-prev').onclick=()=>{
    if(modalCurrentIdx>0) openModal(modalFilteredTools[modalCurrentIdx-1].n);
  };
  document.getElementById('modal-next').onclick=()=>{
    if(modalCurrentIdx<modalFilteredTools.length-1) openModal(modalFilteredTools[modalCurrentIdx+1].n);
  };

  // Bookmark
  document.getElementById('modal-star').onclick=e=>{
    toggleBm(t.n,e);
    const s=document.getElementById('modal-star');
    const now=isStarred(t.n);
    s.textContent=now?'★':'☆'; s.style.color=now?'var(--accent3)':'var(--text4)';
  };

  // Copy command (#4)
  document.getElementById('copy-cmd').onclick=function(){
    navigator.clipboard.writeText(cmdText).then(()=>{
      this.textContent='✓ Copied'; this.classList.add('copied');
      setTimeout(()=>{this.textContent='⎘ Copy';this.classList.remove('copied')},2000);
    }).catch(()=>{
      // Fallback
      const ta=document.createElement('textarea');ta.value=cmdText;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
      this.textContent='✓ Copied'; this.classList.add('copied');
      setTimeout(()=>{this.textContent='⎘ Copy';this.classList.remove('copied')},2000);
    });
  };

  // Related tools
  document.querySelectorAll('.related-tool-chip').forEach(btn=>{
    btn.addEventListener('click',()=>openModal(btn.dataset.tool));
  });
}

function closeModal(){
  document.getElementById('overlay').classList.remove('open');
}

/* ═══════════════════════════════════════════════════════════════════════════
   KEYBOARD NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */
function updateKbdCards(){
  kbdCards=[...document.querySelectorAll('[data-tool]')];
  kbdIdx=-1;
  // Pre-build modal filter list from visible cards
  modalFilteredTools=kbdCards.map(c=>c.dataset.tool).filter(Boolean).map(n=>TOOLS.find(x=>x.n===n)).filter(Boolean);
}
function kbdMove(dir){
  if(!kbdCards.length) return;
  if(kbdIdx>=0) kbdCards[kbdIdx].classList.remove('kbd-focused');
  kbdIdx=Math.max(0,Math.min(kbdCards.length-1,kbdIdx+dir));
  const card=kbdCards[kbdIdx];
  card.classList.add('kbd-focused');
  card.scrollIntoView({block:'nearest',behavior:'smooth'});
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVENT BINDING
═══════════════════════════════════════════════════════════════════════════ */
function bindEvents(){
  // Cat nav cards
  document.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>goTab(el.dataset.goto)));

  // Tool cards
  document.querySelectorAll('[data-tool]').forEach(el=>{
    el.addEventListener('click',()=>openModal(el.dataset.tool));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(el.dataset.tool)}});
  });

  // Bookmark stars
  document.querySelectorAll('[data-star]').forEach(btn=>btn.addEventListener('click',e=>toggleBm(btn.dataset.star,e)));

  // Category search (debounced #1)
  const cs=document.getElementById('c-search');
  if(cs) cs.addEventListener('input',e=>{
    clearTimeout(searchTimer);
    const v=e.target.value;
    searchTimer=setTimeout(()=>{cSearch=v;render()},150);
  });

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const {ftype,val}=btn.dataset;
    if(ftype==='sub') fSubcat=fSubcat.includes(val)?fSubcat.filter(x=>x!==val):[...fSubcat,val];
    else if(ftype==='type') fType=fType.includes(val)?fType.filter(x=>x!==val):[...fType,val];
    else if(ftype==='ev') fEv=fEv.includes(val)?fEv.filter(x=>x!==val):[...fEv,val];
    render();
  }));

  const clr=document.getElementById('clr-filters');
  if(clr) clr.onclick=()=>{fSubcat=[];fType=[];fEv=[];render()};

  // Runbook cards
  document.querySelectorAll('[data-rb]').forEach(el=>el.addEventListener('click',()=>{
    activeRb=RUNBOOKS.find(r=>r.id===el.dataset.rb)||null;
    activeTab='__runbooks__';
    buildTabs(); render();
  }));

  // Runbook tool links
  document.querySelectorAll('.tool-link').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.tool) openModal(btn.dataset.tool);
  }));

  // Runbook back
  const rb=document.getElementById('rb-back');
  if(rb) rb.onclick=()=>{activeRb=null;render()};
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL KEY HANDLER
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('keydown',e=>{
  const tag=document.activeElement.tagName;
  const inInput=(tag==='INPUT'||tag==='TEXTAREA');
  const modalOpen=document.getElementById('overlay').classList.contains('open');
  const kbdOpen=document.getElementById('kbd-overlay').style.display!=='none';

  if(e.key==='Escape'){
    if(modalOpen){closeModal();return}
    if(kbdOpen){document.getElementById('kbd-overlay').style.display='none';return}
    if(gsActive){closeGsDropdown();document.getElementById('topbar-search').blur();return}
    if(document.getElementById('bm-panel').classList.contains('open')){closePanel();return}
    if(inInput){document.activeElement.blur();return}
  }

  // Modal prev/next with arrow keys
  if(modalOpen){
    if(e.key==='ArrowLeft'){e.preventDefault();document.getElementById('modal-prev')?.click()}
    if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('modal-next')?.click()}
    if(e.key==='s'||e.key==='S'){
      const name=TOOLS[modalCurrentIdx]?.n||modalFilteredTools[modalCurrentIdx]?.n;
      if(name) toggleBm(name,null);
    }
    if(e.key==='c'||e.key==='C') document.getElementById('copy-cmd')?.click();
    return;
  }

  if(kbdOpen) return;

  if(e.key==='/'&&!inInput){e.preventDefault();document.getElementById('topbar-search').focus();document.getElementById('topbar-search').select()}
  if(e.key==='ArrowDown'&&!inInput&&!gsActive){e.preventDefault();kbdMove(1)}
  if(e.key==='ArrowUp'&&!inInput&&!gsActive){e.preventDefault();kbdMove(-1)}

  if(e.key==='ArrowDown'&&gsActive){
    e.preventDefault();
    gsIdx=Math.min(gsIdx+1,gsResults.length-1);
    document.querySelectorAll('.gs-result').forEach(r=>r.classList.toggle('active',parseInt(r.dataset.gsIdx)===gsIdx));
  }
  if(e.key==='ArrowUp'&&gsActive){
    e.preventDefault();
    gsIdx=Math.max(gsIdx-1,0);
    document.querySelectorAll('.gs-result').forEach(r=>r.classList.toggle('active',parseInt(r.dataset.gsIdx)===gsIdx));
  }
  if(e.key==='Enter'){
    if(gsActive&&gsIdx>=0&&gsResults[gsIdx]){closeGsDropdown();openModal(gsResults[gsIdx].n);return}
    if(!inInput&&kbdIdx>=0&&kbdCards[kbdIdx]){kbdCards[kbdIdx].click();return}
  }
  if(e.key==='s'&&!inInput&&kbdIdx>=0&&kbdCards[kbdIdx]){
    const name=kbdCards[kbdIdx].dataset.tool;
    if(name) toggleBm(name,null);
  }
  if(e.key==='b'&&!inInput){document.getElementById('bm-panel').classList.toggle('open');renderBmPanel()}
  if(e.key==='t'&&!inInput){applyTheme(theme==='dark'?'light':'dark')}
  if(e.key==='?'&&!inInput){document.getElementById('kbd-overlay').style.display='flex'}
});

/* ═══════════════════════════════════════════════════════════════════════════
   TOPBAR SEARCH (global, persistent, debounced)
═══════════════════════════════════════════════════════════════════════════ */
const tsInput=document.getElementById('topbar-search');
const tsClear=document.getElementById('ts-clear');

tsInput.addEventListener('input',e=>{
  const v=e.target.value;
  tsClear.classList.toggle('show',v.length>0);
  clearTimeout(gsTimer);
  gsTimer=setTimeout(()=>{
    if(v.trim()) loadAll().then(()=>{if(tsInput.value.trim()===v.trim()) openGsDropdown(v)}).catch(console.error);
    else closeGsDropdown();
  },150);
  pushHash();
});
tsInput.addEventListener('focus',()=>{
  if(tsInput.value.trim()) loadAll().then(()=>openGsDropdown(tsInput.value)).catch(console.error);
});
tsClear.onclick=()=>{
  tsInput.value='';tsClear.classList.remove('show');
  closeGsDropdown();pushHash();
  tsInput.focus();
};

// Close gs dropdown when clicking overlay
document.getElementById('gs-overlay').addEventListener('click',closeGsDropdown);

/* ═══════════════════════════════════════════════════════════════════════════
   OVERLAY / MODAL CLOSE
═══════════════════════════════════════════════════════════════════════════ */
document.getElementById('overlay').addEventListener('click',function(e){if(e.target===this)closeModal()});
document.getElementById('kbd-overlay').addEventListener('click',function(e){if(e.target===this)this.style.display='none'});
document.getElementById('kbd-close').onclick=()=>{document.getElementById('kbd-overlay').style.display='none'};

/* ═══════════════════════════════════════════════════════════════════════════
   TOP-BAR BUTTONS
═══════════════════════════════════════════════════════════════════════════ */
document.getElementById('theme-toggle').onclick=()=>applyTheme(theme==='dark'?'light':'dark');
document.getElementById('kbd-help-btn').onclick=()=>{document.getElementById('kbd-overlay').style.display='flex'};
document.getElementById('bm-toggle').onclick=()=>{
  const panel=document.getElementById('bm-panel');
  panel.classList.toggle('open');
  if(panel.classList.contains('open')) renderBmPanel();
};
document.getElementById('bm-close').onclick=closePanel;
document.getElementById('bm-clear-all').onclick=()=>{
  if(currentBmTab==='bookmarks'){bookmarkSet.clear();saveBm();updateBmBadge();}
  else{recentViewed=[];localStorage.setItem('ts_recent','[]');}
  renderBmPanel();
};

// Bookmark panel tab switching
document.querySelectorAll('.bm-tab').forEach(btn=>btn.addEventListener('click',()=>{
  currentBmTab=btn.dataset.bmTab;
  document.querySelectorAll('.bm-tab').forEach(b=>b.classList.toggle('active',b.dataset.bmTab===currentBmTab));
  renderBmPanel();
}));

/* ═══════════════════════════════════════════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════════════════════════════════════════ */
document.getElementById('stat-tools').textContent=TOTAL;
updateBmBadge();
readHash();
buildTabs();
render();

