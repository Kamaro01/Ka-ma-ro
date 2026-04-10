'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'request' | 'reset'>('request');

  React.useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      setMode('reset');
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsResetting(true);

    const { success: resetSuccess, error: resetError } = await authService.resetPassword(email);

    setIsResetting(false);

    if (resetError) {
      setError(resetError);
    } else {
      setSuccess('Password reset email sent! Please check your inbox.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);

    const { success: updateSuccess, error: updateError } =
      await authService.updatePassword(newPassword);

    setIsResetting(false);

    if (updateError) {
      setError(updateError);
    } else {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-heading font-bold text-3xl text-foreground">
            {mode === 'request' ? 'Reset Password' : 'Create New Password'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'request'
              ? 'Enter your email address and we will send you a password reset link'
              : 'Enter your new password below'}
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={mode === 'request' ? handleRequestReset : handleResetPassword}
        >
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {mode === 'request' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-muted rounded-lg placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-muted rounded-lg placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-muted rounded-lg placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isResetting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
          >
            {isResetting
              ? 'Processing...'
              : mode === 'request'
                ? 'Send Reset Link'
                : 'Update Password'}
          </button>

          <div className="text-center">
            <a href="/login" className="text-sm text-accent hover:text-accent/80 transition-smooth">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
