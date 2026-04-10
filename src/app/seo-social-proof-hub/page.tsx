import React from 'react';
import SeoSocialProofInteractive from './components/SeoSocialProofInteractive';

export const metadata = {
  title: 'SEO & Social Proof Hub - Ka-ma-ro Store',
  description:
    'Manage SEO settings, meta tags, trust badges, and customer testimonials to enhance online visibility and build customer trust',
};

export default function SeoSocialProofHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SeoSocialProofInteractive />
    </div>
  );
}
