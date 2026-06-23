document.addEventListener('DOMContentLoaded',function(){initNav();initTimeline();initComparator();initEvidence();initParent();initDistress();initDamages();initDashboard();initModal();initBackToTop();initJumpMenu();initKeyboardNav();initProgressBar();initShortcutsHint()});

function initNav(){
  var links=document.querySelectorAll('.nav-links a');
  var sections=document.querySelectorAll('.section');
  var toggle=document.getElementById('menu-toggle');
  var sidebar=document.getElementById('sidebar');
  function navigate(e,link){
    e.preventDefault();
    var id=link.getAttribute('href').substring(1);
    links.forEach(function(a){a.classList.remove('active')});
    sections.forEach(function(s){s.classList.remove('active')});
    var navLink=document.querySelector('.nav-links a[href="#'+id+'"]');
    if(navLink){navLink.classList.add('active');}
    document.getElementById(id).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
    sidebar.classList.remove('open');
  }
  links.forEach(function(l){l.addEventListener('click',function(e){navigate(e,l)})});
  toggle.addEventListener('click',function(){sidebar.classList.toggle('open')});
  document.addEventListener('click',function(e){
    if(!sidebar.contains(e.target)&&!toggle.contains(e.target)){
      sidebar.classList.remove('open');
    }
  });
}

function initTimeline(){
  var c=document.getElementById('timeline-container');
  var btns=document.querySelectorAll('.filter-btn');
  c.innerHTML=CASE_DATA.timeline.map(function(ev){
    var fileBtn=ev.file?'<a href="'+ev.file+'" target="_blank" class="btn btn-sm" style="margin-top:8px;">View Evidence</a>':'';
    return'<div class="timeline-item" data-category="'+ev.cat+'"><div class="timeline-date">'+fmtDate(ev.date)+'</div><div class="timeline-title">'+ev.title+'</div><div class="timeline-desc">'+ev.desc+'</div><div class="timeline-tags">'+ev.tags.map(function(t){return'<span class="timeline-tag">'+t+'</span>'}).join('')+'</div>'+fileBtn+'</div>';
  }).join('');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      btns.forEach(function(x){x.classList.remove('active')});
      this.classList.add('active');
      var f=this.dataset.filter;
      document.querySelectorAll('.timeline-item').forEach(function(item){
        item.classList.toggle('hidden',f!=='all'&&item.dataset.category!==f);
      });
    });
  });
}

