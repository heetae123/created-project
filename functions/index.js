const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require("express");
const nodemailer = require("nodemailer");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const path = require("path");

admin.initializeApp();
const db = admin.firestore();

const cors = require("cors");

// =========================================================
// GitHub Auto-Deploy 설정
// TODO: 아래 두 값을 본인 GitHub 정보로 수정하세요
// =========================================================
const GITHUB_OWNER = "heetae123";
const GITHUB_REPO  = "created-project";
const GITHUB_TOKEN = defineSecret("GITHUB_TOKEN");

async function triggerGithubDeploy(token) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/deploy.yml/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "MAI-Firebase-Functions",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  // 204 No Content = 성공
  if (!res.ok && res.status !== 204) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: store temp files in /tmp (Cloud Functions writable dir)
const upload = multer({ dest: os.tmpdir() });

// =========================================================
// HTML escape helper (prevent XSS in email templates)
// =========================================================
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =========================================================
// Firestore helpers
// =========================================================
async function getSetting(key) {
  const doc = await db.collection("settings").doc(key).get();
  return doc.exists ? doc.data().value : null;
}

async function setSetting(key, value) {
  await db.collection("settings").doc(key).set({ value });
}

// =========================================================
// Express API (settings, board)
// =========================================================
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// Settings API
app.get("/api/settings", async (req, res) => {
  try {
    const snapshot = await db.collection("settings").get();
    const settings = {};
    snapshot.forEach((doc) => { settings[doc.id] = doc.data().value; });
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/settings/:key", async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    res.json(value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/settings/:key", async (req, res) => {
  try {
    await setSetting(req.params.key, req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================================================
// Cloudinary Upload
// =========================================================
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "파일이 없습니다." });

    const folder = req.body.folder || "mai-inquiries";
    const resourceType = req.body.resourceType ||
      (req.file.originalname.toLowerCase().endsWith(".pdf") ? "raw" : "image");

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: resourceType,
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "업로드 실패" });
  }
});

// =========================================================
// Cloudinary Delete
// =========================================================
app.post("/api/delete-image", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL이 필요합니다." });
    }

    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    if (!match) {
      return res.status(400).json({ error: "유효하지 않은 Cloudinary URL입니다." });
    }

    const publicId = match[1];
    const resourceType = url.includes("/raw/upload/") ? "raw" : "image";

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "삭제 실패" });
  }
});

// Board API
app.get("/api/board", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const snapshot = await db.collection("board").orderBy("id", "desc").get();
    let posts = [];
    snapshot.forEach((doc) => posts.push(doc.data()));

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter((p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.author || "").toLowerCase().includes(q)
      );
    }

    const total = posts.length;
    const totalPages = Math.max(1, Math.ceil(total / Number(limit)));
    const start = (Number(page) - 1) * Number(limit);
    const items = posts.slice(start, start + Number(limit));

    res.json({ items, total, page: Number(page), totalPages });
  } catch (e) {
    res.json({ items: [], total: 0, page: 1, totalPages: 1 });
  }
});

