import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckSquare, Shield, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
  createRole,
  getAllPermissions,
  type RbacPermission,
} from '../../services/rbacService';

type PermissionRow = {
  id: string;
  name: string;
  key: string;
  group: string;
  sortOrder: number;
};

function toPermissionRow(perm: RbacPermission): PermissionRow | null {
  const id = (perm._id || perm.id || perm.key || '').toString();
  if (!id) return null;
  return {
    id,
    key: (perm.key || id).toString(),
    name: (perm.name || perm.key || id).toString(),
    group: (perm.group || 'Other').toString(),
    sortOrder: Number(perm.sortOrder ?? 9999),
  };
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function RoleCreate() {
  const navigate = useNavigate();

  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const permissions = await getAllPermissions();
        const rows = permissions
          .map(toPermissionRow)
          .filter((row): row is PermissionRow => row !== null)
          .sort((a, b) => {
            if (a.group !== b.group) return a.group.localeCompare(b.group);
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.name.localeCompare(b.name);
          });
        setPermissionRows(rows);
      } catch (error: any) {
        console.error('Error loading permissions', error);
        toast.error(error?.response?.data?.message || 'Failed to load permissions');
        setPermissionRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  const grouped = useMemo(() => {
    const map = new Map<string, PermissionRow[]>();
    permissionRows.forEach((row) => {
      const list = map.get(row.group) ?? [];
      list.push(row);
      map.set(row.group, list);
    });
    return Array.from(map.entries()).map(([group, rows]) => ({ group, rows }));
  }, [permissionRows]);

  const togglePermission = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSave = useMemo(() => {
    if (saving || loading) return false;
    return name.trim().length > 0 && slug.trim().length >= 2;
  }, [loading, name, saving, slug]);

  const handleSave = async () => {
    const nextName = name.trim();
    const nextSlug = slugify(slug);
    if (!nextName) {
      toast.error('Role name is required');
      return;
    }
    if (nextSlug.length < 2) {
      toast.error('Role slug must be at least 2 characters');
      return;
    }

    try {
      setSaving(true);
      const created = await createRole({
        name: nextName,
        slug: nextSlug,
        description: description.trim() || undefined,
        status,
        permissionIds: Array.from(selectedIds),
      });
      toast.success('Role created');
      const createdId = (created?._id || created?.id || '').toString();
      navigate(createdId ? `/roles/${encodeURIComponent(createdId)}` : '/roles');
    } catch (error: any) {
      console.error('Error creating role', error);
      toast.error(error?.response?.data?.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate('/roles')}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#C12D32' }} />
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: '#C12D32',
            color: 'white',
            opacity: canSave ? 1 : 0.6,
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'Creating…' : 'Create Role'}
        </button>
      </div>

      <div>
        <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Create Role</h1>
        <p style={{ color: '#666' }}>Define a new role and choose its permissions</p>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
            <Shield className="w-6 h-6" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: '#333' }}>Role Information</div>
            <div className="text-sm" style={{ color: '#666' }}>Basic details about the role</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2" style={{ color: '#333' }}>Role Name *</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Event Coordinator"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <div className="text-sm mb-2" style={{ color: '#333' }}>Slug *</div>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="e.g. event-coordinator"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="text-xs mt-1" style={{ color: '#999' }}>
              Lowercase letters, numbers, underscores and hyphens only
            </div>
          </div>
          <div>
            <div className="text-sm mb-2" style={{ color: '#333' }}>Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <div className="text-sm mb-2" style={{ color: '#333' }}>Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
            <CheckSquare className="w-6 h-6" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: '#333' }}>Permissions</div>
            <div className="text-sm" style={{ color: '#666' }}>{selectedIds.size} permissions selected</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : null}

        {!loading && grouped.length === 0 ? (
          <div className="text-sm" style={{ color: '#666' }}>No permissions available</div>
        ) : null}

        {!loading && grouped.length > 0 ? (
          <div className="space-y-6">
            {grouped.map((g) => {
              const selectedInGroup = g.rows.filter((r) => selectedIds.has(r.id)).length;
              return (
                <div key={g.group}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium" style={{ color: '#333' }}>{g.group}</div>
                    <div className="text-sm" style={{ color: '#666' }}>
                      {selectedInGroup}/{g.rows.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {g.rows.map((perm) => {
                      const checked = selectedIds.has(perm.id);
                      return (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className="p-4 rounded-xl border text-left flex items-start gap-3"
                          style={{
                            borderColor: checked ? '#ECC180' : '#E5E7EB',
                            backgroundColor: checked ? '#FFF9EF' : '#fff',
                          }}
                        >
                          <div className="mt-0.5">
                            {checked ? (
                              <CheckSquare className="w-5 h-5" style={{ color: '#CF9F0C' }} />
                            ) : (
                              <Square className="w-5 h-5" style={{ color: '#999' }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium" style={{ color: '#333' }}>{perm.name}</div>
                            <div className="text-xs mt-1 truncate" style={{ color: '#999' }}>{perm.key}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
