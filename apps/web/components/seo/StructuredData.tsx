import { getNonce } from '@/lib/security/nonce';
import { safeStringifyJSON } from '@/lib/utils/safe-json';

interface StructuredDataProps {
  data: Record<string, any> | null | undefined;
}

export async function StructuredData({ data }: StructuredDataProps) {
  // Get nonce from request headers (server component)
  const nonce = await getNonce();

  // Skip rendering if data is null/undefined
  if (!data) {
    return null;
  }

  // Safely stringify JSON with fallback
  const jsonString = safeStringifyJSON(data, '{}', 'StructuredData');

  return (
    <script
      type="application/ld+json"
      nonce={nonce || undefined}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

