/*
 * 시험지 파일 목록
 * 키: "분류/시험ID/과목ID"   예) "g3/2025-11/math"
 * 값: 각 파일의 주소. public/files 아래에 두면 "/files/..." 로, R2·S3 에 두면 전체 URL 로 적습니다.
 *
 * 정답(answers)은 OMR 채점에 쓰입니다. 숫자 배열이며, 객관식은 1~5, 단답형은 정답 숫자입니다.
 * 저작권: 평가원·교육청 시험은 출처를 밝히고 비영리로 게시하세요. 편입 기출은 대학이 공식 공개한 것만 올리세요.
 */

export interface ExamFiles {
  question?: string;   // 문제지 PDF
  answer?: string;     // 정답표 PDF
  solution?: string;   // 해설 PDF
  listening?: string;  // 영어 듣기 MP3
  answers?: number[];  // OMR 채점용 정답
  demo?: boolean;      // 데모용 가짜 데이터 표시
}

export const FILES: Record<string, ExamFiles> = {
  // ▼ 데모용: 실제 정답이 아닙니다. 실제 데이터를 넣으면 지워 주세요.
  'g3/2025-11/eng': {
    demo: true,
    answers: Array.from({ length: 45 }, (_, i) => ((i * 7 + 3) % 5) + 1),
  },
  'g1/2026-03/math': {
    demo: true,
    // 16~22, 29~30번은 단답형
    answers: Array.from({ length: 30 }, (_, i) =>
      [16, 17, 18, 19, 20, 21, 22, 29, 30].includes(i + 1) ? (i * 13 + 7) % 100 : ((i * 3 + 2) % 5) + 1),
  },
};

export const filesOf = (cat: string, examId: string, subject: string): ExamFiles =>
  FILES[`${cat}/${examId}/${subject}`] ?? {};

/** 과목 중 하나라도 파일이 있으면 true (표에서 강조 표시용) */
export const hasAnyFile = (cat: string, examId: string) =>
  Object.keys(FILES).some(k => k.startsWith(`${cat}/${examId}/`));