function fmtDate(d){
  if(d.length===7){
    var p=d.split('-');
    return['January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(p[1])-1]+' '+p[0];
  }
  return d;
}

function initComparator(){
  var pd=document.getElementById('plaintiff-details');
  var cd=document.getElementById('comparator-details');
  var t=document.getElementById('comparison-table');
  var p=CASE_DATA.comparator.plaintiff;
  var c=CASE_DATA.comparator.comparator;
  pd.innerHTML=Object.entries(p).map(function(kv){
    return'<p><span class="label">'+kv[0].replace(/([A-Z])/g,' $1').replace(/^./,function(s){return s.toUpperCase()})+':</span> '+kv[1]+'</p>';
  }).join('');
  cd.innerHTML=Object.entries(c).map(function(kv){
    return'<p><span class="label">'+kv[0].replace(/([A-Z])/g,' $1').replace(/^./,function(s){return s.toUpperCase()})+':</span> '+kv[1]+'</p>';
  }).join('');
  t.innerHTML='<thead><tr><th>Metric</th><th>Ayako (Japanese)</th><th>Maria (American)</th></tr></thead><tbody>'+CASE_DATA.comparator.rows.map(function(r){
    return'<tr><td><strong>'+r.m+'</strong></td><td class="'+(r.d==='lower'||r.d==='higher'?'diff-higher':'')+'">'+r.p+'</td><td class="'+(r.d==='lower'||r.d==='higher'?'diff-lower':'')+'">'+r.c+'</td></tr>';
  }).join('')+'</tbody>';
}

var evFilter='all',evSearch='';
function initSearchSuggestions(){
  var search=document.getElementById('evidence-search');
  var suggestions=document.getElementById('search-suggestions');
  if(!search||!suggestions)return;
  
  var allTags=[];
  CASE_DATA.evidence.forEach(function(e){
    e.tags.forEach(function(t){if(allTags.indexOf(t)===-1)allTags.push(t)});
  });
  
  search.addEventListener('input',function(){
    var q=this.value.toLowerCase();
    if(q.length<2){suggestions.classList.remove('active');return;}
    var matches=[];
    CASE_DATA.evidence.forEach(function(e){
      if(e.t.toLowerCase().indexOf(q)!==-1&&matches.indexOf(e.t)===-1)matches.push(e.t);
      if(e.s.toLowerCase().indexOf(q)!==-1&&matches.indexOf(e.s.substring(0,60))===-1)matches.push(e.s.substring(0,60));
    });
    allTags.forEach(function(t){
      if(t.toLowerCase().indexOf(q)!==-1&&matches.indexOf(t)===-1)matches.push(t);
    });
    if(matches.length===0){suggestions.classList.remove('active');return;}
    suggestions.innerHTML=matches.slice(0,8).map(function(m){
      return '<div class="search-suggestion" data-val="'+m+'">'+m+'</div>';
    }).join('');
    suggestions.classList.add('active');
    suggestions.querySelectorAll('.search-suggestion').forEach(function(el){
      el.addEventListener('click',function(){
        search.value=this.dataset.val;
        evSearch=this.dataset.val.toLowerCase();
        renderEvidence();
        suggestions.classList.remove('active');
      });
    });
  });
  
  document.addEventListener('click',function(e){
    if(!suggestions.contains(e.target)&&e.target!==search){
      suggestions.classList.remove('active');
    }
  });
}

function initEvidence(){
  renderEvidence();
  renderTagFilters();
  renderEvStats();
  initSearchSuggestions();
  document.getElementById('evidence-search').addEventListener('input',function(){
    evSearch=this.value.toLowerCase();
    renderEvidence();
  });
}

function renderEvStats(){
  var stats=document.getElementById('evidence-stats');
  var cats={};
  CASE_DATA.evidence.forEach(function(e){cats[e.cat]=(cats[e.cat]||0)+1});
  stats.innerHTML=Object.entries(cats).map(function(kv){
    return'<div class="stat-item"><div class="stat-number">'+kv[1]+'</div><div class="stat-label">'+kv[0]+'</div></div>';
  }).join('')+'<div class="stat-item"><div class="stat-number">'+CASE_DATA.evidence.length+'</div><div class="stat-label">Total Items</div></div>';
}

function renderTagFilters(){
  var c=document.getElementById('tag-filters');
  var tags=[];
  CASE_DATA.evidence.forEach(function(e){e.tags.forEach(function(t){if(tags.indexOf(t)===-1)tags.push(t)})});
  c.innerHTML='<span class="tag-filter active" data-tag="all">All</span>'+tags.map(function(t){return'<span class="tag-filter" data-tag="'+t+'">'+t+'</span>'}).join('');
  c.querySelectorAll('.tag-filter').forEach(function(el){
    el.addEventListener('click',function(){
      c.querySelectorAll('.tag-filter').forEach(function(e){e.classList.remove('active')});
      this.classList.add('active');
      evFilter=this.dataset.tag;
      renderEvidence();
    });
  });
}

function hasJapanese(text){
  if(!text)return false;
  return/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

function highlightText(text, search){
  if(!search||!text)return text;
  var regex=new RegExp('('+search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return text.replace(regex,'<mark style="background:var(--warning);color:#0f1117;padding:1px 3px;border-radius:2px;">$1</mark>');
}

function renderEvidence(){
  var g=document.getElementById('evidence-grid');
  var filtered=CASE_DATA.evidence.filter(function(e){
    var mt=evFilter==='all'||e.tags.indexOf(evFilter)!==-1;
    var ms=evSearch===''||e.t.toLowerCase().indexOf(evSearch)!==-1||e.s.toLowerCase().indexOf(evSearch)!==-1||e.tags.some(function(t){return t.toLowerCase().indexOf(evSearch)!==-1})||(e.ocr&&e.ocr.toLowerCase().indexOf(evSearch)!==-1);
    return mt&&ms;
  });
  if(!filtered.length){
    g.innerHTML='<p style="color:var(--text-muted);padding:20px;text-align:center;">No evidence items match your search.</p>';
    return;
  }
  g.innerHTML=filtered.map(function(e){
    var jaBadge='';
    if(hasJapanese(e.t)||hasJapanese(e.s)||hasJapanese(e.ocr)){
      jaBadge='<span class="japanese-badge">JP</span>';
    }
    var t=evSearch?highlightText(e.t,evSearch):e.t;
    var s=evSearch?highlightText(e.s,evSearch):e.s;
    return'<div class="evidence-card" data-id="'+e.id+'">'+jaBadge+'<div class="ev-title">'+t+'</div><div class="ev-date">'+e.d+' &middot; '+e.cat+'</div><div class="ev-summary">'+s+'</div><div class="ev-tags">'+e.tags.map(function(tg){return'<span class="ev-tag">'+tg+'</span>'}).join('')+'</div><a href="'+e.f+'" target="_blank" class="ev-direct-link" onclick="event.stopPropagation()">View Source File on GitHub</a></div>';
  }).join('');
  g.querySelectorAll('.evidence-card').forEach(function(card){
    card.addEventListener('click',function(){
      var ev=CASE_DATA.evidence.find(function(e){return e.id===this.dataset.id});
      if(ev)showModal(ev);
    });
  });
}

function showModal(ev){
  var modal=document.getElementById('evidence-modal');
  var body=document.getElementById('modal-body');
  var fileLink=ev.f?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:8px;">Source File (GitHub Repository)</h4><a href="'+ev.f+'" target="_blank" class="btn btn-primary" style="display:inline-block;margin-bottom:8px;">Open File on GitHub</a><p style="font-size:11px;color:var(--text-muted);word-break:break-all;">'+decodeURIComponent(ev.f).split('/').pop()+'</p></div>':'';
  var translationBlock=ev.translation?'<div class="translation-block"><h4>TRANSLATION NOTES (Japanese &rarr; English)</h4><div class="translation-content">'+ev.translation.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div></div>':'';
  var ocrId='ocr-block-'+ev.id.replace(/[^a-zA-Z0-9]/g,'');
  var ocrBlock=ev.ocr?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><div class="ocr-header"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--warning);margin:0;">OCR Text Extraction (Japanese/English)</h4><div><button class="lang-toggle" data-ocr-id="'+ocrId+'">Open Full View</button></div></div><pre id="'+ocrId+'" style="font-family:monospace;font-size:12px;color:var(--text-secondary);background:var(--bg-primary);padding:10px;border-radius:4px;white-space:pre-wrap;overflow-x:hidden;max-height:250px;overflow-y:auto;border:1px solid var(--border-light);">'+ev.ocr.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre></div>':'';
  var relatedLink=ev.related?'<div style="margin-top:12px;"><strong style="color:var(--accent);">Related Evidence:</strong> <a href="'+ev.related+'" target="_blank" style="font-size:13px;">View Follow-up Document</a></div>':'';
  body.innerHTML='<h2 style="font-size:18px;margin-bottom:8px;">'+ev.t+'</h2><p style="color:var(--accent);font-size:13px;margin-bottom:16px;">'+ev.d+' &middot; '+ev.cat+'</p><div style="margin-bottom:16px;"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Summary</h4><p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">'+ev.s+'</p>'+relatedLink+'</div><div style="margin-bottom:16px;"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Participants</h4><p style="font-size:14px;color:var(--text-secondary);">'+ev.p.join(', ')+'</p></div><div style="margin-bottom:16px;"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Tags</h4><div style="display:flex;gap:4px;flex-wrap:wrap;">'+ev.tags.map(function(t){return'<span class="ev-tag">'+t+'</span>'}).join('')+'</div></div>'+translationBlock+ocrBlock+fileLink;
  modal.classList.remove('hidden');

  // Attach event listener for the "Open Full View" button using event delegation
  var openBtn=body.querySelector('.lang-toggle[data-ocr-id]');
  if(openBtn){
    openBtn.addEventListener('click',function(){
      var ocrEl=document.getElementById(ocrId);
      if(ocrEl){
        openTranslationViewer(ev.t,ocrEl.textContent);
      }
    });
  }
}

function openTranslationViewer(title,ocrText){
  var viewer=document.createElement('div');
  viewer.className='translation-viewer';
  var safeText=String(ocrText).replace(/</g,'&lt;').replace(/>/g,'&gt;');
  var safeTitle=String(title).replace(/</g,'&lt;').replace(/>/g,'&gt;');
  viewer.innerHTML='<div class="translation-viewer-header"><h2>'+safeTitle+'</h2><button class="translation-viewer-close" type="button">&times;</button></div><div class="translation-viewer-content">'+safeText+'</div>';
  document.body.appendChild(viewer);
  var closeBtn=viewer.querySelector('.translation-viewer-close');
  if(closeBtn){
    closeBtn.addEventListener('click',function(){viewer.remove();});
  }
}

function initModal(){
  var modal=document.getElementById('evidence-modal');
  modal.querySelector('.modal-close').addEventListener('click',function(){modal.classList.add('hidden')});
  modal.querySelector('.modal-overlay').addEventListener('click',function(){modal.classList.add('hidden')});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      modal.classList.add('hidden');
      var v=document.querySelector('.translation-viewer');
      if(v)v.remove();
    }
  });
}

