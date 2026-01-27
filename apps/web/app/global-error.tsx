'use client';

/**
 * Root-level error boundary. Catches unhandled errors that escape the tree.
 * Must define its own <html> and <body> (Next.js requirement).
 * In development, shows error.message to help diagnose "Internal Server Error".
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';
  const msg = error?.message ?? 'Unknown error';
  const stack = error?.stack ?? '';

  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bir Hata Oluştu</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
        </p>
        {isDev && (
          <details style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '6px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Hata detayı (sadece development)</summary>
            <pre style={{ marginTop: '0.5rem', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg}
            </pre>
            {stack ? (
              <pre style={{ marginTop: '0.5rem', fontSize: '11px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#555' }}>
                {stack}
              </pre>
            ) : null}
            {error?.digest ? <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#888' }}>Digest: {error.digest}</p> : null}
          </details>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reset}
            style={{ padding: '0.5rem 1rem', background: '#006AFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            style={{ padding: '0.5rem 1rem', background: '#eee', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </body>
    </html>
  );
}
