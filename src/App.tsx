// <== IMPORTS ==>
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Purchases from "@/pages/Purchases";
import Analytics from "@/pages/Analytics";
import Customers from "@/pages/Customers";
import QuickSales from "@/pages/QuickSales";
import Recoveries from "@/pages/Recoveries";
import SettingsPage from "@/pages/Settings";
import { queryClient } from "@/lib/queryClient";
import { AnimatePresence } from "framer-motion";
import Expenditures from "@/pages/Expenditures";
import Unauthorized from "@/pages/Unauthorized";
import { AppLayout } from "@/components/AppLayout";
import { PublicRoute } from "@/components/PublicRoute";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NetworkStatusWatcher from "@/components/NetworkStatusWatcher";

// <== APP COMPONENT ==>
const App = () => (
  // <== WRAPPING THE APP WITH PROVIDERS ==>
  <QueryClientProvider client={queryClient}>
    {/* THEME PROVIDER */}
    <ThemeProvider>
      {/* TOOLTIP PROVIDER */}
      <TooltipProvider>
        {/* SONNER */}
        <Sonner />
        {/* NETWORK STATUS */}
        <NetworkStatusWatcher />
        {/* ROUTER */}
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          {/* ANIMATED ROUTES */}
          <AnimatePresence mode="wait">
            <Routes>
              {/* UNAUTHORIZED ROUTE */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* PUBLIC ROUTES - NOT AUTHENTICATED */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              {/* PROTECTED ROUTES - AUTHENTICATED */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<QuickSales />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/recoveries" element={<Recoveries />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/expenditures" element={<Expenditures />} />
              </Route>
              {/* FALLBACK ROUTE - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
