import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getMediaFile } from '../../services/mediaApi';
import { ImagePickerModal, type PickedImage } from './ImagePickerModal';

/** Library folder for images uploaded from the picker, by the dashboard page it was opened on. */
const FOLDER_BY_PATH: Array<[RegExp, string]> = [
  [/^\/events/, 'events'],
  [/^\/tracks/, 'tracks'],
  [/^\/communities/, 'community'],
  [/^\/challenges/, 'challenges'],
  [/^\/badges/, 'badges'],
  [/^\/news/, 'news'],
  [/^\/(admins|users)/, 'members'],
  [/^\/merchandise/, 'merchandise-products'],
  [/^\/static-data/, 'lookup-icons'],
];

const uploadFolderForCurrentPage = (): string => {
  const path = window.location.pathname;
  return FOLDER_BY_PATH.find(([pattern]) => pattern.test(path))?.[1] ?? 'content';
};

const isImageFileInput = (element: EventTarget | null): element is HTMLInputElement =>
  element instanceof HTMLInputElement &&
  element.type === 'file' &&
  !element.disabled &&
  // `data-native-file` opts an input out (the Media Library's own upload fields)
  element.dataset.nativeFile === undefined &&
  /image\/|\.(png|jpe?g|webp|gif)/i.test(element.accept || '');

/**
 * Makes every image upload field in the dashboard go through the Media Library.
 *
 * Clicking any image `<input type="file">` opens the library picker instead of
 * the computer's file dialog. The admin either picks an existing image or
 * uploads a new one (which is saved to the library first); the chosen image is
 * then placed on the input as a normal File and its `change` event fired, so
 * each form's existing upload code runs unchanged.
 */
export function MediaLibraryUploadBridge() {
  const [input, setInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isImageFileInput(event.target)) return;
      event.preventDefault();
      setInput(event.target);
    };
    // Capture phase: also catches clicks forwarded from a <label> or `inputRef.click()`
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const close = useCallback(() => setInput(null), []);

  const handlePick = async (picked: PickedImage[]) => {
    const target = input;
    setInput(null);
    if (!target || !target.isConnected) return;

    const loadingToast = picked.some((p) => !p.file) ? toast.loading('Adding image…') : undefined;
    try {
      const files = await Promise.all(picked.map((p) => p.file ?? getMediaFile(p.item)));
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      target.files = transfer.files;
      target.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to use the selected image');
    } finally {
      if (loadingToast !== undefined) toast.dismiss(loadingToast);
    }
  };

  if (!input) return null;

  return (
    <ImagePickerModal
      uploadFolder={uploadFolderForCurrentPage()}
      multiple={input.multiple}
      onClose={close}
      onPick={(picked) => void handlePick(picked)}
    />
  );
}
