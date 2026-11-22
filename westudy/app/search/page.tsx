'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBox from '@/components/SearchBox';
import { search, hitHref, hitLabel, categoryName } from '@/lib/search';

function Results() {
  const q = useSearchParams().get('q') ?? '';
  const hits = search(q);
  return (
    <>
      <div className="page-head">
        <div className="crumb"><Link href="/">홈</Link> › 검색</div>
        <h1>“{q}” 검색 결과</h1>
      </div>
      <SearchBox key={q} initial={q} />
      <h2 className="section-title">{hits.length}개 시험</h2>
      <div className="list">
        {hits.length === 0 && <div className="empty">일치하는 시험이 없어요. “2025 수능 수학”처럼 연도·시험·과목을 함께 넣어 보세요.</div>}
        {hits.map(h => (
          <Link key={hitHref(h)} href={hitHref(h)}>
            <span>{hitLabel(h)}</span>
            <small>{categoryName(h.exam.category)} · {h.exam.subtitle}</small>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  return <Suspense><Results /></Suspense>;
}
