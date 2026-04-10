import React from 'react';
import { Metadata } from 'next';
import CategoryManagementInteractive from './components/CategoryManagementInteractive';

export const metadata: Metadata = {
  title: 'Category Management System - Ka-ma-ro Admin',
  description:
    'Manage product categories, hierarchies, and category assignments for optimal product organization',
};

export default function CategoryManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryManagementInteractive />
    </div>
  );
}
