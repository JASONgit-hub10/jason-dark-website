/* =========================================================================
   JASON DARK — APP LOGIC
   ========================================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------------------- */
/* TABS                                                                    */
/* ---------------------------------------------------------------------- */
function switchTab(tab){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if(btn) btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if(tab === 'feedback') renderFeedbackTab();
  if(tab === 'assistant') renderAssistantWelcome();
  if(tab === 'profile') renderProfileTab();
}
document.getElementById('tabNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if(btn) switchTab(btn.dataset.tab);
});

/* ---------------------------------------------------------------------- */
/* TOASTS                                                                  */
/* ---------------------------------------------------------------------- */
function toast(message, type = ''){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => { el.style.animation = 'fadeOut .3s forwards'; setTimeout(() => el.remove(), 300); }, 2600);
}

/* ---------------------------------------------------------------------- */
/* CONTENT RENDER — App banner, books, videos                              */
/* ---------------------------------------------------------------------- */
function renderAppBanner(){
  const a = SITE_DATA.app;
  document.getElementById('appName').textContent = a.name;
  document.getElementById('appTagline').textContent = a.tagline;
  document.getElementById('appVersion').textContent = `Free · Android · ${a.versionLabel}`;
  document.getElementById('appIconLetter').textContent = a.name.trim().charAt(0).toUpperCase();
  const downloadLink = document.getElementById('appDownloadLink');
  if(downloadLink){ downloadLink.href = a.apkUrl; }
}

function showAppGuidelines(){
  const panel = document.getElementById('appGuidelines');
  if(!panel) return;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderVideos(){
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = SITE_DATA.videos.map(v => `
    <div class="card video-card glass">
      <div class="video-frame-wrap">
        <iframe src="https://www.youtube.com/embed/${v.id}" title="${escapeHtml(v.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy"></iframe>
      </div>
      <h4>${escapeHtml(v.title)}</h4>
    </div>
  `).join('');
}

function renderBooks(){
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = SITE_DATA.books.map(b => `
    <div class="card book-card glass" onclick="openReader('${b.id}')">
      <img class="book-cover" src="${b.cover}" alt="${escapeHtml(b.title)} cover"
        onerror="this.src='assets/icons/default-cover.svg'">
      <div class="book-body">
        <h4>${escapeHtml(b.title)}</h4>
        <p>${escapeHtml(b.blurb)}</p>
        ${hasOpenedBook(b.id) ? '<div class="book-progress">✓ Continue reading</div>' : ''}
      </div>
    </div>
  `).join('');
}

function openReader(bookId){
  const book = SITE_DATA.books.find(b => b.id === bookId);
  if(!book) return;
  renderReaderPage(book);
  switchTab('reader');
}

function renderReaderPage(book){
  const readerPanel = document.querySelector('.reader-panel');
  if(readerPanel) readerPanel.classList.remove('reader-expanded');
  const cover = document.getElementById('readerCover');
  cover.src = book.cover;
  cover.onerror = function(){ this.src = 'assets/icons/default-cover.svg'; };
  document.getElementById('readerTitle').textContent = book.title;
  document.getElementById('readerBlurb').textContent = book.blurb;
  const agree = document.getElementById('readerAgreeCheckbox');
  agree.checked = false;
  const openBtn = document.getElementById('readerOpenBtn');
  openBtn.disabled = false;
  const downloadBtn = document.getElementById('readerDownloadBtn');
  downloadBtn.href = book.readUrl;
  downloadBtn.setAttribute('aria-disabled', 'true');
  const viewerUrl = book.readUrl && book.readUrl.toLowerCase().endsWith('.pdf')
    ? `https://docs.google.com/gview?url=${encodeURIComponent(book.readUrl)}&embedded=true`
    : book.readUrl;
  openBtn.dataset.viewerUrl = viewerUrl;
  openBtn.dataset.bookId = book.id;
  document.getElementById('readerFrameWrap').style.display = 'none';
  document.getElementById('readerFrame').src = '';
  document.getElementById('readerDisclaimer').textContent = 'Terms: You can read the book directly on-site now. Check the box below to enable download only.';
}

function closeReaderModal(){
  document.getElementById('readerFrameWrap').style.display = 'none';
  document.getElementById('readerFrame').src = '';
  renderBooks(); // refresh "continue reading" tags
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

/* ---------------------------------------------------------------------- */
/* AUTH UI                                                                  */
/* ---------------------------------------------------------------------- */
let pendingAvatarDataUrl = null;

function renderAuthArea(){
  const area = document.getElementById('navAuthArea');
  const user = currentUser();
  if(user){
    area.innerHTML = `
      <div class="avatar-chip" id="avatarChipBtn" data-hint="Your profile">
        <img src="${user.avatar}" alt="">
        <span>${escapeHtml(user.name)}</span>
      </div>`;
    document.getElementById('avatarChipBtn').addEventListener('click', async () => {
      switchTab('profile');
    });
  } else {
    area.innerHTML = `<button class="btn btn-ghost" onclick="openAuthModal('login')" data-hint="Sign in or create a profile">Sign in</button>`;
  }
}

function openAuthModal(view){
  switchAuthView(view);
  document.getElementById('authBackdrop').classList.add('open');
}
function closeAuthModal(){
  document.getElementById('authBackdrop').classList.remove('open');
  ['loginError','signupError'].forEach(id => document.getElementById(id).textContent = '');
}
function switchAuthView(view){
  document.getElementById('loginView').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('signupView').style.display = view === 'signup' ? 'block' : 'none';
}

document.getElementById('logoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 1.5 * 1024 * 1024){ toast('Please choose an image under 1.5MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    pendingAvatarDataUrl = reader.result;
    document.getElementById('logoPreview').src = reader.result;
    document.getElementById('logoLabel').textContent = 'Looks good ✓';
  };
  reader.readAsDataURL(file);
});

