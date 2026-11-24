'use client';
import { useState } from 'react';
import { DOC_LABEL, docHref, docTitle, docUrl, formatSize, type DocGroup } from '@/lib/doc-utils';

interface Props {
  title: string;
  groups: DocGroup[];
}

/** 미리보기 PDF 선택 + 화면. 휴대폰에서는 CSS로 숨기고 위의 버튼으로 연다. 외부 공식 링크는 미리보기에서 뺀다. */
export default function DocViewer({ title, groups }: Props) {
  const own = groups
    .map(g => ({ ...g, docs: g.docs.filter(d => !d.url) }))
    .filter(g => g.docs.length > 0);
  const options = own.flatMap(g => g.docs.map(d => ({
    path: d.path,
    text: d.title ? d.title : [g.label, DOC_LABEL[d.kind].label].filter(Boolean).join(' '),
  })));
  const [current, setCurrent] = useState(options[0]?.path ?? '');
  const selected = options.find(o => o.path === current);
  const grouped = own.some(g => g.docs.some(d => d.title));

  if (options.length === 0) {
    return (
      <div className="viewer has-doc empty-viewer">
        <div className="placeholder">
          <div className="big">🔗</div>
          <p><b>문제지는 대학 공식 사이트에서 열려요.</b></p>
          <p>위 버튼을 누르면 대학이 게시한 원본 PDF가 새 창으로 열립니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer has-doc">
      {options.length > 1 && (
        <label className="viewer-pick">
          <span>미리보기</span>
          <select value={current} onChange={e => setCurrent(e.target.value)}>
            {grouped
              ? own.map(g => (
                <optgroup key={g.label} label={g.label || '자료'}>
                  {g.docs.map(d => <option key={d.path} value={d.path}>{docTitle(d)}</option>)}
                </optgroup>
              ))
              : options.map(o => <option key={o.path} value={o.path}>{o.text}</option>)}
          </select>
        </label>
      )}
      {selected && <iframe key={current} src={docUrl(current)} title={`${title} ${selected.text}`} />}
    </div>
  );
}

/** stacked: 묶음 이름을 버튼 위 한 줄에 둔다(논술처럼 이름이 길 때). */
export function DocList({ groups, stacked = false }: { groups: DocGroup[]; stacked?: boolean }) {
  return (
    <div className={`doc-list${stacked ? ' stacked' : ''}`}>
      {groups.map(g => (
        <div key={g.label || 'all'} className="doc-group">
          {g.label && <div className="doc-label">{g.label}</div>}
          <div className="doc-buttons">
            {g.docs.map(d => (
              <a key={d.url ?? d.path} className="file" href={docHref(d)} target="_blank" rel="noopener noreferrer">
                <span className="ic">{DOC_LABEL[d.kind].icon}</span>
                <span>{docTitle(d)}<small>{d.url ? '대학 공식 사이트 ↗' : `PDF · ${formatSize(d.size)}`}</small></span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
