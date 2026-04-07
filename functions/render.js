const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const fs = require("fs");
const path = require("path");

// Initialize admin if not already done
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ── HTML template (loaded once at cold start) ─────────────
let templateHtml = "";
try {
  templateHtml = fs.readFileSync(
    path.join(__dirname, "template", "index.html"),
    "utf8"
  );
} catch (e) {
  console.error("Failed to load index.html template:", e.message);
}

// ── Hardcoded service data (mirrors ServiceDetail.tsx) ────
const serviceData = {
  ceremony: { title: "기념행사", description: "송년회, 창립행사, 신년회, 준공식, 협약식, 워크숍, 시상식 등" },
  promotion: { title: "프로모션", description: "브랜드 인지도를 높이는 창의적인 프로모션" },
  sports: { title: "Sports", description: "기업 체육대회, 단합행사, 팀빌딩, 레크레이션, e-sports 등" },
  vip: { title: "VIP 행사", description: "VIP 골프행사, VIP 의전 등 프리미엄 서비스" },
  international: { title: "국제행사", description: "인센티브 투어, 국제세미나, 포럼 등 글로벌 행사 기획" },
  conference: { title: "컨퍼런스", description: "국내 컨벤션, 세미나, 포럼, 사업설명회, 정기총회 등" },
  contest: { title: "컨테스트", description: "기술 경연대회, 학술제, 경진대회 등" },
  festival: { title: "공연 축제", description: "공연 기획, 콘서트, 지역축제, 관공서 기관 행사 등" },
  design: { title: "디자인", description: "행사 브랜딩, 공간 디자인, 그래픽 제작 등 비주얼 솔루션" },
  system: { title: "시스템 협업", description: "최첨단 음향, 조명, 영상 시스템 구축 및 운영" },
  hr: { title: "인재협업", description: "MC·모델·퍼포머 등 행사에 적합한 전문 인력을 매칭합니다" },
};

const SITE_URL = "https://maiptns.com";
const SITE_NAME = "MAI PARTNERS";
const DEFAULT_DESC = "마이파트너스는 기업 행사, 컨퍼런스, 페스티벌, 프로모션 등 최고의 이벤트를 기획하는 MICE 전문 기업입니다.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

// ── HTML escape (prevent XSS) ─────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Inject meta tags into HTML template ───────────────────
function injectMeta(html, { title, description, image, url, type, jsonLd }) {
  const safeTitle = esc(title);
  const safeDesc = esc(description || DEFAULT_DESC);
  const safeImage = esc(image || DEFAULT_IMAGE);
  const safeUrl = esc(url);
  const ogType = type || "article";

  let result = html;

  // Replace <title>
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Replace meta description
  result = result.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${safeDesc}"`
  );

  // Replace canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${safeUrl}"`
  );

  // Replace OG tags
  result = result.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${safeTitle}"`
  );
  result = result.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${safeDesc}"`
  );
  result = result.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${safeImage}"`
  );
  result = result.replace(
    /<meta property="og:image:secure_url" content="[^"]*"/,
    `<meta property="og:image:secure_url" content="${safeImage}"`
  );
  result = result.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${safeUrl}"`
  );
  result = result.replace(
    /<meta property="og:type" content="[^"]*"/,
    `<meta property="og:type" content="${ogType}"`
  );

  // Replace Twitter Card tags
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${safeTitle}"`
  );
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${safeDesc}"`
  );
  result = result.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${safeImage}"`
  );

  // Inject additional JSON-LD before </head>
  if (jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    result = result.replace("</head>", `${jsonLdScript}\n  </head>`);
  }

  return result;
}

// ── Express app for rendering ─────────────────────────────
const renderApp = express();

// www → non-www redirect
renderApp.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.startsWith('www.')) {
    const newHost = host.replace(/^www\./, '');
    return res.redirect(301, `https://${newHost}${req.originalUrl}`);
  }
  next();
});

