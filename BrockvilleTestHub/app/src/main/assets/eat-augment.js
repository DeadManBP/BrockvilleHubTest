/* FOOD_LINKS_V2: Eat & Drink tiles are injected by build-apk.yml at build time,
   so at runtime each restaurant tile is rebuilt into one card:
   name + details, then a tidy button row: Directions / Website / Facebook
   (Website/Facebook only where verified in FOOD_LINKS below). */
(function(){
  var FOOD_LINKS = {
  "1000 Islands Restaurant & Pizzeria": {
    "w": "https://www.1000islandspizza.com/",
    "f": "https://www.facebook.com/1000IslandsPizzeria"
  },
  "Luna Pizzeria & Restaurant": {
    "w": "http://www.lunapizza.com/", "f": "https://www.facebook.com/LunaPizzeria/"
  },
  "Papa's Pizzaland": {
    "w": "https://papasbrockville.meemup.com/", "f": "https://www.facebook.com/p/Papas-Pizzaland-Brockville-61552105375866/"
  },
  "The Mill - A Taste of Italy": {
    "w": "https://themillrestaurant.ca/",
    "f": "https://www.facebook.com/themillatasteofitaly/"
  },
  "Tata's House of Pizza and Pasta": {
    "w": "https://www.tatasbrockville.ca/",
    "f": "https://www.facebook.com/tatasbrockville"
  },
  "Cowan's Dairy Bar": {
    "w": "https://www.cowansdairy.com/"
  },
  "O'Mally Kourt Fudgery": {
    "w": "https://omallykourt.ca/"
  },
  "Pau Hana Coffee": {
    "w": "https://www.pauhanacoffee.com/"
  },
  "Brockberry": {
    "w": "https://brockberry.com/"
  },
  "The Bar": {},
  "Sam's Brass Rack": {},
  "Broad Street Bar and Billiards": {},
  "Grammas Cupboard": {},
  "Tait's Bakery": {
    "f": "https://www.facebook.com/p/Taits-Brockville-61594360932319/"
  },
  "Boboli": {
  },
  "Cosies": {
    "w": "https://www.cosiestearoom.com/"
  },
  "Richard's Coffeehouse": {
    "w": "https://richardscoffeehouse.ca/", "f": "https://www.facebook.com/RichardsCoffeehouseBrockville/"
  },
  "Jon's Restaurant": {
    "w": "https://jonsrestaurant.ca/",
    "f": "https://www.facebook.com/JonsRestaurant/"
  },
  "Sweet Ofelia Cafe & Market": {
    "w": "https://sweetofeliacafe.com/"
  },
  "Don's Fish & Chips": {
    "w": "https://www.donsfishandchips.com/"
  },
  "Manoll's Fish & Chips": {},
  "Fat Les": {
    "w": "https://fatles.ca",
    "f": "https://www.facebook.com/30blockhouseisland/"
  },
  "Sam's Grill": {
    "w": "https://samsgrill.ca/"
  },
  "Lee's Kitchen": {
    "w": "https://www.enjoy2eat.ca/lee/",
    "f": "https://www.facebook.com/p/Lees-Kitchen-100057063505827/"
  },
  "Pho Hut": {},
  "Golden Gate Restaurant": {
    "w": "https://www.goldengaterestaurant.ca/"
  },
  "Island Delight": {
    "w": "http://www.islanddelight.ca/"
  },
  "Luna Pizzeria & Restaurant": {
    "w": "https://lunapizzeria.com/"
  },
  "Nakhon Thai": {
    "w": "https://nakhonthai.ca/",
    "f": "https://www.facebook.com/people/Nakhon-Thai-Brockville/100063832454256/"
  },
  "Indian Cuisine Hub": {
    "w": "https://www.indiancuisinehub.ca/"
  },
   "One Love Jamaican Cuisine": {
    "w": "https://onelovejamaicancuisine.godaddysites.com/"
  },
  "Barley Mow": {
    "w": "https://barleymow.com/"
  },
  "1000 Islands Brewing": {
    "w": "https://1000islandsbrewery.ca/",
    "f": "https://www.facebook.com/1000IslandsBrewery"
  },
  "Finnigan's Tavern": {
    "f": "https://www.facebook.com/FinnigansTavern/"
  },
  "Dough Daddy Pizza": {
    "f": "https://www.facebook.com/DoughDaddyPizzaTruck/"
  },
  "The Shady Coyote Fries & Grill": {
    "f": "https://www.facebook.com/ShadyCoyote/"
  },
  "Sam & Harry's Place Chipwagon": {
    "f": "https://www.facebook.com/samandharry/"
  },
  "Crazy Eights Street Eats": {
    "f": "https://www.facebook.com/p/Crazy-Eights-Street-Eats-61563579210282/"
  },
  "The Noshery": {
    "f": "https://www.facebook.com/stefandkaren/"
  },
  "Shawarma Garden": {
    "w": "https://shawarmagarden.ca/", "f": "https://www.facebook.com/p/Shawarma-garden-BBQ-100062965283404/"
  },
  "241 Pizza": {
    "w": "https://www.241pizza.com/",
    "f": "https://www.facebook.com/241Pizzabrockville/"
  }
};
  function makeBtn(emoji, label, url, primary){
    var nb = document.createElement('button');
    nb.type = 'button';
    nb.className = 'tile' + (primary ? ' primary' : '');
    nb.innerHTML = emoji + '<b>' + label + '</b>';
    nb.addEventListener('click', function(e){ e.preventDefault(); openLink(url); });
    return nb;
  }
  window.FOOD_LINKS=FOOD_LINKS;
  window.augmentEat = function(){
    if(!document.getElementById('hub-trucks')){
      var TRUCKS=[
        {n:'Dough Daddy Pizza',d:'Wood-fired pizza · Parkedale Ave (warehouse property)',q:'Dough+Daddy+Pizza%2C+Brockville%2C+ON'},
        {n:'The Shady Coyote Fries & Grill',d:'Fries, poutine & wraps · 2360 Parkedale Ave',q:'The+Shady+Coyote+Fries+%26+Grill%2C+Brockville%2C+ON'},
        {n:"Sam & Harry's Place Chipwagon",d:'Burgers & hand-cut fries · 1846 Highway 2 E',q:'Sam+%26+Harry%27s+Place+Chipwagon%2C+Brockville%2C+ON'},
        {n:'Crazy Eights Street Eats',d:'Street eats · 3063 County Rd 29',q:'Crazy+Eights+Street+Eats%2C+Brockville%2C+ON'}
      ];
      var sec=document.createElement('section');
      sec.className='sec'; sec.id='hub-trucks';
      sec.innerHTML='<h3>🚚 Food Trucks</h3><p class="muted" style="margin:0 0 10px">Brockville staples on wheels. Hours and spots move around — check their website or Facebook page before you head out.</p><div class="grid">'+TRUCKS.map(function(t){return '<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query='+t.q+'\')">🚚<b>'+t.n+'</b><span>'+t.d+' · Maps</span></button>';}).join('')+'</div>';
      var m=document.getElementById('m'); if(m) m.appendChild(sec);
    }
    if(!document.getElementById('hub-steakhouse')){
      var secN=document.createElement('section');
      secN.className='sec'; secN.id='hub-steakhouse';
      secN.innerHTML='<h3>\uD83E\uDD69 Steakhouse</h3><div class="grid">'
        +'<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query=The+Noshery%2C+209+King+St+W%2C+Brockville%2C+ON\')">\uD83E\uDD69<b>The Noshery</b><span>209 King St W \u00B7 Maps</span></button>'
        +'</div>';
      var mN=document.getElementById('m'); if(mN) mN.appendChild(secN);
    }
    (function(){ /* TATAS: append tile to the Pizza & Italian section grid */
      var exists=false;
      document.querySelectorAll('#m .tile b, #m .card h3').forEach(function(el){
        if(el.textContent.indexOf("Tata's House of Pizza")!==-1) exists=true;
      });
      if(exists) return;
      var secs=document.querySelectorAll('#m section.sec');
      for(var si=0;si<secs.length;si++){
        var h3=secs[si].querySelector('h3');
        if(h3 && h3.textContent.indexOf('Pizza')!==-1){
          var grid=secs[si].querySelector('.grid');
          if(grid){
            var tb=document.createElement('button');
            tb.className='tile';
            tb.setAttribute('onclick',"openLink('https://www.google.com/maps/search/?api=1&query=Tata%27s+House+of+Pizza+and+Pasta%2C+11+Windsor+Dr%2C+Brockville%2C+ON')");
            tb.innerHTML='🍕<b>Tata\'s House of Pizza and Pasta</b><span>11 Windsor Dr · Maps</span>';
            grid.appendChild(tb);
          }
          break;
        }
      }
    })();
    /* SWEEP-2026-10-10: new venues from the missing-business sweep. */
    if(!document.getElementById('hub-desserts')){
      var secD=document.createElement('section');
      secD.className='sec'; secD.id='hub-desserts';
      secD.innerHTML='<h3>🍦 Ice Cream & Sweets</h3><div class="grid">'
        +'<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query=Cowan%27s+Dairy+Bar%2C+241+Park+St%2C+Brockville%2C+ON\')">🍦<b>Cowan\'s Dairy Bar</b><span>Ice cream · 241 Park St · Maps</span></button>'
        +'<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query=O%27Mally+Kourt+Fudgery%2C+99+King+St+W%2C+Brockville%2C+ON\')">🍬<b>O\'Mally Kourt Fudgery</b><span>Fudge & sweets · 99 King St W · Maps</span></button>'
        +'</div>';
      var mD=document.getElementById('m'); if(mD) mD.appendChild(secD);
    }
    if(!document.getElementById('hub-bakery')){
      var secB=document.createElement('section');
      secB.className='sec'; secB.id='hub-bakery';
      secB.innerHTML='<h3>🧁 Bakery</h3><div class="grid">'
        +'<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query=Grammas+Cupboard%2C+28+Kincaid+St%2C+Brockville%2C+ON\')">🧁<b>Grammas Cupboard</b><span>Bakery · 28 Kincaid St · Maps</span></button>'
        +'<button class="tile" onclick="openLink(\'https://www.google.com/maps/search/?api=1&query=Tait%27s+Bakery%2C+31+King+St+W%2C+Brockville%2C+ON\')">🧁<b>Tait\'s Bakery</b><span>Bakery · 31 King St W · Maps</span></button>'
        +'</div>';
      var mB=document.getElementById('m'); if(mB) mB.appendChild(secB);
    }
    (function(){
      function hubAddTile(sectionMatch, emoji, name, detail, mapsQ){
        var exists=false;
        document.querySelectorAll('#m .tile b, #m .card h3').forEach(function(el){
          if(el.textContent.indexOf(name)!==-1) exists=true;
        });
        if(exists) return;
        var secs=document.querySelectorAll('#m section.sec');
        for(var si=0;si<secs.length;si++){
          var h3=secs[si].querySelector('h3');
          if(h3 && h3.textContent.indexOf(sectionMatch)!==-1){
            var grid=secs[si].querySelector('.grid');
            if(grid){
              var tb=document.createElement('button');
              tb.className='tile';
              tb.setAttribute('onclick',"openLink('https://www.google.com/maps/search/?api=1&query="+mapsQ+"')");
              tb.innerHTML=emoji+'<b>'+name+'</b><span>'+detail+' · Maps</span>';
              grid.appendChild(tb);
            }
            return;
          }
        }
      }
      hubAddTile('Cafés', '☕', "Pau Hana Coffee", 'Specialty coffee · 62 King St W', 'Pau+Hana+Coffee%2C+62+King+St+W%2C+Brockville%2C+ON');
      hubAddTile('Fish & Chips', '🍖', "Brockberry", 'BBQ & smoked meats · 64 King St E', 'Brockberry%2C+64+King+St+E%2C+Brockville%2C+ON');
      hubAddTile('Pubs & Bars', '🍺', "The Bar", 'Bar & live music · 214 King St W', 'The+Bar%2C+214+King+St+W%2C+Brockville%2C+ON');
      hubAddTile('Pubs & Bars', '🎱', "Sam's Brass Rack", 'Pool hall & bar · 24 Perth St', 'Sam%27s+Brass+Rack%2C+24+Perth+St%2C+Brockville%2C+ON');
      hubAddTile('Pubs & Bars', '🎱', "Broad Street Bar and Billiards", 'Pool hall & bar · 51 King St W', 'Broad+Street+Bar+and+Billiards%2C+51+King+St+W%2C+Brockville%2C+ON');
    })();
    document.querySelectorAll('.grid .tile').forEach(function(btn){
      var b = btn.querySelector('b'); if(!b) return;
      var name = b.textContent.trim();
      var span = btn.querySelector('span');
      var detail = span ? span.textContent.trim().replace(/\s*·\s*Maps\s*$/, '') : '';
      var emoji = '';
      if(btn.childNodes.length && btn.childNodes[0].nodeType === 3) emoji = btn.childNodes[0].textContent.trim();
      var onclick = btn.getAttribute('onclick') || '';
      var mm = onclick.match(/openLink\('([^']+)'\)/);
      var mapsUrl = mm ? mm[1] : '';
      var info = FOOD_LINKS[name] || {};
      var card = document.createElement('div');
      card.className = 'card';
      card.style.gridColumn = '1 / -1';
      card.style.margin = '0';
      var body = document.createElement('div');
      body.className = 'cardbody';
      var h = document.createElement('h3');
      h.style.margin = '0 0 4px';
      h.textContent = (emoji ? emoji + ' ' : '') + name;
      body.appendChild(h);
      if(detail){
        var pgh = document.createElement('p');
        pgh.className = 'muted';
        pgh.style.margin = '0 0 10px';
        pgh.textContent = detail;
        body.appendChild(pgh);
      }
      var row = document.createElement('div');
      row.className = 'grid';
      if(mapsUrl) row.appendChild(makeBtn('\uD83D\uDCCD', 'Directions', mapsUrl, true));
      if(info.w) row.appendChild(makeBtn('\uD83C\uDF10', 'Website', info.w, false));
      if(info.f) row.appendChild(makeBtn('\uD83D\uDCD8', 'Facebook', info.f, false));
      body.appendChild(row);
      card.appendChild(body);
      btn.replaceWith(card);
    });
    /* TABS-2026-10-10: tabbed navigation for the Eat & Drink sections */
    (function(){
      var secs = Array.prototype.slice.call(document.querySelectorAll('#m section.sec'));
      if(!secs.length || document.getElementById('hub-foodtabs')) return;
      if(!document.getElementById('hub-foodtabs-css')){
        var st = document.createElement('style');
        st.id = 'hub-foodtabs-css';
        st.textContent = '.hub-tabs{display:flex;gap:8px;overflow-x:auto;padding:10px 2px;margin:2px 0 6px;scrollbar-width:none;}'
          + '.hub-tabs::-webkit-scrollbar{display:none;}'
          + '.hub-tab{flex:0 0 auto;padding:8px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit;font-size:14px;cursor:pointer;white-space:nowrap;}'
          + '.hub-tab.on{background:#FFD34D;border-color:#FFD34D;color:#20303C;font-weight:700;}';
        document.head.appendChild(st);
      }
      var LABELS = {'Pizza & Italian':'Pizza','Cafés & Breakfast':'Cafés','Fish & Chips / Casual':'Casual','Pubs & Bars':'Pubs','International':'International','Chinese & Chinese-Thai':'Chinese','Food Trucks':'Trucks','Steakhouse':'Steakhouse','Ice Cream & Sweets':'Sweets','Bakery':'Bakery'};
      function tabName(sec){
        var h3 = sec.querySelector('h3');
        var t = h3 ? h3.textContent.trim() : '';
        t = t.replace(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*/u, '');
        return LABELS[t] || t;
      }
      var bar = document.createElement('div');
      bar.id = 'hub-foodtabs';
      bar.className = 'hub-tabs';
      function selectTab(name){
        Array.prototype.forEach.call(bar.children, function(b){
          b.classList.toggle('on', b.getAttribute('data-tab') === name);
        });
        secs.forEach(function(sec){
          sec.style.display = (name === 'all' || tabName(sec) === name) ? '' : 'none';
        });
      }
      function mkTab(name, label){
        var b = document.createElement('button');
        b.className = 'hub-tab';
        b.setAttribute('data-tab', name);
        b.textContent = label;
        b.onclick = function(){ selectTab(name); };
        return b;
      }
      bar.appendChild(mkTab('all', 'All'));
      secs.forEach(function(sec){ bar.appendChild(mkTab(tabName(sec), tabName(sec))); });
      var m = document.getElementById('m');
      if(m){
        var head = m.querySelector('.pagehead');
        if(head && head.nextSibling) m.insertBefore(bar, head.nextSibling);
        else m.insertBefore(bar, m.firstChild);
      }
      if(secs.length) selectTab(tabName(secs[0]));
    })();
  };
  if(location.hash === '#eat'){ setTimeout(function(){ if(window.augmentEat) augmentEat(); }, 60); }
})();
(function(){
  var orig = window.augmentEat;
  window.augmentEat = function(){
    try{ if(orig) orig.apply(this, arguments); }catch(e){}
    try{
      document.querySelectorAll('#m .tile, #m .card').forEach(function(el){
        var t = el.textContent || '';
        if(t.indexOf('Moose McGuire') !== -1) el.remove();
      });
    }catch(e){}
  };
})();
(function(){
  var origK = window.augmentEat;
  window.augmentEat = function(){
    try{ if(origK) origK.apply(this, arguments); }catch(e){}
    try{
      document.querySelectorAll('#m .tile, #m .card').forEach(function(el){
        var t = el.textContent || '';
        if(t.indexOf('Keystorm') !== -1) el.remove();
      });
    }catch(e){}
  };
})();
