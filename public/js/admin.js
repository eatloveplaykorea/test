/* 관리자: 상품 업로드/수정/삭제, 주문 입금 확인 */
(function () {
  const { api, esc, won, toast, KIND_LABEL } = JG;
  const $ = id => document.getElementById(id);
  let pw = sessionStorage.getItem('jg_admin') || '';
  let products = [], orders = [];
  const STATUS = { pending: '입금 대기', paid: '입금 확인', shipped: '발송 완료', cancelled: '취소' };
  const auth = (opts = {}) => ({ ...opts, headers: { ...(opts.headers || {}), 'x-admin-password': pw } });

  async function login(p) {
    pw = p;
    try { await api('/api/admin/login', auth({ method: 'POST' })); }
    catch (e) { pw = ''; sessionStorage.removeItem('jg_admin'); return toast(e.message); }
    sessionStorage.setItem('jg_admin', pw);
    $('login').hidden = true; $('panel').hidden = false;
    loadAll();
  }
  $('login').onsubmit = e => { e.preventDefault(); login($('pw').value); };
  $('logout').onclick = () => { sessionStorage.removeItem('jg_admin'); location.reload(); };
  if (pw) login(pw);

  document.querySelectorAll('.tabs button[data-tab]').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tabs button[data-tab]').forEach(x => x.classList.toggle('active', x === b));
    document.querySelectorAll('[data-panel]').forEach(p => (p.hidden = p.dataset.panel !== b.dataset.tab));
  });

  // 분류에 따라 입력칸 표시
  const syncKind = () => {
    const st = $('up-kind').value === 'stationery';
    document.querySelectorAll('.only-book').forEach(el => (el.hidden = st));
    document.querySelectorAll('.only-stationery').forEach(el => (el.hidden = !st));
  };
  $('up-kind').onchange = syncKind; syncKind();

  async function loadAll() {
    [products, orders] = await Promise.all([api('/api/admin/products', auth()), api('/api/admin/orders', auth())]);
    renderProducts(); renderOrders();
  }

  function renderProducts() {
    $('prod-table').innerHTML = `<tr><th>분류</th><th>상품명</th><th>학교/학년</th><th>가격</th><th>파일</th><th>공개</th><th></th></tr>` +
      products.map(p => `<tr>
        <td><span class="badge">${KIND_LABEL[p.kind]}</span></td>
        <td><b>${esc(p.title)}</b></td>
        <td class="small">${esc([p.school, p.grade, p.term].filter(Boolean).join(' '))}</td>
        <td>${won(p.price)}</td>
        <td class="small">${p.file ? `<a href="#" data-dl="${p.id}">${esc(p.fileName || '파일')}</a>` : '-'}</td>
        <td><input type="checkbox" data-active="${p.id}" ${p.active ? 'checked' : ''}></td>
        <td style="white-space:nowrap"><button class="btn secondary small" data-edit="${p.id}">수정</button> <button class="btn secondary small" data-del="${p.id}">삭제</button></td>
      </tr>`).join('');
  }
  $('prod-table').onclick = async e => {
    const t = e.target;
    if (t.dataset.del) {
      if (!confirm('이 상품을 삭제할까요? (판매 이력이 있으면 숨김 처리됩니다)')) return;
      await api('/api/admin/products/' + t.dataset.del, auth({ method: 'DELETE' })).catch(err => toast(err.message));
      loadAll();
    }
    if (t.dataset.dl) {
      e.preventDefault();
      const res = await fetch('/api/admin/files/' + t.dataset.dl, auth());
      if (!res.ok) return toast('파일을 받을 수 없습니다.');
      const a = document.createElement('a'); a.href = URL.createObjectURL(await res.blob()); a.download = t.textContent; a.click();
    }
    if (t.dataset.edit) startEdit(products.find(p => p.id === t.dataset.edit));
  };
  $('prod-table').onchange = async e => {
    const id = e.target.dataset.active; if (!id) return;
    const fd = new FormData(); const p = products.find(x => x.id === id);
    ['kind', 'title', 'price'].forEach(k => fd.append(k, p[k])); fd.append('active', e.target.checked);
    await api('/api/admin/products/' + id, auth({ method: 'PUT', body: fd })).catch(err => toast(err.message));
    toast(e.target.checked ? '공개했습니다.' : '숨겼습니다.'); loadAll();
  };

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
      await api('/api/admin/products' + (id ? '/' + id : ''), auth({ method: id ? 'PUT' : 'POST', body: fd }));
      toast(id ? '수정했습니다.' : '등록했습니다.'); endEdit(); loadAll();
    } catch (err) { toast(err.message); $('up-status').textContent = ''; }
    $('up-submit').disabled = false;
  };

  function renderOrders() {
    $('pending-count').textContent = orders.filter(o => o.status === 'pending').length;
    const f = $('ord-filter').value;
    const list = orders.filter(o => !f || o.status === f);
    $('ord-table').innerHTML = `<tr><th>주문번호</th><th>일시</th><th>주문자</th><th>상품</th><th>금액</th><th>수령</th><th>상태</th></tr>` +
      (list.length ? list.map(o => `<tr>
        <td><b>${esc(o.no)}</b></td>
        <td class="small">${new Date(o.createdAt).toLocaleString('ko-KR')}</td>
        <td class="small">${esc(o.name)}<br>${esc(o.tel)}${o.email ? '<br>' + esc(o.email) : ''}</td>
        <td class="small">${o.items.map(i => `${esc(i.title)} × ${i.qty}`).join('<br>')}${o.memo ? `<br><span class="muted">요청: ${esc(o.memo)}</span>` : ''}</td>
        <td><b>${won(o.total)}</b></td>
        <td class="small">${o.method === 'ship' ? '택배<br>' + esc(o.addr) : o.method === 'pickup' ? '매장 픽업' : 'PDF'}</td>
        <td><select data-status="${esc(o.no)}" style="width:auto">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
      </tr>`).join('') : '<tr><td colspan="7" class="muted">주문이 없습니다.</td></tr>');
  }
  $('ord-filter').onchange = renderOrders;
  $('ord-table').onchange = async e => {
    const no = e.target.dataset.status; if (!no) return;
    try { await api(`/api/admin/orders/${no}/status`, auth({ method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': pw }, body: JSON.stringify({ status: e.target.value }) })); toast('상태를 변경했습니다.'); loadAll(); }
    catch (err) { toast(err.message); }
  };
})();
