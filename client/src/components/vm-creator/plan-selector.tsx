import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plan, predefinedPlans } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Server, HardDrive, MemoryStick, Cpu } from "lucide-react";

interface PlanSelectorProps {
  onPlanSelect: (plan: Plan | null) => void;
  onCustomConfigChange: (config: { ram: string; cpuCores: string; diskSize: string; diskType: string }) => void;
  selectedPlan: Plan | null;
  planType: "cataloged" | "custom";
  setPlanType: (type: "cataloged" | "custom") => void;
  customConfig: {
    ram: string;
    cpuCores: string;
    diskSize: string;
    diskType: string;
  };
  onNext: () => void;
  onPrevious: () => void;
}

export function PlanSelector({ 
  onPlanSelect, 
  onCustomConfigChange,
  selectedPlan, 
  planType, 
  setPlanType,
  customConfig,
  onNext,
  onPrevious
}: PlanSelectorProps) {
  // Set initial default values for custom configuration if they're empty
  useEffect(() => {
    if (planType === "custom" && 
        (customConfig.ram === "" || 
         customConfig.cpuCores === "" || 
         customConfig.diskSize === "")) {
      // Set default values if not set
      onCustomConfigChange({
        ram: customConfig.ram || "4 GB",
        cpuCores: customConfig.cpuCores || "2",
        diskSize: customConfig.diskSize || "40 GB",
        diskType: customConfig.diskType
      });
    }
  }, [planType, customConfig, onCustomConfigChange]);

  // Validation for next button
  const isValid = () => {
    if (planType === "cataloged") {
      return selectedPlan !== null;
    } else {
      return (
        customConfig.ram !== "" && 
        customConfig.cpuCores !== "" && 
        customConfig.diskSize !== ""
      );
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Resource Configuration</h3>
      
      <div className="mb-6">
        <RadioGroup 
          value={planType} 
          onValueChange={(value) => setPlanType(value as "cataloged" | "custom")}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cataloged" id="plan-cataloged" />
            <Label htmlFor="plan-cataloged">Predefined Plans</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="plan-custom" />
            <Label htmlFor="plan-custom">Custom Configuration</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Predefined Plans */}
      {planType === "cataloged" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {predefinedPlans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => onPlanSelect(plan)}
              className={cn(
                "cursor-pointer p-4 border-2 rounded-lg transition-all duration-200",
                selectedPlan?.id === plan.id 
                  ? "bg-blue-50 border-primary" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div 
                  className={cn(
                    "h-5 w-5 border-2 rounded-full flex items-center justify-center",
                    selectedPlan?.id === plan.id
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  )}
                >
                  {selectedPlan?.id === plan.id && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">CPU: {plan.cpuCores} cores</span>
                </div>
                <div className="flex items-center">
                  <MemoryStick className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">RAM: {plan.ram}</span>
                </div>
                <div className="flex items-center">
                  <HardDrive className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Disk: {plan.diskSize}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Configuration */}
      {planType === "custom" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ram" className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</Label>
              <Select 
                value={customConfig.ram} 
                onValueChange={(value) => onCustomConfigChange({...customConfig, ram: value})}
              >
                <SelectTrigger id="ram">
                  <SelectValue placeholder="Select RAM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 GB">1 GB</SelectItem>
                  <SelectItem value="2 GB">2 GB</SelectItem>
                  <SelectItem value="4 GB">4 GB</SelectItem>
                  <SelectItem value="8 GB">8 GB</SelectItem>
                  <SelectItem value="16 GB">16 GB</SelectItem>
                  <SelectItem value="32 GB">32 GB</SelectItem>
                  <SelectItem value="64 GB">64 GB</SelectItem>
                  <SelectItem value="128 GB">128 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cpu-cores" className="block text-sm font-medium text-gray-700 mb-1">CPU Cores</Label>
              <Select 
                value={customConfig.cpuCores} 
                onValueChange={(value) => onCustomConfigChange({...customConfig, cpuCores: value})}
              >
                <SelectTrigger id="cpu-cores">
                  <SelectValue placeholder="Select CPU Cores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Core</SelectItem>
                  <SelectItem value="2">2 Cores</SelectItem>
                  <SelectItem value="4">4 Cores</SelectItem>
                  <SelectItem value="8">8 Cores</SelectItem>
                  <SelectItem value="16">16 Cores</SelectItem>
                  <SelectItem value="32">32 Cores</SelectItem>
                  <SelectItem value="64">64 Cores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="disk-size" className="block text-sm font-medium text-gray-700 mb-1">Disk Size (GB)</Label>
              <Select 
                value={customConfig.diskSize} 
                onValueChange={(value) => onCustomConfigChange({...customConfig, diskSize: value})}
              >
                <SelectTrigger id="disk-size">
                  <SelectValue placeholder="Select Disk Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20 GB">20 GB</SelectItem>
                  <SelectItem value="40 GB">40 GB</SelectItem>
                  <SelectItem value="80 GB">80 GB</SelectItem>
                  <SelectItem value="160 GB">160 GB</SelectItem>
                  <SelectItem value="320 GB">320 GB</SelectItem>
                  <SelectItem value="640 GB">640 GB</SelectItem>
                  <SelectItem value="1 TB">1 TB</SelectItem>
                  <SelectItem value="2 TB">2 TB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Disk Type</Label>
            <RadioGroup 
              value={customConfig.diskType} 
              onValueChange={(value) => onCustomConfigChange({...customConfig, diskType: value})}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ssd" id="disk-ssd" />
                <Label htmlFor="disk-ssd">SSD (Recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hdd" id="disk-hdd" />
                <Label htmlFor="disk-hdd">HDD</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

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
          onClick={onNext} 
          disabled={!isValid()}
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