document.getElementById('signupBtn').addEventListener('click', async () => {
  const name = document.getElementById('signupName').value;
  const password = document.getElementById('signupPassword').value;
  const errEl = document.getElementById('signupError');
  errEl.textContent = '';
  try{
    await signUp(name, password, pendingAvatarDataUrl);
    closeAuthModal();
    renderAuthArea();
    renderFeedbackTab();
    renderBooks();
    toast('Welcome, ' + name + '!', 'success');
  } catch(err){ errEl.textContent = err.message; }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const name = document.getElementById('loginName').value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try{
    await signIn(name, password);
    closeAuthModal();
    renderAuthArea();
    renderFeedbackTab();
    renderBooks();
    toast('Signed in — welcome back!', 'success');
  } catch(err){ errEl.textContent = err.message; }
});

/* ---------------------------------------------------------------------- */
/* FEEDBACK TAB                                                             */
/* ---------------------------------------------------------------------- */
function renderFeedbackTab(){
  const locked = document.getElementById('feedbackLocked');
  const unlocked = document.getElementById('feedbackUnlocked');
  const user = currentUser();
  if(!user){
    locked.style.display = 'block';
    unlocked.style.display = 'none';
    return;
  }
  locked.style.display = 'none';
  unlocked.style.display = 'block';
  document.getElementById('composerAvatar').src = user.avatar;
  renderComments();
}

function renderProfileTab(){
  const user = currentUser();
  if(!user){
    document.getElementById('profileName').textContent = 'Sign in to unlock your profile';
    document.getElementById('profileStats').textContent = 'Create a free profile to see your recent activity and customize your page.';
    document.getElementById('profileBooksList').innerHTML = '<div class="empty-state">Sign in to see your reading activity.</div>';
    document.getElementById('profileCommentsList').innerHTML = '<div class="empty-state">Sign in to see your recent comments.</div>';
    return;
  }

  document.getElementById('profileAvatar').src = user.avatar;
  document.getElementById('profileAvatarPreview').src = user.avatar;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileStats').textContent = 'Manage your name, avatar, and reading progress here.';
  document.getElementById('profileNameInput').value = user.name;
  document.getElementById('profileUpdateError').textContent = '';

  const signOutBtn = document.getElementById('profileSignOutBtn');
  if(signOutBtn){
    signOutBtn.style.display = 'block';
    signOutBtn.onclick = async () => {
      try{
        await signOut();
        renderAuthArea();
        renderFeedbackTab();
        renderProfileTab();
        switchTab('home');
        toast('Signed out successfully.', 'success');
      } catch(err){
        toast(err.message || 'Sign out failed.', 'error');
      }
    };
  }

  const openedBooks = SITE_DATA.books.filter(b => hasOpenedBook(b.id));
  if(openedBooks.length === 0){
    document.getElementById('profileBooksList').innerHTML = '<div class="empty-state">No books opened yet. Click a cover in Books to start reading.</div>';
  } else {
    document.getElementById('profileBooksList').innerHTML = openedBooks.map(b => `
      <div class="profile-book-item">
        <div>
          <strong>${escapeHtml(b.title)}</strong>
          <small>Opened earlier — click to continue</small>
        </div>
        <button class="btn btn-ghost" onclick="openReader('${b.id}')">Continue</button>
      </div>
    `).join('');
  }

  const comments = getComments().filter(c => c.authorId === user.id).slice(0, 4);
  if(comments.length === 0){
    document.getElementById('profileCommentsList').innerHTML = '<div class="empty-state">No comments yet. Join the conversation in Feedback.</div>';
  } else {
    document.getElementById('profileCommentsList').innerHTML = comments.map(c => `
      <div class="profile-comment-activity">
        <strong>${escapeHtml(c.text.slice(0, 80))}${c.text.length > 80 ? '…' : ''}</strong>
        <small>${timeAgo(c.time)}</small>
      </div>
    `).join('');
  }
}

