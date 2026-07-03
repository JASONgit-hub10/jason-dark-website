-- =========================================================================
-- JASON DARK — SUPABASE SCHEMA
-- -------------------------------------------------------------------------
-- Run this once in your Supabase project: Dashboard → SQL Editor → New
-- query → paste this whole file → Run.
-- =========================================================================

-- ---- profiles (one row per visitor profile) --------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,   -- normalized name, used to log back in
  avatar      text not null default 'assets/icons/default-avatar.svg',
  created_at  timestamptz not null default now()
);

-- ---- comments -----------------------------------------------------------
create table comments (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

-- ---- replies --------------------------------------------------------------
create table replies (
  id          uuid primary key default gen_random_uuid(),
  comment_id  uuid not null references comments(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

-- ---- likes (one row per person per comment) --------------------------
create table likes (
  comment_id  uuid not null references comments(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- ---- reading progress ---------------------------------------------------
create table reading_progress (
  user_id     uuid not null references profiles(id) on delete cascade,
  book_id     text not null,
  opened_at   timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY — locks every table down, then opens exactly the
-- access each feature needs. Nothing is readable/writable by default.
-- =========================================================================
alter table profiles          enable row level security;
alter table comments          enable row level security;
alter table replies           enable row level security;
alter table likes             enable row level security;
alter table reading_progress  enable row level security;

-- profiles: everyone can see names/avatars (needed to show who posted what);
-- you can only create/edit your own row.
create policy "profiles are publicly readable" on profiles
  for select using (true);
create policy "users can create their own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- comments: publicly readable; only signed-in users can post, only as themselves.
create policy "comments are publicly readable" on comments
  for select using (true);
create policy "signed-in users can post comments" on comments
  for insert with check (auth.uid() = author_id);

-- replies: same pattern as comments.
create policy "replies are publicly readable" on replies
  for select using (true);
create policy "signed-in users can post replies" on replies
  for insert with check (auth.uid() = author_id);

-- likes: publicly readable (so like counts show for everyone);
-- you can only like/unlike as yourself.
create policy "likes are publicly readable" on likes
  for select using (true);
create policy "signed-in users can like as themselves" on likes
  for insert with check (auth.uid() = user_id);
create policy "signed-in users can unlike their own like" on likes
  for delete using (auth.uid() = user_id);

-- reading_progress: private to each user.
create policy "users can read their own progress" on reading_progress
  for select using (auth.uid() = user_id);
create policy "users can save their own progress" on reading_progress
  for insert with check (auth.uid() = user_id);
create policy "users can update their own progress" on reading_progress
  for update using (auth.uid() = user_id);

-- =========================================================================
-- REALTIME — lets every visitor's feedback tab update live when anyone
-- posts a comment/reply/like, no refresh needed.
-- =========================================================================
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table replies;
alter publication supabase_realtime add table likes;

-- =========================================================================
-- STORAGE — a public bucket for profile logos/photos.
-- After running this file, also do this once in the Dashboard:
--   Storage → Create bucket → name it exactly "avatars" → toggle "Public".
-- Then run the two policy statements below (Storage → Policies → New policy,
-- or just paste into SQL Editor — both work).
-- =========================================================================
create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
