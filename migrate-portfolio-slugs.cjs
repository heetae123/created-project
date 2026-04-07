/**
 * 포트폴리오 슬러그 마이그레이션 스크립트
 * 기존 숫자 ID → 한글/영문 키워드 기반 슬러그 ID로 변환
 *
 * 실행: node migrate-portfolio-slugs.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 서비스 계정 키 파일 경로 (인자로 전달하거나 환경변수로 설정)
const keyArg = process.argv.find(a => a.startsWith('--key='));
const keyPath = keyArg
  ? keyArg.replace('--key=', '')
  : process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!keyPath || !fs.existsSync(keyPath)) {
  console.error('❌ 서비스 계정 키 파일이 필요합니다.\n');
  console.error('방법:');
  console.error('  1. Firebase Console → 프로젝트 설정 → 서비스 계정 탭');
  console.error('  2. "새 비공개 키 생성" 클릭 → JSON 파일 다운로드');
  console.error('  3. 아래 명령어로 실행:\n');
  console.error('     node migrate-portfolio-slugs.cjs --key=C:\\경로\\serviceAccount.json\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mai-entertainment',
});
const db = admin.firestore(app);

// ── 슬러그 생성 ────────────────────────────────────────────
function generateSlug(title) {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// 숫자로만 이루어진 ID인지 확인
function isNumericId(id) {
  return /^\d+$/.test(id);
}

// ── 메인 마이그레이션 ──────────────────────────────────────
async function migratePortfolioSlugs() {
  console.log('🚀 포트폴리오 슬러그 마이그레이션 시작...\n');

  const snapshot = await db.collection('portfolio').get();
  const items = [];
  snapshot.forEach(doc => items.push({ docId: doc.id, data: doc.data() }));

  console.log(`📦 총 ${items.length}개 항목 발견\n`);

  // 슬러그만 변환이 필요한 항목 필터링 (숫자 ID인 것만)
  const toMigrate = items.filter(item => isNumericId(item.docId));
  const alreadySlug = items.filter(item => !isNumericId(item.docId));

  console.log(`✅ 이미 슬러그: ${alreadySlug.length}개`);
  console.log(`🔄 변환 필요: ${toMigrate.length}개\n`);

  if (toMigrate.length === 0) {
    console.log('✨ 모든 항목이 이미 슬러그 형식입니다.');
    process.exit(0);
  }

  // 기존 슬러그 목록 (충돌 방지)
  const existingSlugs = new Set(items.map(i => i.docId));

  let successCount = 0;
  let failCount = 0;

  for (const item of toMigrate) {
    const { docId, data } = item;
    const title = data.title || '';

    if (!title) {
      console.log(`⚠️  ID ${docId}: 제목 없음 → 건너뜀`);
      failCount++;
      continue;
    }

    // 슬러그 생성 (충돌 시 숫자 suffix 추가)
    let baseSlug = generateSlug(title);
    if (!baseSlug) baseSlug = `portfolio-${docId}`;

    let newSlug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(newSlug)) {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(newSlug);

    try {
      // 1. 새 슬러그 문서 생성
      await db.collection('portfolio').doc(newSlug).set({
        ...data,
        id: newSlug,
        oldId: docId,
      });

      // 2. 기존 숫자 문서 삭제
      await db.collection('portfolio').doc(docId).delete();

      console.log(`✅ ${docId.padEnd(6)} → ${newSlug}  (${title})`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${docId} 마이그레이션 실패:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 완료: 성공 ${successCount}개 / 실패 ${failCount}개`);
  console.log('\n변환된 URL 예시:');
  console.log('  이전: https://maiptns.com/portfolio/24');
  console.log('  이후: https://maiptns.com/portfolio/kfc-korea-convention-2026\n');
  process.exit(0);
}

migratePortfolioSlugs().catch(err => {
  console.error('마이그레이션 오류:', err);
  process.exit(1);
});
