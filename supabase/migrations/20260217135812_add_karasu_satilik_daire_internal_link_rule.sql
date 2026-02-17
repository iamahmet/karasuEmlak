-- Internal link rule: Karasu Satılık Daire -> /karasu-satilik-daire
INSERT INTO "InternalLinkRule" (id, locale, keyword, url, "anchorText", priority, active) 
SELECT gen_random_uuid(), 'tr', 'Karasu Satılık Daire', '/karasu-satilik-daire', 'Karasu Satılık Daire', 100, true
WHERE NOT EXISTS (SELECT 1 FROM "InternalLinkRule" WHERE keyword = 'Karasu Satılık Daire' AND url = '/karasu-satilik-daire');
