import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EXAMS, SUBJECTS, getCategory, getExam, isPast, neighbors, type SubjectId } from '@/lib/exams';
import { filesOf } from '@/lib/files';
import { docsOf } from '@/lib/docs';
import SaveButton from '@/components/SaveButton';
import DocViewer, { DocList } from '@/components/DocViewer';

type Params = Promise<{ cat: string; id: string; subject: string }>;

export const generateStaticParams = () =>
  EXAMS.filter(isPast).flatMap(e => e.subjects.map(s => ({ cat: e.category, id: e.id, subject: s })));

export async function generateMetadata({ params }: { params: Params }) {
  const p = await params;
  const exam = getExam(p.cat, p.id);
  const sub = SUBJECTS[p.subject as SubjectId];
  return { title: exam && sub ? `${exam.title} ${sub.name} — we.study.today` : 'we.study.today' };
}

export default async function ExamPage({ params }: { params: Params }) {
  const p = await params;
  const cat = getCategory(p.cat);
  const exam = getExam(p.cat, p.id);
  const subject = SUBJECTS[p.subject as SubjectId];
  if (!cat || !exam || !subject || !exam.subjects.includes(subject.id)) notFound();

  const files = filesOf(cat.id, exam.id, subject.id);
  const docs = docsOf(cat.id, exam.id, subject.id);
  const { prev, next } = neighbors(exam);
  const base = `/exams/${cat.id}`;

  const fileButtons: { key: keyof typeof files; icon: string; label: string; show: boolean }[] = [
    { key: 'question', icon: '📄', label: '문제지', show: true },
    { key: 'answer', icon: '✅', label: '정답', show: true },
    { key: 'solution', icon: '💡', label: '해설', show: true },
    { key: 'listening', icon: '🎧', label: '듣기 파일', show: !!subject.listening },
  ];

  return (
    <>
      <div className="page-head">
        <div className="crumb">
          <Link href="/">홈</Link> › <Link href={`${base}/`}>{cat.short}</Link> › {exam.year || exam.organizer}
        </div>
        <h1 className="title-row">
          <span>{exam.title}</span>
          <SaveButton examKey={`${cat.id}/${exam.id}/${subject.id}`} title={`${exam.title} ${subject.name}`} />
        </h1>
        <p>{exam.subtitle}</p>
      </div>

      {exam.subjects.length > 1 && (
        <nav className="subject-tabs" aria-label="과목">
          {exam.subjects.map(s => (
            <Link key={s} href={`${base}/${exam.id}/${s}/`} className={s === subject.id ? 'on' : ''}>
              {SUBJECTS[s].name}
            </Link>
          ))}
        </nav>
      )}

      {docs && (
        <>
          <DocList groups={docs.groups} stacked={cat.layout === 'list'} />
          <p className="doc-source">
            출처: {docs.source} · 비영리 학습용으로 게시합니다.
            <span className="mobile-only"> 휴대폰에서는 위 버튼을 누르면 PDF가 열려요.</span>
          </p>
        </>
      )}

      <div className="files">
        {fileButtons.filter(b => b.show && !docs).map(b => {
          const url = files[b.key] as string | undefined;
          return url ? (
            <a key={b.key} className="file" href={url} target="_blank" rel="noopener" download={b.key === 'listening' || undefined}>
              <span className="ic">{b.icon}</span><span>{b.label}<small>내려받기</small></span>
            </a>
          ) : (
            <span key={b.key} className="file off" aria-disabled="true">
              <span className="ic">{b.icon}</span><span>{b.label}<small>준비 중</small></span>
            </span>
          );
        })}
      </div>

      <div className="layout single">
        {docs ? (
          <DocViewer title={`${exam.title} ${subject.name}`} groups={docs.groups} />
        ) : <div className={`viewer${files.question ? '' : ' empty-viewer'}`}>
          {files.question ? (
            <iframe src={files.question} title={`${exam.title} ${subject.name} 문제지`} />
          ) : (
            <div className="placeholder">
              <div className="big">📄</div>
              <p><b>문제지를 준비하고 있어요.</b></p>
              <p>파일이 올라오면 이 자리에서 바로 볼 수 있어요.</p>
            </div>
          )}
        </div>}
      </div>

      <div className="pager">
        {prev ? (
          <Link href={`${base}/${prev.id}/${prev.subjects.includes(subject.id) ? subject.id : prev.subjects[0]}/`}>
            <small>← 이전 시험</small>{prev.title}
          </Link>
        ) : <span style={{ flex: 1 }} />}
        {next ? (
          <Link className="next" href={`${base}/${next.id}/${next.subjects.includes(subject.id) ? subject.id : next.subjects[0]}/`}>
            <small>다음 시험 →</small>{next.title}
          </Link>
        ) : <span style={{ flex: 1 }} />}
      </div>
    </>
  );
}
