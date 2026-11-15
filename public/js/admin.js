/* 관리자: 대시보드, 상품 업로드/수정/삭제, 주문 관리/삭제
 * 비밀번호는 로그인할 때 한 번만 서버로 보내고, 이후에는 서버가 발급한 HttpOnly 쿠키로 인증한다.
 * 모든 권한 확인은 서버에서 한다. */
(function () {
  const { esc, won, toast, KIND_LABEL } = JG;
  const $ = id => document.getElementById(id);
  let products = [], orders = [];
  const STATUS = { pending: '입금 대기', paid: '입금 확인', shipped: '발송 완료', cancelled: '취소' };

  async function call(url, opts = {}) {
    if (opts.json !== undefined) { opts.body = JSON.stringify(opts.json); opts.headers = { 'Content-Type': 'application/json' }; delete opts.json; }
    const res = await fetch(url, { credentials: 'same-origin', ...opts });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !url.endsWith('/login')) { showLogin(); throw new Error('다시 로그인해 주세요.'); }
    if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.');
    return data;
  }

  const showLogin = () => { $('login').hidden = false; $('panel').hidden = true; };
  const showPanel = () => { $('login').hidden = true; $('panel').hidden = false; loadAll(); };

  $('login').onsubmit = async e => {
    e.preventDefault();
    try { await call('/api/admin/login', { method: 'POST', json: { password: $('pw').value } }); $('pw').value = ''; showPanel(); }
    catch (err) { toast(err.message); }
  };
  $('logout').onclick = async () => { await call('/api/admin/logout', { method: 'POST' }).catch(() => {}); location.reload(); };
  call('/api/admin/me').then(showPanel).catch(() => showLogin());

  document.querySelectorAll('.tabs button[data-tab]').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tabs button[data-tab]').forEach(x => x.classList.toggle('active', x === b));
    document.querySelectorAll('[data-panel]').forEach(p => (p.hidden = p.dataset.panel !== b.dataset.tab));
  });

  const syncKind = () => {
    const st = $('up-kind').value === 'stationery';
    document.querySelectorAll('.only-book').forEach(el => (el.hidden = st));
    document.querySelectorAll('.only-stationery').forEach(el => (el.hidden = !st));
  };
  $('up-kind').onchange = syncKind; syncKind();

  async function loadAll() {
    try {
      let stats;
      [products, orders, stats] = await Promise.all([call('/api/admin/products'), call('/api/admin/orders'), call('/api/admin/stats')]);
      renderStats(stats); renderProducts(); renderOrders();
    } catch (err) { toast(err.message); }
  }

  /* ---------- 대시보드 ---------- */
  function renderStats(s) {
    const tiles = [
      ['등록 상품', s.products + '개', `모의고사 ${s.byKind[0]} · 내신 ${s.byKind[1]} · 문구 ${s.byKind[2]}`],
      ['입금 대기', s.pending + '건', '확인이 필요한 주문'],
      ['오늘 주문', s.todayOrders + '건', `누적 ${s.orders}건`],
      ['확정 매출', won(s.revenue), '입금 확인·발송 완료 합계'],
    ];
    $('stats').innerHTML = tiles.map(([l, v, d]) => `<div class="card stat"><div class="small muted">${l}</div><div class="v">${v}</div><div class="small muted">${d}</div></div>`).join('');
    const pend = orders.filter(o => o.status === 'pending');
    $('dash-pending').innerHTML = pend.length ? pend.slice(0, 10).map(o =>
      `<div class="row" style="border-top:1px solid var(--line);padding:8px 0"><b>${esc(o.no)}</b><span>${esc(o.name)} · ${esc(o.tel)}</span><span class="spacer"></span><b>${won(o.total)}</b>
       <button class="btn small" data-paid="${esc(o.no)}">입금 확인</button></div>`).join('') : '<p class="muted">대기 중인 주문이 없습니다.</p>';
  }
  $('dash-pending').onclick = async e => {
    const no = e.target.dataset.paid; if (!no) return;
    await call(`/api/admin/orders/${encodeURIComponent(no)}/status`, { method: 'POST', json: { status: 'paid' } }).then(() => toast('입금 확인 처리했습니다.')).catch(err => toast(err.message));
    loadAll();
  };

  /* ---------- 전체/선택 삭제 ---------- */
  document.addEventListener('click', async e => {
    const w = e.target.closest('[data-wipe]'); if (!w) return;
    const what = w.dataset.wipe;
    const label = { products: '모든 상품', orders: '모든 주문', all: '모든 상품과 주문' }[what];
    if (prompt(`${label}을(를) 삭제합니다. 되돌릴 수 없습니다.\n계속하려면 "삭제"라고 입력하세요.`) !== '삭제') return;
    try {
      if (what !== 'orders') await call('/api/admin/products/delete', { method: 'POST', json: { all: true } });
      if (what !== 'products') await call('/api/admin/orders/delete', { method: 'POST', json: { all: true } });
      toast('삭제했습니다.');
    } catch (err) { toast(err.message); }
    loadAll();
  });
  function bindSelection(table, btn, endpoint, noun) {
    const sel = () => [...table.querySelectorAll('input[data-sel]:checked')].map(c => c.dataset.sel);
    table.addEventListener('change', e => {
      if (e.target.dataset.selall !== undefined) table.querySelectorAll('input[data-sel]').forEach(c => (c.checked = e.target.checked));
      const n = sel().length; btn.disabled = !n; btn.textContent = n ? `선택 삭제 (${n})` : '선택 삭제';
    });
    btn.onclick = async () => {
      const ids = sel(); if (!ids.length || !confirm(`선택한 ${noun} ${ids.length}개를 삭제할까요? 되돌릴 수 없습니다.`)) return;
      await call(endpoint, { method: 'POST', json: { ids } }).then(r => toast(`${r.deleted}개 삭제했습니다.`)).catch(err => toast(err.message));
      btn.disabled = true; btn.textContent = '선택 삭제'; loadAll();
    };
  }
  bindSelection($('prod-table'), $('prod-del-sel'), '/api/admin/products/delete', '상품');
  bindSelection($('ord-table'), $('ord-del-sel'), '/api/admin/orders/delete', '주문');

  /* ---------- 상품 ---------- */
  function renderProducts() {
    $('prod-table').innerHTML = `<tr><th><input type="checkbox" data-selall></th><th>분류</th><th>상품명</th><th>학교/학년</th><th>가격</th><th>파일</th><th>공개</th><th></th></tr>` +
      (products.length ? products.map(p => `<tr>
        <td><input type="checkbox" data-sel="${esc(p.id)}"></td>
        <td><span class="badge">${KIND_LABEL[p.kind]}</span></td>
        <td><b>${esc(p.title)}</b></td>
        <td class="small">${esc([p.school, p.grade, p.term].filter(Boolean).join(' '))}</td>
        <td>${won(p.price)}</td>
        <td class="small">${p.file ? `<a href="/api/admin/files/${esc(p.id)}">${esc(p.fileName || '파일')}</a>` : '-'}</td>
        <td><input type="checkbox" data-active="${esc(p.id)}" ${p.active ? 'checked' : ''}></td>
        <td style="white-space:nowrap"><button class="btn secondary small" data-edit="${esc(p.id)}">수정</button> <button class="btn secondary small" data-del="${esc(p.id)}">삭제</button></td>
      </tr>`).join('') : '<tr><td colspan="8" class="muted">등록된 상품이 없습니다.</td></tr>');
  }
  $('prod-table').onclick = async e => {
    const t = e.target;
    if (t.dataset.del) {
      if (!confirm('이 상품을 삭제할까요? 파일도 함께 지워지고 되돌릴 수 없습니다.')) return;
      await call('/api/admin/products/' + t.dataset.del, { method: 'DELETE' }).then(() => toast('삭제했습니다.')).catch(err => toast(err.message));
      loadAll();
    }
    if (t.dataset.edit) startEdit(products.find(p => p.id === t.dataset.edit));
  };
  $('prod-table').addEventListener('change', async e => {
    const id = e.target.dataset.active; if (!id) return;
    const fd = new FormData(); const p = products.find(x => x.id === id);
    ['kind', 'title', 'price'].forEach(k => fd.append(k, p[k])); fd.append('active', e.target.checked);
    await call('/api/admin/products/' + id, { method: 'PUT', body: fd }).then(() => toast(e.target.checked ? '공개했습니다.' : '숨겼습니다.')).catch(err => toast(err.message));
    loadAll();
  });

  function startEdit(p) {
    const f = $('up-form'); f.reset();
    $('edit-id').value = p.id;
    ['kind', 'price', 'title', 'school', 'grade', 'term', 'pages', 'desc', 'icon'].forEach(k => f.elements[k] && (f.elements[k].value = p[k] ?? ''));
    syncKind();
    $('up-submit').textContent = '수정 저장'; $('cancel-edit').hidden = false;
    $('up-status').textContent = p.fileName ? `현재 파일: ${p.fileName} (새 파일을 고르면 교체)` : '';
    document.querySelector('[data-tab=upload]').click();
  }
  function endEdit() { $('up-form').reset(); $('edit-id').value = ''; $('up-submit').textContent = '등록하기'; $('cancel-edit').hidden = true; $('up-status').textContent = ''; syncKind(); }
  $('cancel-edit').onclick = endEdit;

  $('up-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target); const id = fd.get('id'); fd.delete('id');
    ['file', 'cover', 'preview'].forEach(k => { const f = fd.get(k); if (f && !f.size) fd.delete(k); });
    $('up-submit').disabled = true; $('up-status').textContent = '업로드 중…';
    try {
      await call('/api/admin/products' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
      toast(id ? '수정했습니다.' : '등록했습니다.'); endEdit(); loadAll();
    } catch (err) { toast(err.message); $('up-status').textContent = ''; }
    $('up-submit').disabled = false;
  };

  /* ---------- 주문 ---------- */
  function renderOrders() {
    $('pending-count').textContent = orders.filter(o => o.status === 'pending').length;
    const f = $('ord-filter').value;
    const list = orders.filter(o => !f || o.status === f);
    $('ord-table').innerHTML = `<tr><th><input type="checkbox" data-selall></th><th>주문번호</th><th>일시</th><th>주문자</th><th>상품</th><th>금액</th><th>수령</th><th>상태</th><th></th></tr>` +
      (list.length ? list.map(o => `<tr>
        <td><input type="checkbox" data-sel="${esc(o.no)}"></td>
        <td><b>${esc(o.no)}</b></td>
        <td class="small">${new Date(o.createdAt).toLocaleString('ko-KR')}</td>
        <td class="small">${esc(o.name)}<br>${esc(o.tel)}${o.email ? '<br>' + esc(o.email) : ''}</td>
        <td class="small">${o.items.map(i => `${esc(i.title)} × ${i.qty}`).join('<br>')}${o.memo ? `<br><span class="muted">요청: ${esc(o.memo)}</span>` : ''}</td>
        <td><b>${won(o.total)}</b></td>
        <td class="small">${o.method === 'ship' ? '택배<br>' + esc(o.addr) : o.method === 'pickup' ? '매장 픽업' : 'PDF'}</td>
        <td><select data-status="${esc(o.no)}" style="width:auto">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
        <td><button class="btn secondary small" data-odel="${esc(o.no)}">삭제</button></td>
      </tr>`).join('') : '<tr><td colspan="9" class="muted">주문이 없습니다.</td></tr>');
    $('ord-del-sel').disabled = true; $('ord-del-sel').textContent = '선택 삭제';
  }
  $('ord-filter').onchange = renderOrders;
  $('ord-table').addEventListener('change', async e => {
    const no = e.target.dataset.status; if (!no) return;
    await call(`/api/admin/orders/${encodeURIComponent(no)}/status`, { method: 'POST', json: { status: e.target.value } }).then(() => toast('상태를 변경했습니다.')).catch(err => toast(err.message));
    loadAll();
  });
  $('ord-table').onclick = async e => {
    const no = e.target.dataset.odel; if (!no) return;
    if (!confirm(`주문 ${no}을(를) 삭제할까요? 구매자의 다운로드 링크도 사라집니다.`)) return;
    await call('/api/admin/orders/' + encodeURIComponent(no), { method: 'DELETE' }).then(() => toast('삭제했습니다.')).catch(err => toast(err.message));
    loadAll();
  };
})();
