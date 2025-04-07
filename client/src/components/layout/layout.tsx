import { ReactNode } from "react";
import { Navbar } from "./navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}