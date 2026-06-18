import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Search,
  X,
  ImageIcon,
  FolderOpen,
  Link,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface MediaItem {
  id: string;
  url: string;
  key: string;
  name: string;
  folder: string;
  uploadedAt: string;
  size?: number;
  mimeType?: string;
}

/* ─── Storage helpers ────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'adcc_media_library';

function loadFromStorage(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MediaItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: MediaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ─── Folder options ─────────────────────────────────────────────────────────── */
const FOLDERS = [
  { value: 'content', label: 'Content' },
  { value: 'events', label: 'Events' },
  { value: 'tracks', label: 'Tracks' },
  { value: 'community', label: 'Community' },
  { value: 'store', label: 'Store' },
  { value: 'challenges', label: 'Challenges' },
  { value: 'badges', label: 'Badges' },
  { value: 'members', label: 'Members' },
];

/* ─── URL modal ──────────────────────────────────────────────────────────────── */
function UrlModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [item.url]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Preview */}
        <div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
          <img
            src={item.url}
            alt={item.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">File Name</p>
            <p className="text-sm font-semibold text-gray-800 break-all">{item.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Folder</p>
            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {item.folder}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-medium flex items-center gap-1">
              <Link className="w-3 h-3" />
              Image URL
            </p>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                readOnly
                value={item.url}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-700 outline-none focus:border-blue-400 cursor-text font-mono break-all"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Uploaded {new Date(item.uploadedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>(loadFromStorage);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadFolder, setUploadFolder] = useState('content');
  const [search, setSearch] = useState('');
  const [filterFolder, setFilterFolder] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* persist to localStorage on change */
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  /* ── Upload ── */
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!fileArray.length) {
      setUploadError('Please select image files (JPEG, PNG, WebP, GIF, SVG).');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress([]);
    const newItems: MediaItem[] = [];

    for (const file of fileArray) {
      setUploadProgress((prev) => [...prev, `Uploading ${file.name}…`]);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post<{ success: boolean; data: { url: string; key: string } }>(
          `/v1/uploads/image/${uploadFolder}`,
          formData
        );

        if (res.data?.success && res.data?.data?.url) {
          const { url, key } = res.data.data;
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url,
            key,
            name: file.name,
            folder: uploadFolder,
            uploadedAt: new Date().toISOString(),
            size: file.size,
            mimeType: file.type,
          });
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Upload failed';
        setUploadError(`Failed to upload "${file.name}": ${msg}`);
      }
    }

    if (newItems.length) {
      setItems((prev) => [...newItems, ...prev]);
      setUploadProgress([`✓ ${newItems.length} file${newItems.length > 1 ? 's' : ''} uploaded successfully`]);
      setTimeout(() => setUploadProgress([]), 3000);
    }
    setUploading(false);
  }, [uploadFolder]);

  /* ── Drag & drop ── */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  /* ── Delete ── */
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirm(null);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  /* ── Filtered list ── */
  const filtered = items.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.url.toLowerCase().includes(search.toLowerCase());
    const matchFolder = filterFolder === 'all' || item.folder === filterFolder;
    return matchSearch && matchFolder;
  });

  const usedFolders = [...new Set(items.map((i) => i.folder))];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} file{items.length !== 1 ? 's' : ''} stored
          </p>
        </div>
      </div>

      {/* ── Upload zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Uploading…</p>
            {uploadProgress.map((msg, i) => (
              <p key={i} className="text-xs text-gray-500">{msg}</p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
              <Upload className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Drop images here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP, GIF, SVG — multiple files supported
              </p>
            </div>
            {/* Folder selector */}
            <div className="flex items-center gap-2 mt-1">
              <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
              <label className="text-xs text-gray-500 font-medium">Upload to:</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
              >
                {FOLDERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Feedback messages */}
        {uploadProgress.length > 0 && !uploading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" />
            {uploadProgress[0]}
          </div>
        )}
        {uploadError && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
            <button onClick={() => setUploadError('')} className="ml-1 text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename or URL…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Folder filter */}
          {usedFolders.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterFolder('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterFolder === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {usedFolders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterFolder(f === filterFolder ? 'all' : f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterFolder === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {filtered.length} / {items.length} files
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-600 font-semibold">No media yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first image to get started</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search className="w-10 h-10 text-gray-200" />
          <p className="text-gray-500 font-medium">No files match your search</p>
          <button
            onClick={() => { setSearch(''); setFilterFolder('all'); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={() => setSelectedItem(item)}
              onDelete={() => setDeleteConfirm(item.id)}
              confirmDelete={deleteConfirm === item.id}
              onCancelDelete={() => setDeleteConfirm(null)}
              onConfirmDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* ── URL Modal ── */}
      {selectedItem && (
        <UrlModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

/* ─── Media card ─────────────────────────────────────────────────────────────── */
function MediaCard({
  item,
  onSelect,
  onDelete,
  confirmDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  item: MediaItem;
  onSelect: () => void;
  onDelete: () => void;
  confirmDelete: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (confirmDelete) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 flex flex-col items-center justify-center gap-2 min-h-[140px] text-center">
        <Trash2 className="w-5 h-5 text-red-400" />
        <p className="text-xs text-red-700 font-semibold">Delete this file?</p>
        <p className="text-xs text-red-500 leading-tight">This removes it from the library only.</p>
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={onCancelDelete}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
      onClick={onSelect}
      title="Click to view URL"
    >
      {/* Image */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
        {imgError ? (
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">No preview</span>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-xs font-semibold text-gray-700">View URL</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2.5 py-2 flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-700 font-medium truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{item.folder}</p>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleCopy}
            title="Copy URL"
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Remove from library"
            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
