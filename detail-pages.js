const detailHeader=document.querySelector('.site-header');
const detailMenu=document.querySelector('.menu-button');
detailMenu?.addEventListener('click',()=>{const open=detailHeader.classList.toggle('open');detailMenu.setAttribute('aria-expanded',String(open));detailMenu.setAttribute('aria-label',open?'Close menu':'Open menu');});
document.querySelectorAll('.site-header nav a').forEach(link=>link.addEventListener('click',()=>{detailHeader.classList.remove('open');detailMenu?.setAttribute('aria-expanded','false');detailMenu?.setAttribute('aria-label','Open menu');}));
document.getElementById('year').textContent=new Date().getFullYear();
