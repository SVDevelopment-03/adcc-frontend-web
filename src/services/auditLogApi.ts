import api from './api';

export interface AuditLogEntry {
  _id: string;
  actorId?: { _id?: string; fullName?: string; email?: string } | string | null;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogPage {
  logs: AuditLogEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
}): Promise<AuditLogPage> {
  const response = await api.get('/v1/audit-logs', { params });
  const data = response.data?.data ?? response.data;
  return {
    logs: Array.isArray(data?.logs) ? data.logs : [],
    pagination: data?.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

export async function getAuditLogActions(): Promise<string[]> {
  const response = await api.get('/v1/audit-logs/actions');
  const data = response.data?.data ?? response.data;
  return Array.isArray(data?.actions) ? data.actions : [];
}
