import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, Search, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRbacRoles,
  type RbacRole,
} from '../../services/rbacService';

export function RolesPermissions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const list = await getRbacRoles();
      setRoles(list);
    } catch (error: any) {
      console.error('Error loading roles', error);
      toast.error(error?.response?.data?.message || 'Failed to load roles');
      setRoles([]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('roles.title')}</h1>
          <p style={{ color: '#666' }}>Create and manage user roles with custom permissions</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/users')}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm inline-flex items-center gap-2 bg-white"
          style={{ color: '#333' }}
        >
          <Users className="w-4 h-4" />
          Manage Users
        </button>
      </div>

      <div className="p-4 rounded-2xl shadow-sm bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by name or description..."
            className="w-full pl-10 h-11 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      {!loading && filteredRoles.length === 0 ? (
        <div className="p-12 rounded-2xl shadow-sm bg-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#CCC' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: '#333' }}>No roles found</h3>
          <p style={{ color: '#666' }}>
            {searchQuery.trim() ? 'Try adjusting your search query' : 'No roles available'}
          </p>
        </div>
      ) : null}

      {!loading && filteredRoles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => {
            const isSystem = role.isSystem === true || (role as any).isSystemRole === true;
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
      ) : null}
    </div>
  );
}
