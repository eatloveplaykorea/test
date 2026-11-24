# we.study.today

수능 · 고1·2·3 모의고사 · 편입 · 공무원 기출문제를 한곳에서 찾는 사이트입니다.

## 실행

```bash
cd westudy
npm install
npm run dev        # http://localhost:3000
npm run build      # out/ 폴더에 정적 사이트 생성 → 어디든 올리면 됩니다
```

## 화면

| 주소 | 내용 |
|---|---|
| `/` | 검색창, 시험 종류, 최근 시행된 시험 |
| `/exams/g3/` | 연도 × 시행월 표 (편입·공무원은 학교/직렬 × 연도) |
| `/exams/g3/2025-11/math/` | 과목 탭, 문제지·정답·해설·듣기, 실전모드 타이머, OMR 채점 |
| `/search/?q=...` | 자연어 검색 결과 |
| `/saved/` | 저장한 시험 (로그인 없이 이 기기에만 저장) |

검색은 "2026 수능 수학", "고2 6월 영어", "24 9월 모평 국어", "연대 편입 영어" 같은 입력을 알아듣습니다.
수능·평가원 모의평가는 **학년도** 기준(2026학년도 수능 = 2025년 11월 시행)으로 찾습니다.

## 시험지 올리기

PDF는 Cloudflare R2 버킷 `westudy-files`에 두고, Pages Functions(`functions/files/[[path]].js`)가 `/files/...` 주소로 내려줍니다. Pages 설정의 R2 바인딩 이름은 `FILES`입니다.

1. PDF를 rclone으로 R2에 올립니다(경로는 로컬 `정리` 폴더 구조 그대로).
2. 공개할 파일을 `lib/public-files.json`에 넣습니다. 여기에 없는 경로는 404입니다.
3. 로컬에서 `make_site_data.py`를 실행해 `lib/exam-docs.json`을 다시 만듭니다. 과목 페이지의 선택과목별 버튼은 이 파일로 생깁니다.

듣기 파일과 OMR 정답은 `lib/files.ts`에 적습니다.

```ts
'g3/2025-11/math': {
  question: '/files/g3/2025-11/math-q.pdf',
  answer: '/files/g3/2025-11/math-a.pdf',
  answers: [3, 5, 1, /* ... 30개 */],   // 넣으면 OMR 채점이 켜집니다
},
```

- 키 형식: `분류/시험ID/과목ID` — 분류 `g3 g2 g1 transfer civil`, 과목 ID는 `lib/exams.ts` 의 `SUBJECTS`
- 파일이 있는 시험은 표에 초록 점(●)이 붙습니다.
- 연도·시험·대학을 늘리려면 `lib/exams.ts` 의 `YEARS`, `CATEGORIES` 를 고칩니다.

## 저작권

- 수능·모의평가: 한국교육과정평가원, 학력평가: 각 시·도교육청. 출처를 밝히고 비영리로 게시하세요.
- 편입 기출은 대학이 공식 공개한 것만 올리세요. 학원 복원본은 올리지 마세요.
