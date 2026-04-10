import React from 'react';
import Icon from '@/components/ui/AppIcon';

const ContactSupport = () => {
  return (
    <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
          <Icon name="EnvelopeIcon" size={24} className="text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Need Shipping Assistance?
          </h3>
          <p className="text-foreground/80 mb-4">
            Our customer support team is available to help with any shipping questions or special
            delivery requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:shipping@kamaro.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-smooth touch-target"
            >
              <Icon name="EnvelopeIcon" size={18} />
              <span className="font-medium">shipping@kamaro.com</span>
            </a>
            <a
              href="tel:+1-800-KAMARO"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-muted transition-smooth touch-target"
            >
              <Icon name="PhoneIcon" size={18} />
              <span className="font-medium">+1-800-KAMARO</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
