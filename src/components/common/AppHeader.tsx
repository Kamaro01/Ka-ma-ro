'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import HamburgerMenu from './HamburgerMenu';

export default function AppHeader() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    router.push(query ? `/product-category-listing?q=${encodeURIComponent(query)}` : '/product-category-listing');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMenu}
                className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 rounded-md"
                aria-label="Toggle menu"
              >
                <Icon name="Bars3Icon" size={22} className="text-gray-700" />
              </button>

              <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                  className="h-10 w-44 md:w-64 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  aria-label="Search products"
                />
              </form>

              <Link
                href="/product-category-listing"
                className="sm:hidden w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 rounded-md"
                aria-label="Search products"
              >
                <Icon name="MagnifyingGlassIcon" size={22} className="text-gray-700" />
              </Link>
            </div>

            <Link
              href="/home-product-showcase"
              className="absolute left-1/2 transform -translate-x-1/2 transition-opacity hover:opacity-70"
              aria-label="Ka-ma-ro home"
            >
              <span className="font-heading font-bold text-xl text-gray-900">Ka-ma-ro</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={isAuthenticated ? '/user-account-dashboard' : '/login'}
                className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 rounded-md"
                aria-label={isAuthenticated ? 'Account dashboard' : 'Login'}
              >
                <Icon
                  name={isAuthenticated ? 'UserCircleIcon' : 'UserIcon'}
                  size={22}
                  className="text-gray-700"
                />
              </Link>

              <Link
                href="/shopping-cart-management"
                className="w-10 h-10 relative flex items-center justify-center transition-colors hover:bg-gray-100 rounded-md"
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <Icon name="ShoppingCartIcon" size={22} className="text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <HamburgerMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
