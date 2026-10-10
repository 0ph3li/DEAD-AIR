/* ═══════════════════════════════════════════════════════════
   DEAD AIR · shared
   smooth scroll, header, menu, the heart monitor, loader & page wipe,
   image slots, cursor, toast, chapel organ, respects, easter eggs
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const DA = window.DA = {
    $, $$,
    // ?still in the address = no motion, every animation already finished (for screenshots and the reel)
    motion: !matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]still\b/.test(location.search),
    hasGsap: typeof window.gsap !== 'undefined',
    touch: matchMedia('(hover: none)').matches,
  };
  if (!DA.motion) document.documentElement.classList.add('still');
  if (DA.hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // every visit starts at the door
  if (DA.hasGsap && window.ScrollTrigger) ScrollTrigger.clearScrollMemory('manual');
  else if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  const store = {
    get(k, d) { try { const v = localStorage.getItem('da-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('da-' + k, JSON.stringify(v)); } catch (e) { /* private window: fine */ } },
  };
  DA.store = store;

  /* ---------- smooth scroll ---------- */
  if (DA.motion && window.Lenis && DA.hasGsap) {
    const lenis = DA.lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (document.body.classList.contains('is-loading')) lenis.stop();
  }
  DA.scrollTo = (target) => {
    if (DA.lenis) DA.lenis.scrollTo(target, { duration: 1.6 });
    else (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : $(target).scrollIntoView({ behavior: 'smooth' }));
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); DA.scrollTo(id);
  }));

  /* ---------- header: hides going down, comes back going up ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!document.body.classList.contains('menu-open')) {
      if (y > 240 && y > lastY + 2) hdr.classList.add('is-hidden');
      else if (y < lastY - 2 || y < 240) hdr.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a, .menu-list a').forEach((a) => { if (a.getAttribute('href') === here) a.classList.add('is-here'); });

  /* ---------- menu ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    if (DA.lenis) open ? DA.lenis.stop() : DA.lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });

  /* ═════════════ THE HEART MONITOR ═════════════
     a sweeping ECG trace on a canvas. amp 1 = alive, amp 0 = flatline.
     used by the loader, the page wipe and the moment of silence */
  const gauss = (t, c, s) => Math.exp(-(((t - c) / s) ** 2));
  const beat = (t) => .12 * gauss(t, .14, .025) - .16 * gauss(t, .225, .008) + gauss(t, .245, .009) - .32 * gauss(t, .265, .009) + .24 * gauss(t, .46, .04);
  DA.Ecg = class {
    constructor(canvas, o = {}) {
      this.c = canvas; this.x = canvas.getContext('2d');
      this.color = o.color || '#cfa6d9'; this.lw = o.lw || 2; this.speed = o.speed || .42; // screens per second
      this.amp = o.amp ?? 1; this.bpm = o.bpm || 68; this.onBeat = o.onBeat || null;
      this.phase = 0; this.head = 0; this.buf = []; this.run = false; this.lastBeat = 0;
      this.resize(); window.addEventListener('resize', () => this.resize());
    }
    resize() {
      const r = this.c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
      this.c.width = this.w * d; this.c.height = this.h * d; this.x.setTransform(d, 0, 0, d, 0, 0);
      this.n = Math.ceil(this.w / 2); this.buf = new Array(this.n).fill(0); this.head = 0;
    }
    start() { if (this.run) return; this.run = true; this.t0 = performance.now(); const loop = (t) => { if (!this.run) return; this.step(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    stop() { this.run = false; }
    step(t) {
      const dt = Math.min(.05, (t - this.t0) / 1000); this.t0 = t;
      const adv = this.n * this.speed * dt;
      for (let i = 0; i < adv; i++) {
        this.phase += (this.bpm / 60) * (dt / adv);
        if (this.phase >= 1) { this.phase -= 1; }
        const p = this.phase;
        if (p > .245 && this.lastBeat < .245 && this.amp > .05 && this.onBeat) this.onBeat(this.amp);
        this.lastBeat = p;
        this.buf[Math.floor(this.head) % this.n] = beat(p) * this.amp + (Math.random() - .5) * .012;
        this.head = (this.head + 1) % this.n;
      }
      this.draw();
    }
    draw() {
      const { x, w, h, n } = this; const mid = h * .58, A = h * .46, gap = 10;
      x.clearRect(0, 0, w, h);
      x.lineWidth = this.lw; x.lineJoin = 'round'; x.strokeStyle = this.color;
      x.shadowColor = this.color; x.shadowBlur = 10;
      x.beginPath();
      let pen = false;
      for (let i = 0; i < n; i++) {
        const ahead = (i - this.head + n) % n;
        if (ahead < gap) { pen = false; continue; }
        const px = i * 2, py = mid - this.buf[i] * A;
        pen ? x.lineTo(px, py) : x.moveTo(px, py); pen = true;
        if (i === n - 1) pen = false;
      }
      x.stroke();
      // the bright dot at the head
      const hi = (this.head - 1 + n) % n;
      x.fillStyle = '#fff'; x.beginPath(); x.arc(hi * 2, mid - this.buf[hi] * A, 2.6, 0, 7); x.fill();
      x.shadowBlur = 0;
    }
  };

  /* ═════════════ SOUND · chapel organ & small noises, all synthesised ═════════════ */
  let ac = null, master = null;
  DA.audio = () => {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ac = new AC(); master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  DA.muted = store.get('muted', false);
  DA.beep = (f = 1000, d = .09, vol = .05, type = 'sine') => {
    if (DA.muted) return; const a = DA.audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(master); o.start(t); o.stop(t + d + .05);
  };
  DA.flatline = (d = 1.6) => {
    if (DA.muted) return; const a = DA.audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = 'sine'; o.frequency.value = 1000;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + .02); g.gain.setValueAtTime(.045, t + d - .4); g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g).connect(master); o.start(t); o.stop(t + d + .05);
  };
  DA.noise = (d = .3, f = 900, vol = .08, sweep = 0) => {
    if (DA.muted) return; const a = DA.audio(); if (!a) return;
    const len = Math.floor(a.sampleRate * d), b = a.createBuffer(1, len, a.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    s.buffer = b; bp.type = 'bandpass'; bp.Q.value = 6; bp.frequency.setValueAtTime(f, t); if (sweep) bp.frequency.exponentialRampToValueAtTime(sweep, t + d);
    g.gain.value = vol; s.connect(bp).connect(g).connect(master); s.start(t);
  };
  DA.chime = () => { [1318.5, 1975.5].forEach((f, i) => setTimeout(() => DA.beep(f, .9, .025, 'sine'), i * 90)); };

  // the organ: four slow chords on drawbar sines, a little tremolo, a cheap echo for the nave
  const organBtn = $('#organ');
  let organ = null;
  const CHORDS = [[220, 261.6, 329.6, 110], [174.6, 220, 261.6, 87.3], [196, 246.9, 293.7, 98], [164.8, 207.7, 246.9, 82.4]];
  const organOn = () => {
    const a = DA.audio(); if (!a) return;
    const out = a.createGain(); out.gain.value = 0; out.gain.linearRampToValueAtTime(.055, a.currentTime + 2.5);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    const dl = a.createDelay(); dl.delayTime.value = .33; const fb = a.createGain(); fb.gain.value = .38;
    dl.connect(fb).connect(dl);
    const trem = a.createOscillator(), tg = a.createGain(); trem.frequency.value = 5.2; tg.gain.value = .012; trem.connect(tg).connect(out.gain); trem.start();
    lp.connect(out); lp.connect(dl); dl.connect(out); out.connect(master);
    let i = 0;
    const play = () => {
      const t = a.currentTime, ch = CHORDS[i++ % CHORDS.length];
      ch.forEach((f) => [1, 2, 3, 4].forEach((h, k) => {
        const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * h;
        const v = [.5, .28, .12, .07][k] / 4;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 1.2); g.gain.setValueAtTime(v, t + 4.2); g.gain.linearRampToValueAtTime(0, t + 5.6);
        o.connect(g).connect(lp); o.start(t); o.stop(t + 5.7);
      }));
    };
    play(); const id = setInterval(play, 4800);
    organ = { out, id, trem, a };
  };
  const organOff = () => {
    if (!organ) return; const { out, id, trem, a } = organ; organ = null;
    clearInterval(id); out.gain.cancelScheduledValues(a.currentTime); out.gain.setValueAtTime(out.gain.value, a.currentTime);
    out.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); setTimeout(() => { trem.stop(); out.disconnect(); }, 1400);
  };
  DA.duck = (on) => { if (organ) organ.out.gain.linearRampToValueAtTime(on ? .008 : .055, organ.a.currentTime + .8); };
  organBtn?.addEventListener('click', () => {
    const on = !organ;
    on ? organOn() : organOff();
    organBtn.classList.toggle('is-on', on); organBtn.setAttribute('aria-pressed', on);
    organBtn.querySelector('b').textContent = on ? 'on' : 'off';
    if (on) { DA.muted = false; store.set('muted', false); }
  });

  /* ═════════════ IMAGE SLOTS · drop a file at data-img and it shows up ═════════════ */
  function slotInit(slot) {
    if (slot.dataset.ratio) slot.style.setProperty('--ratio', slot.dataset.ratio.replace('/', ' / '));
    const src = slot.dataset.img; if (!src || slot.dataset.init) return;
    slot.dataset.init = '1';
    const img = new Image();
    img.decoding = 'async'; img.alt = slot.dataset.alt || ''; img.draggable = false;
    img.onload = () => { slot.prepend(img); slot.classList.add('has-img'); if (DA.hasGsap && window.ScrollTrigger) ScrollTrigger.refresh(); };
    img.src = src;
  }
  $$('.slot').forEach(slotInit);
  DA.slot = slotInit;

  /* ═════════════ WIPE · the loader (home) and the page transition (everywhere) ═════════════ */
  const wipe = $('#wipe'), halfT = $('.wipe-half--t'), halfB = $('.wipe-half--b'), wipeIn = $('.wipe-in');
  const ecgCanvas = $('#wipeEcg');
  const MSGS = ['lowering the lights', 'closing all tabs', 'folding the programs', 'arranging the lilies', 'clearing the cache', 'saying the name out loud', 'please be seated'];
  const ready = () => {
    document.body.classList.remove('is-loading');
    wipe.classList.remove('is-on', 'is-nav');
    if (DA.lenis) DA.lenis.start();
    window.dispatchEvent(new Event('da:ready'));
    DA.isReady = true;
  };
  const open = (delay = 0) => {
    if (!DA.hasGsap) return ready();
    gsap.timeline({ delay, onComplete: ready })
      .to(wipeIn, { opacity: 0, duration: .35 })
      .to(halfT, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<.1')
      .to(halfB, { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<');
  };

  if (!DA.motion || !DA.hasGsap) {
    ready();
  } else if (document.body.dataset.page === 'home' && document.body.classList.contains('is-loading')) {
    // the long goodbye: a heartbeat, a count to 100, a flatline, then the doors open
    wipe.classList.add('is-on');
    const ecg = new DA.Ecg(ecgCanvas, { lw: 2, speed: .5, bpm: 92 }); ecg.start();
    const seen = sessionStorage.getItem('da-seen'); try { sessionStorage.setItem('da-seen', '1'); } catch (e) {}
    const msg = $('#wipeMsg'), count = $('#wipeCount'), bar = $('#wipeBar');
    const o = { v: 0 };
    gsap.timeline()
      .from('.wipe-logo', { filter: 'blur(24px)', opacity: 0, duration: 1, ease: 'power2.out' })
      .to(o, {
        v: 100, duration: seen ? 1.3 : 2.9, ease: 'power1.inOut',
        onUpdate() {
          const v = Math.round(o.v);
          count.textContent = String(v).padStart(3, '0');
          bar.style.width = v + '%';
          msg.textContent = MSGS[Math.min(MSGS.length - 1, Math.floor(v / (100 / MSGS.length)))];
        },
      }, '<.2')
      .add(() => { msg.textContent = 'rest in peace'; })
      .to(ecg, { amp: 0, bpm: 40, duration: .6, ease: 'power2.in' })
      .to('.wipe-logo', { filter: 'blur(10px)', opacity: .2, duration: .5 }, '<')
      .add(() => open(.55));
  } else {
    // arriving from another page: the doors are closed, open them
    wipe.classList.add('is-on', 'is-nav');
    gsap.set(wipeIn, { opacity: 0 });
    open(.05);
  }

  // leaving: the doors close, one beat crosses the line, then the next page
  const isInternal = (a) => a.host === location.host && /\.html$/.test(a.pathname) && !a.hash && a.target !== '_blank';
  DA.go = (href) => {
    if (!DA.motion || !DA.hasGsap) { location.href = href; return; }
    setMenu(false);
    wipe.classList.add('is-on', 'is-nav');
    gsap.set(halfT, { yPercent: -100 }); gsap.set(halfB, { yPercent: 100 }); gsap.set(wipeIn, { opacity: 1 });
    gsap.set('.wipe-logo', { opacity: 1, filter: 'blur(0px)' });
    const ecg = new DA.Ecg(ecgCanvas, { lw: 2, speed: .9, bpm: 110 }); ecg.start();
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .to(halfT, { yPercent: 0, duration: .7, ease: 'expo.inOut' })
      .to(halfB, { yPercent: 0, duration: .7, ease: 'expo.inOut' }, '<')
      .from('.wipe-logo', { opacity: 0, filter: 'blur(14px)', duration: .4 }, '-=.2')
      .to({}, { duration: .45 });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    if (!isInternal(a) || a.pathname === location.pathname) return;
    e.preventDefault(); DA.go(a.href);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) { wipe.classList.remove('is-on', 'is-nav'); gsap?.set([halfT, halfB], { yPercent: 0 }); document.body.classList.remove('is-loading'); } });

  /* ═════════════ CURSOR · a printer's crosshair ═════════════ */
  const cur = $('#cursor'), curLbl = $('#cursorLbl');
  if (cur && !DA.touch) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; document.body.classList.add('has-cursor'); }, { passive: true });
    document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('a, button, [data-cursor], .card, input, label');
      cur.classList.toggle('is-hover', !!t);
      curLbl.textContent = t?.dataset.cursor || '';
    });
    const tick = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
    tick();
  }

  /* ═════════════ TOAST ═════════════ */
  const toastEl = $('#toast'); let toastT;
  DA.toast = (msg, ms = 3200) => {
    if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* ═════════════ RESPECTS · press F ═════════════ */
  const today = new Date().toISOString().slice(0, 10);
  // the house has been busy since midnight (a believable number, the same for everyone today)
  const baseRespects = () => { const d = new Date(); const seed = [...today].reduce((a, c) => a + c.charCodeAt(0), 0); return 180 + (seed % 90) + Math.floor((d.getHours() * 60 + d.getMinutes()) * 1.7); };
  DA.respects = () => { const r = store.get('respects', { d: today, n: 0 }); return baseRespects() + (r.d === today ? r.n : 0); };
  DA.payRespects = (quiet) => {
    const r = store.get('respects', { d: today, n: 0 }); if (r.d !== today) { r.d = today; r.n = 0; }
    r.n++; store.set('respects', r);
    window.dispatchEvent(new CustomEvent('da:respect', { detail: DA.respects() }));
    if (!quiet) { DA.toast(`F · respects paid. ${DA.respects().toLocaleString('en-US')} today.`); DA.beep(660, .5, .03); }
  };

  /* ═════════════ EASTER EGGS ═════════════ */
  const typing = () => { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable); };
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kIdx = 0, typed = '';
  document.addEventListener('keydown', (e) => {
    if (typing() || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    // konami: the resurrection
    kIdx = k === KONAMI[kIdx] ? kIdx + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      const on = document.documentElement.classList.toggle('risen');
      DA.toast(on ? "it's alive. (restored from a backup. don't get attached.)" : 'and it’s gone again. as it should be.');
      DA.beep(on ? 523 : 330, .6, .04, 'triangle'); return;
    }
    if (k === 'f') DA.payRespects();
    if (k.length === 1) {
      typed = (typed + k).slice(-12);
      if (typed.endsWith('rip')) {
        document.body.classList.add('resting');
        DA.toast('resting in peace. back in a moment.');
        setTimeout(() => document.body.classList.remove('resting'), 2600);
      }
    }
  });

  // the dead pixel: it was always there. you just never noticed
  const px = $('#deadPx');
  if (px) {
    const place = () => { px.style.left = Math.round(40 + Math.random() * (innerWidth - 80)) + 'px'; px.style.top = Math.round(90 + Math.random() * (innerHeight - 180)) + 'px'; };
    place();
    px.addEventListener('click', () => { DA.toast("that's a dead pixel. we're so sorry for your loss."); DA.beep(220, .4, .03, 'triangle'); px.style.opacity = 0; setTimeout(() => { place(); px.style.opacity = 1; }, 4000); });
  }

  /* ═════════════ SIGNATURE ═════════════ */
  console.log(`%c
   *    /\\_/\\      +
       ( o.o )   <3  ghostly.grl
   +    > ^ <          *

   DEAD AIR · funeral directors for the digitally deceased
   concept, design & code by ghostly.grl ♥`, 'font-family:monospace;color:#cfa6d9;background:#0b0b0c;padding:10px 14px');
  console.log('%cpress F          — pay your respects\ntype "rip"       — anywhere on the page\nkonami code      — the resurrection\nfind the dead pixel\nDA.flatline()    — you know what it does\n(there are more. we won\'t tell you where.)', 'font-family:monospace;color:#ece9e4;background:#0b0b0c;padding:8px');
})();
