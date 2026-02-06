-- Run this in the Supabase Dashboard → SQL Editor to fix
-- "new row violates row-level security policy" and 403 on folders/bookmarks.
--
-- Ensures:
-- - RLS is enabled on folders and bookmarks.
-- - Authenticated users can only read/insert/update/delete their own rows (user_id = auth.uid()).

-- Folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own folders" ON public.folders;
CREATE POLICY "Users can read own folders"
  ON public.folders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own folders" ON public.folders;
CREATE POLICY "Users can insert own folders"
  ON public.folders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own folders" ON public.folders;
CREATE POLICY "Users can update own folders"
  ON public.folders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own folders" ON public.folders;
CREATE POLICY "Users can delete own folders"
  ON public.folders FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
