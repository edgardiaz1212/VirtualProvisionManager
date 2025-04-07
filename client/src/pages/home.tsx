import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Server, List, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col w-0 flex-1 md:ml-64">
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-100">
          <div className="py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Create Virtual Machine</CardTitle>
                    <CardDescription>Deploy a new VM to your hypervisors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Server className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          Set up a new virtual machine with predefined or custom resources
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/create-vm" className="w-full">
                      <Button className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create VM
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">VM Inventory</CardTitle>
                    <CardDescription>Manage existing virtual machines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <List className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          View and manage all your virtual machines across hypervisors
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/vm-list" className="w-full">
                      <Button variant="outline" className="w-full">
                        View VMs
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Access</CardTitle>
                    <CardDescription>Commonly used features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mt-2">
                      <li className="text-sm text-gray-600 hover:text-gray-900">
                        <Link href="/create-vm" className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create VM on Proxmox
                        </Link>
                      </li>
                      <li className="text-sm text-gray-600 hover:text-gray-900">
                        <Link href="/create-vm" className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create VM on vCenter
                        </Link>
                      </li>
                      <li className="text-sm text-gray-600 hover:text-gray-900">
                        <Link href="/vm-list" className="flex items-center">
                          <List className="h-4 w-4 mr-2" />
                          Recent VMs
                        </Link>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