function initParent(){
  var c=document.getElementById('parent-content');
  var org=document.createElement('div');
  org.className='card';
  org.innerHTML='<h3>Organizational Structure</h3><div class="org-chart">'+CASE_DATA.parentCompany.structure.map(function(item,i){
    return(i>0?'<div class="org-line"></div>':'')+'<div class="org-node '+(item.highlight?'highlight':'')+'"><h4>'+item.entity+'</h4><p>'+item.role+'</p></div>';
  }).join('')+'</div>';
  var rc=document.createElement('div');
  rc.className='card';
  rc.innerHTML='<h3>Reporting Chain</h3><ul class="fact-list">'+CASE_DATA.parentCompany.reportingChain.map(function(item){return'<li>'+item+'</li>'}).join('')+'</ul>';
  c.appendChild(org);
  c.appendChild(rc);
  var fg=document.createElement('div');
  fg.className='card-grid';
  fg.style.gridColumn='1 / -1';
  fg.innerHTML='<h3 style="grid-column:1/-1;font-size:16px;font-weight:600;margin-bottom:8px;">Key Findings</h3>'+CASE_DATA.parentCompany.keyFindings.map(function(f){
    return'<div class="card"><h3>'+f.title+'</h3><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">'+f.desc+'</p></div>';
  }).join('');
  c.appendChild(fg);
}

