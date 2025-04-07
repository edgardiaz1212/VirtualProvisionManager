import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Server, 
  ClipboardList, 
  Settings, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    {
      title: "Create VM",
      href: "/create-vm",
      icon: <Server className="h-6 w-6 mr-3" />
    },
    {
      title: "VM List",
      href: "/vm-list",
      icon: <ClipboardList className="h-6 w-6 mr-3" />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-6 w-6 mr-3" />
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-800", className)}>
        <div className="flex items-center h-16 px-4 bg-gray-900">
          <h1 className="text-xl font-semibold text-white">VM Creator</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-base font-medium rounded-md",
                  location === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-4 py-4 bg-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-gray-800 font-semibold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs font-medium text-gray-300">IT Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
        <button 
          onClick={toggleMobileMenu}
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 px-4 flex justify-start">
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">VM Creator</h1>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                onClick={toggleMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-semibold text-white">VM Creator</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                      location === item.href
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-gray-800 font-semibold">
                  AD
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs font-medium text-gray-300">IT Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
