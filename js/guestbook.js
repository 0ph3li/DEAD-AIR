/* ═══════════════════════════════════════════════════════════
   DEAD AIR · guestbook
   a book whose pages turn, a signature that writes itself,
   and a messenger where everyone you message is offline
   concept, design & code by ghostly.grl ♥
   ═══════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, motion, hasGsap, touch, store } = window.DA;
  const G = motion && hasGsap;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onReady = (fn) => (window.DA.isReady ? fn() : window.addEventListener('da:ready', fn, { once: true }));
  const EMO = { '(L)': '❤', '(F)': '🌹', ":'(": '😢', '(K)': '💋', ':)': '🙂', '(S)': '🌙', '(*)': '⭐', '(U)': '💔', ':(': '🙁', '(H)': '😎', ':P': '😛', '(Z)': '💤', '(G)': '🎁', '(8)': '🎵', '(I)': '💡', '(?)': '❓' };
  const emo = (t) => t.replace(/\(L\)|\(F\)|:'\(|\(K\)|:\)|\(S\)|\(\*\)|\(U\)|:\(|\(H\)|:P|\(Z\)|\(G\)|\(8\)|\(I\)|\(\?\)/g, (m) => `<span class="emo">${EMO[m]}</span>`);

  /* ═════════════ 01 · THE BOOK ═════════════ */
  const ENTRIES = [
    ['lil_sparkle_xo', 'midnight-thoughts.blog', 'you got me through 8th grade. rest easy ♡', 'mar 2013'],
    ['mark', '"girls trip 2019 🌴"', 'who added me to this', 'apr 2019'],
    ['jess', "jess's first profile", 'thank you for keeping me in your top 8 even when I didn\'t deserve it', 'jun 2011'],
    ['a little brother', 'SAVE FILE 03', 'I am still sorry about Pancake', 'jan 2006'],
    ['anon', 'Biscuit', 'I fed him every day in my head', 'sep 2001'],
    ['mom', 'the phone left in a taxi', 'home safe?', 'feb 2021'],
    ['raven', 'the xX_moonlight_Xx boards', 'bump. one last time.', 'dec 2012'],
    ['vera vale', 'everyone', 'The family thanks you all for coming. The lilies stay until Sunday.', 'always'],
    ['bea', '"girls trip 2019 🌴"', 'I would still go to Lisbon. Just saying.', 'may 2023'],
    ['someone', 'season 3', 'they were going to say it. I know they were.', 'aug 2020'],
    ['dez', 'the drafts folder', 'see you tonight at the dock. bring nothing.', 'today'],
    ['~*DaRkAnGeL*~', 'midnight-thoughts.blog', "i still know the password. i won't use it.", 'oct 2015'],
    ['kate', '"sad but make it summer"', 'track 87 was ours', 'jul 2023'],
    ['cache', 'the house', 'caw.', 'every night'],
  ].map(([name, to, msg, date]) => ({ name, to, msg, date }));
  let mine = store.get('gb-entries', []);
  const all = () => [...ENTRIES, ...mine];
  const PER = 5;
  const mobile = () => innerWidth < 761;
  const pages = () => { const a = all(), p = []; for (let i = 0; i < a.length; i += PER) p.push(a.slice(i, i + PER)); if (a.length % PER === 0) p.push([]); return p; };
  const pageHTML = (list, n) => `<p class="pg-head"><span>the guestbook</span><span>vol. 17</span></p>${
    list && list.length ? list.map((e) => `<div class="en${e.mine ? ' is-new' : ''}"><p class="en-msg">${esc(e.msg)}</p><p class="en-meta"><span><b>${esc(e.name)}</b> · <span class="en-for">for ${esc(e.to)}</span></span><span>${esc(e.date)}</span></p></div>`).join('')
      : '<p class="page-empty">this page is waiting for you.</p>'}`;
  const pgL = $('#pgL'), pgR = $('#pgR'), bookEl = $('#bookEl'), prevB = $('#bkPrev'), nextB = $('#bkNext'), lbl = $('#bkPage');
  let at = 0, turning = false; // desktop: spread index · mobile: page index
  const fillPage = (el, i) => { const p = pages(); el.innerHTML = pageHTML(p[i], i + 1); el.dataset.n = i < p.length ? i + 1 : ''; };
  const draw = () => {
    const p = pages();
    if (mobile()) { fillPage(pgR, at); lbl.textContent = `page ${at + 1} of ${p.length}`; prevB.disabled = at === 0; nextB.disabled = at >= p.length - 1; }
    else { fillPage(pgL, at * 2); fillPage(pgR, at * 2 + 1); lbl.textContent = `pages ${at * 2 + 1}–${at * 2 + 2} of ${p.length + (p.length % 2)}`; prevB.disabled = at === 0; nextB.disabled = at * 2 + 2 >= p.length; }
    $('#gkCount').textContent = `${all().length} signatures`;
  };
  // the leaf: a page that physically turns
  const turn = (dir) => new Promise((res) => {
    const p = pages(), max = mobile() ? p.length - 1 : Math.ceil(p.length / 2) - 1, to = at + dir;
    if (turning || to < 0 || to > max) return res();
    DA.noise(.35, 2400, .05, 900);
    if (!G || mobile()) {
      if (G) gsap.timeline({ onComplete: res }).to(pgR, { opacity: 0, x: -20 * dir, duration: .2 }).add(() => { at = to; draw(); }).fromTo(pgR, { opacity: 0, x: 20 * dir }, { opacity: 1, x: 0, duration: .35 });
      else { at = to; draw(); res(); }
      return;
    }
    turning = true;
    const leaf = document.createElement('div'); leaf.className = 'leaf leaf--' + (dir > 0 ? 'next' : 'prev');
    const front = document.createElement('div'), back = document.createElement('div');
    front.className = 'face front'; back.className = 'face back';
    const fp = document.createElement('div'), bp = document.createElement('div');
    if (dir > 0) {
      fp.className = 'page page--r'; fp.innerHTML = pgR.innerHTML; fp.dataset.n = pgR.dataset.n;
      bp.className = 'page page--l'; fillPage(bp, to * 2);
      fillPage(pgR, to * 2 + 1); // underneath, the new right page is already there
    } else {
      fp.className = 'page page--l'; fp.innerHTML = pgL.innerHTML; fp.dataset.n = pgL.dataset.n;
      bp.className = 'page page--r'; fillPage(bp, to * 2 + 1);
      fillPage(pgL, to * 2);
    }
    front.appendChild(fp); back.appendChild(bp);
    const shade = document.createElement('i'); shade.className = 'shade'; front.appendChild(shade);
    leaf.append(front, back); bookEl.appendChild(leaf);
    gsap.timeline({ onComplete: () => { at = to; draw(); leaf.remove(); turning = false; res(); } })
      .to(leaf, { rotateY: dir > 0 ? -180 : 180, duration: 1.1, ease: 'power2.inOut' })
      .to(shade, { opacity: 1, duration: .55, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
  });
  prevB.addEventListener('click', () => turn(-1));
  nextB.addEventListener('click', () => turn(1));
  window.addEventListener('resize', () => { if (!turning) { at = 0; draw(); } });
  draw();

  // signing: the ink appears letter by letter
  const sign = $('#sign');
  sign.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(sign));
    if (!d.name.trim() || !d.msg.trim()) { DA.toast('a name and a few words. that\'s all we ask.'); return; }
    const entry = { name: d.name.trim(), to: d.for || 'someone they never named', msg: d.msg.trim(), date: 'today', mine: true };
    mine = [...mine, entry]; store.set('gb-entries', mine);
    sign.reset();
    // turn to the page with the new signature
    const idx = all().length - 1, pIdx = Math.floor(idx / PER), target = mobile() ? pIdx : Math.floor(pIdx / 2);
    DA.scrollTo('#bookEl');
    await new Promise((r) => setTimeout(r, 700));
    if (target !== at) {
      if (target > at) { while (at < target) { const before = at; await turn(1); if (at === before) { at = target; draw(); break; } } }
      else { at = target; draw(); }
    } else draw();
    const els = $$('.en', bookEl), el = els[els.length - 1] && [...$$('.en.is-new', bookEl)].pop();
    if (!el) return;
    el.classList.add('is-writing');
    if (!G) { el.classList.remove('is-writing'); return; }
    const dur = Math.min(4, .4 + entry.msg.length * .045);
    const scratch = setInterval(() => DA.noise(.05, 4200 + Math.random() * 1500, .02), 120);
    gsap.timeline({ onComplete: () => { clearInterval(scratch); el.classList.remove('is-writing'); gsap.set($$('.en-msg, .en-meta', el), { clearProps: 'clipPath' }); DA.chime(); DA.toast('signed. the family will see it.'); } })
      .fromTo($('.en-msg', el), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: dur, ease: `steps(${Math.max(8, entry.msg.length)})` })
      .fromTo($('.en-meta', el), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .6, ease: 'power1.out' });
    count();
  });

  /* ═════════════ 02 · THE MESSENGER ═════════════ */
  const C = [
    { id: 'blog', name: 'midnight-thoughts.blog', pm: '~*~ if u read this ur cute ~*~', since: 'offline since march 2013', img: 'img/HOME/obit-blog.jpg',
      auto: '[auto-reply] not here rn. probably crying to the same song. leave a msg (L)',
      log: [['✿ lil_sparkle_xo ✿', '#b0479b', 'rest easy (L) u got me through 8th grade'], ['~*DaRkAnGeL*~', '#4b3a8c', "i still know the password. i won't use it :'("], ['mark', '#2f6bff', 'who added me to this']] },
    { id: 'chat', name: '"girls trip 2019 🌴"', pm: '11 members · notifications off', since: 'muted since april 2019', img: 'img/HOME/obit-chat.jpg',
      auto: '[auto-reply] this conversation is muted. notifications are off. so are we.',
      log: [['bea', '#b0479b', 'guys im still down for lisbon'], ['carla', '#2d7a4f', 'lol'], ['bea', '#b0479b', '...guys?']] },
    { id: 'profile', name: "jess's first profile", pm: 'mood: blah (8) now playing: a song that autoplays', since: 'last login: 2011', img: 'img/OBITUARIES/obit-profile.jpg',
      auto: '[auto-reply] thanks 4 the add!! pc4pc? (L)',
      log: [['tom', '#2f6bff', 'thanks for the add'], ['jess (2009)', '#b0479b', 'omg ur in my top 8 now :P']] },
    { id: 'save', name: 'SAVE FILE 03', pm: 'LV 64 · 112:40 · pancake ♞', since: 'corrupted in 2006', img: 'img/HOME/obit-save.jpg',
      auto: '[auto-reply] SAVE GAME?  ▶ YES   NO',
      log: [['little brother', '#8a5a00', 'sorry'], ['little brother (2019)', '#8a5a00', 'still sorry']] },
    { id: 'pet', name: 'Biscuit', pm: '♡ ♡ ♡ ○ ○ hungry', since: 'away since 2001', img: 'img/HOME/obit-pet.jpg',
      auto: '[auto-reply] (beep) (beep) (L)',
      log: [['you, age 9', '#4b3a8c', "i'm sorry biscuit i forgot :'("]] },
    { id: 'phone', name: 'the phone left in a taxi', pm: 'battery 1% · moving east', since: 'last seen 2:14 AM', img: 'img/OBITUARIES/obit-phone.webp',
      auto: "[auto-reply] I'm driving right now. I'll get back to you.",
      log: [['mom', '#8a5a00', 'home safe?'], ['mom', '#8a5a00', 'home safe??'], ['mom', '#8a5a00', 'call me when you see this (L)']] },
  ];
  const sent = store.get('gb-msn', {});
  let cur = 0, replied = new Set();
  const contacts = $('#contacts'), log = $('#chatLog'), typing = $('#chatTyping'), pic = $('#chatPic'), msn = $('#msn');
  contacts.innerHTML = C.map((c, i) => `<li data-i="${i}"><button type="button"><i class="ct-dot" aria-hidden="true"></i><span class="ct-txt"><b>${esc(c.name)}</b><i>${emo(esc(c.pm))}</i></span></button></li>`).join('');
  $('#cntN').textContent = C.length;
  const line = (cls, html) => { const p = document.createElement('p'); p.className = cls; p.innerHTML = html; log.appendChild(p); log.scrollTop = log.scrollHeight; if (G) gsap.from(p, { y: 10, opacity: 0, duration: .35 }); return p; };
  const says = (who, col, txt, cls = '') => line('cm ' + cls, `<span class="cm-who"><b style="--c:${col}">${esc(who)}</b> says:</span><span class="cm-txt">${emo(esc(txt))}</span>`);
  const open = (i) => {
    cur = i; const c = C[i];
    $$('li', contacts).forEach((l) => l.classList.toggle('is-on', +l.dataset.i === i));
    $('#chatName').textContent = c.name; $('#chatStatus').textContent = `(offline) · ${c.since}`; $('#chatPm').innerHTML = emo(esc(c.pm));
    pic.querySelector('img')?.remove(); pic.classList.remove('has-img'); delete pic.dataset.init; pic.dataset.img = c.img; DA.slot(pic);
    log.innerHTML = '';
    c.log.forEach(([w, col, t]) => says(w, col, t));
    const mineMsgs = sent[c.id] || [];
    if (mineMsgs.length) {
      line('cm-date', '— earlier —');
      mineMsgs.forEach((t) => { says('you', '#1b2f6b', t, 'cm--me'); });
      line('cm--sys', `${esc(c.name)} is offline. your messages will be delivered when they sign in.`);
    }
    typing.classList.remove('is-on');
  };
  contacts.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) { open(+li.dataset.i); DA.beep(880, .06, .015); } });
  open(0);

  const chatIn = $('#chatIn');
  let tTimers = [];
  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = chatIn.value.trim(); if (!t) return;
    const c = C[cur];
    says('you', '#1b2f6b', t, 'cm--me'); chatIn.value = '';
    (sent[c.id] = sent[c.id] || []).push(t); store.set('gb-msn', sent);
    DA.beep(1046, .07, .02); setTimeout(() => DA.beep(1318, .09, .02), 90);
    tTimers.forEach(clearTimeout); tTimers = [];
    const me = cur;
    tTimers.push(setTimeout(() => { if (me === cur) line('cm--sys', `${esc(c.name)} is offline. your message will be delivered when they sign in.`); }, 900));
    // sometimes, somebody starts typing
    if (!replied.has(c.id)) {
      replied.add(c.id);
      tTimers.push(setTimeout(() => { if (me !== cur) return; $('span', typing).textContent = `${c.name} is typing…`; typing.classList.add('is-on'); }, 2200));
      tTimers.push(setTimeout(() => {
        if (me !== cur) return; typing.classList.remove('is-on');
        if (Math.random() < .7) { says(c.name, '#7a5a8a', c.auto, 'cm--auto'); DA.beep(784, .08, .02); setTimeout(() => DA.beep(988, .1, .02), 100); }
        else line('cm--sys', '(…they stopped typing.)');
      }, 4600));
    }
    count();
  });
  chatIn.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatForm').requestSubmit(); } });

  // emoticons
  const grid = $('#emoGrid'), emoBtn = $('#emoBtn');
  grid.innerHTML = Object.entries(EMO).map(([k, v]) => `<button type="button" data-k="${esc(k)}" title="${esc(k)}">${v}</button>`).join('');
  emoBtn.addEventListener('click', () => { grid.hidden = !grid.hidden; emoBtn.setAttribute('aria-expanded', !grid.hidden); });
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const s = chatIn.selectionStart ?? chatIn.value.length;
    chatIn.value = chatIn.value.slice(0, s) + b.dataset.k + ' ' + chatIn.value.slice(chatIn.selectionEnd ?? s);
    chatIn.focus(); grid.hidden = true; emoBtn.setAttribute('aria-expanded', false);
  });

  // the nudge
  $('#nudgeBtn').addEventListener('click', () => {
    msn.classList.remove('is-nudged'); void msn.offsetWidth; msn.classList.add('is-nudged');
    line('cm--nudge', 'you have just sent a nudge.');
    [0, 110, 220, 330].forEach((t) => setTimeout(() => DA.beep(85, .09, .12, 'square'), t));
    store.set('nudges', store.get('nudges', 0) + 1); count();
    setTimeout(() => msn.classList.remove('is-nudged'), 700);
  });

  /* ═════════════ 03 · THE NUMBERS ═════════════ */
  const cand = () => Object.values(store.get('candles', {})).reduce((a, n) => a + n, 0);
  const vals = () => ({
    nSig: all().length + 2380,
    nMsg: 1204 + Object.values(sent).reduce((a, l) => a + l.length, 0),
    nNudge: 88 + store.get('nudges', 0),
    nCandle: 4562 + cand(),
  });
  let counted = false;
  const count = () => { if (!counted) return; const v = vals(); Object.entries(v).forEach(([id, n]) => { $('#' + id).textContent = n.toLocaleString('en-US'); }); };
  const runCount = () => {
    counted = true; const v = vals();
    Object.entries(v).forEach(([id, n]) => {
      const el = $('#' + id);
      if (!G) { el.textContent = n.toLocaleString('en-US'); return; }
      const o = { v: 0 }; gsap.to(o, { v: n, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
    });
  };
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { runCount(); o.disconnect(); } }, { threshold: .4 }).observe($('.gnum'));

  /* ═════════════ INTRO ═════════════ */
  const chars = [];
  $$('[data-split]').forEach((l) => {
    const t = l.textContent; l.textContent = ''; l.setAttribute('aria-label', t);
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; l.appendChild(s); chars.push(s); });
  });
  onReady(() => {
    if (!G) return;
    gsap.timeline()
      .fromTo(chars, { '--b': '30px', opacity: 0, yPercent: 30 }, { '--b': '0px', opacity: 1, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .05 })
      .from('.gk-sub', { x: 40, opacity: 0, filter: 'blur(10px)', duration: 1, ease: 'power3.out' }, '<.4')
      .from('.book', { rotateX: 30, y: 80, opacity: 0, duration: 1.5, ease: 'expo.out', transformPerspective: 1800 }, '<.1');
    gsap.from('.ms-title', { filter: 'blur(18px)', opacity: 0, y: 40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.ms-hd', start: 'top 85%' } });
    gsap.from('.msn', { y: 80, rotate: 1.5, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.msn', start: 'top 85%' } });
  });
})();
