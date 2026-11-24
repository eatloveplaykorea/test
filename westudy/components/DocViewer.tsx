'use client';
import { useState } from 'react';
import { DOC_LABEL, docUrl, formatSize, type DocGroup } from '@/lib/docs';

interface Props {
  title: string;
  groups: DocGroup[];
}

/** 미리보기 PDF 선택 + 화면. 휴대폰에서는 CSS로 숨기고 위의 버튼으로 연다. */
export default function DocViewer({ title, groups }: Props) {
  const options = groups.flatMap(g => g.docs.map(d => ({
    path: d.path,
    text: [g.label, DOC_LABEL[d.kind].label].filter(Boolean).join(' '),
  })));
  const [current, setCurrent] = useState(options[0]?.path ?? '');
  const selected = options.find(o => o.path === current);

  return (
    <div className="viewer has-doc">
      {options.length > 1 && (
        <label className="viewer-pick">
          <span>미리보기</span>
          <select value={current} onChange={e => setCurrent(e.target.value)}>
            {options.map(o => <option key={o.path} value={o.path}>{o.text}</option>)}
          </select>
        </label>
      )}
      {selected && <iframe key={current} src={docUrl(current)} title={`${title} ${selected.text}`} />}
    </div>
  );
}

export function DocList({ groups }: { groups: DocGroup[] }) {
  return (
    <div className="doc-list">
      {groups.map(g => (
        <div key={g.label || 'all'} className="doc-group">
          {g.label && <div className="doc-label">{g.label}</div>}
          <div className="doc-buttons">
            {g.docs.map(d => (
              <a key={d.path} className="file" href={docUrl(d.path)} target="_blank" rel="noopener">
                <span className="ic">{DOC_LABEL[d.kind].icon}</span>
                <span>{DOC_LABEL[d.kind].label}<small>PDF · {formatSize(d.size)}</small></span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
