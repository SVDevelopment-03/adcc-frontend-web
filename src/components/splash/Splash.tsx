import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function Splash({ onDone }: { onDone: () => void }) {
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video'; duration?: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get('/splash').then((resp) => {
      if (!mounted) return;
      if (resp.status === 200 && resp.data) {
        setMedia(resp.data.data || resp.data);
      } else {
        onDone();
      }
    }).catch(() => onDone());

    return () => { mounted = false; };
  }, [onDone]);

  useEffect(() => {
    if (!media) return;
    if (media.type === 'image') {
      const t = setTimeout(onDone, (media.duration || 3) * 1000);
      return () => clearTimeout(t);
    }
    // For video, we don't handle here — let it play in markup and fire ended event
  }, [media, onDone]);

  if (!media) return null;

  if (media.type === 'image') {
    return (
      <div className="min-h-screen w-full">
        <img src={media.url} alt="splash" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <video src={media.url} autoPlay muted playsInline onEnded={onDone} className="w-full h-full object-cover" />
    </div>
  );
}
