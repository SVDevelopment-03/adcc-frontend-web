import { toast } from 'sonner';

/** Only PNG and JPG/JPEG may be uploaded from any dashboard form. */
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];
/** Value for the `accept` attribute of every image file input. */
export const ALLOWED_IMAGE_ACCEPT = 'image/png,image/jpeg,.png,.jpg,.jpeg';

export const MAX_IMAGE_UPLOAD_SIZE_MB = 1;
export const MAX_IMAGE_UPLOAD_SIZE = MAX_IMAGE_UPLOAD_SIZE_MB * 1024 * 1024;

export const IMAGE_UPLOAD_HINT = `PNG, JPG or JPEG — max ${MAX_IMAGE_UPLOAD_SIZE_MB}MB`;

/** Returns a user-facing error message, or null when the file is acceptable. */
export const getImageFileError = (file: File): string | null => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  // Both must agree: a renamed .webp/.gif keeps its real MIME type, and some
  // browsers report an empty type, in which case the extension decides.
  const typeOk = file.type ? ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) : true;
  const extensionOk = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!typeOk || !extensionOk) {
    return `"${file.name}" is not a supported file type. Only PNG, JPG and JPEG images are allowed.`;
  }
  if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return `"${file.name}" is ${sizeMb}MB. Image size must not exceed ${MAX_IMAGE_UPLOAD_SIZE_MB}MB.`;
  }
  return null;
};

/** Validates one file and shows a toast when it is rejected. */
export const validateImageFile = (file: File | null | undefined): file is File => {
  if (!file) return false;
  const error = getImageFileError(file);
  if (error) {
    toast.error(error);
    return false;
  }
  return true;
};

/** Keeps the acceptable files of a multi-select and shows a toast for each rejected one. */
export const filterValidImageFiles = (files: FileList | File[] | null | undefined): File[] => {
  if (!files) return [];
  return Array.from(files).filter((file) => validateImageFile(file));
};
