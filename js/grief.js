/* ═══════════════════════════════════════════════════════════
   DEAD AIR · grief support
   a breathing orb, the five stages pinned to your scroll,
   a phone line with real touch tones and Vera on the other end,
   lanterns, and permission to log off
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));

  /* ═════════════ 01 · BREATHE ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = ''; l.setAttribute('aria-label', t);
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; l.appendChild(s); chars.push(s); });
  });
  const orbs = $$('.orb'), title = $('.br-title'), cue = $('#brCue'), brBtn = $('#brBtn');
  const o = { s: .68 };
  const paint = () => { orbs.forEach((x) => x.style.setProperty('--s', o.s.toFixed(3))); title.style.setProperty('--tb', ((1 - o.s) * 8).toFixed(2) + 'px'); };
  let idle = null, guided = null, pad = null;
  const startIdle = () => { if (!G) return; idle = gsap.to(o, { s: .82, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: paint }); };
  onReady(() => {
    if (!G) { paint(); return; }
    gsap.timeline()
      .fromTo(chars, { '--b': '40px', opacity: 0 }, { '--b': '0px', opacity: 1, duration: 2, ease: 'power2.out', stagger: { each: .07, from: 'center' } })
      .from('.br-meta > span, .br-foot > *', { y: 20, opacity: 0, stagger: .1, duration: .9 }, '<.6');
    startIdle();
  });
  // the pad that breathes with you
  const padOn = () => {
    const a = DA.audio(); if (!a || DA.muted) return;
    const g = a.createGain(); g.gain.value = 0; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const os = [196, 293.7, 392, 440].map((f, i) => { const x = a.createOscillator(); x.type = i % 2 ? 'triangle' : 'sine'; x.frequency.value = f; x.detune.value = rand(-6, 6); x.connect(lp); x.start(); return x; });
    lp.connect(g).connect(a.destination);
    pad = { a, g, os, lp };
  };
  const padTo = (v, t) => { if (!pad) return; const { a, g, lp } = pad; g.gain.cancelScheduledValues(a.currentTime); g.gain.setValueAtTime(g.gain.value, a.currentTime); g.gain.linearRampToValueAtTime(v, a.currentTime + t); lp.frequency.linearRampToValueAtTime(400 + v * 30000, a.currentTime + t); };
  const padOff = () => { if (!pad) return; const p = pad; pad = null; padTo.call(null, 0, .1); p.g.gain.linearRampToValueAtTime(0, p.a.currentTime + 1); setTimeout(() => p.os.forEach((x) => x.stop()), 1200); };
  const STEPS = [['Breathe in…', 4, .98, .03], ['Hold.', 4, .98, .03], ['And let it go…', 6, .55, .005], ['', 2, .55, .005]];
  brBtn.addEventListener('click', () => {
    const on = brBtn.getAttribute('aria-pressed') !== 'true';
    brBtn.setAttribute('aria-pressed', on); $('span', brBtn).textContent = on ? 'Stop' : 'Breathe with us';
    if (!on) { guided?.kill(); guided = null; padOff(); cue.classList.remove('is-on'); cue.textContent = 'You did well. Come back any time.'; startIdle(); DA.duck(false); return; }
    idle?.kill(); padOn(); DA.duck(true); cue.classList.add('is-on');
    if (!hasGsap) { cue.textContent = 'Breathe in for four, hold for four, out for six.'; return; }
    guided = gsap.timeline({ repeat: -1 });
    STEPS.forEach(([t, d, s, v]) => {
      guided.add(() => { if (t) cue.textContent = t; padTo(v, d); });
      guided.to(o, { s, duration: d, ease: 'sine.inOut', onUpdate: paint });
    });
  });

  /* ═════════════ 02 · THE FIVE STAGES ═════════════ */
  const layers = $$('.stg-layer'), stgN = $('#stgN'), stgBar = $('#stgBar'), pin = $('.stg-pin');
  const ldBar = $('#ldBar'), ldPc = $('#ldPc'), login = $('.login'), pw = $('#pw'), pwTry = $('#pwTry'), clock = $('#depClock');
  // the rain of old captions
  const CAPS = ['me n the girls ♡', 'cant sleep', 'new profile pic!!', 'miss this', 'throwback', 'lol remember this', 'brb', 'summer 2014 forever', 'why is everyone so', 'ok', 'happy birthday!!!', 'i hate mondays', 'best night ever', 'not ok', 'goodnight x', 'listening to: the same song', 'seen', 'tag urself', 'we were so young'];
  const rain = $('#rain');
  rain.innerHTML = Array.from({ length: 26 }, () => `<p style="left:${rand(0, 96).toFixed(1)}%;animation-duration:${rand(9, 20).toFixed(1)}s;animation-delay:-${rand(0, 20).toFixed(1)}s">${esc(CAPS[(Math.random() * CAPS.length) | 0])}</p>`).join('');
  let stage = -1, attempt = -1;
  const setStage = (i) => {
    if (i === stage) return; stage = i;
    layers.forEach((l, k) => l.classList.toggle('is-on', k === i));
    stgN.textContent = String(i + 1).padStart(2, '0');
    pin.classList.toggle('is-light', i === 4);
    if (i === 1) DA.noise(.25, 300, .06, 120);
    if (i === 4) DA.chime(); else DA.beep(300 + i * 60, .2, .02, 'triangle');
  };
  const stgUpdate = (p) => {
    const i = clamp(Math.floor(p * 5), 0, 4), l = clamp(p * 5 - i, 0, 1);
    setStage(i); stgBar.style.width = (p * 100) + '%';
    if (i === 0) { const v = Math.min(99, Math.round(l * 150)); ldBar.style.width = v + '%'; ldPc.textContent = v + '%' + (v === 99 ? ' · still loading' : ''); }
    if (i === 2) {
      const a = Math.min(2, Math.floor(l * 3)), dots = Math.floor(((l * 3) % 1) * 12);
      pw.textContent = '•'.repeat(dots);
      if (a !== attempt) { if (attempt >= 0 && a > attempt) { login.classList.remove('is-wrong'); void login.offsetWidth; login.classList.add('is-wrong'); DA.beep(180, .15, .04, 'square'); } attempt = a; pwTry.textContent = 3 - a; }
    }
    if (i === 3) { const m = 7 + Math.floor(l * 52); clock.textContent = `3:${String(m).padStart(2, '0')} AM`; }
  };
  if (G) ScrollTrigger.create({ trigger: pin, pin: true, start: 'top top', end: '+=420%', scrub: true, onUpdate: (s) => stgUpdate(s.progress) });
  else { $('.stg').classList.add('is-static'); layers.forEach((l) => l.classList.add('is-on')); ldBar.style.width = '99%'; ldPc.textContent = '99% · still loading'; pw.textContent = '••••••••'; }

  /* ═════════════ 03 · THE 3 AM LINE ═════════════ */
  const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], '*': [941, 1209], 0: [941, 1336], '#': [941, 1477] };
  const tone2 = (fs, d = .16, v = .06) => fs.forEach((f) => DA.beep(f, d, v, 'sine'));
  const dial = $('#dial'), ivr = $('#ivr'), padEl = $('#pad');
  const HOUSE = '18007473282'; // 1-800-RIP-DATA
  let digits = '', live = false, timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const showDial = () => { dial.textContent = digits ? digits.replace(/^1?(800)(\d{0,3})(\d{0,4})$/, (m, a, b, c) => `1-${a}${b ? '-' + b : ''}${c ? '-' + c : ''}`) : ' '; };
  const say = (who, text, done) => {
    const p = document.createElement('p'); p.className = 'iv' + (who === 'you' ? ' iv--you' : '');
    p.innerHTML = `<b>${esc(who)}</b><span class="caret"></span>`; ivr.appendChild(p);
    const span = $('span', p); let i = 0;
    if (!motion) { span.textContent = text; span.classList.remove('caret'); done && done(); return; }
    const tick = () => { span.textContent = text.slice(0, ++i); if (i % 3 === 0) DA.beep(rand(170, 230), .03, .008, 'triangle'); if (i < text.length) later(28, tick); else { span.classList.remove('caret'); done && done(); } };
    tick();
    ivr.scrollTop = ivr.scrollHeight;
  };
  const MENU = [['1', 'I miss a person'], ['2', 'I miss who I was back then'], ['3', "I'm just tired"], ['0', 'talk to Cache']];
  const REPLY = {
    1: "Then that's love with nowhere to go. It's allowed to stay a while. Tomorrow, text a friend, the kind who answers. And if tonight feels too heavy, please call someone who can sit with you properly.",
    2: "She's not gone, you know. The girl with the sparkle cursor. She grew up into you. Be kind to her, she's been through a lot.",
    3: 'Then this is your sign. Phone face down. A glass of water. The archive will still be there in the morning, and so will we.',
    0: "caw. (He says hi. He's holding a USB stick. He won't give it back.)",
  };
  const menu = () => {
    const box = document.createElement('div'); box.className = 'iv-opts';
    box.innerHTML = MENU.map(([k, t]) => `<button type="button" data-k="${k}">press ${k} · ${esc(t)}</button>`).join('');
    ivr.appendChild(box); ivr.scrollTop = ivr.scrollHeight;
  };
  const choose = (k) => {
    if (!live || !REPLY[k]) return;
    $$('.iv-opts', ivr).forEach((b) => b.remove());
    say('you', MENU.find((m) => m[0] === k)[1]);
    later(500, () => say(k === '0' ? 'cache' : 'vera', REPLY[k], () => later(600, () => say('vera', 'Anything else? Take your time.', menu))));
  };
  const call = () => {
    clear(); ivr.innerHTML = ''; DA.audio();
    const n = digits.replace(/\D/g, '');
    if (!n) { ivr.innerHTML = '<p class="ivr-idle mono">dial a number first. or use speed dial.</p>'; return; }
    live = true;
    // ringback: two rings, then the click of someone picking up
    [0, 3000].forEach((t) => later(t, () => { tone2([440, 480], 1.8, .03); }));
    ivr.innerHTML = '<p class="ivr-idle mono">ringing…</p>';
    later(5200, () => {
      ivr.innerHTML = ''; DA.noise(.05, 2000, .08);
      if (n !== HOUSE) { live = false; say('operator', "We're sorry. The number you have dialled is no longer in service. Like a lot of things. Try speed dial."); return; }
      say('vera', "Dead Air, this is Vera. You're not bothering anyone. It's late, isn't it?", () => later(500, () => say('vera', 'Tell me which one it is tonight.', menu)));
    });
  };
  const hang = () => { clear(); if (live) { [0, 500, 1000].forEach((t) => setTimeout(() => tone2([480, 620], .25, .03), t)); } live = false; digits = ''; showDial(); ivr.innerHTML = '<p class="ivr-idle mono">call ended. you can call back whenever you want.</p>'; };
  const press = (k, b) => {
    tone2(DTMF[k]); if (b) { b.classList.add('is-hit'); setTimeout(() => b.classList.remove('is-hit'), 140); }
    if (live) { choose(k); return; }
    if (digits.length < 14) { digits += k; showDial(); }
  };
  padEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) press(b.dataset.k, b); });
  ivr.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { tone2(DTMF[b.dataset.k]); choose(b.dataset.k); } });
  $('#callBtn').addEventListener('click', call);
  $('#hangBtn').addEventListener('click', hang);
  $('#speed').addEventListener('click', () => {
    clear(); digits = ''; live = false;
    [...HOUSE].forEach((k, i) => later(i * 110, () => { digits += k; showDial(); tone2(DTMF[k], .08, .04); }));
    later(HOUSE.length * 110 + 300, call);
  });
  // the keyboard works too, but only while the phone is on screen
  let phoneVisible = false;
  new IntersectionObserver(([e]) => { phoneVisible = e.isIntersecting; }, { threshold: .4 }).observe($('.phone2'));
  document.addEventListener('keydown', (e) => {
    if (!phoneVisible || e.metaKey || e.ctrlKey || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (DTMF[e.key] !== undefined) { e.preventDefault(); e.stopPropagation(); press(e.key, $(`[data-k="${CSS.escape(e.key)}"]`, padEl)); }
    if (e.key === 'Enter') call();
    if (e.key === 'Backspace' && !live) { digits = digits.slice(0, -1); showDial(); }
  }, true);
  if (G) gsap.from('.hl-title', { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.hl-hd', start: 'top 85%' } });

  /* ═════════════ 04 · SUPPORT GROUPS ═════════════ */
  const seats = store.get('seats', []);
  $$('.sg-join').forEach((b, i) => {
    const base = +b.dataset.seats, em = $('em', b);
    const show = () => { const on = seats.includes(i); b.classList.toggle('is-saved', on); em.textContent = base - (on ? 1 : 0); b.firstChild.textContent = on ? 'seat saved · ' : 'save a seat · '; };
    show();
    b.addEventListener('click', () => {
      const k = seats.indexOf(i); k > -1 ? seats.splice(k, 1) : seats.push(i); store.set('seats', seats); show();
      if (seats.includes(i)) { DA.chime(); DA.toast("seat saved. there'll be tea."); } else DA.beep(400, .1, .02);
    });
  });
  if (G) {
    gsap.from('.sg-list li', { y: 30, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.sg-list', start: 'top 80%' } });
    $$('.sec-title').forEach((t) => gsap.from(t, { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));
  }

  /* ═════════════ 05 · LANTERNS ═════════════ */
  const sky = $('#sky'), sx = sky.getContext('2d');
  let W = 0, H = 0, run = false;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = sky.offsetWidth; H = sky.offsetHeight; sky.width = W * d; sky.height = H * d; sx.setTransform(d, 0, 0, d, 0, 0); };
  size(); window.addEventListener('resize', size);
  const STARS = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * .7, r: rand(.3, 1.3), t: rand(0, 6.28) }));
  const OTHERS = ['the last voice note', 'our old group chat', 'my 2012 tumblr', 'the photos from that summer', 'save file 03', 'his hoodie, in a photo', 'the drafts', 'who I was at 15', 'the forum', 'mom\'s old number'];
  const L = [];
  const spawn = (text, mine) => L.push({ x: mine ? .5 + rand(-.05, .05) : rand(.05, .95), y: mine ? 1.02 : rand(.3, 1.1), s: mine ? 1.25 : rand(.45, .9), v: rand(.00025, .0006) * (mine ? 1.2 : 1), sw: rand(0, 6.28), text, mine, a: mine ? 0 : 1 });
  OTHERS.forEach((t) => spawn(t));
  const lantern = (q) => {
    const x = q.x * W + Math.sin(q.sw) * 14, y = q.y * H, s = q.s * 26, fl = .85 + Math.sin(performance.now() / 120 + q.sw * 9) * .1;
    const g = sx.createRadialGradient(x, y, 0, x, y, s * 3.2); g.addColorStop(0, `rgba(255,190,110,${.35 * q.a * fl})`); g.addColorStop(1, 'rgba(255,150,80,0)');
    sx.fillStyle = g; sx.beginPath(); sx.arc(x, y, s * 3.2, 0, 7); sx.fill();
    const b = sx.createLinearGradient(x, y - s, x, y + s); b.addColorStop(0, `rgba(255,214,150,${q.a})`); b.addColorStop(1, `rgba(255,140,60,${q.a})`);
    sx.fillStyle = b; sx.beginPath(); sx.moveTo(x - s * .55, y - s); sx.lineTo(x + s * .55, y - s); sx.quadraticCurveTo(x + s * .8, y, x + s * .5, y + s); sx.lineTo(x - s * .5, y + s); sx.quadraticCurveTo(x - s * .8, y, x - s * .55, y - s); sx.fill();
    sx.fillStyle = `rgba(255,250,230,${q.a * fl})`; sx.beginPath(); sx.ellipse(x, y + s * .7, s * .2, s * .12, 0, 0, 7); sx.fill();
    if (q.mine || q.s > .8) { sx.fillStyle = `rgba(243,238,245,${q.a * (q.mine ? .9 : .45)})`; sx.font = `${q.mine ? 15 : 11}px "Instrument Serif", serif`; sx.textAlign = 'center'; sx.fillText(q.text, x, y + s * 2.1); }
  };
  const loop = () => {
    if (!run) return;
    sx.clearRect(0, 0, W, H);
    const t = performance.now() / 1000;
    for (const s of STARS) { sx.fillStyle = `rgba(255,255,255,${.25 + Math.sin(t * 1.3 + s.t) * .2})`; sx.fillRect(s.x * W, s.y * H, s.r, s.r); }
    for (let i = L.length - 1; i >= 0; i--) {
      const q = L[i]; q.y -= q.v * (motion ? 1 : 0); q.sw += .01; q.s *= q.mine ? .9993 : 1;
      if (q.mine) q.a = Math.min(1, q.a + .02) * (q.y < .1 ? q.y / .1 : 1);
      if (q.y < -.08) { if (q.mine) L.splice(i, 1); else { q.y = 1.1; q.x = rand(.05, .95); } continue; }
      lantern(q);
    }
    requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !run) { run = true; requestAnimationFrame(loop); } else if (!e.isIntersecting) run = false; }).observe(sky);
  const ltN = $('#ltN'); let released = store.get('lanterns', 0);
  ltN.textContent = (214 + released).toLocaleString('en-US');
  const hold = $('#ltHold'), fill = $('#ltFill'), input = $('#ltIn');
  let ht = null;
  const release = () => {
    const text = input.value.trim() || input.placeholder;
    spawn(text, true); input.value = '';
    released++; store.set('lanterns', released); ltN.textContent = (214 + released).toLocaleString('en-US');
    DA.noise(1.2, 600, .03, 2400); setTimeout(() => DA.chime(), 300);
    DA.toast('there it goes.');
  };
  const down = (e) => {
    e.preventDefault(); hold.setPointerCapture?.(e.pointerId);
    if (!hasGsap) { release(); return; }
    ht?.kill(); ht = gsap.to(fill, { scaleX: 1, duration: 1.6, ease: 'none', onComplete: () => { release(); gsap.to(fill, { scaleX: 0, duration: .5 }); ht = null; } });
  };
  const up = () => { if (ht) { ht.kill(); ht = null; gsap.to(fill, { scaleX: 0, duration: .4 }); } };
  hold.addEventListener('pointerdown', down);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => hold.addEventListener(ev, up));
  hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
  hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') up(); });
  $('#ltForm').addEventListener('submit', (e) => e.preventDefault());

  /* ═════════════ 06 · LOG OFF ═════════════ */
  const night = $('#night');
  $('#loBtn').addEventListener('click', () => {
    night.hidden = false; document.documentElement.classList.add('rd-open'); DA.lenis?.stop();
    padOff(); DA.duck(true); DA.flatline(2.4);
    if (G) gsap.timeline().fromTo(night, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'power2.inOut' }).from('.night-t', { filter: 'blur(30px)', opacity: 0, duration: 2.4, ease: 'expo.out' }, '-=.8').from('.night-s, .night-b', { opacity: 0, stagger: .4, duration: 1 });
    $('#nightB').focus({ preventScroll: true });
  });
  $('#nightB').addEventListener('click', () => {
    const done = () => { night.hidden = true; document.documentElement.classList.remove('rd-open'); DA.lenis?.start(); DA.duck(false); };
    if (G) gsap.to(night, { opacity: 0, duration: 1.2, onComplete: done }); else done();
    DA.toast('welcome back. take it slow.');
  });
  if (G) gsap.from('.lo-title, .lo-btn', { filter: 'blur(20px)', opacity: 0, y: 30, duration: 1.4, stagger: .2, ease: 'expo.out', scrollTrigger: { trigger: '.lo', start: 'top 75%' } });
})();
