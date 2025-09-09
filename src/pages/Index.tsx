import { useEffect, useState } from "react";
import { Menu, Target, Star, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { BathroomCard } from "@/components/bathroom-card";
import { MapWithFilters } from "@/components/map-with-filters";
import { ReviewForm } from "@/components/review-form";
import { BathroomDetails } from "@/components/bathroom-details";
import { SidebarMenu } from "@/components/sidebar-menu";
import { bathrooms, Bathroom, Review } from "@/data/bathrooms";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBathroom, setSelectedBathroom] = useState<Bathroom | null>(
    null
  );
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewBathroom, setReviewBathroom] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedBathroomDetails, setSelectedBathroomDetails] =
    useState<Bathroom | null>(null);
  const [bathroomData, setBathroomData] = useState<Bathroom[]>(bathrooms);
  const [pendingReviewBathroomId, setPendingReviewBathroomId] =
    useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");

  // Derived pickers for review selector
  const buildings = Array.from(
    new Set(bathroomData.map((b) => b.building))
  ).sort((a, b) => a.localeCompare(b));
  const floorsForBuilding = Array.from(
    new Set(
      bathroomData
        .filter((b) =>
          selectedBuilding ? b.building === selectedBuilding : true
        )
        .map((b) => b.floor)
    )
  ).sort((a, b) => a.localeCompare(b));
  const bathroomsForPicker = bathroomData
    .filter((b) => (selectedBuilding ? b.building === selectedBuilding : true))
    .filter((b) => (selectedFloor ? b.floor === selectedFloor : true))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const scrollToMap = () => {
    const el = document.getElementById("map");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // IST geolocation helpers (kept local to avoid cross-file coupling)
  const IST_CENTER: [number, number] = [38.7369, -9.1395];
  const IST_BOUNDS: [[number, number], [number, number]] = [
    [38.734, -9.143],
    [38.74, -9.136],
  ];

  const convertToRealCoords = (x: number, y: number): [number, number] => {
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    const lat =
      IST_BOUNDS[1][0] -
      (clampedY / 100) * (IST_BOUNDS[1][0] - IST_BOUNDS[0][0]);
    const lng =
      IST_BOUNDS[0][1] +
      (clampedX / 100) * (IST_BOUNDS[1][1] - IST_BOUNDS[0][1]);
    return [lat, lng];
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // User location state for dynamic distance when user is near IST
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [isNearIST, setIsNearIST] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const timeout = setTimeout(() => {
      // Fail silently if slow
    }, 10000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        const { latitude, longitude } = pos.coords;
        const tolerance = 0.005; // ~500m
        const near =
          latitude >= IST_BOUNDS[0][0] - tolerance &&
          latitude <= IST_BOUNDS[1][0] + tolerance &&
          longitude >= IST_BOUNDS[0][1] - tolerance &&
          longitude <= IST_BOUNDS[1][1] + tolerance;
        if (near) {
          setUserLocation([latitude, longitude]);
          setIsNearIST(true);
        } else {
          setIsNearIST(false);
        }
      },
      () => {
        clearTimeout(timeout);
        setIsNearIST(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Filter bathrooms based on search
  const filteredBathrooms = bathroomData.filter(
    (bathroom) =>
      bathroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bathroom.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For the map: filter by NAME only (as requested), so markers show only matching names
  const mapFilteredByName = bathroomData.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by distance: dynamic (if near IST) else fallback on static field
  const withDynamicDistance = (
    list: Bathroom[]
  ): (Bathroom & {
    dynamicDistance?: number;
  })[] => {
    if (!isNearIST || !userLocation) return list.map((b) => ({ ...b }));
    return list.map((b) => {
      const [lat, lng] = convertToRealCoords(b.x, b.y);
      const d = calculateDistance(userLocation[0], userLocation[1], lat, lng);
      return { ...b, dynamicDistance: d };
    });
  };

  const sortedBathrooms = withDynamicDistance(filteredBathrooms).sort(
    (a, b) => {
      const da = a.dynamicDistance ?? a.distance;
      const db = b.dynamicDistance ?? b.distance;
      return da - db;
    }
  );

  // Top 5 across the whole dataset (not affected by search), tie-break by review count
  const topBathroomsBase = [...bathroomData]
    .sort((a, b) =>
      b.rating !== a.rating
        ? b.rating - a.rating
        : b.reviewCount - a.reviewCount
    )
    .slice(0, 5);
  const topBathrooms = withDynamicDistance(topBathroomsBase);

  const handleReviewBathroom = (bathroomName: string) => {
    setReviewBathroom(bathroomName);
    setShowReviewForm(true);
  };

  const handleViewBathroomDetails = (bathroom: Bathroom) => {
    setSelectedBathroomDetails(bathroom);
  };

  const handleReviewSubmit = (
    bathroomId: string,
    reviewData: {
      rating: number;
      comment: string;
      user: string;
      cleanliness?: number;
      paperSupply?: number;
      privacy?: number;
      paperAvailable?: boolean;
    }
  ) => {
    const newReview: Review = {
      ...reviewData,
      id: `review_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      cleanliness: reviewData.cleanliness ?? reviewData.rating,
      paperSupply: reviewData.paperSupply ?? reviewData.rating,
      privacy: reviewData.privacy ?? reviewData.rating,
    };

    // Update bathroom data with new review
    setBathroomData((prevData) =>
      prevData.map((bathroom) => {
        if (bathroom.id === bathroomId) {
          const updatedReviews = [...bathroom.reviews, newReview];
          const totalRating = updatedReviews.reduce(
            (sum, r) => sum + r.rating,
            0
          );
          const avgRating = totalRating / updatedReviews.length;

          // Aggregate cleanliness, paperSupply, privacy textual summary
          const avgClean =
            updatedReviews.reduce((s, r) => s + (r.cleanliness || 0), 0) /
            updatedReviews.length;
          const avgPaper =
            updatedReviews.reduce((s, r) => s + (r.paperSupply || 0), 0) /
            updatedReviews.length;
          const avgPrivacy =
            updatedReviews.reduce((s, r) => s + (r.privacy || 0), 0) /
            updatedReviews.length;

          const cleanlinessLabel =
            avgClean >= 4.5
              ? "Sempre limpo"
              : avgClean >= 3.5
              ? "Geralmente limpo"
              : "Às vezes limpo";

          const paperLabel =
            avgPaper >= 4.5 ? "Bom" : avgPaper >= 3.0 ? "Médio" : "Fraco";

          const privacyLabel =
            avgPrivacy >= 4.5
              ? "Excelente"
              : avgPrivacy >= 3.5
              ? "Boa"
              : "Média";

          return {
            ...bathroom,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            cleanliness: cleanlinessLabel,
            paperSupply: paperLabel as any,
            privacy: privacyLabel as any,
          };
        }
        return bathroom;
      })
    );

    // Show success message
    alert(
      "✨ Avaliação submetida com sucesso! Obrigado por ajudar a comunidade do IST!"
    );
  };

  const handleBathroomSelect = (bathroom: Bathroom | null) => {
    if (bathroom) {
      // Find the most up-to-date version of the bathroom
      const updatedBathroom =
        bathroomData.find((b) => b.id === bathroom.id) || bathroom;
      setSelectedBathroomDetails(updatedBathroom);
    } else {
      setSelectedBathroomDetails(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/85 supports-[backdrop-filter]:backdrop-blur-xl border-b border-gray-200/40 dark:border-gray-700/40 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30"></div>
                <img
                  src="/Imagem2.png"
                  alt="CaganISTo"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-xl border-2 border-white/60 dark:border-gray-800/60 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  CaganISTo
                </h1>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-600 to-gray-500 dark:from-gray-400 dark:to-gray-500 bg-clip-text text-transparent">
                  Instituto Superior Técnico
                </p>
              </div>
            </div>

            {/* Navigation Pills - Desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-1.5 border border-gray-200/50 dark:border-gray-700/50 shadow-md">
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Mapa
                </button>
                <button className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-full transition-all duration-200">
                  Reviews
                </button>
                <button className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-full transition-all duration-200">
                  Stats
                </button>
              </div>
            </div>

            {/* Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 supports-[backdrop-filter]:backdrop-blur hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-150 p-2.5"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Search Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <SearchInput
              placeholder="Buscar casa de banho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base sm:text-lg bg-white/90 dark:bg-gray-800/90 border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 h-12 sm:h-14"
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4" id="map">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <img
              src="/Imagem2.png"
              alt="IST"
              className="w-5 h-5 rounded-full ring-2 ring-blue-500/20"
            />
            Mapa do Campus IST
          </h2>
          <MapWithFilters
            onBathroomSelect={handleBathroomSelect}
            bathroomData={mapFilteredByName}
            isModalOpen={!!selectedBathroomDetails}
          />
        </div>

        {/* Quick Stats (compact) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-blue-50/70 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-900/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                Casa de banho mais próxima
              </p>
              {isNearIST ? (
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {sortedBathrooms[0]?.dynamicDistance ??
                    sortedBathrooms[0]?.distance ??
                    0}
                  m
                </p>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">
                  Fora do campus
                </p>
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
                {bathroomData.sort((a, b) => b.rating - a.rating)[0]?.rating}★
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
                {bathroomData.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closest Bathroom */}
        {sortedBathrooms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Casa de banho mais próxima
              </h2>
            </div>
            {isNearIST ? (
              <>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-full inline-block">
                  📍{" "}
                  {sortedBathrooms[0].dynamicDistance ??
                    sortedBathrooms[0].distance}{" "}
                  m
                </div>
                <BathroomCard
                  {...sortedBathrooms[0]}
                  isClosest
                  onViewDetails={() =>
                    handleViewBathroomDetails(sortedBathrooms[0])
                  }
                />
              </>
            ) : (
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-3 py-1 bg-gray-50 dark:bg-gray-800/60 rounded-full inline-block">
                Fora do campus
              </div>
            )}
          </div>
        )}

        {/* Top Bathrooms */}
        <div className="space-y-4" id="top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Star className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Top 5 casas de banho do IST
            </h2>
          </div>
          <div className="space-y-3">
            {topBathrooms.map((bathroom, index) => {
              // Prefer dynamic distance on campus for display inside the card
              const displayDistance =
                bathroom.dynamicDistance ?? bathroom.distance;
              const rankStyles =
                index === 0
                  ? "from-yellow-400 to-yellow-500 ring-yellow-300"
                  : index === 1
                  ? "from-gray-300 to-gray-400 ring-gray-200"
                  : index === 2
                  ? "from-orange-400 to-orange-500 ring-orange-300"
                  : "from-blue-400 to-blue-500";

              return (
                <div
                  key={bathroom.id}
                  className="relative p-3 sm:p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-colors"
                >
                  {/* Rank badge */}
                  <div
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg bg-gradient-to-r ${rankStyles} text-white ring-2`}
                  >
                    {index + 1}
                  </div>
                  {/* Content */}
                  <div className="pl-6 sm:pl-8">
                    <BathroomCard
                      {...bathroom}
                      distance={displayDistance}
                      onViewDetails={() => handleViewBathroomDetails(bathroom)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Review Button */}
        <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-purple-50/80 to-pink-100/60 dark:from-purple-950/30 dark:to-pink-900/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              ✨ Partilhe a Sua Experiência
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Ajude outros estudantes a encontrar as melhores casas de banho do
              campus IST! A sua avaliação faz a diferença 🚀
            </p>
            {/* Guided selection: Edifício → Piso → Casa de banho */}
            <div className="max-w-xl mx-auto mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Building */}
              <Select
                value={selectedBuilding}
                onValueChange={(val) => {
                  setSelectedBuilding(val);
                  setSelectedFloor("");
                  setPendingReviewBathroomId("");
                }}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80">
                  <SelectValue placeholder="Edifício" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectGroup>
                    <SelectLabel>Edifícios</SelectLabel>
                    {buildings.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Floor */}
              <Select
                value={selectedFloor}
                onValueChange={(val) => {
                  setSelectedFloor(val);
                  setPendingReviewBathroomId("");
                }}
                disabled={!selectedBuilding}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80">
                  <SelectValue placeholder="Piso" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectGroup>
                    <SelectLabel>Pisos</SelectLabel>
                    {floorsForBuilding.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Bathroom */}
              <Select
                value={pendingReviewBathroomId}
                onValueChange={setPendingReviewBathroomId}
                disabled={!selectedBuilding}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80">
                  <SelectValue placeholder="Casa de banho" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectGroup>
                    <SelectLabel>Casas de banho</SelectLabel>
                    {bathroomsForPicker.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Map pin hint */}
            <div className="text-xs text-muted-foreground mb-4">
              Dica: mais rápido tocar num pin no mapa para avaliar —
              <button
                type="button"
                onClick={scrollToMap}
                className="ml-1 underline underline-offset-2 text-blue-600 hover:text-blue-700"
              >
                ir para o mapa
              </button>
            </div>
            <Button
              className="relative isolate overflow-hidden w-full h-12 sm:h-14 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold sm:font-bold rounded-2xl transition-all duration-200 hover:shadow-xl text-base sm:text-lg touch-manipulation ring-1 ring-white/20 dark:ring-white/10"
              onClick={() => {
                const chosen = bathroomData.find(
                  (b) => b.id === pendingReviewBathroomId
                );
                if (chosen) {
                  setSelectedBathroomDetails(chosen);
                  // scroll to the review form after the modal opens
                  setTimeout(() => {
                    const el = document.getElementById("review-form");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 350);
                } else if (selectedBathroomDetails) {
                  // Already open; just try to scroll
                  const el = document.getElementById("review-form");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  // Encourage using the map directly
                  scrollToMap();
                }
              }}
            >
              {/* Leading icon kept inside bounds */}
              <span className="pointer-events-none inline-flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>
                  {pendingReviewBathroomId
                    ? `Avaliar ${
                        bathroomData.find(
                          (b) => b.id === pendingReviewBathroomId
                        )?.name || "Casa de Banho"
                      }`
                    : "Avaliar Casa de Banho"}
                </span>
              </span>
              {/* Subtle sheen */}
              <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="absolute -inset-x-1 -top-1 h-[120%] bg-gradient-to-b from-white/10 to-transparent" />
              </span>
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              Clique numa casa de banho no mapa para avaliar especificamente
            </p>
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

        {/* Bathroom Details Modal */}
        {selectedBathroomDetails && (
          <BathroomDetails
            bathroom={selectedBathroomDetails}
            isOpen={!!selectedBathroomDetails}
            onClose={() => setSelectedBathroomDetails(null)}
            onReviewSubmit={handleReviewSubmit}
          />
        )}

        {/* Sidebar Menu */}
        <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </div>
  );
};

export default Index;
