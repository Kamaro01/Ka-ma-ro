import React, { Suspense } from 'react';
import PasswordResetInteractive from './components/PasswordResetInteractive';

export const metadata = {
  title: 'Password Reset - Ka-ma-ro',
  description: 'Securely reset your Ka-ma-ro account password',
};

export default function PasswordResetPortalPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <PasswordResetInteractive />
    </Suspense>
  );
}
