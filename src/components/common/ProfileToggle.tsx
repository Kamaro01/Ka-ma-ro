'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

const ProfileToggle = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Link
      href={isAuthenticated ? '/user-account-dashboard' : '/login'}
      className="touch-target flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97"
      aria-label={isAuthenticated ? 'Account dashboard' : 'Login'}
      title={isAuthenticated ? 'View your account' : 'Login to your account'}
    >
      <Icon
        name={isAuthenticated ? 'UserCircleIcon' : 'UserIcon'}
        size={24}
        className={`text-foreground transition-smooth ${isAuthenticated ? 'text-accent' : ''}`}
      />
    </Link>
  );
};

export default ProfileToggle;
