/* ═══════════════════════════════════════════════════════════
   DEAD AIR · services
   the price list with a preview that follows you, the word that burns,
   the cemetery sideways, the factory reset on fire, which goodbye,
   extras for the plan, a quiet faq
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));

  const now = new Date();
  $('#svRef').textContent = String(Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5)).padStart(4, '0');

  /* ═════════════ 01 · HERO ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = ''; l.setAttribute('aria-label', t);
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; l.appendChild(s); chars.push(s); });
  });
  onReady(() => {
    if (!G) return;
    gsap.timeline()
      .fromTo(chars, { '--b': '30px', opacity: 0, yPercent: 40 }, { '--b': '0px', opacity: 1, yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: { each: .06, from: 'center' } })
      .from('.sv-meta > span', { y: -16, opacity: 0, stagger: .08, duration: .7 }, '<.2')
      .from('.sv-sub', { x: 60, opacity: 0, filter: 'blur(12px)', duration: 1.2, ease: 'power3.out' }, '<.3')
      .from('.sv-list a', { yPercent: 100, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, '<.2')
      .from('.sv-note', { opacity: 0, duration: .8 }, '<.4');
    gsap.to('.sv-t', { filter: 'blur(16px)', opacity: .2, yPercent: -20, ease: 'none', scrollTrigger: { trigger: '.sv-hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  // the preview: a framed photo that follows the cursor over the list
  const list = $('#svList'), prev = $('#svPrev');
  if (G && !touch) {
    const qx = gsap.quickTo(prev, 'x', { duration: .55, ease: 'power3' }), qy = gsap.quickTo(prev, 'y', { duration: .55, ease: 'power3' });
    let lastX = 0;
    window.addEventListener('pointermove', (e) => {
      qx(e.clientX + 30); qy(e.clientY);
      gsap.to(prev, { rotate: clamp((e.clientX - lastX) * .4, -12, 12), duration: .5 }); lastX = e.clientX;
    }, { passive: true });
    $$('a', list).forEach((a) => {
      a.addEventListener('pointerenter', () => {
        $$('.slot', prev).forEach((s) => s.classList.toggle('is-on', s.dataset.key === a.dataset.prev));
        list.classList.add('is-hovering');
        gsap.to(prev, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .45, ease: 'power3.out', overwrite: 'auto' });
        DA.beep(520 + [...list.children].indexOf(a.parentElement) * 130, .12, .015, 'triangle');
      });
    });
    list.addEventListener('pointerleave', () => { list.classList.remove('is-hovering'); gsap.to(prev, { opacity: 0, scale: .85, filter: 'blur(8px)', duration: .35 }); });
  }

  /* ═════════════ 02 · CREMATION · the word burns as you scroll ═════════════ */
  const crC = $('#crCanvas'), crSteps = $$('#crSteps li'), crSize = $('#crSize');
  const cr = { p: 0, parts: [], w: 0, h: 0 };
  const crBuild = () => {
    const r = crC.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    cr.w = r.width; cr.h = r.height; crC.width = r.width * d; crC.height = r.height * d;
    const x = cr.x = crC.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    const o = document.createElement('canvas'); o.width = Math.ceil(r.width); o.height = Math.ceil(r.height);
    const ox = o.getContext('2d');
    if ('fontStretch' in ox) ox.fontStretch = 'extra-condensed';
    let fs = 200; ox.font = `900 ${fs}px Archivo, "Arial Narrow", sans-serif`;
    fs = Math.min(fs * (o.width * .98) / ox.measureText('CREMATION').width, o.height * .9);
    ox.font = `900 ${fs}px Archivo, "Arial Narrow", sans-serif`;
    ox.fillStyle = '#fff'; ox.textBaseline = 'middle'; ox.textAlign = 'left';
    ox.fillText('CREMATION', 0, o.height / 2);
    const data = ox.getImageData(0, 0, o.width, o.height).data, step = r.width > 700 ? 4 : 3;
    cr.parts = [];
    for (let y = 0; y < o.height; y += step) for (let xx = 0; xx < o.width; xx += step) {
      if (data[(y * o.width + xx) * 4 + 3] < 128) continue;
      // burns bottom-up, right to left, with some chaos
      cr.parts.push({ hx: xx, hy: y, dx: rand(-60, 90), dy: rand(120, 360), wob: rand(0, 6.28), delay: (1 - y / o.height) * .5 + (1 - xx / o.width) * .3 + rand(0, .15), s: step });
    }
    crDraw();
  };
  const crDraw = () => {
    const { x, w, h, parts, p } = cr; if (!x) return;
    x.clearRect(0, 0, w, h);
    for (const q of parts) {
      const l = clamp((p * 2 - q.delay) / .8, 0, 1);
      if (l >= 1) continue;
      const e = l * l;
      const px = q.hx + q.dx * e + Math.sin(q.wob + l * 8) * 10 * l, py = q.hy - q.dy * e;
      if (l === 0) x.fillStyle = '#ebe8ee';
      else if (l < .18) x.fillStyle = `rgba(255,${(140 + l * 500) | 0},80,1)`;
      else x.fillStyle = `rgba(207,166,217,${(1 - l) * .8})`;
      const s = l > 0 ? q.s * (1 - l * .7) : q.s - .6;
      x.fillRect(px, py, s, s);
    }
  };
  const crUpdate = (p) => {
    cr.p = p; crDraw();
    const i = clamp(Math.floor(p * 4.2), 0, 3);
    crSteps.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
    const mb = 2.4 * (1 - clamp(p * 1.15, 0, 1)) ** 1.6;
    crSize.textContent = mb > .001 ? (mb >= 1 ? mb.toFixed(2) + ' MB' : Math.round(mb * 1000) + ' KB') : '0 KB';
  };
  document.fonts.load('900 100px Archivo').then(crBuild).catch(crBuild);
  window.addEventListener('resize', () => { crBuild(); crDraw(); });
  if (G) {
    let crackled = false;
    ScrollTrigger.create({
      trigger: '.cr-pin', pin: true, start: 'top top', end: '+=220%', scrub: true,
      onUpdate: (self) => {
        crUpdate(self.progress);
        if (self.progress > .12 && !crackled) { crackled = true; DA.noise(1.8, 400, .05, 2600); }
        if (self.progress < .05) crackled = false;
      },
    });
  } else crSteps.forEach((s) => s.classList.add('is-on'));

  /* ═════════════ 03 · BURIAL · the cemetery, sideways ═════════════ */
  const track = $('#buTrack'), buBar = $('#buBar');
  if (G) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      let thud = false;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.bu-pin', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            buBar.style.width = (self.progress * 100) + '%';
            gsap.to('.plot', { skewX: clamp(self.getVelocity() / -400, -6, 6), duration: .4, overwrite: 'auto' });
            if (self.progress > .97 && !thud) { thud = true; DA.beep(65, .6, .1); }
            if (self.progress < .9) thud = false;
          },
        },
      });
      // each plot rises out of the ground as it reaches the middle
      $$('.plot').forEach((p) => gsap.from(p, { yPercent: 18, opacity: .3, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 95%', end: 'left 55%', scrub: true } }));
      return () => gsap.set('.plot', { skewX: 0 });
    });
    mm.add('(max-width: 760px)', () => {
      $$('.plot').forEach((p) => gsap.from(p, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%' } }));
    });
  }

  /* ═════════════ 04 · VIKING · the factory reset, on fire ═════════════ */
  const vk = $('#viking'), fire = $('#vkFire'), lines = $$('#vkLines p'), items = $$('#phList li'), phBar = $('#phBar'), phPc = $('#phPc'), hello = $('#phHello'), word = $('#phWord'), phone = $('#phone');
  const HELLO = ['hello', 'ciao', 'hola', 'bonjour', 'hallo', 'olá', 'привет', 'こんにちは', '안녕하세요', 'merhaba', 'hej'];
  let heat = .12, hi = 0, helloT = null, chimed = false;
  const vkUpdate = (p) => {
    const e = clamp(p / .78, 0, 1);
    items.forEach((li, i) => {
      const b = $('b', li), n = +b.dataset.n, l = clamp((e - i * .1) / .45, 0, 1);
      const v = Math.round(n * (1 - l));
      b.textContent = v.toLocaleString('en-US'); li.classList.toggle('is-zero', v === 0);
    });
    phBar.style.width = (e * 100) + '%'; phPc.textContent = Math.round(e * 100) + '%';
    const li = p < .12 ? 0 : p < .32 ? 1 : p < .52 ? 2 : p < .8 ? 3 : 4;
    lines.forEach((l, k) => l.classList.toggle('is-on', k === li));
    const h = clamp((p - .8) / .1, 0, 1);
    hello.style.opacity = h;
    heat = .12 + e * .88 * (1 - h * .85);
    if (G) gsap.set(phone, { x: e > .5 && h < 1 ? rand(-1, 1) * e * 3 : 0, rotate: e > .5 && h < 1 ? rand(-.4, .4) * e : 0 });
    if (h >= 1 && !helloT) {
      if (!chimed) { chimed = true; DA.chime(); }
      helloT = setInterval(() => {
        hi = (hi + 1) % HELLO.length;
        if (G) gsap.fromTo(word, { opacity: 0, filter: 'blur(8px)', y: 10 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .6, onStart: () => { word.textContent = HELLO[hi]; } });
        else word.textContent = HELLO[hi];
      }, 1500);
    } else if (h < 1 && helloT) { clearInterval(helloT); helloT = null; hi = 0; word.textContent = HELLO[0]; }
    if (p < .5) chimed = false;
  };
  if (G) ScrollTrigger.create({ trigger: '.vk-pin', pin: true, start: 'top top', end: '+=260%', scrub: true, onUpdate: (s) => vkUpdate(s.progress) });
  else vkUpdate(0);

  // the fire: embers and flames rising from the bottom edge, as hot as the reset is far along
  if (motion) {
    const fx = fire.getContext('2d'); let W = 0, H = 0, run = false;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = fire.offsetWidth; H = fire.offsetHeight; fire.width = W * d; fire.height = H * d; fx.setTransform(d, 0, 0, d, 0, 0); };
    size(); window.addEventListener('resize', size);
    const parts = [];
    const loop = () => {
      if (!run) return;
      fx.globalCompositeOperation = 'source-over'; fx.fillStyle = 'rgba(5,5,6,.28)'; fx.fillRect(0, 0, W, H);
      fx.globalCompositeOperation = 'lighter';
      const spawn = Math.round(heat * 14);
      for (let i = 0; i < spawn; i++) parts.push({ x: rand(0, W), y: H + 10, vx: rand(-.4, .4), vy: rand(-1.2, -3.6) * (0.6 + heat), r: rand(10, 38) * (0.5 + heat), life: 1, ember: Math.random() < .12 });
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i];
        q.x += q.vx + Math.sin(q.y * .02) * .6; q.y += q.vy; q.life -= q.ember ? .006 : .014 + (1 - heat) * .01;
        if (q.life <= 0) { parts.splice(i, 1); continue; }
        const L = q.life;
        if (q.ember) { fx.fillStyle = `rgba(255,${(180 * L) | 0},120,${L})`; fx.fillRect(q.x, q.y, 2, 2); continue; }
        const g = fx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r);
        g.addColorStop(0, `rgba(255,${(90 + 120 * L) | 0},40,${.4 * L})`);
        g.addColorStop(1, 'rgba(120,40,140,0)');
        fx.fillStyle = g; fx.beginPath(); fx.arc(q.x, q.y, q.r, 0, 7); fx.fill();
      }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !run) { run = true; size(); requestAnimationFrame(loop); } else if (!e.isIntersecting) run = false; }).observe(vk);
  }

  /* ═════════════ 05 · WHICH GOODBYE ═════════════ */
  const wqForm = $('#wqForm'), wqRes = $('#wqRes'), wqWhy = $('#wqWhy');
  const ANSWERS = {
    burial: ["Burial", "You'll want to visit. Pick a plot you can find again, but not too easily."],
    cremation: ['Cremation', "It's yours and you're done with it. One key, no ceremony needed. We'll do one anyway."],
    viking: ['Viking', 'When other people are in it, deleting one thing is never enough. Set the whole thing adrift.'],
  };
  const decide = () => {
    const v = Object.fromEntries(new FormData(wqForm));
    const n = Object.keys(v).length;
    if (n < 3) { wqRes.textContent = '—'; wqWhy.textContent = `${n} of 3 answered. Take your time. We are open all night.`; return; }
    const k = v.q1 === 'yes' ? 'burial' : v.q2 === 'yes' ? 'viking' : 'cremation';
    const [name, why] = ANSWERS[k];
    wqWhy.textContent = why + (v.q3 === 'yes' ? " Also: it's late. Book it tomorrow. We'll still be here." : '');
    if (wqRes.textContent !== name) {
      wqRes.textContent = name;
      if (G) gsap.fromTo(wqRes, { filter: 'blur(20px)', opacity: 0, letterSpacing: '.2em' }, { filter: 'blur(0px)', opacity: 1, letterSpacing: '0em', duration: 1, ease: 'expo.out' });
      DA.beep(440, .3, .03, 'triangle');
    }
    const plan = store.get('plan', {}) || {}; plan.service = k; store.set('plan', plan);
  };
  wqForm.addEventListener('change', decide);

  /* ═════════════ 06 · EXTRAS ═════════════ */
  const exList = $('#exList'), exN = $('#exN'), exT = $('#exT');
  let extras = store.get('extras', []);
  const exShow = () => {
    let t = 0;
    $$('li', exList).forEach((li) => {
      const on = extras.includes(li.dataset.id);
      li.classList.toggle('is-added', on);
      $('.ex-add', li).textContent = on ? 'added ✓' : 'add +';
      if (on) t += +li.dataset.p;
    });
    exN.textContent = extras.length; exT.textContent = '$' + t;
  };
  exShow();
  exList.addEventListener('click', (e) => {
    const b = e.target.closest('.ex-add'); if (!b) return;
    const id = b.parentElement.dataset.id;
    extras = extras.includes(id) ? extras.filter((x) => x !== id) : [...extras, id];
    store.set('extras', extras); exShow();
    DA.beep(extras.includes(id) ? 880 : 440, .12, .03);
    if (G) gsap.fromTo('#exSum', { scale: 1.02 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' });
  });
  if (G) gsap.from('.ex-list li', { y: 24, opacity: 0, duration: .7, ease: 'power3.out', stagger: .05, scrollTrigger: { trigger: exList, start: 'top 80%' } });

  /* ═════════════ 07 · FAQ · smooth open and close ═════════════ */
  $$('.faq details').forEach((d) => {
    const s = $('summary', d), a = $('.faq-a', d);
    s.addEventListener('click', (e) => {
      if (!G) return;
      e.preventDefault();
      if (d.open) gsap.to(a, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(a, { clearProps: 'height' }); } });
      else { d.open = true; gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: .6, ease: 'power3.out', clearProps: 'height' }); gsap.from($('p', a), { y: 14, opacity: 0, filter: 'blur(6px)', duration: .6 }); DA.beep(700, .08, .02); }
    });
  });

  /* ═════════════ titles and the cta come into focus ═════════════ */
  if (G) {
    $$('.sec-title, .bu-title, .vk-title').forEach((t) => gsap.from(t, { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));
    gsap.fromTo('.sv-cta-t span', { filter: 'blur(20px)', opacity: .2 }, { filter: 'blur(0px)', opacity: 1, stagger: .2, ease: 'none', scrollTrigger: { trigger: '.sv-cta', start: 'top 85%', end: 'center 55%', scrub: true } });
    gsap.from('.faq details', { y: 30, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.faq-list', start: 'top 80%' } });
  }
})();
