'use client';

import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CustomProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  inStock: boolean;
  isCustom: boolean;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    alt: '',
    inStock: true,
    image: '',
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('customProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveProducts = (updatedProducts: CustomProduct[]) => {
    localStorage.setItem('customProducts', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleImageUpload = (imageData: string) => {
    setFormData({ ...formData, image: imageData });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.image) {
      alert('Please fill in all required fields and upload an image');
      return;
    }

    const productData: CustomProduct = {
      id: editingProduct?.id || `custom-${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      alt: formData.alt || formData.name,
      inStock: formData.inStock,
      isCustom: true,
    };

    let updatedProducts: CustomProduct[];
    if (editingProduct) {
      updatedProducts = products.map((p) => (p.id === editingProduct.id ? productData : p));
    } else {
      updatedProducts = [...products, productData];
    }

    saveProducts(updatedProducts);
    resetForm();
  };

  const handleEdit = (product: CustomProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      alt: product.alt,
      inStock: product.inStock,
      image: product.image,
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      saveProducts(updatedProducts);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      alt: '',
      inStock: true,
      image: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (RWF) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image Description</label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the product image"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product Image *</label>
              <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium">In Stock</label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No custom products added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <img src={product.image} alt={product.alt} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">FRW {product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
