/* 화면용 도우미. 큰 목록(exam-docs.json)을 불러오지 않으므로 클라이언트 코드에서 써도 가볍다. */

export type DocKind = 'question' | 'answer-solution' | 'answer' | 'solution' | 'script';

export interface ExamDoc { kind: DocKind; path: string; size: number }
export interface DocGroup { label: string; docs: ExamDoc[] }
export interface SubjectDocs { source: string; groups: DocGroup[] }

export const DOC_LABEL: Record<DocKind, { icon: string; label: string }> = {
  question: { icon: '📄', label: '문제지' },
  'answer-solution': { icon: '✅', label: '정답·해설' },
  answer: { icon: '✅', label: '정답' },
  solution: { icon: '💡', label: '해설' },
  script: { icon: '🎧', label: '듣기 대본' },
};

/** R2 경로 -> 사이트 주소. 경로 조각마다 인코딩한다. */
export const docUrl = (path: string) => '/files/' + path.split('/').map(encodeURIComponent).join('/');

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
