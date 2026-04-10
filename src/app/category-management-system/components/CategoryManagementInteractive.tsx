'use client';

import React, { useState, useEffect } from 'react';
import { categoryService, Category } from '@/services/categoryService';
import CategoryForm from './CategoryForm';
import CategoryTree from './CategoryTree';
import CategoryStats from './CategoryStats';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const CategoryManagementInteractive: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCategories();
    loadHierarchy();
  }, [refreshKey, searchTerm, filterActive]);

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await categoryService.getAllCategories({
      isActive: filterActive,
      searchTerm: searchTerm || undefined,
    });

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const loadHierarchy = async () => {
    const { data, error } = await categoryService.getCategoryHierarchy();
    if (!error && data) {
      setHierarchy(data);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    const { error } = await categoryService.deleteCategory(categoryId);

    if (!error) {
      setRefreshKey((prev) => prev + 1);
    } else {
      alert('Failed to delete category. It may have associated products.');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (editingCategory) {
      await categoryService.updateCategory({ ...formData, id: editingCategory.id });
    } else {
      await categoryService.createCategory(formData);
    }

    setShowForm(false);
    setEditingCategory(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleReorderCategories = async (reorderedCategories: any[]) => {
    const updates = reorderedCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index,
    }));

    await categoryService.updateCategoryOrder(updates);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1">
              Organize and maintain product hierarchies for optimal product discovery
            </p>
          </div>

          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Category
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === 'all' ? undefined : value === 'active');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <CategoryStats categories={categories} />

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>
            <CategoryForm
              category={editingCategory}
              allCategories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Category Tree View */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Category Hierarchy</h2>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : hierarchy.length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No categories found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterActive !== undefined
                ? 'Try adjusting your filters'
                : 'Create your first category to get started'}
            </p>
          </div>
        ) : (
          <CategoryTree
            categories={hierarchy}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onReorder={handleReorderCategories}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryManagementInteractive;
