/*
 * 시험 자료(PDF) 목록 - 서버(빌드) 전용.
 * exam-docs.json 은 로컬의 make_site_data.py 가 index.csv 와 public-files.json 으로 만든다. 직접 고치지 않는다.
 * 클라이언트 컴포넌트는 이 파일 대신 doc-utils.ts 를 불러야 한다(큰 목록이 페이지에 실리지 않게).
 */
import examDocs from './exam-docs.json';
import type { SubjectDocs } from './doc-utils';

export * from './doc-utils';

const DOCS = examDocs as Record<string, SubjectDocs>;

export const docsOf = (cat: string, examId: string, subject: string): SubjectDocs | undefined =>
  DOCS[`${cat}/${examId}/${subject}`];

const EXAMS_WITH_DOCS = new Set(Object.keys(DOCS).map(k => k.split('/').slice(0, 2).join('/')));
export const hasAnyDoc = (cat: string, examId: string) => EXAMS_WITH_DOCS.has(`${cat}/${examId}`);
