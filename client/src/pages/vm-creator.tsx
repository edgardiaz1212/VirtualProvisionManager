import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { HypervisorSelector } from "@/components/vm-creator/hypervisor-selector";
import { PlanSelector } from "@/components/vm-creator/plan-selector";
import { VmConfiguration, VmConfigFormValues } from "@/components/vm-creator/vm-configuration";
import { VmReview } from "@/components/vm-creator/vm-review";
import { ProgressStepper } from "@/components/vm-creator/progress-stepper";
import { useStepper } from "@/hooks/use-stepper";
import { Plan, predefinedPlans } from "@shared/schema";
import { HypervisorType, VM_CREATION_STEPS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/layout";

export default function VmCreator() {
  const { toast } = useToast();
  const [hypervisorType, setHypervisorType] = useState<HypervisorType | null>(null);
  const [planType, setPlanType] = useState<"cataloged" | "custom">("cataloged");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customConfig, setCustomConfig] = useState({
    ram: "",
    cpuCores: "",
    diskSize: "",
    diskType: "ssd"
  });
  const [vmConfig, setVmConfig] = useState<VmConfigFormValues>({
    name: "",
    description: "",
    operatingSystem: "",
    networkInterface: "",
    ipAddress: "",
    gateway: "",
    dns: "",
    datastore: "",
    hostGroup: "",
    cluster: "",
    resourcePool: "",
    folder: "",
    vncAccess: false,
    snapshot: false,
    backup: false
  });

  // Set up the stepper
  const { 
    currentStep, 
    goToNextStep, 
    goToPreviousStep, 
    resetStepper 
  } = useStepper({
    steps: [
      VM_CREATION_STEPS.HYPERVISOR,
      VM_CREATION_STEPS.RESOURCES,
      VM_CREATION_STEPS.CONFIGURATION,
      VM_CREATION_STEPS.REVIEW
    ]
  });

  // VM creation mutation
  const createVmMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        hypervisorType,
        planType,
        planId: planType === "cataloged" ? selectedPlan?.id : null,
        ram: planType === "cataloged" ? selectedPlan?.ram : customConfig.ram,
        cpuCores: planType === "cataloged" ? selectedPlan?.cpuCores : customConfig.cpuCores,
        diskSize: planType === "cataloged" ? selectedPlan?.diskSize : customConfig.diskSize,
        diskType: customConfig.diskType,
        ...vmConfig
      };
      
      return await apiRequest("POST", "/api/virtual-machines", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Virtual machine created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create virtual machine: ${error.message}`,
      });
    }
  });

  // Handle hypervisor selection
  const handleHypervisorSelect = (type: HypervisorType) => {
    setHypervisorType(type);
  };

  // Handle plan selection
  const handlePlanSelect = (plan: Plan | null) => {
    setSelectedPlan(plan);
  };

  // Handle custom config changes
  const handleCustomConfigChange = (config: typeof customConfig) => {
    setCustomConfig(config);
  };

  // Handle VM configuration form submission
  const handleVmConfigSubmit = (data: VmConfigFormValues) => {
    setVmConfig(data);
  };

  // Handle form reset
  const handleReset = () => {
    setHypervisorType(null);
    setPlanType("cataloged");
    setSelectedPlan(null);
    setCustomConfig({
      ram: "",
      cpuCores: "",
      diskSize: "",
      diskType: "ssd"
    });
    setVmConfig({
      name: "",
      description: "",
      operatingSystem: "",
      networkInterface: "",
      ipAddress: "",
      gateway: "",
      dns: "",
      datastore: "",
      hostGroup: "",
      cluster: "",
      resourcePool: "",
      folder: "",
      vncAccess: false,
      snapshot: false,
      backup: false
    });
    resetStepper();
    createVmMutation.reset();
  };

  // Submit VM creation
  const handleSubmit = () => {
    createVmMutation.mutate();
  };

  // Handle retry on error
  const handleRetry = () => {
    createVmMutation.reset();
    handleSubmit();
  };

  const steps = [
    { label: "Hypervisor" },
    { label: "Resources" },
    { label: "Configuration" },
    { label: "Review" }
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Virtual Machine</h1>
        <p className="text-muted-foreground mt-2">Configure and deploy a new virtual machine to available hypervisors.</p>
      </div>
      
      {/* Form container */}
      <Card className="shadow-sm">
        {/* Progress bar */}
        <ProgressStepper currentStep={steps.indexOf({ label: currentStep }) + 1} steps={steps} />

        {/* Form content */}
        <CardContent className="p-6">
          {currentStep === VM_CREATION_STEPS.HYPERVISOR && (
            <HypervisorSelector 
              selectedHypervisor={hypervisorType}
              onSelect={handleHypervisorSelect}
              onNext={goToNextStep}
            />
          )}

          {currentStep === VM_CREATION_STEPS.RESOURCES && (
            <PlanSelector 
              onPlanSelect={handlePlanSelect}
              onCustomConfigChange={handleCustomConfigChange}
              selectedPlan={selectedPlan}
              planType={planType}
              setPlanType={setPlanType}
              customConfig={customConfig}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
            />
          )}

          {currentStep === VM_CREATION_STEPS.CONFIGURATION && hypervisorType && (
            <VmConfiguration 
              hypervisorType={hypervisorType}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              onFormSubmit={handleVmConfigSubmit}
              initialValues={vmConfig}
            />
          )}

          {currentStep === VM_CREATION_STEPS.REVIEW && hypervisorType && (
            <VmReview 
              hypervisorType={hypervisorType}
              planType={planType}
              selectedPlan={selectedPlan}
              customConfig={customConfig}
              vmConfig={vmConfig}
              onPrevious={goToPreviousStep}
              onSubmit={handleSubmit}
              isLoading={createVmMutation.isPending}
              isSuccess={createVmMutation.isSuccess}
              isError={createVmMutation.isError}
              errorMessage={createVmMutation.error?.message}
              onReset={handleReset}
              onRetry={handleRetry}
            />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
