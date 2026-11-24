'use client';
import { useEffect, useState } from 'react';
import { isSaved, toggleSaved } from '@/lib/store';

/** 시험 저장(☆/★). 로그인 없이 브라우저에 저장하고 /saved 에서 모아 본다. */
export default function SaveButton({ examKey, title }: { examKey: string; title: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(isSaved(examKey)), [examKey]);
  return (
    <button
      className="star"
      aria-label={saved ? '저장 취소' : '저장'}
      title={saved ? '저장 취소' : '이 시험 저장'}
      onClick={() => setSaved(toggleSaved({ key: examKey, title, href: location.pathname }))}
    >{saved ? '★' : '☆'}</button>
  );
}
