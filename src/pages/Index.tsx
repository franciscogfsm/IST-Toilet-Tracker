import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Target,
  Star,
  TrendingUp,
  Sparkles,
  Map,
  MessageCircle,
  ChevronUp,
  Github,
  Navigation,
  MapPin,
  Info,
} from "lucide-react";
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
import { QuickStats } from "@/components/quick-stats";
import { BathroomDetails } from "@/components/bathroom-details";
import { SidebarMenu } from "@/components/sidebar-menu";
import { bathrooms, Bathroom, Review } from "@/data/bathrooms";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, lazy } from "react";

// Lazy-load MapWithFilters for performance
const LazyMapWithFilters = lazy(() =>
  import("@/components/map-with-filters").then((m) => ({
    default: m.MapWithFilters,
  }))
);

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
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const settings = {
    showDistanceOffCampus: false,
    defaultFloor: "0" as string | null, // R/C default
  };

  // Consistent header offset for scroll calculations (avoid mismatched 72 vs 80)
  const HEADER_OFFSET = 72; // px - adjusted for better mobile scroll positioning

  // Top filter state - moved up to avoid initialization error
  const [topFilter, setTopFilter] = useState<
    "rating" | "cleanliness" | "paper"
  >("rating");

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
    if (!el) return;
    const headerOffset = HEADER_OFFSET;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
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

  // Location / proximity state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [isNearIST, setIsNearIST] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "enabled" | "denied" | "far"
  >("idle");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    const timeout = setTimeout(() => {
      if (locationStatus === "requesting") setLocationStatus("denied");
    }, 12000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        const { latitude, longitude } = pos.coords;
        const tolerance = 0.005; // ~500m (~550m) radius around campus bounds
        const near =
          latitude >= IST_BOUNDS[0][0] - tolerance &&
          latitude <= IST_BOUNDS[1][0] + tolerance &&
          longitude >= IST_BOUNDS[0][1] - tolerance &&
          longitude <= IST_BOUNDS[1][1] + tolerance;
        setUserLocation([latitude, longitude]);
        setIsNearIST(near);
        setLocationStatus(near ? "enabled" : "far");
      },
      () => {
        clearTimeout(timeout);
        setIsNearIST(false);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const autoPromptedRef = useRef(false);

  // If permission already granted (user previously accepted), trigger immediately without waiting for visibility
  useEffect(() => {
    if (locationStatus !== "idle" || autoPromptedRef.current) return;
    if ("permissions" in navigator && (navigator as any).permissions?.query) {
      (navigator as any).permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res: any) => {
          if (res.state === "granted") {
            autoPromptedRef.current = true;
            requestLocation();
          }
        })
        .catch(() => {});
    }
  }, [locationStatus]);

  // Reveal animations for the About section
  useEffect(() => {
    if (!aboutRef.current) return;
    const el = aboutRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAboutVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Always start at top on reload and control scroll restoration
  useEffect(() => {
    const supports = "scrollRestoration" in history;
    if (supports) history.scrollRestoration = "manual";
    // move to top asap
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // show back-to-top button when scrolled
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (supports) history.scrollRestoration = "auto";
    };
  }, []);

  // Filter bathrooms based on search (name, building, or floor)
  const filteredBathrooms = bathroomData.filter(
    (bathroom) =>
      bathroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bathroom.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bathroom.floor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For the map: same filtering as list for consistency
  const mapFilteredByName = bathroomData.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.floor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by distance: dynamic (if near IST) else fallback on static field
  const withDynamicDistance = (
    list: Bathroom[]
  ): (Bathroom & {
    dynamicDistance?: number;
  })[] => {
    if (!(isNearIST && userLocation && locationStatus === "enabled"))
      return list.map((b) => ({ ...b }));
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
    .sort((a, b) => {
      if (topFilter === "cleanliness") {
        const cleanlinessOrder = {
          "Sempre limpo": 3,
          "Geralmente limpo": 2,
          "Às vezes limpo": 1,
        };
        const aClean =
          cleanlinessOrder[a.cleanliness as keyof typeof cleanlinessOrder] || 0;
        const bClean =
          cleanlinessOrder[b.cleanliness as keyof typeof cleanlinessOrder] || 0;
        if (aClean !== bClean) return bClean - aClean;
      } else if (topFilter === "paper") {
        const paperOrder = { Bom: 3, Médio: 2, Fraco: 1 };
        const aPaper =
          paperOrder[a.paperSupply as keyof typeof paperOrder] || 0;
        const bPaper =
          paperOrder[b.paperSupply as keyof typeof paperOrder] || 0;
        if (aPaper !== bPaper) return bPaper - aPaper;
      }
      // Default to rating sort
      return b.rating !== a.rating
        ? b.rating - a.rating
        : b.reviewCount - a.reviewCount;
    })
    .slice(0, 5);
  const topBathrooms = withDynamicDistance(topBathroomsBase);

  // Respect user setting to hide distance when off campus
  const showOffCampusDistance = settings.showDistanceOffCampus;

  // Scroll-in animation for Top 5
  const [visibleTopIndices, setVisibleTopIndices] = useState<Set<number>>(
    new Set()
  );
  const topListRef = useRef<HTMLDivElement | null>(null);

  // Special highlight for first place
  const [firstPlaceHighlighted, setFirstPlaceHighlighted] = useState(false);
  const firstPlaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = topListRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll("[data-top-item]")
    ) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idxAttr = (e.target as HTMLElement).dataset.index;
            const idx = idxAttr ? parseInt(idxAttr) : -1;
            setVisibleTopIndices((prev) => {
              const next = new Set(prev);
              if (idx >= 0) next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [topBathrooms]);

  // Special observer for first place highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firstPlaceHighlighted) {
            setFirstPlaceHighlighted(true);
          }
        });
      },
      { threshold: 0.6, rootMargin: "0px 0px -100px 0px" }
    );

    if (firstPlaceRef.current) {
      observer.observe(firstPlaceRef.current);
    }

    return () => observer.disconnect();
  }, [firstPlaceHighlighted]);

  // Interactive Stats Animation State
  const [statsVisible, setStatsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    buildings: 0,
  });
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Custom hook for counting animation
  const useCountUp = (
    end: number,
    duration: number = 2000,
    start: boolean = false
  ) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!start) return;

      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [end, duration, start]);

    return count;
  };

  // Calculate stats values
  const totalReviews = bathroomData.reduce((sum, b) => sum + b.reviewCount, 0);
  const avgRating =
    bathroomData.reduce((sum, b) => sum + b.rating, 0) / bathroomData.length;
  const buildingsCount = new Set(bathroomData.map((b) => b.building)).size;

  // Animated counters
  const animatedTotalReviews = useCountUp(totalReviews, 1500, statsVisible);
  const animatedAvgRating =
    useCountUp(Math.floor(avgRating * 10), 1800, statsVisible) / 10;
  const animatedBuildings = useCountUp(buildingsCount, 1200, statsVisible);

  // Stats visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsVisible) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -50px 0px" }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsVisible]);

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

  const [activeTopTab, setActiveTopTab] = useState<"map" | "reviews" | "stats">(
    "map"
  );
  // Suppress scroll-based auto detection while a programmatic smooth scroll is in progress
  const manualScrollSuppressRef = useRef<number>(0);

  const scrollToSection = (id: string, tab: "map" | "reviews" | "stats") => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = HEADER_OFFSET;
      const rect = el.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - headerOffset;
      // mark suppression window (~900ms) to avoid flicker (map->reviews->map)
      manualScrollSuppressRef.current = Date.now() + 900;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveTopTab(tab);
    }
  };

  // Scroll listener to set active tab based on current scroll position
  useEffect(() => {
    const headerOffset = HEADER_OFFSET;
    const sectionIds: Array<[string, "map" | "reviews" | "stats"]> = [
      ["map", "map"],
      ["reviews", "reviews"],
      ["stats", "stats"],
    ];

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Ignore scroll-driven recalculation while within suppression window
          if (Date.now() < manualScrollSuppressRef.current) {
            ticking = false;
            return;
          }
          // Use midpoint of viewport for more stable detection
          const scrollMid = window.scrollY + window.innerHeight / 3;
          let current: "map" | "reviews" | "stats" = "map";
          for (let i = 0; i < sectionIds.length; i++) {
            const [id, tab] = sectionIds[i];
            const el = document.getElementById(id);
            if (!el) continue;
            const top = el.offsetTop - headerOffset - 4; // small fudge
            const nextElId = sectionIds[i + 1]?.[0];
            const nextEl = nextElId ? document.getElementById(nextElId) : null;
            const nextTop = nextEl ? nextEl.offsetTop - headerOffset : Infinity;
            if (scrollMid >= top && scrollMid < nextTop) {
              current = tab;
              break;
            }
            if (scrollMid >= nextTop) continue;
          }
          setActiveTopTab(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 supports-[backdrop-filter]:backdrop-blur-xl border-b border-slate-200/40 shadow-sm">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent"></div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 relative">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo and Brand - Mobile Optimized */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="relative group">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-all duration-300"></div>

                <div className="relative">
                  <img
                    src="/Imagem2.png"
                    alt="WC do Técnico"
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full shadow-lg border-2 border-white/80 ring-2 ring-blue-500/10 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  />
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent tracking-tight leading-tight truncate">
                  IST Toilet Tracker
                </h1>
                <p className="text-xs text-slate-600 lg:hidden">Campus IST</p>
              </div>
            </div>

            {/* Navigation Pills - Desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/40">
                <button
                  onClick={() => scrollToSection("map", "map")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTopTab === "map"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Mapa
                </button>
                <button
                  onClick={() => scrollToSection("reviews", "reviews")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTopTab === "reviews"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection("stats", "stats")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTopTab === "stats"
                      ? "text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  Stats
                </button>
              </div>
            </div>

            {/* Enhanced Menu Button - Mobile Optimized */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick stats indicator - Hidden on very small screens */}
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-slate-50/80 rounded-lg border border-slate-200/40">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-slate-700">
                  {bathroomData.length}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-slate-200/40 bg-white/80 hover:bg-white transition-all duration-200 p-2 shadow-sm hover:shadow-md"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-4 w-4 text-slate-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-6 pb-16 lg:pb-8 space-y-2 sm:space-y-3 lg:space-y-6">
        {/* Back to top */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-16 right-3 z-40 rounded-full bg-white/90 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all p-2.5 animate-in fade-in slide-in-from-bottom-2 lg:bottom-5 lg:right-5 lg:p-3"
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        )}

        {/* Search Section - Minimalist & Modern */}
        <div className="relative mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl">
          <SearchInput
            placeholder="Buscar por nome, edifício ou piso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            inputClassName="h-10 md:h-11 lg:h-12 text-sm md:text-base rounded-xl lg:rounded-2xl pl-10 md:pl-11 lg:pl-12 pr-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 md:placeholder:text-slate-500 dark:placeholder:text-slate-400/90 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
            iconClassName="text-slate-600 dark:text-slate-200 drop-shadow-sm h-[22px] w-[22px] md:h-6 md:w-6"
          />
          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Limpar busca"
            >
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Map Section - Mobile Optimized */}
        <div
          className="space-y-2 sm:space-y-3 lg:space-y-4 scroll-mt-24"
          id="map"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <img
              src="/Imagem2.png"
              alt="IST"
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-2 ring-blue-500/20"
            />
            Mapa do Campus IST
          </h2>
          <Suspense
            fallback={
              <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-3">
                <Skeleton className="h-[360px] w-full rounded-xl" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-14 rounded-md" />
                </div>
              </div>
            }
          >
            <LazyMapWithFilters
              onBathroomSelect={handleBathroomSelect}
              bathroomData={mapFilteredByName}
              defaultFloor={settings.defaultFloor}
              isModalOpen={!!selectedBathroomDetails}
            />
          </Suspense>
        </div>

        {/* Quick Stats (compact) */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {/* Location prompt / status (mobile first row if not enabled) */}
          {locationStatus !== "enabled" && (
            <Card className="md:hidden border-dashed border-2 border-blue-300/60 bg-blue-50/60 backdrop-blur-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex flex-col gap-2 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold text-sm">
                  <Navigation className="h-4 w-4" /> Distâncias em tempo real
                </div>
                {locationStatus === "idle" && (
                  <>
                    <p className="text-xs text-blue-700/80">
                      Ative a localização (≤500m do IST) para ordenar pela
                      distância exata.
                    </p>
                    <Button
                      size="sm"
                      className="mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                      onClick={requestLocation}
                    >
                      Ativar localização
                    </Button>
                  </>
                )}
                {locationStatus === "requesting" && (
                  <p className="text-xs animate-pulse text-blue-600">
                    A obter localização...
                  </p>
                )}
                {locationStatus === "denied" && (
                  <p className="text-xs text-red-600">
                    Permissão negada. Ative o acesso à localização nas
                    definições do navegador.
                  </p>
                )}
                {locationStatus === "far" && (
                  <p className="text-xs text-gray-600">
                    Está fora da área do campus. Distâncias em tempo real serão
                    ativadas quando estiver perto (≤500m).
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-blue-50/70 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-900/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                Casa de banho mais próxima
              </p>
              {isNearIST && locationStatus === "enabled" ? (
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {sortedBathrooms[0]?.dynamicDistance ??
                    sortedBathrooms[0]?.distance ??
                    0}
                  m
                </p>
              ) : showOffCampusDistance ? (
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {sortedBathrooms[0]?.distance ?? 0}m
                </p>
              ) : (
                <div className="flex flex-col gap-0.5 items-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {locationStatus === "far" || !isNearIST
                      ? "Fora do campus"
                      : "Localização inativa"}
                  </p>
                  {locationStatus === "idle" && (
                    <button
                      onClick={requestLocation}
                      className="text-[11px] text-blue-600 underline"
                    >
                      Ativar
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Closest Bathroom - Mobile Optimized */}
        {sortedBathrooms.length > 0 && (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Casa de banho mais próxima
              </h2>
            </div>
            {isNearIST && locationStatus === "enabled" ? (
              <>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-full inline-block">
                  📍{" "}
                  {sortedBathrooms[0].dynamicDistance ??
                    sortedBathrooms[0].distance}{" "}
                  m
                </div>
                <BathroomCard
                  {...sortedBathrooms[0]}
                  distance={
                    isNearIST && locationStatus === "enabled"
                      ? sortedBathrooms[0].dynamicDistance ??
                        sortedBathrooms[0].distance
                      : undefined
                  }
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

        {/* Enhanced Review Button */}
        <Card
          id="reviews"
          className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-blue-50/80 to-cyan-100/60 dark:from-blue-950/20 dark:to-cyan-900/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] scroll-mt-24"
        >
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
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
              className="relative isolate overflow-hidden w-full h-12 sm:h-14 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold sm:font-bold rounded-2xl transition-all duration-200 hover:shadow-xl text-base sm:text-lg touch-manipulation ring-1 ring-white/20 dark:ring-white/10"
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

        {/* Top Bathrooms - Ultra Minimalist */}
        <div
          className="space-y-1 sm:space-y-2 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
          id="stats"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Top 5 casas de banho
            </h2>
          </div>
          <div
            className="space-y-1 sm:space-y-2 contain-inline"
            ref={topListRef}
          >
            {topBathrooms.map((bathroom, index) => {
              const displayDistance = isNearIST
                ? bathroom.dynamicDistance ?? bathroom.distance
                : showOffCampusDistance
                ? bathroom.distance
                : undefined;

              const isFirstPlace = index === 0;
              const isThirdPlace = index === 2; // Remove highlight from third place

              return (
                <button
                  key={bathroom.id}
                  ref={isFirstPlace ? firstPlaceRef : null}
                  data-top-item
                  data-index={index}
                  className={`
                    group relative flex w-full items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl text-left
                    bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                    border border-gray-200/40 dark:border-gray-700/40
                    hover:bg-white/80 dark:hover:bg-gray-900/80
                    hover:border-gray-300/60 dark:hover:border-gray-600/60
                    transition-all duration-300 ease-out
                    hover:shadow-md hover:shadow-blue-500/10
                    cursor-pointer select-none touch-manipulation
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                    active:scale-[0.98] active:translate-y-[1px]
                    ${
                      isFirstPlace && firstPlaceHighlighted
                        ? "ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/20"
                        : ""
                    }
                    ${
                      visibleTopIndices.has(index)
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 -translate-x-2 scale-95"
                    }
                  `}
                  style={{
                    transitionDelay: `${index * 80}ms`,
                    transitionProperty:
                      "opacity, transform, background-color, border-color, box-shadow",
                  }}
                  type="button"
                  aria-label={`Ver detalhes de ${bathroom.name}`}
                  aria-haspopup="dialog"
                  onClick={() => handleViewBathroomDetails(bathroom)}
                >
                  {/* Special first place glow effect */}
                  {isFirstPlace && firstPlaceHighlighted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/5 to-yellow-400/10 rounded-lg sm:rounded-xl animate-pulse" />
                  )}

                  {/* Rank Number - Special for first place */}
                  <div
                    className={`
                    relative flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full
                    flex items-center justify-center text-xs font-bold
                    transition-all duration-300 group-hover:scale-110
                    ${
                      isFirstPlace
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-sm ring-2 ring-yellow-300/30"
                        : isThirdPlace
                        ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm" // Remove special styling from third
                        : index === 1
                        ? "bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-sm"
                        : index === 3
                        ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-sm"
                        : "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm"
                    }
                  `}
                  >
                    {index + 1}
                    {/* Special glow for first place */}
                    {isFirstPlace && firstPlaceHighlighted && (
                      <div className="absolute inset-0 rounded-full bg-yellow-300/40 animate-ping" />
                    )}
                    {/* Crown for first place */}
                    {isFirstPlace && (
                      <div className="absolute -top-1 -right-1 text-yellow-300 text-xs opacity-80 animate-bounce">
                        👑
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate transition-colors duration-200 ${
                            isFirstPlace && firstPlaceHighlighted
                              ? "text-yellow-700 dark:text-yellow-300"
                              : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        >
                          {bathroom.name}
                          {isFirstPlace && firstPlaceHighlighted && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-bold animate-pulse">
                              🏆 #1
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {bathroom.building} • {bathroom.floor}
                        </p>
                      </div>

                      {/* Rating - Special for first place */}
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Star
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 fill-yellow-400 text-yellow-400 ${
                            isFirstPlace && firstPlaceHighlighted
                              ? "animate-pulse scale-110"
                              : ""
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 ${
                            isFirstPlace && firstPlaceHighlighted
                              ? "text-yellow-600 dark:text-yellow-400"
                              : ""
                          }`}
                        >
                          {bathroom.rating}
                        </span>
                      </div>
                    </div>

                    {/* Distance - Only show if available */}
                    {displayDistance !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-2.5 w-2.5 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {displayDistance}m
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Special first place particles */}
                  {isFirstPlace && firstPlaceHighlighted && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="absolute top-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <div
                        className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                        style={{ animationDelay: "1s" }}
                      />
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div
                    className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Statistics Cards */}
          <div ref={statsRef} className="mt-8 space-y-4">
            {/* Stats Header with Animation */}
            <div className="text-center space-y-2">
              <h3
                className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-1000 ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                📊 Estatísticas do Campus
              </h3>
              <p
                className={`text-sm text-gray-600 dark:text-gray-400 transition-all duration-1000 delay-200 ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Dados em tempo real da comunidade IST
              </p>
            </div>

            {/* Stats Grid with Staggered Animation */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Reviews */}
              <Card
                className={`group relative overflow-hidden border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-purple-50/70 to-pink-100/50 dark:from-purple-950/20 dark:to-pink-900/10 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: statsVisible ? "300ms" : "0ms" }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-purple-400/0 group-hover:from-purple-400/10 group-hover:via-pink-400/5 group-hover:to-purple-400/10 transition-all duration-700" />

                {/* Mobile touch indicator */}
                <div className="absolute top-2 right-2 md:hidden">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-300/30">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  </div>
                </div>

                <CardContent className="relative p-4 sm:p-5 text-center">
                  {/* Pulsing icon */}
                  <div className="relative mx-auto mb-3 w-12 h-12 sm:w-14 sm:h-14">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                    Total de Reviews
                  </p>

                  {/* Animated counter */}
                  <div className="relative">
                    <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight group-hover:scale-110 transition-transform duration-300">
                      {animatedTotalReviews.toLocaleString()}
                    </p>
                    {/* Sparkle effect on hover */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: statsVisible
                          ? `${Math.min(
                              (animatedTotalReviews / totalReviews) * 100,
                              100
                            )}%`
                          : "0%",
                      }}
                    />
                  </div>

                  {/* Mobile hint */}
                  <div className="mt-2 md:hidden">
                    <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 font-medium">
                      Toque para explorar →
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Average Rating */}
              <Card
                className={`group relative overflow-hidden border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-amber-50/70 to-yellow-100/50 dark:from-amber-950/20 dark:to-yellow-900/10 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: statsVisible ? "500ms" : "0ms" }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-yellow-400/0 to-amber-400/0 group-hover:from-amber-400/10 group-hover:via-yellow-400/5 group-hover:to-amber-400/10 transition-all duration-700" />

                {/* Mobile touch indicator */}
                <div className="absolute top-2 right-2 md:hidden">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-300/30">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  </div>
                </div>

                <CardContent className="relative p-4 sm:p-5 text-center">
                  {/* Pulsing icon */}
                  <div className="relative mx-auto mb-3 w-12 h-12 sm:w-14 sm:h-14">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full animate-pulse opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative w-full h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300">
                    Avaliação Média
                  </p>

                  {/* Animated counter */}
                  <div className="relative">
                    <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight group-hover:scale-110 transition-transform duration-300">
                      {animatedAvgRating.toFixed(1)}
                      <span className="text-lg sm:text-xl ml-1">★</span>
                    </p>
                    {/* Sparkle effect on hover */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Rating visualization */}
                  <div className="mt-3 flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 transition-all duration-500 ${
                          star <= Math.floor(animatedAvgRating)
                            ? "text-amber-400 fill-amber-400"
                            : star <= animatedAvgRating
                            ? "text-amber-400 fill-amber-400/50"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Mobile hint */}
                  <div className="mt-2 md:hidden">
                    <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-medium">
                      Toque para explorar →
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Buildings Covered */}
              <Card
                className={`group relative overflow-hidden border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-teal-50/70 to-cyan-100/50 dark:from-teal-950/20 dark:to-cyan-900/10 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: statsVisible ? "700ms" : "0ms" }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-cyan-400/0 to-teal-400/0 group-hover:from-teal-400/10 group-hover:via-cyan-400/5 group-hover:to-teal-400/10 transition-all duration-700" />

                {/* Mobile touch indicator */}
                <div className="absolute top-2 right-2 md:hidden">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-teal-300/30">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  </div>
                </div>

                <CardContent className="relative p-4 sm:p-5 text-center">
                  {/* Pulsing icon */}
                  <div className="relative mx-auto mb-3 w-12 h-12 sm:w-14 sm:h-14">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative w-full h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Map className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300">
                    Edifícios Mapeados
                  </p>

                  {/* Animated counter */}
                  <div className="relative">
                    <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight group-hover:scale-110 transition-transform duration-300">
                      {animatedBuildings}
                    </p>
                    {/* Sparkle effect on hover */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Building icons visualization */}
                  <div className="mt-3 flex justify-center space-x-1">
                    {Array.from(
                      { length: Math.min(animatedBuildings, 5) },
                      (_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      )
                    )}
                    {animatedBuildings > 5 && (
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold ml-1">
                        +{animatedBuildings - 5}
                      </span>
                    )}
                  </div>

                  {/* Mobile hint */}
                  <div className="mt-2 md:hidden">
                    <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-medium">
                      Toque para explorar →
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Cleanest Average */}
              <Card
                className={`group relative overflow-hidden border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-green-50/70 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/10 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation ${
                  statsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: statsVisible ? "900ms" : "0ms" }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-emerald-400/0 to-green-400/0 group-hover:from-green-400/10 group-hover:via-emerald-400/5 group-hover:to-green-400/10 transition-all duration-700" />

                {/* Mobile touch indicator */}
                <div className="absolute top-2 right-2 md:hidden">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-300/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>

                <CardContent className="relative p-4 sm:p-5 text-center">
                  {/* Pulsing icon */}
                  <div className="relative mx-auto mb-3 w-12 h-12 sm:w-14 sm:h-14">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                    Higiene Geral
                  </p>

                  {/* Animated text */}
                  <div className="relative">
                    <p
                      className={`text-sm sm:text-base font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform duration-300 ${
                        statsVisible ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        transitionDelay: statsVisible ? "1200ms" : "0ms",
                      }}
                    >
                      {(() => {
                        const cleanlinessCounts = bathroomData.reduce(
                          (acc, b) => {
                            acc[b.cleanliness] = (acc[b.cleanliness] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        );
                        const mostCommon = Object.entries(
                          cleanlinessCounts
                        ).sort(([, a], [, b]) => b - a)[0];
                        return mostCommon ? mostCommon[0] : "N/A";
                      })()}
                    </p>
                    {/* Sparkle effect on hover */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Cleanliness indicator */}
                  <div
                    className={`mt-3 transition-all duration-700 ${
                      statsVisible
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                    style={{ transitionDelay: statsVisible ? "1400ms" : "0ms" }}
                  >
                    <div className="flex justify-center">
                      <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                          🧼 Excelente
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile hint */}
                  <div className="mt-2 md:hidden">
                    <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-medium">
                      Toque para explorar →
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fun fact reveal */}
            <div
              className={`text-center mt-6 transition-all duration-1000 ${
                statsVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: statsVisible ? "1600ms" : "0ms" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  💡 A comunidade IST já ajudou{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {animatedTotalReviews}
                  </span>{" "}
                  estudantes!
                </span>
              </div>
            </div>
          </div>
        </div>

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

        {/* About Section */}
        <section id="about" className="mt-4 sm:mt-6 lg:mt-10 scroll-mt-24">
          <div
            ref={aboutRef}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-gray-900/80 dark:to-indigo-950/30 p-4 sm:p-6 lg:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

            {/* Heading */}
            <h2
              className={
                `text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-3 ` +
                (aboutVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3") +
                " transition-all duration-700"
              }
            >
              Sobre o Projeto
            </h2>

            {/* Body */}
            <p
              className={
                `text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-3xl ` +
                (aboutVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3") +
                " transition-all duration-700 delay-100"
              }
            >
              Criámos o <span className="font-semibold">IST Toilet Finder</span>{" "}
              para ajudar os alunos do Instituto Superior Técnico a encontrar as
              melhores casas de banho no campus. Aqui podes explorar o mapa, ver
              avaliações reais de estudantes e partilhar a sua experiência para
              ajudar a comunidade.
            </p>

            {/* Feature chips */}
            <div
              className={
                `mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 ` +
                (aboutVisible ? "opacity-100" : "opacity-0") +
                " transition-opacity duration-700 delay-200"
              }
            >
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Mapa Interativo
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pins por edifício e piso
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Top Avaliações
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ranking por qualidade
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 text-white flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Partilhe a sua experiência
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reviews anónimas e rápidas
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                onClick={scrollToMap}
                className={
                  `rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl ` +
                  (aboutVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2") +
                  " transition-all duration-700 delay-300"
                }
              >
                Explorar o mapa
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    "https://github.com/franciscogfsm/caganisto",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className={
                  `rounded-xl border-blue-200/60 text-blue-700 hover:bg-blue-50 ` +
                  (aboutVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2") +
                  " transition-all duration-700 delay-350"
                }
              >
                <Github className="h-4 w-4 mr-2" /> Contribuir
              </Button>
            </div>
          </div>
        </section>

        {/* Sidebar Menu */}
        <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>

      {/* Bottom Mobile Nav - Super Modern Floating Design */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none overflow-x-hidden w-full">
        <div className="mx-auto max-w-md w-full px-2 sm:px-3 pb-2 sm:pb-3 pt-1.5 pointer-events-auto">
          {/* Floating container with enhanced glassmorphism */}
          <div className="relative">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 rounded-2xl sm:rounded-3xl blur-xl opacity-60 animate-pulse" />

            <div className="relative flex justify-around items-stretch bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/10 rounded-2xl sm:rounded-3xl p-1.5 ring-1 ring-white/30">
              {(
                [
                  {
                    id: "map",
                    label: "Mapa",
                    icon: Map,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    id: "reviews",
                    label: "Reviews",
                    icon: Star,
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    id: "stats",
                    label: "Stats",
                    icon: TrendingUp,
                    color: "from-emerald-500 to-teal-500",
                  },
                ] as const
              ).map((item: any) => {
                const Icon = item.icon;
                const active = activeTopTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={
                      item.action ||
                      (() => scrollToSection(item.id, item.id as any))
                    }
                    className={`flex-1 group relative overflow-hidden rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2.5 flex flex-col items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold transition-all duration-500 min-h-[52px] touch-manipulation ${
                      active
                        ? `bg-gradient-to-r ${
                            item.color
                          } text-white shadow-lg shadow-${
                            item.color.split(" ")[0]
                          }/30 scale-105`
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:scale-105"
                    }`}
                    aria-label={item.label}
                  >
                    {/* Icon with enhanced animations */}
                    <div
                      className={`relative transition-all duration-500 ${
                        active
                          ? "scale-110 drop-shadow-lg"
                          : "group-hover:scale-110"
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      {/* Active indicator glow */}
                      {active && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-50 animate-ping`}
                        />
                      )}
                    </div>

                    {/* Label with subtle animation */}
                    <span
                      className={`transition-all duration-300 ${
                        active ? "font-bold" : "group-hover:font-semibold"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active background overlay */}
                    {active && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl sm:rounded-2xl animate-pulse`}
                      />
                    )}

                    {/* Hover effect for inactive */}
                    {!active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
