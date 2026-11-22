'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { search, hitHref, hitLabel, categoryName } from '@/lib/search';

const EXAMPLES = ['2026 수능 수학', '고2 6월 영어', '24 9월 모평 국어', '연대 편입 영어', '지방직 한국사'];

export default function SearchBox({ autoFocus = false, initial = '' }: { autoFocus?: boolean; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const hits = useMemo(() => search(q).slice(0, 7), [q]);

  const submit = () => {
    if (hits[active]) router.push(hitHref(hits[active]));
    else if (q.trim()) router.push(`/search/?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <form className="search" role="search" onSubmit={e => { e.preventDefault(); submit(); }}>
        <input
          value={q}
          autoFocus={autoFocus}
          placeholder="예) 2025 수능 수학, 고2 6월 영어"
          aria-label="기출문제 검색"
          onChange={e => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
            if (e.key === 'Escape') setOpen(false);
          }}
        />
        <button className="go" aria-label="검색">→</button>
        {open && q.trim() && (
          <div className="suggest">
            {hits.length === 0 && <div className="empty">일치하는 시험이 없어요. 연도·학년·과목을 넣어 보세요.</div>}
            {hits.map((h, i) => (
              <a key={hitHref(h)} href={hitHref(h)} className={i === active ? 'active' : ''}
                 onMouseDown={e => { e.preventDefault(); router.push(hitHref(h)); }}>
                <span>{hitLabel(h)}</span>
                <small>{categoryName(h.exam.category)}</small>
              </a>
            ))}
          </div>
        )}
      </form>
      <div className="examples">
        자주 찾는 검색:
        {EXAMPLES.map(x => <button key={x} type="button" onClick={() => { setQ(x); setOpen(true); setActive(0); }}>{x}</button>)}
      </div>
    </>
  );
}
