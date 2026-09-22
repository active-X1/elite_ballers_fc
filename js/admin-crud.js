// Generic admin CRUD helpers using window.SB (Supabase helper)
// Each admin page initializes by calling the appropriate init function below.

const AdminCRUD = (function () {
  async function loadList(table, renderFn) {
    if (!window.SB) return;
    const { data, error } = await window.SB.fetchAll(table);
    if (error) {
      console.error('Load error', error);
      return [];
    }
    if (typeof renderFn === 'function') renderFn(data || []);
    return data || [];
  }

  async function addItem(table, payload) {
    if (!window.SB) return { error: 'Supabase not loaded' };
    const { data, error } = await window.SB.insert(table, payload);
    return { data, error };
  }

  async function deleteItem(table, id) {
    if (!window.SB) return { error: 'Supabase not loaded' };
    const { data, error } = await window.SB.client.from(table).delete().eq('id', id);
    return { data, error };
  }

  async function updateItem(table, id, payload) {
    if (!window.SB) return { error: 'Supabase not loaded' };
    const { data, error } = await window.SB.client.from(table).update(payload).eq('id', id);
    return { data, error };
  }

  function csvDownload(filename, rows) {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return { loadList, addItem, deleteItem, updateItem, csvDownload };
})();

export default AdminCRUD;
