import { useState } from "react";
import { X, Home, Map, Star, Info, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const menuItems = [
    { icon: Home, label: "Início", href: "#" },
    { icon: Map, label: "Mapa", href: "#map" },
    { icon: Star, label: "Top Avaliações", href: "#top" },
    { icon: Users, label: "Comunidade", href: "#community" },
    { icon: Info, label: "Sobre", href: "#about" },
    { icon: Settings, label: "Definições", href: "#settings" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-lg border-border/50">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-3">
              <img src="/src/assets/logo.png" alt="CaganISTo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                CaganISTo
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-left h-12 text-foreground hover:bg-accent/50 transition-colors"
              onClick={() => {
                // Scroll to section or navigate
                if (item.href.startsWith("#")) {
                  const element = document.querySelector(item.href);
                  element?.scrollIntoView({ behavior: "smooth" });
                }
                onClose();
              }}
            >
              <item.icon className="mr-3 h-5 w-5 text-primary" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Feito por estudantes do IST</p>
            <p className="text-xs">v1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}