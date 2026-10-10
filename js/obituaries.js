/* ═══════════════════════════════════════════════════════════
   DEAD AIR · obituaries
   the loupe over the photocopy, the index like the back of a record,
   the reading room, the mirror, last words you can move,
   and an obituary of your own that comes into focus as you write it
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));

  /* ═════════════ THE DEPARTED ═════════════
     ids blog / chat / save / pet are the same ones as on the home, so candles carry over */
  const OBITS = [
    { id: 'blog', name: 'midnight-thoughts.blog', cat: 'blogs', yrs: '2008 — 2013', img: 'img/HOME/obit-blog.jpg', base: 1312,
      body: ['Beloved blog of a fourteen-year-old with a lot of feelings and one song on autoplay. She posted 1,312 times, mostly at night, mostly about him, always in lowercase.', 'Her background was a galaxy. Her cursor was a sparkle. Her chatbox said "leave a message ♡" and three people did.', 'She stopped loading in the spring of 2013, after a password reset nobody finished.'],
      by: 'Survived by three followers, one of them a bot, and a reblog that still circulates without credit.', lieu: "In lieu of flowers, please don't search for her.", last: "i'm fine. <s>really</s> goodnight" },
    { id: 'chat', name: '"girls trip 2019 🌴"', cat: 'chats', yrs: 'mar — apr 2019', img: 'img/HOME/obit-chat.jpg', base: 214,
      body: ['Created with great hope on a Tuesday by someone who has since moved to Berlin. She planned four trips and took none.', 'At her peak she received six hundred messages in one evening, most of them about dates. Then the dates came, and nobody could make them.', 'She was peacefully muted by all eleven members over the course of one week.'],
      by: 'She leaves behind 214 unread messages and a shared album that nobody opened.', lieu: 'In lieu of flowers, please finally book the trip.', last: 'so are we doing this <u>or</u>' },
    { id: 'profile', name: "jess's first profile", cat: 'profiles', yrs: '2006 — 2011', img: 'img/OBITUARIES/obit-profile.jpg', base: 806,
      body: ['A profile with a top 8, a song that played as soon as you arrived, and a picture taken from above, in a bathroom, with the flash on.', 'She rearranged her top 8 every time somebody upset her, which was every week. She had 1,026 friends and knew eleven of them.', 'She went quiet in 2011, when everyone moved somewhere new and forgot to tell her.'],
      by: 'Survived by a mood that said "blah" and a headline that said "don\'t forget me".', lieu: 'In lieu of flowers, please put her back in your top 8.', last: 'mood: <s>blah</s> whatever' },
    { id: 'save', name: 'SAVE FILE 03', cat: 'games', yrs: '2004 — 2006', img: 'img/HOME/obit-save.jpg', fit: 'dark', base: 64,
      body: ['A level 64 ranger, a house by the lake and a horse called Pancake. One hundred and twelve hours of a childhood, kept on a memory card the size of a stamp.', 'Lost one Sunday afternoon when a little brother pressed NEW GAME, then YES, then YES again.', 'He has since been forgiven. Not really.'],
      by: 'Pancake is survived by no one. Pancake was the best horse.', lieu: 'In lieu of flowers, please save before you leave the room.', last: 'SAVE GAME? <u>YES</u>' },
    { id: 'phone', name: 'the phone left in a taxi', cat: 'devices', yrs: '2017 — 2021', img: 'img/OBITUARIES/obit-phone.webp', fit: 'light', base: 412,
      body: ['Left on the back seat at 2:14 AM, somewhere between a birthday and home.', 'She held 9,212 photos, most of them of the same sunset from the same window, and a note called "things to say to him" that was never opened again.', 'Her location was last seen moving east at forty miles an hour.'],
      by: 'Survived by a cracked case, a charger in a hotel and an unread "home safe?"', lieu: 'In lieu of flowers, please back up your photos tonight.', last: 'home safe? <small>delivered</small>' },
    { id: 'pet', name: 'Biscuit', cat: 'games', yrs: 'friday — monday, 2001', img: 'img/HOME/obit-pet.jpg', base: 3,
      body: ['A virtual pet. Hatched on a Friday on the school bus, and named after the first thing that came to mind.', 'Fed, cleaned, loved and then forgotten in a school bag over one long weekend. Biscuit asked for so little. Mostly snacks. Sometimes a game.', 'When the bag was opened on Monday, there was a small ghost on the screen.'],
      by: 'Biscuit was three days old, which is ninety in pet years.', lieu: 'In lieu of flowers, please feed something today.', last: '♡ ♡ ♡ ○ ○ <small>hungry</small>' },
    { id: 'forum', name: 'the xX_moonlight_Xx boards', cat: 'blogs', yrs: '2005 — 2012', img: 'img/OBITUARIES/obit-forum.jpg', base: 377,
      body: ['A forum for people who liked the same band a little too much. Signatures with glitter, threads four hundred pages long, and a moderator called Raven who was fourteen and ruled with an iron fist.', 'Members met there, fell out there and once, at a concert, met in person and had no idea what to say.', 'The domain expired in 2012. Raven was busy with exams.'],
      by: 'Survived by 88,000 posts that now lead to a 404.', lieu: 'In lieu of flowers, please try your old forum password one last time.', last: '<u>bump</u>' },
    { id: 'show', name: 'season 3', cat: 'other', yrs: 'never — never', img: 'img/OBITUARIES/obit-show.jpg', base: 2041,
      body: ['The third season of a show that ended on a cliffhanger, with the two of them about to finally say it.', 'She was never written, never filmed and never aired. She was announced, then un-announced, on a Thursday.', 'Thousands signed a petition. The petition is also dead.'],
      by: 'Survived by forty-one fan theories and one very long video essay.', lieu: 'In lieu of flowers, please rewatch the finale and imagine.', last: 'to be continued…' },
    { id: 'playlist', name: '"sad but make it summer"', cat: 'other', yrs: '2014 — 2023', img: 'img/OBITUARIES/obit-playlist.jpg', base: 158,
      body: ['A playlist of 212 songs, built over nine summers, one heartbreak at a time.', 'She was played on trains, on beaches, in a borrowed car with the windows down, and once at a wedding by mistake.', "She was lost in 2023 when a family plan was cancelled by somebody's dad."],
      by: 'Survived by the songs, which are fine, and the order, which is gone forever.', lieu: 'In lieu of flowers, please never shuffle anything important.', last: 'now playing: <s>track 212</s> nothing' },
    { id: 'drafts', name: 'the drafts folder', cat: 'other', yrs: '2012 — tonight', img: 'img/OBITUARIES/obit-drafts.jpg', base: 2301,
      body: ['Two thousand three hundred and one messages, written, rewritten and never sent. Apologies, confessions, one very good joke and a "hey" that took forty minutes.', 'She is, technically, still with us. Her Viking service is scheduled for 23:45 tonight, at the dock.', "Everyone is welcome. Nobody has to say anything. That's the whole point."],
      by: 'Survived by everything that was never said.', lieu: 'In lieu of flowers, send one of them. Just one.', last: 'hey <s>i miss</s> how are you' },
  ];
  const CAT = { profiles: 'profile', chats: 'chat', blogs: 'blog / forum', games: 'game / pet', devices: 'device', other: 'something else' };

  // obituaries written on this device
  const fromMine = (m) => ({
    id: m.id, mine: true, name: m.name, cat: m.cat, yrs: `${m.from || '?'} — ${m.to || '?'}`, img: '', base: 0,
    body: [
      `${m.name.charAt(0).toUpperCase() + m.name.slice(1)} ${m.from ? 'came into the world in ' + m.from : 'arrived quietly, nobody remembers when'}, and ${m.to ? 'left it in ' + m.to : 'left without saying goodbye'}.`,
      `They will be remembered for ${m.for ? m.for.replace(/\.$/, '') : 'being there when nobody else was'}.`,
      'The family has asked for privacy, and a little time.',
    ],
    by: `Survived by ${m.by ? m.by.replace(/\.$/, '') : 'the person who wrote this'}.`, lieu: 'In lieu of flowers, please write one of your own.', last: '',
  });
  let mine = store.get('my-obits', []);
  const all = () => [...OBITS, ...mine.map(fromMine)];

  const now = new Date();
  $('#obDate').textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();

  /* ═════════════ 01 · HERO · the title and the loupe ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = '';
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; l.appendChild(s); chars.push(s); });
  });
  onReady(() => {
    if (!G) return;
    gsap.timeline()
      .from('.xerox', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut' })
      .from('.xr-img', { scale: 1.25, filter: 'blur(14px)', duration: 1.8, ease: 'expo.out' }, '<.4')
      .fromTo(chars, { '--b': '30px', opacity: 0, x: 40 }, { '--b': '0px', opacity: 1, x: 0, duration: 1.2, ease: 'expo.out', stagger: .05 }, '<.1')
      .from('.ob-meta, .ob-lede, .ob-hero-txt .btn', { y: 24, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out' }, '<.4');
  });

  const xerox = $('#xerox'), loupe = $('#loupe'), loupeIn = $('#loupeIn'), loupeLbl = $('#loupeLbl');
  let Z = 1.8, nat = null;
  const heroImg = () => $('.xr-img img', xerox);
  const loupeAt = (x, y) => {
    const r = xerox.getBoundingClientRect(), L = loupe.offsetWidth;
    loupe.style.transform = `translate(${x - L / 2}px, ${y - L / 2}px)`;
    const img = heroImg();
    if (!img) { loupeIn.classList.add('is-empty'); return; }
    loupeIn.classList.remove('is-empty');
    if (!nat) { nat = [img.naturalWidth, img.naturalHeight]; loupeIn.style.backgroundImage = `url("${img.src}")`; }
    const s = Math.max(r.width / nat[0], r.height / nat[1]), dw = nat[0] * s, dh = nat[1] * s, ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
    loupeIn.style.backgroundSize = `${dw * Z}px ${dh * Z}px`;
    loupeIn.style.backgroundPosition = `${-((x - ox) * Z - L / 2)}px ${-((y - oy) * Z - L / 2)}px`;
  };
  xerox.addEventListener('pointermove', (e) => { const r = xerox.getBoundingClientRect(); xerox.classList.add('is-in'); loupeAt(e.clientX - r.left, e.clientY - r.top); });
  xerox.addEventListener('pointerleave', () => xerox.classList.remove('is-in'));
  xerox.addEventListener('click', (e) => {
    Z = Z === 1.8 ? 3.2 : 1.8; loupeLbl.textContent = 'x ' + Z.toFixed(1); DA.beep(Z > 2 ? 900 : 600, .08, .02);
    const r = xerox.getBoundingClientRect(); loupeAt(e.clientX - r.left, e.clientY - r.top);
  });
  if (touch) { xerox.classList.add('is-in'); requestAnimationFrame(() => { const r = xerox.getBoundingClientRect(); loupeAt(r.width * .55, r.height * .4); }); }

  /* ═════════════ 02 · THE INDEX ═════════════ */
  const list = $('#ixList'), bg = $('#ixBg');
  let filter = 'all';
  const spread = (name) => name.split(/\s+/).map((w) => `<span>${esc(w)}</span>`).join('');
  const renderIndex = () => {
    const items = all();
    list.innerHTML = items.map((o, i) => `<li class="ix-row${o.mine ? ' is-mine' : ''}" data-cat="${o.cat}" data-i="${i}"><button type="button"><span class="ix-no">${String(i + 1).padStart(2, '0')}.</span><span class="ix-name">${spread(o.name)}</span><span class="ix-yrs">${esc(o.yrs)}</span></button></li>`).join('');
    $('#ixCount').textContent = items.length;
    $('#wrNo').textContent = String(items.length + 1).padStart(2, '0');
    // the photos that rise behind the list, like the deer behind the tracklist
    bg.innerHTML = '';
    items.forEach((o, i) => {
      if (!o.img) return;
      const d = document.createElement('div'); d.className = 'ib'; d.dataset.i = i; bg.appendChild(d);
      const im = new Image(); im.alt = ''; im.onload = () => d.appendChild(im); im.src = o.img;
    });
    applyFilter(false);
  };
  const applyFilter = (anim = true) => {
    const rows = $$('.ix-row', list);
    rows.forEach((r) => { r.hidden = !(filter === 'all' || r.dataset.cat === filter); });
    if (anim && G) gsap.fromTo(rows.filter((r) => !r.hidden), { opacity: 0, filter: 'blur(10px)', y: 12 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .6, stagger: .04, ease: 'power3.out', clearProps: 'filter,opacity,transform' });
  };
  $$('.ix-filters button').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f; $$('.ix-filters button').forEach((x) => x.classList.toggle('is-on', x === b)); applyFilter(); DA.beep(500, .06, .02);
  }));
  list.addEventListener('pointerover', (e) => {
    const row = e.target.closest('.ix-row'); if (!row || touch) return;
    list.classList.add('is-hovering');
    $$('.ib', bg).forEach((d) => d.classList.toggle('is-on', d.dataset.i === row.dataset.i));
  });
  list.addEventListener('pointerleave', () => { list.classList.remove('is-hovering'); $$('.ib', bg).forEach((d) => d.classList.remove('is-on')); });
  list.addEventListener('click', (e) => { const row = e.target.closest('.ix-row'); if (row) openRd(+row.dataset.i, row.querySelector('button')); });
  // the background only lives while the index is on screen
  new IntersectionObserver(([e]) => bg.classList.toggle('is-out', !e.isIntersecting)).observe($('#index'));
  renderIndex();
  if (G) {
    gsap.from('.ix-title', { filter: 'blur(30px)', opacity: 0, scale: 1.1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.ix-hd', start: 'top 75%' } });
    gsap.from('#ixList .ix-row', { opacity: 0, x: -30, filter: 'blur(8px)', duration: .8, stagger: .05, ease: 'power3.out', clearProps: 'filter,opacity,transform', scrollTrigger: { trigger: list, start: 'top 80%' } });
  }

  /* ═════════════ THE READING ROOM ═════════════ */
  const rd = $('#rd'), rdPic = $('#rdPic'), rdCandle = $('#rdCandle');
  let cur = 0, opener = null;
  const lit = store.get('candles', {});
  const fill = (i) => {
    const items = all(); cur = (i + items.length) % items.length; const o = items[cur];
    $('#rdNo').textContent = 'Nº ' + String(cur + 1).padStart(2, '0');
    $('#rdCat').textContent = CAT[o.cat] || o.cat;
    $('#rdYrs').textContent = o.yrs;
    $('#rdName').textContent = o.name;
    $('#rdBody').innerHTML = o.body.map((p) => `<p>${esc(p)}</p>`).join('');
    $('#rdBy').textContent = o.by; $('#rdLieu').textContent = o.lieu;
    $('#rdLetter').textContent = (o.name.match(/[a-z0-9]/i) || ['?'])[0].toUpperCase();
    // the photo slot, refilled
    rdPic.querySelector('img')?.remove(); rdPic.classList.remove('has-img', 'fit', 'fit-dark'); delete rdPic.dataset.init;
    rdPic.querySelector('.ph b').textContent = o.mine ? 'no photo' : o.id; rdPic.querySelector('.ph i').textContent = o.img || 'written on this device';
    if (o.fit) rdPic.classList.add('fit');
    if (o.fit === 'dark') rdPic.classList.add('fit-dark');
    rdPic.dataset.img = o.img; if (o.img) DA.slot(rdPic);
    rdPic.style.display = o.img ? '' : 'none';
    // candles
    const n = $('b', rdCandle);
    n.textContent = (o.base + (lit[o.id] || 0)).toLocaleString('en-US');
    rdCandle.classList.toggle('is-lit', !!lit[o.id]);
    if (history.replaceState) history.replaceState(null, '', '#o-' + o.id);
  };
  const openRd = (i, from) => {
    opener = from || null; fill(i);
    rd.hidden = false; document.documentElement.classList.add('rd-open'); DA.lenis?.stop();
    $('#rdX').focus({ preventScroll: true });
    DA.beep(330, .4, .03, 'triangle');
    if (G) {
      gsap.timeline()
        .fromTo(rd, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .9, ease: 'expo.inOut' })
        .fromTo('#rdLetter', { filter: 'blur(60px)', opacity: 0, x: -80 }, { filter: 'blur(14px)', opacity: .9, x: 0, duration: 1.6, ease: 'expo.out' }, '<.3')
        .from('.rd-pic', { y: 40, rotate: -4, opacity: 0, duration: 1, ease: 'expo.out' }, '<.1')
        .from('.rd-txt > *', { y: 24, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out' }, '<.1');
    }
  };
  const closeRd = () => {
    const done = () => { rd.hidden = true; document.documentElement.classList.remove('rd-open'); DA.lenis?.start(); opener?.focus({ preventScroll: true }); if (history.replaceState) history.replaceState(null, '', location.pathname); };
    if (G) gsap.to(rd, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut', onComplete: done }); else done();
  };
  const step = (d) => {
    if (!G) return fill(cur + d);
    gsap.timeline()
      .to('.rd-grid, #rdLetter', { opacity: 0, filter: 'blur(12px)', duration: .25 })
      .add(() => fill(cur + d))
      .to('.rd-grid', { opacity: 1, filter: 'blur(0px)', duration: .45 })
      .to('#rdLetter', { opacity: .9, filter: 'blur(14px)', duration: .8 }, '<');
  };
  $('#rdX').addEventListener('click', closeRd);
  $('#rdPrev').addEventListener('click', () => step(-1));
  $('#rdNext').addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (rd.hidden) return;
    if (e.key === 'Escape') closeRd();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') { // keep focus inside the room
      const f = $$('button, a', rd).filter((x) => x.offsetParent); const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  rdCandle.addEventListener('click', () => {
    const o = all()[cur]; lit[o.id] = (lit[o.id] || 0) + 1; store.set('candles', lit);
    $('b', rdCandle).textContent = (o.base + lit[o.id]).toLocaleString('en-US'); rdCandle.classList.add('is-lit');
    DA.chime(); DA.toast(`a candle is lit for ${o.name}.`);
  });
  // arriving with #o-blog (from the home, or a shared link) opens that one
  onReady(() => {
    const m = location.hash.match(/^#o-(.+)$/); if (!m) return;
    const i = all().findIndex((o) => o.id === m[1]); if (i > -1) setTimeout(() => openRd(i), 300);
  });

  /* ═════════════ 03 · THE MIRROR ═════════════ */
  if (G) {
    gsap.timeline({ scrollTrigger: { trigger: '.mir', start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo('.mir-half--t .slot', { yPercent: 18 }, { yPercent: -10, ease: 'none' })
      .fromTo('.mir-half--b .slot', { yPercent: -18 }, { yPercent: 10, ease: 'none' }, 0);
    gsap.timeline({ scrollTrigger: { trigger: '.mir-band', start: 'top 80%' } })
      .from('.mir-band', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' })
      .from('.mir-band > *', { opacity: 0, y: 10, filter: 'blur(6px)', stagger: .08, duration: .6 }, '-=.3');
  }

  /* ═════════════ 04 · LAST WORDS · tape you can move ═════════════ */
  const wall = $('#lwWall');
  const SPOTS = [[3, 3, -3], [44, 1, 2], [20, 15, -1], [62, 18, 3], [5, 31, 2], [38, 37, -2], [66, 44, 1], [10, 56, -3], [46, 62, 2], [22, 78, -1], [60, 82, 3], [2, 90, 1]];
  let zTop = 10;
  const buildWall = () => {
    wall.innerHTML = '';
    all().filter((o) => o.last).forEach((o, i) => {
      const [x, y, r] = SPOTS[i % SPOTS.length];
      const s = document.createElement('div'); s.className = 'strip'; s.tabIndex = 0;
      s.style.setProperty('--x', x + '%'); s.style.setProperty('--y', y + '%'); s.style.setProperty('--r', r + 'deg');
      s.innerHTML = `${o.last}<small>— ${esc(o.name)}, ${esc(o.yrs.split('—').pop().trim())}</small>`;
      s.setAttribute('aria-label', `last words of ${o.name}`);
      wall.appendChild(s);
    });
    fitStrips();
  };
  // keep every strip on the wall, whatever the screen
  const fitStrips = () => {
    const W = wall.clientWidth, H = wall.clientHeight;
    // narrow screens: a staggered column instead of a scatter
    if (W < 600) {
      const strips = $$('.strip', wall).filter((s) => !s.dataset.moved), gap = Math.min(78, (H - 20) / Math.max(1, strips.length));
      strips.forEach((s, i) => { s.style.top = (i * gap) + 'px'; s.style.left = (i % 2 ? Math.max(0, W - s.offsetWidth - 8) : 4) + 'px'; });
      return;
    }
    $$('.strip', wall).forEach((s) => {
      if (s.offsetLeft + s.offsetWidth > W - 6) s.style.left = Math.max(0, W - s.offsetWidth - 10) + 'px';
      if (s.offsetTop + s.offsetHeight > H - 6) s.style.top = Math.max(0, H - s.offsetHeight - 10) + 'px';
    });
  };
  buildWall(); window.addEventListener('resize', fitStrips);
  // drag
  wall.addEventListener('pointerdown', (e) => {
    const s = e.target.closest('.strip'); if (!s) return;
    e.preventDefault(); s.setPointerCapture(e.pointerId); s.classList.add('is-drag'); s.dataset.moved = '1'; s.style.zIndex = ++zTop;
    const sx = e.clientX - s.offsetLeft, sy = e.clientY - s.offsetTop;
    DA.noise(.12, 2600, .03);
    const mv = (ev) => {
      s.style.left = clamp(ev.clientX - sx, -20, wall.clientWidth - s.offsetWidth + 20) + 'px';
      s.style.top = clamp(ev.clientY - sy, -10, wall.clientHeight - s.offsetHeight + 10) + 'px';
    };
    const up = () => { s.classList.remove('is-drag'); s.removeEventListener('pointermove', mv); DA.noise(.18, 1800, .05); };
    s.addEventListener('pointermove', mv); s.addEventListener('pointerup', up, { once: true }); s.addEventListener('pointercancel', up, { once: true });
  });
  // keyboard: arrows move the focused strip
  wall.addEventListener('keydown', (e) => {
    const s = e.target.closest('.strip'); if (!s) return;
    const d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key]; if (!d) return;
    e.preventDefault(); s.style.left = (s.offsetLeft + d[0]) + 'px'; s.style.top = (s.offsetTop + d[1]) + 'px';
  });
  if (G) {
    ScrollTrigger.create({
      trigger: wall, start: 'top 75%', once: true,
      onEnter: () => {
        const strips = $$('.strip', wall);
        gsap.fromTo(strips, { scale: 1.5, opacity: 0, rotate: () => rand(-14, 14) }, {
          scale: 1, opacity: 1, rotate: (i, el) => parseFloat(el.style.getPropertyValue('--r')), duration: .45, ease: 'back.out(2.2)',
          stagger: { each: .14, from: 'random', onStart() { DA.noise(.09, 2200, .025); } },
        });
      },
    });
    gsap.from('.lw-title', { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.lw-hd', start: 'top 85%' } });
  }

  /* ═════════════ 05 · WRITE ONE · the clearer you write, the clearer it gets ═════════════ */
  const form = $('#wrForm'), blur = $('#wrBlur');
  const focusOn = () => {
    const n = [...form.elements].reduce((a, el) => a + (el.name && el.type !== 'select-one' ? el.value.length : 0), 0);
    blur.style.setProperty('--blur', Math.max(4, 34 - n * .32).toFixed(1) + 'px');
  };
  form.addEventListener('input', focusOn); focusOn();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim()) return;
    const m = { id: 'mine-' + Date.now().toString(36), name: d.name.trim(), from: d.from, to: d.to, cat: d.cat, for: d.for.trim(), by: d.by.trim() };
    mine = [...mine, m]; store.set('my-obits', mine);
    form.reset(); focusOn();
    renderIndex(); buildWall();
    DA.flatline(1.2); DA.toast('published in the index. rest well.');
    filter = 'all'; $$('.ix-filters button').forEach((x) => x.classList.toggle('is-on', x.dataset.f === 'all')); applyFilter(false);
    setTimeout(() => openRd(all().length - 1), 500);
  });
  if (G) gsap.from('#wrBlur span', { xPercent: 30, opacity: 0, stagger: .15, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.wr', start: 'top 70%' } });
})();
