/* 문구 쇼핑몰 */
(function () {
  const { Cart, won, esc, toast, safeGet, safeSet } = JG;
  const $ = id => document.getElementById(id);
  const FREE_SHIP = 50000, SHIP = 3000;

  const CATS = ['전체', '필기구', '노트·단어장', '시험 대비', '정리·보관', '인쇄 문제집'];
  const PRODUCTS = [
    { id: 'pen1', cat: '필기구', name: '0.5mm 젤펜 3색 세트', desc: '검정·빨강·파랑, 시험지 채점용', price: 4500, icon: '🖊️', bg: '#e8eefc', pop: 98 },
    { id: 'pen2', cat: '필기구', name: '파스텔 형광펜 6색', desc: '번짐 적은 수성, 지문 분석용', price: 6900, was: 8500, icon: '🖍️', bg: '#fff3dc', pop: 95 },
    { id: 'pen3', cat: '필기구', name: 'OMR 컴퓨터용 사인펜 10개', desc: '모의고사·수능 필수', price: 5000, icon: '✒️', bg: '#eef0f3', pop: 92 },
    { id: 'pen4', cat: '필기구', name: '샤프 0.5 + 지우개 세트', desc: '흔들어 쓰는 샤프, 미니 지우개 포함', price: 7800, icon: '✏️', bg: '#e3f5ec', pop: 80 },
    { id: 'nt1', cat: '노트·단어장', name: '영단어 암기 노트 (가림판 포함)', desc: '3단 접이 레이아웃, 100페이지', price: 4900, icon: '📒', bg: '#fde8e8', pop: 90 },
    { id: 'nt2', cat: '노트·단어장', name: '링 단어카드 200매', desc: '휴대용 앞뒤 암기카드', price: 3500, icon: '🗂️', bg: '#e8eefc', pop: 85 },
    { id: 'nt3', cat: '노트·단어장', name: '오답노트 B5 (영어용)', desc: '지문·오답 원인·재풀이 칸 구성', price: 5500, icon: '📓', bg: '#fff3dc', pop: 88 },
    { id: 'ex1', cat: '시험 대비', name: '디지털 시험용 타이머', desc: '무소음 진동, 70분 영어 모드', price: 12900, was: 15900, icon: '⏱️', bg: '#eef0f3', pop: 87 },
    { id: 'ex2', cat: '시험 대비', name: '수정테이프 2입', desc: '5mm × 6m, 깔끔하게', price: 3900, icon: '🩹', bg: '#e3f5ec', pop: 70 },
    { id: 'ex3', cat: '시험 대비', name: '인덱스 플래그 포스트잇', desc: '교과서 단원 표시용 5색', price: 2900, icon: '🏷️', bg: '#fde8e8', pop: 75 },
    { id: 'or1', cat: '정리·보관', name: 'A4 20공 바인더', desc: '인쇄한 모의고사·문제집 보관', price: 6500, icon: '📁', bg: '#e8eefc', pop: 83 },
    { id: 'or2', cat: '정리·보관', name: 'A4 클리어파일 40매', desc: '과목별 시험지 정리', price: 5900, icon: '🗃️', bg: '#fff3dc', pop: 72 },
    { id: 'or3', cat: '정리·보관', name: '대용량 지퍼 필통', desc: '3단 수납, 네이비/그레이', price: 14900, icon: '👝', bg: '#eef0f3', pop: 78 },
    { id: 'pb1', cat: '인쇄 문제집', name: '고2 영어 모의고사 10회분 (제본)', desc: '사이트 문항 은행 기반 인쇄·스프링 제본', price: 15000, icon: '📘', bg: '#e8eefc', pop: 91 },
    { id: 'pb2', cat: '인쇄 문제집', name: '내신 변형문제집 맞춤 제본', desc: '보내주신 본문으로 제작, 학교별 주문', price: 18000, icon: '📗', bg: '#e3f5ec', pop: 89 },
  ];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  let cat = '전체';

  $('cats').innerHTML = CATS.map(c => `<li><button data-cat="${c}" class="${c === cat ? 'active' : ''}">${c}</button></li>`).join('');
  $('cats').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.cat;
    document.querySelectorAll('#cats button').forEach(x => x.classList.toggle('active', x === b));
    renderProducts();
  };
  $('sort').onchange = renderProducts;
  $('search').oninput = renderProducts;

  function renderProducts() {
    const q = $('search').value.trim().toLowerCase();
    let list = PRODUCTS.filter(p => (cat === '전체' || p.cat === cat) && (!q || (p.name + p.desc).toLowerCase().includes(q)));
    const s = $('sort').value;
    list.sort((a, b) => s === 'low' ? a.price - b.price : s === 'high' ? b.price - a.price : b.pop - a.pop);
    $('products').innerHTML = list.length ? list.map(p => `
      <div class="card product">
        <div class="thumb" style="background:${p.bg}">${p.icon}</div>
        <div class="info">
          <span class="badge ${p.cat === '인쇄 문제집' ? 'green' : ''}" style="align-self:flex-start">${p.cat}</span>
          <div class="name">${esc(p.name)}</div>
          <div class="desc">${esc(p.desc)}</div>
          <div class="price">${p.was ? `<span class="sale">${Math.round((1 - p.price / p.was) * 100)}%</span>` : ''}${won(p.price)}${p.was ? `<del>${won(p.was)}</del>` : ''}</div>
          <button class="btn small block" data-add="${p.id}" style="margin-top:6px">장바구니 담기</button>
        </div>
      </div>`).join('') : '<p class="muted">검색 결과가 없습니다.</p>';
  }
  $('products').onclick = e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    Cart.add(b.dataset.add); toast('장바구니에 담았습니다.');
  };

  // 장바구니 드로어
  const open = () => { $('drawer').classList.add('open'); $('overlay').classList.add('open'); renderCart(); };
  const close = () => { $('drawer').classList.remove('open'); $('overlay').classList.remove('open'); $('checkout').classList.remove('open'); };
  document.addEventListener('click', e => { if (e.target.closest('.cart-btn')) { e.preventDefault(); open(); } });
  $('close-drawer').onclick = close; $('overlay').onclick = close;
  document.addEventListener('cart:change', renderCart);

  function totals(pickup) {
    const items = Cart.items().filter(i => byId[i.id]).reduce((s, i) => s + byId[i.id].price * i.qty, 0);
    const ship = !items || pickup || items >= FREE_SHIP ? 0 : SHIP;
    return { items, ship, total: items + ship };
  }
  function renderCart() {
    const items = Cart.items().filter(i => byId[i.id]);
    $('cart-body').innerHTML = items.length ? items.map(i => { const p = byId[i.id]; return `
      <div class="cart-item">
        <div class="ico" style="background:${p.bg}">${p.icon}</div>
        <div><div style="font-weight:700;font-size:14px">${esc(p.name)}</div>
          <div class="row" style="margin-top:4px"><div class="qty"><button data-q="${p.id}" data-d="-1">−</button><span>${i.qty}</span><button data-q="${p.id}" data-d="1">+</button></div>
          <span class="small">${won(p.price * i.qty)}</span></div></div>
        <button class="icon-btn" data-rm="${p.id}">✕</button>
      </div>`; }).join('') : '<div class="empty"><div class="big">🛒</div><p>장바구니가 비어 있습니다.</p></div>';
    const t = totals(false);
    $('sum-items').textContent = won(t.items);
    $('sum-ship').textContent = t.items && t.ship === 0 ? '무료' : won(t.ship);
    $('sum-total').textContent = won(t.total);
    $('checkout-btn').disabled = !items.length;
  }
  $('cart-body').onclick = e => {
    const q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { const it = Cart.items().find(i => i.id === q.dataset.q); Cart.setQty(it.id, it.qty + +q.dataset.d); }
    if (rm) Cart.remove(rm.dataset.rm);
  };

  // 주문
  $('checkout-btn').onclick = () => $('checkout').classList.add('open');
  $('cancel-order').onclick = () => $('checkout').classList.remove('open');
  $('o-method').onchange = e => ($('addr-field').hidden = e.target.value === 'pickup');
  $('order-form').onsubmit = e => {
    e.preventDefault();
    const pickup = $('o-method').value === 'pickup';
    if (!pickup && !$('o-addr').value.trim()) return toast('배송지 주소를 입력해 주세요.');
    const t = totals(pickup);
    const orderNo = 'JG' + Date.now().toString().slice(-8);
    const orders = safeGet('jg_orders_v1', []);
    orders.push({ orderNo, at: new Date().toISOString(), items: Cart.items(), name: $('o-name').value, tel: $('o-tel').value,
      method: $('o-method').value, addr: $('o-addr').value, memo: $('o-memo').value, pay: $('o-pay').value, total: t.total });
    safeSet('jg_orders_v1', orders);
    Cart.clear(); e.target.reset(); $('addr-field').hidden = false;
    close();
    alert(`주문이 접수되었습니다.\n주문번호: ${orderNo}\n결제 금액: ${won(t.total)}\n입금 계좌와 ${pickup ? '픽업 시간' : '배송 일정'}은 문자로 안내드립니다.`);
  };

  renderProducts();
  if (location.hash === '#cart') open();
})();
