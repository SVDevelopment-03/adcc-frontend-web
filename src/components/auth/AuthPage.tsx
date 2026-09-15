import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import ForgotPassword from './ForgotPassword';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  return (
    <>
      {mode === 'login' && (
        <Login
          onSwitchToRegister={() => setMode('register')}
          onSwitchToForgot={() => setMode('forgot')}
          onLoginSuccess={onAuthSuccess}
        />
      )}
      {mode === 'register' && (
        <Register
          onSwitchToLogin={() => setMode('login')}
          onRegisterSuccess={onAuthSuccess}
        />
      )}
      {mode === 'forgot' && (
        <ForgotPassword
          onDone={() => setMode('login')}
        />
      )}
    </>
  );
}
