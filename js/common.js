/* 공통: 헤더/푸터, 장바구니 저장소, 토스트, 유틸 */
(function () {
  const NAV = [
    { href: 'index.html', label: '홈' },
    { href: 'mock.html', label: '모의고사 만들기' },
    { href: 'naesin.html', label: '내신 문제집 만들기' },
    { href: 'shop.html', label: '문구 쇼핑' },
  ];

  const here = location.pathname.split('/').pop() || 'index.html';

  function renderHeader() {
    const el = document.getElementById('site-header');
    if (!el) return;
    el.className = 'site-header';
    el.innerHTML = `
      <div class="container">
        <a class="logo" href="index.html"><span class="logo-mark">중</span>중계 영어연구소</a>
        <nav class="nav">
          ${NAV.map(n => `<a href="${n.href}" class="${n.href === here ? 'active' : ''}">${n.label}</a>`).join('')}
        </nav>
        <a class="cart-btn" href="shop.html#cart">🛒 장바구니<span class="cart-count" id="cart-count">0</span></a>
      </div>`;
    updateCartCount();
  }

  function renderFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;
    el.className = 'site-footer';
    el.innerHTML = `
      <div class="container">
        <div><b>중계 영어연구소</b> · 서울 노원구 중계동 학원가</div>
        <div>고등 영어 모의고사 · 내신 대비 문제집 · 학습 문구</div>
        <div style="margin-top:8px">수록 지문은 모두 이 사이트를 위해 새로 작성한 연습용 지문입니다. 학교 교과서·부교재 지문은 사용자가 직접 입력해 사용하세요.</div>
      </div>`;
  }

  /* ---------- 장바구니 ---------- */
  const CART_KEY = 'jg_cart_v1';
  function safeGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 저장 불가 환경 */ }
  }
  let memCart = safeGet(CART_KEY, []);
  const Cart = {
    items() { return memCart; },
    save() { safeSet(CART_KEY, memCart); updateCartCount(); document.dispatchEvent(new CustomEvent('cart:change')); },
    add(id, qty = 1) {
      const it = memCart.find(i => i.id === id);
      if (it) it.qty += qty; else memCart.push({ id, qty });
      this.save();
    },
    setQty(id, qty) {
      memCart = memCart.map(i => i.id === id ? { ...i, qty } : i).filter(i => i.qty > 0);
      this.save();
    },
    remove(id) { memCart = memCart.filter(i => i.id !== id); this.save(); },
    clear() { memCart = []; this.save(); },
    count() { return memCart.reduce((s, i) => s + i.qty, 0); },
  };
  function updateCartCount() {
    const c = document.getElementById('cart-count');
    if (c) c.textContent = Cart.count();
  }

  /* ---------- 토스트 ---------- */
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- 유틸 ---------- */
  const won = n => n.toLocaleString('ko-KR') + '원';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  function shuffle(arr, rnd = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // 시드 고정 난수 (같은 시드 → 같은 시험지)
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  window.JG = { Cart, toast, won, esc, CIRCLED, shuffle, seeded, safeGet, safeSet };

  document.addEventListener('DOMContentLoaded', () => { renderHeader(); renderFooter(); });
})();
