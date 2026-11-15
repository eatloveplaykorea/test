/* 상품 목록 페이지 (body data-kind = mock | naesin | stationery) */
(function () {
  const { api, renderProducts, esc } = JG;
  const kind = document.body.dataset.kind;
  const $ = id => document.getElementById(id);
  let all = [];

  function fillSelect(id, values) {
    const el = $(id); if (!el) return;
    const vals = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
    el.innerHTML = '<option value="">전체</option>' + vals.map(v => `<option>${esc(v)}</option>`).join('');
    el.closest('label').hidden = !vals.length;
  }

  function apply() {
    const q = ($('search')?.value || '').trim().toLowerCase();
    const school = $('f-school')?.value || '', grade = $('f-grade')?.value || '';
    const sort = $('f-sort')?.value || 'new';
    let list = all.filter(p => (!q || (p.title + p.desc + p.school).toLowerCase().includes(q))
      && (!school || p.school === school) && (!grade || p.grade === grade));
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    $('count').textContent = list.length;
    renderProducts($('products'), list, all.length ? '조건에 맞는 상품이 없습니다.' : '등록된 상품이 아직 없습니다. 곧 업로드됩니다!');
  }

  api('/api/products?kind=' + kind).then(list => {
    all = list;
    fillSelect('f-school', all.map(p => p.school));
    fillSelect('f-grade', all.map(p => p.grade));
    apply();
  }).catch(err => ($('products').innerHTML = `<p class="muted">${esc(err.message)}</p>`));
  ['search', 'f-school', 'f-grade', 'f-sort'].forEach(id => $(id) && ($(id).oninput = apply));
})();
