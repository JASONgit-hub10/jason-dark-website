/* =========================================================================
   JASON DARK — PROFILE SYSTEM (Supabase-backed, shared across everyone)
   -------------------------------------------------------------------------
   Profiles, comments, replies, likes and reading progress now live in your
   free Supabase project's database — so they're visible to every visitor,
   on every device, not just one browser.

   Supabase's own password auth needs an email address, but you asked for
   "just a name and password, no email". So under the hood, each name is
   turned into a private, never-shown placeholder address
   (e.g. "jason123" → "jason123@users.jasondark.app") purely so Supabase
   has something email-shaped to store. Nobody sees this and no email is
   ever sent — it's just plumbing.

   Every function below keeps the exact same name it had in the old
   browser-only version, so app.js and index.html didn't need to change.
   ========================================================================= */

const FAKE_EMAIL_DOMAIN = 'jasondark.app';

function cleanAuthError(error){
  const message = (error && error.message) || 'Could not create profile.';
  const lower = message.toLowerCase();

  if(lower.includes('email rate limit') || lower.includes('rate limit')){
    return 'Profile signup is blocked because Supabase email confirmations are still enabled. In Supabase, go to Authentication > Providers > Email and turn off Confirm email, then try again.';
  }

  if(lower.includes('confirm') || lower.includes('email confirmation') || lower.includes('verify') || lower.includes('verification')){
    return 'Supabase requires email confirmation for this project. Disable Email Confirmations in Supabase Authentication settings, then try signing up again.';
  }

  if(lower.includes('already registered')){
    return 'That name is already taken.';
  }

  return message;
}

function slugify(name){
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}
function nameToEmail(name){
  const slug = slugify(name);
  return `${slug}@${FAKE_EMAIL_DOMAIN}`;
}

// ---- local caches (kept in sync with Supabase so the rest of the app
//      can read them instantly/synchronously, like before) ----------------
let _cachedUser = null;      // { id, name, avatar }
let _commentsCache = [];     // fully-joined comment list
let _progressCache = new Set(); // book ids the current user has opened
let _onAuthChange = () => {};
let _onCommentsChange = () => {};

function currentUser(){ return _cachedUser; }
function getComments(){ return _commentsCache; }
function hasOpenedBook(bookId){ return _progressCache.has(bookId); }

// ---- boot: restore session, listen for changes, load the public feed -----
async function initAuth(onAuthChange, onCommentsChange){
  _onAuthChange = onAuthChange || (() => {});
  _onCommentsChange = onCommentsChange || (() => {});

  const { data: { session } } = await sb.auth.getSession();
  if(session) await loadProfileIntoCache(session.user.id);

  sb.auth.onAuthStateChange(async (_event, session) => {
    if(session) await loadProfileIntoCache(session.user.id);
    else { _cachedUser = null; _progressCache = new Set(); }
    _onAuthChange();
  });

  await refreshComments();

  // live updates: whenever anyone posts/likes/replies, refresh the feed
  const feedbackChannel = sb.channel('public:feedback')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, refreshComments)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, refreshComments)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, refreshComments);

  function setRealtimeStatus(status){
    const statusEl = document.getElementById('realtimeStatus');
    if(!statusEl) return;
    statusEl.dataset.status = status;
    if(status === 'connected'){
      statusEl.textContent = 'Realtime: connected';
    } else if(status === 'disconnected'){
      statusEl.textContent = 'Realtime: disconnected';
    } else {
      statusEl.textContent = 'Realtime: connecting...';
    }
  }

  // subscribe and log realtime status for easier debugging when feeds don't update
  try{
    const sub = feedbackChannel.subscribe();
    console.log('Realtime: subscribed to public:feedback', feedbackChannel, sub);
    setRealtimeStatus('connected');
    try{ toast('Realtime connected — comments will sync automatically', 'success'); }catch(e){}
  } catch(e){
    console.warn('Realtime subscription failed to start', e);
    setRealtimeStatus('disconnected');
    try{ toast('Realtime subscription failed — comments may not update', 'error'); }catch(e){}
  }

  _onAuthChange();
}