function initDistress(){
  var c=document.getElementById('distress-content');
  c.innerHTML=CASE_DATA.emotionalDistress.categories.map(function(cat){
    return'<div class="card"><h3>'+cat.title+'</h3><ul class="fact-list">'+cat.items.map(function(item){return'<li>'+item+'</li>'}).join('')+'</ul></div>';
  }).join('')+'<div class="card" style="grid-column:1/-1;border-color:var(--warning);"><h3>Disclaimer</h3><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">'+CASE_DATA.emotionalDistress.disclaimer+'</p></div>';
}

function initDamages(){
  var c=document.getElementById('damages-content');
  c.innerHTML=CASE_DATA.damages.categories.map(function(cat){
    return'<div class="card"><h3>'+cat.title+'</h3>'+cat.items.map(function(item){
      return'<div class="damage-item"><div><div class="damage-label">'+item.label+'</div><div style="font-size:11px;color:var(--text-muted);">'+item.note+'</div></div><div class="damage-value">'+item.value+'</div></div>';
    }).join('')+'</div>';
  }).join('')+'<div class="card" style="grid-column:1/-1;border-color:var(--accent);"><div class="damage-total"><div><div style="font-size:15px;font-weight:600;color:var(--text-primary);">Total Estimated Damages</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">'+CASE_DATA.damages.totalEstimated+'</div></div><div class="damage-value">Pending Consultation</div></div></div>';
}