function renderComments(){
  const list = getComments();
  const el = document.getElementById('commentList');
  const user = currentUser();
  if(list.length === 0){
    el.innerHTML = '<div class="empty-state">No comments yet — be the first to say something.</div>';
    return;
  }
  el.innerHTML = list.map(c => `
    <div class="comment glass">
      <div class="comment-head">
        <img src="${c.avatar}" alt="">
        <span class="name">${escapeHtml(c.author)}</span>
        <span class="time">${timeAgo(c.time)}</span>
      </div>
      <div class="comment-text">${escapeHtml(c.text)}</div>
      <div class="comment-actions">
        <button onclick="handleLike('${c.id}')" class="${user && c.likes.includes(user.id) ? 'liked' : ''}">
          ♥ ${c.likes.length || ''}
        </button>
        <button onclick="toggleReplyBox('${c.id}')">↩ Reply${c.replies.length ? ' (' + c.replies.length + ')' : ''}</button>
      </div>
      ${c.replies.length ? `<div class="replies">${c.replies.map(r => `
        <div class="comment-head" style="margin-top:10px;">
          <img src="${r.avatar}" alt="">
          <span class="name">${escapeHtml(r.author)}</span>
          <span class="time">${timeAgo(r.time)}</span>
        </div>
        <div class="comment-text">${escapeHtml(r.text)}</div>
      `).join('')}</div>` : ''}
      <div class="reply-box" id="reply-${c.id}">
        <input type="text" placeholder="Write a reply…" id="reply-input-${c.id}">
        <button class="btn btn-primary" onclick="submitReply('${c.id}')">Send</button>
      </div>
    </div>
  `).join('');
}

