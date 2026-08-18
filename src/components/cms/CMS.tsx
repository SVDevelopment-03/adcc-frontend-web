import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Edit, GripVertical, LayoutGrid, FileText, Globe, ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export interface ContentSetting {
  _id: string;
  group: string;
  key: string;
  label: string;
  title?: string;
  description?: string;
  image?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface GetContentSettingsParams {
  group?: string;
  key?: string;
  active?: boolean;
}

type UpdateContentSettingPayload = Partial<
  Pick<ContentSetting, 'title' | 'description' | 'image' | 'active'>
> & {
  imageFile?: File;
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    return typeof message === 'string' ? message : fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

const normalizeContentSettings = (rawResponse: unknown): ContentSetting[] => {
  if (!rawResponse || typeof rawResponse !== 'object') return [];

  const response = rawResponse as Record<string, unknown>;
  const payload = (response.data as Record<string, unknown> | undefined) ?? response;
  const candidates =
    (payload.settings as unknown[]) ??
    (payload.items as unknown[]) ??
    (response.settings as unknown[]) ??
    [];

  if (!Array.isArray(candidates)) return [];

  return candidates
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      _id: String(item._id ?? item.id ?? item.key ?? ''),
      group: String(item.group ?? ''),
      key: String(item.key ?? ''),
      label: String(item.label ?? ''),
      title: typeof item.title === 'string' ? item.title : undefined,
      description: typeof item.description === 'string' ? item.description : undefined,
      image: typeof item.image === 'string' ? item.image : undefined,
      active: typeof item.active === 'boolean' ? item.active : undefined,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
    }))
    .filter((item) => item.group && item.key && item.label);
};

