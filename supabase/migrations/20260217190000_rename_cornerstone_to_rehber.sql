-- Rename Cornerstone category to Rehber (Guide)
-- Cornerstone kategorisi kaldırıldı; anahtar kelime odaklı (karasu satılık daire vb.) Rehber kullanılıyor.
UPDATE articles
SET category = 'Rehber'
WHERE category = 'Cornerstone';
