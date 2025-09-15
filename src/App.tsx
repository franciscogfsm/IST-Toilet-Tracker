import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Force light mode by removing any persisted 'dark' class
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    // Always restore scroll to top on reload/route entries
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual" as any;
      } catch {}
    }
    // Ensure we're at the very top after hydration
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Also force once after the window fully loads (prevents partial restore)
    const onLoad = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.addEventListener("load", onLoad, { once: true });
    const t = setTimeout(() => onLoad(), 50);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(t);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
