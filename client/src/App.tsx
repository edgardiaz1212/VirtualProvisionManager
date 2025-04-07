import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import VmCreator from "@/pages/vm-creator";
import AuthPage from "@/pages/auth-page";
import UsersManagement from "@/pages/admin/users-management";
import ClientsManagement from "@/pages/admin/clients-management";
import HypervisorsManagement from "@/pages/admin/hypervisors-management";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/create-vm" component={VmCreator} />
      <ProtectedRoute path="/admin/users" component={UsersManagement} />
      <ProtectedRoute path="/admin/clients" component={ClientsManagement} />
      <ProtectedRoute path="/admin/hypervisors" component={HypervisorsManagement} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
