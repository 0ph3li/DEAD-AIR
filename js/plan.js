/* ═══════════════════════════════════════════════════════════
   DEAD AIR · plan a funeral
   six steps, a program that writes itself, music you can hear,
   a calendar with other people's funerals in it, a receipt,
   a printer, and a real .ics
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));
  const money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);

  /* ═════════════ THE PRICE LIST ═════════════ */
  const SERVICE = {
    cremation: { name: 'Cremation', price: 0, line: 'The cremation · shift + delete, by Vera Vale' },
    burial: { name: 'Burial', price: 4.99, note: '/mo', line: 'The burial · laid to rest in /archive' },
    viking: { name: 'Viking', price: 0, note: 'on request', line: 'The send-off · set adrift from the dock' },
  };
  const CASKET = { window: ['The Window', 0], terminal: ['The Terminal', 0], notification: ['The Notification', 15], polaroid: ['The Polaroid', 25] };
  const MUSIC = { organ: 'Chapel organ', dialup: 'Dial-up hymn', ringtone: 'An old ringtone, slowed down', silence: 'Dead air (three minutes)' };
  const FLOWERS = { unfollow: ['The Unfollow', 29, 'img/HOME/flor-unfollow.webp'], seen: ['Seen 3:12 AM', 44, 'img/HOME/flor-seen.webp'], offline: ['Forever Offline', 88, 'img/HOME/flor-offline.webp'], battery: ['Low Battery', 1, 'img/HOME/flor-battery.webp'], none: ['No flowers', 0, ''] };
  // the same extras as on the services page (same ids, so choices carry over)
  const EXTRAS = [
    ['eulogy', 'A eulogy, written by Dez', 40],
    ['mourner', 'Professional mourner', 30, 'likes every old post · one hour'],
    ['receipts', 'Read receipts, turned off forever', 9],
    ['anniversary', 'A last post, scheduled for the anniversary', 15],
    ['password', 'Password, cremated separately', 5],
    ['unfollow', 'Mutual unfollow ceremony', 12],
    ['open', 'Open casket', 60, 'profile public for one last day'],
    ['closed', 'Closed casket', 0, 'private, forever'],
    ['crow', 'Cache the crow attends', 3, 'plus something shiny'],
  ];
  const TIMES = ['10:00', '12:00', '14:15', '16:00', '18:30', '21:00', '23:45'];

  /* ═════════════ STATE · whatever you chose anywhere on the site ═════════════ */
  const form = $('#plForm');
  const saved = store.get('plan', {}) || {};
  const S = Object.assign({ name: '', from: '', to: '', kind: 'profile', ep: 'gone but cached', service: 'cremation', room: 'Chapel A', day: 0, time: '', casket: 'window', music: 'organ', flowers: 'unfollow' }, saved);
  let extras = store.get('extras', []);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayAt = (i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; };
  if (typeof S.day !== 'number' || S.day > 13) S.day = 0;

  $('#plRef').textContent = String(Math.floor((Date.now() / 1000) % 10000)).padStart(4, '0');
  $('#plToday').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase();

  // fill the form from the state
  ['name', 'from', 'to'].forEach((k) => { form.elements[k].value = S[k] || ''; });
  form.elements.kind.value = S.kind;
  const check = (name, v) => { const r = form.querySelector(`input[name="${name}"][value="${CSS.escape(v)}"]`); if (r) r.checked = true; };
  ['ep', 'service', 'room', 'casket', 'music', 'flowers'].forEach((k) => check(k, S[k]));

  // extras list
  $('#xtra').innerHTML = EXTRAS.map(([id, n, p, sub]) => `<label><input type="checkbox" name="x" value="${id}"${extras.includes(id) ? ' checked' : ''}><i class="box" aria-hidden="true"></i><span class="xn">${esc(n)}${sub ? ` <small>(${esc(sub)})</small>` : ''}</span><span class="xp">${p ? money(p) : 'free'}</span></label>`).join('');

  /* ═════════════ THE CALENDAR · other people are dying too ═════════════ */
  const taken = (d, t) => { const n = (d * 31 + TIMES.indexOf(t) * 17 + today.getDate() * 7) % 11; return n < 3; };
  const past = (d, t) => { if (d) return false; const [h, m] = t.split(':').map(Number); const n = new Date(); return h * 60 + m <= n.getHours() * 60 + n.getMinutes() + 30; };
  const cal = $('#cal'), times = $('#times');
  cal.innerHTML = Array.from({ length: 14 }, (_, i) => {
    const d = dayAt(i);
    return `<button type="button" role="radio" data-d="${i}" class="${i ? '' : 'is-today'}" aria-checked="false" aria-label="${d.toDateString()}">${d.toLocaleDateString('en-GB', { weekday: 'short' }).toLowerCase()}<b>${d.getDate()}</b></button>`;
  }).join('');
  $('#calMonth').textContent = '· ' + today.toLocaleDateString('en-GB', { month: 'long' }).toLowerCase() + (dayAt(13).getMonth() !== today.getMonth() ? ' / ' + dayAt(13).toLocaleDateString('en-GB', { month: 'long' }).toLowerCase() : '');
  const drawTimes = () => {
    times.innerHTML = TIMES.map((t) => `<button type="button" role="radio" data-t="${t}" aria-checked="${S.time === t}"${taken(S.day, t) || past(S.day, t) ? ' disabled' : ''}>${t}</button>`).join('');
    if (!S.time || taken(S.day, S.time) || past(S.day, S.time)) {
      const free = TIMES.find((t) => !taken(S.day, t) && !past(S.day, t));
      if (free) S.time = free; else { S.day = (S.day + 1) % 14; return drawTimes(); }
      $$('button', times).forEach((b) => b.setAttribute('aria-checked', b.dataset.t === S.time));
    }
    $$('button', cal).forEach((b) => b.setAttribute('aria-checked', +b.dataset.d === S.day));
  };
  cal.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; S.day = +b.dataset.d; S.time = ''; drawTimes(); update(); DA.beep(700, .05, .02); });
  times.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; S.time = b.dataset.t; drawTimes(); update(); DA.beep(900, .05, .02); });

  // vikings leave from the dock, and only vikings do
  const rooms = () => {
    const v = S.service === 'viking';
    $$('input[name="room"]', form).forEach((r) => { r.disabled = v ? r.value !== 'The Dock' : r.value === 'The Dock'; });
    if (v) S.room = 'The Dock'; else if (S.room === 'The Dock') S.room = 'Chapel A';
    check('room', S.room);
  };

  /* ═════════════ THE PROGRAM · it writes itself ═════════════ */
  const pg = { name: $('#pgName'), yrs: $('#pgYrs'), ep: $('#pgEp'), casket: $('#pgCasket'), cname: $('#pgCasketName'), order: $('#pgOrder'), room: $('#pgRoom'), date: $('#pgDate'), time: $('#pgTime'), fl: $('#pgFl') };
  const carve = (el, v) => { if (el.textContent === v) return; el.textContent = v; el.classList.remove('is-carved'); void el.offsetWidth; el.classList.add('is-carved'); };
  let lastFl = null;
  const update = () => {
    S.name = form.elements.name.value.trim(); S.from = form.elements.from.value; S.to = form.elements.to.value; S.kind = form.elements.kind.value;
    ['ep', 'service', 'room', 'casket', 'music', 'flowers'].forEach((k) => { const r = form.querySelector(`input[name="${k}"]:checked`); if (r) S[k] = r.value; });
    extras = $$('input[name="x"]:checked', form).map((x) => x.value);
    rooms();
    store.set('plan', { name: S.name, from: S.from, to: S.to, kind: S.kind, ep: S.ep, service: S.service, room: S.room, day: S.day, time: S.time, casket: S.casket, music: S.music, flowers: S.flowers });
    store.set('extras', extras);

    carve(pg.name, S.name || 'the deceased');
    carve(pg.yrs, `${S.from || '?'} — ${S.to || '?'}`);
    carve(pg.ep, S.ep);
    pg.casket.dataset.style = S.casket; pg.cname.textContent = S.name || 'the deceased';
    const ex = EXTRAS.filter((e) => extras.includes(e[0]) && !['eulogy', 'receipts', 'password', 'closed'].includes(e[0]));
    pg.order.innerHTML = [
      S.flowers === 'none' ? 'Arrival · no flowers, as requested' : `Arrival · ${FLOWERS[S.flowers][0].toLowerCase()} at the door`,
      'Reading of the comments · all of them',
      `Music · ${MUSIC[S.music].toLowerCase()}`,
      SERVICE[S.service].line,
      extras.includes('eulogy') ? 'A eulogy, by Dez Vale' : 'Closing words, by Vera Vale',
      'A moment of silence',
    ].map((t) => `<li><span>${esc(t)}</span></li>`).join('') + ex.map((e) => `<li class="is-x"><span>${esc(e[1])}</span></li>`).join('');
    const d = dayAt(S.day);
    carve(pg.room, S.room);
    carve(pg.date, d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase());
    carve(pg.time, S.time || '—');
    if (lastFl !== S.flowers) {
      lastFl = S.flowers;
      pg.fl.querySelector('img')?.remove(); pg.fl.classList.remove('has-img'); delete pg.fl.dataset.init;
      pg.fl.dataset.img = FLOWERS[S.flowers][2]; if (FLOWERS[S.flowers][2]) DA.slot(pg.fl);
      pg.fl.style.visibility = FLOWERS[S.flowers][2] ? '' : 'hidden';
    }
    if (step === 5) receipt();
  };

  /* ═════════════ THE RECEIPT ═════════════ */
  const total = () => {
    const lines = [];
    const sv = SERVICE[S.service];
    lines.push([sv.name, sv.note === 'on request' ? 'on request' : money(sv.price) + (sv.note || ''), sv.price]);
    lines.push([`Casket · ${CASKET[S.casket][0]}`, CASKET[S.casket][1] ? money(CASKET[S.casket][1]) : 'included', CASKET[S.casket][1]]);
    lines.push([`Flowers · ${FLOWERS[S.flowers][0]}`, FLOWERS[S.flowers][1] ? money(FLOWERS[S.flowers][1]) : '—', FLOWERS[S.flowers][1]]);
    lines.push([`Music · ${MUSIC[S.music]}`, 'included', 0]);
    EXTRAS.filter((e) => extras.includes(e[0])).forEach((e) => lines.push([e[1], e[2] ? money(e[2]) : 'free', e[2]]));
    return lines;
  };
  const receipt = () => {
    const lines = total(), sum = lines.reduce((a, l) => a + l[2], 0), d = dayAt(S.day);
    $('#rcpt').innerHTML = `<h3>${esc(S.name || 'the deceased')}</h3>
      <div class="rl rl--edit"><span>${esc(S.room)} · ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${S.time}</span><span><button type="button" data-go="2">change</button></span></div>
      ${lines.map((l) => `<div class="rl"><span>${esc(l[0])}</span><span>${esc(l[1])}</span></div>`).join('')}
      <div class="rl rl--tot"><span>total today</span><span>${money(sum)}${S.service === 'burial' ? ' + $4.99/mo' : ''}</span></div>
      <p class="rcpt-bye">THANK YOU · WE'RE SO SORRY · ♡</p>`;
  };

  /* ═════════════ STEPS ═════════════ */
  const steps = $$('.st', form), tabs = $$('#plSteps li'), next = $('#plNext'), back = $('#plBack');
  let step = 0, busy = false;
  const valid = (i) => {
    if (i === 0 && !form.elements.name.value.trim()) { $('#errName').textContent = 'we need a name. even a nickname. even "it".'; form.elements.name.focus(); DA.beep(200, .2, .04, 'square'); return false; }
    if (i === 5 && !$('#sure').checked) { $('#errSure').textContent = 'please tick the box. we have to ask.'; DA.beep(200, .2, .04, 'square'); return false; }
    $('#errName').textContent = ''; $('#errSure').textContent = '';
    return true;
  };
  const show = (i, dir = 1) => {
    if (busy || i === step && steps[i].hidden === false && i !== 0) return;
    const from = steps[step], to = steps[i];
    const swap = () => {
      from.hidden = true; to.hidden = false; step = i;
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.classList.toggle('is-done', k < i); });
      $('#plBar').style.width = ((i + 1) / steps.length * 100) + '%';
      back.disabled = i === 0;
      next.querySelector('span').textContent = i === 5 ? 'Confirm the service' : 'Next';
      if (i === 5) receipt();
      if (i === 2) drawTimes();
      const top = $('.pl-steps').getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top + 40) DA.scrollTo(top);
    };
    if (!G || from === to) { swap(); return; }
    busy = true;
    gsap.timeline({ onComplete: () => { busy = false; } })
      .to(from, { x: -40 * dir, opacity: 0, filter: 'blur(10px)', duration: .3, ease: 'power2.in' })
      .add(swap)
      .fromTo(to, { x: 40 * dir, opacity: 0, filter: 'blur(10px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: .55, ease: 'power3.out', clearProps: 'filter,transform,opacity' })
      .from($$('.st-q, .fld, .chips, .svc-pick > *, .rooms, .cal-wrap, .caskets, .music, .flowers, .xtra label, .rcpt, .consent', to), { y: 16, opacity: 0, stagger: .03, duration: .4, clearProps: 'all' }, '<.05');
    DA.beep(i > step ? 620 : 420, .07, .02);
  };
  next.addEventListener('click', () => {
    if (!valid(step)) return;
    if (step === 5) return confirm();
    show(step + 1, 1);
  });
  back.addEventListener('click', () => step > 0 && show(step - 1, -1));
  tabs.forEach((t, k) => $('button', t).addEventListener('click', () => { if (k > step && !valid(0)) return; show(k, k > step ? 1 : -1); }));
  form.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b && form.contains(b)) show(+b.dataset.go, -1); });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.elements.name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next.click(); } });

  /* ═════════════ MUSIC · hear it before you choose it ═════════════ */
  let playT = [];
  const stopPlay = () => { playT.forEach(clearTimeout); playT = []; $$('.play').forEach((p) => { p.classList.remove('is-on'); p.textContent = '▶ listen'; }); };
  const at = (ms, fn) => playT.push(setTimeout(fn, ms));
  const tone = (f, d, v, type = 'sine') => DA.beep(f, d, v, type);
  const TRACKS = {
    organ: () => { [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 207.7, 246.9]].forEach((c, i) => at(i * 1100, () => c.forEach((f) => { tone(f, 1.4, .02, 'sine'); tone(f * 2, 1.2, .008, 'sine'); }))); return 4600; },
    dialup: () => {
      [[0, 1270], [180, 2100], [360, 1270], [540, 2100]].forEach(([t, f]) => at(t, () => tone(f, .16, .03, 'square')));
      at(900, () => DA.noise(.9, 1900, .05, 900)); at(1900, () => DA.noise(.7, 2800, .04, 1200)); at(2700, () => { tone(980, .5, .02, 'sawtooth'); tone(1180, .5, .015, 'sawtooth'); }); at(3300, () => DA.noise(1, 1500, .04, 3600));
      return 4400;
    },
    // a public-domain waltz phrase (Tárrega, 1902), slowed down and an octave lower
    ringtone: () => {
      const N = [[659, 1], [587, 1], [370, 2], [415, 2], [554, 1], [494, 1], [294, 2], [330, 2], [494, 1], [440, 1], [277, 2], [330, 2], [440, 4]];
      let t = 0; N.forEach(([f, d]) => { at(t, () => tone(f / 2, d * .26, .035, 'triangle')); t += d * 260; });
      return t + 400;
    },
    silence: () => { DA.toast('(this is it. this is the song.)'); return 3000; },
  };
  form.addEventListener('click', (e) => {
    const p = e.target.closest('.play'); if (!p) return;
    e.preventDefault();
    const was = p.classList.contains('is-on'); stopPlay(); if (was) return;
    check('music', p.dataset.play); update();
    DA.duck(true); p.classList.add('is-on'); p.textContent = '■ stop';
    const len = TRACKS[p.dataset.play]();
    at(len, () => { stopPlay(); DA.duck(false); });
  });

  /* ═════════════ THE PROGRAM LEANS TOWARD YOU ═════════════ */
  const prog = $('#prog');
  if (G && !touch) {
    const wrap = $('.prog-wrap');
    wrap.addEventListener('pointermove', (e) => { const r = prog.getBoundingClientRect(); gsap.to(prog, { rotateY: ((e.clientX - r.left) / r.width - .5) * 10, rotateX: -((e.clientY - r.top) / r.height - .5) * 8, duration: .6 }); });
    wrap.addEventListener('pointerleave', () => gsap.to(prog, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
  }

  /* ═════════════ CONFIRM · the printer ═════════════ */
  const booked = $('#booked');
  let ecg = null, bookNo = '';
  const confirm = () => {
    stopPlay();
    bookNo = 'DA-' + String(Math.floor(Math.random() * 9000) + 1000);
    store.set('booking', { no: bookNo, ...S, extras, at: Date.now() });
    $('#bkNo').textContent = bookNo;
    const d = dayAt(S.day);
    $('#bkSub').textContent = `${S.name}, ${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at ${S.time}, ${S.room}. The lilies are being ordered. Vera has been told.`;
    const paper = $('#bkPaper'); paper.innerHTML = ''; const copy = prog.cloneNode(true); copy.removeAttribute('id'); $$('[id]', copy).forEach((x) => x.removeAttribute('id')); paper.appendChild(copy);
    booked.hidden = false; document.documentElement.classList.add('rd-open'); DA.lenis?.stop();
    if (!ecg) ecg = new DA.Ecg($('#bkEcg'), { lw: 1.6, speed: .4, bpm: 70 });
    ecg.amp = 1; ecg.bpm = 70; ecg.start(); ecg.resize();
    $('#bkPrint').focus({ preventScroll: true });
    if (!G) return;
    gsap.timeline()
      .fromTo(booked, { opacity: 0 }, { opacity: 1, duration: .5 })
      .from('.bk-no, .bk-title, .bk-sub', { y: 30, opacity: 0, filter: 'blur(14px)', stagger: .12, duration: 1, ease: 'expo.out' }, '<.2')
      .fromTo(copy, { yPercent: -100 }, { yPercent: 0, duration: 3, ease: 'steps(14)', onStart: () => { for (let i = 0; i < 14; i++) setTimeout(() => DA.noise(.12, 3000 + (i % 3) * 400, .025), i * 214); } }, '<.3')
      .from('.bk-act > *', { y: 16, opacity: 0, stagger: .06, duration: .5 })
      .to(ecg, { amp: 0, bpm: 40, duration: 1.2, onComplete: () => DA.flatline(1.4) }, '<')
      .add(() => DA.chime(), '+=1.2');
  };
  const closeBooked = () => { booked.hidden = true; document.documentElement.classList.remove('rd-open'); DA.lenis?.start(); ecg?.stop(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !booked.hidden) closeBooked(); });
  $('#bkPrint').addEventListener('click', () => window.print());
  $('#bkAgain').addEventListener('click', () => {
    closeBooked();
    form.elements.name.value = ''; form.elements.from.value = ''; form.elements.to.value = ''; $('#sure').checked = false;
    $$('input[name="x"]', form).forEach((x) => { x.checked = false; });
    update(); show(0, -1); DA.scrollTo(0);
  });
  // a real calendar file
  $('#bkIcs').addEventListener('click', () => {
    const d = dayAt(S.day), [h, m] = S.time.split(':').map(Number); d.setHours(h, m, 0, 0);
    const p = (n) => String(n).padStart(2, '0');
    const f = (x) => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
    const t = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const now = new Date(); const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}00Z`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dead Air//Funeral Directors//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${bookNo}-${Date.now()}@dead-air.fictional`, `DTSTAMP:${stamp}`, `DTSTART:${f(d)}`, 'DURATION:PT45M',
      `SUMMARY:${t(`Funeral: ${S.name} (Dead Air)`)}`, `LOCATION:${t(`${S.room}, 404 Lilac Lane, Server Room B`)}`,
      `DESCRIPTION:${t(`${SERVICE[S.service].name} service for ${S.name}${S.from || S.to ? ` (${S.from || '?'}–${S.to || '?'})` : ''}. ${S.ep}. Booking ${bookNo}. Dress code: black, or your old display name.`)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Funeral in one hour. Bring tissues.', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `funeral-${(S.name || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.ics`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    DA.toast('added. we will be there. we always are.');
  });

  /* ═════════════ INTRO ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = ''; l.setAttribute('aria-label', t);
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c === ' ' ? ' ' : c; l.appendChild(s); chars.push(s); });
  });
  drawTimes(); update();
  // start where it makes sense: if a name came from the home, skip to the service
  tabs[0].classList.add('is-on'); back.disabled = true; $('#plBar').style.width = (100 / 6) + '%';
  onReady(() => {
    if (!G) return;
    gsap.timeline()
      .fromTo(chars, { '--b': '30px', opacity: 0, yPercent: 30 }, { '--b': '0px', opacity: 1, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .04 })
      .fromTo('.pl-sub', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' }, '<.5')
      .from('.pl-steps li', { y: 14, opacity: 0, stagger: .05, duration: .5 }, '<')
      .from('.st:not([hidden]), .pl-nav', { y: 30, opacity: 0, duration: .8, ease: 'power3.out' }, '<.2')
      .from(prog, { y: 120, rotate: 4, opacity: 0, duration: 1.4, ease: 'expo.out' }, '<');
  });
})();