// Portfolio detail
renderApp.get("/portfolio/:id", async (req, res) => {
  try {
    const docSnap = await db.collection("portfolio").doc(req.params.id).get();

    // 숫자 ID로 접근 시 → 새 슬러그로 301 리디렉션
    if (!docSnap.exists && /^\d+$/.test(req.params.id)) {
      const redirectSnap = await db.collection("portfolio")
        .where("oldId", "==", req.params.id)
        .limit(1)
        .get();
      if (!redirectSnap.empty) {
        const newSlug = redirectSnap.docs[0].id;
        return res.redirect(301, `${SITE_URL}/portfolio/${newSlug}`);
      }
      return res.status(200).send(templateHtml);
    }

    if (!docSnap.exists) {
      return res.status(200).send(templateHtml);
    }

    const doc = docSnap;

    const item = doc.data();
    const title = `${esc(item.title)} - 포트폴리오 | ${SITE_NAME}`;
    const description = item.client
      ? `${item.title} - ${item.client} | 마이파트너스 이벤트 포트폴리오`
      : `${item.title} | 마이파트너스 이벤트 포트폴리오`;
    const image = item.image || item.thumbnail || DEFAULT_IMAGE;
    const url = `${SITE_URL}/portfolio/${req.params.id}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": item.title,
      "description": description,
      "image": image,
      "url": url,
      "creator": {
        "@type": "Organization",
        "name": SITE_NAME,
      },
    };
    if (item.category) jsonLd.genre = item.category;
    if (item.client) jsonLd.accountablePerson = item.client;

    const html = injectMeta(templateHtml, { title, description, image, url, jsonLd });
    res.set("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch (e) {
    console.error("Portfolio render error:", e);
    res.status(200).send(templateHtml);
  }
});

// Board detail
renderApp.get("/board/:id", async (req, res) => {
  try {
    const doc = await db.collection("board").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(200).send(templateHtml);
    }

    const post = doc.data();
    const title = `${esc(post.title)} - 게시판 | ${SITE_NAME}`;
    const description = `${post.title} | 마이파트너스 소식`;
    const image = post.thumbnail || DEFAULT_IMAGE;
    const url = `${SITE_URL}/board/${req.params.id}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": description,
      "image": image,
      "url": url,
      "datePublished": post.createdAt || post.date,
      "author": {
        "@type": "Person",
        "name": post.author || SITE_NAME,
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE },
      },
    };

    const html = injectMeta(templateHtml, { title, description, image, url, jsonLd });
    res.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch (e) {
    console.error("Board render error:", e);
    res.status(200).send(templateHtml);
  }
});

// Service detail
renderApp.get("/service/:id", (req, res) => {
  const service = serviceData[req.params.id];
  if (!service) {
    return res.status(200).send(templateHtml);
  }

  const title = `${service.title} - 서비스 | ${SITE_NAME}`;
  const description = `${service.description} | 마이파트너스 이벤트 서비스`;
  const url = `${SITE_URL}/service/${req.params.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.description,
    "url": url,
    "provider": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
  };

  const html = injectMeta(templateHtml, { title, description, url, jsonLd });
  res.set("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=600");
  res.status(200).send(html);
});

// ── Dynamic Sitemap ───────────────────────────────────────
renderApp.get("/sitemap.xml", async (req, res) => {
  try {
    // Static routes
    const staticRoutes = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/about", changefreq: "monthly", priority: "0.8" },
      { loc: "/greeting", changefreq: "yearly", priority: "0.6" },
      { loc: "/service", changefreq: "monthly", priority: "0.9" },
      { loc: "/portfolio", changefreq: "weekly", priority: "0.8" },
      { loc: "/team", changefreq: "monthly", priority: "0.7" },
      { loc: "/board", changefreq: "weekly", priority: "0.7" },
      { loc: "/contact", changefreq: "yearly", priority: "0.8" },
    ];

    // Service detail routes (hardcoded slugs)
    const serviceRoutes = Object.keys(serviceData).map((slug) => ({
      loc: `/service/${slug}`,
      changefreq: "monthly",
      priority: "0.7",
    }));

    // Portfolio routes from Firestore
    const portfolioSnap = await db.collection("portfolio").get();
    const portfolioRoutes = [];
    portfolioSnap.forEach((doc) => {
      portfolioRoutes.push({
        loc: `/portfolio/${doc.id}`,
        changefreq: "monthly",
        priority: "0.6",
      });
    });

    // Board routes from Firestore
    const boardSnap = await db.collection("board").get();
    const boardRoutes = [];
    boardSnap.forEach((doc) => {
      boardRoutes.push({
        loc: `/board/${doc.id}`,
        changefreq: "weekly",
        priority: "0.5",
      });
    });

    const allRoutes = [...staticRoutes, ...serviceRoutes, ...portfolioRoutes, ...boardRoutes];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    res.status(200).send(xml);
  } catch (e) {
    console.error("Sitemap generation error:", e);
    res.status(500).send("Error generating sitemap");
  }
});

// Fallback: serve unmodified template for unmatched routes
renderApp.get("*", (req, res) => {
  res.status(200).send(templateHtml);
});

// Export as Cloud Function
exports.render = onRequest(
  { region: "asia-northeast3", invoker: "public" },
  renderApp
);
