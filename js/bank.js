/*
 * 모의고사 문항 은행 (영어 독해)
 * 모든 지문은 이 사이트를 위해 새로 작성한 연습용 지문입니다.
 * type: 모의고사 유형, grade: 대상 학년(1~3), level: 1(쉬움)~3(어려움)
 * passage 안의 <u>…</u> 은 밑줄, (A)(B)(C) 등은 그대로 출력됩니다.
 * answer: 정답 보기의 0-기반 인덱스
 */
window.QUESTION_TYPES = [
  { key: 'purpose', label: '글의 목적', no: 18 },
  { key: 'mood', label: '심경 변화', no: 19 },
  { key: 'claim', label: '필자의 주장', no: 20 },
  { key: 'gist', label: '글의 요지', no: 22 },
  { key: 'topic', label: '글의 주제', no: 23 },
  { key: 'title', label: '글의 제목', no: 24 },
  { key: 'mismatch', label: '내용 불일치', no: 26 },
  { key: 'grammar', label: '어법', no: 29 },
  { key: 'vocab', label: '어휘', no: 30 },
  { key: 'blank', label: '빈칸 추론', no: 31 },
  { key: 'irrelevant', label: '무관한 문장', no: 35 },
  { key: 'order', label: '글의 순서', no: 36 },
  { key: 'insert', label: '문장 삽입', no: 38 },
  { key: 'summary', label: '요약문 완성', no: 40 },
];

