const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-button');
menu?.addEventListener('click',()=>{const open=header.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});
document.querySelectorAll('.site-header nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open menu');}));

// Keep navigation over the opening scene, then switch to compact navy navigation for the page content.
const openingHero=document.querySelector('main > .hero');
const brandImage=header.querySelector('.brand-logo');
let wasAtTop=false;
let headerFrame=false;
function updateOpeningHeader(){
 const atTop=window.scrollY<35;
 const beyondHero=openingHero.getBoundingClientRect().bottom<=100;
 header.classList.remove('past-opening');
 header.classList.toggle('navy-header',beyondHero);
 if(brandImage){
  const logo= beyondHero?'assets/kai-teq-wordmark-light.svg?v=navy-header':'assets/kai-teq-wordmark.svg?v=navy-header';
  if(brandImage.getAttribute('src')!==logo)brandImage.setAttribute('src',logo);
 }
 if(atTop&&!wasAtTop&&brandImage&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  brandImage.animate([{transform:'scale(.94)',opacity:.65},{transform:'scale(1)',opacity:1}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});
 }
 wasAtTop=atTop;headerFrame=false;
}
window.addEventListener('scroll',()=>{if(!headerFrame){headerFrame=true;requestAnimationFrame(updateOpeningHeader);}},{passive:true});
window.addEventListener('resize',updateOpeningHeader);
updateOpeningHeader();

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  entry.target.classList.toggle('visible',entry.isIntersecting);
}),{threshold:.12,rootMargin:'-7% 0px -10%'});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
document.getElementById('year').textContent=new Date().getFullYear();

// A four-part presentation beneath the immediate photographic opening.
const story=document.querySelector('.animation-section .story');
const demo=document.querySelector('.animation-section');
function fitPresentationScene(){
 const canvasWidth=window.innerWidth<=800?700:900;
 const fit=Math.min(story.clientWidth/canvasWidth,story.clientHeight/640,1);
 story.style.setProperty('--scene-fit',String(Math.max(.1,fit)));
}
new ResizeObserver(fitPresentationScene).observe(story);
fitPresentationScene();

const phaseButtons=[...document.querySelectorAll('.scene-button')];
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[['scene-simplify','CONNECT','Bring the moving parts together.',3000],['scene-automate','AUTOMATE','Let the routine take care of itself.',3000],['scene-grow','RESULTS','Clear results your business can measure.',3000],['scene-forward','WAY FORWARD','A clearer way forward.',3000]];
let phase=0,timer,visible=false,paused=motion.matches,remaining=scenes[0][3],deadline=0;
function stopTimer(){clearTimeout(timer);if(deadline)remaining=Math.max(0,deadline-Date.now());deadline=0;}
function schedule(){if(paused||!visible||document.hidden)return;deadline=Date.now()+remaining;timer=setTimeout(()=>showScene((phase+1)%scenes.length),remaining);}
function showScene(next){
 stopTimer();phase=next;remaining=scenes[phase][3];
 story.classList.remove(...scenes.map(scene=>scene[0]));story.classList.add('ai-active',scenes[phase][0]);
 story.querySelector('.forward-scene').hidden=phase!==3;
 document.getElementById('scene-number').textContent=`0${phase+1} / ${scenes[phase][1]}`;
 document.getElementById('scene-title').textContent=scenes[phase][2];
 phaseButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===phase)));
 schedule();
}
function syncPause(){story.classList.toggle('presentation-paused',paused||!visible||document.hidden);}
new IntersectionObserver(entries=>{
 const entry=entries[0];
 const entered=entry.isIntersecting&&entry.intersectionRatio>=.2;
 if(entered===visible)return;
 stopTimer();visible=entered;syncPause();
 if(visible){
  // Re-entering always replays the presentation from Connect.
  story.classList.remove(...scenes.map(scene=>scene[0]));
  void story.offsetWidth;
  showScene(0);
 }
},{threshold:[0,.2]}).observe(demo);
phaseButtons.forEach((button,index)=>button.addEventListener('click',()=>showScene(index)));
document.addEventListener('visibilitychange',()=>{stopTimer();syncPause();schedule();});
motion.addEventListener('change',()=>{stopTimer();paused=motion.matches;syncPause();schedule();});
showScene(0);syncPause();

