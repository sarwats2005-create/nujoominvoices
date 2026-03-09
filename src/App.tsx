import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NewInvoice from "@/pages/NewInvoice";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Install from "@/pages/Install";
import AdminPanel from "@/pages/AdminPanel";
import AuditLog from "@/pages/AuditLog";
import UsedBLDashboard from "@/pages/UsedBLDashboard";
import UnusedBLDashboard from "@/pages/UnusedBLDashboard";
import UnusedBLOwnerDetail from "@/pages/UnusedBLOwnerDetail";
import UsedBLNew from "@/pages/UsedBLNew";
import UsedBLDetails from "@/pages/UsedBLDetails";
import UsedBLEdit from "@/pages/UsedBLEdit";
import POS from "@/pages/POS";
import InventoryPage from "@/pages/Inventory";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import PWAUpdateBanner from "@/components/PWAUpdateBanner";
import { useAdmin } from "@/hooks/useAdmin";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/install" element={<Install />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-invoice" element={<AdminRoute><NewInvoice /></AdminRoute>} />
        <Route path="/used-bl" element={<AdminRoute><UsedBLDashboard /></AdminRoute>} />
        <Route path="/used-bl/new" element={<AdminRoute><UsedBLNew /></AdminRoute>} />
        <Route path="/used-bl/:id" element={<AdminRoute><UsedBLDetails /></AdminRoute>} />
        <Route path="/used-bl/:id/edit" element={<AdminRoute><UsedBLEdit /></AdminRoute>} />
        <Route path="/unused-bl" element={<AdminRoute><UnusedBLDashboard /></AdminRoute>} />
        <Route path="/unused-bl/owner/:ownerName" element={<AdminRoute><UnusedBLOwnerDetail /></AdminRoute>} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SettingsProvider>
          <AuthProvider>
            <InvoiceProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                  <NetworkStatusIndicator />
                  <PWAUpdateBanner />
                </BrowserRouter>
              </TooltipProvider>
            </InvoiceProvider>
          </AuthProvider>
        </SettingsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
