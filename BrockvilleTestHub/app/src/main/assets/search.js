
/* SEARCH_V1: real in-app search across pages, businesses and City website links. */
(function(){
  var PAGES=[
    {t:'Things To Do',p:'explore',k:'railway tunnel aquatarium museum fulford place parks trails attractions waterfront cruises theatre arts'},
    {t:'Events',p:'events',k:'concerts shows what is on calendar festival live music'},
    {t:'City Notices',p:'notices',k:'announcements news alerts city hall updates'},
    {t:'Eat & Drink',p:'eat',k:'restaurants pubs cafes food pizza dining takeout breakfast lunch dinner'},
    {t:'Local Directory',p:'directory',k:'local shops businesses services downtown independent'},
    {t:'Shopping Directory',p:'shopping',k:'groceries stores walmart superstore pharmacy lcbo mall'},
    {t:'Garbage & Recycling',p:'garbage',k:'collection day bin bag tags green bin blue box recycling waste compost leaves'},
    {t:'Transit',p:'transit',k:'bus transit routes schedules fares para transit accessible bus pass river route'},
    {t:'Local TV',p:'tv',k:'television tv hometown tv12 yourtv cogeco cable channel watch shows'},
    {t:'Local News',p:'news',k:'news recorder times brockvilleist myfm giant fm radio newspaper'},
    {t:'School Bus Delays',p:'transit',k:'steo school bus delays cancellations snow storm busing ucdsb cdsbeo'},
 {t:'City & Safety',p:'safety',k:'911 police fire hospital emergency crisis utilities outage poison help'},
    {t:'Report an Issue',p:'report',k:'pothole streetlight bylaw complaint problem city service request'},
    {t:'Map',p:'map',k:'directions parking transit trails webcams near me location'},
    {t:'More City Services',p:'more',k:'council bylaws water sewer forms careers transit city hall'}
  ];
  var STORE_KW={
    'Real Canadian Superstore':'groceries food superstore',
    'Walmart Supercentre':'groceries superstore everything',
    'Metro':'groceries food',
    'Food Basics':'groceries food discount',
    'Canadian Tire':'auto tires hardware tools garden',
    'Giant Tiger':'discount clothing home',
    'Winners':'clothing fashion discount',
    'Dollarama':'dollar store discount cheap',
    'Shoppers Drug Mart':'pharmacy drugs prescriptions cosmetics',
    'LCBO':'liquor beer wine alcohol spirits',
    'Downtown Brockville':'downtown king street local shops',
    'Brockville Farmers Market':'market local food saturday vendors fresh'
  };
  var THINGS_KW={
    'Brockville Railway Tunnel':'railway tunnel light show historic must see',
    'Aquatarium at Tall Ships Landing':'aquatarium aquarium fish otters family kids',
    '1000 Islands Cruises & Waterfront':'cruise boat tour islands waterfront',
    'Brockville Arts Centre':'theatre shows concerts plays performances',
    'Brockville Museum':'museum history exhibits local',
    'Fulford Place':'mansion historic house museum edwardian',
    'Historic Downtown':'downtown king street shops',
    'Farmers Market':'market vendors local food saturday'
  };
  var BIZ_KW={
    'City Taxi':'taxi cab ride transport',
    'Service Canada Centre':'passport government federal services sin social insurance number',
    'McDougall Insurance & Financial':'insurance broker car home life',
    'Leonard Group Financial':'financial advisor investments retirement money planning',
    'Dependable Vacuum':'vacuum cleaner repair sales',
    'Brockville Yacht Club':'boats marina sailing river',
    'Hang Ups Creative Picture Framing':'picture framing art frames photos',
    'Artistic Hair Gallery':'hair salon barber haircut style',
    'Flair FX Salon + Spa':'hair salon spa nails massage beauty',
    "Penny's Jewellery":'jewellery jewelry rings gold watch repair gifts',
    'The Coin Hunter':'coins collectibles gold silver buying selling',
    'Alan Browns Clothing':'mens clothing suits fashion',
    'H & T Comics and Collectables':'comic books collectibles toys games cards',
    'Golden Age Comics & Collectibles':'comic books collectibles toys games cards',
    'Spitfire Records':'vinyl records music cds albums',
    'Cover to Cover':'books bookstore reading novels',
    'Casual Living':'home decor furniture gifts',
    'River West Co.':'clothing boutique fashion gifts'
  };
  function norm(x){return (x||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();}
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
  function mapsUrl(name){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(name+', Brockville, ON');}
  function buildIndex(){
    var idx=[];
    PAGES.forEach(function(x){idx.push({kind:'page',t:x.t,p:x.p,k:x.k});});
    if(window.DIRECTORY_LINKS){Object.keys(window.DIRECTORY_LINKS).forEach(function(n){var d=window.DIRECTORY_LINKS[n];idx.push({kind:'biz',t:n,p:'directory',w:d.w,f:d.f,k:(BIZ_KW[n]||'')+' local shop service business brockville'});});}
    if(window.FOOD_LINKS){Object.keys(window.FOOD_LINKS).forEach(function(n){var d=window.FOOD_LINKS[n];idx.push({kind:'biz',t:n,p:'eat',w:d.w,f:d.f,k:'restaurant food eat drink dining brockville'});});}
    if(window.THINGS_LINKS){Object.keys(window.THINGS_LINKS).forEach(function(n){var d=window.THINGS_LINKS[n];idx.push({kind:'biz',t:n,p:'explore',w:d.w,f:d.f,k:(THINGS_KW[n]||'')+' attraction things to do brockville'});});}
    Object.keys(STORE_KW).forEach(function(n){idx.push({kind:'biz',t:n,p:'shopping',k:(STORE_KW[n]||'')+' store shopping brockville'});});
    try{
      if(typeof LINKS!=='undefined'&&LINKS){Object.keys(LINKS).forEach(function(key){var label=key.replace(/^[^A-Za-z]+/,'');if(label)idx.push({kind:'link',t:label,url:LINKS[key],k:'city of brockville website service'});});}
    }catch(e){}
    return idx;
  }
  var INDEX=null;
  function runSearch(q){
    if(!INDEX)INDEX=buildIndex();
    var toks=norm(q).split(' ').filter(Boolean);
    if(!toks.length)return null;
    var hits=[];
    INDEX.forEach(function(it){
      var hay=norm(it.t)+' '+norm(it.k||'');
      var title=norm(it.t), score=0, ok=true;
      toks.forEach(function(tk){
        if(hay.indexOf(tk)===-1){ok=false;return;}
        score+=title.indexOf(tk)===0?4:(title.indexOf(tk)>-1?2:1);
      });
      if(ok)hits.push({it:it,score:score});
    });
    hits.sort(function(a,b){return b.score-a.score;});
    return hits;
  }
  function resultHtml(h){
    var it=h.it;
    if(it.kind==='page'){
      return '<button class="tile" data-go="'+esc(it.p)+'">📌<b>'+esc(it.t)+'</b><span>Go to page</span></button>';
    }
    if(it.kind==='link'){
      return '<button class="tile" data-url="'+esc(it.url)+'">🔗<b>'+esc(it.t)+'</b><span>City website</span></button>';
    }
    var btns='<button class="tile primary" data-url="'+esc(mapsUrl(it.t))+'">📍<b>Directions</b></button>';
    if(it.w)btns+='<button class="tile" data-url="'+esc(it.w)+'">🌐<b>Website</b></button>';
    if(it.f)btns+='<button class="tile" data-url="'+esc(it.f)+'">👍<b>Facebook</b></button>';
    var section=it.p==='eat'?'Eat & Drink':(it.p==='directory'?'Local Directory':(it.p==='explore'?'Things To Do':'Shopping Directory'));
    return '<div class="card" style="grid-column:1/-1;margin:0 0 10px"><div class="cardbody"><h3 style="margin:0 0 4px">'+esc(it.t)+'</h3><p class="muted" style="margin:0 0 10px">'+section+'</p><div class="grid">'+btns+'</div></div></div>';
  }
  function browseHtml(){
    var chips=['pizza','coffee','taxi','comics','pharmacy','garbage','police','records'];
    var h='<section class="sec"><h3>Popular searches</h3><div class="grid">';
    chips.forEach(function(c){h+='<button class="tile" data-q="'+c+'">🔎<b>'+c+'</b></button>';});
    h+='</div></section><section class="sec"><h3>All pages</h3><div class="grid">';
    PAGES.forEach(function(x){h+='<button class="tile" data-go="'+x.p+'">📌<b>'+esc(x.t)+'</b></button>';});
    h+='</div></section>';
    return h;
  }
  function render(q){
    var box=document.getElementById('search-results');
    if(!box)return;
    if(!q||!q.trim()){box.innerHTML=browseHtml();return;}
    var hits=runSearch(q);
    if(!hits||!hits.length){
      box.innerHTML='<div class="card"><div class="cardbody"><p class="muted" style="margin:0">No matches for &quot;'+esc(q)+'&quot;. Try a single word like pizza, pharmacy or garbage.</p></div></div>';
      return;
    }
    var pages=hits.filter(function(h){return h.it.kind==='page';}).slice(0,6);
    var biz=hits.filter(function(h){return h.it.kind==='biz';}).slice(0,12);
    var links=hits.filter(function(h){return h.it.kind==='link';}).slice(0,8);
    var h='';
    if(pages.length)h+='<section class="sec"><h3>Pages</h3><div class="grid">'+pages.map(resultHtml).join('')+'</div></section>';
    if(biz.length)h+='<section class="sec"><h3>Places &amp; businesses</h3>'+biz.map(resultHtml).join('')+'</section>';
    if(links.length)h+='<section class="sec"><h3>City websites</h3><div class="grid">'+links.map(resultHtml).join('')+'</div></section>';
    box.innerHTML=h;
  }
  window.initSearch=function(){
    var input=document.getElementById('search-q');
    var box=document.getElementById('search-results');
    if(!input||!box)return;
    var q=window.__hubSearchQuery||'';
    window.__hubSearchQuery='';
    input.value=q;
    render(q);
    input.addEventListener('input',function(){render(input.value);});
    box.onclick=function(e){
      var el=e.target&&e.target.closest?e.target.closest('[data-go],[data-url],[data-q]'):null;
      if(!el)return;
      if(el.hasAttribute('data-go')){show(el.getAttribute('data-go'));return;}
      if(el.hasAttribute('data-url')){openLink(el.getAttribute('data-url'));return;}
      if(el.hasAttribute('data-q')){input.value=el.getAttribute('data-q');render(input.value);try{input.focus();}catch(err){}}
    };
    setTimeout(function(){try{input.focus();}catch(e){}},60);
  };
  var headerQ=document.getElementById('q');
  if(headerQ){
    headerQ.addEventListener('focus',function(){
      if((location.hash||'')!=='#search'){window.__hubSearchQuery=headerQ.value||'';show('search');}
    });
  }
})();
