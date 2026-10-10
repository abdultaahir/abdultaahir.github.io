const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

// Scroll progress
const progressBar=document.getElementById("scroll-progress");
function updateScrollProgress(){
  if(!progressBar) return;
  const h=document.documentElement;
  const max=h.scrollHeight-h.clientHeight;
  const ratio=max>0 ? (h.scrollTop||document.body.scrollTop)/max : 0;
  progressBar.style.transform=`scaleX(${Math.min(Math.max(ratio,0),1)})`;
}
addEventListener('scroll',updateScrollProgress,{passive:true});
addEventListener('load',updateScrollProgress);

// Generic section reveal
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  e.target.classList.toggle('in',e.isIntersecting);
}),{threshold:.10});
$$('.reveal').forEach(el=>observer.observe(el));

// Word-by-word reveal, directly observed so headings can never get stuck invisible.
function splitWords(el){
  if(!el || el.dataset.wordReady) return;
  let idx=0;
  const walk=n=>{
    [...n.childNodes].forEach(c=>{
      if(c.nodeType===3){
        const txt=c.textContent;
        if(!txt.trim()) return;
        const frag=document.createDocumentFragment();
        txt.split(/(\s+)/).forEach(part=>{
          if(!part) return;
          if(/^\s+$/.test(part)) frag.append(document.createTextNode(part));
          else { const s=document.createElement('span'); s.className='word-piece'; s.style.setProperty('--i',Math.min(idx++,30)); s.textContent=part; frag.append(s); }
        });
        c.replaceWith(frag);
      } else if(c.nodeType===1) walk(c);
    });
  };
  walk(el);
  el.dataset.wordReady='1';
  el.classList.add('word-reveal','is-animating');
}
const wordTargets=$$('.hero h1, section h2, .featured-card h3');
wordTargets.forEach(splitWords);
const wordObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting) e.target.classList.add('words-in');
  else e.target.classList.remove('words-in');
}),{threshold:.28});
wordTargets.forEach(el=>wordObserver.observe(el));
// Fail-safe: visible after load even if browser delays IntersectionObserver.
setTimeout(()=>wordTargets.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*1.1&&r.bottom>-30)el.classList.add('words-in')}),350);

// Projects
const projects=[
 {name:'GrowthLab',kind:'B2B Agency · Lead Generation',desc:'Outreach was being opened but ignored because the copy felt templated and impersonal.',badges:['Natural tone','Short structure','Curiosity-led hook']},
 {name:'TalentBridge',kind:'Recruiting Firm · Candidate Outreach',desc:'Generic recruiting language was blending into every other message in a candidate’s inbox.',badges:['Observational opening','Conversational tone','Soft CTA']},
 {name:'InvoiceFlow',kind:'B2B Software · Lead Generation',desc:'A strong product was being explained through feature-heavy copy instead of buyer-relevant messaging.',badges:['Conversational copy','Curiosity-led hook','Demo-focused journey']},
 {name:'ScaleOps',kind:'B2B SaaS · Signal-Based Prospecting',desc:'Long AI-style emails and tracking-heavy outreach were creating friction with VP-level prospects.',badges:['Trigger-based targeting','Short plain text','Low-friction CTA']}
];
const pg=$('#project-grid');
if(pg){
  pg.innerHTML=projects.map((p,i)=>`<article class="card project reveal"><div class="project-top"><span class="eyebrow">Project ${String(i+1).padStart(2,'0')}</span><span>Selected work</span></div><h3>${p.name}</h3><div class="kind">${p.kind}</div><p class="desc">${p.desc}</p><div class="badges">${p.badges.map(b=>`<span class="badge">${b}</span>`).join('')}</div></article>`).join('');
  $$('#project-grid .reveal').forEach(el=>observer.observe(el));
}

