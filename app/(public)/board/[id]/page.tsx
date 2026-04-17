import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Metadata, ResolvingMetadata } from 'next';
import BoardClient from './BoardClient';
import { getSeoSettings } from '@/src/lib/api-server';

const SITE_NAME = "MAI PARTNERS";
const SITE_URL = "https://maiptns.com";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, "board"));
    const ids = querySnapshot.docs.map((doc) => ({ id: doc.id }));
    // _shell은 Firebase Hosting 리라이트 fallback용 페이지
    return [{ id: '_shell' }, ...ids];
  } catch {
    return [{ id: '_shell' }];
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const [docSnap, seo] = await Promise.all([
    getDoc(doc(db, "board", id)),
    getSeoSettings(),
  ]);

  if (!docSnap.exists()) return { title: { absolute: `게시판 | ${SITE_NAME}` }, alternates: { canonical: `${SITE_URL}/board` } };

  const post = docSnap.data();
  const title = `${post.title} - 게시판 | ${SITE_NAME}`;
  const description = `${post.title} | 마이파트너스 소식`;
  const image = post.thumbnail || seo.ogImage;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/board/${encodeURIComponent(id)}` },
    openGraph: {
      title,
      description,
      images: [image],
      url: `${SITE_URL}/board/${encodeURIComponent(id)}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BoardDetailPage({ params }: Props) {
  const { id } = await params;

  let jsonLd: object | null = null;

  try {
    const [docSnap, seo] = await Promise.all([
      getDoc(doc(db, "board", id)),
      getSeoSettings(),
    ]);
    if (docSnap.exists()) {
      const post = docSnap.data();
      const description = `${post.title} | 마이파트너스 소식`;

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description,
        image: post.thumbnail || seo.ogImage,
        url: `${SITE_URL}/board/${id}`,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      };
    }
  } catch {
    // 빌드 시 Firestore 접근 실패 시 클라이언트 렌더링으로 fallback
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BoardClient />
    </>
  );
}
