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
import NotFound from "./pages/NotFound";
import Install from "@/pages/Install";
import AdminPanel from "@/pages/AdminPanel";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import PWAUpdateBanner from "@/components/PWAUpdateBanner";

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
      <Route path="/install" element={<Install />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-invoice" element={<NewInvoice />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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

export default App;
