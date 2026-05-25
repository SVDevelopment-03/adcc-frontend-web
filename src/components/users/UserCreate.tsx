import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Save, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { compressImage } from '../../utils/imageUtils';
import { createUser, type CreateUserInput } from '../../services/usersApi';
import { assignUserRole, getRbacRoles, type RbacRole } from '../../services/rbacService';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [profilePreview, setProfilePreview] = useState<string>('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<CreateUserInput['gender'] | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);
  const [rbacRoleId, setRbacRoleId] = useState<string>('');

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!email.trim()) return false;
    if (!EMAIL_REGEX.test(email.trim())) return false;
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
        toast.error(e?.response?.data?.message || t('users.create.toasts.rolesLoadFailed'));
      }
    };
    void loadRoles();
  }, [t]);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('users.create.toasts.invalidImageType'));
      return;
    }
    try {
      const base64 = await compressImage(file, 600, 600, 0.75);
      setProfileImage(base64);
      setProfilePreview(base64);
    } catch (e: any) {
      toast.error(e?.message || t('users.create.toasts.imageFailed'));
    }
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      if (email.trim() && !isEmailValid) {
        toast.error(t('users.create.errors.invalidEmail'));
      } else {
        toast.error(t('users.create.toasts.fixErrors'));
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
        role: 'Member',
        isVerified,
      });

      if (rbacRoleId) {
        try {
          await assignUserRole(created.id, rbacRoleId);
        } catch (e: any) {
          console.error('Assign RBAC role failed', e);
          toast.error(e?.response?.data?.message || t('users.create.toasts.roleAssignFailed'));
        }
      }

      toast.success(t('users.create.toasts.created'));
      navigate('/users');
    } catch (e: any) {
      console.error('Create user failed', e);
      const rawMessage =
        e?.response?.data?.message ??
        e?.response?.data?.errors ??
        e?.response?.data?.error ??
        e?.message;
      const parsedMessage = Array.isArray(rawMessage)
        ? rawMessage
            .map((m) => (typeof m === 'string' ? m : (m?.message || m?.field || '').toString()))
            .filter(Boolean)
            .join(', ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : undefined;
      toast.error(parsedMessage || t('users.create.toasts.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#333' }} />
          </button>
          <div>
            <h1 className="text-3xl mb-1" style={{ color: '#333' }}>
              {t('users.create.title')}
            </h1>
            <p style={{ color: '#666' }}>{t('users.create.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF3F4' }}>
            <ImageIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: '#333' }}>{t('users.create.profilePicture')}</div>
            <div className="text-sm" style={{ color: '#666' }}>{t('users.create.profileHint')}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {profilePreview ? (
              <img src={profilePreview} alt={t('users.create.profileAlt')} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6" style={{ color: '#999' }} />
            )}
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(e) => void handleImageChange(e.target.files?.[0] || null)}
            />
            {t('users.create.upload')}
          </label>

          <div className="text-xs" style={{ color: '#666' }}>{t('users.create.uploadHint')}</div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="mb-4">
          <div className="font-medium" style={{ color: '#333' }}>{t('users.create.basicInfo')}</div>
          <div className="text-sm" style={{ color: '#666' }}>{t('users.create.basicHint')}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('users.create.placeholders.fullName')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('users.create.placeholders.email')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
            {email.trim() && !isEmailValid && (
              <div className="text-xs mt-1" style={{ color: '#C12D32' }}>{t('users.create.errors.invalidEmail')}</div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('users.create.placeholders.phone')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.gender')}</label>
            <select
              value={gender}
              onChange={(e) => setGender((e.target.value as CreateUserInput['gender']) || '')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">{t('users.create.placeholders.gender')}</option>
              <option value="Male">{t('users.create.genders.male')}</option>
              <option value="Female">{t('users.create.genders.female')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="mb-4">
          <div className="font-medium" style={{ color: '#333' }}>{t('users.create.security')}</div>
          <div className="text-sm" style={{ color: '#666' }}>{t('users.create.securityHint')}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('users.create.placeholders.password')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('users.create.placeholders.confirmPassword')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
            {confirmPassword && password !== confirmPassword && (
              <div className="text-xs mt-1" style={{ color: '#C12D32' }}>{t('users.create.errors.passwordMismatch')}</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF3F4' }}>
            <Shield className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: '#333' }}>{t('users.create.rolePermissions.title')}</div>
            <div className="text-sm" style={{ color: '#666' }}>{t('users.create.rolePermissions.hint')}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm" style={{ color: '#333' }}>{t('users.create.rolePermissions.selectRole')}</label>
            <select
              value={rbacRoleId}
              onChange={(e) => setRbacRoleId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">{t('users.create.rolePermissions.placeholders.role')}</option>
              {rbacRoles.map((role) => (
                <option key={role._id || role.id} value={(role._id || role.id || '').toString()}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium" style={{ color: '#333' }}>{t('users.create.rolePermissions.accountStatus')}</div>
              <div className="text-xs" style={{ color: '#666' }}>{t('users.create.rolePermissions.accountHint')}</div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#111827] peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !canSubmit}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {loading ? t('common.saving') : t('users.create.save')}
        </button>
      </div>
    </div>
  );
}
