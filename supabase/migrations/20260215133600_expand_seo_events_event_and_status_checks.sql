-- Keep seo_events usable by internal automation scripts without constant constraint violations.
-- Expands allowed event_type and status values to match current code/scripts usage.

alter table "public"."seo_events" drop constraint if exists "seo_events_event_type_check";
alter table "public"."seo_events" drop constraint if exists "seo_events_status_check";

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
        'content_refined'::text,
        'sitemap_generated'::text,
        'schema_generated'::text,
        'internal_link_added'::text,
        'image_uploaded'::text,
        'image_generated'::text,
        'og_image_generated'::text,
        'alt_text_generated'::text,
        'freshness_optimized'::text,
        'web_vitals'::text
      ]
    )
  ) not valid;

alter table "public"."seo_events" validate constraint "seo_events_event_type_check";

alter table "public"."seo_events"
  add constraint "seo_events_status_check"
  check ((status = any (array['success'::text, 'failed'::text, 'warning'::text, 'completed'::text])))
  not valid;

alter table "public"."seo_events" validate constraint "seo_events_status_check";

