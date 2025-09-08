import { useState } from "react";
import { Menu, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { BathroomCard } from "@/components/bathroom-card";
import { InteractiveMap } from "@/components/interactive-map";
import { ReviewForm } from "@/components/review-form";
import { SidebarMenu } from "@/components/sidebar-menu";
import { bathrooms } from "@/data/bathrooms";


const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBathroom, setSelectedBathroom] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewBathroom, setReviewBathroom] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Filter bathrooms based on search
  const filteredBathrooms = bathrooms.filter(bathroom =>
    bathroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bathroom.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by distance for "closest" logic
  const sortedBathrooms = [...filteredBathrooms].sort((a, b) => a.distance - b.distance);

  const handleReviewBathroom = (bathroomName: string) => {
    setReviewBathroom(bathroomName);
    setShowReviewForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/src/assets/logo.png" alt="CaganISTo" className="w-10 h-10 rounded-full" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                CaganISTo
              </h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border/50"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <SearchInput
          placeholder="Buscar casa de banho..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Map */}
        <div className="space-y-3" id="map">
          <h2 className="text-lg font-semibold text-foreground">Mapa do Campus IST</h2>
          <InteractiveMap
            onBathroomSelect={(bathroom) => setSelectedBathroom(bathroom.id)}
          />
        </div>

        {/* Closest Bathroom */}
        {sortedBathrooms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Casa de banho mais próxima</h2>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {sortedBathrooms[0].distance} m
            </div>
            <BathroomCard
              {...sortedBathrooms[0]}
              isClosest
            />
          </div>
        )}

        {/* Top Bathrooms */}
        <div className="space-y-3" id="top">
          <h2 className="text-lg font-semibold text-foreground">Top 5 casas de banho do IST</h2>
          <div className="space-y-3">
            {sortedBathrooms
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((bathroom) => (
                <BathroomCard key={bathroom.id} {...bathroom} />
              ))}
          </div>
        </div>

        {/* Review Button */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/10">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-foreground mb-2">Avalia a tua experiência</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajuda outros estudantes a encontrar as melhores casas de banho do campus
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-primary-foreground"
              onClick={() => handleReviewBathroom("Casa de banho selecionada")}
            >
              Avaliar
            </Button>
          </CardContent>
        </Card>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <ReviewForm
                bathroomName={reviewBathroom}
                onClose={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        )}

        {/* Sidebar Menu */}
        <SidebarMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Index;
