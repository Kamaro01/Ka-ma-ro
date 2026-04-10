import React from 'react';

interface PolicySectionProps {
  title: string;
  content: string[];
  icon?: string;
}

const PolicySection = ({ title, content, icon }: PolicySectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
        )}
        <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">
        {content.map((paragraph, index) => (
          <p key={index} className="text-foreground/80 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default PolicySection;
