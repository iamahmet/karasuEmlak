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
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

