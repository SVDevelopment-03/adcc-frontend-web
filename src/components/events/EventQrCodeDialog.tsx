import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Download, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Public page of the event the QR code opens */
  eventUrl: string;
  eventTitle: string;
}

/** QR code of an event's public page, downloadable as a print-size PNG. */
export function EventQrCodeDialog({ open, onClose, eventUrl, eventTitle }: Props) {
  const { t } = useTranslation();
  // Downloads come from a hidden full-size canvas so the printed code stays sharp
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);

  if (!open) return null;

  const handleDownload = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${eventTitle.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'event'}_qr.png`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success(t('events.detail.qr.linkCopied'));
    } catch {
      toast.error(t('events.detail.qr.copyFailed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
              <QrCode className="w-5 h-5" style={{ color: '#C12D32' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#333' }}>
              {t('events.detail.qr.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('events.detail.qr.close')}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#666' }} />
          </button>
        </div>

        <p className="text-sm mb-5" style={{ color: '#666' }}>
          {t('events.detail.qr.description')}
        </p>

        <div className="flex justify-center rounded-xl border border-gray-200 p-5">
          <QRCodeCanvas value={eventUrl} size={240} level="M" marginSize={1} />
        </div>
        <QRCodeCanvas
          ref={downloadCanvasRef}
          value={eventUrl}
          size={1024}
          level="M"
          marginSize={4}
          style={{ display: 'none' }}
        />

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <span className="flex-1 truncate text-sm" style={{ color: '#333' }} title={eventUrl}>
            {eventUrl}
          </span>
          <button
            onClick={handleCopy}
            aria-label={t('events.detail.qr.copyLink')}
            title={t('events.detail.qr.copyLink')}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" style={{ color: '#666' }} />
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm transition-all hover:bg-gray-50"
            style={{ color: '#666' }}
          >
            {t('events.detail.qr.close')}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Download className="w-4 h-4" />
            {t('events.detail.qr.download')}
          </button>
        </div>
      </div>
    </div>
  );
}
