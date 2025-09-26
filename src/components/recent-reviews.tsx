import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface RecentReview {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  bathrooms: {
    id: string;
    name: string;
    building: string;
    floor: string;
  };
}

interface RecentReviewsProps {
  reviews: RecentReview[];
  onBathroomClick?: (bathroomId: string) => void;
  compact?: boolean;
  showHeader?: boolean;
}

export const RecentReviews: React.FC<RecentReviewsProps> = ({
  reviews,
  onBathroomClick,
  compact = true,
  showHeader = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
    new Set()
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialCenteredRef = useRef(false);

  const toggleReviewExpansion = (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) newSet.delete(reviewId);
      else newSet.add(reviewId);
      return newSet;
    });
  };

  const isReviewExpanded = (reviewId: string) => expandedReviews.has(reviewId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    return date.toLocaleDateString("pt-PT");
  };

  // Only show last 5
  const items = useMemo(() => reviews.slice(-5), [reviews]);

  // helper to compute widths and to scroll to a given index
  const scrollToIndex = (
    index: number,
    behavior: "auto" | "smooth" = "auto"
  ) => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector(".review-card") as HTMLElement | null;
    const cardWidth = firstCard
      ? firstCard.offsetWidth +
        (parseFloat(getComputedStyle(el).gap || "24") || 24)
      : 288 + 24; // fallback

    const cardInnerWidth = firstCard ? firstCard.offsetWidth : 288;
    const centerOffset = Math.max((el.clientWidth - cardInnerWidth) / 2, 0);
    const left = Math.max(0, index * cardWidth - centerOffset);

    // instant (auto) or smooth scroll
    el.scrollTo({ left, behavior });
  };

  // Center the first card BEFORE painting/animation using useLayoutEffect
  useLayoutEffect(() => {
    if (!scrollRef.current || items.length === 0 || initialCenteredRef.current)
      return;

    // center index 0 immediately (no smooth)
    scrollToIndex(0, "auto");
    initialCenteredRef.current = true;
  }, [items]);

  // Keep centered when the window is resized (re-center active index)
  useEffect(() => {
    const onResize = () => {
      // re-center the current active index
      scrollToIndex(activeIndex, "auto");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, items]);

  // IntersectionObserver to update active index smoothly as user scrolls
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index") ?? 0);
            setActiveIndex(idx);
          }
        });
      },
      {
        root: container,
        threshold: 0.55, // require ~center alignment
      }
    );

    const cards = container.querySelectorAll(".review-card");
    cards.forEach((c) => obs.observe(c));

    return () => obs.disconnect();
  }, [items]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.36 },
    },
  };

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-200/60 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              Nenhuma avaliação recente
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {showHeader && (
        <motion.div
          className="flex items-center gap-2 px-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 px-3">
            Avaliações Recentes
          </h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
        </motion.div>
      )}

      <motion.div
        ref={scrollRef}
        className="flex sm:flex-col flex-row items-stretch gap-6 overflow-x-auto sm:overflow-visible pb-5 sm:pb-0 no-scrollbar scroll-smooth snap-x snap-mandatory pl-6 pr-6 overscroll-x-contain"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {items.map((review, index) => (
          <motion.div
            key={review.id}
            data-index={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="review-card flex-shrink-0 w-72 sm:w-full snap-center h-full will-change-transform will-change-opacity"
          >
            <Card
              className="relative h-full bg-white shadow-md hover:shadow-lg transition-transform duration-300 cursor-pointer rounded-2xl border border-gray-200"
              onClick={() => onBathroomClick?.(review.bathrooms.id)}
            >
              <CardContent className="p-5 sm:p-6 h-full">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <MapPin
                        className={`text-blue-500 flex-shrink-0 ${
                          compact ? "h-3.5 w-3.5" : "h-5 w-5"
                        }`}
                      />
                      <h4
                        className={`truncate hover:text-blue-600 transition-colors ${
                          compact
                            ? "text-base font-bold text-gray-900"
                            : "text-lg font-bold text-gray-900"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBathroomClick?.(review.bathrooms.id);
                        }}
                      >
                        {review.bathrooms.name}
                      </h4>
                      <div className="ml-auto">
                        <Badge
                          variant="secondary"
                          className={`text-xs whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200 ${
                            compact ? "px-2.5 py-1" : "px-3 py-1.5"
                          }`}
                        >
                          {review.bathrooms.building} - {review.bathrooms.floor}
                        </Badge>
                      </div>
                    </div>

                    <div className={`${compact ? "space-y-2" : "space-y-3"}`}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`font-semibold text-gray-800 ${
                            compact ? "text-sm" : "text-base"
                          }`}
                        >
                          {review.rating}/5
                        </span>
                      </div>

                      {review.comment && (
                        <div className="space-y-2">
                          <p
                            className={`text-gray-700 leading-relaxed ${
                              compact ? "text-sm" : "text-base"
                            }`}
                          >
                            "
                            {isReviewExpanded(review.id)
                              ? review.comment
                              : review.comment.length > 150
                              ? `${review.comment.substring(0, 150)}...`
                              : review.comment}
                            "
                          </p>
                          {review.comment.length > 150 && (
                            <button
                              type="button"
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                              onClick={(e) =>
                                toggleReviewExpansion(review.id, e)
                              }
                            >
                              {isReviewExpanded(review.id)
                                ? "Ver menos"
                                : "Ver mais"}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                          {review.user_name}
                        </span>
                        <span className="opacity-70">•</span>
                        <div className="flex items-center gap-1">
                          <Clock
                            className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
                          />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Modern dot indicators */}
      <div className="flex justify-center gap-3 mt-1 sm:hidden">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => {
              if (scrollRef.current) {
                const el = scrollRef.current;
                const cardWidth = 288 + 24;
                const centerOffset = Math.max((el.clientWidth - 288) / 2, 0);
                const left = index * cardWidth - centerOffset;
                el.scrollTo({ left, behavior: "smooth" });
              }
            }}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
