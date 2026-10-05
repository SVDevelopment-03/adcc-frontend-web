import React from 'react';
import { useTranslation } from 'react-i18next';

interface EventClosedOverlayProps {
  /** Smaller stamp for thumbnails (e.g. the 128px dashboard list image). */
  size?: 'sm' | 'md';
  /** Stamp text; defaults to "Event Closed". */
  label?: string;
}

/**
 * Watermark for the image of an event that is over. Render it inside a
 * `position: relative; overflow: hidden` wrapper around the image.
 */
export function EventClosedOverlay({ size = 'md', label }: EventClosedOverlayProps) {
  const { t } = useTranslation();
  const small = size === 'sm';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <span
        style={{
          transform: 'rotate(-12deg)',
          border: `${small ? 2 : 3}px solid rgba(255, 255, 255, 0.9)`,
          borderRadius: small ? 6 : 10,
          padding: small ? '3px 8px' : '6px 18px',
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: small ? 11 : 20,
          fontWeight: 800,
          letterSpacing: small ? 1 : 3,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        {label ?? t('common.eventClosed', 'Event Closed')}
      </span>
    </div>
  );
}
