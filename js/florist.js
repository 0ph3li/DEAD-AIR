/* ═══════════════════════════════════════════════════════════
   DEAD AIR · florist
   the fan that opens, petals in the air, the language of flowers
   in sync with your scroll, and a bouquet that leans toward you
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));

  /* ═════════════ 01 · HERO · the fan opens ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = ''; l.setAttribute('aria-label', t);
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; l.appendChild(s); chars.push(s); });
  });
  const fan = $('#fan'), fanF = $$('.fan-f', fan);
  onReady(() => {
    if (!G) return;
    gsap.timeline()
      .from(fanF, { rotate: 0, scale: .2, opacity: 0, duration: 1.8, ease: 'expo.out', stagger: { each: .08, from: 'center' } })
      .fromTo(chars, { '--b': '36px', opacity: 0, yPercent: 40 }, { '--b': '0px', opacity: 1, yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .06 }, '<.3')
      .from('.fl-meta > span, .fl-foot > *', { y: 20, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out' }, '<.4');
    // scrolling: the fan opens wider and the name goes soft
    gsap.timeline({ scrollTrigger: { trigger: '.fl-hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to(fanF, { rotate: (i, el) => parseFloat(el.style.getPropertyValue('--a')) * 1.6, yPercent: -20, ease: 'none' })
      .to('.fl-title', { filter: 'blur(14px)', opacity: .3, yPercent: 20, ease: 'none' }, 0);
  });
  // the fan follows you, a little
  if (G && !touch) {
    const hero = $('.fl-hero');
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5;
      gsap.to(fan, { rotate: nx * 10, duration: 1.2, ease: 'power3.out' });
    });
  }

  // petals in the air
  const pc = $('#petals');
  if (motion && pc) {
    const x = pc.getContext('2d'); let W = 0, H = 0, run = false, wind = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = pc.offsetWidth; H = pc.offsetHeight; pc.width = W * d; pc.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); };
    size(); window.addEventListener('resize', size);
    const P = Array.from({ length: 34 }, () => ({ x: rand(0, 1), y: rand(-1, 1), r: rand(5, 11), s: rand(.15, .45), a: rand(0, 6.28), va: rand(-.02, .02), c: Math.random() < .55 ? '207,166,217' : '255,255,255' }));
    window.addEventListener('pointermove', (e) => { wind = (e.movementX || 0) * .02; }, { passive: true });
    const loop = () => {
      if (!run) return;
      x.clearRect(0, 0, W, H); wind *= .95;
      for (const p of P) {
        p.y += p.s / H * 3; p.x += (Math.sin(p.a) * .3 + wind) / W * 2; p.a += p.va;
        if (p.y > 1.05) { p.y = -.05; p.x = rand(0, 1); }
        x.save(); x.translate(p.x * W, p.y * H); x.rotate(p.a); x.scale(1, Math.abs(Math.sin(p.a * 1.7)) * .7 + .3);
        x.fillStyle = `rgba(${p.c},.85)`; x.strokeStyle = 'rgba(11,11,12,.12)';
        x.beginPath(); x.ellipse(0, 0, p.r, p.r * .55, 0, 0, 7); x.fill(); x.stroke(); x.restore();
      }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !run) { run = true; requestAnimationFrame(loop); } else if (!e.isIntersecting) run = false; }).observe(pc);
  }

  /* ═════════════ 02 · THE LANGUAGE OF FLOWERS · in sync with the scroll ═════════════ */
  const items = $$('#langList li'), ring = $$('#langRing .slot'), cap = $('#langCap');
  const NAMES = { unfollow: 'white lily', seen: 'black rose', offline: 'lilac peony', battery: 'dried bloom', lily: 'two lilies' };
  const setLang = (li) => {
    if (li.classList.contains('is-on') && ring.some((s) => s.classList.contains('is-on'))) return;
    items.forEach((x) => x.classList.toggle('is-on', x === li));
    ring.forEach((s) => s.classList.toggle('is-on', s.dataset.k === li.dataset.f));
    cap.textContent = `${NAMES[li.dataset.f]} · nº ${items.indexOf(li) + 1} of ${items.length}`;
    DA.beep(520 + items.indexOf(li) * 90, .12, .012, 'triangle');
  };
  const langIO = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setLang(e.target)), { rootMargin: innerWidth < 761 ? '-62% 0px -28% 0px' : '-45% 0px -45% 0px' });
  items.forEach((li) => langIO.observe(li));
  setLang(items[0]);
  if (G) gsap.from('.lang-title', { filter: 'blur(20px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.lang-title', start: 'top 85%' } });

  /* ═════════════ 03 · ARRANGEMENTS ═════════════ */
  if (G) {
    gsap.from('.ar', { y: 70, opacity: 0, rotate: (i) => (i % 2 ? 3 : -3), duration: 1.1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.shop-grid', start: 'top 80%' } });
    $$('.sec-title').forEach((t) => gsap.from(t, { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));
  }
  $('#shopGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-send]'); if (!b) return;
    DA.scrollTo('#build');
    setTimeout(() => { for (let i = 0; i < 3; i++) setTimeout(() => add(b.dataset.send), i * 220); }, 900);
  });

  /* ═════════════ 04 · THE BUILDER ═════════════ */
  const TYPES = {
    unfollow: { img: 'img/HOME/flor-unfollow.webp', p: 5, sz: [110, 150] },
    seen: { img: 'img/HOME/flor-seen.webp', p: 8, sz: [90, 120] },
    offline: { img: 'img/HOME/flor-offline.webp', p: 12, sz: [130, 175] },
    battery: { img: 'img/HOME/flor-battery.webp', p: 1, sz: [100, 140] },
    lily: { img: 'img/HOME/hero-lily.webp', p: 6, sz: [120, 160] },
    read: { img: 'img/FLORIST/flor-read.webp', p: 3, sz: [90, 130] },
    typing: { img: 'img/FLORIST/flor-typing.webp', p: 7, sz: [90, 130] },
    airplane: { img: 'img/FLORIST/flor-airplane.webp', p: 14, sz: [110, 150] },
    storage: { img: 'img/FLORIST/flor-storage.webp', p: 4, sz: [100, 135] },
  };
  const stage = $('#stage'), stemsEl = $('#stems'), stemN = $('#stemN'), stemT = $('#stemT');
  let stems = [];
  const MAX = 9;
  const H = () => stage.clientHeight;
  const layout = (anim = true) => {
    const n = stems.length;
    stems.forEach((s, i) => {
      const ang = n === 1 ? s.jit : -34 + (68 / (n - 1)) * i + s.jit;
      const len = Math.round(H() * s.len);
      s.el.style.setProperty('--len', len + 'px');
      if (G && anim) gsap.to(s.el, { '--ang': ang + 'deg', duration: 1, ease: 'elastic.out(1, .55)' });
      else s.el.style.setProperty('--ang', ang + 'deg');
    });
    stage.classList.toggle('has-stems', n > 0);
    stemN.textContent = n; stemT.textContent = '$' + stems.reduce((a, s) => a + TYPES[s.type].p, 0);
    store.set('bouquet', stems.map((s) => s.type));
  };
  const make = (type) => {
    const t = TYPES[type];
    const el = document.createElement('div'); el.className = 'stem';
    el.style.transform = 'rotate(calc(var(--ang, 0deg) + var(--sw, 0deg)))';
    el.innerHTML = `<span class="slot cut" data-img="${t.img}"><span class="ph"></span></span>`;
    const sz = rand(...t.sz) * clamp(stage.clientWidth / 700, .6, 1.2);
    el.style.setProperty('--sz', sz + 'px'); el.style.setProperty('--tw', rand(-25, 25) + 'deg');
    // the order in the vase is random, so new stems don't always land on the right
    const s = { type, el, len: rand(.32, .52), jit: rand(-4, 4) };
    const at = Math.floor(Math.random() * (stems.length + 1));
    stems.splice(at, 0, s);
    stemsEl.appendChild(el); DA.slot(el.querySelector('.slot'));
    if (G) gsap.to(el, { '--sw': '2.5deg', duration: rand(1.8, 3), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: rand(0, 1), startAt: { '--sw': '-2.5deg' } });
    return s;
  };
  const add = (type, quiet) => {
    if (stems.length >= MAX) { DA.toast('nine stems. any more and it becomes a statement.'); if (G) gsap.fromTo('.vase', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(3, .2)' }); return; }
    const s = make(type);
    layout(!quiet);
    if (quiet || !G) return;
    gsap.from(s.el.querySelector('.slot'), { y: -H() * .9, rotate: rand(-180, 180), opacity: 0, duration: .9, ease: 'back.out(1.4)' });
    DA.noise(.25, 1800, .04, 700); setTimeout(() => DA.beep(rand(700, 1100), .2, .015, 'sine'), 600);
  };
  $('#shelf').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) add(b.dataset.f); });
  $('#shuffle').addEventListener('click', () => {
    if (!stems.length) return;
    stems.sort(() => Math.random() - .5).forEach((s) => { s.len = rand(.32, .52); s.jit = rand(-4, 4); s.el.style.setProperty('--tw', rand(-25, 25) + 'deg'); });
    layout(); DA.noise(.5, 1400, .05, 3000);
  });
  $('#empty').addEventListener('click', () => {
    const old = stems; stems = []; layout();
    old.forEach((s, i) => {
      if (G) gsap.to(s.el, { y: H(), rotate: rand(-90, 90), opacity: 0, duration: rand(.7, 1.1), delay: i * .04, ease: 'power2.in', onComplete: () => s.el.remove() });
      else s.el.remove();
    });
    DA.noise(.6, 600, .06, 200);
  });
  // the bouquet leans toward the cursor
  if (G && !touch) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5;
      gsap.to(stemsEl, { rotate: nx * 14, duration: 1.4, ease: 'elastic.out(1, .4)' });
    });
    stage.addEventListener('pointerleave', () => gsap.to(stemsEl, { rotate: 0, duration: 2, ease: 'elastic.out(1, .3)' }));
  }
  window.addEventListener('resize', () => layout(false));
  // what was in the vase last time
  const saved = store.get('bouquet', []);
  if (saved.length) saved.slice(0, MAX).forEach((t) => TYPES[t] && add(t, true));
  else ['offline', 'unfollow', 'seen'].forEach((t) => add(t, true));
  layout(false);
  if (G) gsap.from('.build-title', { filter: 'blur(20px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.build-hd', start: 'top 85%' } });

  /* ═════════════ THE CARD · and the delivery ═════════════ */
  const card = $('#card'), prev = $('#cardPreview'), sent = $('#sent');
  const ph = card.elements.msg.placeholder;
  card.addEventListener('input', () => { prev.textContent = card.elements.msg.value.trim() || ph; });
  card.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!stems.length) { DA.toast('the vase is empty. pick at least one stem.'); return; }
    const to = card.elements.to.value.trim() || card.elements.to.placeholder;
    store.set('sent-flowers', store.get('sent-flowers', 0) + 1);
    sent.classList.add('is-on');
    const li = $$('#track li');
    li.forEach((l) => l.classList.remove('is-on'));
    const done = () => { sent.classList.remove('is-on'); DA.toast(`delivered to ${to}. they'll never know it was you. unless you signed it.`, 4200); };
    if (!G) { li.forEach((l) => l.classList.add('is-on')); setTimeout(done, 2500); return; }
    gsap.timeline({ onComplete: () => setTimeout(done, 1600) })
      .fromTo('.env', { scale: .5, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, duration: .7, ease: 'back.out(1.6)' })
      .fromTo('.env-flap', { rotateX: 180 }, { rotateX: 0, duration: .5, ease: 'power2.in' })
      .fromTo('.env-seal', { scale: 0 }, { scale: 1, duration: .4, ease: 'back.out(3)', onStart: () => DA.beep(180, .2, .08, 'sine') })
      .to('.env', { x: 260, y: -220, rotate: 18, scale: .4, opacity: 0, duration: .8, ease: 'power3.in', onStart: () => DA.noise(.6, 1200, .04, 4000) }, '+=.3')
      .add(() => li.forEach((l, i) => setTimeout(() => { l.classList.add('is-on'); DA.beep(600 + i * 120, .1, .02); }, i * 520)))
      .to({}, { duration: li.length * .52 });
  });
  sent.addEventListener('click', () => sent.classList.remove('is-on'));

  /* ═════════════ 05 · DELIVERY ═════════════ */
  if (G) gsap.from('.dl-row > div', { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.dl-row', start: 'top 85%' } });
})();
