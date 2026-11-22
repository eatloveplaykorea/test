import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/exams';
import './globals.css';

export const metadata: Metadata = {
  title: 'we.study.today — 기출문제 한곳에',
  description: '수능, 고1·고2·고3 모의고사, 편입, 공무원 기출문제를 연도·과목별로 바로 찾아보세요.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="wrap">
            <Link href="/" className="logo">we.study<span>.today</span></Link>
            <nav>
              {CATEGORIES.map(c => <Link key={c.id} href={`/exams/${c.id}/`}>{c.short}</Link>)}
              <Link href="/saved/">☆ 저장</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer>
          <div className="wrap">
            <p>we.study.today · 기출문제 모음</p>
            <p>수능·모의평가 저작권은 한국교육과정평가원, 학력평가 저작권은 각 시·도교육청에 있습니다. 출처를 밝히고 비영리로 제공합니다.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
