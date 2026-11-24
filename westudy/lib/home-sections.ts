/*
 * 홈 화면의 전체 분류(큰 틀). 자료가 있는 항목만 href 를 적는다. href 가 없으면 "준비 중"으로 보인다.
 * 새 분류에 자료가 생기면 해당 항목에 href 만 추가하면 된다.
 */
export interface SectionItem { label: string; href?: string }
export interface HomeSection { id: string; title: string; emoji: string; items: SectionItem[] }

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: 'suneung', title: '수능·모의고사', emoji: '🎯', items: [
      { label: '대학수학능력시험', href: '/exams/g3/' },
      { label: '평가원 6월·9월 모의평가', href: '/exams/g3/' },
      { label: '고1 전국연합학력평가', href: '/exams/g1/' },
      { label: '고2 전국연합학력평가', href: '/exams/g2/' },
      { label: '고3 전국연합학력평가', href: '/exams/g3/' },
      { label: '대학별 수시 논술·모의논술', href: '/exams/essay/' },
    ],
  },
  {
    id: 'transfer', title: '대학 편입', emoji: '🏛️', items: [
      { label: '일반편입·학사편입', href: '/exams/transfer/' },
      { label: '편입영어', href: '/exams/transfer/' },
      { label: '편입수학', href: '/exams/transfer/' },
      { label: '영어·수학 합본', href: '/exams/transfer/' },
      { label: '편입논술' }, { label: '전공필기' }, { label: '약대 편입' }, { label: '실기 과제' },
    ],
  },
  {
    id: 'ged', title: '검정고시', emoji: '📝', items: [
      { label: '초졸 검정고시' }, { label: '중졸 검정고시' }, { label: '고졸 검정고시' }, { label: '회차·과목별 기출' },
    ],
  },
  {
    id: 'history', title: '한능검·한국사', emoji: '📜', items: [
      { label: '한국사능력검정시험 심화', href: '/exams/khs/' }, { label: '한국사능력검정시험 기본', href: '/exams/khs/' },
      { label: '제1~56회 (옛 고급·중급·초급·급수)', href: '/exams/khs/' },
      { label: '공무원·수능·모의고사·검정고시 한국사' },
    ],
  },
  {
    id: 'civil', title: '공무원', emoji: '🗂️', items: [
      { label: '국가직·지방직 9급' }, { label: '국가직·지방직 7급' }, { label: '5급 공채' }, { label: '외교관후보자' },
      { label: '국회직' }, { label: '법원직' }, { label: '군무원' }, { label: '경찰공무원' }, { label: '소방공무원' }, { label: '해양경찰' },
    ],
  },
  {
    id: 'teacher', title: '교원 임용', emoji: '🍎', items: [
      { label: '유치원 교사 임용' }, { label: '초등 교사 임용' }, { label: '중등 교사 임용' }, { label: '특수교사 임용' },
      { label: '교육학' }, { label: '전공과목' },
    ],
  },
  {
    id: 'office', title: '컴퓨터·사무', emoji: '💻', items: [
      { label: '컴퓨터활용능력 1급·2급 필기' }, { label: '컴퓨터활용능력 실기' }, { label: '워드프로세서' }, { label: 'ITQ' },
      { label: 'MOS' }, { label: '사무자동화산업기사' },
    ],
  },
  {
    id: 'it', title: 'IT·데이터', emoji: '🧮', items: [
      { label: '정보처리기사·산업기사·기능사' }, { label: '정보보안기사' }, { label: 'SQLD·SQLP' }, { label: 'ADsP·ADP' },
      { label: '빅데이터분석기사' }, { label: '리눅스마스터' }, { label: '네트워크관리사' },
    ],
  },
  {
    id: 'finance', title: '회계·세무·금융', emoji: '💰', items: [
      { label: '전산회계' }, { label: '전산세무' }, { label: 'FAT·TAT' }, { label: '전산회계운용사' }, { label: '재경관리사' },
      { label: '회계관리' }, { label: '투자자산운용사' }, { label: 'AFPK' }, { label: '신용분석사' }, { label: '공인회계사' }, { label: '세무사' },
    ],
  },
  {
    id: 'law', title: '부동산·법률·전문직', emoji: '⚖️', items: [
      { label: '공인중개사' }, { label: '주택관리사보' }, { label: '감정평가사' }, { label: '공인노무사' }, { label: '행정사' },
      { label: '법무사' }, { label: '변리사' }, { label: '관세사' }, { label: '변호사시험' },
    ],
  },
  {
    id: 'engineering', title: '전기·안전·건설', emoji: '⚡', items: [
      { label: '전기기사·전기산업기사·전기기능사' }, { label: '산업안전기사' }, { label: '건설안전기사' }, { label: '소방설비기사' },
      { label: '위험물산업기사·기능사' }, { label: '건축기사' }, { label: '토목기사' }, { label: '건축사' },
    ],
  },
  {
    id: 'craft', title: '기능사·실기 자격증', emoji: '🛠️', items: [
      { label: '지게차운전기능사' }, { label: '굴착기운전기능사' }, { label: '한식·양식·중식·일식조리기능사' },
      { label: '제과·제빵기능사' }, { label: '미용사' }, { label: '피부미용' }, { label: '네일' }, { label: '자동차정비기능사' },
    ],
  },
  {
    id: 'health', title: '보건·복지', emoji: '🩺', items: [
      { label: '간호사 국가시험' }, { label: '간호조무사' }, { label: '요양보호사' }, { label: '사회복지사 1급' }, { label: '물리치료사' },
      { label: '작업치료사' }, { label: '방사선사' }, { label: '임상병리사' }, { label: '치과위생사' }, { label: '영양사' },
      { label: '위생사' }, { label: '청소년상담사' },
    ],
  },
  {
    id: 'language', title: '어학·한자', emoji: '🌏', items: [
      { label: 'TOEIC' }, { label: 'TOEIC Speaking' }, { label: 'TEPS' }, { label: 'TOEFL' }, { label: 'IELTS' }, { label: 'OPIc' },
      { label: 'G-TELP' }, { label: 'JLPT' }, { label: 'JPT' }, { label: 'HSK' }, { label: 'TOPIK' },
      { label: '한국어교원 자격 관련 시험' }, { label: '한자능력검정' },
    ],
  },
  {
    id: 'career', title: '취업·적성', emoji: '💼', items: [
      { label: 'NCS' }, { label: '공기업 전공필기' }, { label: 'GSAT' }, { label: 'SKCT' }, { label: '경찰대 편입' },
      { label: '사관학교 신입학 시험', href: '/exams/academy/' }, { label: '경찰대 신입학 시험' },
    ],
  },
  {
    id: 'graduate', title: '대학원·전문대학원 입학', emoji: '🎓', items: [
      { label: 'LEET' }, { label: '대학원별 전공시험' }, { label: '의·치·약학계열 별도 선발시험' },
    ],
  },
  {
    id: 'driving', title: '운전·운송', emoji: '🚗', items: [
      { label: '운전면허 학과시험' }, { label: '화물운송종사 자격시험' }, { label: '버스운전 자격시험' }, { label: '택시운전 자격시험' },
    ],
  },
];
