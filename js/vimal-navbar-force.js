(function(){
  'use strict';
  function go(url){ window.location.href=url; }
  function esc(s){return String(s||'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]});}
  function search(q){
    q=(q||'').trim();
    if(!q){alert('Please enter something to search.');return;}
    var products=Array.isArray(window.VPW_PRODUCTS)?window.VPW_PRODUCTS:[];
    var needle=q.toLowerCase();
    var matches=products.filter(function(p){return [p.name,p.category,p.description,p.sku,p.type].join(' ').toLowerCase().indexOf(needle)>=0;});
    if(matches.length){
      var first=matches[0];
      if(first.slug) go('product.html?id='+encodeURIComponent(first.slug));
      else if(first.id) go('product.html?id='+encodeURIComponent(first.id));
      return;
    }
    var routes=[['fish','fish.html'],['bird','birds.html'],['dog','dogs.html'],['cat','cats.html'],['small pet','small-pets.html'],['food','foods.html'],['accessor','accessories.html'],['aquarium','aquariums.html'],['toy','toys.html'],['market','marketplace.html']];
    for(var i=0;i<routes.length;i++){if(needle.indexOf(routes[i][0])>=0){go(routes[i][1]);return;}}
    go('search-results.html?q='+encodeURIComponent(q));
  }
  function count(key){try{var a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.length:0}catch(e){return 0}}
  function build(){
    var old=document.querySelector('nav.navbar');
    if(!old) return;
    /* Keep the old navbar only if it already has real children. If it is empty, replace it. */
    if(old.id==='vimalForceNavbar') return;
    if(old.children.length && old.textContent.trim().length>10) return;
    var nav=document.createElement('nav');nav.id='vimalForceNavbar';nav.setAttribute('aria-label','Main navigation');
    nav.innerHTML=''
      +'<button class="vfn-menu-btn" type="button" aria-label="Open menu">☰</button>'
      +'<a class="vfn-logo" href="index.html"><img src="images/vimallogo.png?v=2" alt="Vimal Pets & Toys"></a>'
      +'<form class="vfn-search" role="search"><input id="vfnSearch" type="search" placeholder="Search pets, food, toys..." autocomplete="off"><button type="submit" aria-label="Search">🔍</button></form>'
      +'<ul class="vfn-links">'
      +'<li><a href="index.html">Home</a></li>'
      +'<li><a href="toys.html">Toys</a></li>'
      +'<li><a href="dogs.html">Pets</a></li>'
      +'<li><a href="foods.html">Food</a></li>'
      +'<li><a href="accessories.html">Accessories</a></li>'
      +'<li><a href="aquariums.html">Aquariums</a></li>'
      +'<li><a href="marketplace.html">Marketplace</a></li>'
      +'<li><a href="seller-signup.html">Partner</a></li>'
      +'</ul>'
      +'<div class="vfn-actions"><a class="vfn-icon login" href="login.html" title="Login">👤</a><a class="vfn-icon" href="wishlist.html" title="Wishlist">♡<span class="vfn-count" id="vfnWish">'+count('wishlist')+'</span></a><a class="vfn-icon" href="cart.html" title="Cart">🛒<span class="vfn-count" id="vfnCart">'+count('cart')+'</span></a></div>';
    old.replaceWith(nav);
    document.body.classList.add('vfn-navbar-active');
    var drawer=document.createElement('aside');drawer.className='vfn-drawer';drawer.id='vfnDrawer';
    drawer.innerHTML='<div class="vfn-close" role="button" aria-label="Close menu">✕</div>'
      +'<form class="vfn-mobile-search"><input id="vfnMobileSearch" type="search" placeholder="Search..."><button>🔍</button></form>'
      +'<a href="index.html">🏠 Home</a>'
      +'<div class="vfn-mobile-group"><button type="button">🧸 Toys <span>＋</span></button><div class="vfn-mobile-sub"><a href="toys.html">All Toys</a><a href="toys.html#kids-toys">Kids Toys</a><a href="toys.html#art-creativity">Art & Creativity</a><a href="toys.html#educational-stem">Educational & STEM</a><a href="toys.html#outdoor-sports">Outdoor & Sports</a><a href="toys.html#pet-toys">Pet Toys</a></div></div>'
      +'<div class="vfn-mobile-group"><button type="button">🐾 Pets & Products <span>＋</span></button><div class="vfn-mobile-sub"><a href="dogs.html">🐶 Dogs</a><a href="cats.html">🐱 Cats</a><a href="fish.html">🐟 Fish</a><a href="birds.html">🦜 Birds</a><a href="small-pets.html">🐹 Small Pets</a><a href="foods.html">🍖 Pet Foods</a><a href="accessories.html">🎯 Accessories</a><a href="aquariums.html">🐠 Aquariums</a></div></div>'
      +'<a href="marketplace.html">🛍 Marketplace</a><a href="seller-signup.html">🤝 Become a Partner</a><a href="seller-login.html">🔑 Partner Login</a><a href="care-guide.html">📚 Pet Care Guide</a><a href="about.html">ℹ About</a><a href="contact.html">📞 Contact</a><a href="wishlist.html">♡ Wishlist</a><a href="cart.html">🛒 Cart</a>';
    document.body.appendChild(drawer);
    var back=document.createElement('div');back.className='vfn-backdrop';back.id='vfnBackdrop';document.body.appendChild(back);
    function close(){drawer.classList.remove('open');back.classList.remove('show')}
    nav.querySelector('.vfn-menu-btn').addEventListener('click',function(){drawer.classList.add('open');back.classList.add('show')});
    drawer.querySelector('.vfn-close').addEventListener('click',close);back.addEventListener('click',close);
    drawer.querySelectorAll('.vfn-mobile-group>button').forEach(function(b){b.addEventListener('click',function(){b.parentElement.classList.toggle('open')})});
    nav.querySelector('.vfn-search').addEventListener('submit',function(e){e.preventDefault();search(nav.querySelector('#vfnSearch').value)});
    drawer.querySelector('.vfn-mobile-search').addEventListener('submit',function(e){e.preventDefault();search(drawer.querySelector('#vfnMobileSearch').value)});
  }
  function start(){
    if(!document.body)return;
    /* If a broken/empty nav is present, repair it. */
    build();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.addEventListener('load',start);
})();
