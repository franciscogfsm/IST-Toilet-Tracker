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

  // Show fewer reviews on desktop (no horizontal scroll)
  const items = useMemo(() => {
    // Use a simple heuristic: if window width is available and >= 640px (sm breakpoint), show fewer reviews
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;
    const maxReviews = isDesktop ? 2 : 5;
    return reviews.slice(0, maxReviews);
  }, [reviews]);

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
      transition: { staggerChildren: 0.12, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
      rotateX: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
    },
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
    },
  };

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <Card className="relative border-gray-200/60 bg-gradient-to-br from-white to-blue-50/30 shadow-sm overflow-hidden">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 3,
            }}
          />

          <CardContent className="relative p-4 sm:p-6 text-center z-10">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.4)",
                  "0 0 0 10px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </motion.div>
            <motion.p
              className="text-sm sm:text-base text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Nenhuma avaliação recente
            </motion.p>
            <motion.p
              className="text-xs text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Seja o primeiro a avaliar uma casa de banho! ✨
            </motion.p>
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
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <motion.div
            className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.h3
            className="text-lg font-bold text-gray-900 px-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Avaliações Recentes
          </motion.h3>
          <motion.div
            className="h-1 flex-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
      )}

      <motion.div
        ref={scrollRef}
        className="flex sm:flex-col flex-row items-stretch gap-6 overflow-x-auto sm:overflow-visible pb-5 sm:pb-0 no-scrollbar scroll-smooth snap-x snap-mandatory pl-6 pr-6 overscroll-x-contain"
      >
        {items.map((review, index) => (
          <motion.div
            key={review.id}
            data-index={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3, margin: "-50px" }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: index * 0.1,
            }}
            whileTap="tap"
            className="review-card flex-shrink-0 w-72 sm:w-full snap-center h-full will-change-transform will-change-opacity"
          >
            <motion.div
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="h-full"
            >
              <Card
                className="relative h-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 shadow-md transition-all duration-300 cursor-pointer rounded-2xl border border-gray-200/60 overflow-hidden active:scale-[0.98] active:transition-transform active:duration-75"
                onClick={() => onBathroomClick?.(review.bathrooms.id)}
              >
                <CardContent className="relative p-5 sm:p-6 h-full z-10">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <motion.div transition={{ duration: 0.2 }}>
                          <MapPin
                            className={`text-blue-500 flex-shrink-0 transition-colors duration-300 ${
                              compact ? "h-3.5 w-3.5" : "h-5 w-5"
                            }`}
                          />
                        </motion.div>
                        <motion.h4
                          className={`truncate transition-colors duration-300 ${
                            compact
                              ? "text-base font-bold text-gray-900"
                              : "text-lg font-bold text-gray-900"
                          }`}
                          transition={{ duration: 0.2 }}
                        >
                          {review.bathrooms.name}
                        </motion.h4>
                        <motion.div
                          className="ml-auto"
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            variant="secondary"
                            className={`text-xs whitespace-nowrap bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 transition-all duration-300 ${
                              compact ? "px-2.5 py-1" : "px-3 py-1.5"
                            }`}
                          >
                            {review.bathrooms.building} -{" "}
                            {review.bathrooms.floor}
                          </Badge>
                        </motion.div>
                      </div>

                      <div className={`${compact ? "space-y-2" : "space-y-3"}`}>
                        <motion.div
                          className="flex items-center gap-2"
                          variants={starVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.68, -0.55, 0.265, 1.55],
                            delay: 0.2,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: -180 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{
                                  duration: 0.4,
                                  delay: i * 0.1,
                                  ease: "backOut",
                                }}
                              >
                                <Star
                                  className={`${
                                    compact ? "h-4 w-4" : "h-5 w-5"
                                  } ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current drop-shadow-sm"
                                      : "text-gray-300"
                                  }`}
                                />
                              </motion.div>
                            ))}
                          </div>
                          <motion.span
                            className={`font-semibold text-gray-800 ${
                              compact ? "text-sm" : "text-base"
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                          >
                            {review.rating}/5
                          </motion.span>
                        </motion.div>

                        {review.comment && (
                          <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                          >
                            <motion.p
                              className={`text-gray-700 leading-relaxed ${
                                compact ? "text-sm" : "text-base"
                              }`}
                              animate={{
                                color: isReviewExpanded(review.id)
                                  ? "#374151"
                                  : "#6B7280",
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              "
                              {isReviewExpanded(review.id)
                                ? review.comment
                                : review.comment.length > 150
                                ? `${review.comment.substring(0, 150)}...`
                                : review.comment}
                              "
                            </motion.p>
                            {review.comment.length > 150 && (
                              <motion.button
                                type="button"
                                className="text-xs font-medium text-blue-600 transition-colors duration-200"
                                onClick={(e) =>
                                  toggleReviewExpansion(review.id, e)
                                }
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                              >
                                {isReviewExpanded(review.id)
                                  ? "Ver menos"
                                  : "Ver mais"}
                              </motion.button>
                            )}
                          </motion.div>
                        )}

                        <motion.div
                          className="flex items-center gap-2 text-xs text-gray-500"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.4, delay: 1 }}
                        >
                          <motion.span
                            className="font-medium truncate max-w-[120px] sm:max-w-none"
                            transition={{ duration: 0.2 }}
                          >
                            {review.user_name}
                          </motion.span>
                          <span className="opacity-70">•</span>
                          <motion.div
                            className="flex items-center gap-1"
                            transition={{ duration: 0.2 }}
                          >
                            <Clock
                              className={`${
                                compact ? "h-3.5 w-3.5" : "h-4 w-4"
                              }`}
                            />
                            {formatDate(review.created_at)}
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modern dot indicators */}
      <motion.div
        className="flex justify-center gap-3 mt-1 sm:hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {items.map((_, index) => (
          <button
            key={index}
            className={`rounded-full transition-all duration-200 ${
              index === activeIndex
                ? "w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
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
      </motion.div>
    </div>
  );
};
