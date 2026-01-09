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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

