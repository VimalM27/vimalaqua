/* Vimal Pets & Toys - Navbar Repair Add-on
   Loads after navbar.js. If the original navbar did not render, this safely rebuilds it. */
(function(){
  'use strict';
  const nav = document.querySelector('nav.navbar');
  if(!nav) return;

  const page = location.pathname.split('/').pop() || 'index.html';
  const L = (href,label)=>`<a href="${href}">${label}</a>`;
  const dropdown = (title, cols) => `<div class="vr-dropdown">${cols.map(c=>`<div><h4>${c.title}</h4>${c.items.map(x=>L(x[0],x[1])).join('')}</div>`).join('')}</div>`;

  function render(){
    if(nav.querySelector('.vr-nav-inner')) return;
    nav.classList.add('vr-nav');
    nav.innerHTML = `
      <button class="vr-mobile-toggle" aria-label="Open menu" type="button">☰</button>
      <a class="vr-logo" href="index.html" aria-label="Vimal Pets & Toys"><img src="images/vimallogo.png?v=2" alt="Vimal Pets & Toys"></a>
      <form class="vr-search" id="vrSearchForm" role="search"><input id="vrSearchInput" type="search" autocomplete="off" placeholder="Search pets, food, toys, accessories..." aria-label="Search"><button type="submit" aria-label="Search">🔍</button></form>
      <ul class="vr-links">
        <li>${L('index.html','Home')}</li>
        <li><a href="toys.html">Toys ▾</a>${dropdown('Toys',[{title:'Kids & Young',items:[['toys.html#kids-toys','🧒 Kids Toys'],['toys.html#baby-toddler','👶 Baby & Toddler'],['toys.html#teens','🎮 Teens'],['toys.html#adults-hobbies','🧑 Adults & Hobbies'],['toys.html#seniors','👵 Seniors']]},{title:'Learning & Creativity',items:[['toys.html#art-creativity','🎨 Art & Creativity'],['toys.html#educational-stem','🧠 Educational & STEM'],['toys.html#unique-trending','✨ Unique & Trending']]},{title:'Fun & Games',items:[['toys.html#outdoor-sports','⚽ Outdoor & Sports'],['toys.html#family-games','👨‍👩‍👧 Family & Group Games'],['toys.html#pet-toys','🐾 Pet Toys'],['toys.html','🧸 View All Toys →']]}])}</li>
        <li><a href="javascript:void(0)">Pets & Accessories ▾</a>${dropdown('Pets',[{title:'Pets',items:[['dogs.html','🐶 Dogs'],['cats.html','🐱 Cats'],['fish.html','🐟 Fish'],['birds.html','🦜 Birds'],['small-pets.html','🐹 Small Pets']]},{title:'Products',items:[['foods.html','🍖 Pet Foods'],['accessories.html','🎯 Accessories'],['aquariums.html','🐠 Aquariums']]},{title:'Explore',items:[['index.html#shop-by-category','🗂 Shop By Category'],['index.html#best-sellers','🔥 Best Sellers'],['index.html#new-arrivals-home','🆕 New Arrivals'],['care-guide.html','📚 Pet Care Guide'],['index.html#aquarium-services','🐠 Aquarium Services']]}])}</li>
        <li><a href="javascript:void(0)">Partner ▾</a>${dropdown('Partner',[{title:'Partner',items:[['seller-signup.html','📝 Partner Signup'],['seller-login.html','🔑 Partner Login'],['seller-dashboard.html','📊 Partner Dashboard'],['marketplace.html','🛍 Marketplace']]}])}</li>
        <li>${L('about.html','About')}</li><li>${L('contact.html','Contact')}</li>
        <li>${L('wishlist.html','♡ Wishlist <span class="vr-count" id="vrWishlistCount">0</span>')}</li>
        <li>${L('cart.html','🛒 Cart')}</li>
      </ul>
      <div class="vr-mobile-actions"><a href="wishlist.html" aria-label="Wishlist">♡</a><a href="cart.html" aria-label="Cart">🛒</a></div>
    `;

    let panel=document.getElementById('vrMobilePanel');
    if(!panel){
      panel=document.createElement('div'); panel.id='vrMobilePanel'; panel.className='vr-mobile-panel';
      panel.innerHTML=`<button class="vr-close" type="button" aria-label="Close menu">✕</button>
        <a href="index.html">🏠 Home</a>
        <div class="vr-mobile-group"><button type="button">🧸 Toys <span>＋</span></button><div class="vr-mobile-sub">${[['toys.html','All Toys'],['toys.html#kids-toys','Kids Toys'],['toys.html#baby-toddler','Baby & Toddler'],['toys.html#art-creativity','Art & Creativity'],['toys.html#educational-stem','Educational & STEM'],['toys.html#outdoor-sports','Outdoor & Sports'],['toys.html#teens','Teens'],['toys.html#pet-toys','Pet Toys']].map(x=>L(x[0],x[1])).join('')}</div></div>
        <div class="vr-mobile-group"><button type="button">🐾 Pets & Accessories <span>＋</span></button><div class="vr-mobile-sub">${[['dogs.html','🐶 Dogs'],['cats.html','🐱 Cats'],['fish.html','🐟 Fish'],['birds.html','🦜 Birds'],['small-pets.html','🐹 Small Pets'],['foods.html','🍖 Pet Foods'],['accessories.html','🎯 Accessories'],['aquariums.html','🐠 Aquariums']].map(x=>L(x[0],x[1])).join('')}</div></div>
        <div class="vr-mobile-group"><button type="button">🤝 Partner <span>＋</span></button><div class="vr-mobile-sub">${[['seller-signup.html','📝 Partner Signup'],['seller-login.html','🔑 Partner Login'],['seller-dashboard.html','📊 Partner Dashboard'],['marketplace.html','🛍 Marketplace']].map(x=>L(x[0],x[1])).join('')}</div></div>
        ${L('care-guide.html','📚 Pet Care Guide')}${L('index.html#shop-by-category','🗂 Shop By Category')}${L('index.html#best-sellers','🔥 Best Sellers')}${L('index.html#new-arrivals-home','🆕 New Arrivals')}${L('about.html','ℹ About')}${L('contact.html','📞 Contact')}${L('wishlist.html','♡ Wishlist')}${L('cart.html','🛒 Cart')}`;
      document.body.appendChild(panel);
    }
    let back=document.getElementById('vrBackdrop'); if(!back){back=document.createElement('div');back.id='vrBackdrop';back.className='vr-backdrop';document.body.appendChild(back)}
    const open=()=>{panel.classList.add('open');back.classList.add('open')}, close=()=>{panel.classList.remove('open');back.classList.remove('open')};
    nav.querySelector('.vr-mobile-toggle').onclick=open; panel.querySelector('.vr-close').onclick=close; back.onclick=close;
    panel.querySelectorAll('.vr-mobile-group>button').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));
    const form=document.getElementById('vrSearchForm'); form.onsubmit=e=>{e.preventDefault();const q=document.getElementById('vrSearchInput').value.trim();if(q) location.href='search-results.html?q='+encodeURIComponent(q)};
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()},{once:false});
    nav.querySelectorAll('.vr-links>li>a').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href')==='javascript:void(0)'){e.preventDefault()}}));
  }

  function needsRepair(){return !nav.querySelector('.logo, .nav-links, .search-box') || nav.textContent.trim().length<20;}
  function start(){ if(needsRepair()) render(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  setTimeout(start,700);
  setTimeout(start,1800);
})();
