import ProductManagementDashboardInteractive from './components/ProductManagementDashboardInteractive';

export const metadata = {
  title: 'Product Management Dashboard - Ka-ma-ro Admin',
  description:
    'Manage Ka-ma-ro product catalog with comprehensive CRUD operations, bulk updates, and advanced filtering',
};

export default function ProductManagementDashboardPage() {
  return <ProductManagementDashboardInteractive />;
}
