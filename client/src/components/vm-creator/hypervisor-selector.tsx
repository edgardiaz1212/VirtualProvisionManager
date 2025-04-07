import { useState } from "react";
import { Server, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { HypervisorType } from "@/lib/constants";

interface HypervisorSelectorProps {
  selectedHypervisor: HypervisorType | null;
  onSelect: (hypervisor: HypervisorType) => void;
  onNext: () => void;
}

export function HypervisorSelector({ 
  selectedHypervisor, 
  onSelect, 
  onNext 
}: HypervisorSelectorProps) {
  const isValid = selectedHypervisor !== null;

  const hypervisorOptions = [
    {
      type: "proxmox" as HypervisorType,
      name: "Proxmox",
      description: "Open-source virtualization platform",
      icon: <Server className="h-8 w-8" />,
      iconBgColor: "bg-red-100 text-red-600"
    },
    {
      type: "vcenter" as HypervisorType,
      name: "vCenter",
      description: "VMware virtualization management",
      icon: <Cpu className="h-8 w-8" />,
      iconBgColor: "bg-blue-100 text-blue-600"
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Select Hypervisor Type</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hypervisorOptions.map((option) => (
          <div 
            key={option.type}
            onClick={() => onSelect(option.type)}
            className={cn(
              "flex cursor-pointer items-center p-4 border-2 rounded-lg transition-colors duration-200",
              selectedHypervisor === option.type 
                ? "bg-blue-50 border-primary" 
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", option.iconBgColor)}>
              {option.icon}
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">{option.name}</h4>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
            <div className="ml-auto">
              <div 
                className={cn(
                  "h-5 w-5 border-2 rounded-full flex items-center justify-center", 
                  selectedHypervisor === option.type 
                    ? "border-primary bg-primary" 
                    : "border-gray-300"
                )}
              >
                {selectedHypervisor === option.type && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedHypervisor === "vcenter" && (
        <div className="mt-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription>
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Compatible with vCenter 6.x and 7.x</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Both vCenter 6 and 7 versions are supported. Version-specific features will be available in later steps.</p>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="inline-flex items-center"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
