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
  targetScreen?: string;
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
      targetScreen: typeof item.targetScreen === 'string' ? item.targetScreen : undefined,
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
  targetScreen: typeof item.targetScreen === 'string' ? item.targetScreen : undefined,
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
  targetScreen?: string;
  active?: boolean;
  imageFile?: File;
}): Promise<void> => {
  try {
    const formData = new FormData();
    if (params.key) formData.append('key', params.key);
    if (params.label) formData.append('label', params.label);
    if (params.title) formData.append('title', params.title);
    if (params.description !== undefined) formData.append('description', params.description);
    if (params.targetScreen !== undefined) formData.append('targetScreen', params.targetScreen);
    if (params.active !== undefined) formData.append('active', String(params.active));
    if (params.imageFile) formData.append('image', params.imageFile);
    await api.post('/v1/app-banners', formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create app banner'));
  }
};

export const updateAppBanner = async (
  key: string,
  payload: Partial<Pick<ContentSetting, 'title' | 'description' | 'targetScreen' | 'active'>> & { imageFile?: File }
): Promise<void> => {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.targetScreen !== undefined) formData.append('targetScreen', payload.targetScreen);
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
  targetScreen?: string;
  active?: boolean;
  imageFile?: File;
}): Promise<void> => {
  try {
    const formData = new FormData();
    if (params.key) formData.append('key', params.key);
    if (params.label) formData.append('label', params.label);
    if (params.title) formData.append('title', params.title);
    if (params.targetScreen !== undefined) formData.append('targetScreen', params.targetScreen);
    if (params.active !== undefined) formData.append('active', String(params.active));
    if (params.imageFile) formData.append('image', params.imageFile);
    await api.post('/v1/app-banners-ar', formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create Arabic app banner'));
  }
};

export const updateAppBannerAr = async (
  key: string,
  payload: Partial<Pick<ContentSetting, 'title' | 'targetScreen' | 'active'>> & { imageFile?: File }
): Promise<void> => {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.targetScreen !== undefined) formData.append('targetScreen', payload.targetScreen);
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
  const [splashItems, setSplashItems] = useState<ContentSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'homepage' | 'static' | 'appBanner' | 'appBannerAr' | 'splash'>('homepage');
  const [bannerFiles, setBannerFiles] = useState<Record<string, File | null>>({});
  const [bannerPreviews, setBannerPreviews] = useState<Record<string, string>>({});
  const [savingBanners, setSavingBanners] = useState<Record<string, boolean>>({});
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
  const [newBannerTarget, setNewBannerTarget] = useState('home');
  const [savingNewBanner, setSavingNewBanner] = useState(false);
  const [newSplashFile, setNewSplashFile] = useState<File | null>(null);
  const [newSplashPreview, setNewSplashPreview] = useState<string | null>(null);
  const [newSplashDuration, setNewSplashDuration] = useState<number | null>(3);
  const [newSplashForceType, setNewSplashForceType] = useState<'auto' | 'image' | 'video'>('image');
  const [savingNewSplash, setSavingNewSplash] = useState(false);
  const splashPreviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const splashPreviewIsVideo = splashForm.mediaType === 'video' || (newSplashFile ? newSplashFile.type.startsWith('video/') : false);

  const handleSplashPreviewPlay = () => {
    const video = splashPreviewVideoRef.current;
    if (!video) return;
    video.play().catch(() => undefined);
  };

  const handleSplashPreviewPause = () => {
    splashPreviewVideoRef.current?.pause();
  };

  const handleSplashPreviewRestart = () => {
    const video = splashPreviewVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => undefined);
  };

  const [splashForm, setSplashForm] = useState({
    name: 'Mobile Splash',
    mediaType: 'image' as 'image' | 'video',
    duration: 3,
    autoplay: true,
    loop: false,
    muted: true,
    backgroundColor: '#0B1020',
    objectFit: 'cover' as 'cover' | 'contain',
    enabled: true,
    startDate: '',
    endDate: '',
    priority: 1,
    status: 'draft' as 'draft' | 'published' | 'scheduled',
  });
  const bannerInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [bannerTargets, setBannerTargets] = useState<Record<string, string>>({});

  const [bannerArFiles, setBannerArFiles] = useState<Record<string, File | null>>({});
  const [bannerArPreviews, setBannerArPreviews] = useState<Record<string, string>>({});
  const [bannerArTargets, setBannerArTargets] = useState<Record<string, string>>({});
  const [savingBannersAr, setSavingBannersAr] = useState<Record<string, boolean>>({});
  const bannerArInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [selectedItem, setSelectedItem] = useState<ContentSetting | null>(null);
  const [previewItem, setPreviewItem] = useState<ContentSetting | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>({
    title: '',
    description: '',
    image: '',
    active: true,
  });
  const [splashEditForm, setSplashEditForm] = useState({
    name: '',
    mediaType: 'image' as 'image' | 'video',
    duration: 3,
    autoplay: true,
    loop: false,
    muted: true,
    backgroundColor: '#0B1020',
    objectFit: 'cover' as 'cover' | 'contain',
    enabled: true,
    startDate: '',
    endDate: '',
    priority: 1,
    status: 'draft' as 'draft' | 'published' | 'scheduled',
  });
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editMediaPreviewUrl, setEditMediaPreviewUrl] = useState<string | null>(null);
  const [editDurationSeconds, setEditDurationSeconds] = useState<number | null>(null);
  const [editForceType, setEditForceType] = useState<'auto' | 'image' | 'video'>('auto');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!editMediaFile) {
      setEditMediaPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(editMediaFile);
    setEditMediaPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [editMediaFile]);

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

  const clearNewSplashUpload = () => {
    if (newSplashPreview) {
      URL.revokeObjectURL(newSplashPreview);
    }
    setNewSplashFile(null);
    setNewSplashPreview(null);
    setNewSplashDuration(null);
    setNewSplashForceType('auto');
  };

  const handleNewSplashFileChange = (file: File | null) => {
    if (newSplashPreview) {
      URL.revokeObjectURL(newSplashPreview);
    }
    if (file) {
      setNewSplashFile(file);
      setNewSplashPreview(URL.createObjectURL(file));
      return;
    }
    setNewSplashFile(null);
    setNewSplashPreview(null);
  };

  const handleAddNewSplash = async (saveMode: 'draft' | 'publish' = 'draft') => {
    if (!newSplashFile) return;

    setSavingNewSplash(true);
    try {
      const key = `splash_${Date.now()}`;
      const description = {
        name: splashForm.name || 'Mobile Splash',
        mediaType: splashForm.mediaType,
        duration: splashForm.mediaType === 'video' ? undefined : (newSplashDuration ?? splashForm.duration ?? 3),
        type: splashForm.mediaType,
        autoplay: splashForm.autoplay,
        loop: splashForm.loop,
        muted: splashForm.muted,
        backgroundColor: splashForm.backgroundColor,
        objectFit: splashForm.objectFit,
        enabled: splashForm.enabled,
        startDate: splashForm.startDate || undefined,
        endDate: splashForm.endDate || undefined,
        priority: splashForm.priority,
        status: saveMode === 'publish' ? 'published' : splashForm.status,
      };
      const formData = new FormData();
      formData.append('group', 'splash-screen');
      formData.append('key', key);
      formData.append('label', splashForm.name || 'Splash Screen');
      formData.append('title', splashForm.name || 'Splash Screen');
      formData.append('description', JSON.stringify(description));
      formData.append('image', newSplashFile);
      formData.append('active', String(Boolean(splashForm.enabled)));

      await api.post('/v1/settings/content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(saveMode === 'publish' ? 'Splash published' : 'Splash saved as draft');
      clearNewSplashUpload();
      setSplashForm((prev) => ({ ...prev, name: 'Mobile Splash', enabled: true, status: saveMode === 'publish' ? 'published' : 'draft' }));
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create splash item'));
    } finally {
      setSavingNewSplash(false);
    }
  };

  const handleAddNewBanner = async () => {
    if (!newBannerFile) return;

    setSavingNewBanner(true);
    try {
      // Replace existing app banners: attempt to delete all current entries
      try {
        const existing = await getAppBanners();
        await Promise.all(
          existing.map(async (b) => {
            try {
              await deleteAppBanner(b.key);
            } catch (e) {
              // ignore individual delete failures
              // eslint-disable-next-line no-console
              console.error('Failed to delete existing app banner', b.key, e);
            }
          })
        );
      } catch (e) {
        // ignore fetch/delete errors and continue with upload
        // eslint-disable-next-line no-console
        console.error('Failed to clear existing app banners before upload', e);
      }

      await createAppBanner({
        title: `App Banner ${Date.now()}`,
        targetScreen: newBannerTarget,
        imageFile: newBannerFile,
      });
      toast.success(t('cms.appBanner.uploadSuccess'));
      clearNewBannerUpload();
      setNewBannerTarget('home');
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.appBanner.uploadError')));
    } finally {
      setSavingNewBanner(false);
    }
  };

  const handleBannerSave = async (bannerKey: string, bannerLabel: string) => {
    const file = bannerFiles[bannerKey];
    const existing = appBannerItemsMemo.find((item) => item.key === bannerKey);
    const selectedTarget = bannerTargets[bannerKey] || existing?.targetScreen || 'home';
    const hasTargetChange = selectedTarget !== (existing?.targetScreen ?? 'home');
    const hasPendingUpload = Boolean(file);

    if (!hasPendingUpload && !hasTargetChange) {
      return;
    }

    setSavingBanners((prev) => ({ ...prev, [bannerKey]: true }));
    try {
      const existing = appBannerItemsMemo.find((item) => item.key === bannerKey);
      if (existing) {
        await updateAppBanner(bannerKey, {
          targetScreen: selectedTarget,
          ...(file ? { imageFile: file } : {}),
        });
      } else {
        await createAppBanner({
          key: bannerKey,
          label: bannerLabel,
          title: bannerLabel,
          targetScreen: selectedTarget,
          imageFile: file ?? undefined,
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
    const existing = appBannerArItemsMemo.find((item) => item.key === bannerKey);
    const selectedTarget = bannerArTargets[bannerKey] || existing?.targetScreen || 'home';
    const hasTargetChange = selectedTarget !== (existing?.targetScreen ?? 'home');
    const hasPendingUpload = Boolean(file);

    if (!hasPendingUpload && !hasTargetChange) {
      return;
    }

    setSavingBannersAr((prev) => ({ ...prev, [bannerKey]: true }));
    try {
      if (existing) {
        await updateAppBannerAr(bannerKey, {
          targetScreen: selectedTarget,
          ...(file ? { imageFile: file } : {}),
        });
      } else {
        await createAppBannerAr({
          key: bannerKey,
          label: bannerLabel,
          title: bannerLabel,
          targetScreen: selectedTarget,
          imageFile: file ?? undefined,
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

  const arabicBannerSlots = useMemo(() => ['banner_ar_1', 'banner_ar_2', 'banner_ar_3'], []);

  const cmsStats = useMemo(() => {
    const homepageSections = homepageItems.length;
    const activeSections = homepageItems.filter((item) => item.active === true).length;
    const staticPages = staticItems.length;
    const publicPages = staticItems.filter((item) => item.active === true).length;
    return { homepageSections, activeSections, staticPages, publicPages };
  }, [homepageItems, staticItems]);

  const bannerTargetOptions = [
    { value: 'home', label: 'Home' },
    { value: 'events', label: 'Events' },
    { value: 'communities', label: 'Communities' },
    { value: 'routes', label: 'Routes' },
    { value: 'club_store', label: 'Club Store' },
    { value: 'challenges', label: 'Challenges' },
    { value: 'leaderboard', label: 'Leaderboard' },
    { value: 'profile', label: 'Profile' },
  ];

  const fetchAllGroupsSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [data, bannerData, bannerArData, splashData] = await Promise.all([
        getContentSettings({}),
        getAppBanners(),
        getAppBannersAr(),
        getContentSettings({ group: 'splash-screen' }),
      ]);
      setAllItems(data);
      setAppBannerItems(bannerData);
      setAppBannerArItems(bannerArData);
      setSplashItems(splashData);
      setBannerTargets(Object.fromEntries(bannerData.map((item) => [item.key, item.targetScreen || 'home'])));
      setBannerArTargets(Object.fromEntries(bannerArData.map((item) => [item.key, item.targetScreen || 'home'])));
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

  const parseSplashMetadata = (description?: string) => {
    const fallback = {
      name: '',
      mediaType: 'image' as 'image' | 'video',
      duration: 3,
      autoplay: true,
      loop: false,
      muted: true,
      backgroundColor: '#0B1020',
      objectFit: 'cover' as 'cover' | 'contain',
      enabled: true,
      startDate: '',
      endDate: '',
      priority: 1,
      status: 'draft' as 'draft' | 'published' | 'scheduled',
    };

    if (!description) return fallback;

    try {
      const parsed = JSON.parse(description) as Record<string, unknown>;
      const mediaType = parsed.type === 'video' || parsed.mediaType === 'video' ? 'video' : 'image';
      const durationValue = Number(parsed.duration ?? 3);
      return {
        name: typeof parsed.name === 'string' ? parsed.name : '',
        mediaType,
        duration: Number.isFinite(durationValue) && durationValue > 0 ? durationValue : 3,
        autoplay: parsed.autoplay === true,
        loop: parsed.loop === true,
        muted: parsed.muted === true,
        backgroundColor: typeof parsed.backgroundColor === 'string' ? parsed.backgroundColor : '#0B1020',
        objectFit: parsed.objectFit === 'contain' ? 'contain' : 'cover',
        enabled: parsed.enabled !== false,
        startDate: typeof parsed.startDate === 'string' ? parsed.startDate : '',
        endDate: typeof parsed.endDate === 'string' ? parsed.endDate : '',
        priority: Number(parsed.priority ?? 1),
        status: parsed.status === 'published' || parsed.status === 'scheduled' ? parsed.status : 'draft',
      } satisfies typeof fallback;
    } catch {
      return fallback;
    }
  };

  const isVideoPreview = (url: string, fallbackType?: 'image' | 'video') => {
    if (fallbackType === 'video') return true;
    if (fallbackType === 'image') return false;
    return /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url);
  };

  const openEditForm = (item: ContentSetting) => {
    const parsedSplash = parseSplashMetadata(item.description);

    setSelectedItem(item);
    setEditForm({
      title: item.title ?? parsedSplash.name ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      active: item.active ?? parsedSplash.enabled ?? true,
    });
    setSplashEditForm(parsedSplash.name || item.label ? { ...parsedSplash, name: parsedSplash.name || item.label || item.title || '' } : parsedSplash);
    setEditMediaFile(null);
    setEditMediaPreviewUrl(null);
    setEditDurationSeconds(null);
    setEditForceType('auto');
  };

  const closeEditForm = () => {
    setSelectedItem(null);
    setEditForm({ title: '', description: '', image: '', active: true });
    setSplashEditForm({
      name: '',
      mediaType: 'image',
      duration: 3,
      autoplay: true,
      loop: false,
      muted: true,
      backgroundColor: '#0B1020',
      objectFit: 'cover',
      enabled: true,
      startDate: '',
      endDate: '',
      priority: 1,
      status: 'draft',
    });
    setEditMediaFile(null);
    setEditMediaPreviewUrl(null);
    setEditDurationSeconds(null);
    setEditForceType('auto');
  };

  const handleDuplicateEntry = async (item: ContentSetting) => {
    try {
      const newKey = `${item.key || 'entry'}-copy-${Date.now()}`;
      const formData = new FormData();
      formData.append('group', item.group || 'content');
      formData.append('key', newKey);
      formData.append('label', item.label || item.title || newKey);
      formData.append('title', item.title || item.label || newKey);
      formData.append('description', item.description || '');
      formData.append('image', item.image || '');
      formData.append('active', String(Boolean(item.active)));

      await api.post('/v1/settings/content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Item duplicated successfully');
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to duplicate item'));
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    const patchPayload: UpdateContentSettingPayload = {};

    if (selectedItem.group === 'splash-screen') {
      const nextTitle = splashEditForm.name || editForm.title || selectedItem.label || selectedItem.key;
      const nextDescription = JSON.stringify({
        name: splashEditForm.name || nextTitle,
        type: splashEditForm.mediaType,
        mediaType: splashEditForm.mediaType,
        duration: splashEditForm.mediaType === 'video' ? undefined : splashEditForm.duration,
        autoplay: splashEditForm.autoplay,
        loop: splashEditForm.loop,
        muted: splashEditForm.muted,
        backgroundColor: splashEditForm.backgroundColor,
        objectFit: splashEditForm.objectFit,
        enabled: splashEditForm.enabled,
        startDate: splashEditForm.startDate || undefined,
        endDate: splashEditForm.endDate || undefined,
        priority: splashEditForm.priority,
        status: splashEditForm.status,
      });

      if ((selectedItem.title ?? '') !== nextTitle) patchPayload.title = nextTitle;
      if ((selectedItem.description ?? '') !== nextDescription) patchPayload.description = nextDescription;
      if (editMediaFile) patchPayload.imageFile = editMediaFile;
      if ((selectedItem.active ?? true) !== splashEditForm.enabled) patchPayload.active = splashEditForm.enabled;
      if (editMediaFile === null && selectedItem.image && editForm.image !== selectedItem.image) {
        patchPayload.image = editForm.image;
      }
    } else {
      if ((selectedItem.title ?? '') !== editForm.title) patchPayload.title = editForm.title;
      if ((selectedItem.description ?? '') !== editForm.description) {
        patchPayload.description = editForm.description;
      }
      if (editMediaFile) {
        patchPayload.imageFile = editMediaFile;
      } else if ((selectedItem.image ?? '') !== editForm.image) {
        patchPayload.image = editForm.image;
      }
      if ((selectedItem.active ?? true) !== editForm.active) patchPayload.active = editForm.active;
    }

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
              {(['homepage', 'static', 'appBanner', 'appBannerAr', 'splash'] as const).map((tab) => (
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
                    : tab === 'appBannerAr'
                    ? t('cms.tabs.appBannerAr')
                    : t('cms.tabs.splash')}
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

                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: '#666' }}>
                    Banner destination
                  </label>
                  <select
                    value={newBannerTarget}
                    onChange={(e) => setNewBannerTarget(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#E5DDD4' }}
                  >
                    {bannerTargetOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
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

                        <div className="space-y-2">
                          <label className="block text-xs font-medium" style={{ color: '#666' }}>
                            Banner destination
                          </label>
                          <select
                            value={bannerTargets[item.key] || item.targetScreen || 'home'}
                            onChange={(e) => setBannerTargets((prev) => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            style={{ borderColor: '#E5DDD4' }}
                          >
                            {bannerTargetOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => handleBannerSave(item.key, item.label || item.key)}
                          disabled={isSaving || (!selectedFile && !(bannerTargets[item.key] || item.targetScreen || 'home'))}
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
                {arabicBannerSlots.map((slotKey, index) => {
                  const arItem = appBannerArItemsMemo.find((item) => item.key === slotKey) ?? appBannerArItemsMemo[index] ?? null;
                  const previewUrl = bannerArPreviews[slotKey] || arItem?.image || '';
                  const selectedFile = bannerArFiles[slotKey];
                  const isSaving = savingBannersAr[slotKey] ?? false;
                  const slotLabel = `Arabic Banner ${index + 1}`;

                  return (
                    <div key={slotKey} className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#E5DDD4' }}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: '#333' }}>
                            {slotLabel}
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
                            alt={slotLabel}
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
                          ref={(el) => { bannerArInputRefs.current[slotKey] = el; }}
                          onChange={(e) => handleBannerArFileChange(slotKey, e.target.files?.[0] ?? null)}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium" style={{ color: '#666' }}>
                          Banner destination
                        </label>
                        <select
                          value={bannerArTargets[slotKey] || arItem?.targetScreen || 'home'}
                          onChange={(e) => setBannerArTargets((prev) => ({ ...prev, [slotKey]: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        >
                          {bannerTargetOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleBannerArSave(slotKey, slotLabel)}
                        disabled={isSaving || (!selectedFile && !(bannerArTargets[slotKey] || arItem?.targetScreen || 'home'))}
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
                })}
              </div>
            </div>
          ) : activeTab === 'splash' ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: '#333' }}>{t('cms.tabs.splash')}</h2>
                  <p className="text-sm" style={{ color: '#666' }}>
                    {t('cms.splash.subtitle')}
                  </p>
                </div>
                <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: '#E5DDD4', color: '#666' }}>
                  {splashItems.length} {t('cms.splash.items')}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-6">
                <div className="space-y-6">
                  <div className="rounded-2xl border p-5" style={{ borderColor: '#E5DDD4', backgroundColor: '#FFFDFB' }}>
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
                      <h3 className="text-lg font-medium" style={{ color: '#333' }}>{t('cms.splash.configuration')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.name')}
                        </label>
                        <input
                          value={splashForm.name}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                          placeholder="Winter Launch Splash"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.mediaType')}
                        </label>
                        <select
                          value={splashForm.mediaType}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, mediaType: e.target.value as 'image' | 'video' }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        >
                          <option value="image">{t('cms.splash.image')}</option>
                          <option value="video">{t('cms.splash.video')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.status')}
                        </label>
                        <select
                          value={splashForm.status}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        >
                          <option value="draft">{t('cms.splash.draft')}</option>
                          <option value="published">{t('cms.splash.published')}</option>
                          <option value="scheduled">{t('cms.splash.scheduled')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.durationSeconds')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={splashForm.mediaType === 'video' ? '' : (newSplashDuration ?? splashForm.duration)}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setNewSplashDuration(value > 0 ? value : null);
                            setSplashForm((prev) => ({ ...prev, duration: value > 0 ? value : 3 }));
                          }}
                          disabled={splashForm.mediaType === 'video'}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:opacity-50"
                          style={{ borderColor: '#E5DDD4' }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.priority')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={splashForm.priority}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, priority: Number(e.target.value || 1) }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.startDate')}
                        </label>
                        <input
                          type="date"
                          value={splashForm.startDate}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.endDate')}
                        </label>
                        <input
                          type="date"
                          value={splashForm.endDate}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.backgroundColor')}
                        </label>
                        <input
                          type="color"
                          value={splashForm.backgroundColor}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="h-11 w-full rounded-xl border px-1 py-1"
                          style={{ borderColor: '#E5DDD4', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: '#666' }}>
                          {t('cms.splash.objectFit')}
                        </label>
                        <select
                          value={splashForm.objectFit}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, objectFit: e.target.value as 'cover' | 'contain' }))}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm"
                          style={{ borderColor: '#E5DDD4' }}
                        >
                          <option value="cover">{t('cms.splash.cover')}</option>
                          <option value="contain">{t('cms.splash.contain')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                        <span style={{ color: '#333' }}>{t('cms.splash.enableDisable')}</span>
                        <input
                          type="checkbox"
                          checked={splashForm.enabled}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                        <span style={{ color: '#333' }}>{t('cms.splash.autoplay')}</span>
                        <input
                          type="checkbox"
                          checked={splashForm.autoplay}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, autoplay: e.target.checked }))}
                          disabled={splashForm.mediaType !== 'video'}
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                        <span style={{ color: '#333' }}>{t('cms.splash.loopVideo')}</span>
                        <input
                          type="checkbox"
                          checked={splashForm.loop}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, loop: e.target.checked }))}
                          disabled={splashForm.mediaType !== 'video'}
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                        <span style={{ color: '#333' }}>{t('cms.splash.muted')}</span>
                        <input
                          type="checkbox"
                          checked={splashForm.muted}
                          onChange={(e) => setSplashForm((prev) => ({ ...prev, muted: e.target.checked }))}
                          disabled={splashForm.mediaType !== 'video'}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-5" style={{ borderColor: '#E5DDD4', backgroundColor: '#FFFDFB' }}>
                    <div className="mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5" style={{ color: '#C12D32' }} />
                      <h3 className="text-lg font-medium" style={{ color: '#333' }}>{t('cms.splash.uploadMedia')}</h3>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed p-4 text-center" style={{ borderColor: '#E5DDD4', backgroundColor: '#F9F5F1' }}>
                      <input
                        type="file"
                        accept={splashForm.mediaType === 'video' ? 'video/*' : 'image/*,.webp,.jpg,.jpeg,.png'}
                        onChange={(e) => handleNewSplashFileChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                        id="splash-upload-input"
                      />
                      <label htmlFor="splash-upload-input" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: '#C12D32' }}>
                        <Upload className="w-4 h-4" />
                        {t('cms.splash.browseMedia')}
                      </label>
                    </div>

                    {newSplashFile ? (
                      <div className="mt-4 rounded-xl border p-3" style={{ borderColor: '#E5DDD4', backgroundColor: '#fff' }}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#333' }}>{newSplashFile.name}</div>
                            <div className="text-xs" style={{ color: '#666' }}>
                              {(newSplashFile.size / 1024 / 1024).toFixed(2)} MB • {splashForm.mediaType.toUpperCase()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearNewSplashUpload}
                            className="rounded-lg border px-3 py-1.5 text-xs"
                            style={{ borderColor: '#E5DDD4', color: '#666' }}
                          >
                            {t('cms.splash.remove')}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border p-5" style={{ borderColor: '#E5DDD4', backgroundColor: '#FFFDFB' }}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-medium" style={{ color: '#333' }}>{t('cms.splash.listing')}</h3>
                      <div className="flex gap-2 text-xs">
                        <span className="rounded-full bg-[#F3EEE7] px-2 py-1">{t('cms.splash.type')}</span>
                        <span className="rounded-full bg-[#F3EEE7] px-2 py-1">{t('cms.splash.status')}</span>
                      </div>
                    </div>

                    {splashItems.length === 0 ? (
                      <div className="py-6 text-sm" style={{ color: '#666' }}>
                        {t('cms.noSectionItems')}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr style={{ color: '#666' }}>
                              <th className="pb-3 pr-3">{t('cms.splash.name')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.type')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.preview')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.duration')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.status')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.updated')}</th>
                              <th className="pb-3 pr-3">{t('cms.splash.actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {splashItems.map((item) => {
                              const meta = (() => { try { return item.description ? JSON.parse(item.description) : {}; } catch { return {}; } })();
                              const mediaType = meta?.type || (item.image ? 'image' : 'video');
                              const mediaUrl = item.image || '';
                              const isVideo = mediaType === 'video' || /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(mediaUrl);
                              const statusText = item.active ? t('cms.splash.published') : t('cms.splash.draft');
                              return (
                                <tr key={item._id || item.key} className="border-t" style={{ borderColor: '#F0E9E1' }}>
                                  <td className="py-3 pr-3 font-medium" style={{ color: '#333' }}>{item.label || item.title || item.key}</td>
                                  <td className="py-3 pr-3 capitalize" style={{ color: '#666' }}>{mediaType}</td>
                                  <td className="py-3 pr-3">
                                    {mediaUrl ? (
                                      isVideo ? (
                                        <video src={mediaUrl} className="h-12 w-20 rounded object-cover bg-black" muted playsInline />
                                      ) : (
                                        <img src={mediaUrl} alt={item.label || item.key} className="h-12 w-20 rounded object-cover" />
                                      )
                                    ) : (
                                      <span className="text-xs" style={{ color: '#999' }}>{t('cms.splash.noMedia')}</span>
                                    )}
                                  </td>
                                  <td className="py-3 pr-3 text-xs" style={{ color: '#666' }}>{meta?.duration ? `${meta.duration}s` : isVideo ? t('cms.splash.auto') : t('cms.splash.notSet')}</td>
                                  <td className="py-3 pr-3">
                                    <span className="rounded-full px-2 py-1 text-xs" style={{ backgroundColor: item.active ? '#EAFBF3' : '#F7F1E8', color: item.active ? '#0F9F6E' : '#8A8A8A' }}>
                                      {statusText}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-3 text-xs" style={{ color: '#666' }}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</td>
                                  <td className="py-3 pr-3">
                                    <div className="flex flex-wrap gap-2">
                                      <button type="button" onClick={() => setPreviewItem(item)} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: '#E5DDD4', color: '#333' }}>{t('cms.splash.view')}</button>
                                      <button type="button" onClick={() => openEditForm(item)} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: '#E5DDD4', color: '#333' }}>{t('cms.splash.edit')}</button>
                                      <button type="button" onClick={() => handleDuplicateEntry(item)} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: '#E5DDD4', color: '#333' }}>{t('cms.splash.duplicate')}</button>
                                      <button type="button" onClick={() => handleToggleActive(item)} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: '#E5DDD4', color: '#333' }}>{item.active ? 'Disable' : 'Enable'}</button>
                                      <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">{t('cms.deleteConfirm')}</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border p-5" style={{ borderColor: '#E5DDD4', backgroundColor: '#F8F5F0' }}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium" style={{ color: '#333' }}>{t('cms.splash.mobilePreview')}</h3>
                      <p className="text-xs" style={{ color: '#666' }}>{t('cms.splash.previewMode')}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs font-medium"
                      style={{ borderColor: '#E5DDD4', color: '#333' }}
                    >
                      {t('cms.splash.refreshPreview')}
                    </button>
                  </div>

                  <div className="mx-auto flex max-w-[310px] justify-center pt-2">
                    <div className="relative w-[280px] rounded-[38px] border-[10px] border-[#111827] bg-[#0b1020] p-2 shadow-2xl">
                      <div className="absolute left-1/2 top-2 h-2 w-20 -translate-x-1/2 rounded-full bg-[#1f2937]" />
                      <div className="relative overflow-hidden rounded-[28px] bg-black" style={{ width: '100%', height: '560px', backgroundColor: splashForm.backgroundColor }}>
                        {newSplashPreview ? (
                          splashForm.mediaType === 'video' ? (
                            <video
                              ref={splashPreviewVideoRef}
                              src={newSplashPreview}
                              autoPlay
                              muted={splashForm.muted}
                              loop={splashForm.loop}
                              playsInline
                              controls={false}
                              className="h-full w-full object-cover"
                              style={{ objectFit: splashForm.objectFit }}
                            />
                          ) : (
                            <img
                              src={newSplashPreview}
                              alt="Mobile splash preview"
                              className="h-full w-full"
                              style={{ objectFit: splashForm.objectFit }}
                            />
                          )
                        ) : splashItems[0]?.image ? (
                          splashItems[0].image && (splashItems[0].description ? JSON.parse(splashItems[0].description).type === 'video' : false) ? (
                            <video
                              ref={splashPreviewVideoRef}
                              src={splashItems[0].image}
                              autoPlay
                              muted
                              className="h-full w-full object-cover"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <img src={splashItems[0].image} alt="Saved splash preview" className="h-full w-full" style={{ objectFit: 'cover' }} />
                          )
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-center text-xs text-white/80">
                            {t('cms.splash.uploadMediaPreview')}
                          </div>
                        )}

                        {splashPreviewIsVideo && (
                          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                            <button type="button" onClick={handleSplashPreviewPlay} className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">{t('cms.splash.play')}</button>
                            <button type="button" onClick={handleSplashPreviewPause} className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">{t('cms.splash.pause')}</button>
                            <button type="button" onClick={handleSplashPreviewRestart} className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">{t('cms.splash.restart')}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddNewSplash('draft')}
                      disabled={!newSplashFile || savingNewSplash}
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      {savingNewSplash ? t('cms.saving') : t('cms.splash.saveDraft')}
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium"
                      style={{ borderColor: '#E5DDD4', color: '#333' }}
                    >
                      {t('cms.splash.preview')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddNewSplash('publish')}
                      disabled={!newSplashFile || savingNewSplash}
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                      style={{ backgroundColor: '#0F9F6E' }}
                    >
                      {t('cms.splash.publish')}
                    </button>
                  </div>
                </div>
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

      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#333' }}>{previewItem.label || previewItem.title || previewItem.key}</h3>
              <button type="button" onClick={() => setPreviewItem(null)} className="text-sm" style={{ color: '#666' }}>{t('cms.cancel')}</button>
            </div>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: '#E5DDD4', backgroundColor: '#0B1020' }}>
              {(() => {
                const meta = (() => { try { return previewItem.description ? JSON.parse(previewItem.description) : {}; } catch { return {}; } })();
                const mediaType = meta?.type || (previewItem.image ? 'image' : 'video');
                const mediaUrl = previewItem.image || '';
                const isVideo = mediaType === 'video' || /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(mediaUrl);
                return isVideo ? (
                  <video src={mediaUrl} autoPlay muted loop playsInline className="h-[420px] w-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt={previewItem.label || previewItem.key} className="h-[420px] w-full object-cover" />
                );
              })()}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs" style={{ color: '#666' }}>
              <span>{previewItem.active ? 'Published' : 'Draft'}</span>
              <span>{(() => { const meta = (() => { try { return previewItem.description ? JSON.parse(previewItem.description) : {}; } catch { return {}; } })(); return meta?.duration ? `${meta.duration}s` : 'Auto'; })()}</span>
            </div>
          </div>
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
        

            {selectedItem.group === 'splash-screen' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.name')}
                  </label>
                  <input
                    value={splashEditForm.name}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.mediaType')}
                  </label>
                  <select
                    value={splashEditForm.mediaType}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, mediaType: event.target.value as 'image' | 'video' }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="image">{t('cms.splash.image')}</option>
                    <option value="video">{t('cms.splash.video')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.status')}
                  </label>
                  <select
                    value={splashEditForm.status}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, status: event.target.value as 'draft' | 'published' | 'scheduled' }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="draft">{t('cms.splash.draft')}</option>
                    <option value="published">{t('cms.splash.published')}</option>
                    <option value="scheduled">{t('cms.splash.scheduled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.durationSeconds')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={splashEditForm.mediaType === 'video' ? '' : splashEditForm.duration}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, duration: Number(event.target.value || 3) }))}
                    disabled={splashEditForm.mediaType === 'video'}
                    className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.priority')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={splashEditForm.priority}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, priority: Number(event.target.value || 1) }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.startDate')}
                  </label>
                  <input
                    type="date"
                    value={splashEditForm.startDate}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.endDate')}
                  </label>
                  <input
                    type="date"
                    value={splashEditForm.endDate}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.backgroundColor')}
                  </label>
                  <input
                    type="color"
                    value={splashEditForm.backgroundColor}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, backgroundColor: event.target.value }))}
                    className="h-11 w-full border rounded-lg px-1 py-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.objectFit')}
                  </label>
                  <select
                    value={splashEditForm.objectFit}
                    onChange={(event) => setSplashEditForm((prev) => ({ ...prev, objectFit: event.target.value as 'cover' | 'contain' }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="cover">{t('cms.splash.cover')}</option>
                    <option value="contain">{t('cms.splash.contain')}</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-medium uppercase" style={{ color: '#666' }}>
                    {t('cms.splash.uploadMedia')}
                  </label>
                  <div className="w-full border rounded-lg p-2" style={{ backgroundColor: '#FAF7F2' }}>
                    {(() => {
                      const sourceUrl = editMediaPreviewUrl || selectedItem?.image || '';
                      const metadataType = parseSplashMetadata(selectedItem?.description).mediaType;
                      const isVideo = isVideoPreview(sourceUrl, splashEditForm.mediaType === 'video' ? 'video' : metadataType === 'video' ? 'video' : undefined);
                      if (!sourceUrl) {
                        return (
                          <div className="text-xs" style={{ color: '#999' }}>
                            {t('cms.splash.uploadMediaPreview')}
                          </div>
                        );
                      }
                      return isVideo ? (
                        <video src={sourceUrl} controls muted playsInline className="h-40 w-full rounded-md object-cover bg-black" />
                      ) : (
                        <img src={sourceUrl} alt="" className="h-40 w-full rounded-md object-cover" />
                      );
                    })()}
                  </div>
                  <input
                    type="file"
                    accept={splashEditForm.mediaType === 'video' ? 'video/*' : 'image/*,.webp,.jpg,.jpeg,.png'}
                    onChange={(event) => setEditMediaFile(event.target.files?.[0] ?? null)}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                    <span>{t('cms.splash.enableDisable')}</span>
                    <input type="checkbox" checked={splashEditForm.enabled} onChange={(event) => setSplashEditForm((prev) => ({ ...prev, enabled: event.target.checked }))} />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                    <span>{t('cms.splash.autoplay')}</span>
                    <input type="checkbox" checked={splashEditForm.autoplay} onChange={(event) => setSplashEditForm((prev) => ({ ...prev, autoplay: event.target.checked }))} disabled={splashEditForm.mediaType !== 'video'} />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                    <span>{t('cms.splash.loopVideo')}</span>
                    <input type="checkbox" checked={splashEditForm.loop} onChange={(event) => setSplashEditForm((prev) => ({ ...prev, loop: event.target.checked }))} disabled={splashEditForm.mediaType !== 'video'} />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#E5DDD4' }}>
                    <span>{t('cms.splash.muted')}</span>
                    <input type="checkbox" checked={splashEditForm.muted} onChange={(event) => setSplashEditForm((prev) => ({ ...prev, muted: event.target.checked }))} disabled={splashEditForm.mediaType !== 'video'} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {(() => {
                      const sourceUrl = editMediaPreviewUrl || selectedItem?.image || '';
                      const isVideo = /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(sourceUrl);
                      if (!sourceUrl) {
                        return (
                          <div className="text-xs" style={{ color: '#999' }}>
                            {t('cms.imageNotAvailable')}
                          </div>
                        );
                      }
                      return isVideo ? (
                        <video src={sourceUrl} controls muted playsInline className="h-40 w-full rounded-md object-cover bg-black" />
                      ) : (
                        <img src={sourceUrl} alt="" className="w-full h-40 object-cover rounded-md" />
                      );
                    })()}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-medium" style={{ color: '#666' }}>
                    {t('cms.uploadImage')}
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setEditMediaFile(file);
                    }}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  />
                  {editMediaFile ? (
                    <p className="text-xs" style={{ color: '#666' }}>
                      {t('cms.selectedFile')}: {editMediaFile.name}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-xs" style={{ color: '#666' }}>{t('cms.fields.durationSeconds')}</label>
                    <input type="number" min={1} value={editDurationSeconds ?? ''} onChange={(e) => setEditDurationSeconds(e.target.value ? Number(e.target.value) : null)} className="w-24 border rounded px-2 py-1 text-sm" />
                    <select value={editForceType} onChange={(e) => setEditForceType(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                      <option value="auto">Auto</option>
                      <option value="image">Force Image</option>
                      <option value="video">Force Video</option>
                    </select>
                  </div>
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
            )}

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
