/*
 * 쪽집게 영어학원 쇼핑몰 서버
 * - 관리자가 모의고사/내신 문제집 PDF와 문구 상품을 등록
 * - 손님은 장바구니 → 주문(무통장 입금) → 관리자 입금 확인 → 주문조회에서 PDF 다운로드
 * 실행: ADMIN_PASSWORD=비밀번호 npm start   (비밀번호는 코드에 두지 않고 환경변수에서만 읽음)
 */
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
// 관리자 비밀번호는 오직 환경변수에서 읽는다. 없으면 관리자 기능이 꺼진다.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FILES_DIR = path.join(ROOT, 'storage', 'files');      // 판매용 PDF (비공개)
const PUBLIC_UP = path.join(ROOT, 'storage', 'public');     // 표지·미리보기 (공개)
[DATA_DIR, FILES_DIR, PUBLIC_UP].forEach(d => fs.mkdirSync(d, { recursive: true }));

if (!ADMIN_PASSWORD) console.warn('⚠️  ADMIN_PASSWORD 환경변수가 없어 관리자 로그인이 비활성화됩니다.');

/* ---------- 간단한 JSON 저장소 ---------- */
const SEED_STATIONERY = [
  ['0.5mm 젤펜 3색 세트', '검정·빨강·파랑, 채점용', 4500, '🖊️'],
  ['파스텔 형광펜 6색', '번짐 적은 수성, 지문 분석용', 6900, '🖍️'],
  ['OMR 컴퓨터용 사인펜 10개', '모의고사·수능 필수', 5000, '✒️'],
  ['영단어 암기 노트', '가림판 포함, 100페이지', 4900, '📒'],
  ['링 단어카드 200매', '휴대용 앞뒤 암기카드', 3500, '🗂️'],
  ['오답노트 B5 (영어용)', '지문·오답 원인·재풀이 칸', 5500, '📓'],
  ['디지털 시험용 타이머', '무소음, 70분 영어 모드', 12900, '⏱️'],
  ['A4 20공 바인더', '문제집 출력물 보관', 6500, '📁'],
];
function loadDb() {
  if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const db = { products: [], orders: [] };
  SEED_STATIONERY.forEach(([title, desc, price, icon], i) => db.products.push({
    id: 'p' + (Date.now() + i).toString(36), kind: 'stationery', title, desc, price, icon,
    school: '', grade: '', cover: '', preview: '', file: '', fileName: '', active: true, createdAt: new Date().toISOString(),
  }));
  return db;
}
let db = loadDb();
const save = () => fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 2)) || fs.renameSync(DB_FILE + '.tmp', DB_FILE);
save();

/* ---------- 업로드 ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, file.fieldname === 'file' ? FILES_DIR : PUBLIC_UP),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = file.fieldname === 'cover' ? ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
      : ['.pdf', '.hwp', '.hwpx', '.docx', '.zip', '.jpg', '.png'].includes(ext);
    cb(ok ? null : new Error(`허용되지 않는 파일 형식입니다: ${file.originalname}`), ok);
  },
}).fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'preview', maxCount: 1 }]);

/* ---------- 앱 ---------- */
const app = express();
app.set('trust proxy', 1); // 프록시(배포 환경) 뒤에서 HTTPS/IP 인식
app.use(express.json());
app.use(express.static(path.join(ROOT, 'public')));
app.use('/uploads', express.static(PUBLIC_UP));

/* ---------- 관리자 인증 (모든 확인은 서버에서) ----------
 * 로그인 시 비밀번호를 환경변수 ADMIN_PASSWORD 와 서버에서 비교하고,
 * 맞으면 무작위 세션 토큰을 HttpOnly 쿠키로 발급한다. 브라우저에는 비밀번호를 저장하지 않는다. */
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8시간
const sessions = new Map();             // token -> 만료시각
const loginFails = new Map();           // ip -> { n, until }
const sha = v => crypto.createHash('sha256').update(String(v)).digest();
const checkPassword = pw => !!ADMIN_PASSWORD && crypto.timingSafeEqual(sha(pw), sha(ADMIN_PASSWORD));
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
const sessionOf = req => {
  const t = cookies(req).jg_admin;
  if (!t || !sessions.has(t)) return null;
  if (sessions.get(t) < Date.now()) { sessions.delete(t); return null; }
  return t;
};
const setCookie = (req, res, val, maxAge) => res.setHeader('Set-Cookie',
  `jg_admin=${val}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${req.secure ? '; Secure' : ''}`);
const admin = (req, res, next) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: '서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.' });
  if (!sessionOf(req)) return res.status(401).json({ error: '관리자 로그인이 필요합니다.' });
  next();
};

