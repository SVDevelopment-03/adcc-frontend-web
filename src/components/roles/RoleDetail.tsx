import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Edit, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRbacRoles,
  getRoleById,
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
    return {
      id: perm,
      name: perm,
      key: perm,
      group: 'Other',
      sortOrder: 9999,
    };
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

function formatDate(input?: string | null): string {
  if (!input) return '—';
  const t = new Date(input).getTime();
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RoleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [role, setRole] = useState<RbacRole | null>(null);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const roleId = useMemo(() => (role?._id || role?.id || id || '').toString() || null, [role?._id, role?.id, id]);
  const isSystemRole = role?.isSystem === true || (role as any)?.isSystemRole === true;

  const rolePermissionIds = useMemo(() => {
    if (!role) return new Set<string>();
    return new Set((role.permissions || []).map(getPermissionId).filter(Boolean));
  }, [role]);

  useEffect(() => {
    const load = async () => {
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
      } catch (error: any) {
        console.error('Error loading role', error);
        toast.error(error?.response?.data?.message || 'Failed to load role');
        setRole(null);
        setPermissionRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const selectedPermissionsByGroup = useMemo(() => {
    if (!role) return [];
    const selected = permissionRows.filter((p) => rolePermissionIds.has(p.id));
    const map = new Map<string, PermissionRow[]>();
    selected.forEach((row) => {
      const list = map.get(row.group) ?? [];
      list.push(row);
      map.set(row.group, list);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, rows]) => ({
        group,
        rows: rows.sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name)),
      }));
  }, [permissionRows, role, rolePermissionIds]);

  const permissionCount = useMemo(() => rolePermissionIds.size, [rolePermissionIds]);
  const lastModified =
    (role as any)?.updatedAt ||
    (role as any)?.lastModified ||
    (role as any)?.modifiedAt ||
    null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white"
            aria-label="Back to roles"
            style={{ borderColor: '#ECC180' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {role ? (
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isSystemRole ? '#FFF9EF' : '#EFF6FF' }}
              >
                <Shield className="w-8 h-8" style={{ color: isSystemRole ? '#C12D32' : '#3B82F6' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl" style={{ color: '#333' }}>{role.name}</h1>
                  {isSystemRole ? (
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#FFF9EF', color: '#C12D32' }}
                    >
                      System Role
                    </span>
                  ) : null}
                </div>
                <p className="mt-1" style={{ color: '#666' }}>{role.description || '—'}</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl" style={{ color: '#333' }}>Role Details</h1>
              <p style={{ color: '#666' }}>View role permissions</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => roleId && navigate(`/roles/${encodeURIComponent(roleId)}/edit`)}
          disabled={!roleId}
          className="px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2"
          style={{ backgroundColor: '#C12D32', color: 'white', opacity: roleId ? 1 : 0.6 }}
        >
          <Edit className="w-4 h-4" />
          Edit Role
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      {!loading && !role ? (
        <div className="p-12 rounded-2xl shadow-sm bg-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#CCC' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: '#333' }}>Role not found</h3>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="mt-4 px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white"
            style={{ color: '#333' }}
          >
            Back to Roles
          </button>
        </div>
      ) : null}

      {!loading && role ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#C12D32' }} />
                </div>
                <span className="text-sm" style={{ color: '#666' }}>Total Permissions</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>{permissionCount}</p>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
                  <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
                </div>
                <span className="text-sm" style={{ color: '#666' }}>Assigned Users</span>
              </div>
              <p className="text-3xl" style={{ color: '#333' }}>—</p>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
                </div>
                <span className="text-sm" style={{ color: '#666' }}>Last Modified</span>
              </div>
              <p className="text-sm" style={{ color: '#333' }}>{formatDate(lastModified)}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-lg font-medium" style={{ color: '#333' }}>Permissions</h2>
              <p className="text-sm mt-1" style={{ color: '#666' }}>All capabilities granted to this role</p>
            </div>

            {selectedPermissionsByGroup.length === 0 ? (
              <div className="text-sm" style={{ color: '#666' }}>No permissions assigned</div>
            ) : (
              <div className="space-y-6">
                {selectedPermissionsByGroup.map((g) => (
                  <div key={g.group} className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                      <h3 className="font-medium" style={{ color: '#333' }}>{g.group}</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'white', color: '#666' }}>
                        {g.rows.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                      {g.rows.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-start gap-3 p-3 rounded-lg"
                          style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                        >
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: '#333' }}>{perm.name}</p>
                            <p className="text-xs mt-1" style={{ color: '#666' }}>{perm.key}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

