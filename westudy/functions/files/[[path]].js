// /files/... 주소로 R2의 공개 허용 PDF만 내려준다.
// 허용 목록(lib/public-files.json)에 정확히 있는 경로만 R2에 요청한다.
import publicFiles from "../../lib/public-files.json";

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
  return decoded.join("/").normalize("NFC");
}

// bytes=시작-끝 한 구간만 지원한다. 형식이 다르면 전체 파일을 보낸다.
export function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (suffix === 0) return "invalid";
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (start >= size || start > end) return "invalid";
  return { offset: start, length: end - start + 1, start, end };
}

function contentDisposition(key, download) {
  const name = key.split("/").pop();
  const fallback = name.replace(/[^\x20-\x7e]|["\\;]/g, "_");
  const encoded = encodeURIComponent(name).replace(
    /['()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  return `${download ? "attachment" : "inline"}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function etagMatches(header, etag) {
  if (!header) return false;
  return header
    .split(",")
    .map((v) => v.trim().replace(/^W\//, ""))
    .some((v) => v === "*" || v === etag);
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return text(405, "허용되지 않는 요청입니다.", { Allow: "GET, HEAD" });
  }

  const url = new URL(request.url);
  const key = keyFromPathname(url.pathname);
  const info = key && Object.hasOwn(publicFiles, key) ? publicFiles[key] : null;
  if (!info) return text(404, "파일을 찾을 수 없습니다.");

  const etag = `"${info.md5}"`;
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": contentDisposition(key, url.searchParams.get("download") === "1"),
    "Cache-Control": CACHE_CONTROL,
    ETag: etag,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Robots-Tag": "noindex",
  });

  if (etagMatches(request.headers.get("If-None-Match"), etag)) {
    return new Response(null, { status: 304, headers });
  }

  const ifRange = request.headers.get("If-Range");
  const rangeHeader = !ifRange || ifRange === etag ? request.headers.get("Range") : null;
  const range = parseRange(rangeHeader, info.size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${info.size}`);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Disposition");
    return new Response(null, { status: 416, headers });
  }

  const status = range ? 206 : 200;
  headers.set("Content-Length", String(range ? range.length : info.size));
  if (range) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);

  // HEAD는 허용 목록 정보로 답해서 R2 읽기 요청을 쓰지 않는다.
  if (request.method === "HEAD") return new Response(null, { status, headers });

  if (!env.FILES) return text(503, "파일 저장소가 연결되지 않았습니다.");
  const object = await env.FILES.get(
    key,
    range ? { range: { offset: range.offset, length: range.length } } : undefined,
  );
  if (!object) return text(404, "파일을 찾을 수 없습니다.");
  return new Response(object.body, { status, headers });
}
