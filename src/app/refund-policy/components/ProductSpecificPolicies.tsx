import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ProductPolicy {
  category: string;
  icon: string;
  requirements: string[];
  notes: string;
}

interface ProductSpecificPoliciesProps {
  policies: ProductPolicy[];
}

const ProductSpecificPolicies = ({ policies }: ProductSpecificPoliciesProps) => {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4">
        Product-Specific Return Requirements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="bg-card rounded-lg border border-border p-6 hover:border-accent/50 transition-smooth"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon name={policy.icon as any} size={24} className="text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground">
                {policy.category}
              </h3>
            </div>

            <ul className="space-y-2 mb-4">
              {policy.requirements.map((req, reqIndex) => (
                <li key={reqIndex} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Icon name="CheckIcon" size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border">
              <p className="caption text-muted-foreground italic">{policy.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSpecificPolicies;
