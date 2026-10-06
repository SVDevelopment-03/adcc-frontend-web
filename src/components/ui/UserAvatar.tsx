import React, { useEffect, useState } from 'react';

interface UserAvatarProps {
  name?: string;
  /** Uploaded profile photo. When missing (or it fails to load) the name's initials are shown. */
  src?: string | null;
  /** Size and text size, e.g. "w-10 h-10 text-sm". */
  className?: string;
}

/** "Ritika Sinha" -> "RS", "Vignesh" -> "V" */
export const getInitials = (name?: string): string => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = Array.from(words[0])[0] || '';
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] || '' : '';
  return (first + last).toUpperCase();
};

export function UserAvatar({ name, src, className = 'w-10 h-10 text-sm' }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={`rounded-full object-cover shrink-0 ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-medium text-white select-none ${className}`}
      style={{ backgroundColor: '#C12D32' }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
