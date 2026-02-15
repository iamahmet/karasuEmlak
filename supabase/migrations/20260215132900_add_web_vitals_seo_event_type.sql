-- Allow storing performance telemetry in seo_events.
-- Existing API route uses event_type='web_vitals' (apps/web/app/api/analytics/web-vitals/route.ts)

alter table "public"."seo_events" drop constraint if exists "seo_events_event_type_check";

alter table "public"."seo_events"
  add constraint "seo_events_event_type_check"
  check (
    event_type = any (
      array[
        'listing_published'::text,
        'post_published'::text,
        'neighborhood_published'::text,
        'content_generated'::text,
        'content_generation_failed'::text,
        'sitemap_generated'::text,
        'schema_generated'::text,
        'internal_link_added'::text,
        'image_uploaded'::text,
        'og_image_generated'::text,
        'alt_text_generated'::text,
        'web_vitals'::text
      ]
    )
  ) not valid;

alter table "public"."seo_events" validate constraint "seo_events_event_type_check";

