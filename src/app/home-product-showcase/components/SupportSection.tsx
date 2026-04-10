'use client';

import React from 'react';

const SupportSection = () => {
  return (
    <div className="bg-card rounded-lg p-8 elevation-1">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Need Help?</h2>
        <p className="text-muted-foreground">Our support team is here to assist you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <a
          href="/customer-support-center"
          className="flex flex-col items-center p-6 bg-background rounded-lg hover:elevation-1 transition-smooth"
        >
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground mb-2">Contact Us</h3>
          <p className="text-sm text-muted-foreground text-center">
            Get in touch with our support team
          </p>
        </a>

        <div className="flex flex-col items-center p-6 bg-background rounded-lg">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center">
            New features and services launching soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