const enquiryForm=document.getElementById('enquiry-form');
const interest=new URLSearchParams(window.location.search).get('interest');
const interestMap={Launch:'Launch',Business:'Business',Growth:'Growth',Automate:'Growth',JobDesk:'JobDesk standalone',Custom:'Custom Solutions'};
if(interestMap[interest]){
 enquiryForm.elements.interest.value=interestMap[interest];
 if(interest==='Launch'||interest==='Business')enquiryForm.elements.message.placeholder=`Tell us about your ${interest} requirements…`;
}
// GitHub Pages and local previews use email until a form backend is activated.
const localPreview=['localhost','127.0.0.1',''].includes(window.location.hostname);
const formNote=enquiryForm.querySelector('.form-note');
// Set true only after a deployed Netlify form and notification have been tested.
const hostedFormEnabled=false;
formNote.textContent=hostedFormEnabled&&!localPreview?'Your enquiry is sent through our website.':'This opens your email with the enquiry ready to send.';
enquiryForm.addEventListener('submit',event=>{
 if(hostedFormEnabled&&!localPreview)return;
 event.preventDefault();
 const data=new FormData(enquiryForm);
 if(data.get('bot-field'))return;
 const subject=`KAI-TEQ enquiry — ${interest&&interestMap[interest]?interest:data.get('interest')}`;
 const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nBusiness: ${data.get('business')||'Not provided'}\nInterest: ${data.get('interest')}\n\n${data.get('message')}`;
 document.getElementById('form-status').textContent='Your email app will open. Review and send the message there; the website has not sent it automatically.';
 window.location.href=`mailto:hello@kai-teq.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Run section demonstrations only while visible. Returning starts a fresh cycle.
(() => {
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(!('IntersectionObserver' in window))return;
 const setup=(element,play,clear,period,interactive=false)=>{
  if(!element)return;
  let visible=false,timer=null,interacting=false;
  const stop=()=>{clearInterval(timer);timer=null;clear();};
  const sync=()=>{
   stop();
   if(!visible || document.hidden || reduced.matches || interacting)return;
   play(true);timer=setInterval(()=>play(false),period);
  };
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.25}).observe(element);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  if(interactive){
   const update=()=>{interacting=element.matches(':hover') || element.contains(document.activeElement);sync();};
   element.addEventListener('pointerenter',update);
   element.addEventListener('pointerleave',update);
   element.addEventListener('focusin',update);
   element.addEventListener('focusout',()=>setTimeout(update,0));
  }
 };
 const visual=document.querySelector('.jobdesk-visual');
 setup(visual,()=>{
  visual.classList.remove('jd-playing');
  visual.classList.add('jd-ready');
  void visual.offsetWidth;
  visual.classList.add('jd-playing');
 },()=>visual.classList.remove('jd-ready','jd-playing'),8000);
 const grid=document.querySelector('.bespoke-grid');
 const cards=grid?[...grid.querySelectorAll('article')]:[];
 let active=-1,visible=false,completed=false,timer=null;
 const clearCards=()=>cards.forEach(card=>card.classList.remove('auto-highlight'));
 const stopCards=()=>{clearInterval(timer);timer=null;clearCards();};
 const lockCards=locked=>{
  grid?.classList.toggle('sequence-playing',locked);
  cards.forEach(card=>{card.inert=locked;});
 };
 const syncCards=()=>{
  stopCards();
  lockCards(visible && !completed && !reduced.matches);
  if(!grid || !visible || completed || document.hidden || reduced.matches)return;
  if(active<0)active=0;
  cards[active]?.classList.add('auto-highlight');
  timer=setInterval(()=>{
   clearCards();
   active++;
   if(active>=cards.length){completed=true;stopCards();lockCards(false);return;}
   cards[active].classList.add('auto-highlight');
  },1000);
 };
 if(grid && cards.length){
  new IntersectionObserver(entries=>{
   const entered=entries[0].isIntersecting;
   if(entered===visible)return;
   visible=entered;
   if(!visible){active=-1;completed=false;}
   syncCards();
  },{threshold:0}).observe(grid);
  document.addEventListener('visibilitychange',syncCards);
  reduced.addEventListener('change',syncCards);
  // Pointer and keyboard interactions resume only after the complete pass.
  lockCards(!reduced.matches);
 }
})();
