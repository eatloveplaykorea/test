// /files/... 주소로 R2의 PDF(와 한능검 옛 정답표 같은 HWP)를 내려준다.
// R2 버킷 westudy-files 에는 공개로 정한 파일만 올린다(업데이트.bat 이 index.csv 의 공개여부=공개 만 업로드).
// 그래서 버킷에 있는 PDF가 곧 공개 대상이다. 큰 허용 목록을 코드에 넣지 않아 파일이 수만 개여도 가볍다.

const PREFIX = "/files/";
const CACHE_CONTROL = "public, max-age=86400";

function text(status, message, extra = {}) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

// 주소를 조각별로 해석한다. 상위 폴더 이동이나 숨은 구분자가 있으면 null.
export function keyFromPathname(pathname) {
  if (!pathname.startsWith(PREFIX)) return null;
  const parts = pathname.slice(PREFIX.length).split("/");
  const decoded = [];
  for (const part of parts) {
    let value;
    try {
      value = decodeURIComponent(part);
    } catch {
      return null;
    }
    if (!value || value === "." || value === "..") return null;
    if (/[\/\\\u0000-\u001f\u007f]/.test(value)) return null;
    decoded.push(value);
  }
  const key = decoded.join("/").normalize("NFC");
  return TYPES[extOf(key)] ? key : null;
}

// PDF는 화면에서 열고, 한글(HWP) 파일은 내려받게 한다
const TYPES = {
  pdf: { type: "application/pdf", inline: true },
  hwp: { type: "application/x-hwp", inline: false },
};
const extOf = (key) => (key.split(".").pop() || "").toLowerCase();

function contentDisposition(key, download) {
  const name = key.split("/").pop();
  const fallback = name.replace(/[^\x20-\x7e]|["\\;]/g, "_");
  const encoded = encodeURIComponent(name).replace(
    /['()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  return `${download ? "attachment" : "inline"}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return text(405, "허용되지 않는 요청입니다.", { Allow: "GET, HEAD" });
  }
  const url = new URL(request.url);
  const key = keyFromPathname(url.pathname);
  if (!key) return text(404, "파일을 찾을 수 없습니다.");
  if (!env.FILES) return text(503, "파일 저장소가 연결되지 않았습니다.");

  const t = TYPES[extOf(key)];
  const headers = new Headers({
    "Content-Type": t.type,
    "Content-Disposition": contentDisposition(key, !t.inline || url.searchParams.get("download") === "1"),
    "Cache-Control": CACHE_CONTROL,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Robots-Tag": "noindex",
  });

  if (request.method === "HEAD") {
    const head = await env.FILES.head(key);
    if (!head) return text(404, "파일을 찾을 수 없습니다.");
    headers.set("ETag", head.httpEtag);
    headers.set("Content-Length", String(head.size));
    return new Response(null, { status: 200, headers });
  }

  // If-Range 가 있으면 범위 요청을 무시하고 전체를 준다(안전한 단순화).
  const wantsRange = request.headers.has("Range") && !request.headers.has("If-Range");
  let object;
  try {
    object = await env.FILES.get(key, {
      onlyIf: request.headers,
      range: wantsRange ? request.headers : undefined,
    });
  } catch {
    const head = await env.FILES.head(key);
    if (!head) return text(404, "파일을 찾을 수 없습니다.");
    headers.set("Content-Range", `bytes */${head.size}`);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Disposition");
    return new Response(null, { status: 416, headers });
  }
  if (!object) return text(404, "파일을 찾을 수 없습니다.");

  headers.set("ETag", object.httpEtag);
  // 조건부 요청이 맞아 본문이 없으면 304
  if (!("body" in object) || !object.body) {
    return new Response(null, { status: 304, headers });
  }
  const r = object.range;
  if (wantsRange && r && ("offset" in r || "suffix" in r)) {
    const start = "suffix" in r ? object.size - r.suffix : r.offset;
    const length = "suffix" in r ? r.suffix : (r.length ?? object.size - start);
    const end = start + length - 1;
    headers.set("Content-Range", `bytes ${start}-${end}/${object.size}`);
    headers.set("Content-Length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { status: 200, headers });
}
