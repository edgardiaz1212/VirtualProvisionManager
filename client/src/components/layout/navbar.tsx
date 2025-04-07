import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  PlusCircle,
  Server,
  Users,
  LogOut,
  Settings,
  ChevronDown,
  User,
} from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Only show admin menu items for admin users
  const isAdmin = user.role === "admin";

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Server className="h-6 w-6 text-primary" />
              <span className="font-bold">VM Management</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-1">
          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              className="text-sm font-medium"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/create-vm">
            <Button
              variant={location === "/create-vm" ? "default" : "ghost"}
              size="sm"
              className="text-sm font-medium"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create VM
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  <Settings className="mr-2 h-4 w-4" />
                  Administration
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/admin/users">
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/clients">
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Client Management</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/hypervisors">
                  <DropdownMenuItem className="cursor-pointer">
                    <Server className="mr-2 h-4 w-4" />
                    <span>Hypervisor Management</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative text-sm font-medium">
                <User className="mr-2 h-4 w-4" />
                {user?.username}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">
                {user.fullName || user.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}