/**
 * Content Analysis Prompts
 * Based on CIRAK MODU - Editorial & SEO Guidelines
 * 
 * Optimized for token efficiency while maintaining quality
 */

/**
 * Standard Content Analysis Prompt
 * Token-optimized version for quality checking
 */
export const CONTENT_ANALYSIS_PROMPT = (
  content: string,
  title: string,
  context?: {
    category?: string;
    keywords?: string[];
  }
): string => {
  // Token optimization: Use first 2500 chars (enough for analysis, saves tokens)
  const contentPreview = content.substring(0, 2500);
  const hasMore = content.length > 2500;
  const category = context?.category || 'Genel';
  const keywords = context?.keywords?.join(', ') || 'Yok';
  const lengthNote = hasMore ? ' (ilk 2500 karakter analiz ediliyor)' : '';
  
  return `# GOREV
Turkce icerik kalite analizi yap. KarasuEmlak.net standartlarina gore degerlendir.

# ICERIK BILGILERI
Baslik: ${title}
Kategori: ${category}
Anahtar Kelimeler: ${keywords}
Icerik Uzunlugu: ${content.length} karakter${lengthNote}

# ICERIK ONIZLEME
${contentPreview}${hasMore ? '\n\n[... icerik devam ediyor]' : ''}

# ANALIZ KRITERLERI

## 1. AI Detection (Kritik)
Tespit et:
- "Gunumuzde", "Son yillarda", "Bu yazida sizlere" gibi ifadeler
- "Merhaba degerli okuyucular", "Unutulmamalidir ki" gibi kaliplar
- "Sonuc olarak", "Ozetlemek gerekirse" gibi generic ifadeler
- "Bircok kisi", "Cogu insan", "Genellikle" gibi belirsiz ifadeler
- "Essiz", "Luks", "Kacirilmayacak firsat" gibi pazarlama jargonu
- Tekrar eden cumle kaliplari
- Yerel bilgi var mi? (Karasu, Kocaali, mahalle adlari)
- Spesifik detaylar var mi?
- Dogal ton var mi?

## 2. SEO Uyumlulugu (0-100)
- Anahtar kelime kullanimi (dogal, zorlama degil)
- Yerel SEO (Karasu, mahalle referanslari)
- Baslik yapisi (H2, H3)
- Meta bilgiler (title, description uygun mu?)

## 3. Okunabilirlik (0-100)
- Cumle uzunlugu (10-20 kelime ideal)
- Paragraf uzunlugu (2-4 cumle ideal)
- Kelime secimi (basit, anlasilir)
- Akicilik

## 4. Icerik Kalitesi (0-100)
- Bilgi degeri
- Derinlik
- Ozgunluk
- Yerel bilgi ve detaylar

## 5. Yapi ve Format (0-100)
- Baslik hiyerarsisi (H2, H3)
- Paragraf yapisi
- Listeler (varsa)
- Gorsel onerileri (varsa)

# CIKTI FORMATI
Sadece JSON dondur (baska aciklama yapma):

{
  "score": 0-100,
  "passed": true/false,
  "issues": [
    {
      "type": "ai-pattern|seo|readability|structure|engagement|uniqueness",
      "severity": "low|medium|high",
      "message": "Kisa sorun aciklamasi",
      "suggestion": "Kisa iyilestirme onerisi"
    }
  ],
  "suggestions": ["Oneri 1", "Oneri 2", "Oneri 3"],
  "aiGenerated": true/false,
  "humanLikeScore": 0-100,
  "seoScore": 0-100
}

# ONEMLI
- Issues maksimum 8 adet (en onemlileri)
- Suggestions maksimum 5 adet (en kritik olanlar)
- Kisa ve oz mesajlar (token tasarrufu)
- Standartlara gore degerlendir (CIRAK MODU kurallari)`;
};

/**
 * System prompt for content analysis
 */
export const CONTENT_ANALYSIS_SYSTEM_PROMPT = `Sen bir icerik kalite uzmanisin. KarasuEmlak.net icin icerik analizi yapiyorsun.

Gorevin: Icerigi CIRAK MODU Editorial & SEO Guidelines'a gore analiz etmek.

ONEMLI:
- AI detection odakli analiz
- SEO uyumlulugu kontrolu
- Okunabilirlik degerlendirmesi
- Yerel bilgi varligi kontrolu
- Sadece JSON dondur, aciklama yapma`;