export const getContentSettings = async (
  params: GetContentSettingsParams
): Promise<ContentSetting[]> => {
  try {
    const response = await api.get('/v1/settings/content/list', {
      params: {
        group: params.group,
        key: params.key,
        active: params.active === undefined ? undefined : String(params.active),
      },
    });
    return normalizeContentSettings(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load content settings'));
  }
};

export const updateContentSetting = async (
  key: string,
  payload: UpdateContentSettingPayload
): Promise<void> => {
  try {
    const formData = new FormData();

    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    } else if (payload.image !== undefined) {
      formData.append('image', payload.image);
    }
    if (payload.active !== undefined) formData.append('active', String(payload.active));

    await api.patch(`/v1/settings/content/${key}`, formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update content setting'));
  }
};

export const deleteContentSetting = async (key: string): Promise<void> => {
  try {
    if (!key) throw new Error('Content key is required');
    await api.delete(`/v1/settings/content/${key}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete content setting'));
  }
};

const createContentSettingWithImage = async (params: {
  group: string;
  key: string;
  label: string;
  title: string;
  imageFile?: File;
}): Promise<void> => {
  const formData = new FormData();
  formData.append('group', params.group);
  formData.append('key', params.key);
  formData.append('label', params.label);
  formData.append('title', params.title);
  if (params.imageFile) formData.append('image', params.imageFile);
  await api.post('/v1/settings/content', formData);
};

const mapBannerItem = (item: Record<string, unknown>, fallbackGroup: string): ContentSetting => ({
  _id: String(item._id ?? item.id ?? item.key ?? ''),
  group: String(item.group ?? fallbackGroup),
  key: String(item.key ?? ''),
  label: String(item.label ?? ''),
  title: typeof item.title === 'string' ? item.title : undefined,
  description: typeof item.description === 'string' ? item.description : undefined,
  image: typeof item.image === 'string' ? item.image : undefined,
  active: typeof item.active === 'boolean' ? item.active : undefined,
  createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
  updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
});

export const getAppBanners = async (active?: boolean): Promise<ContentSetting[]> => {
  try {
    const response = await api.get('/v1/app-banners', {
      params: active === undefined ? {} : { active: String(active) },
    });

    const payload = (response.data as any)?.data ?? response.data;
    const banners = Array.isArray(payload?.banners) ? payload.banners : [];

    return banners
      .filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => mapBannerItem(item, 'app_banner'))
      .filter((item) => item.group && item.key && item.label);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load app banners'));
  }
};

export const createAppBanner = async (params: {
  key?: string;
  label?: string;
  title?: string;
  description?: string;
  active?: boolean;
  imageFile?: File;
}): Promise<void> => {
  try {
    const formData = new FormData();
    if (params.key) formData.append('key', params.key);
    if (params.label) formData.append('label', params.label);
    if (params.title) formData.append('title', params.title);
    if (params.description !== undefined) formData.append('description', params.description);
    if (params.active !== undefined) formData.append('active', String(params.active));
    if (params.imageFile) formData.append('image', params.imageFile);
    await api.post('/v1/app-banners', formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create app banner'));
  }
};

export const updateAppBanner = async (
  key: string,
  payload: Partial<Pick<ContentSetting, 'title' | 'description' | 'active'>> & { imageFile?: File }
): Promise<void> => {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.active !== undefined) formData.append('active', String(payload.active));
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }
    await api.patch(`/v1/app-banners/${encodeURIComponent(key)}`, formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update app banner'));
  }
};

export const deleteAppBanner = async (key: string): Promise<void> => {
  try {
    if (!key) throw new Error('Banner key is required');
    await api.delete(`/v1/app-banners/${encodeURIComponent(key)}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete app banner'));
  }
};

// ─── App Banner (Arabic) — same shape as the English app banner, separate group ───
export const getAppBannersAr = async (active?: boolean): Promise<ContentSetting[]> => {
  try {
    const response = await api.get('/v1/app-banners-ar', {
      params: active === undefined ? {} : { active: String(active) },
    });

    const payload = (response.data as any)?.data ?? response.data;
    const banners = Array.isArray(payload?.banners) ? payload.banners : [];

    return banners
      .filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => mapBannerItem(item, 'app_banner_ar'))
      .filter((item) => item.group && item.key && item.label);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load Arabic app banners'));
  }
};

export const createAppBannerAr = async (params: {
  key?: string;
  label?: string;
  title?: string;
  active?: boolean;
  imageFile?: File;
}): Promise<void> => {
  try {
    const formData = new FormData();
    if (params.key) formData.append('key', params.key);
    if (params.label) formData.append('label', params.label);
    if (params.title) formData.append('title', params.title);
    if (params.active !== undefined) formData.append('active', String(params.active));
    if (params.imageFile) formData.append('image', params.imageFile);
    await api.post('/v1/app-banners-ar', formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create Arabic app banner'));
  }
};

export const updateAppBannerAr = async (
  key: string,
  payload: Partial<Pick<ContentSetting, 'title' | 'active'>> & { imageFile?: File }
): Promise<void> => {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.active !== undefined) formData.append('active', String(payload.active));
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }
    await api.patch(`/v1/app-banners-ar/${encodeURIComponent(key)}`, formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update Arabic app banner'));
  }
};