async function loadProfileIntoCache(userId){
  const { data: profile, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if(error || !profile){
    // If the auth user exists but the app profile row is missing,
    // try to recreate it from the placeholder email.
    if(!error && !profile){
      const { data: { session } } = await sb.auth.getSession();
      const email = session?.user?.email;
      if(email && email.endsWith(`@${FAKE_EMAIL_DOMAIN}`)){
        const slug = email.split('@')[0];
        const name = slug.replace(/(^|\s)[a-z]/g, m => m.toUpperCase());
        const avatar = 'assets/icons/default-avatar.svg';
        const { error: insertError } = await sb.from('profiles').insert({ id: userId, name, slug, avatar });
        if(!insertError){
          _cachedUser = { id: userId, name, avatar };
          await loadProgressIntoCache(userId);
          return;
        }
        console.warn('Could not recreate missing profile row:', insertError);
      }
    }
    _cachedUser = null;
    return;
  }
  _cachedUser = { id: profile.id, name: profile.name, avatar: profile.avatar };
  await loadProgressIntoCache(userId);
}

async function loadProgressIntoCache(userId){
  const { data } = await sb.from('reading_progress').select('book_id').eq('user_id', userId);
  _progressCache = new Set((data || []).map(r => r.book_id));
}

// ---- avatar upload --------------------------------------------------------
async function uploadAvatar(userId, dataUrl){
  // dataUrl -> blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split('/')[1] || 'png';
  const path = `${userId}/logo.${ext}`;
  const { error } = await sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: blob.type });
  if(error) throw error;
  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// ---- sign up / sign in / sign out -----------------------------------------
async function signUp(name, password, avatarDataUrl){
  name = name.trim();
  if(name.length < 2) throw new Error('Name must be at least 2 characters.');
  if(password.length < 6) throw new Error('Password must be at least 6 characters.');
  const slug = slugify(name);
  if(!slug) throw new Error('Please use a name with letters or numbers.');

  const { data: existing } = await sb.from('profiles').select('id').eq('slug', slug).maybeSingle();
  if(existing) throw new Error('That name is already taken.');

  const { data: signUpData, error: signUpError } = await sb.auth.signUp({
    email: nameToEmail(name),
    password
  });
  if(signUpError) throw new Error(cleanAuthError(signUpError));

  const { data: { session } } = await sb.auth.getSession();
  if(!session){
    throw new Error('Signup succeeded but did not create an active session. In Supabase, disable Email Confirmations so the app can create your profile automatically.');
  }

  const userId = session.user.id;
  let avatar = 'assets/icons/default-avatar.svg';
  if(avatarDataUrl){
    try{ avatar = await uploadAvatar(userId, avatarDataUrl); }
    catch(e){ console.warn('Avatar upload failed, using default.', e); }
  }

  const { error: profileError } = await sb.from('profiles').insert({ id: userId, name, slug, avatar });
  if(profileError) throw new Error(profileError.message);

  _cachedUser = { id: userId, name, avatar };
  _progressCache = new Set();
  return _cachedUser;
}

async function signIn(name, password){
  const { error } = await sb.auth.signInWithPassword({ email: nameToEmail(name), password });
  if(error) throw new Error('Incorrect name or password.');
  const { data: { session } } = await sb.auth.getSession();
  await loadProfileIntoCache(session.user.id);
  return _cachedUser;
}

async function signOut(){
  await sb.auth.signOut();
  _cachedUser = null;
  _progressCache = new Set();
}

