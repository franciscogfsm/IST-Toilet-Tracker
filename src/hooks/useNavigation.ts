import { useState, useEffect, useRef } from "react";
import { NavigationState } from "@/types";

const HEADER_OFFSET = 80; // px

export function useNavigation() {
  const [navState, setNavState] = useState<NavigationState>({
    activeTab: "map",
    showMenu: false,
    selectedBathroomDetails: null,
  });

  const manualScrollSuppressRef = useRef<number>(0);

  const scrollToSection = (id: string, tab: "map" | "reviews" | "stats") => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - HEADER_OFFSET;

      // Mark suppression window (~900ms) to avoid flicker
      manualScrollSuppressRef.current = Date.now() + 900;

      window.scrollTo({ top, behavior: "smooth" });
      setNavState((prev) => ({ ...prev, activeTab: tab }));
    }
  };

  // Scroll listener to set active tab based on current scroll position
  useEffect(() => {
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

            const top = el.offsetTop - HEADER_OFFSET - 4; // small fudge
            const nextElId = sectionIds[i + 1]?.[0];
            const nextEl = nextElId ? document.getElementById(nextElId) : null;
            const nextTop = nextEl
              ? nextEl.offsetTop - HEADER_OFFSET
              : Infinity;

            if (scrollMid >= top && scrollMid < nextTop) {
              current = tab;
              break;
            }
            if (scrollMid >= nextTop) continue;
          }

          setNavState((prev) => ({ ...prev, activeTab: current }));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const setActiveTab = (tab: "map" | "reviews" | "stats") => {
    setNavState((prev) => ({ ...prev, activeTab: tab }));
  };

  const toggleMenu = () => {
    setNavState((prev) => ({ ...prev, showMenu: !prev.showMenu }));
  };

  const setSelectedBathroomDetails = (bathroom: any) => {
    setNavState((prev) => ({ ...prev, selectedBathroomDetails: bathroom }));
  };

  return {
    ...navState,
    scrollToSection,
    setActiveTab,
    toggleMenu,
    setSelectedBathroomDetails,
  };
}
