import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HypervisorType } from "@/lib/constants";
import { z } from "zod";

interface VmConfigurationProps {
  hypervisorType: HypervisorType;
  onNext: () => void;
  onPrevious: () => void;
  onFormSubmit: (data: VmConfigFormValues) => void;
  initialValues: Partial<VmConfigFormValues>;
}

// Form schema for VM configuration
const vmConfigFormSchema = z.object({
  name: z.string().min(1, "VM name is required"),
  description: z.string().optional(),
  operatingSystem: z.string().min(1, "Operating system is required"),
  networkInterface: z.string().min(1, "Network interface is required"),
  ipAddress: z.string().optional(),
  gateway: z.string().optional(),
  dns: z.string().optional(),
  datastore: z.string().optional(),
  
  // Proxmox-specific fields
  hostGroup: z.string().optional(),
  vncAccess: z.boolean().optional(),
  
  // vCenter-specific fields
  cluster: z.string().optional(),
  resourcePool: z.string().optional(),
  folder: z.string().optional(),
  snapshot: z.boolean().optional(),
  
  // Common options
  backup: z.boolean().optional(),
});

export type VmConfigFormValues = z.infer<typeof vmConfigFormSchema>;

export function VmConfiguration({ 
  hypervisorType,
  onNext,
  onPrevious,
  onFormSubmit,
  initialValues 
}: VmConfigurationProps) {
  const form = useForm<VmConfigFormValues>({
    resolver: zodResolver(vmConfigFormSchema),
    defaultValues: {
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
      backup: false,
      ...initialValues
    }
  });

  function onSubmit(data: VmConfigFormValues) {
    onFormSubmit(data);
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Virtual Machine Configuration</h3>

          {/* Basic Information */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-800 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. web-server-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Web server for intranet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatingSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating System <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select OS" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ubuntu-20.04">Ubuntu 20.04 LTS</SelectItem>
                        <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
                        <SelectItem value="centos-7">CentOS 7</SelectItem>
                        <SelectItem value="centos-8">CentOS 8</SelectItem>
                        <SelectItem value="windows-server-2019">Windows Server 2019</SelectItem>
                        <SelectItem value="windows-server-2022">Windows Server 2022</SelectItem>
                        <SelectItem value="windows-10">Windows 10</SelectItem>
                        <SelectItem value="windows-11">Windows 11</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="networkInterface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network Interface <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prod-net">Production Network</SelectItem>
                        <SelectItem value="dev-net">Development Network</SelectItem>
                        <SelectItem value="test-net">Test Network</SelectItem>
                        <SelectItem value="dmz-net">DMZ Network</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Network Configuration */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-800 mb-4">Network Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 192.168.1.100" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Leave empty for DHCP</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gateway"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gateway</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 192.168.1.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNS Servers</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 8.8.8.8, 8.8.4.4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Hypervisor-specific Settings */}
          {hypervisorType === "proxmox" && (
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-800 mb-4">Proxmox-specific Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="datastore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Pool</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Storage Pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="local-lvm">local-lvm</SelectItem>
                          <SelectItem value="local-zfs">local-zfs</SelectItem>
                          <SelectItem value="ceph-pool">ceph-pool</SelectItem>
                          <SelectItem value="nfs-storage">nfs-storage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hostGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Node</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Node" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="node1">node1</SelectItem>
                          <SelectItem value="node2">node2</SelectItem>
                          <SelectItem value="node3">node3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 flex items-center space-x-8">
                <FormField
                  control={form.control}
                  name="vncAccess"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Enable VNC Console</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backup"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Include in Backup</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {hypervisorType === "vcenter" && (
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-800 mb-4">vCenter-specific Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="datastore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datastore</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Datastore" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ds-ssd-01">ds-ssd-01</SelectItem>
                          <SelectItem value="ds-ssd-02">ds-ssd-02</SelectItem>
                          <SelectItem value="ds-sas-01">ds-sas-01</SelectItem>
                          <SelectItem value="ds-sas-02">ds-sas-02</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cluster"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cluster</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Cluster" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prod-cluster">prod-cluster</SelectItem>
                          <SelectItem value="dev-cluster">dev-cluster</SelectItem>
                          <SelectItem value="test-cluster">test-cluster</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourcePool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Pool</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Resource Pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="folder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VM Folder</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Folder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="web-servers">Web Servers</SelectItem>
                          <SelectItem value="app-servers">App Servers</SelectItem>
                          <SelectItem value="db-servers">DB Servers</SelectItem>
                          <SelectItem value="utility-servers">Utility Servers</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 flex items-center space-x-8">
                <FormField
                  control={form.control}
                  name="snapshot"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Create initial snapshot</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backup"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Include in Backup</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button 
              type="button" 
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
              type="submit"
              className="inline-flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
