# Jason Dark — Website

A free, no-backend website: Home, Music, Books, Feedback and a Jason AI
assistant, plus a big banner to promote and download your app. Built with
plain HTML/CSS/JS — no build tools, no npm, no framework. Open it, edit it,
push it.

## 1. Open it in VS Code

1. Unzip this folder wherever you like.
2. Open VS Code → File → Open Folder → select `jason-dark-website`.
3. Install the free **"Live Server"** extension (search it in the
   Extensions panel), then right-click `index.html` → **Open with Live
   Server**. The site opens in your browser and reloads automatically
   every time you save a file.

## 2. Put in your real content — `js/data.js`

Open `js/data.js`. Everything you'll change day to day lives there:

- **`app`** — your app's name, tagline, and `apkUrl` (where the APK lives).
- **`books`** — one entry per book: title, `cover` image path, blurb, and
  `readUrl` (the GitHub link to the book itself).
- **`videos`** — one entry per music video. Just the YouTube video ID
  (the part after `watch?v=` in any YouTube URL).
- **`assistantKnowledge`** — the facts the Jason AI assistant can answer
  with. Add as many entries as you like: a list of trigger keywords, and
  the answer to give when a visitor's question contains them.

Save the file, and Live Server refreshes the page automatically.

## 3. Add your images

- Book covers → `assets/covers/` (update the filename in `js/data.js` to match)
- Your app's `.apk` → `assets/app/` (update `apkUrl` in `js/data.js` to match)

If your APK is large, GitHub works better as a **Release** attachment than
a committed file — see the note in `assets/app/PUT-YOUR-APK-HERE.txt`.

## 4. Put your books on GitHub

For each book: create a GitHub repo (or a folder in one repo), upload the
book file (PDF, ePub, or even a rendered web page) plus its cover image,
and copy the file's GitHub link into that book's `readUrl` in `js/data.js`.

## 5. Publish it for free — GitHub Pages

1. Create a new GitHub repository (public).
2. In VS Code's Source Control panel, initialize git, commit, and push —
   or just drag the whole folder into github.com's "upload files" screen.
3. On GitHub: **Settings → Pages → Branch: main → Save.**
4. GitHub gives you a live URL like
   `https://your-username.github.io/your-repo/` within a minute or two.

That's it — completely free hosting, forever, with no server to maintain.

## How the profile system works — Supabase (free, shared across everyone)

Profiles, comments, replies, likes and reading progress are stored in a
free **Supabase** project — a hosted database + login system you don't
have to run or maintain yourself. Anyone who signs in, on any device, sees
the same comments and likes as everyone else, updating live.

**One-time setup (about 10 minutes, no credit card):**

1. Go to https://supabase.com → sign up → **New project** (pick any name
   and a database password — save that password somewhere, you won't need
   it day-to-day).
2. Once it's ready: left sidebar → **SQL Editor** → **New query** → open
   `supabase/schema.sql` from this folder, paste its entire contents in,
   and click **Run**. This creates all the tables and the security rules
   that keep everyone's data safe.
3. Left sidebar → **Storage** → **Create a new bucket** → name it exactly
   `avatars` → toggle **Public bucket** on → Create.
4. Left sidebar → **Authentication → Providers → Email** → turn
   **Confirm email** off, then click **Save**. This is required because the
   site uses name + password profiles with hidden placeholder emails; if
   confirmation stays on, Supabase tries to send emails and may show
   `email rate limit exceeded`.
5. Left sidebar → **Project Settings → API** → copy the **Project URL**
   and the **anon public** key.
6. Open `js/supabase-config.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://your-project-id.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-public-key";
   ```
7. Save, refresh the site (Live Server does this automatically) — sign-up,
   comments, replies and likes now work and are visible to every visitor.

The anon key is meant to be public — it's safe to commit to GitHub. What
actually protects the data is the Row Level Security rules in
`schema.sql` (e.g. "you can only post as yourself", "you can only unlike
your own like").

**About passwords, since there's no email step:** Supabase's built-in
login needs an email-shaped address, so behind the scenes each name is
turned into a private placeholder like `jason123@users.jasondark.app` —
nothing is ever emailed, nobody sees this, it's just plumbing so
Supabase has something to store the password against. Passwords
themselves are handled entirely by Supabase's own auth system (properly
hashed, industry-standard) — this site's code never sees or stores a raw
password.

**Free tier limits** (plenty for a fan/author site): 500MB database,
1GB file storage, 50,000 monthly active users, 5GB bandwidth/month. If
you ever outgrow that, Supabase's paid tier starts around $25/month —
you'll likely never need it for this kind of site.

## Upgrading the Jason AI assistant to real AI later (optional)

Right now the assistant is a free, instant, local keyword search over
`assistantKnowledge` in `js/data.js` — no API key, no cost, no limits.

When you want it to hold a real open-ended conversation, you'll need a paid
AI API key (e.g. the Anthropic API) called from a small serverless
function (so the key isn't exposed in the browser — free tiers exist on
Cloudflare Workers or Vercel Functions). Ask me when you're ready and I'll
wire that up.

## File map

```
index.html              all pages/tabs (Home, Music, Books, Feedback, Assistant)
css/style.css           every color, animation, glass/glossy effect
js/data.js              <- edit this for day-to-day content changes
js/supabase-config.js   <- paste your Supabase URL + anon key here
js/auth.js              profile, comments, likes, reading-progress (Supabase)
js/app.js               tabs, rendering, guided tour, assistant logic
supabase/schema.sql     run once in Supabase's SQL Editor to set up the database
assets/covers/          book cover images
assets/app/             your .apk file
assets/icons/           default avatar/cover placeholders
```

## Notes

- Fully responsive down to phone width.
- Respects "reduce motion" accessibility settings.
- No paid services, no npm packages, no build step — just files a browser
  can read directly.