window.QUESTION_BANK = [
  /* ---------------- 글의 목적 ---------------- */
  {
    id: 'p1', type: 'purpose', grade: [1, 2], level: 1,
    stem: '다음 글의 목적으로 가장 적절한 것은?',
    passage: `Dear Residents,<br>As many of you know, the community library on Maple Street has been closed for repairs since March. We are happy to announce that the work is almost finished. However, we still need help moving about three thousand books back onto the shelves before we reopen. We are looking for volunteers who can spare two or three hours this Saturday. No experience is necessary, and lunch will be provided. If you are interested, please sign up at the front desk of the community center by Thursday.<br>Sincerely,<br>Grace Lee, Library Director`,
    choices: ['도서관 재개관 일정 변경을 공지하려고', '도서 정리 자원봉사자를 모집하려고', '도서관 수리 비용 기부를 요청하려고', '지역 주민 독서 모임을 홍보하려고', '도서관 이용 규칙 변경을 안내하려고'],
    answer: 1,
    explain: '토요일에 책을 다시 꽂을 자원봉사자(volunteers)를 구한다는 내용이다.',
  },
  {
    id: 'p2', type: 'purpose', grade: [2, 3], level: 2,
    stem: '다음 글의 목적으로 가장 적절한 것은?',
    passage: `To the Manager of Riverside Fitness,<br>I have been a member of your gym for over four years and have always been satisfied with your services. Recently, however, I noticed that the locker rooms are not being cleaned as often as before. Last week, the floors were wet and dirty on three different evenings, and two of the showers had no hot water. I understand that you may be short of staff, but these conditions are not only unpleasant but also unsafe. I would appreciate it if you could look into this matter and restore the previous cleaning schedule.<br>Best regards,<br>Daniel Park`,
    choices: ['헬스장 회원권 환불을 요청하려고', '새로운 운동 프로그램을 제안하려고', '탈의실 관리 상태 개선을 요청하려고', '직원 채용 공고에 지원하려고', '헬스장 운영 시간 연장을 건의하려고'],
    answer: 2,
    explain: '탈의실 청소와 온수 문제를 지적하며 이전 청소 일정 복구를 요청하고 있다.',
  },

  /* ---------------- 심경 변화 ---------------- */
  {
    id: 'm1', type: 'mood', grade: [1, 2], level: 1,
    stem: '다음 글에 드러난 Mina의 심경 변화로 가장 적절한 것은?',
    passage: `Mina checked the screen again. Her name was not on the list of students selected for the national science camp. She had worked on her project every night for two months. Her hands felt cold, and she could not say a word. Then her phone buzzed. It was a message from her teacher: "There was an error in the list. You placed first in the region! Check the updated page." Mina refreshed the website, and there it was — her name, at the very top. She jumped up from her chair and laughed out loud.`,
    choices: ['bored → curious', 'disappointed → delighted', 'confident → nervous', 'calm → angry', 'grateful → regretful'],
    answer: 1,
    explain: '명단에 없어 낙담했다가 1위였다는 사실을 알고 기뻐한다.',
  },
  {
    id: 'm2', type: 'mood', grade: [2, 3], level: 2,
    stem: '다음 글에 드러난 Jake의 심경 변화로 가장 적절한 것은?',
    passage: `The trail had disappeared under the fresh snow an hour ago, and the sun was already sinking behind the ridge. Jake stopped and turned in a slow circle. Every tree looked the same. His phone showed no signal, and the wind was getting stronger. He tried to remember which way the river had been, but his thoughts kept scattering. Just as he reached for his whistle, he spotted a faint orange glow between the pines. It was the window of the mountain hut he had passed that morning. His shoulders relaxed, and he let out a long breath as he walked toward the light.`,
    choices: ['anxious → relieved', 'excited → bored', 'jealous → sympathetic', 'relaxed → frightened', 'hopeful → frustrated'],
    answer: 0,
    explain: '길을 잃어 불안했다가 산장 불빛을 보고 안도한다.',
  },

  /* ---------------- 필자의 주장 ---------------- */
  {
    id: 'c1', type: 'claim', grade: [1, 2], level: 1,
    stem: '다음 글에서 필자가 주장하는 바로 가장 적절한 것은?',
    passage: `Many students believe that studying for long hours without a break is the best way to prepare for exams. They sit at their desks until late at night, thinking that every minute away from their books is wasted. But our brains do not work like machines. After about fifty minutes of focused work, attention begins to drop sharply, and information is no longer stored effectively. A short walk, a glass of water, or a few minutes of stretching gives the brain time to organize what it has just learned. Therefore, if you want to study efficiently, you should plan regular breaks as carefully as you plan your study time.`,
    choices: ['시험 기간에는 수면 시간을 늘려야 한다.', '공부할 때 규칙적인 휴식을 계획해야 한다.', '어려운 과목부터 먼저 공부해야 한다.', '친구와 함께 공부하는 습관을 길러야 한다.', '공부 장소를 자주 바꾸는 것이 좋다.'],
    answer: 1,
    explain: '마지막 문장에서 휴식을 공부 시간만큼 신중히 계획하라고 주장한다.',
  },

  /* ---------------- 요지 ---------------- */
  {
    id: 'g1', type: 'gist', grade: [2, 3], level: 2,
    stem: '다음 글의 요지로 가장 적절한 것은?',
    passage: `When people make a mistake at work, their first reaction is often to hide it. They fear that admitting an error will make them look incompetent. Yet research on teams in hospitals and engineering firms shows the opposite pattern. Teams that openly reported their mistakes did not perform worse; they performed better over time, because problems were discovered early and solutions were shared. In teams where errors were concealed, small problems quietly grew into serious failures. A workplace that treats mistakes as information rather than as reasons for blame allows everyone to learn faster.`,
    choices: ['실수를 줄이려면 업무 절차를 표준화해야 한다.', '실수를 공개적으로 공유하는 조직이 더 빨리 발전한다.', '유능한 직원은 실수를 거의 하지 않는다.', '팀워크보다 개인의 책임감이 더 중요하다.', '실수에 대한 처벌은 업무 효율을 높인다.'],
    answer: 1,
    explain: '실수를 비난이 아닌 정보로 다루는 조직이 더 빠르게 배운다는 것이 요지이다.',
  },

  /* ---------------- 주제 ---------------- */
  {
    id: 't1', type: 'topic', grade: [2, 3], level: 2,
    stem: '다음 글의 주제로 가장 적절한 것은?',
    passage: `Before the invention of artificial lighting, human sleep often followed a different pattern from the one we know today. Historical records from several regions describe people going to bed shortly after sunset, waking for an hour or so around midnight, and then returning to a "second sleep" until dawn. During the waking period, people prayed, talked quietly, or simply rested. As oil lamps and later electric lights extended the evening, people began to go to bed later, and the two separate periods of sleep gradually merged into a single block. What we consider "normal" sleep may therefore be partly a product of technology.`,
    choices: ['the health risks of sleeping too little', 'how artificial light changed human sleep patterns', 'the role of dreams in ancient religions', 'methods to fall asleep more quickly', 'why people in the past worked at night'],
    answer: 1,
    explain: '인공조명이 분할 수면을 하나의 수면으로 바꾸었다는 내용이다.',
  },

  /* ---------------- 제목 ---------------- */
  {
    id: 'ti1', type: 'title', grade: [1, 2, 3], level: 2,
    stem: '다음 글의 제목으로 가장 적절한 것은?',
    passage: `A city park may look like a simple patch of grass and trees, but it performs work that would cost millions of dollars to replace. Its trees absorb rainwater that would otherwise flood streets and overload drains. Their leaves trap dust and pollutants, cleaning the air that nearby residents breathe. On hot summer days, shaded areas can be several degrees cooler than surrounding concrete, reducing the need for air conditioning. Parks also give people a place to exercise and relax, which lowers health care costs. When city budgets are cut, parks are often the first to suffer, but they may be one of the smartest investments a city can make.`,
    choices: ['How to Design a Beautiful Park', 'Parks: The Hidden Value of Urban Green Space', 'Why Cities Are Getting Hotter', 'The High Cost of Maintaining Trees', 'Concrete Versus Grass: Which Is Safer?'],
    answer: 1,
    explain: '공원이 홍수 방지, 공기 정화, 냉방, 건강 등 숨은 가치를 지닌다는 내용이다.',
  },

  /* ---------------- 내용 불일치 ---------------- */
  {
    id: 'mm1', type: 'mismatch', grade: [1, 2], level: 1,
    stem: 'Emily Carter에 관한 다음 글의 내용과 일치하지 않는 것은?',
    passage: `Emily Carter was born in 1921 in a small fishing village in Scotland. As a child, she spent hours drawing the boats in the harbor. At the age of seventeen, she moved to London to study painting, supporting herself by working in a bakery at night. Her early works, mostly landscapes of the sea, received little attention. It was not until she turned fifty that her paintings were shown in a major gallery. The exhibition was a great success, and she became known for her bold use of blue and gray. She continued painting until her death at the age of ninety-three.`,
    choices: ['스코틀랜드의 어촌에서 태어났다.', '어린 시절 항구의 배를 그리곤 했다.', '런던에서 낮에 빵집에서 일하며 생활비를 벌었다.', '50세가 되어서야 주요 미술관에서 전시를 열었다.', '93세에 사망할 때까지 그림을 그렸다.'],
    answer: 2,
    explain: '빵집에서는 밤에(at night) 일했다.',
  },

  /* ---------------- 어법 ---------------- */
  {
    id: 'gr1', type: 'grammar', grade: [1, 2], level: 2,
    stem: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?',
    passage: `Honeybees communicate the location of food through a movement ①<u>known</u> as the "waggle dance." When a worker bee returns to the hive, she moves in a figure-eight pattern, and the angle of her dance shows the direction of the flowers ②<u>relative</u> to the sun. The longer she shakes her body, the farther away the food ③<u>is</u>. Other bees ④<u>gathering</u> around her follow the movements closely and then fly off to find the source. Scientists were amazed to discover that such a small insect ⑤<u>being</u> capable of sharing such precise information.`,
    choices: ['①', '②', '③', '④', '⑤'],
    answer: 4,
    explain: 'that절의 동사가 필요하므로 being → was 로 고쳐야 한다.',
  },
  {
    id: 'gr2', type: 'grammar', grade: [2, 3], level: 3,
    stem: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?',
    passage: `Most people assume that the colors we see are properties of objects themselves. In fact, color is something ①<u>that</u> the brain constructs. An apple appears red because its surface absorbs most wavelengths of light and ②<u>reflects</u> those we interpret as red. The same apple, ③<u>viewing</u> under a blue lamp, would look almost black. Our brains also adjust colors automatically depending on the surrounding light, ④<u>which</u> is why a white shirt looks white both in sunlight and under a yellow bulb. Color, then, is less a fact about the world than ⑤<u>a story</u> our brains tell about it.`,
    choices: ['①', '②', '③', '④', '⑤'],
    answer: 2,
    explain: '사과가 "보여지는" 것이므로 수동의 과거분사 viewed 가 와야 한다.',
  },

  /* ---------------- 어휘 ---------------- */
  {
    id: 'v1', type: 'vocab', grade: [2, 3], level: 2,
    stem: '다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?',
    passage: `In the early days of the internet, many experts predicted that online access would ①<u>reduce</u> the gap between the rich and the poor by giving everyone equal access to information. To some extent, this has happened: a student in a remote village can now watch lectures from top universities. However, simply having access does not ②<u>guarantee</u> that people can use information effectively. Those with strong reading skills and good teachers tend to benefit far more, which can actually ③<u>widen</u> existing differences. For this reason, many educators argue that digital tools must be ④<u>accompanied</u> by training in how to evaluate and apply information. Without such support, technology may ⑤<u>weaken</u> the very inequality it was meant to solve.`,
    choices: ['①', '②', '③', '④', '⑤'],
    answer: 4,
    explain: '지원이 없으면 기술은 불평등을 "강화(strengthen/deepen)"할 수 있다는 의미가 되어야 한다.',
  },

  /* ---------------- 빈칸 ---------------- */
  {
    id: 'b1', type: 'blank', grade: [1, 2], level: 2,
    stem: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
    passage: `When we try to persuade others, we usually focus on presenting strong facts and logical arguments. But studies of successful negotiators reveal that they spend surprisingly little time talking. Instead, they ask questions and listen carefully, trying to understand what the other side truly wants. Once people feel that their concerns have been heard, they become far more open to new ideas. In other words, the most effective way to change someone's mind often begins with <span class="blank"></span>.`,
    choices: ['offering a reward', 'repeating your argument', 'understanding their view', 'proving them wrong', 'speaking with confidence'],
    answer: 2,
    explain: '상대가 원하는 것을 이해하고 경청하는 것이 설득의 시작이라는 내용이다.',
  },
  {
    id: 'b2', type: 'blank', grade: [2, 3], level: 3,
    stem: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
    passage: `In a famous experiment, two groups of people were asked to rate a set of photographs. One group was told they could keep their favorite picture; the other group was told their choice was final the moment they made it. Later, those whose decisions could not be changed reported much greater satisfaction with their chosen photograph. Those who could still switch kept thinking about the pictures they had not picked and felt less happy. The results suggest that, contrary to common belief, <span class="blank"></span> can sometimes make us more content with what we have.`,
    choices: ['having more options', 'comparing carefully', 'limiting our freedom to reverse a choice', 'asking others for advice', 'delaying a decision'],
    answer: 2,
    explain: '선택을 되돌릴 수 없었던 집단이 더 만족했다는 결과이다.',
  },

  /* ---------------- 무관한 문장 ---------------- */
  {
    id: 'ir1', type: 'irrelevant', grade: [1, 2, 3], level: 2,
    stem: '다음 글에서 전체 흐름과 관계 없는 문장은?',
    passage: `Octopuses are among the most intelligent animals in the ocean. ① They can open jars, escape from closed tanks, and even recognize individual human faces. ② Unlike humans, however, most of their neurons are located not in the brain but in their eight arms. ③ This allows each arm to taste, touch, and make simple decisions on its own. ④ Octopuses are a popular dish in many coastal countries, often served grilled or raw. ⑤ Scientists believe this unusual nervous system helps them respond quickly to complex environments.`,
    choices: ['①', '②', '③', '④', '⑤'],
    answer: 3,
    explain: '문어의 지능과 신경계에 대한 글이므로 요리에 관한 ④는 흐름과 무관하다.',
  },

  /* ---------------- 글의 순서 ---------------- */
  {
    id: 'o1', type: 'order', grade: [1, 2, 3], level: 2,
    stem: '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?',
    passage: `In 1928, Alexander Fleming returned from vacation to find something unusual in his laboratory.<br><br>(A) Curious, he studied the mold further and found that it produced a substance capable of killing many types of harmful bacteria. He named it penicillin.<br>(B) One of the dishes in which he had been growing bacteria had become contaminated with a blue-green mold. Around the mold, there was a clear area where no bacteria were growing.<br>(C) However, it took more than a decade for other scientists to find a way to produce it in large quantities. Only then did it begin to save millions of lives.`,
    choices: ['(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)', '(C) - (B) - (A)'],
    answer: 1,
    explain: '곰팡이 발견(B) → 연구 후 페니실린 명명(A) → 대량 생산까지의 시간(C).',
  },

  /* ---------------- 문장 삽입 ---------------- */
  {
    id: 'in1', type: 'insert', grade: [2, 3], level: 3,
    stem: '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?',
    passage: `<div class="summary-box">This is not because they are naturally more talented, but because they have learned to see their errors differently.</div><br>When learning a new skill, most of us feel frustrated by our mistakes. ( ① ) We see them as signs that we are not good enough. ( ② ) Yet experts in fields from music to chess make mistakes constantly, often more than beginners. ( ③ ) To them, each mistake is a piece of feedback that points to exactly what needs improvement. ( ④ ) By paying close attention to where they went wrong, they turn failure into a precise guide for practice. ( ⑤ ) Beginners, on the other hand, often try to forget their errors as quickly as possible.`,
    choices: ['①', '②', '③', '④', '⑤'],
    answer: 2,
    explain: '전문가들이 실수를 많이 한다는 내용 뒤, 실수를 피드백으로 본다는 내용 앞에 들어가야 한다.',
  },

  /* ---------------- 요약문 ---------------- */
  {
    id: 's1', type: 'summary', grade: [2, 3], level: 3,
    stem: '다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?',
    passage: `Researchers placed identical cookies in two jars: one jar was full, while the other contained only two cookies. Participants were asked to taste a cookie from one of the jars and rate it. Even though the cookies were exactly the same, people consistently rated the cookies from the nearly empty jar as more delicious and more valuable. The researchers concluded that when something appears to be in short supply, we automatically assume it must be more desirable.<div class="summary-box">People tend to judge things as more <b>(A)</b> when they seem <b>(B)</b>.</div>`,
    choices: ['(A) valuable …… (B) scarce', '(A) valuable …… (B) common', '(A) ordinary …… (B) rare', '(A) harmful …… (B) plentiful', '(A) familiar …… (B) limited'],
    answer: 0,
    explain: '부족해 보이면(scarce) 더 가치 있게(valuable) 판단한다.',
  },
];
