'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const menuItems = [
    {
      label: 'Home',
      path: '/home-product-showcase',
      icon: 'HomeIcon',
    },
    {
      label: 'Shop',
      path: '/product-category-listing',
      icon: 'ShoppingBagIcon',
    },
    {
      label: 'Contact Us',
      path: '/customer-support-center',
      icon: 'EnvelopeIcon',
    },
    {
      label: 'Coming Soon',
      path: '/home-product-showcase#coming-soon',
      icon: 'SparklesIcon',
    },
  ];

  const adminItems = [
    {
      label: 'Admin Orders',
      path: '/admin-orders',
      icon: 'ClipboardDocumentListIcon',
    },
    {
      label: 'Admin Dashboard',
      path: '/comprehensive-admin-dashboard',
      icon: 'ChartBarIcon',
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-background" onClick={onClose} aria-hidden="true" />
      )}

      <nav
        className={`fixed top-0 left-0 bottom-0 z-[200] w-80 max-w-[85vw] bg-card elevation-4 transform transition-smooth ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h2 className="font-heading font-semibold text-lg text-foreground">Menu</h2>
            <button
              onClick={onClose}
              className="touch-target flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97"
              aria-label="Close menu"
            >
              <Icon name="XMarkIcon" size={24} className="text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-4 py-3 rounded-md transition-smooth hover:bg-muted active:scale-97 ${
                        isActive ? 'bg-muted text-accent' : 'text-foreground'
                      }`}
                    >
                      <Icon
                        name={item.icon as any}
                        size={20}
                        className={isActive ? 'text-accent' : 'text-muted-foreground'}
                      />
                      <span className="font-body font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {isAdmin && (
              <div className="mt-6 px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                  Admin
                </p>
                <ul className="space-y-2">
                  {adminItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          onClick={onClose}
                          className={`flex items-center gap-4 px-4 py-3 rounded-md transition-smooth hover:bg-muted active:scale-97 ${
                            isActive ? 'bg-muted text-accent' : 'text-foreground'
                          }`}
                        >
                          <Icon
                            name={item.icon as any}
                            size={20}
                            className={isActive ? 'text-accent' : 'text-muted-foreground'}
                          />
                          <span className="font-body font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-8 px-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
                  Need Help?
                </h3>
                <p className="caption text-muted-foreground mb-3">
                  Contact our support team for assistance with your order or any questions.
                </p>
                <a
                  href="mailto:support@kamaro.com"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-smooth caption font-medium"
                >
                  <Icon name="EnvelopeIcon" size={16} />
                  support@kamaro.com
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border">
            <p className="caption text-muted-foreground text-center">
              © 2026 Ka-ma-ro. All rights reserved.
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HamburgerMenu;
