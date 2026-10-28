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
const scenes=[['scene-simplify','CONNECT','Bring the moving parts together.',6000],['scene-automate','AUTOMATE','Let the routine take care of itself.',6000],['scene-grow','RESULTS','Clear results your business can feel.',7000],['scene-forward','WAY FORWARD','A clearer way forward.',8500]];
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
new IntersectionObserver(entries=>{stopTimer();visible=entries[0].isIntersecting;syncPause();schedule();},{threshold:.2}).observe(demo);
phaseButtons.forEach((button,index)=>button.addEventListener('click',()=>showScene(index)));
document.addEventListener('visibilitychange',()=>{stopTimer();syncPause();schedule();});
motion.addEventListener('change',()=>{stopTimer();paused=motion.matches;syncPause();schedule();});
showScene(0);syncPause();

const enquiryForm=document.getElementById('enquiry-form');
const interest=new URLSearchParams(window.location.search).get('interest');
const interestMap={Launch:'Website package',Business:'Website package',Automate:'Business automation',Custom:'Custom software or product'};
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
