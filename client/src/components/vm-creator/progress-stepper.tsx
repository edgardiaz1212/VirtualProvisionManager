import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  currentStep: number;
  steps: { label: string }[];
}

export function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  const getProgressWidth = () => {
    const stepPercentage = 100 / steps.length;
    return `${stepPercentage * currentStep}%`;
  };

  return (
    <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center">
        <div className="flex-1">
          <div className="relative">
            <div className="overflow-hidden h-2 flex rounded bg-gray-200">
              <div 
                className="transition-all duration-500 ease-in-out bg-primary rounded" 
                style={{ width: getProgressWidth() }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={cn(
                    currentStep >= index + 1 ? "text-primary font-medium" : "text-gray-500"
                  )}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