// Testimonials: all four, one card step at a time, auto-slide, visible counter.
const testimonials=[
 {q:'Our outreach emails were opened, but nobody responded since they were too templated and impersonal. Tahir re-wrote our campaigns with a natural and conversational tone and curiosity-based hooks. Short structure made a huge difference. It feels like a real person is contacting you. Highly recommend for B2B lead generation.',n:'Founder',r:'GrowthLab'},
 {q:'Candidates know when they are being spammed with generic recruiting templates, and it affected our reply rate. Tahir came to our rescue and helped to change the approach to curiosity-led openings and a conversational tone that feels like a real person is contacting you. Soft and low-pressure CTAs helped to revive our candidate pipeline.',n:'Director of Recruiting',r:'TalentBridge'},
 {q:'Like many other SaaS companies, we were focusing on the product and email copy was an afterthought. We just listed features and didn\'t make prospects feel anything. Tahir helped us to switch to a conversational and curiosity-based approach that actually converts cold prospects to booked demos.',n:'CEO',r:'InvoiceFlow'},
 {q:'We were sending 5-paragraph AI essays with tracking links and our deliverability rate was poor. Tahir helped to simplify our campaigns. Plain text, no links, and under 40 words. By using signal-based prospecting, we reach out only when a target company shows a certain growth signal. It saved our domain reputation and got VP-level prospects replying.',n:'VP of Sales',r:'ScaleOps'}
];
const tt=$('#testimonial-track'),status=$('#testimonial-status');
let testimonialIndex=0,testimonialTimer=null;
if(tt){
  tt.innerHTML=testimonials.map((t,i)=>`<figure class="card quote" data-index="${i}"><span class="eyebrow">Client feedback</span><blockquote>${t.q}</blockquote><footer><div><strong>${t.n}</strong><br><small>${t.r}</small></div><span class="badge">Verified project quote</span></footer></figure>`).join('');
}
function updateTestimonialStatus(){if(status)status.textContent=`${testimonialIndex+1} / ${testimonials.length}`}
function goTestimonial(index,behavior='smooth'){
  if(!tt) return;
  testimonialIndex=(index+testimonials.length)%testimonials.length;
  const card=tt.querySelector(`[data-index="${testimonialIndex}"]`);
  if(card) tt.scrollTo({left:card.offsetLeft-tt.offsetLeft,behavior});
  updateTestimonialStatus();
}
function restartTestimonialAuto(){clearInterval(testimonialTimer);testimonialTimer=setInterval(()=>goTestimonial(testimonialIndex+1),6500)}
$('#next-testimonial')?.addEventListener('click',()=>{goTestimonial(testimonialIndex+1);restartTestimonialAuto()});
$('#prev-testimonial')?.addEventListener('click',()=>{goTestimonial(testimonialIndex-1);restartTestimonialAuto()});
updateTestimonialStatus();restartTestimonialAuto();

// Email demo typing + sound. Initial AI copy types when the demo enters view instead of finishing off-screen.
const bad=$('#btn-bad'),good=$('#btn-good'),badBody=$('#email-bad'),goodBody=$('#email-good'),subject=$('#subject');
const badCopy=`Dear Sir/Madam,\n\nHope this email finds you well.\n\nWe are a leading provider of premium lead generation and B2B marketing services. We have helped many companies synergize their sales paradigms and achieve unprecedented growth metrics.\n\nWould you be interested in a 30-minute discovery call this week to discuss our cutting-edge solutions?\n\nLooking forward to a mutually beneficial collaboration.\n\nWarm Regards,\nAI Sales Bot`;
const goodCopy=`Hey [First Name],\n\nSaw [Company] is hiring across sales. Congrats on the growth.\n\nQuick thought: when teams scale fast, prospecting usually gets noisier before it gets better.\n\nI had a look at your outreach angle and spotted a simpler way to make the first message feel more relevant without turning it into a five-paragraph pitch.\n\nWant me to send the short version?\n\nAbdul`;
let typingTimer=null,audioCtx=null;
function clickTick(){
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type='square';o.frequency.value=1050;g.gain.value=.014;o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.011);
  }catch(e){}
}
function typeInto(el,text,withSound=false,speed=16){
  clearTimeout(typingTimer); if(!el)return;
  el.textContent='';el.classList.add('typing-cursor');let i=0;
  (function step(){
    el.textContent=text.slice(0,++i);
    if(withSound && i%3===0) clickTick();
    if(i<text.length) typingTimer=setTimeout(step,speed);
    else el.classList.remove('typing-cursor');
  })();
}
function switchMail(mode,withSound=true){
  const isGood=mode==='good';
  bad?.classList.toggle('active',!isGood);good?.classList.toggle('active',isGood);
  badBody?.classList.toggle('hidden',isGood);goodBody?.classList.toggle('hidden',!isGood);
  if(subject) subject.textContent=isGood?'quick thought on [Company] outreach':'Partnership Opportunity for Lead Generation Services';
  if(isGood) typeInto($('#good-copy'),goodCopy,withSound,15);
  else typeInto(badBody,badCopy,withSound,15);
}
bad?.addEventListener('click',()=>switchMail('bad',true));
good?.addEventListener('click',()=>switchMail('good',true));
if(badBody) badBody.textContent='';
let demoStarted=false;
const demo=$('.email-demo');
if(demo){
  const demoObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting&&!demoStarted){demoStarted=true;switchMail('bad',false);demoObserver.disconnect()}
  }),{threshold:.30});
  demoObserver.observe(demo);
}

// Reveal fail-safe
(function revealFailSafe(){
  const show=()=>document.querySelectorAll('.reveal').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*1.08&&r.bottom>-50)el.classList.add('in')});
  window.addEventListener('load',show);window.addEventListener('scroll',show,{passive:true});setTimeout(show,120);
})();
