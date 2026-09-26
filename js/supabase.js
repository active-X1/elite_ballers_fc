/* Elite Ballers FC — Supabase browser client */
(function () {
  const cfg = window.EB_SUPABASE_CONFIG || {};
  const url = String(cfg.url || '').trim();
  const key = String(cfg.publishableKey || cfg.anonKey || '').trim();

  if (!url || !key) {
    console.warn('[Elite Ballers] Supabase is not configured.');
    window.SB = null;
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Elite Ballers] Supabase JS library was not loaded.');
    window.SB = null;
    return;
  }

  const client = window.supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const getUser = async () => {
    const { data, error } = await client.auth.getUser();
    return error ? null : (data?.user || null);
  };

  const getSession = async () => {
    const { data, error } = await client.auth.getSession();
    return error ? null : (data?.session || null);
  };

  const isAdmin = async () => {
    const user = await getUser();
    if (!user) return false;
    const { data, error } = await client
      .from('profiles')
      .select('id,role,full_name')
      .eq('id', user.id)
      .maybeSingle();
    return !error && data?.role === 'admin';
  };

  const requireAdmin = async (redirect = 'login.html') => {
    const ok = await isAdmin();
    if (!ok) {
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = `${redirect}?next=${next}`;
      return false;
    }
    return true;
  };

  const signIn = (email, password) => client.auth.signInWithPassword({ email, password });
  const signOut = () => client.auth.signOut();
  const updatePassword = password => client.auth.updateUser({ password });
  const resetPassword = email => client.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}${location.pathname.replace(/\/admin\/login\.html$/, '')}/admin/login.html`
  });

  async function fetchAll(table, options = {}) {
    let query = client.from(table).select(options.select || '*');

    if (options.filters) {
      for (const [column, value] of Object.entries(options.filters)) {
        if (Array.isArray(value)) query = query.in(column, value);
        else if (value === null) query = query.is(column, null);
        else query = query.eq(column, value);
      }
    }
    if (options.gte) query = query.gte(options.gte.column, options.gte.value);
    if (options.lte) query = query.lte(options.lte.column, options.lte.value);
    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending !== false,
        nullsFirst: false
      });
    }
    if (Number.isInteger(options.limit)) query = query.limit(options.limit);
    return query;
  }

  const insert = (table, row) => client.from(table).insert(row).select().single();
  const update = (table, id, row) => client.from(table).update(row).eq('id', id).select().single();
  const upsert = (table, row, onConflict) => client.from(table).upsert(
    row,
    onConflict ? { onConflict } : undefined
  ).select().single();
  const remove = (table, id) => client.from(table).delete().eq('id', id);
  const upload = (bucket, path, file, options = {}) => client.storage.from(bucket).upload(path, file, {
    upsert: Boolean(options.upsert),
    contentType: options.contentType || file?.type || undefined,
    cacheControl: options.cacheControl || '3600'
  });
  const removeStorage = (bucket, paths) => client.storage.from(bucket).remove(
    Array.isArray(paths) ? paths : [paths]
  );
  const publicUrl = (bucket, path) => client.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  window.SB = {
    client, getUser, getSession, isAdmin, requireAdmin,
    signIn, signOut, updatePassword, resetPassword,
    fetchAll, insert, update, upsert, remove,
    upload, removeStorage, publicUrl
  };
})();
