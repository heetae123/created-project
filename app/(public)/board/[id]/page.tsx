import { Metadata } from 'next';
import BoardClient from './BoardClient';
import {
  getBoardPostServer,
  getBoardPostsServer,
  getSeoSettings,
  plainTextFromHtml,
  type BoardPublicPost,
} from '@/src/lib/api-server';

const SITE_NAME = "MAI PARTNERS";
const SITE_URL = "https://maiptns.com";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await getBoardPostsServer();
    return posts.map((post) => ({ id: String(post.id) }));
  } catch {
    return [];
  }
}

function getDescription(post: BoardPublicPost): string {
  const blockText = post.blocks
    ?.filter((block) => block.type === 'text')
    .map((block) => block.type === 'text' ? plainTextFromHtml(block.html || '') : '')
    .join(' ');
  return (plainTextFromHtml(blockText || post.content || '') || `${post.title} | 마이파트너스 소식`).slice(0, 155);
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { id } = await params;
  const [post, seo] = await Promise.all([
    getBoardPostServer(id),
    getSeoSettings(),
  ]);

  if (!post) return { title: { absolute: `게시판 | ${SITE_NAME}` }, alternates: { canonical: `${SITE_URL}/board` } };

  const title = `${post.title} - 게시판 | ${SITE_NAME}`;
  const description = getDescription(post);
  const image = post.thumbnail || seo.ogImage;
  const canonical = `${SITE_URL}/board/${encodeURIComponent(String(post.id))}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: [image],
      url: canonical,
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
  const [post, seo] = await Promise.all([
    getBoardPostServer(id).catch(() => null),
    getSeoSettings(),
  ]);
  const canonical = post ? `${SITE_URL}/board/${encodeURIComponent(String(post.id))}` : `${SITE_URL}/board`;
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: getDescription(post),
    image: post.thumbnail || seo.ogImage,
    url: canonical,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BoardClient id={String(post?.id || id)} initialPost={post} />
    </>
  );
}
