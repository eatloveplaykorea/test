/* 브라우저 저장소 (로그인 없이 쓰는 즐겨찾기·OMR 답안). 막혀 있어도 사이트는 정상 동작합니다. */
const PREFIX = 'westudy:';

export function readStore<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? (JSON.parse(v) as T) : null;
  } catch { return null; }
}

export function writeStore(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* 저장 불가 환경은 무시 */ }
}

export interface SavedItem { key: string; title: string; href: string }

export const getSaved = () => readStore<SavedItem[]>('saved') ?? [];
export const isSaved = (key: string) => getSaved().some(s => s.key === key);

/** 저장/해제를 토글하고 저장 여부를 돌려준다 */
export function toggleSaved(item: SavedItem): boolean {
  const list = getSaved();
  const on = list.some(s => s.key === item.key);
  writeStore('saved', on ? list.filter(s => s.key !== item.key) : [item, ...list]);
  return !on;
}
