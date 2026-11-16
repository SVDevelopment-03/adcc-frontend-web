/**
 * Homepage banner video checks. Mirrors PAGE_VIDEO_MIME_TYPES /
 * PAGE_VIDEO_MAX_SIZE_MB in adcc-backend/src/middleware/upload.middleware.ts —
 * keep them in sync. The server re-checks type, size and the file's bytes.
 */
export const BANNER_VIDEO_MAX_SIZE_MB = 50;
export const BANNER_VIDEO_ACCEPT = 'video/mp4,video/webm,.mp4,.webm';
export const BANNER_VIDEO_HINT = `MP4 or WebM — max ${BANNER_VIDEO_MAX_SIZE_MB}MB. Plays muted and on loop, so keep it short (10–30 s).`;

const TYPES = new Set(['video/mp4', 'video/webm']);
const EXTENSIONS = new Set(['mp4', 'webm']);

/** Loads the video's metadata so files the browser can't play are rejected up front. */
const canPlay = (file: File): Promise<boolean> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    const done = (ok: boolean) => {
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    video.onloadedmetadata = () => done(true);
    video.onerror = () => done(false);
    video.src = url;
  });

/** Returns a user-facing error message, or null when the video is acceptable. */
export async function getBannerVideoError(file: File): Promise<string | null> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeOk = file.type ? TYPES.has(file.type.toLowerCase()) : true;
  if (!typeOk || !EXTENSIONS.has(extension)) {
    return `"${file.name}" is not a supported video. Only MP4 and WebM files are allowed.`;
  }
  if (file.size === 0) return `"${file.name}" is empty.`;
  if (file.size > BANNER_VIDEO_MAX_SIZE_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `"${file.name}" is ${sizeMb}MB. Video size must not exceed ${BANNER_VIDEO_MAX_SIZE_MB}MB.`;
  }
  if (!(await canPlay(file))) {
    return `"${file.name}" can't be played in the browser. Export it as an H.264 MP4 and try again.`;
  }
  return null;
}
