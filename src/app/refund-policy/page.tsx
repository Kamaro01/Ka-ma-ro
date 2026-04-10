import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import RefundPolicyInteractive from './components/RefundPolicyInteractive';

export const metadata: Metadata = {
  title: 'Refund Policy - Ka-ma-ro',
  description:
    'Learn about Ka-ma-ro return and refund policies for smartphones and accessories. Clear procedures, regional policies, and customer protection guarantees for confident shopping.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="pt-20 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Refund & Return Policy
            </h1>
            <p className="text-foreground/70 text-lg">
              Your satisfaction is our priority. Review our comprehensive return policy and
              procedures.
            </p>
            <p className="caption text-muted-foreground mt-2">Last updated: January 14, 2026</p>
          </div>

          <RefundPolicyInteractive />

          <footer className="mt-12 pt-8 border-t border-border">
            <div className="text-center">
              <p className="caption text-muted-foreground mb-4">
                Questions about our refund policy? Contact our support team for assistance.
              </p>
              <p className="caption text-muted-foreground">
                © {new Date().getFullYear()} Ka-ma-ro. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
