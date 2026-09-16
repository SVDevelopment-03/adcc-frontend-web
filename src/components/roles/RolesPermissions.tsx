import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, PencilLine, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getRbacRoles,
  updatePermission,
  type RbacPermission,
  type RbacRole,
} from '../../services/rbacService';

type PermissionFormState = {
  key: string;
  name: string;
  description: string;
  group: string;
  sortOrder: number;
};

const emptyPermissionForm = (): PermissionFormState => ({
  key: '',
  name: '',
  description: '',
  group: 'General',
  sortOrder: 0,
});

export function RolesPermissions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [permissionForm, setPermissionForm] = useState<PermissionFormState>(emptyPermissionForm());
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const [savingPermission, setSavingPermission] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const [list, permissionList] = await Promise.all([getRbacRoles(), getAllPermissions()]);
      setRoles(list);
      setPermissions(permissionList);
    } catch (error: any) {
      console.error('Error loading roles and permissions', error);
      toast.error(error?.response?.data?.message || 'Failed to load RBAC data');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => {
      const name = String(r.name ?? '').toLowerCase();
      const slug = String(r.slug ?? '').toLowerCase();
      const desc = String(r.description ?? '').toLowerCase();
      return name.includes(q) || slug.includes(q) || desc.includes(q);
    });
  }, [roles, searchQuery]);

  const filteredPermissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      const key = String(p.key ?? '').toLowerCase();
      const name = String(p.name ?? '').toLowerCase();
      const group = String(p.group ?? '').toLowerCase();
      const description = String(p.description ?? '').toLowerCase();
      return key.includes(q) || name.includes(q) || group.includes(q) || description.includes(q);
    });
  }, [permissions, searchQuery]);

  const submitPermission = async () => {
    const key = permissionForm.key.trim();
    const name = permissionForm.name.trim();
    if (!key || !name) {
      toast.error('Permission key and name are required');
      return;
    }

    try {
      setSavingPermission(true);
      if (editingPermissionId) {
        await updatePermission(editingPermissionId, {
          key,
          name,
          description: permissionForm.description.trim() || undefined,
          group: permissionForm.group.trim() || 'General',
          sortOrder: Number(permissionForm.sortOrder) || 0,
        });
        toast.success('Permission updated');
      } else {
        await createPermission({
          key,
          name,
          description: permissionForm.description.trim() || undefined,
          group: permissionForm.group.trim() || 'General',
          sortOrder: Number(permissionForm.sortOrder) || 0,
        });
        toast.success('Permission created');
      }
      setPermissionForm(emptyPermissionForm());
      setEditingPermissionId(null);
      await loadRoles();
    } catch (error: any) {
      console.error('Permission save failed', error);
      toast.error(error?.response?.data?.message || 'Failed to save permission');
    } finally {
      setSavingPermission(false);
    }
  };

  const editPermission = (permission: RbacPermission) => {
    setEditingPermissionId((permission._id || permission.id || '').toString());
    setPermissionForm({
      key: String(permission.key || ''),
      name: String(permission.name || ''),
      description: String(permission.description || ''),
      group: String(permission.group || 'General'),
      sortOrder: Number(permission.sortOrder ?? 0),
    });
    setActiveTab('permissions');
  };

  const deletePermissionRecord = async (permissionId: string) => {
    const confirmed = window.confirm('Delete this permission? It will be removed from the permission catalog.');
    if (!confirmed) return;
    try {
      await deletePermission(permissionId);
      toast.success('Permission deleted');
      await loadRoles();
      if (editingPermissionId === permissionId) {
        setEditingPermissionId(null);
        setPermissionForm(emptyPermissionForm());
      }
    } catch (error: any) {
      console.error('Error deleting permission', error);
      toast.error(error?.response?.data?.message || 'Failed to delete permission');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('roles.title')}</h1>
          <p style={{ color: '#666' }}>Create and manage user roles with custom permissions</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm inline-flex items-center gap-2 bg-white"
            style={{ color: '#333' }}
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
          <button
            type="button"
            onClick={() => navigate('/roles/create')}
            className="px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2"
            style={{ backgroundColor: '#C12D32', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: activeTab === 'roles' ? '#C12D32' : '#F3F4F6',
              color: activeTab === 'roles' ? 'white' : '#333',
            }}
          >
            Roles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: activeTab === 'permissions' ? '#C12D32' : '#F3F4F6',
              color: activeTab === 'permissions' ? 'white' : '#333',
            }}
          >
            Permissions
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'roles' ? 'Search roles by name or description...' : 'Search permissions by key or name...'}
            className="w-full pl-10 h-11 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      {!loading && activeTab === 'roles' ? (
        <>
          {!filteredRoles.length ? (
            <div className="p-12 rounded-2xl shadow-sm bg-white text-center">
              <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#CCC' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#333' }}>No roles found</h3>
              <p style={{ color: '#666' }}>
                {searchQuery.trim() ? 'Try adjusting your search query' : 'No roles available'}
              </p>
              {!searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => navigate('/roles/create')}
                  className="mt-4 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2"
                  style={{ backgroundColor: '#C12D32', color: 'white' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => {
                const isSystem = role.isSystem === true || (role as any).isSystemRole === true;
                const status = (role.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') || 'ACTIVE';
                const roleId = role._id || role.id || role.slug;
                const userCount = (role as any).userCount ?? (role as any).usersCount ?? null;
                const permissionCount = Array.isArray(role.permissions) ? role.permissions.length : 0;

                return (
                  <div
                    key={String(roleId)}
                    className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isSystem ? '#FFF9EF' : '#EFF6FF' }}
                        >
                          <Shield className="w-6 h-6" style={{ color: isSystem ? '#C12D32' : '#3B82F6' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1 truncate" style={{ color: '#333' }}>
                            {role.name}
                          </h3>
                          {isSystem ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full inline-block"
                              style={{ backgroundColor: '#FFF9EF', color: '#C12D32' }}
                            >
                              System Role
                            </span>
                          ) : null}
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-1"
                            style={{
                              backgroundColor: status === 'ACTIVE' ? '#ECFDF5' : status === 'INACTIVE' ? '#FFF7ED' : '#F3F4F6',
                              color: status === 'ACTIVE' ? '#166534' : status === 'INACTIVE' ? '#9A5B00' : '#374151',
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm line-clamp-2" style={{ color: '#666' }}>
                      {role.description || '—'}
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: '#999' }} />
                        <span className="text-sm" style={{ color: '#666' }}>
                          {userCount == null ? '— users' : `${userCount} ${Number(userCount) === 1 ? 'user' : 'users'}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#999' }} />
                        <span className="text-sm" style={{ color: '#666' }}>
                          {permissionCount} permissions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/roles/${encodeURIComponent(String(roleId))}`)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                        style={{ color: '#333' }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/roles/${encodeURIComponent(String(roleId))}/edit`)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm inline-flex items-center justify-center gap-2 bg-white"
                        style={{ color: '#333' }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {!loading && activeTab === 'permissions' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium" style={{ color: '#333' }}>Permission catalog</h2>
                <p className="text-sm" style={{ color: '#666' }}>Core access keys used by the app</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPermissionId(null);
                  setPermissionForm(emptyPermissionForm());
                }}
                className="px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2"
                style={{ backgroundColor: '#F3F4F6', color: '#333' }}
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            <div className="space-y-3">
              {filteredPermissions.length ? filteredPermissions.map((permission) => {
                const id = (permission._id || permission.id || '').toString();
                return (
                  <div key={id} className="p-4 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium" style={{ color: '#333' }}>{permission.name}</div>
                        <div className="text-xs mt-1" style={{ color: '#666' }}>{permission.key}</div>
                        {permission.group ? (
                          <div className="text-xs mt-2" style={{ color: '#888' }}>{permission.group}</div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editPermission(permission)}
                          className="p-2 rounded-lg border border-gray-200 bg-white"
                          aria-label="Edit permission"
                        >
                          <PencilLine className="w-4 h-4" style={{ color: '#333' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePermissionRecord(id)}
                          className="p-2 rounded-lg border border-red-200 bg-red-50"
                          aria-label="Delete permission"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                        </button>
                      </div>
                    </div>
                    {permission.description ? (
                      <p className="text-sm mt-3" style={{ color: '#666' }}>{permission.description}</p>
                    ) : null}
                  </div>
                );
              }) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-gray-200" style={{ color: '#666' }}>
                  No permissions match the current search.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl font-medium mb-4" style={{ color: '#333' }}>
              {editingPermissionId ? 'Edit Permission' : 'Create Permission'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm block mb-2" style={{ color: '#333' }}>Permission Key *</label>
                <input
                  value={permissionForm.key}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="manage_users"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: '#333' }}>Name *</label>
                <input
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Manage Users"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: '#333' }}>Group</label>
                <input
                  value={permissionForm.group}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, group: e.target.value }))}
                  placeholder="Users"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: '#333' }}>Description</label>
                <textarea
                  rows={3}
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description of what this permission controls"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: '#333' }}>Sort Order</label>
                <input
                  type="number"
                  value={permissionForm.sortOrder}
                  onChange={(e) => setPermissionForm((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="button"
                onClick={() => void submitPermission()}
                disabled={savingPermission}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#C12D32', opacity: savingPermission ? 0.7 : 1 }}
              >
                {savingPermission ? 'Saving...' : editingPermissionId ? 'Update Permission' : 'Create Permission'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
