/**
 * Decode common HTML entities and numeric entities.
 * Handles nested encoding like &amp;#8217; -> &#8217; -> ’
 */
export function decodeHtmlEntities(text: string): string {
    if (!text) return '';

    let decoded = text;
    let prev;
    let iterations = 0;
    const maxIterations = 5;

    // Loop to handle double encoding (e.g., &amp;#8217;)
    do {
        prev = decoded;
        decoded = decoded
            // Common named entities
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&#39;/g, "'")

            // Smart quotes and other marks
            .replace(/&ldquo;/g, '“')
            .replace(/&rdquo;/g, '”')
            .replace(/&lsquo;/g, '‘')
            .replace(/&rsquo;/g, '’')
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&ndash;/g, '–')
            .replace(/&mdash;/g, '—')
            .replace(/&hellip;/g, '…')
            .replace(/&copy;/g, '©')
            .replace(/&reg;/g, '®')
            .replace(/&trade;/g, '™')

            // Numeric decimal entities (e.g., &#8217;)
            .replace(/&#(\d+);/g, (match, dec) => {
                try {
                    const code = parseInt(dec, 10);
                    // Handle common Windows-1252 character offsets if necessary, 
                    // but String.fromCodePoint is usually better for Unicode
                    return String.fromCodePoint(code);
                } catch (e) {
                    return match;
                }
            })

            // Numeric hex entities (e.g., &#x2019;)
            .replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
                try {
                    const code = parseInt(hex, 16);
                    return String.fromCodePoint(code);
                } catch (e) {
                    return match;
                }
            });

        iterations++;
    } while (decoded !== prev && iterations < maxIterations);

    return decoded.trim();
}
