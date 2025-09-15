import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
