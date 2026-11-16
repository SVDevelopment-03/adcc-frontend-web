import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminFeedPost } from '../../services/feedPostsApi';
import {
  FEED_IMAGE_ACCEPT,
  FEED_IMAGE_MAX_SIZE_MB,
  FEED_VIDEO_ACCEPT,
  FEED_VIDEO_MAX_DURATION_SECONDS,
  FEED_VIDEO_MAX_SIZE_MB,
  validateFeedImage,
  validateFeedVideo,
} from '../../utils/feedMediaValidation';

const TITLE_MAX = 150;
const DESCRIPTION_MAX = 2000;

interface CreateFeedPostModalProps {
  onClose: () => void;
  /** Called after a successful create so the list and counts can refresh. */
  onCreated: (status: 'approved' | 'pending') => void;
}

/** Object URL for a local file preview, revoked when the file changes or on unmount. */
function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export function CreateFeedPostModal({ onClose, onCreated }: CreateFeedPostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'approved' | 'pending'>('approved');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [checkingVideo, setCheckingVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imagePreview = useObjectUrl(imageFile);
  const videoPreview = useObjectUrl(videoFile);

  const titleError = !title.trim() ? 'Title is required.' : null;
  const descriptionError = !description.trim() ? 'Description is required.' : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after an error
    if (!file) return;
    const error = validateFeedImage(file);
    setImageError(error);
    setImageFile(error ? null : file);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCheckingVideo(true);
    try {
      const error = await validateFeedVideo(file);
      setVideoError(error);
      setVideoFile(error ? null : file);
    } finally {
      setCheckingVideo(false);
    }
  };

  const handleSubmit = async () => {
    setTriedSubmit(true);
    if (titleError || descriptionError || checkingVideo) return;

    setSubmitting(true);
    try {
      await createAdminFeedPost({
        title: title.trim(),
        description: description.trim(),
        imageFile,
        videoFile,
        status,
      });
      toast.success(status === 'approved' ? 'Post published to the feed' : 'Post saved as pending');
      onCreated(status);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || checkingVideo;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl" style={{ color: '#333' }}>Create Feed Post</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" style={{ color: '#666' }} />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: '#666' }}>
          Published posts appear in the app feed and in “Voices from the Community” on the home page.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#333' }}>
              Title <span style={{ color: '#C12D32' }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="e.g. Sunrise ride at Al Qudra"
              className="w-full rounded-xl border px-4 py-2.5 outline-none"
              style={{ color: '#333', borderColor: triedSubmit && titleError ? '#C12D32' : '#E5E7EB' }}
            />
            <div className="flex justify-between mt-1 text-xs">
              <span style={{ color: '#C12D32' }}>{triedSubmit ? titleError : null}</span>
              <span style={{ color: '#999' }}>{title.length}/{TITLE_MAX}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#333' }}>
              Description <span style={{ color: '#C12D32' }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESCRIPTION_MAX}
              rows={4}
              placeholder="This is the quote shown on the home page card."
              className="w-full rounded-xl border px-4 py-3 outline-none resize-none"
              style={{ color: '#333', borderColor: triedSubmit && descriptionError ? '#C12D32' : '#E5E7EB' }}
            />
            <div className="flex justify-between mt-1 text-xs">
              <span style={{ color: '#C12D32' }}>{triedSubmit ? descriptionError : null}</span>
              <span style={{ color: '#999' }}>{description.length}/{DESCRIPTION_MAX}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image */}
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#333' }}>Image</p>
              <p className="text-xs mb-2" style={{ color: '#999' }}>
                JPG, PNG or WebP · max {FEED_IMAGE_MAX_SIZE_MB}MB. Used as the video thumbnail when both are added.
              </p>
              <input
                ref={imageInputRef}
                type="file"
                accept={FEED_IMAGE_ACCEPT}
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="" className="w-full h-40 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                  style={{ borderColor: imageError ? '#C12D32' : '#E5E7EB', color: '#666' }}
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">Upload image</span>
                </button>
              )}
              {imageError ? <p className="text-xs mt-1" style={{ color: '#C12D32' }}>{imageError}</p> : null}
            </div>

            {/* Video */}
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#333' }}>Video</p>
              <p className="text-xs mb-2" style={{ color: '#999' }}>
                MP4, MOV or WebM · max {FEED_VIDEO_MAX_SIZE_MB}MB · up to {FEED_VIDEO_MAX_DURATION_SECONDS / 60} min.
              </p>
              <input
                ref={videoInputRef}
                type="file"
                accept={FEED_VIDEO_ACCEPT}
                className="hidden"
                onChange={(e) => void handleVideoChange(e)}
              />
              {videoPreview ? (
                <div className="relative">
                  <video
                    src={videoPreview}
                    poster={imagePreview ?? undefined}
                    controls
                    muted
                    className="w-full h-40 rounded-lg object-cover bg-black"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    aria-label="Remove video"
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={checkingVideo}
                  className="w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                  style={{ borderColor: videoError ? '#C12D32' : '#E5E7EB', color: '#666' }}
                >
                  <Video className="w-6 h-6" />
                  <span className="text-sm">{checkingVideo ? 'Checking video…' : 'Upload video'}</span>
                </button>
              )}
              {videoError ? <p className="text-xs mt-1" style={{ color: '#C12D32' }}>{videoError}</p> : null}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#333' }}>Visibility</p>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#333' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feed-post-status"
                  checked={status === 'approved'}
                  onChange={() => setStatus('approved')}
                />
                Publish now
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feed-post-status"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                />
                Save as pending (publish later from the Pending tab)
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-200"
            style={{ color: '#666' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#C12D32' }}
          >
            {submitting ? (videoFile ? 'Uploading video…' : 'Saving…') : status === 'approved' ? 'Publish Post' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
