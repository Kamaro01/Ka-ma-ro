'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { passwordResetService } from '@/services/passwordResetService';

type ResetStep = 'request' | 'confirmation' | 'reset' | 'success';

const PasswordResetInteractive = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // If token is present in URL, validate it and show reset form
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    setLoading(true);
    setError('');

    const validation = await passwordResetService.validateResetToken(resetToken);

    if (validation.isValid && validation.email) {
      setEmail(validation.email);
      setCurrentStep('reset');
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.');
      setCurrentStep('request');
    }

    setLoading(false);
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const result = await passwordResetService.requestPasswordReset({
      email,
      ipAddress: undefined, // Could be set from server
      userAgent: navigator.userAgent,
    });

    if (result.success) {
      setMessage(result.message);
      setCurrentStep('confirmation');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      setLoading(false);
      return;
    }

    const result = await passwordResetService.confirmPasswordReset({
      token,
      newPassword,
    });

    if (result.success) {
      setMessage(result.message);
      setCurrentStep('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-card rounded-lg elevation-2 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="LockClosedIcon" size={32} className="text-accent" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
              {currentStep === 'request' && 'Reset Password'}
              {currentStep === 'confirmation' && 'Check Your Email'}
              {currentStep === 'reset' && 'Create New Password'}
              {currentStep === 'success' && 'Password Reset Complete'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 'request' &&
                'Enter your email address and we will send you a password reset link'}
              {currentStep === 'confirmation' &&
                'We have sent password reset instructions to your email'}
              {currentStep === 'reset' && 'Enter your new password below'}
              {currentStep === 'success' && 'Your password has been successfully reset'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <Icon
                name="ExclamationCircleIcon"
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Icon
                name="CheckCircleIcon"
                size={20}
                className="text-green-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {/* Request Form */}
          {currentStep === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Confirmation Screen */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Icon
                    name="EnvelopeIcon"
                    size={20}
                    className="text-accent flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email Sent</h3>
                    <p className="text-sm text-muted-foreground">
                      Please check your email inbox and spam folder for password reset instructions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="ClockIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Link Expires Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      The reset link will expire in 15 minutes for security reasons.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('request')}
                className="w-full bg-muted text-foreground py-3 px-6 rounded-lg font-semibold transition-smooth hover:bg-muted/80 active:scale-97"
              >
                Resend Email
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Reset Form */}
          {currentStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="email-display"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-display"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 border border-border rounded-lg bg-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Password Strength:</span>
                      <span className="text-xs font-medium text-foreground">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Password must contain:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon
                      name={newPassword.length >= 8 ? 'CheckCircleIcon' : 'XCircleIcon'}
                      size={16}
                      className={newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      name={
                        /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                          ? 'CheckCircleIcon'
                          : 'XCircleIcon'
                      }
                      size={16}
                      className={
                        /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    />
                    Uppercase and lowercase letters
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      name={/\d/.test(newPassword) ? 'CheckCircleIcon' : 'XCircleIcon'}
                      size={16}
                      className={/\d/.test(newPassword) ? 'text-green-600' : 'text-red-600'}
                    />
                    At least one number
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength < 40}
                className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Success Screen */}
          {currentStep === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" size={40} className="text-green-600" />
              </div>

              <div>
                <p className="text-foreground mb-2">Your password has been successfully reset.</p>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to the login page in a moment...
                </p>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <Icon name="ShieldCheckIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Security Information</h3>
            <p className="text-xs text-muted-foreground">
              For your security, password reset links expire after 15 minutes and can only be used
              once. If you did not request this password reset, please contact our support team
              immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetInteractive;
