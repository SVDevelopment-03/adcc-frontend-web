import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import {
  createRedirect,
  deleteRedirect,
  listRedirects,
  updateRedirect,
  type Redirect,
  type RedirectInput,
} from '../../services/siteRouting';
import { getPagesErrorMessage } from '../../services/pagesApi';
import { useSiteRouting } from '../../contexts/SiteRoutingContext';
import { Field, inputClass, inputStyle } from './PageFields';

const EMPTY: RedirectInput = { from: '', to: '', enabled: true, note: '' };

/** Pages → Redirects: send visitors from one URL to another. */
export function RedirectsManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refresh: refreshRouting } = useSiteRouting();
  const [redirects, setRedirects] = useState<Redirect[] | null>(null);
  const [form, setForm] = useState<RedirectInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    listRedirects()
      .then(setRedirects)
      .catch((error) => {
        setRedirects([]);
        toast.error(getPagesErrorMessage(error, t('pages.redirects.loadError')));
      });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.from.trim() || !form.to.trim()) {
      toast.error(t('pages.redirects.required'));
      return;
    }
    setSaving(true);
    try {
      if (editingId) await updateRedirect(editingId, form);
      else await createRedirect(form);
      toast.success(t('pages.redirects.saved'));
      resetForm();
      await Promise.all([load(), refreshRouting()]);
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.redirects.saveError')));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (redirect: Redirect) => {
    try {
      await updateRedirect(redirect._id, {
        from: redirect.from,
        to: redirect.to,
        note: redirect.note,
        enabled: !redirect.enabled,
      });
      await Promise.all([load(), refreshRouting()]);
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.redirects.saveError')));
    }
  };

  const remove = async (redirect: Redirect) => {
    if (!window.confirm(t('pages.redirects.confirmDelete', { from: redirect.from }))) return;
    try {
      await deleteRedirect(redirect._id);
      if (editingId === redirect._id) resetForm();
      toast.success(t('pages.redirects.deleted'));
      await Promise.all([load(), refreshRouting()]);
    } catch (error) {
      toast.error(getPagesErrorMessage(error, t('pages.redirects.saveError')));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/pages')}
          className="mb-3 flex items-center gap-2 text-sm"
          style={{ color: '#666' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('pages.backToPages')}
        </button>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('pages.redirects.title')}
        </h1>
        <p style={{ color: '#666' }}>{t('pages.redirects.subtitle')}</p>
      </div>

      <div className="rounded-2xl shadow-sm bg-white p-6 space-y-4">
        <h2 className="text-xl" style={{ color: '#333' }}>
          {editingId ? t('pages.redirects.editTitle') : t('pages.redirects.addTitle')}
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <Field label={t('pages.redirects.from')} hint={t('pages.redirects.fromHint')}>
            <input
              className={inputClass}
              style={inputStyle}
              dir="ltr"
              value={form.from}
              placeholder="/old-page"
              maxLength={300}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />
          </Field>
          <ArrowRight className="hidden md:block mt-8 w-5 h-5" style={{ color: '#999' }} />
          <Field label={t('pages.redirects.to')} hint={t('pages.redirects.toHint')}>
            <input
              className={inputClass}
              style={inputStyle}
              dir="ltr"
              value={form.to}
              placeholder="/new-page"
              maxLength={1000}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            />
          </Field>
        </div>
        <Field label={t('pages.redirects.note')}>
          <input
            className={inputClass}
            style={inputStyle}
            value={form.note}
            maxLength={300}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm" style={{ color: '#333' }}>
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          {t('pages.redirects.enabled')}
        </label>
        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
              style={inputStyle}
            >
              <X className="w-4 h-4" />
              {t('pages.redirects.cancelEdit')}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#C12D32' }}
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {saving ? t('pages.banner.saving') : editingId ? t('pages.sections.save') : t('pages.redirects.add')}
          </button>
        </div>
        <p className="text-xs" style={{ color: '#999' }}>
          {t('pages.redirects.note2')}
        </p>
      </div>

      <div className="rounded-2xl shadow-sm bg-white overflow-hidden">
        {!redirects ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : redirects.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: '#999' }}>
            {t('pages.redirects.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ backgroundColor: '#F7F3EE', color: '#666' }}>
                  <th className="px-4 py-3 font-medium">{t('pages.redirects.from')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.redirects.to')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.redirects.note')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.redirects.status')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {redirects.map((redirect) => (
                  <tr key={redirect._id} className="border-t" style={{ borderColor: '#F0EAE3' }}>
                    <td className="px-4 py-3 font-mono" dir="ltr">
                      {redirect.from}
                    </td>
                    <td className="px-4 py-3 font-mono break-all" dir="ltr">
                      {redirect.to}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>
                      {redirect.note}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(redirect)}
                        className="rounded-full px-3 py-1 text-xs"
                        style={
                          redirect.enabled
                            ? { backgroundColor: '#ECFDF5', color: '#166534' }
                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                        }
                        title={t('pages.redirects.toggleHint')}
                      >
                        {redirect.enabled ? t('pages.redirects.active') : t('pages.redirects.off')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(redirect._id);
                            setForm({ from: redirect.from, to: redirect.to, note: redirect.note, enabled: redirect.enabled });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 rounded-lg border"
                          style={inputStyle}
                          aria-label={t('pages.redirects.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(redirect)}
                          className="p-1.5 rounded-lg border"
                          style={{ ...inputStyle, color: '#C12D32' }}
                          aria-label={t('pages.redirects.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
