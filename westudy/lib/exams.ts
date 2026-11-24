/*
 * 시험 데이터 정의
 * - 연도(year)는 "시행 연도"로 저장합니다. 평가원 6월·9월·수능은 화면에서 "학년도"(= 시행 연도 + 1)를 함께 보여줍니다.
 * - 실제 파일 주소는 lib/files.ts 에서 관리합니다.
 */

export type SubjectId = 'kor' | 'math' | 'eng' | 'hist' | 'soc' | 'sci' | 'job' | 'lang2' | 'pub-kor' | 'pub-eng' | 'pub-hist' | 'admin-law' | 'admin-study';

export interface Subject {
  id: SubjectId;
  name: string;
  minutes: number;   // 실전모드 제한 시간
  questions: number; // OMR 문항 수
  choices: number;   // 0 이면 주관식(숫자 입력)만
  short?: number[];  // 단답형(숫자 입력) 문항 번호
  listening?: boolean;
}

export const SUBJECTS: Record<SubjectId, Subject> = {
  kor: { id: 'kor', name: '국어', minutes: 80, questions: 45, choices: 5 },
  math: { id: 'math', name: '수학', minutes: 100, questions: 30, choices: 5, short: [16, 17, 18, 19, 20, 21, 22, 29, 30] },
  eng: { id: 'eng', name: '영어', minutes: 70, questions: 45, choices: 5, listening: true },
  hist: { id: 'hist', name: '한국사', minutes: 30, questions: 20, choices: 5 },
  soc: { id: 'soc', name: '사회탐구', minutes: 30, questions: 20, choices: 5 },
  sci: { id: 'sci', name: '과학탐구', minutes: 30, questions: 20, choices: 5 },
  job: { id: 'job', name: '직업탐구', minutes: 30, questions: 20, choices: 5 },
  lang2: { id: 'lang2', name: '제2외국어/한문', minutes: 40, questions: 30, choices: 5 },
  'pub-kor': { id: 'pub-kor', name: '국어', minutes: 20, questions: 20, choices: 4 },
  'pub-eng': { id: 'pub-eng', name: '영어', minutes: 20, questions: 20, choices: 4 },
  'pub-hist': { id: 'pub-hist', name: '한국사', minutes: 20, questions: 20, choices: 4 },
  'admin-law': { id: 'admin-law', name: '행정법총론', minutes: 20, questions: 20, choices: 4 },
  'admin-study': { id: 'admin-study', name: '행정학개론', minutes: 20, questions: 20, choices: 4 },
};

export type CategoryId = 'g3' | 'g2' | 'g1' | 'transfer' | 'civil';

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  emoji: string;
  desc: string;
  layout: 'month' | 'school'; // month: 연도×시행월 표, school: 학교(대학·직렬)×연도 표
  columns: { key: string; label: string; sub?: string }[];
  subjects: SubjectId[];
}

const YEARS = [2026, 2025, 2024, 2023, 2022];

export const CATEGORIES: Category[] = [
  {
    id: 'g3', name: '수능 · 고3 모의고사', short: '수능·고3', emoji: '🎯',
    desc: '수능, 평가원 6·9월 모의평가, 교육청 학력평가',
    layout: 'month',
    columns: [
      { key: '03', label: '3월', sub: '교육청' },
      { key: '05', label: '5월', sub: '교육청' },
      { key: '06', label: '6월', sub: '평가원' },
      { key: '07', label: '7월', sub: '교육청' },
      { key: '09', label: '9월', sub: '평가원' },
      { key: '10', label: '10월', sub: '교육청' },
      { key: '11', label: '수능', sub: '평가원' },
    ],
    subjects: ['kor', 'math', 'eng', 'hist', 'soc', 'sci'],
  },
  {
    id: 'g2', name: '고2 모의고사', short: '고2', emoji: '📘',
    desc: '교육청 전국연합학력평가',
    layout: 'month',
    columns: [
      { key: '03', label: '3월' }, { key: '06', label: '6월' },
      { key: '09', label: '9월' }, { key: '11', label: '11월' },
    ],
    subjects: ['kor', 'math', 'eng', 'hist', 'soc', 'sci'],
  },
  {
    id: 'g1', name: '고1 모의고사', short: '고1', emoji: '📗',
    desc: '교육청 전국연합학력평가',
    layout: 'month',
    columns: [
      { key: '03', label: '3월' }, { key: '06', label: '6월' },
      { key: '09', label: '9월' }, { key: '11', label: '11월' },
    ],
    subjects: ['kor', 'math', 'eng', 'hist', 'soc', 'sci'],
  },
  {
    id: 'transfer', name: '편입 기출', short: '편입', emoji: '🏛️',
    desc: '대학별 편입학 필기시험 (공식 공개분)',
    layout: 'school',
    columns: [
      { key: 'yonsei', label: '연세대' }, { key: 'korea', label: '고려대' },
      { key: 'skku', label: '성균관대' }, { key: 'hanyang', label: '한양대' },
      { key: 'cau', label: '중앙대' }, { key: 'khu', label: '경희대' },
    ],
    subjects: ['eng', 'math'],
  },
  {
    id: 'civil', name: '공무원 기출', short: '공무원', emoji: '🗂️',
    desc: '국가직·지방직 9급 공개경쟁채용',
    layout: 'school',
    columns: [
      { key: 'national9', label: '국가직 9급' },
      { key: 'local9', label: '지방직 9급' },
    ],
    subjects: ['pub-kor', 'pub-eng', 'pub-hist', 'admin-law', 'admin-study'],
  },
];

