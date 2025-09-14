import { useState, useEffect } from "react";
import {
  Menu,
  Target,
  Star,
  TrendingUp,
  Github,
  Navigation,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import new architecture components
import { useLocation } from "@/hooks/useLocation";
import { useBathrooms } from "@/hooks/useBathrooms";
import { useNavigation } from "@/hooks/useNavigation";
import { MapContainer } from "@/features/map/MapContainer";
import { SearchContainer } from "@/features/search/SearchContainer";
import { BathroomList } from "@/features/bathrooms/BathroomList";
import { BathroomDetails } from "@/features/bathrooms/BathroomDetails";
import { SidebarMenu } from "@/components/sidebar-menu";

// Settings (could be moved to a config file)
const settings = {
  showDistanceOffCampus: false,
  defaultFloor: "0" as string | null,
};

const HEADER_OFFSET = 80;

export function Index() {
  // Use new custom hooks
  const location = useLocation();
  const navigation = useNavigation();
  const {
    bathrooms: filteredBathrooms,
    mapBathrooms,
    filters,
    updateFilters,
    addReview,
    getBathroomById,
    getBuildings,
    getFloors,
  } = useBathrooms();

  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle review submission
  const handleReviewSubmit = (bathroomId: string, reviewData: any) => {
    addReview(bathroomId, reviewData);
    alert(
      "✨ Avaliação submetida com sucesso! Obrigado por ajudar a comunidade do IST!"
    );
  };

  // Handle bathroom selection
  const handleBathroomSelect = (bathroom: any) => {
    if (bathroom) {
      const updatedBathroom = getBathroomById(bathroom.id);
      navigation.setSelectedBathroomDetails(updatedBathroom || bathroom);
    } else {
      navigation.setSelectedBathroomDetails(null);
    }
  };

  // Back to top functionality
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sort bathrooms by distance
  const sortedBathrooms = [...filteredBathrooms].sort((a, b) => {
    const da = a.dynamicDistance ?? a.distance;
    const db = b.dynamicDistance ?? b.distance;
    return da - db;
  });

  // Top 5 bathrooms
  const topBathrooms = [...filteredBathrooms]
    .sort((a, b) =>
      b.rating !== a.rating
        ? b.rating - a.rating
        : b.review_count - a.review_count
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 supports-[backdrop-filter]:backdrop-blur-xl border-b border-slate-200/40 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent"></div>

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 relative">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo and Brand */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                <div className="relative">
                  <img
                    src="/Imagem2.png"
                    alt="WC do Técnico"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg border-2 border-white/80 ring-2 ring-blue-500/10 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent tracking-tight leading-tight">
                  IST Toilet Tracker
                </h1>
              </div>
            </div>

            {/* Navigation Pills - Desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/40">
                <button
                  onClick={() => navigation.scrollToSection("map", "map")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    navigation.activeTab === "map"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Mapa
                </button>
                <button
                  onClick={() =>
                    navigation.scrollToSection("reviews", "reviews")
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    navigation.activeTab === "reviews"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => navigation.scrollToSection("stats", "stats")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    navigation.activeTab === "stats"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Stats
                </button>
              </div>
            </div>

            {/* Enhanced Menu Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50/80 rounded-lg border border-slate-200/40">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-slate-700">
                  {filteredBathrooms.length} locais
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-slate-200/40 bg-white/80 hover:bg-white transition-all duration-200 p-2.5 shadow-sm hover:shadow-md"
                onClick={navigation.toggleMenu}
              >
                <Menu className="h-4 w-4 text-slate-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-8 space-y-6 sm:space-y-8">
        {/* Back to top */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 z-40 rounded-full bg-white/90 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all p-3 animate-in fade-in slide-in-from-bottom-2"
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}

        {/* Search Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <SearchContainer
              filters={filters}
              onFiltersChange={updateFilters}
              buildings={getBuildings()}
              floors={getFloors()}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4 scroll-mt-24" id="map">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <img
              src="/Imagem2.png"
              alt="IST"
              className="w-5 h-5 rounded-full ring-2 ring-blue-500/20"
            />
            Mapa do Campus IST
          </h2>
          <MapContainer
            bathrooms={mapBathrooms}
            userLocation={location.userLocation}
            isNearIST={location.isNearIST}
            onBathroomSelect={handleBathroomSelect}
            selectedBathroom={navigation.selectedBathroomDetails}
            defaultFloor={settings.defaultFloor}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-blue-50/70 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-900/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                Casa de banho mais próxima
              </p>
              {location.isNearIST && location.locationStatus === "enabled" ? (
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {sortedBathrooms[0]?.dynamicDistance ??
                    sortedBathrooms[0]?.distance ??
                    0}
                  m
                </p>
              ) : (
                <div className="flex flex-col gap-0.5 items-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {location.locationStatus === "far" || !location.isNearIST
                      ? "Fora do campus"
                      : "Localização inativa"}
                  </p>
                  {location.locationStatus === "idle" && (
                    <button
                      onClick={location.requestLocation}
                      className="text-[11px] text-blue-600 underline"
                    >
                      Ativar
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-yellow-50/70 to-orange-100/50 dark:from-yellow-950/20 dark:to-orange-900/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
                <Star className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                Melhor avaliada
              </p>
              <p className="text-base font-extrabold text-yellow-600 dark:text-yellow-400 tracking-tight">
                {
                  filteredBathrooms.sort((a, b) => b.rating - a.rating)[0]
                    ?.rating
                }
                ★
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-emerald-50/70 to-green-100/50 dark:from-emerald-950/20 dark:to-green-900/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                Total de casas de banho
              </p>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {filteredBathrooms.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closest Bathroom */}
        {sortedBathrooms.length > 0 && (
          <BathroomList
            bathrooms={[sortedBathrooms[0]]}
            title="Casa de banho mais próxima"
            showDistance={true}
            onBathroomSelect={handleBathroomSelect}
          />
        )}

        {/* Top Bathrooms */}
        <div className="space-y-4 scroll-mt-24" id="stats">
          <BathroomList
            bathrooms={topBathrooms}
            title="Top 5 casas de banho do IST"
            showDistance={
              location.isNearIST && location.locationStatus === "enabled"
            }
            onBathroomSelect={handleBathroomSelect}
            animate={true}
          />
        </div>

        {/* Bathroom Details Modal */}
        <BathroomDetails
          bathroom={navigation.selectedBathroomDetails}
          isOpen={!!navigation.selectedBathroomDetails}
          onClose={() => navigation.setSelectedBathroomDetails(null)}
          onReviewSubmit={handleReviewSubmit}
        />

        {/* Sidebar Menu */}
        <SidebarMenu
          isOpen={navigation.showMenu}
          onClose={navigation.toggleMenu}
        />
      </div>

      {/* Bottom Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none">
        <div className="mx-auto max-w-md px-4 pb-4 pt-2 pointer-events-auto">
          <div className="flex justify-around items-stretch bg-white/90 backdrop-blur-md border border-gray-200/60 shadow-xl shadow-black/5 rounded-2xl p-1">
            {[
              { id: "map", label: "Mapa", icon: Map as any },
              { id: "reviews", label: "Reviews", icon: Star as any },
              { id: "stats", label: "Stats", icon: TrendingUp as any },
            ].map((item) => {
              const Icon = item.icon;
              const active = navigation.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    navigation.scrollToSection(item.id, item.id as any)
                  }
                  className={`flex-1 group relative overflow-hidden rounded-xl px-3 py-2 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                  aria-label={item.label}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 ${
                      active ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute inset-0 -z-10 opacity-40 bg-gradient-to-r from-blue-500/40 to-cyan-500/40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Index;
