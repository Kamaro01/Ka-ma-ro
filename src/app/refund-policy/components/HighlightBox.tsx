import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface HighlightBoxProps {
  type: 'info' | 'warning' | 'success';
  title: string;
  content: string[];
}

const HighlightBox = ({ type, title, content }: HighlightBoxProps) => {
  const styles = {
    info: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      icon: 'InformationCircleIcon',
      iconColor: 'text-accent',
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: 'ExclamationTriangleIcon',
      iconColor: 'text-warning',
    },
    success: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: 'CheckCircleIcon',
      iconColor: 'text-success',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 md:p-6 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon
          name={style.icon as any}
          size={24}
          className={`${style.iconColor} flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{title}</h3>
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-foreground/80 text-sm leading-relaxed">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HighlightBox;
