import { api } from './api';

export type AppConfigLanguage = 'English' | 'Arabic';

export type EmailSettings = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string;
};

export type FeatureKey =
  | 'marketplace'
  | 'communities'
  | 'events'
  | 'challenges'
  | 'feed'
  | 'notifications'
  | 'pushNotifications'
  | 'userRegistration';

export type NotificationKey = 'eventReminders' | 'communityUpdates' | 'marketingUpdates';

export type SecurityKey = 'requireEmailVerification' | 'requireStrongPasswords' | 'forceLogoutOnPasswordChange';

export type AppConfigState = {
  appName: string;
  supportEmail: string;
  contactPhone: string;
  defaultLanguage: AppConfigLanguage;
  emailSettings: EmailSettings;
  features: Record<FeatureKey, boolean>;
  notifications: Record<NotificationKey, boolean>;
  security: Record<SecurityKey, boolean>;
};

type ApiEnvelope<T> = { success: boolean; message?: string; data?: T };

type AppConfigDoc = {
  key: string;
  config: AppConfigState;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getAppConfig(): Promise<AppConfigState> {
  const res = await api.get<ApiEnvelope<AppConfigDoc>>('/v1/app-config');
  const config = res.data?.data?.config;
  if (!config) throw new Error(res.data?.message || 'Failed to load app configuration');
  return config;
}

export async function updateAppConfig(payload: AppConfigState): Promise<AppConfigState> {
  const res = await api.put<ApiEnvelope<AppConfigDoc>>('/v1/app-config', payload);
  const config = res.data?.data?.config;
  if (!config) throw new Error(res.data?.message || 'Failed to save app configuration');
  return config;
}

export async function testSmtpConnection(): Promise<{ ok: boolean; message: string }> {
  const res = await api.post<ApiEnvelope<{ ok: boolean; message: string }>>('/v1/app-config/test-email');
  const data = res.data?.data;
  if (!data) throw new Error(res.data?.message || 'Test failed');
  return data;
}