// ---- comments / replies / likes -------------------------------------------
async function refreshComments(){
  console.log('Refreshing comments...');
  const { data: commentRows, error: commentError } = await sb
    .from('comments')
    .select('id, text, created_at, author_id, likes(user_id), replies(id, text, created_at, author_id)')
    .order('created_at', { ascending: false })
    .order('created_at', { foreignTable: 'replies', ascending: true });

  if(commentError){
    console.error('Comments refresh failed:', commentError);
    try{ toast('Comments failed to load or sync — check your connection', 'error'); }catch(e){}
    return;
  }

  const authorIds = [
    ...new Set(
      (commentRows || []).flatMap(c => [c.author_id, ...(c.replies || []).map(r => r.author_id)])
    )
  ].filter(Boolean);

  const { data: profileRows, error: profileError } = authorIds.length > 0
    ? await sb.from('profiles').select('id, name, avatar').in('id', authorIds)
    : { data: [], error: null };

  if(profileError){
    console.error('Profile lookup failed:', profileError);
    try{ toast('Could not resolve comment authors — some names may be missing', 'error'); }catch(e){}
  }

  const profileMap = new Map((profileRows || []).map(p => [p.id, p]));

  _commentsCache = (commentRows || []).map(c => ({
    id: c.id,
    authorId: c.author_id,
    author: profileMap.get(c.author_id)?.name || 'Unknown',
    avatar: profileMap.get(c.author_id)?.avatar || 'assets/icons/default-avatar.svg',
    text: c.text,
    time: new Date(c.created_at).getTime(),
    likes: (c.likes || []).map(l => l.user_id),
    replies: (c.replies || []).map(r => ({
      id: r.id,
      authorId: r.author_id,
      author: profileMap.get(r.author_id)?.name || 'Unknown',
      avatar: profileMap.get(r.author_id)?.avatar || 'assets/icons/default-avatar.svg',
      text: r.text,
      time: new Date(r.created_at).getTime()
    }))
  }));
  _onCommentsChange();
  console.log('Comments loaded:', _commentsCache.length);
}

async function addComment(text){
  const user = currentUser();
  if(!user) throw new Error('Sign in first.');
  const { data, error } = await sb.from('comments').insert({ author_id: user.id, text });
  if(error){
    console.error('addComment error:', error);
    try{ toast('Could not post comment — ' + (error.message || 'server error'), 'error'); }catch(e){}
    throw new Error(error.message || 'Could not post comment.');
  }
  await refreshComments();
}

async function addReply(commentId, text){
  const user = currentUser();
  if(!user) throw new Error('Sign in first.');
  const { data, error } = await sb.from('replies').insert({ comment_id: commentId, author_id: user.id, text });
  if(error){
    console.error('addReply error:', error);
    try{ toast('Could not post reply — ' + (error.message || 'server error'), 'error'); }catch(e){}
    throw new Error(error.message || 'Could not post reply.');
  }
  await refreshComments();
}

async function toggleLike(commentId){
  const user = currentUser();
  if(!user) throw new Error('Sign in first.');
  const comment = _commentsCache.find(c => c.id === commentId);
  const alreadyLiked = comment && comment.likes.includes(user.id);
  if(alreadyLiked){
    const { data, error } = await sb.from('likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
    if(error){ console.error('toggleLike (delete) error:', error); try{ toast('Could not unlike — ' + (error.message || 'server error'), 'error'); }catch(e){}; throw new Error(error.message || 'Could not unlike.'); }
  } else {
    const { data, error } = await sb.from('likes').insert({ comment_id: commentId, user_id: user.id });
    if(error){ console.error('toggleLike (insert) error:', error); try{ toast('Could not like — ' + (error.message || 'server error'), 'error'); }catch(e){}; throw new Error(error.message || 'Could not like.'); }
  }
  await refreshComments();
}

// ---- reading progress -----------------------------------------------------
async function markBookOpened(bookId){
  const user = currentUser();
  if(!user) return;
  _progressCache.add(bookId);
  const { error } = await sb.from('reading_progress').upsert({ user_id: user.id, book_id: bookId });
  if(error) console.error(error);
}
