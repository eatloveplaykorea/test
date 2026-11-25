/*
 * 시험 데이터 정의
 * - 연도(year)는 "시행 연도"로 저장합니다. 평가원 6월·9월·수능은 화면에서 "학년도"(= 시행 연도 + 1)를 함께 보여줍니다.
 * - 실제 파일 주소는 lib/files.ts 에서 관리합니다.
 */

export type SubjectId = 'kor' | 'math' | 'eng' | 'hist' | 'soc' | 'sci' | 'job' | 'lang2' | 'essay' | 'tsci' | 'khs' | 'civil' | 'realtor' | 'ged' | 'pub-kor' | 'pub-eng' | 'pub-hist' | 'admin-law' | 'admin-study';

export interface Subject {
  id: SubjectId;
  name: string;
  minutes: number;   // 시험 시간(분)
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
  essay: { id: 'essay', name: '논술', minutes: 100, questions: 0, choices: 0 },
  tsci: { id: 'tsci', name: '과학(전공기초)', minutes: 60, questions: 0, choices: 0 },
  khs: { id: 'khs', name: '한국사능력검정시험', minutes: 80, questions: 0, choices: 0 },
  civil: { id: 'civil', name: '공무원 시험', minutes: 0, questions: 0, choices: 0 },
  realtor: { id: 'realtor', name: '공인중개사', minutes: 0, questions: 0, choices: 0 },
  ged: { id: 'ged', name: '검정고시', minutes: 0, questions: 0, choices: 0 },
  'pub-kor': { id: 'pub-kor', name: '국어', minutes: 20, questions: 20, choices: 4 },
  'pub-eng': { id: 'pub-eng', name: '영어', minutes: 20, questions: 20, choices: 4 },
  'pub-hist': { id: 'pub-hist', name: '한국사', minutes: 20, questions: 20, choices: 4 },
  'admin-law': { id: 'admin-law', name: '행정법총론', minutes: 20, questions: 20, choices: 4 },
  'admin-study': { id: 'admin-study', name: '행정학개론', minutes: 20, questions: 20, choices: 4 },
};

export type CategoryId = 'g3' | 'g2' | 'g1' | 'academy' | 'essay' | 'khs' | 'transfer' | 'civil' | 'realtor' | 'ged';

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  emoji: string;
  desc: string;
  // month: 연도×시행월 표, school: 학교(대학·직렬)×연도 표, list: 학교 목록(연도 구분 없이 학교별 한 페이지)
  layout: 'month' | 'school' | 'list';
  columns: { key: string; label: string; sub?: string }[];
  subjects: SubjectId[];
  omr?: boolean; // false 이면 OMR 칸을 숨긴다
}

// 논술·편입 대학 목록은 make_site_data.py 가 만든다
import essaySchools from './essay-schools.json';
import transferSchoolsJson from './transfer-schools.json';
import khsRoundsJson from './khs-rounds.json';
import civilExamsJson from './civil-exams.json';
import realtorRoundsJson from './realtor-rounds.json';
export const CIVIL_EXAMS = civilExamsJson as { key: string; label: string; series: string; year: number }[];
const REALTOR_ROUNDS = realtorRoundsJson as { key: string; label: string; round: number; year: number }[];
import gedExamsJson from './ged-exams.json';
export const GED_EXAMS = gedExamsJson as { key: string; label: string; series: string; year: number; round: number }[];
export const KHS_ROUNDS = khsRoundsJson as { key: string; label: string; levels: string[] }[];
const transferSchools = transferSchoolsJson as { key: string; label: string; subjects: SubjectId[] }[];

const YEARS = [2026, 2025, 2024, 2023, 2022];