app.get("/api/board/:id", async (req, res) => {
  try {
    const doc = await db.collection("board").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });

    const post = doc.data();
    post.views = (post.views || 0) + 1;
    await db.collection("board").doc(req.params.id).update({ views: post.views });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/board", async (req, res) => {
  try {
    const { title, author, content, isNotice = false, password, thumbnail } = req.body;
    if (!title || !author || !content) {
      return res.status(400).json({ error: "필수 항목을 입력해주세요." });
    }

    const id = Date.now();
    const newPost = {
      id,
      title, author, content, isNotice, password: password || "", thumbnail: thumbnail || "",
      views: 0,
      date: (() => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; })(),
      createdAt: new Date().toISOString(),
    };
    await db.collection("board").doc(String(id)).set(newPost);
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/board/:id", async (req, res) => {
  try {
    const docRef = db.collection("board").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });

    const existing = doc.data();
    const { title, content, isNotice, thumbnail, password } = req.body;
    if (existing.password && password !== undefined && password !== "" && existing.password !== password) {
      return res.status(403).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (isNotice !== undefined) updates.isNotice = isNotice;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    await docRef.update(updates);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/board/:id", async (req, res) => {
  try {
    const docRef = db.collection("board").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });

    const existing = doc.data();
    const { password } = req.body || {};
    if (existing.password && password !== undefined && password !== "" && existing.password !== password) {
      return res.status(403).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    await docRef.delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export Express app as Cloud Function
// Public invoker: allow unauthenticated access from Firebase Hosting
exports.api = onRequest({ region: "asia-northeast3", invoker: "public" }, app);

// =========================================================
// Firestore Trigger: send email when a new inquiry is created
// =========================================================
exports.onInquiryCreated = onDocumentCreated(
  { document: "inquiries/{docId}", region: "asia-northeast3" },
  async (event) => {
    const data = event.data.data();
    if (!data) return;

    // Check if email notifications are enabled
    const emailSettings = await getSetting("email");
    if (emailSettings && emailSettings.enableNotification === false) return;

    // Read SMTP credentials from Firestore settings, fall back to env vars
    const smtpUser = (emailSettings && emailSettings.smtpUser) || process.env.SMTP_USER;
    const smtpPass = (emailSettings && emailSettings.smtpAppPassword) || process.env.SMTP_APP_PASSWORD;
    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials not configured, skipping email.");
      return;
    }

    const recipientEmail =
      (emailSettings && emailSettings.notificationEmail) || smtpUser;

    const {
      companyName = "", contactPerson = "", phone = "", email = "",
      eventName = "", eventDate = "", eventTime = "", location = "",
      details = "", attendance = "", budget = "", attachments = [],
    } = data;

    // Build attachment links (validate URLs start with https://)
    const attachmentLinks = Array.isArray(attachments) && attachments.length > 0
      ? attachments
          .filter((url) => typeof url === "string" && url.startsWith("https://"))
          .map((url, i) => `<a href="${esc(url)}" style="color:#A95724;text-decoration:none;font-weight:bold;">[첨부파일 #${i + 1}]</a>`)
          .join(" ") || "없음"
      : "없음";

    const htmlContent = `
      <div style="font-family:'Noto Sans KR',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#111827;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#A95724;margin:0;font-size:24px;">MAI 새 문의 접수</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#6b7280;width:120px;vertical-align:top;">업체명</td><td style="padding:10px 0;font-weight:600">${esc(companyName)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">담당자</td><td style="padding:10px 0;font-weight:600">${esc(contactPerson)} (${esc(phone)})</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">이메일</td><td style="padding:10px 0;font-weight:600">${esc(email)}</td></tr>
            <tr><td colspan="2" style="padding:10px 0;border-top:1px solid #e5e7eb"></td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">행사명</td><td style="padding:10px 0;font-weight:600">${esc(eventName)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">행사 일시</td><td style="padding:10px 0;font-weight:600">${esc(eventDate)} ${esc(eventTime)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">행사 장소</td><td style="padding:10px 0;font-weight:600">${esc(location)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">참석 인원</td><td style="padding:10px 0;font-weight:600">${esc(attendance)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">예산</td><td style="padding:10px 0;font-weight:600">${esc(budget)}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">첨부파일</td><td style="padding:10px 0">${attachmentLinks}</td></tr>
            <tr><td colspan="2" style="padding:10px 0;border-top:1px solid #e5e7eb"></td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">세부 내용</td><td style="padding:10px 0;white-space:pre-wrap">${esc(details)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:#A95724;border-radius:8px;text-align:center;">
            <a href="mailto:${esc(email)}" style="color:white;text-decoration:none;font-weight:600;">고객에게 답장하기</a>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">MAI Event &amp; Entertainment 관리 시스템</p>
      </div>`;

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"MAI 문의 시스템" <${smtpUser}>`,
        to: recipientEmail,
        subject: `[MAI 새 문의] ${esc(companyName)} - ${esc(eventName)}`,
        html: htmlContent,
        replyTo: email,
      });

      console.log(`Email sent for inquiry ${event.params.docId}`);
    } catch (error) {
      console.error("Email send error:", error);
    }
  }
);

// =========================================================
// Firestore Trigger: SEO 설정 변경 시 자동 빌드 트리거
// =========================================================
exports.onSettingsWrite = onDocumentWritten(
  { document: "settings/{docId}", region: "asia-northeast3", secrets: [GITHUB_TOKEN] },
  async (event) => {
    try {
      await triggerGithubDeploy(GITHUB_TOKEN.value());
      console.log("Build triggered: settings/", event.params.docId);
    } catch (e) {
      console.error("Build trigger failed:", e.message);
    }
  }
);

// =========================================================
// Firestore Trigger: 포트폴리오 변경 시 자동 빌드 트리거
// =========================================================
exports.onPortfolioWrite = onDocumentWritten(
  { document: "portfolio/{docId}", region: "asia-northeast3", secrets: [GITHUB_TOKEN] },
  async (event) => {
    try {
      await triggerGithubDeploy(GITHUB_TOKEN.value());
      console.log("Build triggered: portfolio/", event.params.docId);
    } catch (e) {
      console.error("Build trigger failed:", e.message);
    }
  }
);

// =========================================================
// Firestore Trigger: 게시판 변경 시 자동 빌드 트리거
// =========================================================
exports.onBoardWrite = onDocumentWritten(
  { document: "board/{docId}", region: "asia-northeast3", secrets: [GITHUB_TOKEN] },
  async (event) => {
    try {
      await triggerGithubDeploy(GITHUB_TOKEN.value());
      console.log("Build triggered: board/", event.params.docId);
    } catch (e) {
      console.error("Build trigger failed:", e.message);
    }
  }
);

// =========================================================
// Re-export render function (SEO dynamic rendering + sitemap)
// =========================================================
const { render } = require("./render");
exports.render = render;
