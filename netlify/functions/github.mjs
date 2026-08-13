/* =============================================================================
   GitHub прокси — Netlify Function
   Токен зөвхөн энд, серверийн талд байна. Хөтөч рүү хэзээ ч илгээгддэггүй.

   Netlify → Site configuration → Environment variables дээр дараахыг тохируулна:
     GITHUB_TOKEN     fine-grained PAT, Contents: Read and write
     GITHUB_OWNER     GitHub хэрэглэгчийн нэр
     GITHUB_REPO      repo нэр
     GITHUB_BRANCH    (заавал биш, анхдагч: main)
     ADMIN_PASSWORD   админ хуудсанд нэвтрэх нууц үг
   ============================================================================= */

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });

/* Хугацааны зөрүүгээр нууц үг таахаас сэргийлсэн харьцуулалт */
function samePassword(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Зөвхөн repo дотор бичихийг зөвшөөрнө */
function safePath(p) {
  return typeof p === "string" &&
         p.length > 0 && p.length < 300 &&
         !p.startsWith("/") &&
         !p.includes("..") &&
         /^[A-Za-z0-9._\-\/]+$/.test(p);
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST л зөвшөөрнө" });

  const TOKEN  = process.env.GITHUB_TOKEN;
  const OWNER  = process.env.GITHUB_OWNER;
  const REPO   = process.env.GITHUB_REPO;
  const BRANCH = process.env.GITHUB_BRANCH || "main";
  const PASS   = process.env.ADMIN_PASSWORD;

  if (!TOKEN || !OWNER || !REPO || !PASS) {
    return json(500, { error: "Netlify environment variables дутуу байна." });
  }

  let body;
  try { body = await req.json(); }
  catch { return json(400, { error: "Хүсэлтийн бүтэц буруу." }); }

  if (!samePassword(body.password || "", PASS)) {
    return json(401, { error: "Нууц үг буруу." });
  }

  const api = (path) => "https://api.github.com/repos/" + OWNER + "/" + REPO + path;
  const headers = {
    "Authorization": "Bearer " + TOKEN,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-admin"
  };

  try {
    /* --- нэвтрэлт шалгах ------------------------------------------------- */
    if (body.action === "auth") {
      return json(200, { ok: true, owner: OWNER, repo: REPO, branch: BRANCH });
    }

    /* --- файл унших ------------------------------------------------------ */
    if (body.action === "get") {
      if (!safePath(body.path)) return json(400, { error: "Замын нэр буруу." });

      const res = await fetch(
        api("/contents/" + encodeURI(body.path) + "?ref=" + encodeURIComponent(BRANCH)),
        { headers }
      );
      if (res.status === 404) return json(200, { found: false });
      if (!res.ok) return json(res.status, { error: "GitHub: " + (await res.text()) });

      const data = await res.json();
      return json(200, { found: true, content: data.content, sha: data.sha });
    }

    /* --- файл бичих ------------------------------------------------------ */
    if (body.action === "put") {
      if (!safePath(body.path)) return json(400, { error: "Замын нэр буруу." });
      if (typeof body.content !== "string" || !body.content) {
        return json(400, { error: "Агуулга хоосон байна." });
      }

      const payload = {
        message: body.message || "Админаас шинэчлэв",
        content: body.content,
        branch: BRANCH
      };
      if (body.sha) payload.sha = body.sha;

      const res = await fetch(api("/contents/" + encodeURI(body.path)), {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, headers),
        body: JSON.stringify(payload)
      });
      if (!res.ok) return json(res.status, { error: "GitHub: " + (await res.text()) });

      const data = await res.json();
      return json(200, { ok: true, path: body.path, sha: data.content && data.content.sha });
    }

    return json(400, { error: "Танигдахгүй үйлдэл." });
  } catch (e) {
    return json(500, { error: "Сервер алдаа: " + e.message });
  }
};

export const config = { path: "/api/github" };
