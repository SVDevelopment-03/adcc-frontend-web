import axios, { AxiosError } from 'axios';
import api from './api';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const msg =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function subscribeToNewsletter(email: string) {
  try {
    const { data } = await api.post('/v1/newsletter-subscriptions', {
      email,
      source: 'home-footer',
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to subscribe'));
  }
}
