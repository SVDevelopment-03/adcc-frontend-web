import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getMerchandiseProducts } from '../../services/merchandiseApi';

export interface ProductPickerModalProps {
  onClose: () => void;
  onSelect: (id: string, title?: string) => void;
}

export default function ProductPickerModal({ onClose, onSelect }: ProductPickerModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const results = await getMerchandiseProducts({ q: query, limit: 20 });
        if (!mounted) return;
        setItems(results || []);
      } catch (e) {
        console.error('Failed to load products', e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Select product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>
        <div className="mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="max-h-96 overflow-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No products found</p>
          ) : (
            <ul className="space-y-2">
              {items.map((p) => (
                <li key={p.id || p._id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.image ? (
                      <img src={p.image} alt={p.title || p.name} className="w-12 h-8 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-8 bg-gray-100 rounded" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.title || p.name || p.id}</div>
                      <div className="text-xs text-gray-500 truncate">{p.id || p._id}</div>
                    </div>
                  </div>
                  <div>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() => onSelect(String(p.id || p._id), p.title || p.name)}
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
