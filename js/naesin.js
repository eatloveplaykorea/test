/* 내신 변형문제 자동 출제기 — 입력한 영어 본문으로 학교 내신 유형 문제를 생성 */
(function () {
  const { esc, CIRCLED, shuffle, toast } = JG;
  const $ = id => document.getElementById(id);

  const TYPES = [
    { key: 'blank', label: '빈칸 추론' },
    { key: 'order', label: '글의 순서' },
    { key: 'insert', label: '문장 삽입' },
    { key: 'grammar', label: '어법 (5지선다)' },
    { key: 'vocab', label: '어휘 (반의어)' },
    { key: 'arrange', label: '서술형: 배열 영작' },
    { key: 'firstletter', label: '서술형: 첫 글자 빈칸' },
    { key: 'words', label: '단어 테스트' },
  ];
  $('n-types').innerHTML = TYPES.map(t => `<label class="chip"><input type="checkbox" value="${t.key}" checked> ${t.label}</label>`).join('');

  const SAMPLE = `Every year, millions of tons of food are thrown away while many people around the world still go hungry. Much of this waste happens not on farms but in our own kitchens. We often buy more than we need, and we forget about the vegetables at the back of the refrigerator. Some people also throw away food simply because it looks imperfect, even though it is perfectly safe to eat. Fortunately, small changes in our habits can make a big difference. Planning meals carefully, storing food properly, and using leftovers creatively can greatly reduce the amount we waste. If each family took these simple steps, we could save money and protect the environment at the same time.

When Thomas Edison was asked about his many failed experiments, he famously answered that he had not failed but had found thousands of ways that did not work. This attitude reflects an important truth about learning. Mistakes are not the opposite of success; they are part of the process that leads to it. Students who are afraid of making errors tend to avoid difficult problems, so their growth slowly stops. In contrast, those who accept mistakes as useful information are more willing to try new approaches. Teachers can encourage this mindset by praising effort rather than talent. Over time, students learn that ability is not fixed and that it can increase through steady practice.`;
  $('n-sample').onclick = () => { $('n-text').value = SAMPLE; };

  const STOP = new Set('the a an and or but so of to in on at for with by from as is are was were be been being this that these those it its they them their we our you your he she his her i my me not no can could will would should may might must do does did have has had than then there here which who whom whose what when where why how also very just only more most such into about over after before because while if each other some any all many much'.split(' '));
  const ANTONYM = {
    increase: 'decrease', decrease: 'increase', reduce: 'increase', rise: 'fall', accept: 'reject', reject: 'accept',
    encourage: 'discourage', discourage: 'encourage', include: 'exclude', allow: 'prevent', prevent: 'allow',
    protect: 'damage', save: 'waste', waste: 'save', success: 'failure', failure: 'success', strong: 'weak', weak: 'strong',
    important: 'trivial', useful: 'useless', safe: 'dangerous', dangerous: 'safe', simple: 'complex', complex: 'simple',
    difficult: 'easy', easy: 'difficult', possible: 'impossible', willing: 'reluctant', afraid: 'confident', positive: 'negative',
    negative: 'positive', common: 'rare', rare: 'common', fixed: 'flexible', flexible: 'fixed', active: 'passive', passive: 'active',
    increase_: '', ancient: 'modern', modern: 'ancient', private: 'public', public: 'private', natural: 'artificial',
    artificial: 'natural', similar: 'different', different: 'similar', greatly: 'slightly', slowly: 'quickly', quickly: 'slowly',
    carefully: 'carelessly', properly: 'improperly', creatively: 'mechanically', imperfect: 'perfect', perfect: 'imperfect',
    hungry: 'full', big: 'small', small: 'big', avoid: 'seek', praise: 'criticize', praising: 'criticizing', steady: 'irregular',
    gain: 'lose', lose: 'gain', remember: 'forget', forget: 'remember', expand: 'shrink', benefit: 'harm', obvious: 'hidden',
    effort: 'luck', growth: 'decline', opposite: 'same', truth: 'myth', abundant: 'scarce', scarce: 'abundant', ignore: 'notice',
  };

  const splitSent = t => t.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+["”’']?/g)?.map(s => s.trim()).filter(Boolean) || [];
  const words = s => s.split(' ');
  const core = w => w.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
  const isContent = w => { const c = core(w).toLowerCase(); return c.length >= 5 && !STOP.has(c) && /^[a-z]+$/.test(c); };
  const replaceCore = (w, nw) => w.replace(core(w), nw);
  const keepCase = (orig, nw) => orig[0] === orig[0].toUpperCase() ? nw[0].toUpperCase() + nw.slice(1) : nw;
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* --- 각 유형 생성기: { stem, body(html), choices?, answer(text), lines? } 또는 null --- */
  const GEN = {
    blank(sents) {
      const cands = sents.map((s, i) => ({ s, i })).filter(o => o.i > 0 && words(o.s).length >= 8);
      if (!cands.length) return null;
      const { s, i } = pick(cands);
      const ws = words(s); const idxs = ws.map((w, k) => k).filter(k => isContent(ws[k]));
      if (!idxs.length) return null;
      const k = pick(idxs); const ans = core(ws[k]);
      const pool = [...new Set(sents.flatMap(words).filter(isContent).map(w => core(w).toLowerCase()))].filter(w => w !== ans.toLowerCase());
      if (pool.length < 4) return null;
      const opts = shuffle([ans.toLowerCase(), ...shuffle(pool).slice(0, 4)]);
      ws[k] = replaceCore(ws[k], '<span class="blank"></span>');
      const body = sents.map((x, j) => j === i ? ws.join(' ') : esc(x)).join(' ');
      return { stem: '다음 빈칸에 들어갈 말로 가장 적절한 것은?', body, choices: opts, answer: CIRCLED[opts.indexOf(ans.toLowerCase())] + ' ' + ans.toLowerCase() };
    },
    order(sents) {
      if (sents.length < 4) return null;
      const rest = sents.slice(1), n = rest.length;
      const a = Math.max(1, Math.round(n / 3)), b = Math.max(a + 1, Math.round((2 * n) / 3));
      const groups = [rest.slice(0, a), rest.slice(a, b), rest.slice(b)].filter(g => g.length);
      if (groups.length < 3) return null;
      const labels = shuffle(['A', 'B', 'C']); // groups[i] -> labels[i]
      const correct = labels.map(l => `(${l})`).join(' - ');
      const perms = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'].map(p => p.split('').map(l => `(${l})`).join(' - '));
      const opts = [correct, ...shuffle(perms.filter(p => p !== correct)).slice(0, 4)].sort();
      const shown = ['A', 'B', 'C'].map(l => `(${l}) ${esc(groups[labels.indexOf(l)].join(' '))}`).join('<br>');
      return { stem: '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?', body: `<div class="summary-box">${esc(sents[0])}</div>${shown}`, choices: opts, answer: CIRCLED[opts.indexOf(correct)] + ' ' + correct };
    },
    insert(sents) {
      if (sents.length < 5) return null;
      const k = 2 + Math.floor(Math.random() * (sents.length - 2)); // 제거할 문장(첫 두 문장 제외)
      const r = sents.filter((_, i) => i !== k);
      const gaps = r.map((_, j) => j).filter(j => j >= 1).concat([r.length]); // j: r[j] 앞 (r.length = 끝)
      const uniq = [...new Set(gaps)];
      const nOpt = Math.min(5, uniq.length);
      let start = Math.max(0, Math.min(uniq.indexOf(k) - Math.floor(Math.random() * nOpt), uniq.length - nOpt));
      const chosen = uniq.slice(start, start + nOpt);
      let body = '', no = 0;
      r.forEach((s, j) => { if (chosen.includes(j)) body += ` ( ${CIRCLED[no++]} ) `; body += esc(s) + ' '; });
      if (chosen.includes(r.length)) body += ` ( ${CIRCLED[no++]} )`;
      return { stem: '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?', body: `<div class="summary-box">${esc(sents[k])}</div>${body}`, choices: CIRCLED.slice(0, nOpt), answer: CIRCLED[chosen.indexOf(k)] };
    },
    grammar(sents) {
      const RULES = [
        [/^is$/i, 'are'], [/^are$/i, 'is'], [/^was$/i, 'were'], [/^were$/i, 'was'], [/^has$/i, 'have'], [/^have$/i, 'has'],
        [/^does$/i, 'do'], [/^which$/i, 'what'], [/^that$/i, 'what'], [/^who$/i, 'which'],
        [/^[a-z]{3,}[^i]ly$/i, w => w.slice(0, -2)], [/^[a-z]{3,}ily$/i, w => w.slice(0, -3) + 'y'],
        [/^[a-z]{3,}[^i]ed$/i, w => w.slice(0, -2) + 'ing'],
      ];
      const toks = []; // {si, wi, orig, wrong}
      sents.forEach((s, si) => words(s).forEach((w, wi) => {
        const c = core(w); if (!c) return;
        for (const [re, f] of RULES) if (re.test(c) && !['only', 'early', 'family', 'likely', 'daily', 'friendly', 'need', 'used', 'reply', 'apply', 'supply'].includes(c.toLowerCase())) {
          toks.push({ si, wi, orig: c, wrong: keepCase(c, typeof f === 'string' ? f : f(c.toLowerCase())) }); break;
        }
      }));
      if (toks.length < 5) return null;
      const chosen = shuffle(toks).slice(0, 5).sort((a, b) => a.si - b.si || a.wi - b.wi);
      const wrongIdx = Math.floor(Math.random() * 5);
      const sw = sents.map(words);
      chosen.forEach((t, n) => {
        const w = sw[t.si][t.wi];
        sw[t.si][t.wi] = replaceCore(esc(w), `${CIRCLED[n]}<u>${n === wrongIdx ? t.wrong : t.orig}</u>`);
      });
      const body = sw.map((ws, si) => ws.map((w, wi) => chosen.some(t => t.si === si && t.wi === wi) ? w : esc(w)).join(' ')).join(' ');
      const t = chosen[wrongIdx];
      return { stem: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?', body, choices: CIRCLED.slice(0, 5), answer: `${CIRCLED[wrongIdx]} ${t.wrong} → ${t.orig}` };
    },
    vocab(sents) {
      const all = []; sents.forEach((s, si) => words(s).forEach((w, wi) => all.push({ si, wi, c: core(w) })));
      const hits = all.filter(o => ANTONYM[o.c.toLowerCase()]);
      if (!hits.length) return null;
      const target = pick(hits);
      const fillers = shuffle(all.filter(o => o !== target && isContent(o.c) && o.si !== undefined)).filter((o, i, arr) => arr.findIndex(x => x.c === o.c) === i).slice(0, 4);
      if (fillers.length < 4) return null;
      const chosen = [target, ...fillers].sort((a, b) => a.si - b.si || a.wi - b.wi);
      const sw = sents.map(words);
      const out = sw.map((ws, si) => ws.map((w, wi) => {
        const n = chosen.findIndex(o => o.si === si && o.wi === wi);
        if (n < 0) return esc(w);
        const shown = chosen[n] === target ? keepCase(target.c, ANTONYM[target.c.toLowerCase()]) : chosen[n].c;
        return replaceCore(esc(w), `${CIRCLED[n]}<u>${shown}</u>`);
      }).join(' ')).join(' ');
      const n = chosen.indexOf(target);
      return { stem: '다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?', body: out, choices: CIRCLED.slice(0, 5), answer: `${CIRCLED[n]} ${ANTONYM[target.c.toLowerCase()]} → ${target.c}` };
    },
    arrange(sents) {
      const c = sents.filter(s => { const n = words(s).length; return n >= 7 && n <= 18; });
      if (!c.length) return null;
      const s = pick(c);
      const ws = words(s.replace(/[.!?]+["”’']?$/, '')).map(w => w.replace(/[,;:]$/, ''));
      const scr = shuffle(ws.map(w => w[0].toLowerCase() + w.slice(1) === w.toLowerCase() || /^I\b/.test(w) ? w : w[0].toLowerCase() + w.slice(1)));
      return { stem: '[서술형] 다음 문장의 의미가 되도록 주어진 단어를 바르게 배열하시오.', body: `<div class="passage plain"><b>&lt;보기&gt;</b> ${scr.map(esc).join(' / ')}</div>`, lines: 2, answer: s };
    },
    firstletter(sents) {
      const sw = sents.map(words);
      const cands = []; sw.forEach((ws, si) => ws.forEach((w, wi) => { if (isContent(w)) cands.push({ si, wi }); }));
      if (cands.length < 5) return null;
      const chosen = shuffle(cands).slice(0, 5).sort((a, b) => a.si - b.si || a.wi - b.wi);
      const ans = [];
      const body = sw.map((ws, si) => ws.map((w, wi) => {
        const n = chosen.findIndex(o => o.si === si && o.wi === wi);
        if (n < 0) return esc(w);
        const c = core(w); ans.push(`(${n + 1}) ${c}`);
        return replaceCore(esc(w), `(${n + 1}) ${c[0]}<span class="blank" style="min-width:60px"></span>`);
      }).join(' ')).join(' ');
      return { stem: '[서술형] 글의 흐름에 맞게 주어진 첫 글자로 시작하는 단어를 쓰시오.', body, answer: ans.join(', ') };
    },
    words(sents) {
      const list = [...new Set(sents.flatMap(words).map(w => core(w).toLowerCase()).filter(w => w.length >= 7 && !STOP.has(w)))];
      if (list.length < 3) return null;
      const pickList = shuffle(list).slice(0, 10);
      const body = `<table style="width:100%;border-collapse:collapse">${pickList.map((w, i) => `<tr><td style="border:1px solid #999;padding:4px 8px;width:45%">${i + 1}. ${esc(w)}</td><td style="border:1px solid #999"></td></tr>`).join('')}</table>`;
      return { stem: '[단어] 다음 단어의 뜻을 쓰시오.', body, plainBody: true, answer: '교과서 단어장 참고: ' + pickList.join(', ') };
    },
  };

  let lastArgs = null;
  function build() {
    const text = $('n-text').value.trim();
    if (!text) return toast('영어 본문을 입력해 주세요.');
    const passages = text.split(/\n\s*\n/).map(splitSent).filter(s => s.length >= 2);
    if (!passages.length) return toast('문장을 인식하지 못했습니다. 마침표가 있는 영어 문장을 넣어 주세요.');
    const types = [...document.querySelectorAll('#n-types input:checked')].map(b => b.value);
    if (!types.length) return toast('출제 유형을 하나 이상 고르세요.');
    const sets = +$('n-sets').value;
    const items = []; let skipped = 0;
    passages.forEach((sents, pi) => {
      for (let r = 0; r < sets; r++) types.forEach(t => {
        if (t === 'words' && r > 0) return;
        const q = GEN[t](sents);
        if (q) items.push({ ...q, pi, type: t }); else skipped++;
      });
    });
    lastArgs = true;
    render(items, passages.length);
    if (skipped) toast(`본문이 짧아 ${skipped}개 유형은 건너뛰었습니다.`);
  }

  function render(items, pcount) {
    let no = 1, curP = -1;
    const qs = items.map(q => {
      let head = '';
      if (q.pi !== curP) { curP = q.pi; head = `<div class="question" style="column-span:all"><span class="badge orange">지문 ${q.pi + 1}</span></div>`; }
      const n = no++; q.no = n;
      return head + `
        <div class="question">
          <div class="stem"><span class="num">${n}.</span>${esc(q.stem)}</div>
          <div class="passage ${q.plainBody || q.type === 'arrange' ? 'plain' : ''}">${q.body}</div>
          ${q.choices ? `<ol class="choices ${q.choices.every(c => c.length <= 4) ? 'inline' : ''}">${q.choices.map((c, k) => `<li>${c.length <= 4 && CIRCLED.includes(c) ? c : CIRCLED[k] + ' ' + esc(c)}</li>`).join('')}</ol>` : ''}
          ${q.lines ? '<div class="write-line"></div>'.repeat(q.lines) : (!q.choices && q.type !== 'words' ? '<div class="write-line"></div>' : '')}
        </div>`;
    }).join('');
    $('n-paper').innerHTML = `
      <div class="paper">
        <div class="paper-head">
          <div class="sub">중계동 ${esc($('n-school').value)} · ${esc($('n-term').value)} 내신 대비</div>
          <h2>영어 내신 변형문제</h2>
          <div class="paper-meta"><span>범위: ${esc($('n-unit').value)} · 지문 ${pcount}개 · ${items.length}문항</span><span>이름 <b></b> 점수 <b></b></span></div>
        </div>
        <div class="questions">${qs}</div>
        <div class="answer-key"><h3>정답</h3><table>${items.map(q => `<tr><th>${q.no}</th><td>${esc(q.answer)}</td></tr>`).join('')}</table></div>
      </div>`;
    $('n-actions').hidden = false;
  }

  $('ns-form').onsubmit = e => { e.preventDefault(); build(); };
  $('n-regen').onclick = () => lastArgs && build();
  $('n-print').onclick = () => { document.body.classList.remove('print-hide-answers'); window.print(); };
  $('n-print-q').onclick = () => { document.body.classList.add('print-hide-answers'); window.print(); document.body.classList.remove('print-hide-answers'); };
})();
