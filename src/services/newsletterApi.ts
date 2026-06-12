import axios, { AxiosError } from 'axios';
import api from './api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidNewsletterEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

function parseValidationMessage(message: string): string | null {
  try {
    const parsed = JSON.parse(message) as Array<{ field?: string; message?: string }>;
    if (Array.isArray(parsed) && parsed[0]?.message) {
      return parsed[0].message;
    }
  } catch {
    // not JSON validation payload
  }
  return null;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const raw =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    if (typeof raw === 'string') {
      return parseValidationMessage(raw) ?? raw;
    }
    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function subscribeToNewsletter(email: string, source = 'public-footer') {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  if (!isValidNewsletterEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const { data } = await api.post('/v1/newsletter-subscriptions', {
      email: normalizedEmail,
      source,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to subscribe'));
  }
}
