// Hypervisor types
export type HypervisorType = "proxmox" | "vcenter";

// VM creation steps
export const VM_CREATION_STEPS = {
  HYPERVISOR: 'hypervisor',
  RESOURCES: 'resources',
  CONFIGURATION: 'configuration',
  REVIEW: 'review'
} as const;

export type VmCreationStep = typeof VM_CREATION_STEPS[keyof typeof VM_CREATION_STEPS];

// OS options
export const OS_OPTIONS = [
  { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS" },
  { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS" },
  { value: "centos-7", label: "CentOS 7" },
  { value: "centos-8", label: "CentOS 8" },
  { value: "windows-server-2019", label: "Windows Server 2019" },
  { value: "windows-server-2022", label: "Windows Server 2022" },
  { value: "windows-10", label: "Windows 10" },
  { value: "windows-11", label: "Windows 11" }
];

// Network interface options
export const NETWORK_OPTIONS = [
  { value: "prod-net", label: "Production Network" },
  { value: "dev-net", label: "Development Network" },
  { value: "test-net", label: "Test Network" },
  { value: "dmz-net", label: "DMZ Network" }
];

// Proxmox storage options
export const PROXMOX_STORAGE_OPTIONS = [
  { value: "local-lvm", label: "local-lvm" },
  { value: "local-zfs", label: "local-zfs" },
  { value: "ceph-pool", label: "ceph-pool" },
  { value: "nfs-storage", label: "nfs-storage" }
];

// Proxmox node options
export const PROXMOX_NODE_OPTIONS = [
  { value: "node1", label: "node1" },
  { value: "node2", label: "node2" },
  { value: "node3", label: "node3" }
];

// vCenter datastore options
export const VCENTER_DATASTORE_OPTIONS = [
  { value: "ds-ssd-01", label: "ds-ssd-01" },
  { value: "ds-ssd-02", label: "ds-ssd-02" },
  { value: "ds-sas-01", label: "ds-sas-01" },
  { value: "ds-sas-02", label: "ds-sas-02" }
];

// vCenter cluster options
export const VCENTER_CLUSTER_OPTIONS = [
  { value: "prod-cluster", label: "prod-cluster" },
  { value: "dev-cluster", label: "dev-cluster" },
  { value: "test-cluster", label: "test-cluster" }
];

// vCenter resource pool options
export const VCENTER_RESOURCE_POOL_OPTIONS = [
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "low", label: "Low Priority" }
];

// vCenter folder options
export const VCENTER_FOLDER_OPTIONS = [
  { value: "web-servers", label: "Web Servers" },
  { value: "app-servers", label: "App Servers" },
  { value: "db-servers", label: "DB Servers" },
  { value: "utility-servers", label: "Utility Servers" }
];
