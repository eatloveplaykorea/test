/* 모의고사 생성기 */
(function () {
  const { esc, CIRCLED, shuffle, toast, safeGet, safeSet } = JG;
  const TYPES = window.QUESTION_TYPES;
  const CUSTOM_KEY = 'jg_custom_q_v1';
  const $ = id => document.getElementById(id);
  let current = [];

  const custom = () => safeGet(CUSTOM_KEY, []);
  const bank = () => window.QUESTION_BANK.concat(custom());
  const typeOrder = Object.fromEntries(TYPES.map((t, i) => [t.key, i]));

  // 유형 체크박스
  $('type-checks').innerHTML = TYPES.map(t =>
    `<label class="chip"><input type="checkbox" value="${t.key}" checked> ${t.label}</label>`).join('');
  $('c-type').innerHTML = TYPES.map(t => `<option value="${t.key}">${t.label}</option>`).join('');
  $('toggle-types').onclick = () => {
    const boxes = [...document.querySelectorAll('#type-checks input')];
    const all = boxes.every(b => b.checked);
    boxes.forEach(b => (b.checked = !all));
  };
  $('f-count').oninput = e => ($('count-label').textContent = e.target.value);
  const refreshSize = () => ($('bank-size').textContent = bank().length);
  refreshSize();

  // 탭
  document.querySelectorAll('.tabs button').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('[data-panel]').forEach(p => (p.hidden = p.dataset.panel !== btn.dataset.tab));
  });

  function pool() {
    const grade = +$('f-grade').value, level = +$('f-level').value;
    const types = [...document.querySelectorAll('#type-checks input:checked')].map(b => b.value);
    return bank().filter(q => types.includes(q.type) && (!grade || q.grade.includes(grade)) && (!level || q.level === level));
  }

  function prepare(q) {
    const idx = q.choices.map((_, i) => i);
    const fixed = ['grammar', 'vocab', 'irrelevant', 'insert', 'order'].includes(q.type); // 번호형 보기는 섞지 않음
    const order = $('f-shuffle').checked && !fixed ? shuffle(idx) : idx;
    return { ...q, choices: order.map(i => q.choices[i]), answer: order.indexOf(q.answer) };
  }

  function generate() {
    const list = pool();
    if (!list.length) { toast('조건에 맞는 문항이 없습니다. 학년/난이도/유형을 바꿔 보세요.'); return; }
    current = shuffle(list).slice(0, +$('f-count').value)
      .sort((a, b) => typeOrder[a.type] - typeOrder[b.type]).map(prepare);
    render();
    if (list.length < +$('f-count').value) toast(`조건에 맞는 ${list.length}문항으로 구성했습니다.`);
  }

  function render() {
    const startNo = 18;
    const grade = $('f-grade').value;
    const html = `
      <div class="paper editable">
        <div class="paper-head">
          <div class="sub">${esc($('f-org').value)}</div>
          <h2>${esc($('f-title').value)}</h2>
          <div class="paper-meta">
            <span>${grade === '0' ? '고등학교' : '고' + grade} 영어 영역 · 총 ${current.length}문항</span>
            <span>반 <b></b> 번호 <b></b> 이름 <b></b></span>
          </div>
        </div>
        <div class="questions ${$('f-twocol').checked ? '' : 'one-col'}">
          ${current.map((q, i) => `
            <div class="question" data-i="${i}">
              <div class="stem"><span class="num">${startNo + i}.</span>${esc(q.stem)}</div>
              <div class="passage">${q.passage}</div>
              <ol class="choices ${q.choices.every(c => c.length <= 4) ? 'inline' : ''}">
                ${q.choices.map((c, k) => `<li>${q.choices.every(c => c.length <= 4) ? esc(c) : CIRCLED[k] + ' ' + esc(c)}</li>`).join('')}
              </ol>
              <div class="tools"><button class="btn secondary small" data-act="swap">교체</button><button class="btn secondary small" data-act="del">삭제</button></div>
            </div>`).join('')}
        </div>
        ${$('f-key').checked ? `
        <div class="answer-key">
          <h3>정답 및 해설</h3>
          <table>${current.map((q, i) => `<tr><th>${startNo + i}</th><td><b>${CIRCLED[q.answer]}</b> · ${esc(TYPES.find(t => t.key === q.type).label)} — ${esc(q.explain || '')}</td></tr>`).join('')}</table>
        </div>` : ''}
      </div>`;
    $('paper-wrap').innerHTML = html;
    $('paper-actions').hidden = false;
  }

  $('paper-wrap').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const i = +btn.closest('.question').dataset.i;
    if (btn.dataset.act === 'del') current.splice(i, 1);
    else {
      const used = new Set(current.map(q => q.id));
      const alt = shuffle(pool().filter(q => q.type === current[i].type && !used.has(q.id)))[0]
        || shuffle(pool().filter(q => !used.has(q.id)))[0];
      if (!alt) return toast('교체할 문항이 없습니다.');
      current[i] = prepare(alt);
    }
    render();
  });

  $('setup-form').onsubmit = e => { e.preventDefault(); generate(); };
  $('btn-reshuffle').onclick = generate;
  $('btn-print').onclick = () => { document.body.classList.remove('print-hide-answers'); window.print(); };
  $('btn-print-q').onclick = () => { document.body.classList.add('print-hide-answers'); window.print(); document.body.classList.remove('print-hide-answers'); };

  // 직접 추가
  function renderCustom() {
    const list = custom();
    $('custom-list').innerHTML = list.length ? `<b class="small">저장된 문항 ${list.length}개</b>` + list.map((q, i) =>
      `<div class="row small" style="border-top:1px solid var(--line);padding:6px 0"><span class="badge">${esc(TYPES.find(t => t.key === q.type).label)}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(q.stem)}</span><button type="button" class="icon-btn" data-del="${i}">✕</button></div>`).join('') : '';
  }
  $('custom-list').onclick = e => {
    const d = e.target.closest('[data-del]'); if (!d) return;
    const list = custom(); list.splice(+d.dataset.del, 1); safeSet(CUSTOM_KEY, list); renderCustom(); refreshSize();
  };
  $('custom-form').onsubmit = e => {
    e.preventDefault();
    const choices = $('c-choices').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!$('c-stem').value.trim() || !$('c-passage').value.trim() || choices.length < 2) return toast('발문, 지문, 보기를 입력해 주세요.');
    const passage = esc($('c-passage').value).replace(/\[\[(.+?)\]\]/g, '<u>$1</u>').replace(/\n/g, '<br>');
    const list = custom();
    list.push({ id: 'u' + Date.now(), type: $('c-type').value, grade: [+$('c-grade').value], level: +$('c-level').value,
      stem: $('c-stem').value.trim(), passage, choices, answer: Math.min(+$('c-answer').value, choices.length - 1), explain: $('c-explain').value.trim() });
    safeSet(CUSTOM_KEY, list);
    e.target.reset(); renderCustom(); refreshSize(); toast('문항이 저장되었습니다.');
  };
  renderCustom();
})();
