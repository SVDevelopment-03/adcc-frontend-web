import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Save, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { compressImage } from '../../utils/imageUtils';
import { createUser, type CreateUserInput } from '../../services/usersApi';
import { assignUserRole, getRbacRoles, type RbacRole } from '../../services/rbacService';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm" style={{ color: '#333' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#C12D32' }}>{error}</p>}
    </div>
  );
}

export function AdminCreate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [profilePreview, setProfilePreview] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<CreateUserInput['gender'] | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);
  const [rbacRoleId, setRbacRoleId] = useState('');

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);
  const isPasswordMatch = !confirmPassword || password === confirmPassword;

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) return false;
    if (!gender) return false;
    if (!password) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [confirmPassword, email, fullName, gender, password]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getRbacRoles();
        setRbacRoles((roles || []).filter((r) => !!(r?._id || r?.id)));
      } catch (e: any) {
        console.error('Failed to load RBAC roles', e);
      }
    };
    void loadRoles();
  }, []);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid image type. Use PNG, JPG or WebP.');
      return;
    }
    try {
      const base64 = await compressImage(file, 600, 600, 0.75);
      setProfileImage(base64);
      setProfilePreview(base64);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to process image');
    }
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      if (email.trim() && !isEmailValid) {
        toast.error('Invalid email address');
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }

    setLoading(true);
    try {
      const created = await createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        gender: gender as CreateUserInput['gender'],
        password,
        profileImage: profileImage || undefined,
        role: 'Admin',
        isVerified,
      });

      if (rbacRoleId) {
        try {
          await assignUserRole(created.id, rbacRoleId);
        } catch (e: any) {
          console.error('Assign RBAC role failed', e);
          toast.error(e?.response?.data?.message || 'User created but role assignment failed');
        }
      }

      toast.success('Admin user created successfully');
      navigate('/admins');
    } catch (e: any) {
      const rawMessage =
        e?.response?.data?.message ??
        e?.response?.data?.errors ??
        e?.response?.data?.error ??
        e?.message;
      const parsedMessage = Array.isArray(rawMessage)
        ? rawMessage
            .map((m: any) => (typeof m === 'string' ? m : (m?.message || m?.field || '').toString()))
            .filter(Boolean)
            .join(', ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : undefined;

      // Give an actionable hint when email or phone is already taken
      const isConflict =
        typeof parsedMessage === 'string' &&
        parsedMessage.toLowerCase().includes('already exists');

      toast.error(
        isConflict
          ? 'A user with this email address or phone number already exists. Try a different email or leave the phone field empty.'
          : parsedMessage || 'Failed to create admin user'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 text-sm';
  const selectClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gray-300 text-sm';

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
          <h1 className="text-3xl mb-1" style={{ color: '#333' }}>Add Admin User</h1>
          <p style={{ color: '#666' }}>Create a new administrator account</p>
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
            <p className="text-sm" style={{ color: '#666' }}>Optional. PNG, JPG or WebP, max 5MB.</p>
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
            Upload Photo
          </label>
        </div>
      </div>

      {/* Basic Info */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <p className="font-medium mb-1" style={{ color: '#333' }}>Basic Information</p>
        <p className="text-sm mb-4" style={{ color: '#666' }}>Required fields are marked with *</p>

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

          <Field label="Email Address *" error={email.trim() && !isEmailValid ? 'Invalid email format' : undefined}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
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
              onChange={(e) => setGender(e.target.value as CreateUserInput['gender'] | '')}
              className={selectClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Security */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <p className="font-medium mb-1" style={{ color: '#333' }}>Security</p>
        <p className="text-sm mb-4" style={{ color: '#666' }}>Set a strong password for this account.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Password *">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputClass}
            />
          </Field>

          <Field
            label="Confirm Password *"
            error={confirmPassword && !isPasswordMatch ? 'Passwords do not match' : undefined}
          >
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Role & Status */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF3F4' }}>
            <Shield className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: '#333' }}>Role & Permissions</p>
            <p className="text-sm" style={{ color: '#666' }}>Assign RBAC role and set account status.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="RBAC Role">
            <select
              value={rbacRoleId}
              onChange={(e) => setRbacRoleId(e.target.value)}
              className={selectClass}
            >
              <option value="">No RBAC role (Admin by default)</option>
              {rbacRoles.map((role) => (
                <option key={role._id || role.id} value={(role._id || role.id || '').toString()}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium" style={{ color: '#333' }}>Account Active</p>
              <p className="text-xs" style={{ color: '#666' }}>Enable this account immediately after creation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#C12D32] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      {/* Sticky Save */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={loading || !canSubmit}
          className="px-5 py-2.5 rounded-lg text-white flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>
      </div>
    </div>
  );
}
