import api from './api';

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscribersPage {
  items: NewsletterSubscriber[];
  activeCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getNewsletterSubscribers(params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<NewsletterSubscribersPage> {
  const { data } = await api.get('/v1/newsletter-subscriptions', {
    params:
      params?.isActive === undefined
        ? { page: params?.page, limit: params?.limit }
        : { ...params, isActive: String(params.isActive) },
  });
  return (data?.data ?? data) as NewsletterSubscribersPage;
}

export async function exportNewsletterSubscribersCsv(params?: { isActive?: boolean }): Promise<Blob> {
  const response = await api.get('/v1/newsletter-subscriptions/export', {
    params: params?.isActive === undefined ? undefined : { isActive: String(params.isActive) },
    responseType: 'blob',
  });
  return response.data as Blob;
}
