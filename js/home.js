/* ═══════════════════════════════════════════════════════════
   DEAD AIR · home
   the focus-pull title, the order-of-service board, the manifesto,
   cremation / burial / viking, obituaries & candles, a moment of silence,
   the crow, the florist, the guestbook, the headstone
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));

  /* ---------- dates ---------- */
  const now = new Date();
  const longDate = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
  $('#todayDate').textContent = longDate;
  $('#obitsDate').textContent = longDate;
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  $('#svcNo').textContent = String(doy).padStart(4, '0');

  /* ═════════════ 01 · HERO ═════════════ */
  // every letter is its own lens
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = '';
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; l.appendChild(s); chars.push(s); });
  });

  // tv static, very quiet, behind everything
  const st = $('#static');
  if (st && motion) {
    const sx = st.getContext('2d'); st.width = 360; st.height = 220;
    const img = sx.createImageData(360, 220);
    let vis = true, last = 0;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(st);
    const draw = (t) => {
      requestAnimationFrame(draw);
      if (!vis || t - last < 70) return; last = t;
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      sx.putImageData(img, 0, 0);
    };
    requestAnimationFrame(draw);
  }

  const hero = $('#hero');
  onReady(() => {
    if (!G) return;
    const tl = gsap.timeline();
    tl.fromTo(chars, { '--b': '40px', yPercent: 30, opacity: 0, scaleY: 1.4 }, { '--b': '0px', yPercent: 0, opacity: 1, scaleY: 1, duration: 1.6, ease: 'expo.out', stagger: { each: .07, from: 'random' } })
      .from('.ht--ghost', { opacity: 0, duration: 2 }, '<.3')
      .from('.hero-meta > span', { y: -20, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out' }, '<')
      .from('.hero-lily', { opacity: 0, scale: 1.15, filter: 'blur(20px)', duration: 2, ease: 'power2.out' }, '<.1')
      .from('.hero-frame', { y: -260, rotate: -18, opacity: 0, duration: 1.4, ease: 'back.out(1.3)' }, '<.4')
      .fromTo('.hero-script', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, '<.4')
      .from('.hero-foot > *', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '<.2');

    // scrolling away: the name goes out of focus, like a memory
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-title', { scale: 1.2, filter: 'blur(18px)', opacity: .25, transformOrigin: '30% 60%', ease: 'none' })
      .to('.hero-frame', { yPercent: -80, rotate: 8, ease: 'none' }, 0)
      .to('.hero-lily', { yPercent: 30, rotate: -10, ease: 'none' }, 0)
      .to('.hero-script', { xPercent: 30, opacity: 0, ease: 'none' }, 0);
  });

  // the focus pull: letters near the crosshair are sharp, the rest drift out of focus
  if (G && !touch) {
    const ghost = $('.ht--ghost'), depth = $$('[data-depth]', hero);
    let mx = -9999, my = -9999, inside = false, raf = 0;
    const blur = chars.map(() => 0);
    hero.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; inside = true; if (!raf) raf = requestAnimationFrame(lens); });
    hero.addEventListener('pointerleave', () => { inside = false; if (!raf) raf = requestAnimationFrame(lens); });
    function lens() {
      raf = 0; let moving = false;
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const target = inside ? clamp((d - r.width * .45) / 70, 0, 9) : 0;
        blur[i] += (target - blur[i]) * .16;
        if (Math.abs(target - blur[i]) > .05) moving = true;
        c.style.setProperty('--b', blur[i].toFixed(2) + 'px');
      });
      const nx = (mx / innerWidth - .5), ny = (my / innerHeight - .5);
      if (inside) {
        ghost.style.setProperty('--gx', (12 - nx * 60).toFixed(1) + 'px');
        ghost.style.setProperty('--gy', (18 - ny * 40).toFixed(1) + 'px');
        depth.forEach((el) => { const k = +el.dataset.depth; el.style.translate = `${(nx * k).toFixed(1)}px ${(ny * k).toFixed(1)}px`; });
      }
      if (moving) raf = requestAnimationFrame(lens);
    }
  }

  /* ═════════════ 02 · ORDER OF SERVICE ═════════════ */
  const SERVICES = [
    ['09:00', "jess's first profile · 2006–2011", 'burial', 'chapel a'],
    ['10:30', 'group chat "girls trip 2019 🌴"', 'cremation', 'chapel b'],
    ['12:00', 'save file 03 · 112 hrs', 'viking', 'the dock'],
    ['14:15', 'blog "midnight-thoughts" · 2008–2013', 'burial', 'chapel a'],
    ['16:00', 'season 3 (never made)', 'memorial', 'screening rm'],
    ['18:30', 'a virtual pet named biscuit', 'cremation', 'the garden'],
    ['21:00', 'every photo on a phone left in a taxi', 'burial', 'chapel b'],
    ['23:45', 'drafts folder (2,301 unsent)', 'viking', 'the dock'],
  ];
  const board = $('#board');
  const status = (hhmm, i) => {
    if (i === 6) return ['late', 'delayed · buffering'];
    const [h, m] = hhmm.split(':').map(Number), d = new Date(); const t = h * 60 + m, n = d.getHours() * 60 + d.getMinutes();
    if (n < t - 30) return ['wait', 'scheduled'];
    if (n < t) return ['wait', 'doors open'];
    if (n < t + 75) return ['live', 'in progress'];
    return ['done', 'concluded'];
  };
  const rows = SERVICES.map((s, i) => {
    const r = document.createElement('div'); r.className = 'board-row'; r.setAttribute('role', 'row');
    const [k, label] = status(s[0], i);
    r.innerHTML = `<span role="cell" class="fx">${s[0]}</span><span role="cell" class="board-name fx">${s[1]}</span><span role="cell" class="fx">${s[2]}</span><span role="cell" class="fx">${s[3]}</span><span role="cell"><span class="st st--${k}"><i></i><span class="fx">${label}</span></span></span>`;
    board.appendChild(r); return r;
  });

  // split-flap: every cell shuffles before it settles
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·:/—';
  const flap = (el, delay = 0) => {
    const fin = el.dataset.fin || (el.dataset.fin = el.textContent);
    if (!motion) { el.textContent = fin; return; }
    const chars = [...fin]; let f = 0;
    const tick = () => {
      f++;
      el.textContent = chars.map((c, i) => (c === ' ' || f > i * .7 + 6 + Math.random() * 4 ? c : POOL[(Math.random() * POOL.length) | 0])).join('');
      if (f < chars.length * .7 + 12) setTimeout(tick, 38); else el.textContent = fin;
    };
    setTimeout(tick, delay);
  };
  let flapped = false;
  const flapAll = () => rows.forEach((r, i) => $$('.fx', r).forEach((c, j) => flap(c, i * 110 + j * 60)));
  new IntersectionObserver(([e], o) => { if (e.isIntersecting && !flapped) { flapped = true; flapAll(); DA.noise(.6, 2400, .02); o.disconnect(); } }, { threshold: .3 }).observe(board);
  // the clock, and statuses that change while you watch
  const clock = $('#todayClock');
  const tickClock = () => {
    const d = new Date(); clock.textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (d.getSeconds() === 0) rows.forEach((r, i) => {
      const [k, label] = status(SERVICES[i][0], i), st = $('.st', r), fx = $('.fx', st);
      if (fx.dataset.fin !== label) { st.className = 'st st--' + k; fx.dataset.fin = label; fx.textContent = label; flap(fx); }
    });
  };
  tickClock(); setInterval(tickClock, 1000);

  /* ═════════════ 03 · MANIFESTO ═════════════ */
  const mani = $('#maniTxt');
  [...mani.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s); }
      });
      n.replaceWith(frag);
    } else n.classList.add('w');
  });
  if (G) {
    gsap.fromTo($$('.w', mani), { '--b': '14px', '--o': .1 }, {
      '--b': '0px', '--o': 1, ease: 'none', stagger: .08,
      scrollTrigger: { trigger: mani, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
    $$('.tp').forEach((t, i) => {
      gsap.fromTo(t, { yPercent: 0 }, { y: (i % 2 ? -1 : 1) * rand(30, 70), rotate: `+=${rand(-4, 4)}`, ease: 'none', scrollTrigger: { trigger: '#mani', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(t, { scaleX: 0, transformOrigin: 'left', duration: .9, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 90%' } });
    });
  }
  $$('.count').forEach((c) => {
    const to = +c.dataset.to;
    if (!G) { c.textContent = to.toLocaleString('en-US'); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 85%' }, onUpdate: () => { c.textContent = Math.round(o.v).toLocaleString('en-US'); } });
  });

  /* ═════════════ 04 · SERVICES ═════════════ */
  if (G) gsap.fromTo('.card', { y: 120, rotateX: -18, opacity: 0, transformPerspective: 900 }, { y: 0, rotateX: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .14, clearProps: 'transform', scrollTrigger: { trigger: '.svc-grid', start: 'top 80%' } });

  // CREMATION · the file turns to ash, pixel by pixel, from the bottom up
  const cremCard = $('.card--cremation'), ashC = $('.ash', cremCard);
  const ash = { p: 0, parts: [], w: 0, h: 0, run: false };
  const ashBuild = () => {
    const r = ashC.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    ash.w = r.width; ash.h = r.height; ashC.width = r.width * d; ashC.height = r.height * d;
    const x = ash.x = ashC.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    // draw the file once, offscreen, then sample it
    const o = document.createElement('canvas'); o.width = Math.ceil(r.width); o.height = Math.ceil(r.height);
    const ox = o.getContext('2d'); const W = r.height * .42, H = W * 1.25, L = (r.width - W) / 2, T = (r.height - H) / 2 - 12;
    ox.fillStyle = '#ece8ef';
    ox.beginPath(); ox.moveTo(L, T); ox.lineTo(L + W * .68, T); ox.lineTo(L + W, T + W * .32); ox.lineTo(L + W, T + H); ox.lineTo(L, T + H); ox.closePath(); ox.fill();
    ox.fillStyle = '#0b0b0c';
    for (let i = 0; i < 6; i++) ox.fillRect(L + W * .14, T + H * (.36 + i * .1), W * (i === 5 ? .4 : .72), Math.max(2, H * .035));
    ox.fillStyle = '#b9b5be'; ox.beginPath(); ox.moveTo(L + W * .68, T); ox.lineTo(L + W * .68, T + W * .32); ox.lineTo(L + W, T + W * .32); ox.fill();
    ash.label = T + H + 24;
    const data = ox.getImageData(0, 0, o.width, o.height).data, step = 3;
    ash.parts = [];
    for (let y = 0; y < o.height; y += step) for (let xx = 0; xx < o.width; xx += step) {
      const k = (y * o.width + xx) * 4; if (data[k + 3] < 128) continue;
      const v = data[k];
      ash.parts.push({ hx: xx, hy: y, c: v > 128 ? 236 : 20, dx: rand(-40, 40), dy: rand(60, 170), wob: rand(0, 6.28), delay: (1 - y / o.height) * .75 + rand(0, .18), s: step });
    }
    ashDraw();
  };
  const ashDraw = () => {
    const { x, w, h, parts, p } = ash; if (!x) return;
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center'; x.font = '500 11px "DM Mono", monospace';
    if (p < .4) { x.fillStyle = `rgba(236,232,239,${1 - p * 2.5})`; x.fillText('draft_final_v3(2).doc', w / 2, ash.label); }
    if (p > .9) { x.fillStyle = 'rgba(207,166,217,' + ((p - .9) * 10 * .8).toFixed(2) + ')'; x.font = '500 12px "DM Mono", monospace'; x.textAlign = 'center'; x.fillText('0 KB · nothing left', w / 2, h / 2); }
    for (const q of parts) {
      const l = clamp((p * 1.9 - q.delay) / .7, 0, 1);
      if (l >= 1) continue;
      const e = l * l;
      const px = q.hx + q.dx * e + Math.sin(q.wob + l * 9) * 6 * l, py = q.hy - q.dy * e;
      if (l > 0 && l < .22) x.fillStyle = `rgba(255,${(150 + l * 400) | 0},90,${1 - l})`; // the burning edge
      else if (l > 0) x.fillStyle = `rgba(160,155,165,${(1 - l) * .9})`; // ash
      else x.fillStyle = q.c > 100 ? '#ece8ef' : '#0b0b0c';
      const s = l > 0 ? q.s * (1 - l * .6) : q.s;
      x.fillRect(px, py, s, s);
    }
  };
  if (ashC) {
    ashBuild(); window.addEventListener('resize', ashBuild);
    document.fonts?.ready.then(ashBuild);
    let tw;
    const burn = (on) => {
      if (!hasGsap || !motion) { ash.p = on ? 1 : 0; ashDraw(); return; }
      tw?.kill();
      if (on) DA.noise(1.4, 500, .05, 3000);
      tw = gsap.to(ash, { p: on ? 1 : 0, duration: on ? 2.2 : 1.3, ease: on ? 'power1.in' : 'power2.out', onUpdate: ashDraw });
    };
    cremCard.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && burn(true));
    cremCard.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && burn(false));
    cremCard.addEventListener('focus', () => burn(true)); cremCard.addEventListener('blur', () => burn(false));
    cremCard.addEventListener('click', () => { const on = !cremCard.classList.contains('is-on'); cremCard.classList.toggle('is-on', on); burn(on); });
  }

  // BURIAL · the folder sinks (css) and the earth closes over it with a thud
  const burCard = $('.card--burial');
  burCard.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setTimeout(() => burCard.matches(':hover') && DA.beep(70, .5, .09, 'sine'), 900); });
  burCard.addEventListener('click', () => { burCard.classList.toggle('is-on'); if (burCard.classList.contains('is-on')) setTimeout(() => DA.beep(70, .5, .09), 900); });

  // VIKING · erase all content and settings, then: hello
  const vikCard = $('.card--viking');
  let vt;
  const sail = (on) => {
    vt?.kill();
    const bar = $('.reset-bar i', vikCard), pc = $('.reset-pc', vikCard), hello = $('.reset-hello', vikCard);
    if (!hasGsap) return;
    if (!on) { vt = gsap.timeline().to(hello, { opacity: 0, duration: .3 }).to(bar, { width: '0%', duration: .4 }, 0).add(() => { pc.textContent = '0%'; }); return; }
    const o = { v: parseFloat(bar.style.width) || 0 };
    vt = gsap.timeline()
      .to(o, { v: 100, duration: motion ? 2.4 : .01, ease: 'power1.inOut', onUpdate: () => { bar.style.width = o.v + '%'; pc.textContent = Math.round(o.v) + '%'; } })
      .add(() => DA.chime())
      .fromTo(hello, { opacity: 0, scale: 1.3, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' })
      .fromTo($('.card-art', vikCard), { x: -4 }, { x: 0, duration: .4, ease: 'elastic.out(2, .2)' }, '<');
  };
  vikCard.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && sail(true));
  vikCard.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && sail(false));
  vikCard.addEventListener('focus', () => sail(true)); vikCard.addEventListener('blur', () => sail(false));
  vikCard.addEventListener('click', () => { const on = !vikCard.classList.contains('is-on'); vikCard.classList.toggle('is-on', on); sail(on); });

  /* ═════════════ 05 · OBITUARIES ═════════════ */
  // photos load like it's 2006: tile by tile
  $$('.tiles').forEach((s) => {
    if (!G) return;
    const cols = 6, rows = 8, tiles = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const t = document.createElement('i'); t.className = 'tile';
      Object.assign(t.style, { left: (c / cols * 100) + '%', top: (r / rows * 100) + '%', width: (100 / cols + .5) + '%', height: (100 / rows + .5) + '%' });
      s.appendChild(t); tiles.push(t);
    }
    gsap.to(tiles, { opacity: 0, duration: .01, stagger: { each: .025, from: 'random' }, scrollTrigger: { trigger: s, start: 'top 82%' } });
  });
  if (G) {
    gsap.from('.obits-title', { letterSpacing: '.3em', filter: 'blur(20px)', opacity: 0, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.obits-hd', start: 'top 80%' } });
    gsap.from('.obit > :not(.slot)', { y: 26, opacity: 0, duration: .9, ease: 'power3.out', stagger: .04, scrollTrigger: { trigger: '.obits-grid', start: 'top 75%' } });
  }

  // candles: a small fake crowd, plus yours
  const BASE = { blog: 1312, chat: 214, save: 64, pet: 3 };
  const NAMES = { blog: 'midnight-thoughts.blog', chat: 'girls trip 2019', save: 'save file 03 (and pancake)', pet: 'biscuit' };
  const lit = store.get('candles', {});
  $$('.obit').forEach((o) => {
    const id = o.dataset.id, btn = $('.candle', o), n = $('b', btn);
    const show = () => { n.textContent = (BASE[id] + (lit[id] || 0)).toLocaleString('en-US'); btn.classList.toggle('is-lit', !!lit[id]); };
    show();
    btn.addEventListener('click', () => {
      lit[id] = (lit[id] || 0) + 1; store.set('candles', lit); show();
      DA.chime(); DA.toast(`a candle is lit for ${NAMES[id]}.`);
      if (G) gsap.fromTo(n, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(3)' });
    });
  });

  /* ═════════════ 06 · A MOMENT OF SILENCE ═════════════ */
  const silence = $('#silence'), hold = $('#hold'), prog = $('.hold-prog'), respectsEl = $('#respects');
  const ecg = new DA.Ecg($('#silenceEcg'), { color: '#cfa6d9', lw: 1.6, speed: .33, bpm: 64, onBeat: (a) => holding && DA.beep(1000, .07, .03 * a) });
  new IntersectionObserver(([e]) => (e.isIntersecting ? ecg.start() : ecg.stop())).observe(silence);
  respectsEl.textContent = DA.respects().toLocaleString('en-US');
  window.addEventListener('da:respect', (e) => {
    respectsEl.textContent = e.detail.toLocaleString('en-US');
    if (G) gsap.fromTo(respectsEl, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .5 });
  });
  const thanks = document.createElement('p'); thanks.className = 'silence-thanks'; thanks.textContent = 'thank you.'; thanks.setAttribute('aria-hidden', 'true'); silence.appendChild(thanks);
  let holding = false, ht = null;
  const startHold = (e) => {
    if (e) e.preventDefault();
    if (holding) return; holding = true;
    document.body.classList.add('hushed'); DA.duck(true); DA.audio();
    hold.setPointerCapture?.(e?.pointerId);
    ht?.kill();
    const rem = parseFloat(getComputedStyle(prog).strokeDashoffset) / 352;
    ht = gsap.timeline({ onComplete: done })
      .to(prog, { strokeDashoffset: 0, duration: 5 * rem, ease: 'none' })
      .to(ecg, { amp: 0, bpm: 34, duration: 5 * rem, ease: 'power1.in' }, 0);
  };
  const endHold = () => {
    if (!holding) return; holding = false;
    document.body.classList.remove('hushed'); DA.duck(false);
    ht?.kill();
    ht = gsap.timeline().to(prog, { strokeDashoffset: 352, duration: .8, ease: 'power2.out' }).to(ecg, { amp: 1, bpm: 64, duration: .8 }, 0);
  };
  function done() {
    holding = false;
    DA.flatline(1.8); DA.payRespects(true);
    gsap.timeline()
      .fromTo(thanks, { opacity: 0, filter: 'blur(20px)', scale: 1.1 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'expo.out' })
      .to(thanks, { opacity: 0, filter: 'blur(14px)', duration: 1.2, delay: 1.2 })
      .add(() => { document.body.classList.remove('hushed'); DA.duck(false); })
      .to(prog, { strokeDashoffset: 352, duration: .6 }, '<')
      .to(ecg, { amp: 1, bpm: 64, duration: 1.5 }, '<');
  }
  if (hasGsap) {
    hold.addEventListener('pointerdown', startHold);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => hold.addEventListener(ev, endHold));
    hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(e); });
    hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') endHold(); });
    hold.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  if (G) gsap.from('.silence-title', { filter: 'blur(24px)', opacity: 0, y: 40, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: silence, start: 'top 60%' } });

  /* ═════════════ 07 · THE HOUSE ═════════════ */
  if (G) {
    $$('.dir-frame').forEach((f, i) => {
      gsap.from(f, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut', delay: i * .12, scrollTrigger: { trigger: '.house-grid', start: 'top 75%' } });
      gsap.from($('.slot', f), { scale: 1.3, duration: 1.8, ease: 'expo.out', delay: i * .12 + .3, scrollTrigger: { trigger: '.house-grid', start: 'top 75%' } });
    });
    gsap.from('.crow', { x: 200, y: -160, rotate: 30, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.dir--crow', start: 'top 85%' } });
  }
  const CAW = ['caw.', 'caw. (it found a usb stick)', 'CAW.', 'caw caw. (he wants your earring)', '…caw?', 'caw. (that one bit a ceo)', 'caw. (do not log off)'];
  const crow = $('#crow'), say = $('#crowSay'); let ci = 0, ct;
  crow.addEventListener('click', () => {
    say.textContent = CAW[ci++ % CAW.length]; crow.classList.add('is-talking');
    DA.noise(.22, 1300, .11, 700); setTimeout(() => DA.noise(.18, 1200, .08, 650), 260);
    if (G) gsap.fromTo($('.slot', crow), { y: 0 }, { y: -26, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' });
    clearTimeout(ct); ct = setTimeout(() => crow.classList.remove('is-talking'), 2400);
  });

  /* ═════════════ 08 · FLORIST ═════════════ */
  if (G) {
    gsap.from('.bq', { y: 80, rotate: (i) => (i % 2 ? 6 : -6), opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.flor-row', start: 'top 80%' } });
    $$('.bq').forEach((b) => b.addEventListener('pointerenter', () => {
      const r = b.getBoundingClientRect();
      for (let i = 0; i < 9; i++) {
        const p = document.createElement('i'); p.className = 'petal';
        p.style.background = Math.random() > .5 ? 'var(--lilac)' : '#fff'; p.style.boxShadow = '0 0 0 1px rgba(0,0,0,.06)';
        document.body.appendChild(p);
        gsap.fromTo(p, { x: r.left + rand(.2, .8) * r.width, y: r.top + rand(.1, .4) * r.height, rotate: rand(0, 360), opacity: 1 }, {
          x: `+=${rand(-80, 80)}`, y: `+=${rand(160, 320)}`, rotate: `+=${rand(-300, 300)}`, opacity: 0, duration: rand(1.4, 2.4), ease: 'power1.in', onComplete: () => p.remove(),
        });
      }
    }));
  }

  /* ═════════════ 09 · GUESTBOOK ═════════════ */
  const EMO = { '(L)': '❤', '(F)': '🌹', ":'(": '😢', '(K)': '💋', ':)': '🙂', '(S)': '🌙', '(*)': '⭐', '(U)': '💔' };
  const emo = (t) => t.replace(/\(L\)|\(F\)|:'\(|\(K\)|:\)|\(S\)|\(\*\)|\(U\)/g, (m) => `<span class="emo">${EMO[m]}</span>`);
  const MSGS = [
    ['✿ lil_sparkle_xo ✿', '#b0479b', 'rest easy midnight-thoughts (L) u got me through 8th grade'],
    ['~*DaRkAnGeL*~', '#4b3a8c', "i still know the password. i won't use it :'("],
    ['mark', '#2f6bff', 'who added me to this'],
    ['jess ♡', '#b0479b', 'thank you for the service. the lilies were perfect (F)'],
    ['pancake_fan_04', '#2d7a4f', 'PANCAKE (U) (U) (U)'],
    ['mom', '#8a5a00', 'is this the funeral for the computer? I brought a casserole'],
    ['xX_brb_Xx', '#4b3a8c', 'brb. forever (S)'],
    ['vera vale', '#8e5b92', 'the family thanks you all for coming (*)'],
  ];
  const log = $('#gbLog'), typingEl = $('#gbTyping'), win = $('#gbWin');
  let mi = 0, gbOn = false, gbT;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const addMsg = (who, col, txt, sys) => {
    const m = document.createElement('p'); m.className = 'msg';
    m.innerHTML = sys ? `<span class="msg-who" style="font-style:italic">${esc(txt)}</span>` : `<span class="msg-who"><b style="--c:${col}">${esc(who)}</b> says:</span><span class="msg-txt">${emo(esc(txt))}</span>`;
    log.appendChild(m);
    while (log.children.length > 6) log.firstElementChild.remove();
    if (G) gsap.from(m, { y: 14, opacity: 0, duration: .4, ease: 'power2.out' });
  };
  const nextMsg = () => {
    if (!gbOn) return;
    const [who, col, txt] = MSGS[mi++ % MSGS.length];
    $('span', typingEl).textContent = `${who} is typing…`; typingEl.classList.add('is-on');
    gbT = setTimeout(() => { typingEl.classList.remove('is-on'); addMsg(who, col, txt); DA.beep(1568, .08, .015); gbT = setTimeout(nextMsg, 1600); }, motion ? 1300 : 0);
  };
  // the first three are already there
  MSGS.slice(0, 3).forEach((m) => addMsg(...m)); mi = 3;
  new IntersectionObserver(([e]) => { gbOn = e.isIntersecting; clearTimeout(gbT); if (gbOn) gbT = setTimeout(nextMsg, 900); }, { threshold: .35 }).observe(win);
  $('#gbNudge').addEventListener('click', () => {
    win.classList.remove('is-nudged'); void win.offsetWidth; win.classList.add('is-nudged');
    addMsg('', '', 'you have just sent a nudge.', true);
    const a = DA.audio(); if (a && !DA.muted) [0, 120, 240].forEach((t) => setTimeout(() => DA.beep(90, .1, .12, 'square'), t));
    setTimeout(() => win.classList.remove('is-nudged'), 700);
  });
  if (G) gsap.from(win, { y: 60, rotate: 3, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#guestbook', start: 'top 70%' } });

  /* ═════════════ 10 · PLAN · the headstone ═════════════ */
  const stone = $('#stone'), form = $('#planForm');
  const f = { name: $('#pName'), from: $('#pFrom'), to: $('#pTo') };
  const draft = store.get('plan', null);
  if (draft) { f.name.value = draft.name || f.name.value; f.from.value = draft.from || f.from.value; f.to.value = draft.to || f.to.value; const r = form.querySelector(`input[value="${draft.ep}"]`); if (r) r.checked = true; }
  let ct2;
  const carve = () => {
    const ep = form.querySelector('input[name="ep"]:checked').value;
    $('#sName').textContent = f.name.value.trim() || '—';
    $('#sYrs').textContent = `${f.from.value || '?'} — ${f.to.value || '?'}`;
    $('#sEp').textContent = ep;
    stone.classList.remove('is-carving'); void stone.offsetWidth; stone.classList.add('is-carving');
    clearTimeout(ct2); ct2 = setTimeout(() => DA.noise(.08, 3200, .03), 60);
    store.set('plan', { name: f.name.value, from: f.from.value, to: f.to.value, ep });
  };
  form.addEventListener('input', carve);
  carve(); stone.classList.remove('is-carving');
  form.addEventListener('submit', (e) => { e.preventDefault(); carve(); DA.go('plan.html'); });
  // the stone leans toward you
  if (G && !touch) {
    const wrap = $('.stone-wrap');
    wrap.addEventListener('pointermove', (e) => {
      const r = stone.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      gsap.to(stone, { rotateY: nx * 16, rotateX: -ny * 12, duration: .6, ease: 'power2.out' });
    });
    wrap.addEventListener('pointerleave', () => gsap.to(stone, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
  }
  if (G) gsap.from(stone, { y: 200, rotate: 6, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#plan', start: 'top 70%' } });

  /* ═════════════ FOOTER · comes into focus ═════════════ */
  if (G) gsap.fromTo('.ftr-big span', { '--b': '18px' }, { '--b': '0px', ease: 'none', stagger: .2, scrollTrigger: { trigger: '.ftr', start: 'top 90%', end: 'top 25%', scrub: true } });

  /* ═════════════ section titles: out of focus → in focus ═════════════ */
  if (G) $$('.sec-title').forEach((t) => gsap.from(t, { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));
})();
