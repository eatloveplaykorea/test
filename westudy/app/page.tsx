import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import { CATEGORIES, EXAMS, isPast } from '@/lib/exams';

export default function Home() {
  const recent = EXAMS
    .filter(e => isPast(e) && ['g3', 'g2', 'g1'].includes(e.category))
    .sort((a, b) => b.year - a.year || b.column.localeCompare(a.column) || a.category.localeCompare(b.category))
    .slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>찾는 기출, 한 번에.</h1>
        <p>수능 · 고1·2·3 모의고사 · 사관학교 · 대학 논술 기출을 연도와 과목으로 바로 찾아보세요.</p>
        <SearchBox autoFocus />
      </section>

      <section className="cats">
        {CATEGORIES.map(c => (
          <Link key={c.id} href={`/exams/${c.id}/`} className="cat">
            <div className="emo">{c.emoji}</div>
            <b>{c.name}</b>
            <small>{c.desc}</small>
          </Link>
        ))}
      </section>

      <h2 className="section-title">최근 시행된 시험 <small>문제지·정답·해설</small></h2>
      <div className="list">
        {recent.map(e => (
          <Link key={e.category + e.id} href={`/exams/${e.category}/${e.id}/${e.subjects[0]}/`}>
            <span>{e.title}</span>
            <small>{e.subtitle}</small>
          </Link>
        ))}
      </div>
    </>
  );
}
