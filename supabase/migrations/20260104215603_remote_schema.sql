create extension if not exists "cube" with schema "public";
create extension if not exists "earthdistance" with schema "public";
  create table "public"."ai_image_generation_logs" (
    "id" uuid not null default gen_random_uuid(),
    "generation_type" text not null,
    "image_size" text not null,
    "image_quality" text not null,
    "cost" numeric(10,4) not null default 0,
    "success" boolean not null default true,
    "error_message" text,
    "media_asset_id" uuid,
    "prompt_hash" text,
    "context_hash" text,
    "created_at" timestamp with time zone not null default now()
      );

  create table "public"."articles" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "content" text not null,
    "excerpt" text,
    "meta_description" text,
    "keywords" text[],
    "author" text default 'Karasu Emlak'::text,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "status" text default 'draft'::text,
    "featured_image" text,
    "category" text,
    "tags" text[],
    "views" integer default 0,
    "seo_score" integer,
    "discover_eligible" boolean default false,
    "discover_headline" text,
    "discover_image" text,
    "internal_links" jsonb default '[]'::jsonb,
    "scheduled_publish_at" timestamp with time zone
      );

  create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "article_slug" text not null,
    "name" text not null,
    "email" text not null,
    "content" text not null,
    "parent_id" uuid,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."contact_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "email" text not null,
    "phone" text,
    "subject" text not null,
    "message" text not null,
    "status" text default 'new'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."listings" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "status" text not null,
    "property_type" text not null,
    "location_city" text not null default 'Sakarya'::text,
    "location_district" text not null default 'Karasu'::text,
    "location_neighborhood" text not null,
    "location_full_address" text,
    "coordinates_lat" numeric(10,8),
    "coordinates_lng" numeric(11,8),
    "price_amount" numeric(15,2),
    "price_currency" text default 'TRY'::text,
    "features" jsonb default '{}'::jsonb,
    "description_short" text,
    "description_long" text,
    "description_generated" boolean default false,
    "images" jsonb default '[]'::jsonb,
    "agent_name" text,
    "agent_phone" text,
    "agent_whatsapp" text,
    "agent_email" text,
    "keywords" text[] default '{}'::text[],
    "seo_keywords" text[] default '{}'::text[],
    "virtual_tour" jsonb,
    "video_tour" jsonb,
    "floor_plan" jsonb,
    "available" boolean default true,
    "published" boolean default false,
    "featured" boolean default false,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."media_assets" (
    "id" uuid not null default gen_random_uuid(),
    "cloudinary_public_id" text not null,
    "cloudinary_url" text not null,
    "cloudinary_secure_url" text not null,
    "asset_type" text not null,
    "entity_type" text,
    "entity_id" text,
    "width" integer,
    "height" integer,
    "format" text,
    "bytes" bigint,
    "alt_text" text,
    "alt_text_generated" boolean default false,
    "title" text,
    "caption" text,
    "transformations" jsonb default '{}'::jsonb,
    "usage_count" integer default 0,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "prompt_hash" text,
    "context_hash" text,
    "generation_cost" numeric(10,4),
    "generation_metadata" jsonb default '{}'::jsonb,
    "ai_generated" boolean default false
      );

  create table "public"."navigation_items" (
    "id" uuid not null default gen_random_uuid(),
    "menu_id" uuid,
    "parent_id" uuid,
    "title" text not null,
    "url" text not null,
    "icon" text,
    "description" text,
    "is_active" boolean default true,
    "display_order" integer default 0,
    "open_in_new_tab" boolean default false,
    "css_class" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."navigation_menus" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "position" text not null default 'header'::text,
    "is_active" boolean default true,
    "display_order" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."neighborhoods" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" text not null,
    "district" text not null default 'Karasu'::text,
    "city" text not null default 'Sakarya'::text,
    "description" text,
    "content_generated" boolean default false,
    "seo_content" jsonb default '{}'::jsonb,
    "faqs" jsonb default '[]'::jsonb,
    "stats" jsonb default '{}'::jsonb,
    "coordinates_lat" numeric(10,8),
    "coordinates_lng" numeric(11,8),
    "published" boolean default false,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."news_articles" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "source_url" text not null,
    "source_domain" text default 'karasugundem.com'::text,
    "source_article_id" text,
    "original_summary" text not null,
    "emlak_analysis" text,
    "emlak_analysis_generated" boolean default false,
    "related_neighborhoods" text[] default '{}'::text[],
    "related_listings" uuid[] default '{}'::uuid[],
    "seo_title" text,
    "seo_description" text,
    "seo_keywords" text[] default '{}'::text[],
    "published_at" timestamp with time zone not null,
    "published" boolean default false,
    "featured" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone,
    "cover_image" text,
    "og_image" text,
    "discover_eligible" boolean default false,
    "discover_headline" text,
    "discover_image" text,
    "scheduled_publish_at" timestamp with time zone
      );

  create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "permissions" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );

  create table "public"."seo_events" (
    "id" uuid not null default gen_random_uuid(),
    "event_type" text not null,
    "entity_type" text,
    "entity_id" text,
    "event_data" jsonb default '{}'::jsonb,
    "status" text default 'success'::text,
    "error_message" text,
    "created_at" timestamp with time zone default now()
      );

  create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "role_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );

