/*
 * 자연어 검색: "24 수능 수학", "고2 6월 영어", "연대 편입 2023" 같은 입력을 시험·과목으로 바꿉니다.
 */
import { CATEGORIES, EXAMS, SUBJECTS, isPast, type CategoryId, type Exam, type SubjectId } from './exams';

const SUBJECT_WORDS: [RegExp, SubjectId[]][] = [
  [/국어|언매|화작|문학/, ['kor', 'pub-kor']],
  [/수학|미적|확통|기하/, ['math']],
  [/영어|듣기|english/i, ['eng', 'pub-eng']],
  [/한국사|국사/, ['hist', 'pub-hist']],
  [/사탐|사회/, ['soc']],
  [/과탐|과학|물리|화학|생명|지구/, ['sci']],
  [/직탐|직업/, ['job']],
  [/제2외|외국어|한문|일본어|중국어|독일어|프랑스어|스페인어|러시아어|아랍어|베트남어/, ['lang2']],
  [/행정법/, ['admin-law']],
  [/행정학/, ['admin-study']],
];

const SCHOOL_WORDS: [RegExp, string][] = [
  [/연세|연대/, 'yonsei'], [/고려|고대/, 'korea'], [/성균|성대/, 'skku'],
  [/한양|한대/, 'hanyang'], [/중앙|중대/, 'cau'], [/경희/, 'khu'],
  [/국가직/, 'national9'], [/지방직/, 'local9'],
];

export interface Hit { exam: Exam; subject?: SubjectId; score: number }

export function search(raw: string): Hit[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];

  // 학년/시험 종류
  let cats: CategoryId[] | null = null;
  if (/고\s*3|고삼|수능|평가원|모평/.test(q)) cats = ['g3'];
  else if (/고\s*2|고이/.test(q)) cats = ['g2'];
  else if (/고\s*1|고일/.test(q)) cats = ['g1'];
  else if (/편입/.test(q)) cats = ['transfer'];
  else if (/공무원|9급|국가직|지방직/.test(q)) cats = ['civil'];

  const school = SCHOOL_WORDS.find(([re]) => re.test(q))?.[1];
  if (school && !cats) cats = ['yonsei', 'korea', 'skku', 'hanyang', 'cau', 'khu'].includes(school) ? ['transfer'] : ['civil'];

  // 월
  let month: string | null = null;
  if (/수능/.test(q)) month = '11';
  else {
    const m = q.match(/(\d{1,2})\s*월/);
    if (m) month = m[1].padStart(2, '0');
  }

  // 연도: 2024, 24, 24년, 2025학년도
  let year: number | null = null;
  const isSchoolYear = /학년도/.test(q);
  const y4 = q.match(/(20\d{2})/);
  const y2 = q.replace(/\d{1,2}\s*월/g, '').match(/(?:^|\D)(\d{2})(?:\s*(?:년|학년도)?)(?=\D|$)/);
  if (y4) year = Number(y4[1]);
  else if (y2) year = 2000 + Number(y2[1]);

  // "학년도"는 수능·평가원 모의평가에서만 쓰는 표현
  if (isSchoolYear && !cats) cats = ['g3'];

  const subjects = SUBJECT_WORDS.find(([re]) => re.test(q))?.[1] ?? null;

  const hits: Hit[] = [];
  for (const exam of EXAMS) {
    if (!isPast(exam)) continue;
    if (cats && !cats.includes(exam.category)) continue;
    if (school && exam.column !== school) continue;
    if (month && exam.column !== month) continue;

    let score = 1;
    if (year !== null) {
      // 수능·평가원 모의평가는 "학년도"로 부르는 경우가 많다: 2025 수능 = 2024년 11월 시행
      const kice = exam.category === 'g3' && ['06', '09', '11'].includes(exam.column);
      const asSchoolYear = exam.year + 1 === year;
      const asCalendar = exam.year === year;
      if (kice && (isSchoolYear || /수능|모평|평가원/.test(q))) {
        if (!asSchoolYear) continue;
      } else if (kice) {
        if (!asSchoolYear && !asCalendar) continue;
        if (asSchoolYear) score += 1;
      } else if (!asCalendar) continue;
      score += 2;
    }
    if (month) score += 2;
    if (cats) score += 1;

    const subs = subjects ? exam.subjects.filter(s => subjects.includes(s)) : [];
    if (subjects && subs.length === 0) continue;
    if (subs.length) score += 2;
    hits.push({ exam, subject: subs[0], score });
  }

  return hits
    .sort((a, b) => b.score - a.score || b.exam.year - a.exam.year || b.exam.column.localeCompare(a.exam.column))
    .slice(0, 30);
}

export const hitHref = (h: Hit) =>
  `/exams/${h.exam.category}/${h.exam.id}/${h.subject ?? h.exam.subjects[0]}/`;

export const hitLabel = (h: Hit) =>
  `${h.exam.title}${h.subject ? ' · ' + SUBJECTS[h.subject].name : ''}`;

export const categoryName = (id: CategoryId) => CATEGORIES.find(c => c.id === id)!.short;
