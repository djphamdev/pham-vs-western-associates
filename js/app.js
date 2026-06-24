document.addEventListener('DOMContentLoaded',function(){initNav();initTimeline();initComparator();initEvidence();initParent();initDistress();initDamages();initDashboard();initModal();initBackToTop();initJumpMenu();initKeyboardNav();initProgressBar();handleDeepLink()});


function initTopEvidence(){
  var grid=document.getElementById('top-evidence-grid');
  if(!grid)return;
  var priorityKeywords={
    'Unfair':3,'Missing':2,'Selfish':4,'Rude':2,'Sunday':2,'Holiday':2,
    'Micro':3,'Aggressive':4,'Title':2,'Raise':3,'Remote':2,'selfish':4
  };
  var scored=CASE_DATA.evidence.map(function(e){
    var score=0;
    var txt=(e.t+' '+e.s).toLowerCase();
    Object.keys(priorityKeywords).forEach(function(k){
      if(txt.indexOf(k.toLowerCase())!==-1)score+=priorityKeywords[k];
    });
    if(e.ocr)score+=1;
    if(e.translation)score+=2;
    return Object.assign({score:score},e);
  });
  var top10=scored.sort(function(a,b){return b.score-a.score}).slice(0,10);
  grid.innerHTML=top10.map(function(e,i){
    return '<div class="card" data-id="'+e.id+'" onclick="openEvidenceById(\''+e.id+'\')" style="cursor:pointer;"><div class="top-evidence-rank">#'+(i+1)+'</div><div class="ev-title" style="margin-top:8px;">'+(e.t.length>60?e.t.substring(0,57)+'...':e.t)+'</div><div class="ev-date">'+e.d+' &middot; '+e.cat+'</div><div class="ev-summary">'+(e.s.length>140?e.s.substring(0,137)+'...':e.s)+'</div></div>';
  }).join('');
}

function openEvidenceById(id){
  var ev=CASE_DATA.evidence.find(function(e){return e.id===id});
  if(!ev)return;
  var navLink=document.querySelector('.nav-links a[href="#evidence"]');
  if(navLink)navLink.click();
  setTimeout(function(){showModal(ev);},200);
}

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
    var fileBtn=ev.file?'<a href="'+ev.file+'" target="_blank" class="btn btn-sm" style="margin-top:8px;display:inline-block;">View Evidence</a>':'';
    var id='timeline-'+(ev.date||'').replace(/[^a-zA-Z0-9]/g,'-');
    return'<div class="timeline-item" id="'+id+'" data-category="'+ev.cat+'" data-date="'+ev.date+'"><div class="timeline-date">'+fmtDate(ev.date)+'</div><div class="timeline-title">'+ev.title+'</div><div class="timeline-desc">'+ev.desc+'</div><div class="timeline-tags">'+ev.tags.map(function(t){return'<span class="timeline-tag">'+t+'</span>'}).join('')+'</div>'+fileBtn+'<a href="#'+id+'" class="btn btn-sm" style="margin-top:6px;display:inline-block;background:var(--bg-tertiary);color:var(--text-primary);" onclick="copyDeepLink(event,\'#'+id+'\')" title="Copy direct link to this timeline event">🔗 Copy Link</a></div>';
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

