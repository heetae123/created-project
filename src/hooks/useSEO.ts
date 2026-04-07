import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SITE_NAME = 'MAI PARTNERS';
const SITE_URL = 'https://maiptns.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOOptions {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO(options: SEOOptions) {
  const pathname = usePathname();
  const canonicalUrl = `${SITE_URL}${pathname ?? ''}`;

  useEffect(() => {
    const prevTitle = document.title;

    // Title
    document.title = options.title.includes(SITE_NAME)
      ? options.title
      : `${options.title} | ${SITE_NAME}`;

    // Basic meta
    if (options.description) {
      setMetaTag('name', 'description', options.description);
    }
    if (options.keywords) {
      setMetaTag('name', 'keywords', options.keywords);
    }

    // Robots
    if (options.noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Canonical
    setLinkTag('canonical', canonicalUrl);

    // Open Graph
    const ogTitle = options.ogTitle || options.title;
    const ogDesc = options.ogDescription || options.description || '';
    const ogImage = options.ogImage || DEFAULT_OG_IMAGE;
    const ogType = options.ogType || 'website';

    setMetaTag('property', 'og:title', ogTitle.includes(SITE_NAME) ? ogTitle : `${ogTitle} | ${SITE_NAME}`);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    // Twitter Card
    setMetaTag('name', 'twitter:title', ogTitle.includes(SITE_NAME) ? ogTitle : `${ogTitle} | ${SITE_NAME}`);
    setMetaTag('name', 'twitter:description', ogDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    return () => {
      document.title = prevTitle;
    };
  }, [options.title, options.description, options.keywords, options.ogTitle, options.ogDescription, options.ogImage, options.ogType, options.noindex, canonicalUrl]);
}