export const CATEGORIES: Category[] = [
  {
    id: 'g3', name: '수능 · 고3 모의고사', short: '수능·고3', emoji: '🎯',
    desc: '수능, 평가원 6·9월 모의평가, 교육청 학력평가',
    layout: 'month',
    columns: [
      { key: '03', label: '3월', sub: '교육청' },
      { key: '04', label: '4월', sub: '교육청' },
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
      { key: '09', label: '9월' }, { key: '10', label: '10월' }, { key: '11', label: '11월' },
    ],
    subjects: ['kor', 'math', 'eng', 'hist', 'soc', 'sci'],
  },
  {
    id: 'g1', name: '고1 모의고사', short: '고1', emoji: '📗',
    desc: '교육청 전국연합학력평가',
    layout: 'month',
    columns: [
      { key: '03', label: '3월' }, { key: '06', label: '6월' },
      { key: '09', label: '9월' }, { key: '10', label: '10월' }, { key: '11', label: '11월' },
    ],
    subjects: ['kor', 'math', 'eng', 'hist', 'soc', 'sci'],
  },
  {
    id: 'academy', name: '사관학교 1차', short: '사관학교', emoji: '🎖️',
    desc: '사관학교 1차 필기시험 (국어·수학·영어)',
    layout: 'month',
    columns: [{ key: '07', label: '1차 시험', sub: '7월' }],
    subjects: ['kor', 'math', 'eng'],
    omr: false,
  },
  {
    id: 'essay', name: '대학 논술', short: '논술', emoji: '✍️',
    desc: '대학별 수시 논술·모의논술 기출 (대학 공개 자료)',
    layout: 'list',
    columns: (essaySchools as { key: string; label: string }[]).map(s => ({ key: s.key, label: s.label })),
    subjects: ['essay'],
    omr: false,
  },
  {
    id: 'khs', name: '한국사능력검정시험', short: '한능검', emoji: '📜',
    desc: '국사편찬위원회 한국사능력검정시험 제1~80회 (심화·기본, 옛 고급·중급·초급·급수제)',
    layout: 'list',
    columns: KHS_ROUNDS.map(r => ({ key: r.key, label: r.label })),
    subjects: ['khs'],
    omr: false,
  },
  {
    id: 'transfer', name: '편입 기출', short: '편입', emoji: '🏛️',
    desc: '대학별 편입학 필기시험 (대학 공식 게시분, 대학 사이트로 연결)',
    layout: 'school',
    // 대학 목록은 make_site_data.py 가 인수인계(westudy_kichul) 공식 자료로 만든다
    columns: transferSchools.map(s => ({ key: s.key, label: s.label })),
    subjects: ['eng', 'math', 'tsci'],
    omr: false,
  },
  {
    id: 'civil', name: '공무원 기출', short: '공무원', emoji: '🗂️',
    desc: '인사혁신처 공개 기출 2005~2026 (9급·7급·5급·지방직·외교관후보자 등)',
    layout: 'list',
    columns: CIVIL_EXAMS.map(e => ({ key: e.key, label: e.label })),
    subjects: ['civil'],
    omr: false,
  },
  {
    id: 'ged', name: '검정고시', short: '검정고시', emoji: '📝',
    desc: '초졸·중졸·고졸 검정고시 2015년 제2회~2026년 제2회 문제지·정답',
    layout: 'list',
    columns: GED_EXAMS.map(e => ({ key: e.key, label: e.label })),
    subjects: ['ged'],
    omr: false,
  },
  {
    id: 'realtor', name: '공인중개사', short: '공인중개사', emoji: '🏠',
    desc: '한국산업인력공단 큐넷 공개 문제지·최종정답 2013~2026',
    layout: 'list',
    columns: REALTOR_ROUNDS.map(r => ({ key: r.key, label: r.label })),
    subjects: ['realtor'],
    omr: false,
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
  if (cat.id === 'academy') {
    return {
      id: `${year}-${col.key}`, category: cat.id, year, column: col.key,
      title: `${year + 1}학년도 사관학교 1차`, subtitle: `${year}년 7월 시행 · 사관학교`,
      organizer: '사관학교', subjects: cat.subjects,
    };
  }
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
    // 편입은 대학마다 자료가 있는 과목만 탭으로 둔다
    organizer: col.label,
    subjects: cat.id === 'transfer' ? (transferSchools.find(s => s.key === col.key)?.subjects ?? cat.subjects) : cat.subjects,
  };
}

// 목록형(논술): 학교마다 한 페이지. 연도는 0(시행 연도 없음)
function listExam(cat: Category, col: Category['columns'][number]): Exam {
  if (cat.id === 'civil') {
    const e = CIVIL_EXAMS.find(x => x.key === col.key);
    return {
      id: col.key, category: cat.id, year: 0, column: col.key,
      title: col.label, subtitle: '인사혁신처 공개 기출 · 문제지·최종정답',
      organizer: e?.series ?? '인사혁신처', subjects: cat.subjects,
    };
  }
  if (cat.id === 'ged') {
    return {
      id: col.key, category: cat.id, year: 0, column: col.key,
      title: col.label, subtitle: '과목별 문제지·정답 · 한국교육과정평가원·시도교육청',
      organizer: GED_EXAMS.find(x => x.key === col.key)?.series ?? '검정고시', subjects: cat.subjects,
    };
  }
  if (cat.id === 'realtor') {
    return {
      id: col.key, category: cat.id, year: 0, column: col.key,
      title: `공인중개사 ${col.label}`, subtitle: '한국산업인력공단 큐넷 · 1차·2차 문제지·최종정답',
      organizer: col.label, subjects: cat.subjects,
    };
  }
  if (cat.id === 'khs') {
    const levels = KHS_ROUNDS.find(r => r.key === col.key)?.levels ?? [];
    return {
      id: col.key, category: cat.id, year: 0, column: col.key,
      title: `한국사능력검정시험 ${col.label}`, subtitle: `${levels.join('·')} · 국사편찬위원회`,
      organizer: col.label, subjects: cat.subjects,
    };
  }
  return {
    id: col.key, category: cat.id, year: 0, column: col.key,
    title: `${col.label} 논술`, subtitle: '수시 논술·모의논술 기출 · 대학 공개 자료',
    organizer: col.label, subjects: cat.subjects,
  };
}

export const EXAMS: Exam[] = CATEGORIES.flatMap(cat =>
  cat.layout === 'list'
    ? cat.columns.map(col => listExam(cat, col))
    : YEARS.flatMap(year => cat.columns.map(col =>
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
