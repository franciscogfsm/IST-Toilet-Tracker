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
      href: "#settings",
      description: "Configurações do app",
    },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="rightCompact"
        className="bg-gradient-to-br from-background/98 to-background/95 supports-[backdrop-filter]:backdrop-blur-xl border-l border-border/30 shadow-2xl z-[2000] rounded-l-2xl flex flex-col"
      >
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Modern Header */}
          <SheetHeader className="pt-4 pb-4">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-md opacity-40"></div>
                  <img
                    src="/Imagem2.png"
                    alt="CaganISTo"
                    className="relative w-10 h-10 rounded-full shadow-lg border-2 border-white/60 ring-2 ring-blue-500/20"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    CaganISTo
                  </span>
                  <p className="text-xs text-muted-foreground/70 font-medium">
                    Instituto Superior Técnico
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
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

          <Separator className="my-2" />

          {/* Navigation Menu */}
          <nav className="space-y-1 mb-4">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 transition-all duration-200 hover:shadow-sm rounded-xl group"
                onClick={() => handleNavigation(item.href)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200">
                    <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground/70">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </Button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground/80">
              Conectar
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800 border-gray-200/60"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-700 dark:hover:to-blue-800 border-blue-200/60"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>

        {/* Footer (in flow, no overlay) */}
        <div className="pt-3 border-t border-border/30">
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                <span className="text-xs text-muted-foreground/80 font-medium">
                  Feito por estudantes do IST
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
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
