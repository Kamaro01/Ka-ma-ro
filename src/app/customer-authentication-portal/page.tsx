import React from 'react';
import CustomerAuthenticationInteractive from './components/CustomerAuthenticationInteractive';

export const metadata = {
  title: 'Customer Authentication - Ka-ma-ro',
  description: 'Sign in or create your Ka-ma-ro account',
};

export default function CustomerAuthenticationPortalPage() {
  return <CustomerAuthenticationInteractive />;
}