export interface Exam {
  id: string;          // URL용. 예: 2025-06, 2024-yonsei
  category: CategoryId;
  year: number;        // 시행 연도
  column: string;      // 월 또는 학교 키
  title: string;       // 화면 제목
  subtitle: string;    // 보조 설명 (학년도, 시행 기관 등)
  organizer: string;
  subjects: SubjectId[];
}

function monthExam(cat: Category, year: number, col: Category['columns'][number]): Exam {
  const isKice = cat.id === 'g3' && ['06', '09', '11'].includes(col.key);
  const grade = cat.id === 'g3' ? '고3' : cat.id === 'g2' ? '고2' : '고1';
  let title: string;
  let subtitle: string;
  if (cat.id === 'g3' && col.key === '11') {
    title = `${year + 1}학년도 수능`;
    subtitle = `${year}년 11월 시행 · 한국교육과정평가원`;
  } else if (isKice) {
    title = `${year + 1}학년도 ${Number(col.key)}월 모의평가`;
    subtitle = `${year}년 ${Number(col.key)}월 시행 · 한국교육과정평가원`;
  } else {
    title = `${year}년 ${grade} ${Number(col.key)}월 학력평가`;
    subtitle = `${year}년 ${Number(col.key)}월 시행 · 시·도교육청`;
  }
  return {
    id: `${year}-${col.key}`, category: cat.id, year, column: col.key,
    title, subtitle, organizer: isKice ? '평가원' : '교육청',
    // 수능은 직업탐구, 제2외국어/한문 탭을 함께 둔다
    subjects: cat.id === 'g3' && col.key === '11' ? [...cat.subjects, 'job', 'lang2'] : cat.subjects,
  };
}

function schoolExam(cat: Category, year: number, col: Category['columns'][number]): Exam {
  return {
    id: `${year}-${col.key}`, category: cat.id, year, column: col.key,
    title: cat.id === 'transfer' ? `${year} ${col.label} 편입` : `${year} ${col.label}`,
    subtitle: cat.id === 'transfer' ? `${year}학년도 편입학 필기시험` : `${year}년 공개경쟁채용 필기시험`,
    organizer: col.label, subjects: cat.subjects,
  };
}

export const EXAMS: Exam[] = CATEGORIES.flatMap(cat =>
  YEARS.flatMap(year => cat.columns.map(col =>
    cat.layout === 'month' ? monthExam(cat, year, col) : schoolExam(cat, year, col))));

// 아직 시행되지 않은 시험은 목록에서 뺀다 (오늘: 2026-11 기준, 2026 수능까지 시행)
const NOW = { year: 2026, month: 11 };
export const isPast = (e: Exam) =>
  e.year < NOW.year || (e.year === NOW.year && (Number(e.column) || 0) <= NOW.month);

export const YEARS_LIST = YEARS;
export const getCategory = (id: string) => CATEGORIES.find(c => c.id === id);
export const getExam = (cat: string, id: string) => EXAMS.find(e => e.category === cat && e.id === id);
export const examsOf = (cat: CategoryId) => EXAMS.filter(e => e.category === cat);

/** 같은 시험 종류에서 시간순 이전/다음 시험 */
export function neighbors(exam: Exam) {
  const list = examsOf(exam.category)
    .filter(isPast)
    .sort((a, b) => a.year - b.year || a.column.localeCompare(b.column));
  const i = list.findIndex(e => e.id === exam.id);
  return { prev: list[i - 1], next: list[i + 1] };
}
