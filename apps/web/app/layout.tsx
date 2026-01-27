/**
 * Root Layout
 * 
 * Next.js requires root layout to have <html> and <body> tags.
 * With next-intl middleware and localePrefix: "as-needed",
 * the middleware handles routing automatically.
 * The [locale]/layout.tsx provides the actual content structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next.js requires root layout to have <html> and <body>
  // The [locale]/layout.tsx will provide the actual HTML structure
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Performance: Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load fonts asynchronously (non-blocking) - display=swap ensures text is visible during font load */}
        {/* Note: This script uses hash-based CSP (sha256-qQkJVfk6J5BW+yPPN0N8zNfBqw4NLyb8RtnR7gQ62yg=) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var link = document.createElement('link');
                link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap';
                link.rel = 'stylesheet';
                link.media = 'all';
                document.head.appendChild(link);
              })();
            `,
          }}
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </noscript>
        {/* Preconnect to Cloudinary for image optimization */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/* DNS prefetch for other critical domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* CRITICAL: Force scroll to work - runs before React hydration */}
        {/* Simplified: Only runs once on load, React component handles ongoing monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function forceScroll() {
                  var html = document.documentElement;
                  var body = document.body;
                  
                  if (!html || !body) return;
                  
                  // Force enable scroll with inline styles
                  html.style.setProperty('overflow', 'visible', 'important');
                  html.style.setProperty('overflow-x', 'hidden', 'important');
                  html.style.setProperty('overflow-y', 'scroll', 'important');
                  html.style.setProperty('height', 'auto', 'important');
                  html.style.setProperty('max-height', 'none', 'important');
                  html.style.setProperty('position', 'static', 'important');
                  
                  body.style.setProperty('overflow', 'visible', 'important');
                  body.style.setProperty('overflow-x', 'hidden', 'important');
                  body.style.setProperty('overflow-y', 'visible', 'important');
                  body.style.setProperty('height', 'auto', 'important');
                  body.style.setProperty('max-height', 'none', 'important');
                  body.style.setProperty('position', 'static', 'important');
                  
                  // Remove scroll lock classes
                  html.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
                  body.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
                  
                  // Remove data attributes
                  html.removeAttribute('data-scroll-locked');
                  body.removeAttribute('data-scroll-locked');
                  
                  // Remove Radix UI scroll locks
                  var radixLocks = document.querySelectorAll('[data-radix-scroll-lock]');
                  radixLocks.forEach(function(el) { el.remove(); });
                }
                
                // Run immediately and once more after a short delay
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', forceScroll);
                } else {
                  forceScroll();
                }
                
                // Run once more after 100ms to catch late-loading components
                setTimeout(forceScroll, 100);
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}

