import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);
}

// Helper to get readable labels for operating systems
export function getOsLabel(osValue: string): string {
  const osMap: Record<string, string> = {
    "ubuntu-20.04": "Ubuntu 20.04 LTS",
    "ubuntu-22.04": "Ubuntu 22.04 LTS",
    "centos-7": "CentOS 7",
    "centos-8": "CentOS 8",
    "windows-server-2019": "Windows Server 2019",
    "windows-server-2022": "Windows Server 2022",
    "windows-10": "Windows 10",
    "windows-11": "Windows 11"
  };
  
  return osMap[osValue] || osValue;
}

// Helper to get readable labels for network interfaces
export function getNetworkLabel(networkValue: string): string {
  const networkMap: Record<string, string> = {
    "prod-net": "Production Network",
    "dev-net": "Development Network",
    "test-net": "Test Network",
    "dmz-net": "DMZ Network"
  };
  
  return networkMap[networkValue] || networkValue;
}

// Helper to build a VM creation payload
export function buildVmCreationPayload(formData: any): any {
  // This function can transform the form data into the structure
  // expected by the API if necessary
  return {
    ...formData,
    createdAt: new Date().toISOString()
  };
}
