/* ============================================================
   VIMAL27 ADD-ON ENHANCEMENTS
   Additive JS layer. Existing functions remain intact.
   ============================================================ */
(function(){
  'use strict';

  const ROOT = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = ROOT === '' || ROOT === 'index.html';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function addSkipLink(){
    if(document.querySelector('.v27-skip-link')) return;
    const main = document.querySelector('main') || document.querySelector('#main') || document.querySelector('section');
    if(!main) return;
    if(!main.id) main.id='vimal-main-content';
    const a=document.createElement('a');
    a.className='v27-skip-link'; a.href='#'+main.id; a.textContent='Skip to content';
    document.body.prepend(a);
  }

  function addBreadcrumb(){
    if(isHome || document.querySelector('.v27-breadcrumb') || document.body.classList.contains('no-breadcrumb')) return;
    const nav=document.querySelector('nav.navbar');
    if(!nav) return;
    const path=ROOT.replace(/\.html$/,'').replace(/[-_]/g,' ');
    if(!path || path==='index') return;
    const label=path.replace(/\b\w/g,m=>m.toUpperCase());
    const b=document.createElement('div'); b.className='v27-breadcrumb';
    b.innerHTML='<a href="index.html">Home</a><span> &nbsp;›&nbsp; </span><span>'+escapeHtml(label)+'</span>';
    nav.insertAdjacentElement('afterend',b);
  }

  function addQuickShop(){
    if(!isHome || document.querySelector('.v27-quick-shop')) return;
    const hero=document.querySelector('.hero');
    if(!hero) return;
    const wrap=document.createElement('section');
    wrap.className='v27-quick-shop';
    wrap.setAttribute('aria-label','Quick shopping links');
    wrap.innerHTML=`<div class="v27-quick-shop-inner">
      <a href="toys.html"><span>🧸</span><span>Toys<small>Explore all toys</small></span></a>
      <a href="dogs.html"><span>🐶</span><span>Dogs & Cats<small>Find your pet</small></span></a>
      <a href="fish.html"><span>🐠</span><span>Fish & Aquariums<small>Fish, tanks & care</small></span></a>
      <a href="foods.html"><span>🥣</span><span>Pet Food<small>Everyday essentials</small></span></a>
    </div>`;
    hero.insertAdjacentElement('afterend',wrap);
  }
  function addTopButton(){
    if(document.querySelector('.v27-top')) return;
    const b=document.createElement('button'); b.className='v27-top'; b.type='button'; b.textContent='↑'; b.setAttribute('aria-label','Back to top');
    b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    document.body.appendChild(b);
    const sync=()=>b.classList.toggle('show',window.scrollY>500);
    window.addEventListener('scroll',sync,{passive:true}); sync();
  }

  function improveImages(){
    document.querySelectorAll('img').forEach((img,i)=>{
      if(!img.hasAttribute('loading') && i>2) img.setAttribute('loading','lazy');
      if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    });
  }

  function improveA11y(){
    document.querySelectorAll('.dropdown>a').forEach(a=>{
      if(!a.hasAttribute('aria-haspopup')) a.setAttribute('aria-haspopup','true');
      if(!a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded','false');
    });
    document.addEventListener('click',e=>{
      const a=e.target.closest('.dropdown>a');
      if(a){
        const expanded=a.getAttribute('aria-expanded')==='true';
        a.setAttribute('aria-expanded',String(!expanded));
      }
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && typeof window.closeMenu==='function') window.closeMenu();
    });
  }

  function syncCounts(){
    try{
      let cartCount=0;
      const raw=localStorage.getItem('cart');
      if(raw){const data=JSON.parse(raw); if(Array.isArray(data)) cartCount=data.reduce((n,x)=>n+(Number(x.quantity)||Number(x.qty)||1),0); else if(data&&typeof data==='object') cartCount=Number(data.count)||0;}
      document.querySelectorAll('#cartCount').forEach(el=>el.textContent=String(cartCount));
    }catch(e){}
  }

  function addSearchEnhancement(){
    const input=document.getElementById('searchInput');
    if(!input || input.dataset.v27Enhanced) return;
    input.dataset.v27Enhanced='1';
    input.setAttribute('aria-autocomplete','list');
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      let box=document.getElementById('v27-search-suggestions');
      if(!box){box=document.createElement('div');box.id='v27-search-suggestions';box.style.cssText='position:fixed;z-index:100001;background:#fff;border:1px solid #e5eaf0;border-radius:10px;box-shadow:0 12px 30px rgba(7,26,61,.16);display:none;overflow:hidden;';document.body.appendChild(box);}
      if(!q){box.style.display='none';return;}
      const items=[
        ['Toys','toys.html','🧸'],['Dogs','dogs.html','🐶'],['Cats','cats.html','🐱'],['Fish','fish.html','🐠'],['Birds','birds.html','🦜'],['Small Pets','small-pets.html','🐹'],['Pet Food','foods.html','🥣'],['Accessories','accessories.html','🎯'],['Aquariums','aquariums.html','🐟'],['Pet Care Guide','care-guide.html','📚']
      ].filter(x=>x[0].toLowerCase().includes(q)).slice(0,6);
      if(!items.length){box.style.display='none';return;}
      box.innerHTML=items.map(x=>`<a href="${x[1]}" style="display:block;padding:11px 14px;text-decoration:none;color:#122033;font-size:13px;border-bottom:1px solid #eef2f5">${x[2]}&nbsp; ${x[0]}</a>`).join('');
      const r=input.getBoundingClientRect(); box.style.left=r.left+'px'; box.style.top=(r.bottom+6)+'px'; box.style.width=Math.min(r.width,360)+'px'; box.style.display='block';
    });
    document.addEventListener('click',e=>{const box=document.getElementById('v27-search-suggestions');if(box&&!e.target.closest('#searchInput')&&!e.target.closest('#v27-search-suggestions'))box.style.display='none';});
  }

  function fixMobileBodyLayout(){
    if(window.innerWidth>900) return;
    document.querySelectorAll('body>nav.navbar').forEach(nav=>{nav.style.flex='0 0 auto';});
    document.querySelectorAll('body>section,body>main,body>.wishlist-wrap,body>.cart-section,body>.dashboard-wrap,body>footer').forEach(el=>{el.style.maxWidth='100%';el.style.minWidth='0';});
  }

  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  ready(function(){
    document.documentElement.dataset.vimal27Enhanced='true';
    addSkipLink();
    addBreadcrumb();
    addQuickShop();
    addTopButton();
    improveImages();
    improveA11y();
    syncCounts();
    addSearchEnhancement();
    fixMobileBodyLayout();
    window.addEventListener('resize',fixMobileBodyLayout,{passive:true});
    setTimeout(addSearchEnhancement,700);
  });
})();
