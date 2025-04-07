import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2, Loader2, Check, X, Wrench } from "lucide-react";
import { Hypervisor } from "@shared/schema";

// Form schema for adding/editing hypervisors
const hypervisorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["proxmox", "vcenter"]),
  url: z.string().url("URL must be a valid URL"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(1, "Password is required").optional(),
  apiToken: z.string().optional(),
  useApiToken: z.boolean().default(false),
  verifySSL: z.boolean().default(true),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  datacenter: z.string().optional(),
});

const hypervisorTestSchema = z.object({
  id: z.number(),
});

type HypervisorFormValues = z.infer<typeof hypervisorFormSchema>;
type HypervisorTestValues = z.infer<typeof hypervisorTestSchema>;

export default function HypervisorsManagement() {
  const { toast } = useToast();
  const [isAddHypervisorOpen, setIsAddHypervisorOpen] = useState(false);
  const [isEditHypervisorOpen, setIsEditHypervisorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHypervisor, setSelectedHypervisor] = useState<Hypervisor | null>(null);

  // Form for adding hypervisors
  const addForm = useForm<HypervisorFormValues>({
    resolver: zodResolver(hypervisorFormSchema),
    defaultValues: {
      name: "",
      type: "proxmox",
      url: "",
      username: "",
      password: "",
      apiToken: "",
      useApiToken: false,
      verifySSL: true,
      status: "active",
      datacenter: "",
    },
  });

  // Form for editing hypervisors
  const editForm = useForm<HypervisorFormValues>({
    resolver: zodResolver(hypervisorFormSchema),
    defaultValues: {
      name: "",
      type: "proxmox",
      url: "",
      username: "",
      password: "",
      apiToken: "",
      useApiToken: false,
      verifySSL: true,
      status: "active",
      datacenter: "",
    },
  });

  // Watch the useApiToken field to conditionally show fields
  const addUseApiToken = addForm.watch("useApiToken");
  const editUseApiToken = editForm.watch("useApiToken");
  const addHypervisorType = addForm.watch("type");
  const editHypervisorType = editForm.watch("type");

  // Query to fetch hypervisors
  const { data: hypervisors = [], isLoading } = useQuery<Hypervisor[]>({
    queryKey: ["/api/hypervisors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/hypervisors");
      return response.json();
    },
  });

  // Mutation to add a hypervisor
  const addHypervisorMutation = useMutation({
    mutationFn: async (hypervisorData: HypervisorFormValues) => {
      const response = await apiRequest("POST", "/api/hypervisors", hypervisorData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hypervisors"] });
      setIsAddHypervisorOpen(false);
      addForm.reset();
      toast({
        title: "Hypervisor added successfully",
        description: "The hypervisor has been added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add hypervisor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a hypervisor
  const updateHypervisorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: HypervisorFormValues }) => {
      const response = await apiRequest("PUT", `/api/hypervisors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hypervisors"] });
      setIsEditHypervisorOpen(false);
      setSelectedHypervisor(null);
      editForm.reset();
      toast({
        title: "Hypervisor updated successfully",
        description: "The hypervisor information has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update hypervisor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a hypervisor
  const deleteHypervisorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/hypervisors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hypervisors"] });
      setIsDeleteDialogOpen(false);
      setSelectedHypervisor(null);
      toast({
        title: "Hypervisor deleted successfully",
        description: "The hypervisor has been removed from the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete hypervisor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to test a hypervisor connection
  const testHypervisorMutation = useMutation({
    mutationFn: async ({ id }: HypervisorTestValues) => {
      const response = await apiRequest("POST", `/api/hypervisors/${id}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Connection successful" : "Connection failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle opening the edit dialog
  const handleEditHypervisor = (hypervisor: Hypervisor) => {
    setSelectedHypervisor(hypervisor);
    editForm.reset({
      name: hypervisor.name,
      type: hypervisor.type,
      url: hypervisor.url,
      username: hypervisor.username,
      password: "", // Don't set password for edit
      apiToken: "", // Don't set API token for edit
      useApiToken: hypervisor.hasToken, // Set based on whether hypervisor has a token
      verifySSL: hypervisor.verifySSL,
      status: hypervisor.status,
      datacenter: hypervisor.datacenter || "",
    });
    setIsEditHypervisorOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteHypervisor = (hypervisor: Hypervisor) => {
    setSelectedHypervisor(hypervisor);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission for adding a hypervisor
  const onAddSubmit = (data: HypervisorFormValues) => {
    // If using API token, remove password; if using password, remove API token
    const submitData = { ...data };
    if (submitData.useApiToken) {
      delete submitData.password;
    } else {
      delete submitData.apiToken;
    }
    delete submitData.useApiToken; // Remove useApiToken as it's not part of the schema

    addHypervisorMutation.mutate(submitData);
  };

  // Handle form submission for editing a hypervisor
  const onEditSubmit = (data: HypervisorFormValues) => {
    if (!selectedHypervisor) return;
    
    // Prepare update data
    const updateData = { ...data };
    
    // If using API token, remove password; if using password, remove API token
    if (updateData.useApiToken) {
      delete updateData.password;
      // Only include API token if it was changed (not empty)
      if (!updateData.apiToken) {
        delete updateData.apiToken;
      }
    } else {
      delete updateData.apiToken;
      // Only include password if it was changed (not empty)
      if (!updateData.password) {
        delete updateData.password;
      }
    }
    
    delete updateData.useApiToken; // Remove useApiToken as it's not part of the schema
    
    updateHypervisorMutation.mutate({ id: selectedHypervisor.id, data: updateData });
  };

  // Handle testing a hypervisor connection
  const handleTestConnection = (hypervisor: Hypervisor) => {
    testHypervisorMutation.mutate({ id: hypervisor.id });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Hypervisor Management</h1>
          <Button onClick={() => setIsAddHypervisorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hypervisor
          </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hypervisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No hypervisors found. Add a hypervisor to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  hypervisors.map((hypervisor) => (
                    <TableRow key={hypervisor.id}>
                      <TableCell className="font-medium">{hypervisor.name}</TableCell>
                      <TableCell className="capitalize">{hypervisor.type}</TableCell>
                      <TableCell className="truncate max-w-xs">{hypervisor.url}</TableCell>
                      <TableCell>{hypervisor.username}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            hypervisor.status === "active"
                              ? "bg-green-100 text-green-800"
                              : hypervisor.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {hypervisor.status === "active" ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : hypervisor.status === "maintenance" ? (
                            <Wrench className="mr-1 h-3 w-3" />
                          ) : (
                            <X className="mr-1 h-3 w-3" />
                          )}
                          {hypervisor.status.charAt(0).toUpperCase() + hypervisor.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTestConnection(hypervisor)}
                          disabled={testHypervisorMutation.isPending}
                        >
                          {testHypervisorMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditHypervisor(hypervisor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteHypervisor(hypervisor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Add Hypervisor Dialog */}
        <Dialog open={isAddHypervisorOpen} onOpenChange={setIsAddHypervisorOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Hypervisor</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hypervisor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hypervisor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hypervisor type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proxmox">Proxmox</SelectItem>
                          <SelectItem value="vcenter">vCenter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            addHypervisorType === "proxmox" 
                              ? "https://proxmox.example.com:8006/api2/json" 
                              : "https://vcenter.example.com/sdk"
                          } 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            addHypervisorType === "proxmox" 
                              ? "root@pam" 
                              : "administrator@vsphere.local"
                          } 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {addHypervisorType === "proxmox" && (
                  <FormField
                    control={addForm.control}
                    name="useApiToken"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                        <FormLabel>Use API Token</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(addHypervisorType !== "proxmox" || !addUseApiToken) && (
                  <FormField
                    control={addForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {addHypervisorType === "proxmox" && addUseApiToken && (
                  <FormField
                    control={addForm.control}
                    name="apiToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Token</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="USER@pve!TOKEN_ID=TOKEN_VALUE" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={addForm.control}
                  name="verifySSL"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                      <FormLabel>Verify SSL</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {addHypervisorType === "vcenter" && (
                  <FormField
                    control={addForm.control}
                    name="datacenter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Datacenter (vCenter)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter datacenter name (optional)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={addHypervisorMutation.isPending}
                  >
                    {addHypervisorMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Hypervisor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Hypervisor Dialog */}
        <Dialog open={isEditHypervisorOpen} onOpenChange={setIsEditHypervisorOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Hypervisor</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hypervisor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hypervisor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hypervisor type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proxmox">Proxmox</SelectItem>
                          <SelectItem value="vcenter">vCenter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hypervisor URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editHypervisorType === "proxmox" && (
                  <FormField
                    control={editForm.control}
                    name="useApiToken"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                        <FormLabel>Use API Token</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(editHypervisorType !== "proxmox" || !editUseApiToken) && (
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Leave empty to keep current password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {editHypervisorType === "proxmox" && editUseApiToken && (
                  <FormField
                    control={editForm.control}
                    name="apiToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Token</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Leave empty to keep current token" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={editForm.control}
                  name="verifySSL"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                      <FormLabel>Verify SSL</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editHypervisorType === "vcenter" && (
                  <FormField
                    control={editForm.control}
                    name="datacenter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Datacenter (vCenter)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter datacenter name (optional)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={updateHypervisorMutation.isPending}
                  >
                    {updateHypervisorMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Hypervisor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Hypervisor Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the hypervisor "{selectedHypervisor?.name}". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedHypervisor && deleteHypervisorMutation.mutate(selectedHypervisor.id)}
                disabled={deleteHypervisorMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteHypervisorMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}