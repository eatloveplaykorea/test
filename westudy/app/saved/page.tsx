'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSaved, toggleSaved, type SavedItem } from '@/lib/store';

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  useEffect(() => setItems(getSaved()), []);

  return (
    <>
      <div className="page-head">
        <div className="crumb"><Link href="/">홈</Link> › 저장</div>
        <h1>☆ 저장한 시험</h1>
        <p>로그인 없이 이 기기에만 저장돼요.</p>
      </div>
      <div className="list">
        {items && items.length === 0 && <div className="empty">아직 저장한 시험이 없어요. 시험지 화면의 ☆를 눌러 보세요.</div>}
        {items?.map(it => (
          <Link key={it.key} href={it.href}>
            <span>{it.title}</span>
            <button className="btn sm" onClick={e => {
              e.preventDefault();
              toggleSaved(it);
              setItems(getSaved());
            }}>삭제</button>
          </Link>
        ))}
      </div>
    </>
  );
}