function timeAgo(ts){
  const s = Math.floor((Date.now() - ts) / 1000);
  if(s < 60) return 'just now';
  if(s < 3600) return Math.floor(s/60) + 'm ago';
  if(s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

document.getElementById('postCommentBtn').addEventListener('click', async () => {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if(!text) return;
  try{
    await addComment(text);
    input.value = '';
    renderComments();
  } catch(err){ toast(err.message, 'error'); }
});

async function handleLike(id){
  try{ await toggleLike(id); renderComments(); }
  catch(err){ toast(err.message, 'error'); }
}
function toggleReplyBox(id){
  document.getElementById('reply-' + id).classList.toggle('open');
}
async function submitReply(id){
  const input = document.getElementById('reply-input-' + id);
  const text = input.value.trim();
  if(!text) return;
  try{
    await addReply(id, text);
    input.value = '';
    renderComments();
  } catch(err){ toast(err.message, 'error'); }
}

/* ---------------------------------------------------------------------- */
/* JASON AI ASSISTANT (free, local keyword search — no API key needed)      */
/* ---------------------------------------------------------------------- */
let assistantWelcomed = false;
function renderAssistantWelcome(){
  if(assistantWelcomed) return;
  assistantWelcomed = true;
  addAssistantMessage("Hi! I'm the Jason AI assistant. Ask me anything about Jason, his books, his music, or the app.", 'bot');
  const suggestEl = document.getElementById('assistantSuggest');
  const samples = SITE_DATA.assistantSamples || [
    "Who is Jason Dark?",
    "What is the VOXT series about?",
    "How do I read a book on the site?",
    "Where can I watch Jason's music videos?",
    "How do I download the app?",
    "How can I support Jason on Patreon?",
    "What should I ask Jason AI?",
    "How do I leave a comment?",
    "What is the best way to email Jason?",
    "Tell me about the latest book?"
  ];
    if(suggestEl){
    suggestEl.innerHTML = '<strong>Try one of these:</strong>';
    samples.forEach(s => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip-btn';
      button.textContent = s;
      button.addEventListener('click', () => askAssistant(s));
      suggestEl.appendChild(button);
    });
  }
}

function addAssistantMessage(text, from){
  const el = document.getElementById('assistantMessages');
  const div = document.createElement('div');
  div.className = 'msg ' + (from === 'bot' ? 'msg-bot' : 'msg-user');
  div.textContent = text;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function answerFromKnowledge(question){
  const q = question.toLowerCase().replace(/[^\w\s']/g, ' ');
  let best = null, bestScore = 0, bestSpecificity = 0;
  SITE_DATA.assistantKnowledge.forEach(entry => {
    let score = 0;
    entry.keywords.forEach(k => {
      const term = k.toLowerCase().trim();
      if(!term) return;
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${safe}\\b`, 'i');
      if(regex.test(q)) score += term.length > 5 ? 2 : 1;
    });
    if(score > 0){
      const specificity = entry.keywords.length;
      if(score > bestScore || (score === bestScore && specificity > bestSpecificity)){
        bestScore = score;
        bestSpecificity = specificity;
        best = entry;
      }
    }
  });
  return best ? best.answer : SITE_DATA.assistantFallback;
}

function askAssistant(text){
  text = (text || '').trim();
  if(!text) return;
  addAssistantMessage(text, 'user');
  document.getElementById('assistantInput').value = '';
  setTimeout(() => {
    addAssistantMessage(answerFromKnowledge(text), 'bot');
  }, 350);
}

document.getElementById('assistantSend').addEventListener('click', () => askAssistant(document.getElementById('assistantInput').value));
document.getElementById('assistantInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter') askAssistant(e.target.value);
});

document.getElementById('profileAvatarInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 1.5 * 1024 * 1024){ toast('Please choose an image under 1.5MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('profileAvatarPreview').src = reader.result;
    document.getElementById('profileAvatarLabel').textContent = 'Upload looks good ✓';
    pendingAvatarDataUrl = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('profileSaveBtn').addEventListener('click', async () => {
  const name = document.getElementById('profileNameInput').value.trim();
  const errEl = document.getElementById('profileUpdateError');
  errEl.textContent = '';
  if(name.length < 2){ errEl.textContent = 'Name must be at least 2 characters.'; return; }
  try{
    const user = currentUser();
    if(!user) throw new Error('Sign in first.');
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!slug) throw new Error('Use only letters and numbers.');
    const { data: existing, error: existingError } = await sb.from('profiles').select('id').eq('slug', slug).maybeSingle();
    if(existingError) throw existingError;
    if(existing && existing.id !== user.id) throw new Error('That name is already taken.');
    let avatar = user.avatar;
    if(pendingAvatarDataUrl){
      avatar = await uploadAvatar(user.id, pendingAvatarDataUrl);
    }
    const { error } = await sb.from('profiles').update({ name, avatar, slug }).eq('id', user.id);
    if(error) throw error;
    _cachedUser = { ..._cachedUser, name, avatar };
    renderAuthArea();
    renderProfileTab();
    toast('Profile updated', 'success');
  } catch(err){ errEl.textContent = err.message || 'Could not update profile.'; }
});

document.getElementById('readerAgreeCheckbox').addEventListener('change', (e) => {
  const checked = e.target.checked;
  const downloadBtn = document.getElementById('readerDownloadBtn');
  downloadBtn.setAttribute('aria-disabled', (!checked).toString());
});

document.getElementById('readerOpenBtn').addEventListener('click', () => {
  const viewerUrl = document.getElementById('readerOpenBtn').dataset.viewerUrl;
  if(!viewerUrl) return;
  const frame = document.getElementById('readerFrame');
  frame.src = viewerUrl;
  document.getElementById('readerFrameWrap').style.display = 'block';
  const readerPanel = document.querySelector('.reader-panel');
  if(readerPanel) readerPanel.classList.add('reader-expanded');
  const bookId = document.getElementById('readerOpenBtn').dataset.bookId;
  markBookOpened(bookId);
});

document.getElementById('readerDownloadBtn').addEventListener('click', (e) => {
  if(document.getElementById('readerAgreeCheckbox').checked) return;
  e.preventDefault();
});

/* ---------------------------------------------------------------------- */
/* GUIDED TOUR                                                             */
/* ---------------------------------------------------------------------- */
const TOUR_STEPS = [
  { selector: '.tab-btn[data-tab="home"]', text: 'This is Home — your overview, and where the app download lives.' },
  { selector: '#appBanner', text: 'Tap here to grab the free app and download the APK straight to your phone.' },
  { selector: '.tab-btn[data-tab="music"]', text: 'Watch every music video right on this site — no need to jump to YouTube.' },
  { selector: '.tab-btn[data-tab="books"]', text: 'Browse and read the books here. Sign in and it remembers your place.' },
  { selector: '.tab-btn[data-tab="feedback"]', text: 'Leave comments, reply, and like posts — create a free profile first.' },
  { selector: '.tab-btn[data-tab="assistant"]', text: 'Got a question about Jason, a book, or a song? Ask the assistant here.' },
  { selector: '#navAuthArea', text: 'Create your free profile here â€” just a name, password, and an optional photo.' }
];
let tourIndex = 0;
let tourActive = false;

function startTour(){
  tourIndex = 0;
  tourActive = true;
  showTourStep();
}
function showTourStep(){
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  if(tourIndex >= TOUR_STEPS.length){ endTour(); return; }
  const step = TOUR_STEPS[tourIndex];
  const target = document.querySelector(step.selector);
  const tooltip = document.getElementById('tourTooltip');
  if(!target){ tourIndex++; showTourStep(); return; }

  // switch to the right tab if the target lives in nav (always visible) — safe.
  target.classList.add('tour-highlight');
  const rect = target.getBoundingClientRect();
  tooltip.innerHTML = `
    <div class="tt-step">Step ${tourIndex + 1} of ${TOUR_STEPS.length}</div>
    <p>${step.text}</p>
    <div class="tour-tooltip-actions">
      <button onclick="endTour()">Skip</button>
      <button class="tt-next" onclick="nextTourStep()">${tourIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next →'}</button>
    </div>
  `;
  let top = rect.bottom + 14;
  let left = Math.min(Math.max(rect.left, 16), window.innerWidth - 280);
  if(top + 140 > window.innerHeight) top = rect.top - 150;
  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
  tooltip.classList.add('show');
}
function nextTourStep(){ tourIndex++; showTourStep(); }
function endTour(){
  tourActive = false;
  document.getElementById('tourTooltip').classList.remove('show');
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
}
document.getElementById('guideBtn').addEventListener('click', startTour);
document.getElementById('guideFab').addEventListener('click', startTour);
window.addEventListener('resize', () => { if(tourActive) showTourStep(); });

/* ---------------------------------------------------------------------- */
/* INIT                                                                     */
/* ---------------------------------------------------------------------- */
function initFooter(){
  document.getElementById('footerLinks').innerHTML = SITE_DATA.artist.links
    .map(l => `<a href="${l.url}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
    .join(' · ');
  const footerSocialHtml = (SITE_DATA.artist.social || [])
    .map(s => `<a class="social-link" href="${s.url}" target="_blank" rel="noopener" title="${escapeHtml(s.label)}">${escapeHtml(s.label)}</a>`)
    .join('');
  document.getElementById('footerSocials').innerHTML = footerSocialHtml;
  document.getElementById('channelLink').href = SITE_DATA.artist.youtubeChannel;
}

renderAppBanner();
renderVideos();
initFooter();

// Auth + comments are backed by Supabase and load asynchronously.
// onAuthChange fires on sign in/out/session-restore; onCommentsChange
// fires whenever anyone, anywhere, posts/likes/replies (realtime).
initAuth(
  () => { renderAuthArea(); renderBooks(); renderFeedbackTab(); renderProfileTab(); },
  () => { if(document.getElementById('page-feedback').classList.contains('active')) renderComments(); }
).catch(err => {
  console.error('Supabase init failed:', err);
  toast('Could not connect — check js/supabase-config.js', 'error');
});

renderBooks(); // initial paint before auth resolves (no progress tags yet)

// First-time visitor: gently invite them to the tour
if(!localStorage.getItem('jd_seen_tour')){
  localStorage.setItem('jd_seen_tour', '1');
  setTimeout(() => { toast('New here? Tap the ? button for a quick tour'); }, 1200);
}

