import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { VirtualMachine } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusCircle, Server, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const {
    data: virtualMachines,
    isLoading,
    error,
  } = useQuery<VirtualMachine[]>({
    queryKey: ["/api/virtual-machines"],
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/create-vm">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create VM
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{virtualMachines?.length || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active VMs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {virtualMachines?.filter(vm => vm.status === "running").length || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{user?.role}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Virtual Machines</CardTitle>
          <CardDescription>
            List of virtual machines managed by the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                <p className="text-muted-foreground">Error loading virtual machines</p>
              </div>
            </div>
          ) : virtualMachines?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Server className="h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No virtual machines yet</h3>
              <p className="mt-2 mb-4 text-sm text-muted-foreground max-w-xs">
                You haven't created any virtual machines yet. Start by creating your first VM.
              </p>
              <Link href="/create-vm">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create VM
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left font-medium">Name</th>
                    <th className="py-3 px-2 text-left font-medium">Client</th>
                    <th className="py-3 px-2 text-left font-medium">Hypervisor</th>
                    <th className="py-3 px-2 text-left font-medium">Status</th>
                    <th className="py-3 px-2 text-left font-medium">Report #</th>
                  </tr>
                </thead>
                <tbody>
                  {virtualMachines?.map((vm) => (
                    <tr key={vm.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">{vm.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {vm.ipAddress || "Not assigned"}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {vm.clientId ? "Client #" + vm.clientId : "N/A"}
                      </td>
                      <td className="py-3 px-2 capitalize">{vm.hypervisorType}</td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            vm.status === "running"
                              ? "success"
                              : vm.status === "stopped"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {vm.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{vm.reportNumber || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/users">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage system users and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/clients">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Client Management
                </CardTitle>
                <CardDescription>
                  Manage client information
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/hypervisors">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  Hypervisor Management
                </CardTitle>
                <CardDescription>
                  Configure Proxmox and vCenter connections
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}
    </Layout>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}