alter table "public"."ai_image_generation_logs" add constraint "ai_image_generation_logs_pkey" PRIMARY KEY (id);
alter table "public"."articles" add constraint "articles_pkey" PRIMARY KEY (id);
alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY (id);
alter table "public"."contact_submissions" add constraint "contact_submissions_pkey" PRIMARY KEY (id);
alter table "public"."listings" add constraint "listings_pkey" PRIMARY KEY (id);
alter table "public"."media_assets" add constraint "media_assets_pkey" PRIMARY KEY (id);
alter table "public"."navigation_items" add constraint "navigation_items_pkey" PRIMARY KEY (id);
alter table "public"."navigation_menus" add constraint "navigation_menus_pkey" PRIMARY KEY (id);
alter table "public"."neighborhoods" add constraint "neighborhoods_pkey" PRIMARY KEY (id);
alter table "public"."news_articles" add constraint "news_articles_pkey" PRIMARY KEY (id);
alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY (id);
alter table "public"."seo_events" add constraint "seo_events_pkey" PRIMARY KEY (id);
alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY (id);
alter table "public"."ai_image_generation_logs" add constraint "ai_image_generation_logs_media_asset_id_fkey" FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL not valid;
alter table "public"."ai_image_generation_logs" validate constraint "ai_image_generation_logs_media_asset_id_fkey";
alter table "public"."articles" add constraint "articles_slug_key" UNIQUE (slug);
alter table "public"."articles" add constraint "articles_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;
alter table "public"."articles" validate constraint "articles_status_check";
alter table "public"."comments" add constraint "comments_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;
alter table "public"."comments" validate constraint "comments_parent_id_fkey";
alter table "public"."comments" add constraint "comments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'spam'::text]))) not valid;
alter table "public"."comments" validate constraint "comments_status_check";
alter table "public"."contact_submissions" add constraint "contact_submissions_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text, 'archived'::text]))) not valid;
alter table "public"."contact_submissions" validate constraint "contact_submissions_status_check";
alter table "public"."listings" add constraint "listings_property_type_check" CHECK ((property_type = ANY (ARRAY['daire'::text, 'villa'::text, 'ev'::text, 'yazlik'::text, 'arsa'::text, 'isyeri'::text, 'dukkan'::text]))) not valid;
alter table "public"."listings" validate constraint "listings_property_type_check";
alter table "public"."listings" add constraint "listings_slug_key" UNIQUE (slug);
alter table "public"."listings" add constraint "listings_status_check" CHECK ((status = ANY (ARRAY['satilik'::text, 'kiralik'::text]))) not valid;
alter table "public"."listings" validate constraint "listings_status_check";
alter table "public"."media_assets" add constraint "media_assets_asset_type_check" CHECK ((asset_type = ANY (ARRAY['listing_image'::text, 'blog_image'::text, 'og_image'::text, 'neighborhood_image'::text, 'other'::text]))) not valid;
alter table "public"."media_assets" validate constraint "media_assets_asset_type_check";
alter table "public"."media_assets" add constraint "media_assets_cloudinary_public_id_key" UNIQUE (cloudinary_public_id);
alter table "public"."navigation_items" add constraint "navigation_items_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public.navigation_menus(id) ON DELETE CASCADE not valid;
alter table "public"."navigation_items" validate constraint "navigation_items_menu_id_fkey";
alter table "public"."navigation_items" add constraint "navigation_items_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.navigation_items(id) ON DELETE CASCADE not valid;
alter table "public"."navigation_items" validate constraint "navigation_items_parent_id_fkey";
alter table "public"."navigation_menus" add constraint "navigation_menus_slug_key" UNIQUE (slug);
alter table "public"."neighborhoods" add constraint "neighborhoods_slug_key" UNIQUE (slug);
alter table "public"."news_articles" add constraint "news_articles_slug_unique" UNIQUE (slug);
alter table "public"."roles" add constraint "roles_name_key" UNIQUE (name);
alter table "public"."seo_events" add constraint "seo_events_event_type_check" CHECK ((event_type = ANY (ARRAY['listing_published'::text, 'post_published'::text, 'neighborhood_published'::text, 'content_generated'::text, 'content_generation_failed'::text, 'sitemap_generated'::text, 'schema_generated'::text, 'internal_link_added'::text, 'image_uploaded'::text, 'og_image_generated'::text, 'alt_text_generated'::text]))) not valid;
alter table "public"."seo_events" validate constraint "seo_events_event_type_check";
alter table "public"."seo_events" add constraint "seo_events_status_check" CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text, 'warning'::text]))) not valid;
alter table "public"."seo_events" validate constraint "seo_events_status_check";
alter table "public"."user_roles" add constraint "user_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE not valid;
alter table "public"."user_roles" validate constraint "user_roles_role_id_fkey";
alter table "public"."user_roles" add constraint "user_roles_user_id_role_id_key" UNIQUE (user_id, role_id);