'use client';

import { useEffect } from 'react';

/**
 * ArticleImageFallback
 *
 * Handles broken images inside article content without using inline event handlers
 * (which violate CSP). Finds all <img> tags that have [data-fallback-src] and
 * attaches JavaScript error listeners via React's useEffect.
 */
export function ArticleImageFallback() {
    useEffect(() => {
        const container = document.getElementById('article-content');
        if (!container) return;

        const imgs = container.querySelectorAll<HTMLImageElement>('img[data-fallback-src]');

        imgs.forEach((img) => {
            const fallback = img.getAttribute('data-fallback-src') || '/images/placeholder-article.jpg';

            const handleError = () => {
                if (img.src !== fallback) {
                    img.src = fallback;
                    img.alt = img.alt || 'Görsel yüklenemedi';
                }
            };

            // If already broken (cached broken)
            if (img.complete && img.naturalWidth === 0) {
                handleError();
            } else {
                img.addEventListener('error', handleError, { once: true });
            }
        });
    }, []);

    return null;
}
