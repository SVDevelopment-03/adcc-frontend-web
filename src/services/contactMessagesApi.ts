import api from './api';

export type ContactMessageStatus = 'New' | 'Read' | 'Resolved';

export interface ContactMessage {
  _id: string;
  firstName: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagesPage {
  items: ContactMessage[];
  newCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getContactMessages(params?: {
  status?: ContactMessageStatus;
  page?: number;
  limit?: number;
}): Promise<ContactMessagesPage> {
  const { data } = await api.get('/v1/contact', { params });
  return (data?.data ?? data) as ContactMessagesPage;
}

export async function exportContactMessagesCsv(params?: {
  status?: ContactMessageStatus;
}): Promise<Blob> {
  const response = await api.get('/v1/contact/export', {
    params,
    responseType: 'blob',
  });
  return response.data as Blob;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage> {
  const { data } = await api.patch(`/v1/contact/${id}/status`, { status });
  return (data?.data ?? data) as ContactMessage;
}
