import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HypervisorType } from "@/lib/constants";
import { Plan } from "@shared/schema";
import { VmConfigFormValues } from "./vm-configuration";

interface VmReviewProps {
  hypervisorType: HypervisorType;
  planType: "cataloged" | "custom";
  selectedPlan: Plan | null;
  customConfig: {
    ram: string;
    cpuCores: string;
    diskSize: string;
    diskType: string;
  };
  vmConfig: VmConfigFormValues;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  onReset: () => void;
  onRetry: () => void;
}

export function VmReview({
  hypervisorType,
  planType,
  selectedPlan,
  customConfig,
  vmConfig,
  onPrevious,
  onSubmit,
  isLoading,
  isSuccess,
  isError,
  errorMessage,
  onReset,
  onRetry
}: VmReviewProps) {
  const ram = planType === "cataloged" ? selectedPlan?.ram : customConfig.ram;
  const cpuCores = planType === "cataloged" ? selectedPlan?.cpuCores : customConfig.cpuCores;
  const diskSize = planType === "cataloged" ? selectedPlan?.diskSize : customConfig.diskSize;
  const diskType = customConfig.diskType;
  
  // If in loading, success, or error state, show the appropriate UI
  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:p-6 flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 text-primary mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg text-gray-700">Creating virtual machine...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="px-4 py-5 sm:p-6">
        <Alert variant="default" className="rounded-md bg-green-50 p-4 mb-6">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <AlertTitle className="ml-3 text-sm font-medium text-green-800">VM Creation Successful</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-green-700">
            <p>Virtual machine has been successfully created and is now being provisioned.</p>
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">VM Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">VM Name</p>
              <p className="text-sm font-medium text-gray-800">{vmConfig.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hypervisor</p>
              <p className="text-sm font-medium text-gray-800">{hypervisorType === "proxmox" ? "Proxmox" : "vCenter"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-medium text-green-600">Provisioning</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creation Time</p>
              <p className="text-sm font-medium text-gray-800">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={onReset}
            className="inline-flex items-center"
          >
            Create Another VM
          </Button>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="px-4 py-5 sm:p-6">
        <Alert variant="destructive" className="rounded-md bg-red-50 p-4 mb-6">
          <XCircle className="h-5 w-5 text-red-400" />
          <AlertTitle className="ml-3 text-sm font-medium text-red-800">VM Creation Failed</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-red-700">
            <p>{errorMessage || "Failed to connect to hypervisor. Please check your connection and try again."}</p>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={onReset}
            className="inline-flex items-center"
          >
            Start Over
          </Button>
          <Button 
            onClick={onRetry}
            className="inline-flex items-center"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Default review UI
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Review and Submit</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Virtual Machine Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Hypervisor Type</p>
            <p className="text-sm font-medium text-gray-800">{hypervisorType === "proxmox" ? "Proxmox" : "vCenter"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plan Type</p>
            <p className="text-sm font-medium text-gray-800">
              {planType === "cataloged" 
                ? `Predefined - ${selectedPlan?.name || ""}` 
                : "Custom"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">VM Name</p>
            <p className="text-sm font-medium text-gray-800">{vmConfig.name || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Operating System</p>
            <p className="text-sm font-medium text-gray-800">{vmConfig.operatingSystem || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CPU</p>
            <p className="text-sm font-medium text-gray-800">{cpuCores} Cores</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">RAM</p>
            <p className="text-sm font-medium text-gray-800">{ram}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disk</p>
            <p className="text-sm font-medium text-gray-800">{diskSize} ({diskType === "ssd" ? "SSD" : "HDD"})</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Network</p>
            <p className="text-sm font-medium text-gray-800">{vmConfig.networkInterface || "Not specified"}</p>
          </div>
        </div>

        {hypervisorType === "proxmox" && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-800 mb-2">Proxmox Configuration</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Storage Pool</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.datastore || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Node</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.hostGroup || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">VNC Access</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.vncAccess ? "Enabled" : "Disabled"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Backup</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.backup ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          </div>
        )}

        {hypervisorType === "vcenter" && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-800 mb-2">vCenter Configuration</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Datastore</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.datastore || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cluster</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.cluster || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Resource Pool</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.resourcePool || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">VM Folder</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.folder || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Initial Snapshot</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.snapshot ? "Enabled" : "Disabled"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Backup</p>
                <p className="text-sm font-medium text-gray-800">{vmConfig.backup ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Alert className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <InfoIcon className="h-5 w-5 text-blue-400" />
        <AlertDescription className="ml-3 text-sm text-blue-700">
          Please review the information above before submitting. Once submitted, the virtual machine creation process will begin.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          className="inline-flex items-center"
        >
          Create VM
        </Button>
      </div>
    </div>
  );
}
