import {
  X,
  Home,
  Map,
  Star,
  Info,
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
      href: "#stats",
      description: "Melhores casas de banho",
    },
    // Comunidade removido a pedido
    {
      icon: Info,
      label: "Sobre",
      href: "#about",
      description: "Informações do projeto",
    },
  ];

  const handleNavigation = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onClose();
      return;
    }
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
      <style>
        {`
          /* Mobile optimizations */
          @media (max-width: 640px) {
            .sidebar-mobile-optimize {
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Improve scrolling on mobile */
            .sidebar-scroll {
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            
            /* Better button interactions */
            .mobile-button {
              min-height: 44px;
              touch-action: manipulation;
            }
          }
        `}
      </style>
      <SheetContent
        side="right"
        className="w-[90vw] max-w-[300px] xs:w-[85vw] xs:max-w-[280px] sm:w-[320px] bg-gradient-to-br from-background/98 via-background/96 to-background/95 supports-[backdrop-filter]:backdrop-blur-xl border-l border-border/30 shadow-2xl z-[2000] rounded-l-3xl rounded-tr-3xl flex flex-col max-h-[100dvh] sm:max-h-screen p-4 sm:p-4 [&>button]:hidden overflow-hidden animate-in slide-in-from-right-2 duration-300 sidebar-mobile-optimize"
      >
        <div className="flex-1 pr-0 sm:pr-1 py-0 sm:py-1">
          {/* Modern Header with Custom Close Button */}
          <div className="flex items-start justify-between mb-4">
            <SheetHeader className="flex-1 p-0">
              <SheetTitle className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative animate-float-soft">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-md opacity-35"></div>
                    <img
                      src="/Imagem2.png"
                      alt="WC do Técnico"
                      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md border-2 border-white/60 ring-2 ring-blue-500/20"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent block leading-tight">
                      IST Toilet Tracker
                    </span>
                    <p className="text-sm text-muted-foreground/70 font-medium leading-tight">
                      Instituto Superior Técnico
                    </p>
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>
            {/* Custom Close Button for Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 flex-shrink-0 ml-3 shadow-lg backdrop-blur-sm border border-white/20 active:scale-95"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <Separator className="my-3" />

          {/* Navigation Menu */}
          <nav className="space-y-1.5 mb-4">
            {menuItems.map((item, idx) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 sm:p-2.5 text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 transition-all duration-200 hover:shadow-sm rounded-2xl group animate-menu-in opacity-0 hover:scale-[1.01] active:scale-[0.99] touch-manipulation mobile-button"
                onClick={() => handleNavigation(item.href)}
                style={{ animationDelay: `${80 + idx * 60}ms` }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200 group-hover:shadow-sm flex-shrink-0">
                    <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm leading-tight">
                      {item.label}
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground/70">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-foreground/80 px-1">
              Conectar
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-11 px-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-700 dark:hover:to-blue-800 border-blue-200/60 rounded-xl active:scale-95 transition-transform mobile-button"
              >
                <Mail className="h-4 w-4 mr-3" />
                <span className="font-medium">Email</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick actions to fill bottom space */}
        <div className="pt-2 pb-3">
          <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-card/60 to-card/30 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Ações rápidas
              </span>
              <span className="text-[10px] text-muted-foreground/70 bg-muted/50 px-2 py-1 rounded-full font-medium">
                beta
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="h-10 text-sm px-3 rounded-xl hover:scale-105 active:scale-95 transition-transform touch-manipulation mobile-button"
                onClick={() => handleNavigation("#stats")}
              >
                <Star className="h-4 w-4 mr-2" /> Top 5
              </Button>
            </div>
          </div>
        </div>

        {/* Footer (in flow, no overlay) */}
        <div className="pt-3 border-t border-border/30">
          <div className="bg-gradient-to-r from-gray-50/80 via-gray-100/60 to-gray-50/80 dark:from-gray-800/80 dark:via-gray-900/60 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-sm text-muted-foreground/80 font-medium">
                  Feito por estudantes do IST
                </span>
              </div>
              <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground/60 hover:text-muted-foreground rounded-lg hover:bg-accent/50"
                  onClick={() =>
                    handleNavigation(
                      "https://github.com/franciscogfsm/caganisto"
                    )
                  }
                >
                  Contribuir para o projeto
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