function initDashboard(){
  var c=document.getElementById('dashboard-content');
  var d=CASE_DATA.dashboard;
  var sections=[
    {title:'Liability Evidence',items:d.liability,icon:''},
    {title:'Comparator Evidence',items:d.comparatorEvidence,icon:''},
    {title:'Damages Evidence',items:d.damagesEvidence,icon:''},
    {title:'Parent Company Evidence',items:d.parentCompanyEvidence,icon:''}
  ];
  c.innerHTML=sections.map(function(sec){
    return'<div class="dashboard-card"><h3>'+sec.title+' <span class="count">'+sec.items.length+'</span></h3>'+sec.items.map(function(item){
      return'<div class="dash-item">'+item.text+'</div>';
    }).join('')+'</div>';
  }).join('')+'<div class="dashboard-card"><h3>Witnesses <span class="count">'+d.witnesses.length+'</span></h3>'+d.witnesses.map(function(w){
    return'<div class="dash-item"><strong>'+w.name+'</strong> &mdash; '+w.role+'</div>';
  }).join('')+'</div><div class="dashboard-card"><h3>Available Documents <span class="count">'+d.documents.reduce(function(a,b){var n=parseInt(b.count);return a+(isNaN(n)?0:n)},0)+'+</span></h3>'+d.documents.map(function(doc){
    return'<div class="dash-item"><strong>'+doc.count+' '+doc.type+'</strong> &mdash; '+doc.desc+'</div>';
  }).join('')+'</div>';
}

function initBackToTop(){
  var btn=document.getElementById('back-to-top');
  if(!btn)return;
  window.addEventListener('scroll',function(){
    if(window.scrollY>300){btn.classList.add('visible')}else{btn.classList.remove('visible')}
  });
  btn.addEventListener('click',function(){
    window.scrollTo({top:0,behavior:'smooth'});
  });
}

function initJumpMenu(){
  var content=document.getElementById('content');
  if(!content)return;
  var jumpMenu=document.createElement('div');
  jumpMenu.className='section-jump';
  jumpMenu.id='section-jump-menu';
  jumpMenu.innerHTML='<h4>Quick Navigation</h4>'+
    ['home','timeline','comparator','evidence','parent','distress','damages','dashboard'].map(function(id){
      return'<a href="#'+id+'" data-section="'+id+'">'+id.charAt(0).toUpperCase()+id.slice(1)+'</a>';
    }).join('');
  document.body.appendChild(jumpMenu);
  jumpMenu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click',function(e){
      e.preventDefault();
      var id=this.dataset.section;
      var navLink=document.querySelector('.nav-links a[href="#'+id+'"]');
      if(navLink)navLink.click();
      jumpMenu.classList.remove('visible');
    });
  });
  var toggle=document.createElement('button');
  toggle.className='section-jump-toggle';
  toggle.id='section-jump-toggle';
  toggle.setAttribute('aria-label','Jump to section');
  toggle.setAttribute('type','button');
  toggle.textContent='\u2934';
  document.body.appendChild(toggle);
  function showJump(){
    if(window.scrollY>200){toggle.classList.add('visible')}else{toggle.classList.remove('visible');jumpMenu.classList.remove('visible')}
  }
  window.addEventListener('scroll',showJump);
  toggle.addEventListener('click',function(e){
    e.stopPropagation();
    jumpMenu.classList.toggle('visible');
  });
}

