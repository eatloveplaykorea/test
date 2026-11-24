import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import { EXAMS, isPast } from '@/lib/exams';
import { HOME_SECTIONS } from '@/lib/home-sections';
import { hasAnyFile } from '@/lib/files';

export default function Home() {
  const recent = EXAMS
    .filter(e => isPast(e) && ['g3', 'g2', 'g1'].includes(e.category) && hasAnyFile(e.category, e.id))
    .sort((a, b) => b.year - a.year || b.column.localeCompare(a.column) || a.category.localeCompare(b.category))
    .slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>찾는 기출, 한 번에.</h1>
        <p>수능·모의고사부터 편입, 공무원, 자격증까지 기출을 분류별로 바로 찾아보세요.</p>
        <SearchBox autoFocus />
      </section>

      <h2 className="section-title">전체 분류 <small>파란 항목은 바로 볼 수 있어요 · 회색은 준비 중</small></h2>
      <section className="dir">
        {HOME_SECTIONS.map(s => {
          const open = s.items.filter(i => i.href).length;
          return (
            <div key={s.id} id={s.id} className={`dir-card${open ? '' : ' soon'}`}>
              <div className="dir-head">
                <span className="emo">{s.emoji}</span>
                <b>{s.title}</b>
                <small>{open ? `${open}개 열림` : '준비 중'}</small>
              </div>
              <div className="dir-items">
                {s.items.map(i => i.href ? (
                  <Link key={i.label} href={i.href} className="chip on">{i.label}</Link>
                ) : (
                  <span key={i.label} className="chip" title="준비 중">{i.label}</span>
                ))}
              </div>
            </div>
          );
        })}
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