export const deleteAppBannerAr = async (key: string): Promise<void> => {
  try {
    if (!key) throw new Error('Banner key is required');
    await api.delete(`/v1/app-banners-ar/${encodeURIComponent(key)}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete Arabic app banner'));
  }
};

interface ItemFormState {
  title: string;
  description: string;
  image: string;
  active: boolean;
}

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read image file'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

export function CMS() {
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState<ContentSetting[]>([]);
  const [appBannerItems, setAppBannerItems] = useState<ContentSetting[]>([]);
  const [appBannerArItems, setAppBannerArItems] = useState<ContentSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'homepage' | 'static' | 'appBanner' | 'appBannerAr'>('homepage');
  const [bannerFiles, setBannerFiles] = useState<Record<string, File | null>>({});
  const [bannerPreviews, setBannerPreviews] = useState<Record<string, string>>({});
  const [savingBanners, setSavingBanners] = useState<Record<string, boolean>>({});
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
  const [savingNewBanner, setSavingNewBanner] = useState(false);
  const bannerInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [bannerArFiles, setBannerArFiles] = useState<Record<string, File | null>>({});
  const [bannerArPreviews, setBannerArPreviews] = useState<Record<string, string>>({});
  const [savingBannersAr, setSavingBannersAr] = useState<Record<string, boolean>>({});
  const bannerArInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [selectedItem, setSelectedItem] = useState<ContentSetting | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>({
    title: '',
    description: '',
    image: '',
    active: true,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!editImageFile) {
      setEditImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(editImageFile);
    setEditImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [editImageFile]);

  const isHomepageGroup = useCallback((group: string) => {
    const g = String(group || '').toLowerCase();
    return g.includes('home') || g.includes('homepage');
  }, []);

  const isStaticGroup = useCallback((group: string) => {
    const g = String(group || '').toLowerCase();
    return g.includes('static') || g.includes('page') || g.includes('public');
  }, []);

  const homepageItems = useMemo(() => {
    return allItems.filter((item) => isHomepageGroup(item.group));
  }, [allItems, isHomepageGroup]);

  const staticItems = useMemo(() => {
    return allItems.filter((item) => !isHomepageGroup(item.group) && isStaticGroup(item.group));
  }, [allItems, isHomepageGroup, isStaticGroup]);

  const appBannerItemsMemo = useMemo(() => appBannerItems, [appBannerItems]);
  const appBannerArItemsMemo = useMemo(() => appBannerArItems, [appBannerArItems]);

  const handleBannerFileChange = (bannerKey: string, file: File | null) => {
    setBannerFiles((prev) => ({ ...prev, [bannerKey]: file }));
    if (bannerPreviews[bannerKey]) {
      URL.revokeObjectURL(bannerPreviews[bannerKey]);
    }
    if (file) {
      setBannerPreviews((prev) => ({ ...prev, [bannerKey]: URL.createObjectURL(file) }));
    } else {
      setBannerPreviews((prev) => { const next = { ...prev }; delete next[bannerKey]; return next; });
    }
  };

  const handleNewBannerFileChange = (file: File | null) => {
    if (newBannerPreview) {
      URL.revokeObjectURL(newBannerPreview);
    }
    if (file) {
      setNewBannerFile(file);
      setNewBannerPreview(URL.createObjectURL(file));
      return;
    }
    setNewBannerFile(null);
    setNewBannerPreview(null);
  };

  const clearNewBannerUpload = () => {
    if (newBannerPreview) {
      URL.revokeObjectURL(newBannerPreview);
    }
    setNewBannerFile(null);
    setNewBannerPreview(null);
  };

  const handleAddNewBanner = async () => {
    if (!newBannerFile) return;

    setSavingNewBanner(true);
    try {
      await createAppBanner({
        title: `App Banner ${Date.now()}`,
        imageFile: newBannerFile,
      });
      toast.success(t('cms.appBanner.uploadSuccess'));
      clearNewBannerUpload();
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.appBanner.uploadError')));
    } finally {
      setSavingNewBanner(false);
    }
  };

  const handleBannerSave = async (bannerKey: string, bannerLabel: string) => {
    const file = bannerFiles[bannerKey];
    if (!file) return;

    setSavingBanners((prev) => ({ ...prev, [bannerKey]: true }));
    try {
      const existing = appBannerItemsMemo.find((item) => item.key === bannerKey);
      if (existing) {
        await updateAppBanner(bannerKey, { imageFile: file });
      } else {
        await createAppBanner({
          key: bannerKey,
          label: bannerLabel,
          title: bannerLabel,
          imageFile: file,
          active: true,
        });
      }
      toast.success(t('cms.appBanner.uploadSuccess'));
      setBannerFiles((prev) => ({ ...prev, [bannerKey]: null }));
      if (bannerPreviews[bannerKey]) URL.revokeObjectURL(bannerPreviews[bannerKey]);
      setBannerPreviews((prev) => { const next = { ...prev }; delete next[bannerKey]; return next; });
      if (bannerInputRefs.current[bannerKey]) bannerInputRefs.current[bannerKey]!.value = '';
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.appBanner.uploadError')));
    } finally {
      setSavingBanners((prev) => ({ ...prev, [bannerKey]: false }));
    }
  };

  // ─── App Banner (Arabic) handlers — mirror of the English handlers above ───
  const handleBannerArFileChange = (bannerKey: string, file: File | null) => {
    setBannerArFiles((prev) => ({ ...prev, [bannerKey]: file }));
    if (bannerArPreviews[bannerKey]) {
      URL.revokeObjectURL(bannerArPreviews[bannerKey]);
    }
    if (file) {
      setBannerArPreviews((prev) => ({ ...prev, [bannerKey]: URL.createObjectURL(file) }));
    } else {
      setBannerArPreviews((prev) => { const next = { ...prev }; delete next[bannerKey]; return next; });
    }
  };

  const handleBannerArSave = async (bannerKey: string, bannerLabel: string) => {
    const file = bannerArFiles[bannerKey];
    if (!file) return;

    setSavingBannersAr((prev) => ({ ...prev, [bannerKey]: true }));
    try {
      const existing = appBannerArItemsMemo.find((item) => item.key === bannerKey);
      if (existing) {
        await updateAppBannerAr(bannerKey, { imageFile: file });
      } else {
        await createAppBannerAr({
          key: bannerKey,
          label: bannerLabel,
          title: bannerLabel,
          imageFile: file,
          active: true,
        });
      }
      toast.success(t('cms.appBanner.uploadSuccess'));
      setBannerArFiles((prev) => ({ ...prev, [bannerKey]: null }));
      if (bannerArPreviews[bannerKey]) URL.revokeObjectURL(bannerArPreviews[bannerKey]);
      setBannerArPreviews((prev) => { const next = { ...prev }; delete next[bannerKey]; return next; });
      if (bannerArInputRefs.current[bannerKey]) bannerArInputRefs.current[bannerKey]!.value = '';
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.appBanner.uploadError')));
    } finally {
      setSavingBannersAr((prev) => ({ ...prev, [bannerKey]: false }));
    }
  };

  const cmsStats = useMemo(() => {
    const homepageSections = homepageItems.length;
    const activeSections = homepageItems.filter((item) => item.active === true).length;
    const staticPages = staticItems.length;
    const publicPages = staticItems.filter((item) => item.active === true).length;
    return { homepageSections, activeSections, staticPages, publicPages };
  }, [homepageItems, staticItems]);

  const fetchAllGroupsSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [data, bannerData, bannerArData] = await Promise.all([
        getContentSettings({}),
        getAppBanners(),
        getAppBannersAr(),
      ]);
      setAllItems(data);
      setAppBannerItems(bannerData);
      setAppBannerArItems(bannerArData);
    } catch (error) {
      const message = getApiErrorMessage(error, t('cms.toasts.loadError'));
      setErrorMessage(message);
      setAllItems([]);
      setAppBannerItems([]);
      setAppBannerArItems([]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllGroupsSettings();
  }, []);

  const openEditForm = (item: ContentSetting) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      active: item.active ?? true,
    });
    setEditImageFile(null);
    setEditImagePreviewUrl(null);
  };

  const closeEditForm = () => {
    setSelectedItem(null);
    setEditForm({ title: '', description: '', image: '', active: true });
    setEditImageFile(null);
    setEditImagePreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    const patchPayload: UpdateContentSettingPayload = {};

    if ((selectedItem.title ?? '') !== editForm.title) patchPayload.title = editForm.title;
    if ((selectedItem.description ?? '') !== editForm.description) {
      patchPayload.description = editForm.description;
    }
    if (editImageFile) {
      patchPayload.imageFile = editImageFile;
    } else if ((selectedItem.image ?? '') !== editForm.image) {
      patchPayload.image = editForm.image;
    }
    if ((selectedItem.active ?? true) !== editForm.active) patchPayload.active = editForm.active;

    if (Object.keys(patchPayload).length === 0) {
      toast.info(t('cms.toasts.noEditableChanges'));
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateContentSetting(selectedItem.key, patchPayload);
      toast.success(t('cms.toasts.updateSuccess'));
      closeEditForm();
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.saveError')));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (item: ContentSetting) => {
    setTogglingKey(item.key);
    try {
      await updateContentSetting(item.key, { active: !(item.active ?? false) });
      toast.success(t('cms.toasts.updateSuccess'));
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.saveError')));
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDelete = async (item: ContentSetting) => {
    const confirmed = window.confirm(`${t('cms.deleteMessage')}\n(${item.key})`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      if (item.group === 'app_banner') {
        await deleteAppBanner(item.key);
      } else if (item.group === 'app_banner_ar') {
        await deleteAppBannerAr(item.key);
      } else {
        await deleteContentSetting(item.key);
      }
      toast.success(t('cms.toasts.deleteSuccess'));
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.deleteError')));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {t('cms.title')}
          </h1>
          <p style={{ color: '#666' }}>
            {t('cms.subtitle')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: '#C12D32' }}
          />
        </div>
      ) : errorMessage ? (
        <div className="py-8 text-sm" style={{ color: '#C12D32' }}>
          {errorMessage}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
              <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="w-5 h-5" style={{ color: '#C12D32' }} />
                <span className="text-sm" style={{ color: '#666' }}>{t('cms.tiles.homepageSections')}</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>{cmsStats.homepageSections.toLocaleString()}</p>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="w-5 h-5" style={{ color: '#10B981' }} />
                <span className="text-sm" style={{ color: '#666' }}>{t('cms.tiles.activeSections')}</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>{cmsStats.activeSections.toLocaleString()}</p>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <span className="text-sm" style={{ color: '#666' }}>{t('cms.tiles.staticPages')}</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>{cmsStats.staticPages.toLocaleString()}</p>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5" style={{ color: '#F59E0B' }} />
                <span className="text-sm" style={{ color: '#666' }}>{t('cms.tiles.publicPages')}</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>{cmsStats.publicPages.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              {(['homepage', 'static', 'appBanner', 'appBannerAr'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 px-2 text-sm transition-colors"
                  style={{
                    color: activeTab === tab ? '#C12D32' : '#666',
                    borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
                  }}
                >
                  {tab === 'homepage'
                    ? t('cms.tabs.homepageSections')
                    : tab === 'static'
                    ? t('cms.tabs.staticPages')
                    : tab === 'appBanner'
                    ? t('cms.tabs.appBanner')
                    : t('cms.tabs.appBannerAr')}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'appBanner' ? (
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('cms.tabs.appBanner')}</h2>

              <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#E5DDD4' }}>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
                  <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                    {t('cms.appBanner.addNewBanner')}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: '#666' }}>
                    {t('cms.appBanner.uploadBanner')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleNewBannerFileChange(e.target.files?.[0] ?? null)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#E5DDD4' }}
                  />
                </div>

                {newBannerPreview ? (
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#E5DDD4' }}>
                    <img src={newBannerPreview} alt="New banner preview" className="w-full h-32 object-cover" />
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    onClick={handleAddNewBanner}
                    disabled={!newBannerFile || savingNewBanner}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: '#C12D32' }}
                  >
                    <Upload className="w-4 h-4" />
                    {savingNewBanner ? t('cms.saving') : t('cms.appBanner.saveBanner')}
                  </button>
                  <button
                    onClick={clearNewBannerUpload}
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: '#E5DDD4', color: '#333' }}
                  >
                    {t('cms.appBanner.clearSelection')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {appBannerItemsMemo.length === 0 ? (
                  <div className="rounded-xl border p-6 text-center" style={{ borderColor: '#E5DDD4' }}>
                    {t('cms.appBanner.noBanners')}
                  </div>
                ) : (
                  appBannerItemsMemo.map((item) => {
                    const previewUrl = bannerPreviews[item.key] || item.image || '';
                    const selectedFile = bannerFiles[item.key];
                    const isSaving = savingBanners[item.key] ?? false;

                    return (
                      <div key={item.key} className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#E5DDD4' }}>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
                          <div>
                            <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                              {item.label || item.title || item.key}
                            </h3>
                            {item.active === false ? (
                              <span className="text-xs" style={{ color: '#999' }}>
                                {t('cms.appBanner.inactive')}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div
                          className="w-full rounded-lg overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: '#F3EEE7', minHeight: '160px' }}
                        >
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={item.label || item.key}
                              className="w-full object-cover"
                              style={{ maxHeight: '200px' }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-8">
                              <ImageIcon className="w-10 h-10" style={{ color: '#CCC' }} />
                              <span className="text-xs" style={{ color: '#999' }}>
                                {t('cms.appBanner.noBanner')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium" style={{ color: '#666' }}>
                            {t('cms.appBanner.uploadBanner')}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { bannerInputRefs.current[item.key] = el; }}
                            onChange={(e) => handleBannerFileChange(item.key, e.target.files?.[0] ?? null)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            style={{ borderColor: '#E5DDD4' }}
                          />
                        </div>

                        <button
                          onClick={() => handleBannerSave(item.key, item.label || item.key)}
                          disabled={!selectedFile || isSaving}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
                          style={{ backgroundColor: '#C12D32' }}
                        >
                          <Upload className="w-4 h-4" />
                          {isSaving ? t('cms.saving') : t('cms.appBanner.saveBanner')}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-200 text-red-600 disabled:opacity-50 transition-opacity"
                          style={{ backgroundColor: '#FFF5F5' }}
                        >
                          {t('cms.delete', 'Delete')}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : activeTab === 'appBannerAr' ? (
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-1" style={{ color: '#333' }}>{t('cms.tabs.appBannerAr')}</h2>
              <p className="text-sm mb-6" style={{ color: '#666' }}>{t('cms.appBanner.arHint')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appBannerItemsMemo.length === 0 ? (
                  <div className="rounded-xl border p-6 text-center" style={{ borderColor: '#E5DDD4' }}>
                    {t('cms.appBanner.noBanners')}
                  </div>
                ) : (
                  appBannerItemsMemo.map((englishItem) => {
                    const arItem = appBannerArItemsMemo.find((ar) => ar.key === englishItem.key);
                    const previewUrl = bannerArPreviews[englishItem.key] || arItem?.image || '';
                    const selectedFile = bannerArFiles[englishItem.key];
                    const isSaving = savingBannersAr[englishItem.key] ?? false;

                    return (
                      <div key={englishItem.key} className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#E5DDD4' }}>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
                          <div>
                            <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                              {englishItem.label || englishItem.title || englishItem.key}
                            </h3>
                            {!arItem ? (
                              <span className="text-xs" style={{ color: '#999' }}>
                                {t('cms.appBanner.noArabicVersion')}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div
                          className="w-full rounded-lg overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: '#F3EEE7', minHeight: '160px' }}
                        >
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={englishItem.label || englishItem.key}
                              className="w-full object-cover"
                              style={{ maxHeight: '200px' }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-8">
                              <ImageIcon className="w-10 h-10" style={{ color: '#CCC' }} />
                              <span className="text-xs" style={{ color: '#999' }}>
                                {t('cms.appBanner.noBanner')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium" style={{ color: '#666' }}>
                            {t('cms.appBanner.uploadBanner')}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { bannerArInputRefs.current[englishItem.key] = el; }}
                            onChange={(e) => handleBannerArFileChange(englishItem.key, e.target.files?.[0] ?? null)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            style={{ borderColor: '#E5DDD4' }}
                          />
                        </div>

                        <button
                          onClick={() => handleBannerArSave(englishItem.key, englishItem.label || englishItem.key)}
                          disabled={!selectedFile || isSaving}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-opacity"
                          style={{ backgroundColor: '#C12D32' }}
                        >
                          <Upload className="w-4 h-4" />
                          {isSaving ? t('cms.saving') : t('cms.appBanner.saveBanner')}
                        </button>
                        {arItem ? (
                          <button
                            onClick={() => handleDelete(arItem)}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-200 text-red-600 disabled:opacity-50 transition-opacity"
                            style={{ backgroundColor: '#FFF5F5' }}
                          >
                            {t('cms.delete', 'Delete')}
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : activeTab === 'homepage' ? (
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('cms.tabs.homepageSections')}</h2>
              {homepageItems.length === 0 ? (
                <div className="py-6 text-sm" style={{ color: '#666' }}>{t('cms.noSectionItems')}</div>
              ) : (
                <div className="space-y-3">
                  {homepageItems.map((item, idx) => (
                    <div
                      key={item._id || item.key}
                      className="p-4 rounded-xl flex items-center gap-4"
                      style={{ backgroundColor: '#F3EEE7' }}
                    >
                      <div className="flex items-center gap-3 min-w-[56px]">
                        <GripVertical className="w-5 h-5" style={{ color: '#999' }} />
                        <div className="text-sm font-medium" style={{ color: '#C12D32' }}>
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm mb-1" style={{ color: '#333' }}>
                          {item.label || item.title}
                        </div>
                        <div className="text-xs mb-1" style={{ color: '#666' }}>
                          {item.updatedAt ? `${t('cms.lastModified', 'Last modified')}: ${new Date(item.updatedAt).toLocaleString()}` : (item.description || item.label)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingKey === item.key}
                        className="px-3 py-1 rounded-full text-xs text-white disabled:opacity-60"
                        style={{ backgroundColor: item.active ? '#10B981' : '#8A8A8A' }}
                      >
                        {togglingKey === item.key
                          ? t('cms.saving')
                          : item.active
                            ? t('cms.active')
                            : t('cms.inactive')}
                      </button>
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        aria-label={`Edit ${item.key}`}
                      >
                        <Edit className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('cms.tabs.staticPages')}</h2>
              {staticItems.length === 0 ? (
                <div className="py-6 text-sm" style={{ color: '#666' }}>{t('cms.noSectionItems')}</div>
              ) : (
                <div className="space-y-3">
                  {staticItems.map((item) => (
                    <div
                      key={item._id || item.key}
                      className="p-4 rounded-xl flex items-center gap-4"
                      style={{ backgroundColor: '#F3EEE7' }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5" style={{ color: '#999' }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm mb-1" style={{ color: '#333' }}>
                          {item.label || item.title}
                        </div>
                        <div className="text-xs mb-1" style={{ color: '#666' }}>
                          {item.description || item.key}
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingKey === item.key}
                        className="px-3 py-1 rounded-full text-xs text-white disabled:opacity-60"
                        style={{ backgroundColor: item.active ? '#10B981' : '#8A8A8A' }}
                      >
                        {togglingKey === item.key
                          ? t('cms.saving')
                          : item.active
                            ? t('cms.active')
                            : t('cms.inactive')}
                      </button>
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        aria-label={`Edit ${item.key}`}
                      >
                        <Edit className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0  z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl h-screen overflow-auto rounded-2xl  bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg" style={{ color: '#333' }}>
                {t('cms.editSection')}: {selectedItem.label || selectedItem.key || selectedItem.title}
              </h3>
              <button onClick={closeEditForm} className="text-sm" style={{ color: '#666' }}>
                {t('cms.cancel')}
              </button>
            </div>
        

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Group
                </label>
                <input
                  value={selectedItem.group}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="group-readonly"
                />
              </div> */}
              {/* <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Key
                </label>
                <input
                  value={selectedItem.key}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="key-readonly"
                />
              </div> */}
              {/* <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Label
                </label>
                <input
                  value={selectedItem.label}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="label-readonly"
                />
              </div> */}

              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.fields.title')}
                </label>
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder={t('cms.fields.titlePlaceholder')}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.imagePreview')}
                </label>
                <div className="w-full border rounded-lg p-2" style={{ backgroundColor: '#FAF7F2' }}>
                  <img
                    src={editImagePreviewUrl || selectedItem?.image || ''}
                    alt=""
                    className="w-full h-40 object-cover rounded-md"
                    style={{ display: selectedItem?.image || editImagePreviewUrl ? 'block' : 'none' }}
                  />
                  {!selectedItem?.image && !editImagePreviewUrl ? (
                    <div className="text-xs" style={{ color: '#999' }}>
                      {t('cms.imageNotAvailable')}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.uploadImage')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setEditImageFile(file);
                  }}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                />
                {editImageFile ? (
                  <p className="text-xs" style={{ color: '#666' }}>
                    {t('cms.selectedFile')}: {editImageFile.name}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.fields.description')}
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder={t('cms.fields.descriptionPlaceholder')}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                  />
                  {t('cms.active')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditForm}
                className="px-4 py-2 rounded-lg border"
                style={{ color: '#666' }}
              >
                {t('cms.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: '#C12D32' }}
              >
                {isSavingEdit ? t('cms.saving') : t('cms.update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
