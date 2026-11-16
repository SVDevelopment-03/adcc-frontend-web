/**
 * Client-side checks for admin feed post media. Mirrors the server limits in
 * adcc-backend/src/middleware/upload.middleware.ts (uploadFeedAdminMedia) —
 * keep the two in sync. The server re-validates everything (including the
 * file's actual bytes), so these checks are for fast, friendly feedback.
 */

export const FEED_IMAGE_MAX_SIZE_MB = 5;
export const FEED_VIDEO_MAX_SIZE_MB = 50;
export const FEED_VIDEO_MAX_DURATION_SECONDS = 120;

export const FEED_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const FEED_VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/webm';

const IMAGE_TYPES = new Set(FEED_IMAGE_ACCEPT.split(','));
const VIDEO_TYPES = new Set(FEED_VIDEO_ACCEPT.split(','));
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm)$/i;

const MB = 1024 * 1024;

/** Returns an error message, or null when the image is acceptable. */
export function validateFeedImage(file: File): string | null {
  if (!IMAGE_TYPES.has(file.type) || !IMAGE_EXTENSIONS.test(file.name)) {
    return 'Image must be a JPG, PNG or WebP file.';
  }
  if (file.size === 0) return 'The selected image is empty.';
  if (file.size > FEED_IMAGE_MAX_SIZE_MB * MB) {
    return `Image must be ${FEED_IMAGE_MAX_SIZE_MB}MB or smaller (selected file is ${(file.size / MB).toFixed(1)}MB).`;
  }
  return null;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    video.src = url;
  });
}

/**
 * Returns an error message, or null when the video is acceptable.
 * Async because it loads the video's metadata to check it is playable and
 * within the duration limit.
 */
export async function validateFeedVideo(file: File): Promise<string | null> {
  if (!VIDEO_TYPES.has(file.type) || !VIDEO_EXTENSIONS.test(file.name)) {
    return 'Video must be an MP4, MOV or WebM file.';
  }
  if (file.size === 0) return 'The selected video is empty.';
  if (file.size > FEED_VIDEO_MAX_SIZE_MB * MB) {
    return `Video must be ${FEED_VIDEO_MAX_SIZE_MB}MB or smaller (selected file is ${(file.size / MB).toFixed(1)}MB).`;
  }

  let duration: number;
  try {
    duration = await readVideoDuration(file);
  } catch {
    // MOV (HEVC) files often can't be decoded by Chrome/Firefox even though
    // they are valid; don't block them, the server still checks the bytes.
    if (file.type === 'video/quicktime') return null;
    return 'This video could not be read. Please choose a different file.';
  }
  if (Number.isFinite(duration) && duration > FEED_VIDEO_MAX_DURATION_SECONDS) {
    return `Video must be ${FEED_VIDEO_MAX_DURATION_SECONDS / 60} minutes or shorter (selected video is ${Math.round(duration)}s).`;
  }
  return null;
}
