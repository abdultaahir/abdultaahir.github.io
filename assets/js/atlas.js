window.ATLAS_API_URL = 'https://atlas-abdul.ktahir9290.workers.dev';

const launch = document.getElementById('atlas-launch');
const panel = document.getElementById('atlas-panel');
const closeBtn = document.getElementById('atlas-close');
const form = document.getElementById('atlas-form');
const input = document.getElementById('atlas-input');
const messages = document.getElementById('atlas-messages');

let lastIntent = '';
let busy = false;

const chatHistory = [];


// --------------------------------------------------
// THINKING INDICATOR STYLES
// --------------------------------------------------

const atlasStyle = document.createElement('style');

atlasStyle.textContent = `
  .atlas-thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: .78;
  }

  .atlas-thinking-dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .atlas-thinking-dots i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    display: block;
    animation: atlasDot 1.1s infinite ease-in-out;
  }

  .atlas-thinking-dots i:nth-child(2) {
    animation-delay: .15s;
  }

  .atlas-thinking-dots i:nth-child(3) {
    animation-delay: .3s;
  }

  @keyframes atlasDot {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: .35;
    }

    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }

  .atlas-cursor::after {
    content: "|";
    color: #2f81f7;
    margin-left: 2px;
    animation: atlasBlink .8s steps(2) infinite;
  }

  @keyframes atlasBlink {
    50% {
      opacity: 0;
    }
  }
`;

document.head.appendChild(atlasStyle);


// --------------------------------------------------
// LOCAL KNOWLEDGE
// --------------------------------------------------

const knowledge = {

  identity:
    "Abdul Tahir is a B2B copywriter and ghostwriter focused on cold email strategy, lead-generation messaging, and founder-led content. His approach is research-led, direct, conversational, and designed to sound human rather than templated.",

  services:
    "Abdul works on B2B cold email strategy, lead-generation copy, and executive ghostwriting. If you tell me what you're trying to achieve, I can help you figure out which service fits best.",

  work:
    "Abdul's selected work includes GrowthLab, TalentBridge, InvoiceFlow, and ScaleOps. There is also an independent Never Boring AI teardown that demonstrates his audit, messaging, and rewrite process.",

  teardown:
    "The Never Boring AI teardown reviews the company's publicly available homepage, pricing journey, and welcome flow. It identifies messaging gaps and includes a sample welcome-email direction. It is an independent teardown, not commissioned by Never Boring AI.",

  contact:
    "If you have a real project in mind, tell me what you sell, who you're trying to reach, and what's currently not working. I can help you turn that into a useful brief before you contact Abdul.",

  pricing:
    "Pricing depends on the scope, research depth, audience, and deliverables. Abdul doesn't publish a one-size-fits-all rate. Tell me what you need and I can help you define the scope first.",

  blog:
    "The blog covers practical B2B email, copywriting, teardowns, and founder-led content. You can open the Blog section from the site's navigation.",

  ai:
    "I'm A.T.L.A.S. — Abdul Tahir Lead Assistance System. I'm here to help you understand Abdul's services, explore relevant work, think through your messaging problem, and figure out whether your project is a good fit."
};


// --------------------------------------------------
// BASIC MESSAGE HELPERS
// --------------------------------------------------

function scrollMessages() {
  messages.scrollTop = messages.scrollHeight;
}


function add(text, who = 'bot') {
  const d = document.createElement('div');

  d.className = `msg ${who}`;
  d.textContent = text;

  messages.appendChild(d);

  scrollMessages();

  return d;
}


// --------------------------------------------------
// THINKING INDICATOR
// --------------------------------------------------

function addThinking() {

  removeThinking();

  const d = document.createElement('div');

  d.className = 'msg bot atlas-thinking';
  d.id = 'atlas-thinking';

  d.innerHTML = `
    <span>A.T.L.A.S. is thinking</span>
    <span class="atlas-thinking-dots">
      <i></i>
      <i></i>
      <i></i>
    </span>
  `;

  messages.appendChild(d);

  scrollMessages();
}


function removeThinking() {
  document.getElementById('atlas-thinking')?.remove();
}


// --------------------------------------------------
// TYPEWRITER BOT REPLY
// --------------------------------------------------

async function typeBotReply(text) {

  const d = document.createElement('div');

  d.className = 'msg bot atlas-cursor';

  messages.appendChild(d);

  scrollMessages();

  const speed =
    text.length > 500 ? 2 :
    text.length > 250 ? 4 :
    7;

  for (let i = 0; i < text.length; i++) {

    d.textContent += text[i];

    if (i % 5 === 0) {
      scrollMessages();
    }

    await new Promise(resolve =>
      setTimeout(resolve, speed)
    );
  }

  d.classList.remove('atlas-cursor');

  scrollMessages();
}


// --------------------------------------------------
// LOCAL FALLBACK BRAIN
// --------------------------------------------------