app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: '서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.' });
  const ip = req.ip, f = loginFails.get(ip);
  if (f && f.until > Date.now()) return res.status(429).json({ error: '로그인 시도가 너무 많습니다. 10분 후 다시 시도하세요.' });
  if (!checkPassword(req.body?.password || '')) {
    const n = (f?.n || 0) + 1;
    loginFails.set(ip, { n, until: n >= 5 ? Date.now() + 10 * 60 * 1000 : 0 });
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
  loginFails.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  setCookie(req, res, token, SESSION_TTL / 1000);
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => { const t = sessionOf(req); if (t) sessions.delete(t); setCookie(req, res, '', 0); res.json({ ok: true }); });
app.get('/api/admin/me', admin, (req, res) => res.json({ ok: true }));

const publicProduct = ({ file, ...p }) => ({ ...p, hasFile: !!file });
const rmFile = (dir, name) => { if (name) fs.rm(path.join(dir, path.basename(name)), () => {}); };

// 상품 목록 (공개)
app.get('/api/products', (req, res) => {
  const { kind } = req.query;
  res.json(db.products.filter(p => p.active && (!kind || p.kind === kind)).map(publicProduct).reverse());
});

app.get('/api/admin/products', admin, (req, res) => res.json(db.products.slice().reverse()));

// 상품 등록/수정
function applyFields(p, body, files) {
  const str = (v, d = '') => (v ?? d).toString().trim();
  p.kind = ['mock', 'naesin', 'stationery'].includes(body.kind) ? body.kind : (p.kind || 'mock');
  p.title = str(body.title, p.title);
  p.desc = str(body.desc, p.desc);
  p.school = str(body.school, p.school);
  p.grade = str(body.grade, p.grade);
  p.term = str(body.term, p.term);
  p.pages = str(body.pages, p.pages);
  p.icon = str(body.icon, p.icon || (p.kind === 'stationery' ? '🛍️' : '📘'));
  p.price = Math.max(0, parseInt(body.price, 10) || 0);
  if (body.active !== undefined) p.active = body.active === 'true' || body.active === true;
  if (files?.file?.[0]) { rmFile(FILES_DIR, p.file); p.file = files.file[0].filename; p.fileName = files.file[0].originalname; }
  if (files?.cover?.[0]) { rmFile(PUBLIC_UP, p.cover); p.cover = '/uploads/' + files.cover[0].filename; }
  if (files?.preview?.[0]) { rmFile(PUBLIC_UP, p.preview); p.preview = '/uploads/' + files.preview[0].filename; }
}
const withUpload = (req, res, next) => upload(req, res, err => err ? res.status(400).json({ error: err.message }) : next());

app.post('/api/admin/products', admin, withUpload, (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: '상품명을 입력하세요.' });
  const p = { id: 'p' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'), active: true, createdAt: new Date().toISOString() };
  applyFields(p, req.body, req.files);
  if (p.kind !== 'stationery' && !p.file) return res.status(400).json({ error: '판매할 문제집 파일(PDF 등)을 올려 주세요.' });
  db.products.push(p); save();
  res.json(p);
});
app.put('/api/admin/products/:id', admin, withUpload, (req, res) => {
  const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: '상품이 없습니다.' });
  applyFields(p, req.body, req.files); save();
  res.json(p);
});
function removeProduct(p) {
  db.products = db.products.filter(x => x !== p);
  rmFile(FILES_DIR, p.file); rmFile(PUBLIC_UP, p.cover); rmFile(PUBLIC_UP, p.preview);
}
app.delete('/api/admin/products/:id', admin, (req, res) => {
  const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: '상품이 없습니다.' });
  removeProduct(p); save(); res.json({ ok: true });
});
// 일괄 삭제: { ids: [...] } 또는 { all: true }
app.post('/api/admin/products/delete', admin, (req, res) => {
  const ids = new Set(req.body?.all ? db.products.map(p => p.id) : (req.body?.ids || []));
  const targets = db.products.filter(p => ids.has(p.id));
  targets.forEach(removeProduct); save();
  res.json({ deleted: targets.length });
});
app.get('/api/admin/files/:id', admin, (req, res) => {
  const p = db.products.find(x => x.id === req.params.id);
  if (!p?.file) return res.status(404).end();
  res.download(path.join(FILES_DIR, p.file), p.fileName);
});

/* ---------- 주문 ---------- */
const FREE_SHIP = 50000, SHIP_FEE = 3000;
const normTel = t => String(t || '').replace(/\D/g, '');