function initKeyboardNav(){
  document.addEventListener('keydown',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    var sections=['home','timeline','comparator','evidence','parent','distress','damages','dashboard'];
    var active=document.querySelector('.section.active');
    if(!active)return;
    var currentIndex=sections.indexOf(active.id);
    if(currentIndex===-1)return;
    if(e.key==='ArrowDown'||e.key==='j'){
      e.preventDefault();
      var next=sections[Math.min(currentIndex+1,sections.length-1)];
      navigateToSection(next);
    }else if(e.key==='ArrowUp'||e.key==='k'){
      e.preventDefault();
      var prev=sections[Math.max(currentIndex-1,0)];
      navigateToSection(prev);
    }
  });
}

function navigateToSection(id){
  var link=document.querySelector('.nav-links a[href="#'+id+'"]');
  if(link)link.click();
}

function initProgressBar(){
  var bar=document.createElement('div');
  bar.className='reading-progress';
  bar.id='reading-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll',function(){
    var winHeight=document.documentElement.scrollHeight-window.innerHeight;
    var progress=winHeight>0?(window.scrollY/winHeight):0;
    bar.style.transform='scaleX('+progress+')';
  });
}

function initShortcutsHint(){
  var hint=document.createElement('div');
  hint.className='shortcuts-hint';
  hint.id='shortcuts-hint';
  hint.innerHTML='<h4>Keyboard Shortcuts</h4>'+
    '<div style="font-size:12px;color:var(--text-secondary);line-height:2;">'+
    '<div>\u2191 / \u2193 Navigate sections</div>'+
    '<div>Esc Close modal</div>'+
    '<div>/ Focus search</div>'+
    '<div>T Toggle menu</div>'+
    '</div>';
  document.body.appendChild(hint);
  var toggle=document.createElement('button');
  toggle.id='shortcuts-toggle';
  toggle.setAttribute('type','button');
  toggle.setAttribute('aria-label','Show keyboard shortcuts');
  toggle.style.cssText='position:fixed;bottom:30px;left:30px;width:50px;height:50px;border-radius:50%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);font-size:20px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:199;opacity:0.7;transition:all 0.3s ease;';
  toggle.textContent='?';
  document.body.appendChild(toggle);
  toggle.addEventListener('click',function(e){
    e.stopPropagation();
    hint.classList.toggle('visible');
  });
  toggle.addEventListener('mouseenter',function(){toggle.style.opacity='1';});
  toggle.addEventListener('mouseleave',function(){toggle.style.opacity='0.7';});
  document.addEventListener('keydown',function(e){
    if(e.key==='/'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){
      e.preventDefault();
      var search=document.getElementById('evidence-search');
      if(search){
        var sections=document.querySelectorAll('.section');
        sections.forEach(function(s){s.classList.remove('active')});
        document.getElementById('evidence').classList.add('active');
        document.querySelector('.nav-links a[href="#evidence"]').classList.add('active');
        search.focus();
      }
    }else if(e.key.toLowerCase()==='t'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){
      var tog=document.getElementById('menu-toggle');
      if(tog)tog.click();
    }else if(e.key==='Escape'){
      hint.classList.remove('visible');
    }
  });
  document.addEventListener('click',function(e){
    if(!hint.contains(e.target)&&!toggle.contains(e.target)){
      hint.classList.remove('visible');
    }
  });
}
