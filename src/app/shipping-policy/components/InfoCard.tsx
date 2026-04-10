import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface InfoCardProps {
  title: string;
  items: string[];
  variant?: 'default' | 'warning' | 'success';
}

const InfoCard = ({ title, items, variant = 'default' }: InfoCardProps) => {
  const variantStyles = {
    default: 'bg-card border-border',
    warning: 'bg-warning/10 border-warning/30',
    success: 'bg-success/10 border-success/30',
  };

  const iconStyles = {
    default: 'text-accent',
    warning: 'text-warning',
    success: 'text-success',
  };

  return (
    <div className={`p-6 rounded-lg border ${variantStyles[variant]} elevation-1 mb-6`}>
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
        <Icon name="InformationCircleIcon" size={20} className={iconStyles[variant]} />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <Icon
              name="CheckCircleIcon"
              size={20}
              className={`flex-shrink-0 mt-0.5 ${iconStyles[variant]}`}
            />
            <span className="text-foreground/80">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoCard;