app.post('/api/orders', (req, res) => {
  const { items = [], name, tel, method, addr, memo, email } = req.body || {};
  if (!name || normTel(tel).length < 9) return res.status(400).json({ error: '이름과 연락처를 정확히 입력하세요.' });
  const lines = [];
  for (const it of items) {
    const p = db.products.find(x => x.id === it.id && x.active);
    const qty = Math.min(99, Math.max(1, parseInt(it.qty, 10) || 1));
    if (p) lines.push({ id: p.id, title: p.title, kind: p.kind, price: p.price, qty: p.kind === 'stationery' ? qty : 1 });
  }
  if (!lines.length) return res.status(400).json({ error: '주문할 상품이 없습니다.' });
  const physical = lines.filter(l => l.kind === 'stationery').reduce((s, l) => s + l.price * l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const needShip = physical > 0 && method !== 'pickup';
  if (needShip && !String(addr || '').trim()) return res.status(400).json({ error: '배송지 주소를 입력하세요.' });
  const ship = needShip && physical < FREE_SHIP ? SHIP_FEE : 0;
  const order = {
    no: new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + crypto.randomInt(1000, 9999),
    token: crypto.randomBytes(16).toString('hex'),
    createdAt: new Date().toISOString(), status: 'pending',
    name: String(name).slice(0, 40), tel: normTel(tel), email: String(email || '').slice(0, 80),
    method: physical ? (method === 'pickup' ? 'pickup' : 'ship') : 'digital',
    addr: String(addr || '').slice(0, 200), memo: String(memo || '').slice(0, 200),
    items: lines, subtotal, ship, total: subtotal + ship,
  };
  db.orders.push(order); save();
  res.json({ no: order.no, total: order.total, bank: process.env.BANK_ACCOUNT || '○○은행 000-0000-0000 (예금주: 쪽집게 영어학원)' });
});

// 주문 조회 (주문번호 + 연락처)
app.post('/api/orders/lookup', (req, res) => {
  const o = db.orders.find(x => x.no === String(req.body?.no || '').trim() && x.tel === normTel(req.body?.tel));
  if (!o) return res.status(404).json({ error: '주문을 찾을 수 없습니다. 주문번호와 연락처를 확인하세요.' });
  res.json({
    no: o.no, status: o.status, createdAt: o.createdAt, total: o.total, ship: o.ship, method: o.method,
    items: o.items.map(i => ({ ...i, download: o.status === 'paid' && i.kind !== 'stationery' ? `/api/download/${o.no}/${o.token}/${i.id}` : null })),
  });
});

// 입금 확인된 주문의 파일 다운로드
app.get('/api/download/:no/:token/:pid', (req, res) => {
  const o = db.orders.find(x => x.no === req.params.no);
  const h = v => crypto.createHash('sha256').update(String(v)).digest();
  if (!o || o.status !== 'paid' || !crypto.timingSafeEqual(h(o.token), h(req.params.token)))
    return res.status(403).send('다운로드 권한이 없습니다.');
  const p = db.products.find(x => x.id === req.params.pid);
  if (!p?.file || !o.items.some(i => i.id === p.id)) return res.status(404).send('파일이 없습니다.');
  res.download(path.join(FILES_DIR, p.file), p.fileName || p.title + path.extname(p.file));
});

app.delete('/api/admin/orders/:no', admin, (req, res) => {
  const before = db.orders.length;
  db.orders = db.orders.filter(o => o.no !== req.params.no);
  if (db.orders.length === before) return res.status(404).json({ error: '주문이 없습니다.' });
  save(); res.json({ ok: true });
});
app.post('/api/admin/orders/delete', admin, (req, res) => {
  const ids = new Set(req.body?.all ? db.orders.map(o => o.no) : (req.body?.ids || []));
  const before = db.orders.length;
  db.orders = db.orders.filter(o => !ids.has(o.no)); save();
  res.json({ deleted: before - db.orders.length });
});
// 대시보드 요약
app.get('/api/admin/stats', admin, (req, res) => {
  const paid = db.orders.filter(o => o.status === 'paid' || o.status === 'shipped');
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    products: db.products.length,
    byKind: ['mock', 'naesin', 'stationery'].map(k => db.products.filter(p => p.kind === k).length),
    orders: db.orders.length,
    pending: db.orders.filter(o => o.status === 'pending').length,
    revenue: paid.reduce((s, o) => s + o.total, 0),
    todayOrders: db.orders.filter(o => o.createdAt.slice(0, 10) === today).length,
  });
});
app.get('/api/admin/orders', admin, (req, res) => res.json(db.orders.slice().reverse()));
app.post('/api/admin/orders/:no/status', admin, (req, res) => {
  const o = db.orders.find(x => x.no === req.params.no);
  if (!o) return res.status(404).json({ error: '주문이 없습니다.' });
  if (!['pending', 'paid', 'shipped', 'cancelled'].includes(req.body?.status)) return res.status(400).json({ error: '잘못된 상태' });
  o.status = req.body.status; save();
  res.json(o);
});

app.listen(PORT, () => console.log(`쪽집게 영어학원 쇼핑몰: http://localhost:${PORT}  (관리자: /admin.html)`));
