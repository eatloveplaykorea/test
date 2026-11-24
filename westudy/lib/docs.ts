/*
 * 시험 자료(PDF) 목록
 * exam-docs.json 은 로컬의 make_site_data.py 가 index.csv 와 public-files.json 으로 만든다. 직접 고치지 않는다.
 * 파일은 R2 에 있고, /files/... 주소(Pages Functions)로 내려받는다.
 */
import examDocs from './exam-docs.json';

export type DocKind = 'question' | 'answer-solution' | 'answer' | 'solution';

export interface ExamDoc { kind: DocKind; path: string; size: number }
export interface DocGroup { label: string; docs: ExamDoc[] }
export interface SubjectDocs { source: string; groups: DocGroup[] }

const DOCS = examDocs as Record<string, SubjectDocs>;

export const DOC_LABEL: Record<DocKind, { icon: string; label: string }> = {
  question: { icon: '📄', label: '문제지' },
  'answer-solution': { icon: '✅', label: '정답·해설' },
  answer: { icon: '✅', label: '정답' },
  solution: { icon: '💡', label: '해설' },
};

export const docsOf = (cat: string, examId: string, subject: string): SubjectDocs | undefined =>
  DOCS[`${cat}/${examId}/${subject}`];

export const hasAnyDoc = (cat: string, examId: string) =>
  Object.keys(DOCS).some(k => k.startsWith(`${cat}/${examId}/`));

/** R2 경로 -> 사이트 주소. 경로 조각마다 인코딩한다. */
export const docUrl = (path: string) => '/files/' + path.split('/').map(encodeURIComponent).join('/');

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
