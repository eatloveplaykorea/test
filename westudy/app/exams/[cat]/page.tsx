import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, YEARS_LIST, getCategory, getExam, isPast } from '@/lib/exams';
import { hasAnyFile } from '@/lib/files';

export const generateStaticParams = () => CATEGORIES.map(c => ({ cat: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const cat = getCategory((await params).cat);
  return { title: cat ? `${cat.name} — we.study.today` : 'we.study.today' };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const cat = getCategory((await params).cat);
  if (!cat) notFound();

  return (
    <>
      <div className="page-head">
        <div className="crumb"><Link href="/">홈</Link> › {cat.short}</div>
        <h1>{cat.emoji} {cat.name}</h1>
        <p>{cat.desc} · 칸을 누르면 바로 시험지로 이동해요.</p>
      </div>

      <div className="grid-scroll">
        <table className="grid">
          <thead>
            <tr>
              <th>{cat.layout === 'month' ? '시행 연도' : '연도'}</th>
              {cat.columns.map(col => (
                <th key={col.key}>{col.label}{col.sub && <small>{col.sub}</small>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {YEARS_LIST.map(year => (
              <tr key={year}>
                <th>{year}</th>
                {cat.columns.map(col => {
                  const exam = getExam(cat.id, `${year}-${col.key}`);
                  if (!exam || !isPast(exam)) return <td key={col.key}><span className="na">—</span></td>;
                  return (
                    <td key={col.key}>
                      <Link
                        href={`/exams/${cat.id}/${exam.id}/${exam.subjects[0]}/`}
                        className={hasAnyFile(cat.id, exam.id) ? 'ready' : ''}
                        title={exam.title}
                      >
                        {cat.layout === 'month' && col.key === '11' && cat.id === 'g3' ? `${year + 1}학년도` : '보기'}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="legend">
        <span style={{ color: 'var(--good)' }}>●</span> 표시는 파일이 올라온 시험이에요.
        {cat.id === 'g3' && ' 평가원 6·9월 모의평가와 수능은 다음 해 학년도로 불러요 (예: 2025년 11월 시행 = 2026학년도 수능).'}
      </p>
    </>
  );
}
