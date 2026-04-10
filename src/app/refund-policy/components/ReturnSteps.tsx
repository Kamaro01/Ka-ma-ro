import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ReturnStepsProps {
  steps: Step[];
}

const ReturnSteps = ({ steps }: ReturnStepsProps) => {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6">
        Return Process Steps
      </h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-smooth"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-heading font-semibold">
              {step.number}
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReturnSteps;
