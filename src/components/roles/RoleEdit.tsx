import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, AlertTriangle, Shield, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
  addPermissionToRole,
  getRbacRoles,
  getRoleById,
  removePermissionFromRole,
  updateRole,
  type RbacPermission,
  type RbacRole,
} from '../../services/rbacService';

type PermissionRow = {
  id: string;
  name: string;
  key: string;
  group: string;
  sortOrder: number;
};

function getPermissionId(perm: string | RbacPermission): string {
  if (typeof perm === 'string') return perm;
  return (perm._id || perm.id || perm.key || '').toString();
}

function extractPermissionMeta(perm: string | RbacPermission): PermissionRow | null {
  if (typeof perm === 'string') {
    return { id: perm, name: perm, key: perm, group: 'Other', sortOrder: 9999 };
  }
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

type GroupedPermissions = {
  group: string;
  rows: PermissionRow[];
};

export function RoleEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [role, setRole] = useState<RbacRole | null>(null);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const roleId = useMemo(() => {
    const candidate = (role?._id || role?.id || id || '').toString();
    return candidate || null;
  }, [role?._id, role?.id, id]);

  const isSystemRole = role?.isSystem === true;

  const rolePermissionIds = useMemo(() => {
    if (!role) return new Set<string>();
    return new Set((role.permissions || []).map(getPermissionId).filter(Boolean));
  }, [role]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [r, roles] = await Promise.all([getRoleById(id), getRbacRoles()]);

      const permissionMap = new Map<string, PermissionRow>();
      roles.forEach((rr) => {
        (rr.permissions || []).forEach((perm) => {
          const meta = extractPermissionMeta(perm);
          if (!meta) return;
          const existing = permissionMap.get(meta.id);
          if (!existing || (existing.name === existing.id && meta.name !== meta.id)) {
            permissionMap.set(meta.id, meta);
          }
        });
      });

      const rows = Array.from(permissionMap.values()).sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });

      setRole(r);
      setPermissionRows(rows);
      setName(r?.name ?? '');
      setDescription(r?.description ?? '');
    } catch (error: any) {
      console.error('Error loading role', error);
      toast.error(error?.response?.data?.message || 'Failed to load role');
      setRole(null);
      setPermissionRows([]);
      setName('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
  }, [role?.name, role?.description]);

  const grouped = useMemo<GroupedPermissions[]>(() => {
    const map = new Map<string, PermissionRow[]>();
    permissionRows.forEach((row) => {
      const list = map.get(row.group) ?? [];
      list.push(row);
      map.set(row.group, list);
    });
    return Array.from(map.entries()).map(([group, rows]) => ({ group, rows }));
  }, [permissionRows]);

  const selectedCount = useMemo(() => rolePermissionIds.size, [rolePermissionIds]);

  const togglePermission = async (perm: PermissionRow) => {
    if (!roleId || !role) return;
    const has = rolePermissionIds.has(perm.id);
    try {
      setSaving(true);
      if (has) {
        await removePermissionFromRole(roleId, perm.id);
      } else {
        await addPermissionToRole(roleId, perm.id);
      }
      await load();
      toast.success(has ? 'Permission removed' : 'Permission added');
    } catch (error: any) {
      console.error('Error updating role permission', error);
      toast.error(error?.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const canSaveMeta = useMemo(() => {
    if (!roleId || !role) return false;
    if (saving || loading) return false;
    const nextName = name.trim();
    const nextDesc = description.trim();
    const baseName = String(role.name ?? '').trim();
    const baseDesc = String(role.description ?? '').trim();
    if (!nextName) return false;
    return nextName !== baseName || nextDesc !== baseDesc;
  }, [description, loading, name, role, roleId, saving]);

  const handleSave = async () => {
    if (!roleId || !role) return;
    const nextName = name.trim();
    if (!nextName) {
      toast.error('Role name is required');
      return;
    }

    try {
      setSaving(true);
      await updateRole(roleId, { name: nextName, description: description.trim() || null });
      await load();
      toast.success('Role updated');
    } catch (error: any) {
      console.error('Error updating role', error);
      toast.error(error?.response?.data?.message || 'Failed to update role');
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
          disabled={!canSaveMeta}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: '#C12D32',
            color: 'white',
            opacity: canSaveMeta ? 1 : 0.6,
            cursor: canSaveMeta ? 'pointer' : 'not-allowed',
          }}
        >
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      {!loading && !role ? (
        <div className="p-6 rounded-2xl shadow-sm bg-white text-center" style={{ color: '#666' }}>
          Role not found
        </div>
      ) : null}

      {!loading && role ? (
        <>
          <div>
            <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Edit Role</h1>
            <p style={{ color: '#666' }}>
              Update role details and permissions
            </p>
          </div>

          {isSystemRole ? (
            <div className="p-4 rounded-2xl border-l-4" style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                <div>
                  <div className="font-medium" style={{ color: '#333' }}>System Role</div>
                  <div className="text-sm" style={{ color: '#666' }}>
                    This is a system role. Changes may affect core access controls.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

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
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
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
                <div className="text-sm" style={{ color: '#666' }}>{selectedCount} permissions selected</div>
              </div>
            </div>

            <div className="space-y-6">
              {grouped.map((g) => {
                const selectedInGroup = g.rows.filter((r) => rolePermissionIds.has(r.id)).length;
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
                        const checked = rolePermissionIds.has(perm.id);
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            disabled={saving}
                            onClick={() => void togglePermission(perm)}
                            className="p-4 rounded-xl border text-left flex items-start gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>
        </>
      ) : null}
    </div>
  );
}
