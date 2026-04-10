'use client';

import React, { useState } from 'react';
import { Category } from '@/services/categoryService';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface CategoryTreeProps {
  categories: any[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onReorder: (reorderedCategories: any[]) => void;
  level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete,
  onReorder,
  level = 0,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, category: any) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('categoryId', category.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: any) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('categoryId');
    // Implementation for reordering would go here
  };

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        return (
          <div key={category.id} className="space-y-2">
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, category)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category)}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
            >
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="w-7" />
              )}

              {/* Category Image */}
              {category.featured_image ? (
                <img
                  src={category.featured_image}
                  alt={category.featured_image_alt || category.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                  {!category.is_active && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>Slug: {category.slug}</span>
                  <span>Products: {category.product_count || 0}</span>
                  {hasChildren && <span>Subcategories: {category.children.length}</span>}
                </div>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{category.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit category"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete category"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  title={category.is_active ? 'Hide category' : 'Show category'}
                >
                  {category.is_active ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Render Children */}
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={category.children}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;
