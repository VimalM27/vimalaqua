/* Vimal Pets & Toys — Mobile + Search ADD-ON
   Load AFTER js/navbar.js. No existing file needs to be replaced. */
(function(){
  'use strict';

  var products = Array.isArray(window.VPW_PRODUCTS) ? window.VPW_PRODUCTS : [];

  function slug(v){return String(v||'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
  function esc(v){return String(v??'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
  function productUrl(p){return 'product.html?id='+encodeURIComponent(p.slug||p.id||slug(p.name));}
  function imageUrl(p){return (p.images&&p.images[0]) || 'images/vimallogo.png';}
  function searchable(p){return [p.name,p.category,p.type,p.sku,p.description,p.brand,p.availability].filter(Boolean).join(' ').toLowerCase();}
  function find(q,limit){
    q=String(q||'').trim().toLowerCase(); if(!q) return [];
    var words=q.split(/\s+/).filter(Boolean);
    return products.map(function(p){
      var text=searchable(p), score=0;
      if(text===q) score+=100;
      if(String(p.name||'').toLowerCase().indexOf(q)>=0) score+=60;
      if(String(p.category||'').toLowerCase().indexOf(q)>=0) score+=35;
      words.forEach(function(w){if(text.indexOf(w)>=0) score+=8;});
      return {p:p,score:score};
    }).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;}).slice(0,limit||8).map(function(x){return x.p;});
  }

  function goSearch(q){
    q=String(q||'').trim();
    if(!q){var el=document.getElementById('searchInput'); if(el) el.focus(); return;}
    window.location.href='search-results.html?q='+encodeURIComponent(q);
  }
  window.vimalSearchWebsite=goSearch;

  /* Replace only the search action at runtime; existing navbar.js stays untouched. */
  window.searchWebsite=goSearch;

  function addSuggestions(){
    var input=document.getElementById('searchInput'); if(!input || input.dataset.vpAddon==='1') return;
    input.dataset.vpAddon='1';
    var box=input.parentElement;
    if(!box) return;
    box.style.position='relative';
    var list=document.createElement('div'); list.className='vp-search-suggestions'; box.appendChild(list);
    function render(){
      var q=input.value.trim(), hits=find(q,6);
      if(!q){list.classList.remove('show');list.innerHTML='';return;}
      if(!hits.length){list.innerHTML='<div class="vp-search-empty">No matching product yet. Press Enter to search all pages.</div>';list.classList.add('show');return;}
      list.innerHTML=hits.map(function(p){return '<a class="vp-search-suggestion" href="'+esc(productUrl(p))+'"><img src="'+esc(imageUrl(p))+'" alt=""><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.category||'Product')+(p.price!=null?' • ₹'+Number(p.price).toLocaleString('en-IN'):'')+'</small></span></a>';}).join('');
      list.classList.add('show');
    }
    input.addEventListener('input',render);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();goSearch(input.value);}});
    document.addEventListener('click',function(e){if(!box.contains(e.target)) list.classList.remove('show');});
  }

  function mobileMenu(){
    var menu=document.getElementById('mobileMenu'); if(!menu || menu.dataset.vpAddon==='1') return;
    menu.dataset.vpAddon='1';
    /* Rebuild only the mobile drawer. Desktop navbar remains as-is. */
    menu.innerHTML=''+
      '<span class="close-menu" aria-label="Close menu">✕</span>'+
      '<a href="index.html">🏠 Home</a>'+
      section('🐾 Pets',['🐶 Dogs|dogs.html','🐱 Cats|cats.html','🐟 Fish|fish.html','🦜 Birds|birds.html','🐹 Small Pets|small-pets.html'])+
      section('🛍 Shop',['🍖 Pet Foods|foods.html','🎯 Accessories|accessories.html','🐠 Aquariums|aquariums.html','🔥 Best Sellers|index.html#best-sellers','🆕 New Arrivals|index.html#new-arrivals-home'])+
      section('🧸 Toys',['🧸 All Toys|toys.html','🧒 Kids Toys|toys.html#kids-toys','👶 Baby & Toddler|toys.html#baby-toddler','🎨 Art & Creativity|toys.html#art-creativity','🧠 Educational & STEM|toys.html#educational-stem','⚽ Outdoor & Sports|toys.html#outdoor-sports','🎮 Teens|toys.html#teens','🧑 Adults & Hobbies|toys.html#adults-hobbies','👵 Seniors|toys.html#seniors','👨‍👩‍👧 Family Games|toys.html#family-games','✨ Trending|toys.html#unique-trending','🐾 Pet Toys|toys.html#pet-toys'])+
      section('🤝 Partner',['📝 Partner Signup|seller-signup.html','🔑 Partner Login|seller-login.html','📊 Partner Dashboard|seller-dashboard.html','🛍 Marketplace|marketplace.html'])+
      '<a href="care-guide.html">📚 Pet Care Guide</a>'+ 
      '<a href="index.html#aquarium-services">🛠 Aquarium Services</a>'+ 
      '<a href="about.html">ℹ️ About</a>'+ 
      '<a href="contact.html">📞 Contact</a>'+ 
      '<a href="wishlist.html">♡ Wishlist</a>'+ 
      '<a href="cart.html">🛒 Cart</a>';
    var close=menu.querySelector('.close-menu'); if(close) close.addEventListener('click',function(){menu.classList.remove('vp-open');});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){if(!a.classList.contains('vp-section-btn')) menu.classList.remove('vp-open');});});
    menu.querySelectorAll('.vp-section-btn').forEach(function(btn){btn.addEventListener('click',function(){btn.parentElement.classList.toggle('open');});});
    function section(title,items){return '<div class="vp-section"><button type="button" class="vp-section-btn"><span>'+title+'</span><span>⌄</span></button><div class="vp-submenu">'+items.map(function(x){var a=x.split('|');return '<a href="'+a[1]+'">'+a[0]+'</a>';}).join('')+'</div></div>';}
  }

  function bindMenuButton(){
    var btn=document.querySelector('.mobile-menu-btn'), menu=document.getElementById('mobileMenu'); if(!btn||!menu) return;
    btn.onclick=function(){menu.classList.add('vp-open');};
  }

  function init(){addSuggestions();mobileMenu();bindMenuButton();}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(init,80);});
  setTimeout(init,150);
})();
