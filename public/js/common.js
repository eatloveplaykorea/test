/* 공통: 헤더/푸터, API, 장바구니(드로어+주문서), 상품 카드 */
(function () {
  const NAV = [
    { href: 'index.html', label: '홈' },
    { href: 'mock.html', label: '모의고사' },
    { href: 'naesin.html', label: '내신 문제집' },
    { href: 'shop.html', label: '문구' },
    { href: 'order.html', label: '주문조회·다운로드' },
  ];
  const KIND_LABEL = { mock: '모의고사', naesin: '내신 문제집', stationery: '문구' };
  const here = location.pathname.split('/').pop() || 'index.html';
  const FREE_SHIP = 50000, SHIP = 3000;

  const won = n => Number(n).toLocaleString('ko-KR') + '원';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function safeGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function safeSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가 */ } }

  async function api(url, opts = {}) {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.');
    return data;
  }

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  /* ---------- 장바구니 ---------- */
  const CART_KEY = 'jg_cart_v2';
  let cart = safeGet(CART_KEY, []);
  const Cart = {
    items: () => cart,
    save() { safeSet(CART_KEY, cart); renderCount(); renderCart(); },
    add(p) {
      const it = cart.find(i => i.id === p.id);
      if (it) { if (p.kind !== 'stationery') return toast('이미 담긴 자료입니다.'); it.qty++; }
      else cart.push({ id: p.id, qty: 1, title: p.title, price: p.price, kind: p.kind, icon: p.icon, cover: p.cover });
      this.save(); toast('장바구니에 담았습니다.');
    },
    setQty(id, q) { cart = cart.map(i => i.id === id ? { ...i, qty: q } : i).filter(i => i.qty > 0); this.save(); },
    clear() { cart = []; this.save(); },
    count: () => cart.reduce((s, i) => s + i.qty, 0),
  };
  const renderCount = () => { const c = document.getElementById('cart-count'); if (c) c.textContent = Cart.count(); };

  function totals(pickup) {
    const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const phys = cart.filter(i => i.kind === 'stationery').reduce((s, i) => s + i.price * i.qty, 0);
    const ship = phys && !pickup && phys < FREE_SHIP ? SHIP : 0;
    return { sub, phys, ship, total: sub + ship };
  }

  const thumb = (p, cls = '') => p.cover
    ? `<div class="${cls}" style="background:#eef0f3 url('${esc(p.cover)}') center/cover"></div>`
    : `<div class="${cls}" style="background:${p.kind === 'stationery' ? '#fff3dc' : p.kind === 'naesin' ? '#e3f5ec' : '#e8eefc'}">${esc(p.icon || '📘')}</div>`;

  function renderCart() {
    const body = document.getElementById('cart-body'); if (!body) return;
    body.innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item">
        ${thumb(i, 'ico')}
        <div><div style="font-weight:700;font-size:14px">${esc(i.title)}</div>
          <div class="row" style="margin-top:4px">
            ${i.kind === 'stationery' ? `<div class="qty"><button data-q="${i.id}" data-d="-1">−</button><span>${i.qty}</span><button data-q="${i.id}" data-d="1">+</button></div>` : `<span class="badge">PDF 다운로드</span>`}
            <span class="small">${won(i.price * i.qty)}</span></div></div>
        <button class="icon-btn" data-rm="${i.id}" aria-label="삭제">✕</button>
      </div>`).join('') : '<div class="empty"><div class="big">🛒</div><p>장바구니가 비어 있습니다.</p></div>';
    const t = totals(false);
    document.getElementById('sum-items').textContent = won(t.sub);
    document.getElementById('sum-ship').textContent = t.phys ? (t.ship ? won(t.ship) : '무료') : '-';
    document.getElementById('sum-total').textContent = won(t.total);
    document.getElementById('checkout-btn').disabled = !cart.length;
  }

  function mountCart() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="overlay"></div>
      <div class="drawer" id="drawer" aria-label="장바구니">
        <header><h3>장바구니</h3><button class="icon-btn" id="close-drawer">✕</button></header>
        <div class="body" id="cart-body"></div>
        <footer>
          <div class="row small"><span>상품 금액</span><span class="spacer"></span><span id="sum-items">0원</span></div>
          <div class="row small"><span>배송비 (문구 5만원 이상 무료)</span><span class="spacer"></span><span id="sum-ship">-</span></div>
          <div class="row" style="margin:8px 0 12px"><b>결제 예정 금액</b><span class="spacer"></span><span class="price" id="sum-total">0원</span></div>
          <button class="btn block" id="checkout-btn">주문하기</button>
        </footer>
      </div>
      <div class="modal" id="checkout">
        <form class="card" id="order-form">
          <h3 style="margin-top:0">주문서 작성</h3>
          <label class="field"><span>주문자 이름</span><input type="text" id="o-name" required></label>
          <label class="field"><span>연락처 (주문조회·다운로드에 사용)</span><input type="tel" id="o-tel" placeholder="010-0000-0000" required></label>
          <label class="field"><span>이메일 (선택)</span><input type="email" id="o-email"></label>
          <div id="ship-fields">
            <label class="field"><span>문구 수령 방법</span>
              <select id="o-method"><option value="ship">택배 배송</option><option value="pickup">중계동 학원가 매장 픽업 (무료)</option></select></label>
            <label class="field" id="addr-field"><span>배송지 주소</span><input type="text" id="o-addr"></label>
          </div>
          <label class="field"><span>요청사항</span><input type="text" id="o-memo"></label>
          <p class="small muted">결제는 무통장 입금입니다. 입금이 확인되면 <b>주문조회</b> 메뉴에서 문제집 PDF를 내려받을 수 있습니다.</p>
          <div class="row"><span class="spacer"></span><button type="button" class="btn secondary" id="cancel-order">취소</button><button class="btn" type="submit">주문 접수</button></div>
        </form>
      </div>
      <div class="modal" id="done"><div class="card" id="done-body"></div></div>`);
    const $ = id => document.getElementById(id);
    const open = () => { $('drawer').classList.add('open'); $('overlay').classList.add('open'); renderCart(); };
    const close = () => ['drawer', 'overlay', 'checkout', 'done'].forEach(id => $(id).classList.remove('open'));
    document.addEventListener('click', e => { if (e.target.closest('.cart-btn')) { e.preventDefault(); open(); } });
    $('close-drawer').onclick = close; $('overlay').onclick = close;
    $('cart-body').onclick = e => {
      const q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
      if (q) { const it = cart.find(i => i.id === q.dataset.q); Cart.setQty(it.id, it.qty + +q.dataset.d); }
      if (rm) Cart.setQty(rm.dataset.rm, 0);
    };
    $('checkout-btn').onclick = () => { $('ship-fields').hidden = !totals().phys; $('checkout').classList.add('open'); };
    $('cancel-order').onclick = () => $('checkout').classList.remove('open');
    $('o-method').onchange = e => ($('addr-field').hidden = e.target.value === 'pickup');
    $('order-form').onsubmit = async e => {
      e.preventDefault();
      try {
        const r = await api('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, qty: i.qty })), name: $('o-name').value, tel: $('o-tel').value, email: $('o-email').value,
          method: $('o-method').value, addr: $('o-addr').value, memo: $('o-memo').value }) });
        safeSet('jg_last_order', { no: r.no, tel: $('o-tel').value });
        Cart.clear(); e.target.reset(); close();
        $('done-body').innerHTML = `<h3 style="margin-top:0">주문이 접수되었습니다 🎉</h3>
          <p>주문번호 <b style="font-size:18px">${esc(r.no)}</b><br>입금하실 금액 <b>${won(r.total)}</b><br>입금 계좌 <b>${esc(r.bank)}</b></p>
          <p class="small muted">입금 확인 후 <b>주문조회·다운로드</b> 메뉴에서 주문번호와 연락처로 PDF를 내려받으세요.</p>
          <div class="row"><span class="spacer"></span><a class="btn secondary" href="order.html">주문조회</a><button class="btn" onclick="this.closest('.modal').classList.remove('open')">확인</button></div>`;
        $('done').classList.add('open');
      } catch (err) { toast(err.message); }
    };
    renderCart();
    if (location.hash === '#cart') open();
  }

  /* ---------- 상품 카드 ---------- */
  function productCard(p) {
    const meta = [p.school, p.grade, p.term, p.pages && p.pages + '쪽'].filter(Boolean).join(' · ');
    return `
      <div class="card product">
        ${thumb(p, 'thumb')}
        <div class="info">
          <span class="badge ${p.kind === 'naesin' ? 'green' : p.kind === 'stationery' ? 'orange' : ''}" style="align-self:flex-start">${KIND_LABEL[p.kind]}</span>
          <div class="name">${esc(p.title)}</div>
          ${meta ? `<div class="small muted">${esc(meta)}</div>` : ''}
          <div class="desc">${esc(p.desc)}</div>
          <div class="price">${p.price ? won(p.price) : '무료'}</div>
          <div class="row" style="gap:6px;margin-top:6px">
            ${p.preview ? `<a class="btn secondary small" href="${esc(p.preview)}" target="_blank" rel="noopener">미리보기</a>` : ''}
            <button class="btn small" style="flex:1" data-add="${esc(p.id)}">장바구니 담기</button>
          </div>
        </div>
      </div>`;
  }
  // 목록 컨테이너에 카드 렌더 + 담기 버튼 연결
  function renderProducts(el, list, emptyMsg = '등록된 상품이 아직 없습니다.') {
    el.innerHTML = list.length ? list.map(productCard).join('') : `<p class="muted">${emptyMsg}</p>`;
    el.onclick = e => { const b = e.target.closest('[data-add]'); if (b) Cart.add(list.find(p => p.id === b.dataset.add)); };
  }

  function renderHeader() {
    const el = document.getElementById('site-header'); if (!el) return;
    el.className = 'site-header';
    el.innerHTML = `
      <div class="container">
        <a class="logo" href="index.html"><span class="logo-mark">쪽</span>쪽집게 영어학원</a>
        <nav class="nav">${NAV.map(n => `<a href="${n.href}" class="${n.href === here ? 'active' : ''}">${n.label}</a>`).join('')}</nav>
        <a class="cart-btn" href="#cart">🛒 장바구니<span class="cart-count" id="cart-count">0</span></a>
      </div>`;
    renderCount();
  }
  function renderFooter() {
    const el = document.getElementById('site-footer'); if (!el) return;
    el.className = 'site-footer';
    el.innerHTML = `<div class="container">
      <div><b>쪽집게 영어학원</b> · 서울 노원구 중계동 학원가</div>
      <div>고등 영어 모의고사 · 중계동 학교별 내신 문제집 · 학습 문구</div>
      <div style="margin-top:8px">판매 자료는 구매자 개인 학습용이며 무단 복제·재배포를 금합니다. · <a href="admin.html">관리자</a></div></div>`;
  }

  window.JG = { api, toast, won, esc, safeGet, safeSet, Cart, renderProducts, KIND_LABEL };
  document.addEventListener('DOMContentLoaded', () => { renderHeader(); renderFooter(); if (!document.body.dataset.noCart) mountCart(); });
})();