// Deep link helper - copy direct link to clipboard
function copyDeepLink(e,hash){
  e.preventDefault();
  e.stopPropagation();
  var url=window.location.origin+window.location.pathname+hash;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){
      showLinkCopied(e.target);
    }).catch(function(){
      fallbackCopy(url);
      showLinkCopied(e.target);
    });
  }else{
    fallbackCopy(url);
    showLinkCopied(e.target);
  }
  return false;
}
function fallbackCopy(text){
  var ta=document.createElement('textarea');
  ta.value=text;
  ta.style.position='fixed';
  ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  try{document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
}
function showLinkCopied(el){
  var orig=el.textContent;
  el.textContent='✓ Copied!';
  el.style.color='var(--success)';
  setTimeout(function(){el.textContent=orig;el.style.color='';},1800);
}

// Handle deep-link navigation on page load
function handleDeepLink(){
  var hash=window.location.hash;
  if(!hash||hash.length<2)return;
  var id=hash.substring(1);
  var el=document.getElementById(id);
  if(!el)return;
  // Find which section contains it
  var section=el.closest('.section');
  if(section){
    var links=document.querySelectorAll('.nav-links a');
    links.forEach(function(a){a.classList.remove('active')});
    document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active')});
    section.classList.add('active');
    var navLink=document.querySelector('.nav-links a[href="#'+section.id+'"]');
    if(navLink)navLink.classList.add('active');
    // Mark section as visited - highlights it for 1 minute
    markSectionVisited(section.id);
    setTimeout(function(){
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.style.outline='2px solid var(--accent)';
      setTimeout(function(){el.style.outline='';},3000);
    },100);
  }
}
window.addEventListener('hashchange',handleDeepLink);

// Generic copy to clipboard helper
function copyToClipboard(text){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  var ta=document.createElement('textarea');
  ta.value=text;
  ta.style.position='fixed';
  ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  try{document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
  return Promise.resolve();
}

// Copy section link to clipboard
function copySectionLink(e,sectionId){
  e.preventDefault();
  e.stopPropagation();
  var url=window.location.origin+window.location.pathname+'#'+sectionId;
  copyToClipboard(url);
  var icon=e.currentTarget;
  var orig=icon.innerHTML;
  icon.innerHTML='<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M13.5 4.5L6 12L2.5 8.5L3.91 7.09L6 9.17L12.09 3.09L13.5 4.5Z"/></svg>';
  icon.classList.add('copied');
  setTimeout(function(){
    icon.innerHTML=orig;
    icon.classList.remove('copied');
  },1500);
  return false;
}

// Mark a section as visited (highlighted for 1 minute)
function markSectionVisited(sectionId){
  var section=document.getElementById(sectionId);
  if(!section)return;
  var icon=document.querySelector('.section-link-icon[data-section="'+sectionId+'"]');
  // Add visited class for 1 minute (60000ms)
  section.classList.add('visited-link');
  if(icon)icon.classList.add('visited');
  setTimeout(function(){
    section.classList.remove('visited-link');
    if(icon)icon.classList.remove('visited');
  },60000);
}

// Hook: when user clicks any section link icon or nav link, mark as visited
document.addEventListener('click',function(e){
  var navLink=e.target.closest('.nav-links a[href^="#"]');
  if(navLink){
    var sid=navLink.getAttribute('href').substring(1);
    markSectionVisited(sid);
  }
  var secIcon=e.target.closest('.section-link-icon');
  if(secIcon){
    markSectionVisited(secIcon.dataset.section);
  }
});

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
  var jaSignificant=CASE_DATA.evidence.filter(function(e){return isItemJapanese(e)}).length;
  var translatedCount=CASE_DATA.evidence.filter(function(e){return e.translation}).length;
  var translateableCount=CASE_DATA.evidence.filter(function(e){
    if(!e.f)return false;
    var lower=e.f.toLowerCase();
    return lower.indexOf('.png')>-1||lower.indexOf('.jpg')>-1||lower.indexOf('.jpeg')>-1||lower.indexOf('.pdf')>-1;
  }).length;
  c.innerHTML='<span class="tag-filter active" data-tag="all">All</span>'+
    '<span class="tag-filter" data-tag="__japanese__" style="border-color:var(--warning);color:var(--warning);">🇯🇵 Japanese ('+jaSignificant+')</span>'+
    '<span class="tag-filter" data-tag="__translated__" style="border-color:var(--success);color:var(--success);">✓ Translated ('+translatedCount+')</span>'+
    '<span class="tag-filter" data-tag="__translateable__" style="border-color:var(--accent);color:var(--accent);">🌐 All Translateable ('+translateableCount+')</span>'+
    tags.map(function(t){return'<span class="tag-filter" data-tag="'+t+'">'+t+'</span>'}).join('');
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

// Returns true only if text has SIGNIFICANT Japanese content
// (more than 20 Japanese chars OR >5% of meaningful chars are Japanese)
// This filters out email UI chrome like 受信箱/返信 that appear in screenshots
// of English emails from a Japanese-localized email client
function hasSignificantJapanese(text){
  if(!text)return false;
  var jaChars=(text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g)||[]).length;
  if(jaChars===0)return false;
  // Total meaningful chars (word chars + Japanese)
  var totalChars=(text.match(/[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g)||[]).length;
  if(totalChars===0)return false;
  var ratio=jaChars/totalChars;
  return jaChars>20||ratio>0.05;
}

// Combined check: jaVerified flag OR actual significant Japanese content
function isItemJapanese(item){
  if(item.jaVerified===true)return true;
  if(item.jaVerified===false)return false; // explicitly false
  return hasSignificantJapanese(item.t)||hasSignificantJapanese(item.s)||hasSignificantJapanese(item.ocr);
}

function highlightText(text, search){
  if(!search||!text)return text;
  var regex=new RegExp('('+search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return text.replace(regex,'<mark style="background:var(--warning);color:#0f1117;padding:1px 3px;border-radius:2px;">$1</mark>');
}

function renderEvidence(){
  var g=document.getElementById('evidence-grid');
  var filtered=CASE_DATA.evidence.filter(function(e){
    var mt=true;
    if(evFilter==='__japanese__'){
      mt=isItemJapanese(e);
    }else if(evFilter==='__translated__'){
      mt=!!e.translation;
    }else if(evFilter==='__translateable__'){
      if(!e.f)return false;
      var lower=e.f.toLowerCase();
      mt=lower.indexOf('.png')>-1||lower.indexOf('.jpg')>-1||lower.indexOf('.jpeg')>-1||lower.indexOf('.pdf')>-1;
    }else if(evFilter!=='all'){
      mt=e.tags.indexOf(evFilter)!==-1;
    }
    var ms=evSearch===''||e.t.toLowerCase().indexOf(evSearch)!==-1||e.s.toLowerCase().indexOf(evSearch)!==-1||e.tags.some(function(t){return t.toLowerCase().indexOf(evSearch)!==-1})||(e.ocr&&e.ocr.toLowerCase().indexOf(evSearch)!==-1);
    return mt&&ms;
  });
  if(!filtered.length){
    g.innerHTML='<p style="color:var(--text-muted);padding:20px;text-align:center;">No evidence items match your search.</p>';
    return;
  }
  g.innerHTML=filtered.map(function(e){
    var jaBadge='';
    var hasJa=isItemJapanese(e);
    if(hasJa){
      var ocrSnippet=e.ocr?e.ocr.substring(0,500).replace(/\n/g,' ').replace(/"/g,'&quot;'):'';
      jaBadge='<a href="https://translate.google.com/?sl=ja&tl=en&text='+encodeURIComponent(ocrSnippet)+'" target="_blank" rel="noopener" class="japanese-badge" style="text-decoration:none;cursor:pointer;" title="Click to translate OCR text with Google Translate" onclick="event.stopPropagation();">🇯🇵 JP · Translate</a>';
    }
    var t=evSearch?highlightText(e.t,evSearch):e.t;
    var s=evSearch?highlightText(e.s,evSearch):e.s;
    return'<div class="evidence-card" id="evidence-'+e.id+'" data-id="'+e.id+'">'+jaBadge+'<div class="ev-title">'+t+'</div><div class="ev-date">'+e.d+' &middot; '+e.cat+'</div><div class="ev-summary">'+s+'</div><div class="ev-tags">'+e.tags.map(function(tg){return'<span class="ev-tag">'+tg+'</span>'}).join('')+'</div><div class="ev-actions"><a href="'+e.f+'" target="_blank" class="ev-direct-link" onclick="event.stopPropagation()">View Source</a><a href="#evidence-'+e.id+'" class="ev-direct-link ev-copy-link" onclick="copyDeepLink(event,\'#evidence-'+e.id+'\')" title="Copy direct link to this evidence card">🔗 Copy Link</a></div></div>';
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
  var fileLink=ev.f?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:8px;">Source File (GitHub Repository)</h4><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;"><a href="'+ev.f+'" target="_blank" class="btn btn-primary" style="display:inline-block;">Open File on GitHub</a></div><p style="font-size:11px;color:var(--text-muted);word-break:break-all;">'+decodeURIComponent(ev.f).split('/').pop()+'</p></div>':'';
  var translationBlock=ev.translation?'<div class="translation-block"><h4>TRANSLATION NOTES (Japanese &rarr; English)</h4><div class="translation-content">'+ev.translation.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div></div>':'';
  var ocrId='ocr-block-'+ev.id.replace(/[^a-zA-Z0-9]/g,'');
  var hasJaContent=isItemJapanese(ev);
  var ocrSnippet=ev.ocr?ev.ocr.substring(0,500).replace(/\n/g,' '):'';
  var googleTranslateLink=hasJaContent?'<a href="https://translate.google.com/?sl=ja&tl=en&text='+encodeURIComponent(ocrSnippet)+'" target="_blank" rel="noopener" class="btn btn-sm" style="background:var(--accent);color:#0f1117;border-color:var(--accent);font-weight:600;margin-left:8px;">🌐 Translate OCR with Google</a>':'';
  var ocrBlock=ev.ocr?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><div class="ocr-header"><h4 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--warning);margin:0;">OCR Text Extraction (Japanese/English)</h4><div><button class="lang-toggle" data-ocr-id="'+ocrId+'">Open Full View</button>'+googleTranslateLink+'</div></div><pre id="'+ocrId+'" style="font-family:monospace;font-size:12px;color:var(--text-secondary);background:var(--bg-primary);padding:10px;border-radius:4px;white-space:pre-wrap;overflow-x:hidden;max-height:250px;overflow-y:auto;border:1px solid var(--border-light);">'+ev.ocr.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre></div>':'';
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
  var p=CASE_DATA.parentCompany;
  var wai=p.waiInfo||{};

  // Organizational structure
  var org=document.createElement('div');
  org.className='card';
  org.innerHTML='<h3>Organizational Structure</h3><div class="org-chart">'+p.structure.map(function(item,i){
    return(i>0?'<div class="org-line"></div>':'')+'<div class="org-node '+(item.highlight?'highlight':'')+'"><h4>'+item.entity+'</h4><p>'+item.role+'</p></div>';
  }).join('')+'</div>';
  c.appendChild(org);

  // Reporting chain
  var rc=document.createElement('div');
  rc.className='card';
  rc.innerHTML='<h3>Reporting Chain &amp; Control Evidence</h3><ul class="fact-list">'+p.reportingChain.map(function(item){return'<li>'+item+'</li>'}).join('')+'</ul>';
  c.appendChild(rc);

  // WAI company profile card with all the external links
  var waiCard=document.createElement('div');
  waiCard.className='card';
  waiCard.style.gridColumn='1 / -1';
  waiCard.innerHTML='<h3>Western Associates Inc. (WAI) — Japan Parent Company Profile</h3>'+
    '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6;">'+
    'WAI is a real, established Japanese aviation/logistics company with operational control over SSS. Below are independent third-party verifications of WAI\'s corporate identity, multi-office Japan presence, industry standing, and the formal subsidiary relationship with SSS.</p>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;margin-top:12px;">'+
      '<a href="'+wai.mainWebsite+'" target="_blank" rel="noopener" class="wai-link"><strong>WAI Main Website</strong><br><span class="link-url">wai.co.jp</span></a>'+
      '<a href="'+wai.subsidiaryDirectory+'" target="_blank" rel="noopener" class="wai-link"><strong>WAI Company Page (Related Companies list)</strong><br><span class="link-url">wai.co.jp/company/</span> <em style="color:var(--warning);">— SSS listed here as "Related Company"</em></a>'+
      '<a href="'+wai.jbAA+'" target="_blank" rel="noopener" class="wai-link"><strong>Japan Business Aviation Association — Member Directory</strong><br><span class="link-url">jbaa.org/en/member/</span> <em style="color:var(--accent);">— WAI listed under "Operation Support"</em></a>'+
      '<a href="'+wai.zoominfo+'" target="_blank" rel="noopener" class="wai-link"><strong>ZoomInfo Company Profile — Western Associates Inc.</strong><br><span class="link-url">zoominfo.com</span></a>'+
      '<a href="'+wai.aichiBranch+'" target="_blank" rel="noopener" class="wai-link"><strong>D&amp;B Business Directory — Aichi Branch</strong><br><span class="link-url">dnb.com (Aichi)</span></a>'+
      '<a href="'+wai.osakaBranch+'" target="_blank" rel="noopener" class="wai-link"><strong>D&amp;B Business Directory — Osaka Branch</strong><br><span class="link-url">dnb.com (Osaka)</span></a>'+
    '</div>';
  c.appendChild(waiCard);

  // Operational link evidence card
  var linkCard=document.createElement('div');
  linkCard.className='card';
  linkCard.style.gridColumn='1 / -1';
  linkCard.innerHTML='<h3>WAI–SSS Operational Link Documentation</h3>'+
    '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6;">Independent documents that establish the WAI–SSS business relationship and joint operational control — important for the joint employer theory under FEHA.</p>'+
    '<ul class="fact-list">'+
      '<li><strong><a href="'+wai.pppLoanAppUrl+'" target="_blank" rel="noopener">PPP Loan Application — Southern Star Services</a></strong> (Makeup of BCJ and WAI): filed with U.S. Small Business Administration. Demonstrates SSS was financially backed and operationally directed by WAI and a WAI-related entity (BCJ). <a href="'+wai.pppLoanAppUrl+'" target="_blank" rel="noopener">View PDF ↗</a></li>'+
      '<li><strong>2019 Vietnam Airlines × Western Associates Year-End Party</strong> (Japan): public procurement document showing WAI hosted parties in Japan celebrating the Vietnam Airlines / WAI cargo relationship — direct evidence of WAI\'s role in the VN099 business that Ayako was assigned. <a href="'+wai.vietnamAirlinesPartyDoc+'" target="_blank" rel="noopener">View document ↗</a></li>'+
      '<li><strong>Southern Star Services public website</strong> (designed pro bono by Don Pham, plaintiff\'s husband): <a href="'+wai.southernStarWebsite+'" target="_blank" rel="noopener">southernstars.us ↗</a> — illustrates the SSS public-facing business at the time of Ayako\'s employment.</li>'+
    '</ul>';
  c.appendChild(linkCard);

  // Key findings
  var fg=document.createElement('div');
  fg.className='card-grid';
  fg.style.gridColumn='1 / -1';
  fg.innerHTML='<h3 style="grid-column:1/-1;font-size:16px;font-weight:600;margin-bottom:8px;">Key Findings</h3>'+p.keyFindings.map(function(f){
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
  }).join('')+'</div>'+buildLitigationTools();
}

function buildLitigationTools(){
  // Calculate days since RTS (April 13, 2026)
  var rtsDate=new Date('2026-04-13');
  var today=new Date();
  var daysSinceRts=Math.floor((today-rtsDate)/(1000*60*60*24));
  var fehaSOL=365; // FEHA: 3 years from last act, but RTS gives 1 year to file
  var solDeadline=new Date(rtsDate);
  solDeadline.setDate(solDeadline.getDate()+365);
  var daysToSOL=Math.floor((solDeadline-today)/(1000*60*60*24));
  
  // Count evidence items
  var totalEvidence=CASE_DATA.evidence.length;
  var japaneseItems=CASE_DATA.evidence.filter(function(e){return e.translation}).length;
  
  var html='';
  html+='<div class="dashboard-card" style="border-color:var(--danger);"><h3>⚖️ Statute of Limitations <span class="count" style="background:rgba(239,68,68,0.15);color:var(--danger);">'+daysToSOL+'d</span></h3>';
  html+='<div class="dash-item"><strong>RTS Issued:</strong> April 13, 2026 (Case #202508-30598105)</div>';
  html+='<div class="dash-item"><strong>Days Since RTS:</strong> '+daysSinceRts+' days</div>';
  html+='<div class="dash-item"><strong>FEHA Filing Deadline:</strong> '+solDeadline.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})+'</div>';
  html+='<div class="dash-item" style="color:var(--danger);font-weight:600;"><strong>Days Remaining to File:</strong> '+daysToSOL+' days</div>';
  html+='<div class="dash-item" style="font-size:12px;color:var(--text-muted);margin-top:8px;"><em>Note: FEHA requires filing within 1 year of RTS. SSS expected closure June 2026 adds spoliation urgency.</em></div>';
  html+='</div>';
  
  html+='<div class="dashboard-card" style="border-color:var(--success);"><h3>✅ Pre-Litigation Checklist</h3>';
  html+='<div class="dash-item">☑ Right-to-Sue obtained (April 13, 2026)</div>';
  html+='<div class="dash-item">☑ CRD administrative phase complete</div>';
  html+='<div class="dash-item">☑ Comparator identified and documented</div>';
  html+='<div class="dash-item">☑ '+totalEvidence+' evidence items catalogued</div>';
  html+='<div class="dash-item">☑ '+japaneseItems+' Japanese-text items with translation notes</div>';
  html+='<div class="dash-item">☑ Source files hosted on GitHub (permanently accessible)</div>';
  html+='<div class="dash-item">☐ Document preservation letter to SSS (recommended before June 2026 closure)</div>';
  html+='<div class="dash-item">☐ Litigation hold notice to WAI (Japan parent)</div>';
  html+='<div class="dash-item">☐ Subpoena preparation for SSS records</div>';
  html+='<div class="dash-item">☐ Kaiser medical records subpoena (emotional distress damages)</div>';
  html+='</div>';
  
  html+='<div class="dashboard-card"><h3>📋 Case Index Download</h3>';
  html+='<div class="dash-item">Download full evidence index as CSV for case management systems.</div>';
  html+='<button class="btn btn-sm" style="margin-top:8px;background:var(--accent);color:#0f1117;border-color:var(--accent);font-weight:600;" onclick="downloadCaseIndex()">⬇ Download Evidence Index (CSV)</button>';
  html+='<button class="btn btn-sm" style="margin-top:8px;margin-left:8px;" onclick="downloadCaseIndexJSON()">⬇ Download Evidence Index (JSON)</button>';
  html+='</div>';
  
  html+='<div class="dashboard-card"><h3>🔗 Quick Reference Links</h3>';
  html+='<div class="dash-item"><strong>FEHA §12940:</strong> <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=12940" target="_blank">California Fair Employment and Housing Act</a></div>';
  html+='<div class="dash-item"><strong>Google Drive:</strong> <a href="https://drive.google.com/drive/folders/1CJOcD0EBi4aH5IV2SbcZsEMtMlpxJhhZ?usp=sharing" target="_blank">Full Document Library</a></div>';
  html+='<div class="dash-item"><strong>SSS Website</strong> (designed pro bono by Don Pham): <a href="https://www.southernstars.us/" target="_blank">southernstars.us</a></div>';
  html+='<div class="dash-item"><strong>WAI Company Page</strong> (lists SSS as Related Company): <a href="https://www.wai.co.jp/company/index.php" target="_blank">wai.co.jp/company/</a></div>';
  html+='</div>';
  
  return html;
}

function downloadCaseIndex(){
  var rows=[['ID','Title','Date','Category','Summary','Has_OCR','Has_Translation','File','Tags']];
  CASE_DATA.evidence.forEach(function(e){
    rows.push([
      e.id,
      '"'+(e.t||'').replace(/"/g,'""')+'"',
      e.d||'',
      e.cat||'',
      '"'+(e.s||'').replace(/"/g,'""')+'"',
      e.ocr?'Y':'',
      e.translation?'Y':'',
      e.f||'',
      '"'+(e.tags||[]).join('; ')+'"'
    ]);
  });
  var csv=rows.map(function(r){return r.join(',')}).join('\n');
  var blob=new Blob([csv],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='Pham-v-Western-Associates-Evidence-Index-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCaseIndexJSON(){
  var data={
    case:'Pham v. Western Associates Inc.',
    crdCase:CASE_DATA.meta.crd_case,
    rtsDate:CASE_DATA.meta.rts_date,
    generated:new Date().toISOString(),
    evidenceCount:CASE_DATA.evidence.length,
    items:CASE_DATA.evidence.map(function(e){return{id:e.id,title:e.t,date:e.d,category:e.cat,summary:e.s,tags:e.tags,file:e.f,hasOCR:!!e.ocr,hasTranslation:!!e.translation}})
  };
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='Pham-v-Western-Associates-Evidence-Index-'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  URL.revokeObjectURL(url);
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
