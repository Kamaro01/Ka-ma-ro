'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  if (!isHydrated) {
    return (
      <div className="bg-gradient-to-r from-accent to-blue-600 rounded-lg p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-white/90 mb-8">
            Subscribe to get exclusive deals, product launches, and tech insights delivered to your
            inbox.
          </p>
          <div className="h-14 bg-white/20 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-accent to-blue-600 rounded-lg p-8 md:p-12 elevation-3">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
          Join the Movement
        </h2>
        <p className="text-white/90 mb-8">
          Subscribe to get exclusive deals, product launches, and tech insights delivered to your
          inbox.
        </p>

        {isSuccess ? (
          <div className="flex items-center justify-center gap-3 p-4 bg-success text-success-foreground rounded-md">
            <Icon name="CheckCircleIcon" size={24} />
            <span className="font-medium">Successfully subscribed! Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-4 rounded-md text-foreground placeholder:text-muted-foreground focus-ring"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-white text-accent font-medium rounded-md hover:bg-white/90 transition-smooth touch-target disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>Subscribing...</span>
                </div>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterSection;
