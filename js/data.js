/* =========================================================================
   JASON DARK — SITE CONTENT
   -------------------------------------------------------------------------
   Everything you'll want to change day-to-day lives in this one file.
   No HTML/CSS knowledge needed to update your bio, books, videos or app link.
   Save the file and refresh the page — that's it.
   ========================================================================= */

const SITE_DATA = {

  // ---- Basic identity --------------------------------------------------
  artist: {
    name: "Jason Dark",
    tagline: "Author. Composer. Builder of dark little worlds.",
    youtubeChannel: "https://www.youtube.com/@jasondarkofficial",
    // Any short social/contact links you want in the footer
    links: [
      { label: "YouTube", url: "https://www.youtube.com/@jasondarkofficial" },
      { label: "GitHub", url: "https://github.com/" }
    ],
    social: [
      { label: "Instagram", url: "https://www.instagram.com/jasondarkofficial/", icon: "instagram" },
      { label: "TikTok", url: "https://www.tiktok.com/@jasondarkofficial?is_from_webapp=1&sender_device=pc", icon: "tiktok" },
      { label: "Patreon", url: "https://www.patreon.com/cw/JasonDark", icon: "patreon" }
    ]
  },

  // ---- App download banner ----------------------------------------------
  app: {
    name: "Jason Dark App",
    tagline: "Carry the whole universe in your pocket — books, music, and more.",
    // Put your built APK inside assets/app/ and update the filename below.
    // GitHub also works great for this: use a "Release" and paste that .apk link here.
    apkUrl: "assets/app/jason-dark-app.apk",
    versionLabel: "v1.0"
  },

  // ---- Books --------------------------------------------------------------
  // Put each book's cover image inside assets/covers/ (jpg or png).
  // "readUrl" should point at the book on GitHub (a repo, a hosted PDF/ePub, etc).
  books: [
    {
      id: "book-1",
      title: "VOXT: The Astral Heir",
      cover: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/astral-heir.png",
      blurb: "The first VOXT novel — a dark fantasy adventure that begins the saga.",
      readUrl: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/VOXT_The_Astral_Heir.pdf"
    },
    {
      id: "book-2",
      title: "VOXT Book 2: The Eleventh Voxt",
      cover: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/eleventh-voxt.png",
      blurb: "The second VOXT novel, where new mysteries and ancient powers collide.",
      readUrl: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/VOXT_Book2_The_Eleventh_Voxt.pdf"
    },
    {
      id: "book-3",
      title: "VOXT Book 3: Aeron Vaultis",
      cover: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/aeron-vaultis.png",
      blurb: "A third VOXT installment centered on Aeron Vaultis and the fate of the realm.",
      readUrl: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/VOXT_Book3_Aeron_Vaultis.pdf"
    },
    {
      id: "book-4",
      title: "VOXT Book 4: Lady Nyxora",
      cover: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/lady-nyxora.png",
      blurb: "The fourth novel follows Lady Nyxora into shadows and cosmic intrigue.",
      readUrl: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/VOXT_Book4_Lady_Nyxora.pdf"
    },
    {
      id: "book-5",
      title: "VOXT Book 5: The Four Brothers",
      cover: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/four-brothers.png",
      blurb: "The fifth VOXT book, where the Four Brothers' true purpose is revealed.",
      readUrl: "https://raw.githubusercontent.com/JASONgit-hub10/jason-dark-website/main/VOXT_Book5_The_Four_Brothers.pdf"
    }
  ],

  // ---- Music videos -------------------------------------------------------
  // Grab the ID from any YouTube URL: youtube.com/watch?v=THIS_PART
  videos: [
    { id: "M9EvuTaAoAA", title: "WELCOME TO THE WORLD OF VOXT | OFFICIAL THEME SONG | done by feddy beatz" },
    { id: "T08TShIvFDw", title: "A Heart You Knew - Feddy Beatz & Jason Dark" },
    { id: "s5d4Ly9clzw", title: "PARTY DONE RIGHT #music #edm #edmmusic #house #housemusic #dancepop" },
    { id: "lIw8TxXrX_s", title: "party done right (Jason Dark & Feddy Beatz)" },
    { id: "1Ins366H-jU", title: "New year.. new me .. JasonDarkOfficial now on most platforms" },
    { id: "21PrpN1h5i8", title: "Come Back - FEDDY BEATZ X DEDSEC DARK (official lyric video)" },
    { id: "50veLwmGpag", title: "Silver Lining - FEDDY BEATZ X DEDSEC DARK (official lyric video)" },
    { id: "APzhCU9vbsA", title: "SUBSCRIBE LIKE AND SHARE" },
    { id: "P4vgPzvNV9Q", title: "Save Tonight - FEDDY BEATZ X DEDSEC DARK (official lyric video)" },
    { id: "ILJmF7rfHnE", title: "WISE AT NIGHT - FEDDY BEATZ X DEDSEC DARK (official visualizer) vid by war3" },
    { id: "HRbvrnclz_s", title: "PROMISE - #promise #lyrics #music #altpop #kenyanpop FEDDY_BEATZ DEDSECDARK" },
    { id: "OiIry8PWP4o", title: "PROMISE - FEDDY BEATZ X DEDSEC DARK" },
    { id: "B0Cm9J4uLvo", title: "KNOW IT.... out now!!!" },
    { id: "gf751-tQfec", title: "KENYAN TUNESS" },
    { id: "TZcwTIkZ_Eg", title: "Know IT - Dedsec Dark" }
  ],

  // ---- Jason AI Assistant knowledge base ----------------------------------
  // A free, local "smart search" over facts you write yourself — no API key,
  // no cost, works instantly. Add as many entries as you like. Each entry has
  // a set of trigger "keywords" and the "answer" the assistant should give
  // when a visitor's question matches them.
  assistantSamples: [
    "Who is Jason Dark?",
    "What is the VOXT series about?",
    "How do I read a book on the site?",
    "Where can I watch Jason's music videos?",
    "How do I download the app?",
    "How can I support Jason on Patreon?",
    "What should I ask Jason AI?",
    "How do I leave a comment?",
    "What is the best way to email Jason?",
    "Tell me about the latest book?",
    "What is Jason working on next?",
    "Can you summarize the story so far?"
  ],
  assistantCategories: [
    { label: "Books", prompt: "Tell me about the books" },
    { label: "Music", prompt: "Tell me about Jason's music" },
    { label: "App", prompt: "How do I download the app?" },
    { label: "Support", prompt: "How can I support Jason?" },
    { label: "Contact", prompt: "How do I email Jason?" }
  ],
  assistantKnowledge: [
    {
      keywords: ["who", "jason", "dark", "writer", "musician", "creator"],
      answer: "Jason Dark is a writer and musician who builds dark, atmospheric worlds across books and music. Ask me about his books, his music, or the app!"
    },
    {
      keywords: ["voxt", "series", "saga", "dark fantasy", "voxt series"],
      answer: "The VOXT series is Jason Dark's dark fantasy saga — a mix of eerie city streets, mythic struggle, and haunting audio storytelling. It’s best explored through the Books tab and the app."
    },
    {
      keywords: ["next", "upcoming", "working", "project", "release", "future"],
      answer: "Jason is working on new stories and music projects that continue his dark, atmospheric style. Keep an eye on this site for updates and new releases."
    },
    {
      keywords: ["patreon", "support", "donate", "back", "membership"],
      answer: "You can support Jason on Patreon by heading to his Patreon page. Your support helps make more books, music, and app updates possible."
    },
    {
      keywords: ["book", "books", "novel", "read", "story"],
      answer: "Jason has published books that you can read for free — check the Books tab. Click any cover to start reading, and if you've created a profile, it'll remember your place."
    },
    {
      keywords: ["music", "song", "video", "youtube", "listen"],
      answer: "You can watch Jason's music videos right here without leaving the site — head to the Music tab. His full channel is at youtube.com/@jasondarkofficial."
    },
    {
      keywords: ["app", "apk", "download", "android", "install"],
      answer: "The Jason Dark app is free to download — scroll to the big download banner on the Home tab and tap Download APK."
    },
    {
      keywords: ["contact", "feedback", "comment", "message"],
      answer: "Head to the Feedback tab to leave a comment, reply to others, or like what you see. You'll need a free profile first."
    },
    {
      keywords: ["profile", "sign up", "account", "login", "password"],
      answer: "No sign-in required to browse — but creating a free profile (just a name, password and an optional logo) lets you comment, like, and pick up books where you left off."
    }
  ],

  // Fallback answer when nothing matches
  assistantFallback: "I don't have an answer for that yet — try asking about Jason's books, music, the app, or how to leave feedback."
};
