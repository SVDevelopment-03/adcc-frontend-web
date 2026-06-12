import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Globe, Mail, Save, Settings, Shield, SlidersHorizontal, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { getAppConfig, updateAppConfig, testSmtpConnection, type AppConfigState, type FeatureKey, type NotificationKey, type SecurityKey } from '../../services/appConfigApi';

export function AppConfig() {
  const storageKey = 'adcc.appConfig.v1';

  const defaultConfig: AppConfigState = {
    appName: 'Abu Dhabi Cycling Club',
    supportEmail: 'support@adcc.ae',
    contactPhone: '+971 2 123 4567',
    defaultLanguage: 'English',
    emailSettings: {
      enabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: false,
      fromEmail: '',
      fromName: 'Abu Dhabi Cycling Club',
      replyTo: '',
    },
    features: {
      marketplace: true,
      communities: true,
      events: false,
      challenges: false,
      feed: true,
      notifications: true,
      pushNotifications: true,
      userRegistration: true,
    },
    notifications: {
      eventReminders: true,
      communityUpdates: true,
      marketingUpdates: true,
    },
    security: {
      requireEmailVerification: true,
      requireStrongPasswords: true,
      forceLogoutOnPasswordChange: false,
    },
  };

  const [config, setConfig] = useState<AppConfigState>(defaultConfig);
  const [initial, setInitial] = useState<AppConfigState>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const deriveProvider = (host: string): 'gmail' | 'outlook' | 'custom' => {
    if (host === 'smtp.gmail.com') return 'gmail';
    if (host === 'smtp-mail.outlook.com') return 'outlook';
    return 'custom';
  };

  const [smtpProvider, setSmtpProvider] = useState<'gmail' | 'outlook' | 'custom'>(() =>
    deriveProvider(defaultConfig.emailSettings.smtpHost)
  );

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const remote = await getAppConfig();
        const mergedRemote: AppConfigState = {
          ...defaultConfig,
          ...remote,
          features: { ...defaultConfig.features, ...(remote as any).features },
          notifications: { ...defaultConfig.notifications, ...(remote as any).notifications },
          security: { ...defaultConfig.security, ...(remote as any).security },
          emailSettings: { ...defaultConfig.emailSettings, ...(remote as any).emailSettings },
        };
        setConfig(mergedRemote);
        setInitial(mergedRemote);
        setSmtpProvider(deriveProvider((mergedRemote.emailSettings as any).smtpHost ?? ''));
        try {
          localStorage.setItem(storageKey, JSON.stringify(mergedRemote));
        } catch {
          // ignore localStorage errors
        }
        return;
      } catch (error: any) {
        // fallback to cached localStorage if backend is unavailable
        try {
          const raw = localStorage.getItem(storageKey);
          if (!raw) throw error;
          const parsed = JSON.parse(raw) as Partial<AppConfigState> | null;
          if (!parsed || typeof parsed !== 'object') throw error;
          const merged: AppConfigState = {
            ...defaultConfig,
            ...parsed,
            features: { ...defaultConfig.features, ...(parsed as any).features },
            notifications: { ...defaultConfig.notifications, ...(parsed as any).notifications },
            security: { ...defaultConfig.security, ...(parsed as any).security },
            emailSettings: { ...defaultConfig.emailSettings, ...(parsed as any).emailSettings },
          };
          setConfig(merged);
          setInitial(merged);
          toast.error('Backend unavailable. Loaded cached config.');
        } catch (e: any) {
          toast.error(e?.message || error?.message || 'Failed to load configuration');
          setConfig(defaultConfig);
          setInitial(defaultConfig);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => JSON.stringify(config) !== JSON.stringify(initial), [config, initial]);

  const activeFeaturesCount = useMemo(
    () => Object.values(config.features).filter(Boolean).length,
    [config.features],
  );
  const notificationsEnabledCount = useMemo(
    () => Object.values(config.notifications).filter(Boolean).length,
    [config.notifications],
  );
  const securityFeaturesCount = useMemo(
    () => Object.values(config.security).filter(Boolean).length,
    [config.security],
  );

  const setField = <K extends keyof AppConfigState>(key: K, value: AppConfigState[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (key: FeatureKey) => setConfig((prev) => ({ ...prev, features: { ...prev.features, [key]: !prev.features[key] } }));
  const toggleNotification = (key: NotificationKey) =>
    setConfig((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: !prev.notifications[key] } }));
  const toggleSecurity = (key: SecurityKey) => setConfig((prev) => ({ ...prev, security: { ...prev.security, [key]: !prev.security[key] } }));
  const toggleEmailEnabled = () => setConfig((prev) => ({ ...prev, emailSettings: { ...prev.emailSettings, enabled: !prev.emailSettings.enabled } }));

  const SMTP_PRESETS = {
    gmail:   { smtpHost: 'smtp.gmail.com',          smtpPort: 587, smtpSecure: false },
    outlook: { smtpHost: 'smtp-mail.outlook.com',   smtpPort: 587, smtpSecure: false },
    custom:  { smtpHost: '',                         smtpPort: 587, smtpSecure: false },
  } as const;

  const handleProviderChange = (provider: 'gmail' | 'outlook' | 'custom') => {
    setSmtpProvider(provider);
    const preset = SMTP_PRESETS[provider];
    setConfig((prev) => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        smtpHost: preset.smtpHost,
        smtpPort: preset.smtpPort,
        smtpSecure: preset.smtpSecure,
        smtpPassword: '',
      },
    }));
    setSmtpTestResult(null);
  };

  const onTestSmtp = async () => {
    if (isTesting) return;
    setIsTesting(true);
    setSmtpTestResult(null);
    try {
      const result = await testSmtpConnection();
      setSmtpTestResult(result);
      if (result.ok) {
        toast.success('SMTP connection successful');
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      const msg = error?.message || 'Test failed';
      setSmtpTestResult({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const onSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      const saved = await updateAppConfig(config);
      const mergedSaved: AppConfigState = {
        ...defaultConfig,
        ...saved,
        features: { ...defaultConfig.features, ...(saved as any).features },
        notifications: { ...defaultConfig.notifications, ...(saved as any).notifications },
        security: { ...defaultConfig.security, ...(saved as any).security },
        emailSettings: { ...defaultConfig.emailSettings, ...(saved as any).emailSettings },
      };
      setConfig(mergedSaved);
      setInitial(mergedSaved);
      try {
        localStorage.setItem(storageKey, JSON.stringify(mergedSaved));
      } catch {
        // ignore localStorage errors
      }
      toast.success('Configuration saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const StatCard = ({
    icon,
    label,
    value,
    highlight,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
    <div
      className="p-5 rounded-2xl shadow-sm border border-gray-100"
      style={{ backgroundColor: highlight ? '#ECC180' : '#fff' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(193,45,50,0.08)' }}>
          {icon}
        </div>
        <div className="text-sm" style={{ color: '#666' }}>
          {label}
        </div>
      </div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: '#111' }}>
        {value}
      </div>
    </div>
  );

  const Switch = ({
    checked,
    onChange,
    ariaLabel,
  }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    ariaLabel: string;
  }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#C12D32] peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            App Configuration
          </h1>
          <p style={{ color: '#666' }}>Manage application settings and feature toggles</p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {isLoading ? (
        <div className="p-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<SlidersHorizontal className="w-5 h-5" style={{ color: '#C12D32' }} />}
          label="Active Features"
          value={String(activeFeaturesCount)}
          highlight
        />
        <StatCard
          icon={<Bell className="w-5 h-5" style={{ color: '#C12D32' }} />}
          label="Notifications Enabled"
          value={String(notificationsEnabledCount)}
        />
        <StatCard
          icon={<Shield className="w-5 h-5" style={{ color: '#C12D32' }} />}
          label="Security Features"
          value={String(securityFeaturesCount)}
        />
        <StatCard
          icon={<Globe className="w-5 h-5" style={{ color: '#C12D32' }} />}
          label="Default Language"
          value={config.defaultLanguage}
        />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>
              General Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                App Name
              </label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => setField('appName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="App name"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Support Email
              </label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => setField('supportEmail', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={config.contactPhone}
                onChange={(e) => setField('contactPhone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="+971 ..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Default Language
              </label>
              <select
                value={config.defaultLanguage}
                onChange={(e) => setField('defaultLanguage', e.target.value as AppConfigState['defaultLanguage'])}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
              >
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>
              Feature Toggles
            </h2>
          </div>

          <div className="space-y-3">
            {(
              [
                ['marketplace', 'Marketplace'],
                ['communities', 'Communities'],
                ['events', 'Events'],
                ['challenges', 'Challenges'],
                ['feed', 'Feed/Social Posts'],
                ['notifications', 'Notifications'],
                ['pushNotifications', 'Push Notifications'],
                ['userRegistration', 'User Registration'],
              ] as Array<[FeatureKey, string]>
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="text-sm font-medium" style={{ color: '#333' }}>
                  {label}
                </div>
                <Switch checked={config.features[key]} onChange={() => toggleFeature(key)} ariaLabel={`${label} toggle`} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6" style={{ color: '#C12D32' }} />
              <h2 className="text-xl" style={{ color: '#333' }}>
                Email Delivery Settings
              </h2>
            </div>
            <Switch
              checked={config.emailSettings.enabled}
              onChange={toggleEmailEnabled}
              ariaLabel="Enable email delivery"
            />
          </div>

          <p className="text-sm mb-4" style={{ color: '#666' }}>
            Choose a provider preset or configure Custom SMTP. Leave the password blank to keep the current saved value.
          </p>

          {/* Provider selector */}
          <div className="flex gap-2 mb-5">
            {([
              { id: 'custom',  label: 'Custom SMTP' },
              { id: 'gmail',   label: 'Gmail' },
              { id: 'outlook', label: 'Outlook' },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleProviderChange(id)}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                style={{
                  backgroundColor: smtpProvider === id ? '#C12D32' : '#fff',
                  color: smtpProvider === id ? '#fff' : '#555',
                  borderColor: smtpProvider === id ? '#C12D32' : '#d1d5db',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Gmail info banner */}
          {smtpProvider === 'gmail' && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FFF9EF', border: '1px solid #ECC180', color: '#7a5a1e' }}>
              <strong>Gmail requires an App Password.</strong> Your regular Gmail password will not work.
              Enable 2-Step Verification on your Google account, then go to{' '}
              <strong>Google Account → Security → App Passwords</strong> and generate a password for "Mail".
            </div>
          )}

          {/* Outlook info banner */}
          {smtpProvider === 'outlook' && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#f0f7ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
              <strong>Outlook SMTP:</strong> Use your full Outlook/Microsoft account email as the username and your account password.
              If you have 2-step verification enabled, generate an App Password from your Microsoft account security settings.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>SMTP Host</label>
              <input
                type="text"
                value={config.emailSettings.smtpHost}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, smtpHost: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="smtp.example.com"
                readOnly={smtpProvider !== 'custom'}
                style={smtpProvider !== 'custom' ? { backgroundColor: '#f9fafb', color: '#6b7280' } : {}}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>SMTP Port</label>
              <input
                type="number"
                value={config.emailSettings.smtpPort}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, smtpPort: Number(e.target.value) || 587 })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="587"
                readOnly={smtpProvider !== 'custom'}
                style={smtpProvider !== 'custom' ? { backgroundColor: '#f9fafb', color: '#6b7280' } : {}}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {smtpProvider === 'gmail' ? 'Gmail Address' : smtpProvider === 'outlook' ? 'Outlook Email Address' : 'SMTP Username'}
              </label>
              <input
                type="text"
                value={config.emailSettings.smtpUser}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, smtpUser: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder={smtpProvider === 'gmail' ? 'you@gmail.com' : smtpProvider === 'outlook' ? 'you@outlook.com' : 'smtp-user@example.com'}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {smtpProvider === 'gmail' ? 'App Password' : smtpProvider === 'outlook' ? 'Password / App Password' : 'SMTP Password'}
              </label>
              <input
                type="password"
                value={config.emailSettings.smtpPassword}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, smtpPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder={smtpProvider === 'gmail' ? 'Enter 16-character App Password' : 'Leave blank to keep current password'}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>From Email</label>
              <input
                type="email"
                value={config.emailSettings.fromEmail}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, fromEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="no-reply@adcc.ae"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>From Name</label>
              <input
                type="text"
                value={config.emailSettings.fromName}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, fromName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="Abu Dhabi Cycling Club"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Reply-To</label>
              <input
                type="email"
                value={config.emailSettings.replyTo}
                onChange={(e) => setField('emailSettings', { ...config.emailSettings, replyTo: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
                placeholder="support@adcc.ae"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 md:col-span-2">
              <div>
                <div className="font-medium" style={{ color: '#333' }}>Use TLS / Secure SMTP</div>
                <div className="text-sm" style={{ color: '#666' }}>Turn on for providers that require a secure SMTP connection.</div>
              </div>
              <Switch
                checked={config.emailSettings.smtpSecure}
                onChange={(next) => setField('emailSettings', { ...config.emailSettings, smtpSecure: next })}
                ariaLabel="Use secure SMTP"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => { void onTestSmtp(); }}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#C12D32', color: '#C12D32' }}
              >
                <Wifi className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              {smtpTestResult !== null ? (
                <div
                  className="mt-2 px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: smtpTestResult.ok ? '#f0fdf4' : '#fff1f2',
                    color: smtpTestResult.ok ? '#166534' : '#991b1b',
                    border: `1px solid ${smtpTestResult.ok ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {smtpTestResult.ok ? '✓ ' : '✗ '}{smtpTestResult.message}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>
              Notification Settings
            </h2>
          </div>

          <div className="space-y-3">
            {(
              [
                ['eventReminders', 'Event Reminders'],
                ['communityUpdates', 'Community Updates'],
                ['marketingUpdates', 'Marketing Updates'],
              ] as Array<[NotificationKey, string]>
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="text-sm font-medium" style={{ color: '#333' }}>
                  {label}
                </div>
                <Switch
                  checked={config.notifications[key]}
                  onChange={() => toggleNotification(key)}
                  ariaLabel={`${label} toggle`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>
              Privacy &amp; Security
            </h2>
          </div>

          <div className="space-y-3">
            {(
              [
                ['requireEmailVerification', 'Require Email Verification'],
                ['requireStrongPasswords', 'Require Strong Passwords'],
                ['forceLogoutOnPasswordChange', 'Force Logout on Password Change'],
              ] as Array<[SecurityKey, string]>
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="text-sm font-medium" style={{ color: '#333' }}>
                  {label}
                </div>
                <Switch checked={config.security[key]} onChange={() => toggleSecurity(key)} ariaLabel={`${label} toggle`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
