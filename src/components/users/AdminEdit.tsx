import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Save, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { compressImage } from '../../utils/imageUtils';
import { getAllUsers, updateUser, User } from '../../services/usersApi';
import { assignUserRole, getRbacRoles, type RbacRole } from '../../services/rbacService';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm" style={{ color: '#333' }}>{label}</label>
      {children}
    </div>
  );
}

export function AdminEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [role, setRole] = useState<User['role']>('Admin');
  const [profileImage, setProfileImage] = useState('');
  const [profilePreview, setProfilePreview] = useState('');

  const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);
  const [rbacRoleId, setRbacRoleId] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { users } = await getAllUsers(1, 100, 'Admin');
        const found = users.find((u) => u.id === id);
        if (!found) { toast.error('Admin user not found'); navigate('/admins'); return; }
        setAdmin(found);
        setFullName(found.fullName);
        setPhone(found.phone || '');
        setGender((found.gender as 'Male' | 'Female') || '');
        setRole(found.role);
        setProfileImage(found.profileImage || '');
        setProfilePreview(found.profileImage || '');
      } catch {
        toast.error('Failed to load admin user');
        navigate('/admins');
      } finally {
        setLoadingUser(false);
      }
    };
    void load();

    const loadRoles = async () => {
      try {
        const roles = await getRbacRoles();
        setRbacRoles((roles || []).filter((r) => !!(r?._id || r?.id)));
      } catch { /* ignore */ }
    };
    void loadRoles();
  }, [id, navigate]);

  const canSubmit = useMemo(() => !!fullName.trim() && !!gender, [fullName, gender]);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { toast.error('Invalid image type'); return; }
    try {
      const base64 = await compressImage(file, 600, 600, 0.75);
      setProfileImage(base64);
      setProfilePreview(base64);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to process image');
    }
  };

  const onSubmit = async () => {
    if (!id || !canSubmit) return;
    setSaving(true);
    try {
      await updateUser(id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        gender: gender as 'Male' | 'Female',
        role,
        profileImage: profileImage || undefined,
      });

      if (rbacRoleId) {
        try { await assignUserRole(id, rbacRoleId); } catch { /* non-fatal */ }
      }

      toast.success('Admin user updated successfully');
      navigate('/admins');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        'Failed to update admin user';
      const isConflict = typeof msg === 'string' && msg.toLowerCase().includes('already exists');
      toast.error(
        isConflict
          ? 'A user with this phone number already exists.'
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 text-sm';
  const selectClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gray-300 text-sm';

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/admins')}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Edit Admin User</h1>
          <p style={{ color: '#666' }}>{admin?.email}</p>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF3F4' }}>
            <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: '#333' }}>Profile Picture</p>
            <p className="text-sm" style={{ color: '#666' }}>PNG, JPG or WebP.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {profilePreview
              ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
              : <ImageIcon className="w-6 h-6" style={{ color: '#999' }} />}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm">
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(e) => void handleImageChange(e.target.files?.[0] || null)}
            />
            Change Photo
          </label>
        </div>
      </div>

      {/* Basic Info */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <p className="font-medium mb-1" style={{ color: '#333' }}>Basic Information</p>
        <p className="text-sm mb-4" style={{ color: '#666' }}>Email address cannot be changed.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className={inputClass}
            />
          </Field>

          <Field label="Email Address (read-only)">
            <input
              type="email"
              value={admin?.email || ''}
              disabled
              className={`${inputClass} bg-gray-50 cursor-not-allowed`}
              style={{ color: '#999' }}
            />
          </Field>

          <Field label="Phone Number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 000 0000"
              className={inputClass}
            />
          </Field>

          <Field label="Gender *">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className={selectClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Role */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF3F4' }}>
            <Shield className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: '#333' }}>Role & Permissions</p>
            <p className="text-sm" style={{ color: '#666' }}>Update system role or assign an RBAC role.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="System Role">
            <select value={role} onChange={(e) => setRole(e.target.value as User['role'])} className={selectClass}>
              <option value="Admin">Admin</option>
              <option value="Vendor">Vendor</option>
              <option value="Member">Member</option>
            </select>
          </Field>

          <Field label="RBAC Role">
            <select
              value={rbacRoleId}
              onChange={(e) => setRbacRoleId(e.target.value)}
              className={selectClass}
            >
              <option value="">No change</option>
              {rbacRoles.map((r) => (
                <option key={r._id || r.id} value={(r._id || r.id || '').toString()}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Sticky Save */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={saving || !canSubmit}
          className="px-5 py-2.5 rounded-lg text-white flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
