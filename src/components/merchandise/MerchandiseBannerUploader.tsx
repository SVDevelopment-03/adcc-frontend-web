import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, ImageIcon, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteProductBanner,
  deleteProductBannerAr,
  getProductBanners,
  getProductBannersAr,
  ProductBanner,
  uploadProductBanners,
  uploadProductBannersAr,
} from '../../services/merchandiseApi';
import { ImagePickerModal } from '../media/ImagePickerModal';

export interface MerchandiseBannerUploaderProps {
  /** Which banner set this instance manages. Defaults to 'en'. */
  variant?: 'en' | 'ar';
  title?: string;
  description?: string;
}

const VARIANT_CONFIG = {
  en: {
    title: 'Merchandise Banner Upload',
    description: 'Upload one or more banner images for merchandise promotions. Only image files are accepted.',
    getBanners: getProductBanners,
    uploadBanners: uploadProductBanners,
    deleteBanner: deleteProductBanner,
    dir: 'ltr' as const,
  },
  ar: {
    title: 'Merchandise Banner Upload for Arabic',
    description: 'Upload one or more banner images for merchandise promotions on the Arabic app. Only image files are accepted.',
    getBanners: getProductBannersAr,
    uploadBanners: uploadProductBannersAr,
    deleteBanner: deleteProductBannerAr,
    dir: 'ltr' as const,
  },
};

export function MerchandiseBannerUploader({ variant = 'en', title, description }: MerchandiseBannerUploaderProps = {}) {
  const config = VARIANT_CONFIG[variant];
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [pickingFromLibrary, setPickingFromLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const items = await config.getBanners();
        setBanners(items);
      } catch (error) {
        console.error('Failed to load product banners', error);
      }
    };

    void loadBanners();
  }, [config]);

  const handleFileSelection = (files: FileList | null) => {
    if (!files || !files.length) {
      setSelectedFiles([]);
      setUploadError('');
      return;
    }

    const acceptedFiles: File[] = [];
    const rejected = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        rejected.push(file.name);
        return;
      }
      acceptedFiles.push(file);
    });

    if (!acceptedFiles.length) {
      setSelectedFiles([]);
      setUploadError('Only image files are allowed.');
      return;
    }

    if (rejected.length > 0) {
      setUploadError(`Ignored non-image files: ${rejected.join(', ')}`);
    } else {
      setUploadError('');
    }

    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  };

  // Re-fetches an already-hosted image's bytes and wraps them as a File so
  // it flows through the exact same "selected files" -> upload pipeline as a
  // locally chosen file — no separate banner-creation code path needed.
  const handlePickFromLibrary = async (url: string) => {
    setPickingFromLibrary(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const name = decodeURIComponent(url.split('/').pop() || 'banner.jpg').split('?')[0];
      const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
      setSelectedFiles((prev) => [...prev, file]);
      setUploadError('');
    } catch (error) {
      setUploadError('Failed to load the selected image.');
    } finally {
      setPickingFromLibrary(false);
      setShowLibraryPicker(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadError('');

    try {
      await config.uploadBanners(selectedFiles);
      const items = await config.getBanners();
      setBanners(items);
      toast.success('Product banners uploaded successfully');
      setSelectedFiles([]);
    } catch (error: any) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadError('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4" dir={config.dir}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#EFF6FF] text-[#3B82F6]">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#333' }}>
            {title ?? config.title}
          </h2>
          <p className="text-sm text-gray-500">
            {description ?? config.description}
          </p>
        </div>
      </div>

      <div
        className="border border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">Click to choose images</p>
        <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF. Max 10MB per file.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFileSelection(event.target.files)}
      />

      <button
        type="button"
        disabled={pickingFromLibrary}
        onClick={(e) => { e.stopPropagation(); setShowLibraryPicker(true); }}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
      >
        {pickingFromLibrary ? 'Adding…' : 'Choose from Media Library'}
      </button>

      {showLibraryPicker && (
        <ImagePickerModal
          uploadFolder="merchandise-banners"
          onClose={() => setShowLibraryPicker(false)}
          onSelect={handlePickFromLibrary}
        />
      )}

      {selectedFiles.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Selected files</p>
              <p className="text-xs text-gray-500">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button type="button" onClick={clearSelection} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {previewUrls.map((preview, index) => (
                <img
                  key={`${preview}-${index}`}
                  src={preview}
                  alt={`Selected image ${index + 1}`}
                  className="h-16 w-full rounded-lg object-cover border border-gray-200"
                />
              ))}
            </div>
          )}
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <span className="text-xs text-gray-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-4 bg-gray-50 text-sm text-gray-500">
          Select product banner images to upload.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !selectedFiles.length}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: selectedFiles.length ? '#C12D32' : '#F3F4F6' }}
        >
          {uploading ? 'Uploading…' : 'Upload Banners'}
        </button>
        <button
          type="button"
          onClick={clearSelection}
          disabled={uploading || !selectedFiles.length}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Clear Selection
        </button>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {banners.length > 0 && (
        <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Existing Product Banners</p>
            <span className="text-xs text-gray-500">{banners.length} saved</span>
          </div>
          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.key} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 bg-white">
                <img
                  src={banner.image}
                  alt={banner.title || banner.label || 'Banner'}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {banner.title || banner.label || 'Product Banner'}
                  </p>
                  <p className="text-xs text-gray-500">{banner.key}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!banner.key) return;
                    try {
                      await config.deleteBanner(banner.key);
                      setBanners((prev) => prev.filter((item) => item.key !== banner.key));
                      toast.success('Banner deleted');
                    } catch (error: any) {
                      toast.error(error?.message || 'Failed to delete banner');
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
