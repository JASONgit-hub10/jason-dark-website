/* =========================================================================
   SUPABASE CONFIG
   -------------------------------------------------------------------------
   1. Create a free project at https://supabase.com (no credit card).
   2. Project Settings → API → copy "Project URL" and the "anon public" key.
   3. Paste them below. That's it — these are safe to expose publicly,
      Supabase's Row Level Security (the schema.sql rules) is what actually
      keeps data safe, not secrecy of this key.
   ========================================================================= */

const SUPABASE_URL = "https://midzpmpajfaveoavpcfv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZHpwbXBhamZhdmVvYXZwY2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTY4NDksImV4cCI6MjA5ODU5Mjg0OX0.Rc2GkVSCLlutl0dnwh7MEiv9IGrQRG6bf73GXt022_M";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
