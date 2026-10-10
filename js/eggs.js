/* ═══════════════════════════════════════════════════════════
   DEAD AIR · easter eggs (every page)
   (spoilers. obviously.)
   the screensaver · come back · CPR · caw · sparkle · hello
   amen · the ghost cat · it's late · brb
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch } = window.DA;
  const G = motion && hasGsap;
  const rand = (a, b) => a + Math.random() * (b - a);
  const busy = () => document.documentElement.classList.contains('rd-open') || document.body.classList.contains('is-loading') || document.body.classList.contains('menu-open');
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ═════════════ 1 · THE SCREENSAVER · leave it alone for a minute ═════════════ */
  let lastAct = Date.now(), saver = null;
  const IDLE = (touch ? 90 : 60) * 1000;
  const wake = () => { lastAct = Date.now(); if (saver) stopSaver(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
  const COLORS = ['#cfa6d9', '#ffffff', '#e0469a', '#b8f5c6', '#ffc98a'];
  const startSaver = () => {
    const box = el('div', 'ss', '<div class="ss-logo"><b>DEAD<i>AIR</i></b><span>are you still there?</span></div>');
    document.body.appendChild(box);
    const logo = $('.ss-logo', box);
    let x = rand(40, innerWidth - 300), y = rand(40, innerHeight - 160), vx = 2.1, vy = 1.7, ci = 0, raf = 0;
    const step = () => {
      const w = logo.offsetWidth, h = logo.offsetHeight; let hx = false, hy = false;
      x += vx; y += vy;
      if (x <= 0 || x + w >= innerWidth) { vx *= -1; x = Math.max(0, Math.min(x, innerWidth - w)); hx = true; }
      if (y <= 0 || y + h >= innerHeight) { vy *= -1; y = Math.max(0, Math.min(y, innerHeight - h)); hy = true; }
      if (hx || hy) { ci = (ci + 1) % COLORS.length; logo.style.color = COLORS[ci]; DA.beep(hx && hy ? 1318 : 330, .05, .01, 'triangle'); }
      if (hx && hy) { DA.chime(); DA.toast('it hit the corner. make a wish.'); }
      logo.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(step);
    };
    step();
    saver = { box, stop: () => cancelAnimationFrame(raf) };
  };
  const stopSaver = () => { saver.stop(); const b = saver.box; saver = null; b.classList.add('is-out'); setTimeout(() => b.remove(), 500); };
  setInterval(() => { if (!saver && !busy() && document.visibilityState === 'visible' && Date.now() - lastAct > IDLE) startSaver(); }, 2000);

  /* ═════════════ 2 · COME BACK · switch tabs and the tab misses you ═════════════ */
  const title = document.title, icon = $('link[rel="icon"]'), iconHref = icon?.getAttribute('href');
  const FLAT = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0b0c"/><path d="M6 34h52" stroke="#cfa6d9" stroke-width="4" stroke-linecap="round"/></svg>');
  const AWAY = ['come back…', '(1) new memory', 'we kept your seat', '🕯 still lit', 'don\'t be a stranger'];
  let flip = null, ai = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      icon?.setAttribute('href', FLAT);
      document.title = AWAY[0];
      flip = setInterval(() => { ai = (ai + 1) % AWAY.length; document.title = AWAY[ai]; }, 2200);
    } else {
      clearInterval(flip); icon?.setAttribute('href', iconHref);
      document.title = 'you came back ♡';
      setTimeout(() => { document.title = title; }, 2200);
    }
  });

  /* ═════════════ 3 · CPR · click the footer logo five times ═════════════ */
  const ftrLogo = $('.ftr-logo');
  let cpr = [], shocking = false;
  ftrLogo?.addEventListener('click', () => {
    const now = Date.now(); cpr = cpr.filter((t) => now - t < 2000); cpr.push(now);
    DA.beep(120, .08, .05, 'square');
    if (cpr.length >= 5 && !shocking) { cpr = []; shock(); }
  });
  ftrLogo && (ftrLogo.style.cursor = 'pointer');
  const shock = () => {
    shocking = true;
    const ov = el('div', 'defib', '<p class="defib-t">CLEAR!</p><p class="defib-s mono">charging… 200 J</p>');
    document.body.appendChild(ov);
    const zap = (i) => {
      DA.noise(.35, 140, .14, 60); DA.beep(70, .4, .12, 'sawtooth');
      ov.classList.remove('is-zap'); void ov.offsetWidth; ov.classList.add('is-zap');
      document.body.classList.remove('is-shocked'); void document.body.offsetWidth; document.body.classList.add('is-shocked');
      $('.defib-s', ov).textContent = i < 2 ? `no pulse. charging again… ${200 + (i + 1) * 50} J` : 'we have a pulse.';
    };
    [600, 2200, 3800].forEach((t, i) => setTimeout(() => zap(i), t));
    [4400, 5300, 6200].forEach((t) => setTimeout(() => DA.beep(1000, .08, .04), t));
    setTimeout(() => { $('.defib-t', ov).textContent = '♡'; }, 4400);
    setTimeout(() => { ov.classList.add('is-out'); document.body.classList.remove('is-shocked'); DA.toast("it's alive. (it was the website. the website is alive.)"); }, 6800);
    setTimeout(() => { ov.remove(); shocking = false; }, 7400);
  };

  /* ═════════════ typed words ═════════════ */
  let typed = '', brb = false;
  const typing = () => { const a = document.activeElement; return a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable); };
  document.addEventListener('keydown', (e) => {
    if (typing() || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    if (brb && !'brb'.includes(e.key.toLowerCase())) back();
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('caw')) caw();
    else if (typed.endsWith('sparkle')) sparkle();
    else if (typed.endsWith('hello')) hello();
    else if (typed.endsWith('amen')) amen();
    else if (typed.endsWith('brb')) away();
  });

  /* ═════════════ 4 · CAW · Cache steals your cursor ═════════════ */
  let cawing = false;
  const caw = () => {
    if (cawing) return; cawing = true;
    const bird = el('img', 'crow-fly'); bird.src = 'img/HOME/crow.webp'; bird.alt = '';
    document.body.appendChild(bird);
    DA.noise(.22, 1300, .11, 700); setTimeout(() => DA.noise(.18, 1200, .08, 650), 260);
    document.body.classList.add('cursor-stolen');
    const done = () => { bird.remove(); };
    if (G) {
      gsap.timeline({ onComplete: done })
        .fromTo(bird, { x: innerWidth + 50, y: innerHeight * .65, rotate: -10, scaleX: 1 }, { x: innerWidth * .45, y: innerHeight * .25, rotate: 6, duration: 1.1, ease: 'power1.inOut' })
        .to(bird, { x: -260, y: innerHeight * .4, rotate: -6, duration: 1.1, ease: 'power1.in' });
    } else setTimeout(done, 100);
    DA.toast('cache took your cursor. he\'ll bring it back.');
    setTimeout(() => { document.body.classList.remove('cursor-stolen'); DA.toast('(he brought it back. it\'s a little shinier now.)'); cawing = false; }, 4200);
  };

  /* ═════════════ 5 · SPARKLE · a 2006 glitter cursor ═════════════ */
  let sparkOn = false, lastSp = 0;
  try { sparkOn = sessionStorage.getItem('da-sparkle') === '1'; } catch (e) {}
  const GL = ['✦', '✧', '⋆', '♡', '✶'];
  window.addEventListener('pointermove', (e) => {
    if (!sparkOn || !motion) return;
    const t = performance.now(); if (t - lastSp < 28) return; lastSp = t;
    const s = el('i', 'spark', GL[(Math.random() * GL.length) | 0]);
    s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; s.style.color = COLORS[(Math.random() * 3) | 0];
    s.style.setProperty('--dx', rand(-30, 30) + 'px'); s.style.setProperty('--dy', rand(20, 70) + 'px'); s.style.fontSize = rand(9, 18) + 'px';
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }, { passive: true });
  const sparkle = () => {
    sparkOn = !sparkOn; try { sessionStorage.setItem('da-sparkle', sparkOn ? '1' : '0'); } catch (e) {}
    DA.toast(sparkOn ? '✦ glitter cursor: on. welcome back to 2006. ✦' : 'glitter cursor: off. you grew up.');
    DA.chime();
  };

  /* ═════════════ 6 · HELLO · the welcome screen after a factory reset ═════════════ */
  const HELLO = ['hello', 'ciao', 'hola', 'bonjour', 'hallo', 'olá', 'こんにちは', '안녕하세요', 'hej', 'hello'];
  const hello = () => {
    if ($('.hello-ov')) return;
    const ov = el('div', 'hello-ov', '<p class="script"></p><span class="mono">swipe up to begin</span>');
    document.body.appendChild(ov);
    const w = $('p', ov); let i = 0;
    DA.chime();
    const next = () => {
      if (i >= HELLO.length) { ov.classList.add('is-out'); setTimeout(() => ov.remove(), 700); return; }
      w.textContent = HELLO[i++]; w.classList.remove('is-in'); void w.offsetWidth; w.classList.add('is-in');
      setTimeout(next, 520);
    };
    next();
  };

  /* ═════════════ 7 · AMEN · the organ answers, the lilies fall ═════════════ */
  const amen = () => {
    const a = DA.audio(); if (!a) return;
    // a plagal cadence: IV, then I
    [[[174.6, 220, 261.6, 349.2], 0], [[130.8, 196, 261.6, 329.6], 1.3]].forEach(([ch, t]) => setTimeout(() => ch.forEach((f) => { DA.beep(f, 1.8, .025, 'sine'); DA.beep(f * 2, 1.4, .008, 'sine'); }), t * 1000));
    if (motion) for (let i = 0; i < 46; i++) {
      const p = el('i', 'lily-p'); p.style.left = rand(0, 100) + 'vw'; p.style.background = Math.random() < .5 ? '#cfa6d9' : '#fff';
      p.style.setProperty('--dx', rand(-120, 120) + 'px'); p.style.setProperty('--r', rand(-540, 540) + 'deg');
      p.style.animationDuration = rand(3, 6) + 's'; p.style.animationDelay = rand(0, 1.6) + 's';
      document.body.appendChild(p); setTimeout(() => p.remove(), 8000);
    }
    DA.toast('amen. (the organist says thank you.)');
  };

  /* ═════════════ 8 · THE GHOST CAT · click the signature three times ═════════════ */
  const sig = $('.ftr-sign .script');
  let sigC = [];
  sig?.addEventListener('click', () => {
    const now = Date.now(); sigC = sigC.filter((t) => now - t < 1500); sigC.push(now);
    if (sigC.length < 3) return; sigC = [];
    const cat = el('pre', 'ghost-cat', '   /\\_/\\  \n  ( o.o ) \n   > ^ <  \n  boo ♥');
    cat.style.left = rand(15, 75) + 'vw';
    document.body.appendChild(cat);
    const a = DA.audio();
    if (a && !DA.muted) { const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = 'triangle'; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(1100, t + .12); o.frequency.exponentialRampToValueAtTime(520, t + .5); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .55); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .6); }
    DA.toast('meow. (ghostly.grl\'s cat says hi.)');
    setTimeout(() => cat.remove(), 6200);
  });
  sig && (sig.style.cursor = 'pointer');

  /* ═════════════ 9 · IT'S LATE · between midnight and five ═════════════ */
  const h = new Date().getHours();
  let seenLate = false; try { seenLate = sessionStorage.getItem('da-late') === '1'; } catch (e) {}
  if (h < 5 && !seenLate && document.body.dataset.page !== 'grief') {
    const go = () => {
      try { sessionStorage.setItem('da-late', '1'); } catch (e) {}
      const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const b = el('div', 'late mono', `<span>it's ${t}. the house is open. so is the <a href="grief.html#hotline">3 am line →</a></span><button type="button" aria-label="Close">×</button>`);
      document.body.appendChild(b);
      $('button', b).addEventListener('click', () => { b.classList.add('is-out'); setTimeout(() => b.remove(), 500); });
    };
    window.DA.isReady ? setTimeout(go, 2500) : window.addEventListener('da:ready', () => setTimeout(go, 2500), { once: true });
  }

  /* ═════════════ 10 · BRB · away status ═════════════ */
  const logoTxt = $('.logo-txt');
  const away = () => {
    if (brb) return; brb = true;
    logoTxt?.insertAdjacentHTML('beforeend', '<em class="away mono"> (away)</em>');
    DA.toast('status: away. press any key to come back.');
    DA.beep(523, .1, .02); setTimeout(() => DA.beep(392, .15, .02), 110);
  };
  const back = () => { brb = false; $('.away')?.remove(); DA.toast('status: online. welcome back.'); DA.beep(392, .1, .02); setTimeout(() => DA.beep(523, .15, .02), 110); };

  /* for the console */
  Object.assign(window.DA, { caw, hello, amen, sparkle, cpr: shock, screensaver: () => { if (!saver) startSaver(); } });
})();
