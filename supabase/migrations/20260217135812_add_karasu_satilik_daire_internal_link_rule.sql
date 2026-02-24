-- Internal link rule: Karasu Satılık Daire -> /karasu-satilik-daire
-- Some environments don't have the legacy Prisma table "InternalLinkRule".
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'InternalLinkRule'
  ) THEN
    EXECUTE $sql$
      INSERT INTO "InternalLinkRule" (id, locale, keyword, url, "anchorText", priority, active)
      SELECT gen_random_uuid(), 'tr', 'Karasu Satılık Daire', '/karasu-satilik-daire', 'Karasu Satılık Daire', 100, true
      WHERE NOT EXISTS (
        SELECT 1
        FROM "InternalLinkRule"
        WHERE keyword = 'Karasu Satılık Daire'
          AND url = '/karasu-satilik-daire'
      )
    $sql$;
  END IF;
END $$;
