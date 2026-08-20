import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { backfillMediaLibrary, getMediaPage, uploadToMediaLibrary, MediaItem } from '../../services/mediaApi';

interface ImagePickerModalProps {
  /** Upload folder used when a brand-new file is uploaded from this picker (see backend FOLDER_MAP). */
  uploadFolder: string;
  onClose: () => void;
  /** Called with the chosen image's URL — either picked from the library or just uploaded. */
  onSelect: (url: string) => void;
}

type Tab = 'library' | 'upload';

/**
 * WordPress-style "Select Image" dialog: browse every image previously
 * uploaded anywhere in the dashboard (shared backend catalog — see
 * services/mediaApi.ts), or upload a new one, then hand back its URL.
 */
export function ImagePickerModal({ uploadFolder, onClose, onSelect }: ImagePickerModalProps) {
  const [tab, setTab] = useState<Tab>('library');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (nextPage: number, query: string, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const result = await getMediaPage({ page: nextPage, limit: 30, search: query || undefined });
      setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      setPage(result.pagination.page);
      setPages(result.pagination.pages);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load media library');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(1, search, false), search ? 300 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadToMediaLibrary(file, uploadFolder);
      onSelect(uploaded.url);
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Images uploaded before the media catalog existed (e.g. an event cover
  // set months ago) were never recorded — this scans existing content once
  // and backfills them so they show up here too. Safe to run repeatedly.
  const handleScanExisting = async () => {
    setScanning(true);
    try {
      const result = await backfillMediaLibrary();
      if (result.added > 0) {
        toast.success(`Found ${result.added} existing image${result.added === 1 ? '' : 's'}`);
        load(1, search, false);
      } else {
        toast.info('No additional existing images found.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to scan existing content');
    } finally {
      setScanning(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab('library')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                tab === 'library' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Media Library
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                tab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload New
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {tab === 'library' ? (
          <>
            {/* Search */}
            <div className="px-5 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images by filename…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    {search ? 'No images match your search' : 'No images uploaded yet'}
                  </p>
                  {!search && (
                    <>
                      <button
                        type="button"
                        onClick={() => setTab('upload')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Upload your first image
                      </button>
                      <p className="text-xs text-gray-400 max-w-xs">
                        Already have images on events, tracks, communities or banners? They won't
                        show up here until you scan for them once.
                      </p>
                      <button
                        type="button"
                        disabled={scanning}
                        onClick={handleScanExisting}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                      >
                        {scanning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Scan existing content for images
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.url)}
                        title={item.name}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-white bg-black/50 rounded-full px-2.5 py-1 transition-opacity">
                            Select
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {page < pages && (
                    <div className="flex justify-center mt-5">
                      <button
                        type="button"
                        disabled={loadingMore}
                        onClick={() => load(page + 1, search, true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Load more
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUpload(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-600 font-medium">Uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                    <Upload className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Drop an image here or <span className="text-blue-600 underline underline-offset-2">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
