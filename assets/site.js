(function(){
  var $=function(id){return document.getElementById(id);};
  var SITES={S:{name:'St. Joseph Church',town:'Swedesboro'},G:{name:'St. Michael Church',town:'Gibbstown'}};
  // d: 0=Sun … 6=Sat
  var WEEK=[
    {d:6,t:'16:30',s:'G',l:'en',k:'vigil'},{d:6,t:'18:00',s:'S',l:'es',k:'vigil'},
    {d:0,t:'08:00',s:'S',l:'en'},{d:0,t:'09:30',s:'G',l:'en'},{d:0,t:'11:00',s:'S',l:'en'},{d:0,t:'12:30',s:'S',l:'es'},
    {d:1,t:'08:30',s:'G',l:'en'},{d:2,t:'08:30',s:'G',l:'en'},{d:3,t:'08:30',s:'G',l:'en'},
    {d:4,t:'08:30',s:'S',l:'en'},{d:5,t:'08:30',s:'S',l:'en'},{d:6,t:'09:00',s:'S',l:'en'}
  ];
  var SPECIAL={
    '2026-11-26':{replace:true,n:['Thanksgiving','Acción de Gracias'],m:[{t:'08:30',s:'S',l:'en'},{t:'10:30',s:'S',l:'es'}]},
    '2026-12-08':{replace:true,n:['Immaculate Conception','Inmaculada Concepción'],m:[{t:'08:30',s:'G',l:'en'},{t:'12:00',s:'S',l:'en'},{t:'18:00',s:'G',l:'en'},{t:'18:00',s:'S',l:'es'}]},
    '2026-12-12':{n:['Our Lady of Guadalupe','Nuestra Señora de Guadalupe'],m:[{t:'19:30',s:'S',l:'bi'}]},
    '2026-12-24':{n:['Christmas Eve','Nochebuena'],m:[{t:'16:00',s:'S',l:'en'},{t:'16:00',s:'G',l:'en'},{t:'17:30',s:'S',l:'en'},{t:'20:00',s:'G',l:'en'},{t:'20:00',s:'S',l:'es'},{t:'22:00',s:'S',l:'en'}]},
    '2026-12-25':{replace:true,n:['Christmas Day','Navidad'],m:[{t:'08:00',s:'S',l:'en'},{t:'09:30',s:'G',l:'en'},{t:'11:00',s:'S',l:'en'},{t:'12:30',s:'S',l:'es'}]}
  };
  var DAYS={en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            es:['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']};
  var T={en:{today:'Today',tomorrow:'Tomorrow',inn:'in',dir:'Directions',full:'Full schedule',none:'No Masses match this filter this week.',
             sun:'Sunday Mass',wk:'Weekday Mass',sat:'Saturday morning',vigil:'Sat vigil',now:'Today',mw:'Mon – Wed',tf:'Thu – Fri',next:'Next Mass'},
         es:{today:'Hoy',tomorrow:'Mañana',inn:'en',dir:'Cómo llegar',full:'Horario completo',none:'No hay Misas con este filtro esta semana.',
             sun:'Misa dominical',wk:'Misa diaria',sat:'Sábado por la mañana',vigil:'Vigilia sáb.',now:'Hoy',mw:'Lun – Mié',tf:'Jue – Vie',next:'Próxima Misa'}};
  var lang='en', nf='all', sf='all';
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

  // Hero photos: any <img data-hero> that loads joins a slow crossfade; if none load, the placeholder stays.
  (function(){
    var cap=$('heroCap');if(!cap)return;
    var ok=[],cur=0;
    function show(n){ok.forEach(function(im,i){im.classList.toggle('on',i===n);});cap.textContent=ok[n].dataset.cap;cur=n;}
    function ready(im){ok.push(im);if(ok.length===1){$('heroArt').style.display='none';show(0);}}
    document.querySelectorAll('[data-hero]').forEach(function(im){
      im.addEventListener('error',function(){im.remove();});
      if(im.complete&&im.naturalWidth)ready(im);else im.addEventListener('load',function(){ready(im);});
    });
    if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))
      setInterval(function(){if(ok.length>1)show((cur+1)%ok.length);},7000);
  })();

  function nowNY(){
    var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})
      .formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
    return {y:+p.year,m:+p.month,d:+p.day,min:(+p.hour)*60+(+p.minute)};
  }
  function mins(t){var a=t.split(':');return a[0]*60+ +a[1];}
  function fmt(t){var a=t.split(':'),h=+a[0];return ((h+11)%12+1)+':'+a[1]+' '+(h<12?'AM':'PM');}
  function match(m,f){return f==='all'||(f==='es'?(m.l==='es'||m.l==='bi'):m.s===f);}
  function upcoming(f){
    var n=nowNY(),out=[];
    for(var o=0;o<9;o++){
      var dt=new Date(Date.UTC(n.y,n.m-1,n.d+o)),dow=dt.getUTCDay();
      var key=dt.toISOString().slice(0,10),sp=SPECIAL[key],list=[];
      if(!sp||!sp.replace)WEEK.forEach(function(m){if(m.d===dow)list.push(m);});
      if(sp)sp.m.forEach(function(m){list.push({t:m.t,s:m.s,l:m.l,sp:sp.n});});
      list.forEach(function(m){
        var away=o*1440+mins(m.t)-n.min;
        if(away>-10&&match(m,f))out.push({m:m,away:away,o:o,dow:dow});
      });
    }
    return out.sort(function(a,b){return a.away-b.away;});
  }
  function dayLabel(u){return u.o===0?T[lang].today:u.o===1?T[lang].tomorrow:DAYS[lang][u.dow];}
  function tags(m){var s='';if(m.l==='es')s+='<span class="tag">Español</span>';if(m.l==='bi')s+='<span class="tag sp">Bilingual</span>';
    if(m.sp)s+='<span class="tag sp">'+m.sp[lang==='es'?1:0]+'</span>';return s;}
  function countdown(a){if(a<=0)return lang==='es'?'comenzando ahora':'starting now';
    var h=Math.floor(a/60),m=a%60;if(h>=24){var d=Math.floor(h/24);return T[lang].inn+' '+d+(lang==='es'?(d>1?' días':' día'):(d>1?' days':' day'));}
    return T[lang].inn+' '+(h?h+' h ':'')+m+' min';}

  function renderNext(){
    var mini=$('nextMini');
    if(mini){var a=upcoming('all');if(a.length){var z=a[0];mini.innerHTML='<span class="eyebrow">'+T[lang].next+'</span><b>'+dayLabel(z)+' · '+fmt(z.m.t)+'</b><span>'+SITES[z.m.s].name+', '+SITES[z.m.s].town+'</span><span class="go">'+T[lang].full+' →</span>';}}
    var body=$('nextBody'),ul=$('upnext');if(!body)return;
    var u=upcoming(nf);
    if(!u.length){body.innerHTML='<p style="padding:14px 0">'+T[lang].none+'</p>';ul.innerHTML='';return;}
    var x=u[0],st=SITES[x.m.s];
    body.innerHTML='<div class="next-when">'+dayLabel(x)+' · '+countdown(x.away)+'</div>'+
      '<div class="next-time">'+fmt(x.m.t)+'</div>'+
      '<div class="next-where">'+st.name+', '+st.town+tags(x.m)+'</div>'+
      '<div class="next-actions"><a class="btn" href="visit.html#'+(x.m.s==='S'?'st-joseph':'st-michael')+'">'+T[lang].dir+'</a>'+
      '<a class="btn ghost" href="mass-times.html">'+T[lang].full+'</a></div>';
    ul.innerHTML=u.slice(1,5).map(function(y){return '<li><span><b>'+dayLabel(y)+' '+fmt(y.m.t)+'</b>'+tags(y.m)+'</span><span>'+SITES[y.m.s].town+'</span></li>';}).join('');
  }
  function row(time,m,note){return '<div class="row"><time>'+time+'</time><span>'+SITES[m.s].name+', '+SITES[m.s].town+tags(m)+'</span><span class="w">'+(note||'')+'</span></div>';}
  function renderWeek(){
    var w=$('weekly');if(!w)return;
    var n=nowNY(),today=new Date(Date.UTC(n.y,n.m-1,n.d)).getUTCDay();
    var L=T[lang],f=function(m){return match(m,sf);},h='';
    function grp(title,isToday,rows){h+='<div class="daygrp"><h3>'+title+(isToday?' <span class="today">'+L.now+'</span>':'')+'</h3>'+(rows||'<p class="empty">—</p>')+'</div>';}
    var sun=WEEK.filter(function(m){return (m.k==='vigil'||m.d===0)&&f(m);}).map(function(m){return row(fmt(m.t),m,m.k==='vigil'?L.vigil:DAYS[lang][0]);}).join('');
    var mw=WEEK.filter(function(m){return m.d===1&&f(m);}).map(function(m){return row(fmt(m.t),m,L.mw);}).join('');
    var tf=WEEK.filter(function(m){return m.d===4&&f(m);}).map(function(m){return row(fmt(m.t),m,L.tf);}).join('');
    var sat=WEEK.filter(function(m){return m.d===6&&!m.k&&f(m);}).map(function(m){return row(fmt(m.t),m,DAYS[lang][6]);}).join('');
    grp(L.sun,today===0,sun);grp(L.wk,today>=1&&today<=5,mw+tf);grp(L.sat,today===6,sat);
    w.innerHTML=h;
  }
  function press(sel,attr,val){document.querySelectorAll(sel).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===val);});}
  document.querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){nf=b.dataset.f;store('sc-nf',nf);press('[data-f]','data-f',nf);renderNext();};});
  document.querySelectorAll('[data-s]').forEach(function(b){b.onclick=function(){sf=b.dataset.s;press('[data-s]','data-s',sf);renderWeek();};});

  // filterable lists: <input data-filter="#listId"> hides children that don't match
  document.querySelectorAll('[data-filter]').forEach(function(inp){
    var list=document.querySelector(inp.dataset.filter),empty=inp.dataset.empty&&document.querySelector(inp.dataset.empty);
    if(!list)return;
    inp.addEventListener('input',function(){
      var q=inp.value.trim().toLowerCase(),n=0;
      Array.prototype.forEach.call(list.children,function(a){var ok=a.textContent.toLowerCase().indexOf(q)>-1;a.hidden=!ok;if(ok)n++;});
      if(empty)empty.hidden=n>0;
    });
  });

  // prefill form fields from the URL, e.g. signup.html?For=Divine+Deli
  try{new URLSearchParams(location.search).forEach(function(v,k){
    document.querySelectorAll('form [name]').forEach(function(el){if(el.name===k&&el.type!=='radio')el.value=v;});
  });}catch(e){}

  // request forms: build an email to the parish office from the fields
  document.querySelectorAll('form[data-mail]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var lines=[];
      f.querySelectorAll('input,select,textarea').forEach(function(el){
        if(!el.name||((el.type==='radio'||el.type==='checkbox')&&!el.checked)||!el.value)return;
        lines.push(el.name+': '+el.value);
      });
      window.location.href='mailto:'+f.dataset.mail+'?subject='+encodeURIComponent(f.dataset.subject||'Website request')+'&body='+encodeURIComponent(lines.join('\n'));
      var d=f.querySelector('.form-done');if(d)d.hidden=false;
    });
  });

  // language
  document.querySelectorAll('[data-es]').forEach(function(el){el.dataset.en=el.innerHTML;});
  function setLang(l){
    lang=l;store('sc-lang',l);document.documentElement.lang=l;
    document.querySelectorAll('[data-es]').forEach(function(el){el.innerHTML=l==='es'?el.dataset.es:el.dataset.en;});
    if($('en')){$('en').setAttribute('aria-pressed',l==='en');$('es').setAttribute('aria-pressed',l==='es');}
    document.querySelectorAll('[data-ph-es]').forEach(function(el){if(!el.dataset.phEn)el.dataset.phEn=el.placeholder;el.placeholder=l==='es'?el.dataset.phEs:el.dataset.phEn;});
    renderNext();renderWeek();
  }
  if($('en')){$('en').onclick=function(){setLang('en');};$('es').onclick=function(){setLang('es');};}

  // mobile menu
  var mb=$('menuBtn'),nav=$('nav');
  if(mb&&nav){mb.onclick=function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);};}

  var s=store('sc-nf');if(s&&/^(all|G|S|es)$/.test(s)){nf=s;press('[data-f]','data-f',nf);}
  setLang(store('sc-lang')==='es'?'es':'en');
  setInterval(renderNext,60000);
})();
