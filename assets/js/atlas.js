window.ATLAS_API_URL = 'https://atlas-abdul.ktahir9290.workers.dev';
const launch=document.getElementById('atlas-launch'),panel=document.getElementById('atlas-panel'),closeBtn=document.getElementById('atlas-close'),form=document.getElementById('atlas-form'),input=document.getElementById('atlas-input'),messages=document.getElementById('atlas-messages');
let lastIntent='';
const chatHistory=[];
const knowledge={
 identity:"Abdul Tahir is a B2B copywriter and ghostwriter focused on cold email strategy, lead-generation messaging, and founder-led content. His approach is research-led, direct, and designed to sound human rather than templated.",
 services:'Abdul works on B2B cold email strategy, lead-generation copy, and executive ghostwriting. If you tell me your goal, I can point you to the most relevant service.',
 work:'You can review GrowthLab, TalentBridge, InvoiceFlow and ScaleOps in Selected Work. There is also an independent Never Boring AI teardown that shows Abdul’s audit and rewrite thinking.',
 teardown:'The Never Boring AI teardown reviews the public homepage, pricing journey and welcome flow, identifies three messaging gaps, and includes a sample welcome email sequence. It is an independent sample, not commissioned by the company.',
 contact:'If you have a project in mind, tell me what you sell, who you want to reach, and what is not working. I can help you turn that into a short brief for Abdul. You can also use the LinkedIn button on this site.',
 pricing:'Pricing depends on scope, research depth and deliverables. Abdul does not publish a one-size-fits-all rate here. Share the project type and scope for a more useful estimate.',
 blog:'The blog covers practical B2B email, copywriting, teardowns and founder-led content. Use the Blog link in the navigation to browse what is published.',
 ai:'I’m A.T.L.A.S., Abdul Tahir’s website assistant. I can guide you through his services, work and project fit.'
};
function add(text,who='bot'){const d=document.createElement('div');d.className=`msg ${who}`;d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
function localReply(text){
 const t=text.toLowerCase().trim();
 if(/^(hi|hello|hey|salam|assalam)/.test(t)) return 'Hey. What are you working on right now: cold outreach, conversion copy, founder content, or something else?';
 if(/^(yes|yeah|yep|sure|ok|okay|go on|tell me more)$/.test(t)){
   if(lastIntent==='identity') return knowledge.identity+' You can also ask me about his services, selected work, or how to hire him.';
   if(lastIntent==='services') return 'Cold Email Strategy is for outreach sequences, Lead Generation Copy covers landing pages and conversion messaging, and Executive Ghostwriting covers founder or executive content. Which outcome are you after?';
   if(lastIntent==='work') return knowledge.work+' Ask me about any one of those projects or the Never Boring AI teardown.';
   return 'Sure. Tell me what you are trying to achieve and I’ll point you in the right direction.';
 }
 if(/who\s+(is|s)\s+abdul|who\s+is\s+abdul\s+tahir|about\s+abdul/.test(t)){lastIntent='identity';return knowledge.identity;}
 if(/price|cost|rate|budget/.test(t)){lastIntent='pricing';return knowledge.pricing;}
 if(/service|cold email|ghost|lead gen|landing page/.test(t)){lastIntent='services';return knowledge.services;}
 if(/never boring|teardown|audit/.test(t)){lastIntent='teardown';return knowledge.teardown;}
 if(/portfolio|project|work|case/.test(t)){lastIntent='work';return knowledge.work;}
 if(/blog|article|post/.test(t)){lastIntent='blog';return knowledge.blog;}
 if(/contact|hire|book|talk|reach|linkedin/.test(t)){lastIntent='contact';return knowledge.contact;}
 if(/who are you|atlas|ai assistant/.test(t)){lastIntent='ai';return knowledge.ai;}
 if(/help|stuck|problem/.test(t)) return 'Absolutely. What are you working on, and what part is giving you trouble?';
 lastIntent='';return 'Tell me what you are trying to achieve and where you are stuck. I’ll guide you from there.';
}
async function ask(text){
 add(text,'user');input.value='';
 const previous=chatHistory.slice(-10);
 if(window.ATLAS_API_URL){
  try{
   const r=await fetch(window.ATLAS_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:previous})});
   if(!r.ok)throw new Error('API');
   const data=await r.json();
   const reply=(data.reply||'').trim();
   if(!reply)throw new Error('EMPTY');
   add(reply);
   chatHistory.push({role:'user',content:text},{role:'assistant',content:reply});
   if(chatHistory.length>20) chatHistory.splice(0,chatHistory.length-20);
   return;
  }catch(e){
   const fallback=localReply(text);add(fallback);chatHistory.push({role:'user',content:text},{role:'assistant',content:fallback});return;
  }
 }
 const fallback=localReply(text);setTimeout(()=>{add(fallback);chatHistory.push({role:'user',content:text},{role:'assistant',content:fallback});},180);
}
launch?.addEventListener('click',()=>panel.classList.toggle('open'));
closeBtn?.addEventListener('click',()=>panel.classList.remove('open'));
form?.addEventListener('submit',e=>{e.preventDefault();const t=input.value.trim();if(t)ask(t)});
document.querySelectorAll('[data-atlas]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.atlas)));
