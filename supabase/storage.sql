-- Storage + auth snapshot — taken 2026-09-15 (read-only), companion to schema.sql.
-- Source: the storage/auth queries in supabase/README.md. Not a migration.

-- ---------------------------------------------------------------------------
-- Storage buckets: NONE exist.
--   NOTE: lib/utils.ts uploads to a bucket named "announcements", which does
--   not exist, so admin image upload cannot work until it is created.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Storage RLS: enabled (not forced) on every storage table:
--   buckets, buckets_analytics, buckets_vectors, migrations, objects,
--   s3_multipart_uploads, s3_multipart_uploads_parts, vector_indexes
-- Storage policies: NONE. With RLS on and no policies, anon/authenticated
-- clients can't read or write storage via the API; only the service role can.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- auth.users triggers (1):
-- Every signup inserts a row into public.user_profiles (see schema.sql).
-- Dropping user_profiles or handle_new_user() would break ALL signups.
-- ---------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
