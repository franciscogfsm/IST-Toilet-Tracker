import { useState } from "react";
import {
  X,
  Home,
  Map,
  Star,
  Info,
  Settings,
  Github,
  Heart,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const navigate = useNavigate();
  const menuItems = [
    { icon: Home, label: "Início", href: "#", description: "Página principal" },
    {
      icon: Map,
      label: "Mapa",
      href: "#map",
      description: "Explorar mapa interativo",
    },
    {
      icon: Star,
      label: "Top Avaliações",
      href: "#top",
      description: "Melhores casas de banho",
    },
    // Comunidade removido a pedido
    {
      icon: Info,
      label: "Sobre",
      href: "#about",
      description: "Informações do projeto",
    },
    {
      icon: Settings,
      label: "Definições",
      href: "/settings",
      description: "Configurações do app",
    },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href) as HTMLElement | null;
      if (element) {
        const headerOffset = 72; // sticky header height approx
        const rect = element.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const top = rect.top + scrollTop - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
      onClose();
      return;
    }
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    // Internal route via React Router
    navigate(href);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="rightCompact"
        className="bg-gradient-to-br from-background/98 to-background/95 supports-[backdrop-filter]:backdrop-blur-xl border-l border-border/30 shadow-2xl z-[2000] rounded-l-2xl flex flex-col max-h-[100dvh] sm:max-h-screen p-2 sm:p-4"
      >
        <div className="flex-1 pr-0 sm:pr-1 py-0 sm:py-1">
          {/* Modern Header */}
          <SheetHeader className="pt-1 pb-1.5">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="relative animate-float-soft">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-md opacity-35"></div>
                  <img
                    src="/Imagem2.png"
                    alt="WC do Técnico"
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md border-2 border-white/60 ring-2 ring-blue-500/20"
                  />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    IST Toilet Tracker
                  </span>
                  <p className="text-xs text-muted-foreground/70 font-medium">
                    Instituto Superior Técnico
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200/30"
                >
                  v1.0.0
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-green-200/60 text-green-700"
                >
                  Beta
                </Badge>
              </div>
            </SheetTitle>
          </SheetHeader>

          <Separator className="my-1.5" />

          {/* Navigation Menu */}
          <nav className="space-y-1.5 mb-3">
            {menuItems.map((item, idx) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2 sm:p-2.5 text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 transition-all duration-200 hover:shadow-sm rounded-xl group animate-menu-in opacity-0"
                onClick={() => handleNavigation(item.href)}
                style={{ animationDelay: `${80 + idx * 60}ms` }}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200 group-hover:shadow-sm">
                    <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="hidden sm:block text-xs text-muted-foreground/70">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:translate-x-0.5" />
                </div>
              </Button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="space-y-2.5 mb-2.5">
            <h4 className="text-sm font-semibold text-foreground/80">
              Conectar
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 px-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-700 dark:hover:to-blue-800 border-blue-200/60"
              >
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Email</span>
              </Button>
            </div>
            <Button
              className="w-full h-9 mt-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs rounded-xl shadow"
              onClick={() =>
                handleNavigation("https://github.com/franciscogfsm/caganisto")
              }
            >
              <Github className="h-3.5 w-3.5 mr-2" /> Contribuir no GitHub
            </Button>
          </div>
        </div>

        {/* Quick actions to fill bottom space */}
        <div className="pt-1 pb-2">
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/60 to-card/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Ações rápidas
              </span>
              <span className="text-[10px] text-muted-foreground/70">beta</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleNavigation("#top")}
              >
                <Star className="h-3.5 w-3.5 mr-1.5" /> Top 5
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleNavigation("#map")}
              >
                <Map className="h-3.5 w-3.5 mr-1.5" /> Mapa
              </Button>
            </div>
          </div>
        </div>

        {/* Footer (in flow, no overlay) */}
        <div className="pt-2 border-t border-border/30">
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/30 dark:border-gray-700/30">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                <span className="text-xs text-muted-foreground/80 font-medium">
                  Feito por estudantes do IST
                </span>
              </div>
              <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <span>Contribuir para o projeto</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
