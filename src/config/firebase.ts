import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredEnv = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return value.trim();
};

const firebaseConfig = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('VITE_FIREBASE_APP_ID'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