function localReply(text) {

  const t = text.toLowerCase().trim();


  if (/^(hi|hello|hey|salam|assalam)/.test(t)) {

    return "Hey. What are you working on right now — cold outreach, conversion copy, founder content, or something else?";

  }


  if (/^(yes|yeah|yep|sure|ok|okay|go on|tell me more)$/.test(t)) {

    if (lastIntent === 'identity') {

      return knowledge.identity +
        " You can also ask me about his services, selected work, or how to hire him.";

    }

    if (lastIntent === 'services') {

      return "Cold Email Strategy is for outreach sequences, Lead Generation Copy covers landing pages and conversion messaging, and Executive Ghostwriting covers founder or executive content. Which outcome are you after?";

    }

    if (lastIntent === 'work') {

      return knowledge.work +
        " Ask me about any one of those projects or the Never Boring AI teardown.";

    }

    return "Sure. Tell me what you're trying to achieve and where you're stuck, and I'll guide you from there.";

  }


  if (/who\s+(is|s)\s+abdul|who\s+is\s+abdul\s+tahir|about\s+abdul/.test(t)) {

    lastIntent = 'identity';

    return knowledge.identity;

  }


  if (/price|cost|rate|budget/.test(t)) {

    lastIntent = 'pricing';

    return knowledge.pricing;

  }


  if (/service|cold email|ghost|lead gen|landing page/.test(t)) {

    lastIntent = 'services';

    return knowledge.services;

  }


  if (/never boring|teardown|audit/.test(t)) {

    lastIntent = 'teardown';

    return knowledge.teardown;

  }


  if (/portfolio|project|work|case/.test(t)) {

    lastIntent = 'work';

    return knowledge.work;

  }


  if (/blog|article|post/.test(t)) {

    lastIntent = 'blog';

    return knowledge.blog;

  }


  if (/contact|hire|book|talk|reach|linkedin/.test(t)) {

    lastIntent = 'contact';

    return knowledge.contact;

  }


  if (/who are you|atlas|ai assistant/.test(t)) {

    lastIntent = 'ai';

    return knowledge.ai;

  }


  if (/help|stuck|problem/.test(t)) {

    return "Absolutely. Tell me three things: what you're selling, who you're trying to reach, and what's currently going wrong.";

  }


  lastIntent = '';

  return "Tell me what you're trying to achieve and where you're stuck. I'll help you think through the next step.";

}


// --------------------------------------------------
// FILTER BAD MODEL OUTPUT
// --------------------------------------------------

function isBadModelReply(reply) {

  const badPatterns = [

    /here'?s a thinking process/i,

    /analyze user input/i,

    /check system instructions/i,

    /system prompt/i,

    /chain of thought/i,

    /internal reasoning/i,

    /reasoning steps/i,

    /user safety\s*:/i,

    /assistant safety\s*:/i,

    /safety classification/i

  ];

  return badPatterns.some(pattern =>
    pattern.test(reply)
  );

}


// --------------------------------------------------
// MAIN ASK FUNCTION
// --------------------------------------------------

async function ask(text) {

  if (busy) return;

  busy = true;

  add(text, 'user');

  input.value = '';

  input.disabled = true;

  addThinking();


  const previous = chatHistory.slice(-10);


  if (window.ATLAS_API_URL) {

    try {

      const r = await fetch(
        window.ATLAS_API_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            message: text,
            history: previous
          })
        }
      );


      if (!r.ok) {
        throw new Error('API_ERROR');
      }


      const data = await r.json();

      const reply = String(
        data.reply || ''
      ).trim();


      if (!reply) {
        throw new Error('EMPTY_REPLY');
      }


      if (isBadModelReply(reply)) {
        throw new Error('BAD_MODEL_OUTPUT');
      }


      removeThinking();


      await typeBotReply(reply);


      chatHistory.push(
        {
          role: 'user',
          content: text
        },
        {
          role: 'assistant',
          content: reply
        }
      );


      if (chatHistory.length > 20) {

        chatHistory.splice(
          0,
          chatHistory.length - 20
        );

      }


      busy = false;

      input.disabled = false;

      input.focus();

      return;

    }

    catch (e) {

      removeThinking();

      const fallback = localReply(text);

      await typeBotReply(fallback);


      chatHistory.push(
        {
          role: 'user',
          content: text
        },
        {
          role: 'assistant',
          content: fallback
        }
      );


      busy = false;

      input.disabled = false;

      input.focus();

      return;
    }
  }


  removeThinking();


  const fallback = localReply(text);


  await typeBotReply(fallback);


  chatHistory.push(
    {
      role: 'user',
      content: text
    },
    {
      role: 'assistant',
      content: fallback
    }
  );


  busy = false;

  input.disabled = false;

  input.focus();
}


// --------------------------------------------------
// UI EVENTS
// --------------------------------------------------

launch?.addEventListener(
  'click',
  () => {

    panel.classList.toggle('open');

    if (panel.classList.contains('open')) {

      setTimeout(
        () => input?.focus(),
        120
      );

    }

  }
);


closeBtn?.addEventListener(
  'click',
  () => {

    panel.classList.remove('open');

  }
);


form?.addEventListener(
  'submit',
  e => {

    e.preventDefault();

    const t = input.value.trim();

    if (t) {

      ask(t);

    }

  }
);


document
  .querySelectorAll('[data-atlas]')
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () => ask(button.dataset.atlas)
      );

    }
  );
