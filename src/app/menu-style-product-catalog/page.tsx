import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import MenuStyleCatalogInteractive from './components/MenuStyleCatalogInteractive';

export const metadata: Metadata = {
  title: 'Product Menu - Ka-ma-ro',
  description:
    'Browse our elegant product catalog organized like a restaurant menu with categories, detailed specifications, and instant ordering',
};

export default function MenuStyleProductCatalogPage() {
  return (
    <>
      <AppHeader />
      <main className="pt-16 min-h-screen bg-background">
        <MenuStyleCatalogInteractive />
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
