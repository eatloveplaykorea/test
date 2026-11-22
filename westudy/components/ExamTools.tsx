'use client';
import { useEffect, useRef, useState } from 'react';
import type { Subject } from '@/lib/exams';
import { readStore, writeStore, toggleSaved, isSaved } from '@/lib/store';

interface Props {
  examKey: string;
  title: string;
  subject: Subject;
  answers?: number[];
  demo?: boolean;
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export default function ExamTools({ examKey, title, subject, answers, demo }: Props) {
  const total = subject.minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [marks, setMarks] = useState<(number | null)[]>(() => Array(subject.questions).fill(null));
  const [graded, setGraded] = useState(false);
  const [saved, setSaved] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // 저장된 답안·즐겨찾기 불러오기
  useEffect(() => {
    const m = readStore<(number | null)[]>(`omr:${examKey}`);
    if (m && m.length === subject.questions) setMarks(m);
    setSaved(isSaved(examKey));
  }, [examKey, subject.questions]);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setLeft(l => {
      if (l <= 1) { setRunning(false); return 0; }
      return l - 1;
    }), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running]);

  const setMark = (i: number, v: number | null) => {
    if (graded) return;
    setMarks(prev => {
      const next = [...prev];
      next[i] = next[i] === v ? null : v;
      writeStore(`omr:${examKey}`, next);
      return next;
    });
  };

  const reset = () => {
    setMarks(Array(subject.questions).fill(null));
    writeStore(`omr:${examKey}`, null);
    setGraded(false);
  };

  const done = marks.filter(m => m !== null).length;
  const right = answers ? marks.filter((m, i) => m !== null && m === answers[i]).length : 0;

  return (
    <aside>
      <div className="panel">
        <h3>
          실전모드 <small>{subject.name} {subject.minutes}분</small>
          <button
            className="star"
            aria-label={saved ? '저장 취소' : '저장'}
            title={saved ? '저장 취소' : '이 시험 저장'}
            onClick={() => setSaved(toggleSaved({ key: examKey, title, href: location.pathname }))}
          >{saved ? '★' : '☆'}</button>
        </h3>
        <div className={`timer${left <= 300 && left > 0 ? ' low' : ''}`}>{left === 0 ? '시험 종료' : fmt(left)}</div>
        <div className="progress"><div style={{ width: `${(1 - left / total) * 100}%` }} /></div>
        <div className="row">
          <button className="btn primary" onClick={() => setRunning(r => !r)} disabled={left === 0}>
            {running ? '일시정지' : left === total ? '시작' : '계속'}
          </button>
          <button className="btn" onClick={() => { setRunning(false); setLeft(total); }}>처음부터</button>
        </div>
      </div>

      <div className="panel">
        <h3>OMR 답안 <small>{done}/{subject.questions} 표기</small></h3>
        {demo && <div className="notice">데모 정답이에요. 실제 정답이 아니니 화면 확인용으로만 써 주세요.</div>}
        {graded && answers && (
          <div className="score">
            <b>{right}</b> / {subject.questions} 문항 정답
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>표기 {done}문항 · 틀리거나 비운 문항은 빨간색이에요</div>
          </div>
        )}
        <div className="omr">
          {marks.map((m, i) => {
            const isShort = !!subject.short?.includes(i + 1);
            const state = graded && answers ? (m === answers[i] ? ' right' : ' wrong') : '';
            return (
              <div key={i} className={`omr-row${state}`}>
                <span className="no">{i + 1}</span>
                {isShort ? (
                  <input
                    inputMode="numeric"
                    aria-label={`${i + 1}번 답`}
                    value={m ?? ''}
                    disabled={graded}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setMarks(prev => {
                        const next = [...prev];
                        next[i] = v === '' ? null : Number(v);
                        writeStore(`omr:${examKey}`, next);
                        return next;
                      });
                    }}
                  />
                ) : (
                  Array.from({ length: subject.choices }, (_, c) => (
                    <button
                      key={c}
                      className={m === c + 1 ? 'on' : ''}
                      aria-label={`${i + 1}번 ${c + 1}`}
                      aria-pressed={m === c + 1}
                      onClick={() => setMark(i, c + 1)}
                    >{c + 1}</button>
                  ))
                )}
                {graded && answers && m !== answers[i] && <span className="mark">정답 {answers[i]}</span>}
              </div>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {answers ? (
            graded
              ? <button className="btn" onClick={() => setGraded(false)}>다시 고치기</button>
              : <button className="btn primary" onClick={() => { setGraded(true); setRunning(false); }}>채점하기</button>
          ) : (
            <button className="btn" disabled title="정답이 올라오면 채점할 수 있어요">정답 준비 중</button>
          )}
          <button className="btn" onClick={reset}>지우기</button>
        </div>
      </div>
    </aside>
  );
}
