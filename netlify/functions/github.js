/* =============================================================================
   GitHub прокси — Netlify Function (хуучин хэлбэр, хаа сайгүй ажиллана)

   Гадаад сан ашиглахгүй, Node-ийн үндсэн https модулиар GitHub руу хандана.

   Netlify → Site configuration → Environment variables:
     GITHUB_TOKEN     fine-grained PAT, Contents: Read and write
     GITHUB_OWNER     GitHub хэрэглэгчийн нэр
     GITHUB_REPO      repo нэр
     GITHUB_BRANCH    (заавал биш, анхдагч: main)
     ADMIN_PASSWORD   админд нэвтрэх нууц үг

   Шалгах: хөтөчөөр /.netlify/functions/github руу орвол төлөв харагдана.
   ============================================================================= */

var https = require("https");

function json(statusCode, data) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(data)
  };
}

/* Хугацааны зөрүүгээр нууц үг таахаас сэргийлсэн харьцуулалт */
function samePassword(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Зөвхөн repo дотор бичихийг зөвшөөрнө */
function safePath(p) {
  return typeof p === "string" &&
         p.length > 0 && p.length < 300 &&
         p.charAt(0) !== "/" &&
         p.indexOf("..") === -1 &&
         /^[A-Za-z0-9._\-\/]+$/.test(p);
}

/* GitHub API руу хүсэлт */
function gh(method, path, token, bodyObj) {
  return new Promise(function (resolve, reject) {
    var payload = bodyObj ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;

    var headers = {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-admin"
    };
    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = payload.length;
    }

    var req = https.request(
      { hostname: "api.github.com", path: path, method: method, headers: headers },
      function (res) {
        var chunks = "";
        res.setEncoding("utf8");
        res.on("data", function (c) { chunks += c; });
        res.on("end", function () { resolve({ status: res.statusCode, body: chunks }); });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

exports.handler = async function (event) {
  var TOKEN  = process.env.GITHUB_TOKEN;
  var OWNER  = process.env.GITHUB_OWNER;
  var REPO   = process.env.GITHUB_REPO;
  var BRANCH = process.env.GITHUB_BRANCH || "main";
  var PASS   = process.env.ADMIN_PASSWORD;

  /* --- хөтөчөөр шалгах горим (нууц мэдээлэл харуулахгүй) ------------------ */
  if (event.httpMethod === "GET") {
    return json(200, {
      ok: true,
      message: "Функц ажиллаж байна.",
      env: {
        GITHUB_TOKEN:   !!TOKEN,
        GITHUB_OWNER:   !!OWNER,
        GITHUB_REPO:    !!REPO,
        GITHUB_BRANCH:  BRANCH,
        ADMIN_PASSWORD: !!PASS
      }
    });
  }

  if (event.httpMethod !== "POST") return json(405, { error: "POST л зөвшөөрнө" });

  if (!TOKEN || !OWNER || !REPO || !PASS) {
    return json(500, { error: "Netlify environment variables дутуу байна." });
  }

  var body;
  try {
    var raw = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : (event.body || "");
    body = JSON.parse(raw);
  } catch (e) {
    return json(400, { error: "Хүсэлтийн бүтэц буруу." });
  }

  if (!samePassword(body.password || "", PASS)) {
    return json(401, { error: "Нууц үг буруу." });
  }

  var base = "/repos/" + OWNER + "/" + REPO;

  try {
    /* --- нэвтрэлт --------------------------------------------------------- */
    if (body.action === "auth") {
      return json(200, { ok: true, owner: OWNER, repo: REPO, branch: BRANCH });
    }

    /* --- файл унших ------------------------------------------------------- */
    if (body.action === "get") {
      if (!safePath(body.path)) return json(400, { error: "Замын нэр буруу." });

      var r = await gh("GET",
        base + "/contents/" + encodeURI(body.path) + "?ref=" + encodeURIComponent(BRANCH),
        TOKEN);

      if (r.status === 404) return json(200, { found: false });
      if (r.status < 200 || r.status >= 300) {
        return json(r.status, { error: "GitHub: " + r.body });
      }

      var d = JSON.parse(r.body);
      return json(200, { found: true, content: d.content, sha: d.sha });
    }

    /* --- файл бичих ------------------------------------------------------- */
    if (body.action === "put") {
      if (!safePath(body.path)) return json(400, { error: "Замын нэр буруу." });
      if (typeof body.content !== "string" || !body.content) {
        return json(400, { error: "Агуулга хоосон байна." });
      }

      var payload = {
        message: body.message || "Админаас шинэчлэв",
        content: body.content,
        branch: BRANCH
      };
      if (body.sha) payload.sha = body.sha;

      var w = await gh("PUT", base + "/contents/" + encodeURI(body.path), TOKEN, payload);

      if (w.status < 200 || w.status >= 300) {
        return json(w.status, { error: "GitHub: " + w.body });
      }
      return json(200, { ok: true, path: body.path });
    }

    return json(400, { error: "Танигдахгүй үйлдэл." });
  } catch (e) {
    return json(500, { error: "Сервер алдаа: " + e.message });
  }
};
