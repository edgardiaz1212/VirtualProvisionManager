import { useState } from "react";

export interface StepperConfig<T extends string = string> {
  steps: T[];
  initialStep?: T;
}

export function useStepper<T extends string = string>({ 
  steps,
  initialStep
}: StepperConfig<T>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    initialStep ? steps.indexOf(initialStep) : 0
  );

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (step: T) => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const resetStepper = () => {
    setCurrentStepIndex(initialStep ? steps.indexOf(initialStep) : 0);
  };

  return {
    currentStep: steps[currentStepIndex],
    currentStepIndex,
    steps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetStepper,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1
  };
}
