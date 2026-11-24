/* 화면용 도우미. 큰 목록(exam-docs.json)을 불러오지 않으므로 클라이언트 코드에서 써도 가볍다. */

export type DocKind = 'question' | 'answer-solution' | 'answer' | 'solution' | 'script' | 'other';

/**
 * title: 버튼에 종류 대신 보여 줄 이름(논술처럼 한 묶음에 파일이 많을 때)
 * url: 다른 기관 공식 사이트 주소. 있으면 R2 대신 그 주소로 연결하고 미리보기에서 뺀다(재배포하지 않는 자료).
 */
export interface ExamDoc { kind: DocKind; path: string; size: number; title?: string; url?: string }
export interface DocGroup { label: string; docs: ExamDoc[] }
export interface SubjectDocs { source: string; groups: DocGroup[] }

export const DOC_LABEL: Record<DocKind, { icon: string; label: string }> = {
  question: { icon: '📄', label: '문제지' },
  'answer-solution': { icon: '✅', label: '정답·해설' },
  answer: { icon: '✅', label: '정답' },
  solution: { icon: '💡', label: '해설' },
  script: { icon: '🎧', label: '듣기 대본' },
  other: { icon: '📎', label: '자료' },
};

export const docTitle = (d: ExamDoc) => d.title ?? DOC_LABEL[d.kind].label;
export const docHref = (d: ExamDoc) => d.url ?? docUrl(d.path);

/** R2 경로 -> 사이트 주소. 경로 조각마다 인코딩한다. */
export const docUrl = (path: string) => '/files/' + path.split('/').map(encodeURIComponent).join('/');

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
