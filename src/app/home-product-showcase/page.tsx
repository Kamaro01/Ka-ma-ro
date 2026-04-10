import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import HomeInteractive from './components/HomeInteractive';

export const metadata: Metadata = {
  title: 'Home - Ka-ma-ro Official Store',
  description:
    'Discover premium smartphones and accessories at Ka-ma-ro. Shop the latest iPhones, AirPods, and tech essentials with international shipping and secure checkout.',
};

export default function HomeProductShowcasePage() {
  return (
    <>
      <AppHeader />
      <main className="pt-16">
        <HomeInteractive />
      </main>
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="caption text-muted-foreground">
            © {new Date().getFullYear()} Ka-ma-ro. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
