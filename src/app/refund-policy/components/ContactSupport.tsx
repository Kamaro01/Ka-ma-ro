import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  href: string;
}

interface ContactSupportProps {
  methods: ContactMethod[];
}

const ContactSupport = ({ methods }: ContactSupportProps) => {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4">
        Need Help with Returns?
      </h2>
      <p className="text-foreground/80 mb-6">
        Our customer support team is here to assist you with any questions about returns or refunds.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method, index) => (
          <a
            key={index}
            href={method.href}
            className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-accent transition-smooth active:scale-97"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name={method.icon as any} size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="caption text-muted-foreground mb-0.5">{method.label}</p>
              <p className="font-medium text-foreground">{method.value}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ContactSupport;
