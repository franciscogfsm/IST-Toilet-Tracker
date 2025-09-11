import { useState, useEffect, useRef } from "react";
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Baby,
  Accessibility,
  Heart,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  EyeOff,
  User as UserIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";

interface Bathroom {
  id: string;
  name: string;
  building: string;
  distance: number;
  rating: number;
  reviewCount: number;
  cleanliness: string;
  x: number;
  y: number;
  floor: string;
  facilities: string[];
  accessibility: boolean;
  paperSupply: "Bom" | "Médio" | "Fraco";
  privacy: "Excelente" | "Boa" | "Média";
  lastCleaned: string;
  reviews: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
    cleanliness: number;
    paperSupply: number;
    privacy: number;
  }>;
  hasAccessible?: boolean;
}

interface BathroomDetailsProps {
  bathroom: Bathroom | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (
    bathroomId: string,
    review: {
      rating: number;
      comment: string;
      user: string;
      cleanliness?: number;
      paperSupply?: number;
      privacy?: number;
      paperAvailable?: boolean;
    }
  ) => void;
}

export function BathroomDetails({
  bathroom,
  isOpen,
  onClose,
  onReviewSubmit,
}: BathroomDetailsProps) {
  // Hint to guide users to scroll for the review form
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // anchors to enable smooth scrolling inside the modal content
  const reviewsAnchorId = "all-reviews";
  const formAnchorId = "review-form";
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [paperAvailable, setPaperAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!bathroom) return null;

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert("Por favor, dê uma classificação geral.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onReviewSubmit(bathroom.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        user: reviewerName.trim() || "Anónimo",
        paperAvailable,
      });

      // Reset form
      setReviewComment("");
      setReviewerName("");
      setReviewRating(0);
      setPaperAvailable(true);

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      alert("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hide the scroll hint after a shorter time since review form is now at bottom
  useEffect(() => {
    if (!showScrollHint) return;
    const t = setTimeout(() => setShowScrollHint(false), 3000);
    return () => clearTimeout(t);
  }, [showScrollHint]);

  // Clean up Leaflet styles when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Remove any inline styles that might have been added
      const leafletContainers = document.querySelectorAll(".leaflet-container");
      leafletContainers.forEach((container) => {
        const element = container as HTMLElement;
        element.style.pointerEvents = "";
        element.style.touchAction = "";
      });

      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.documentElement.style.overflow = "";
    }
  }, [isOpen]);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const target = e.currentTarget;
    if (target.scrollTop > 10 && showScrollHint) setShowScrollHint(false);
  };

  // Prevent touch event conflicts with Leaflet
  const handleTouchStart = (e: React.TouchEvent) => {
    // Allow normal touch behavior in the modal
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Allow normal touch behavior in the modal
    e.stopPropagation();
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onStarClick?: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={
              interactive && onStarClick ? () => onStarClick(star) : undefined
            }
          />
        ))}
      </div>
    );
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
      case "estacionamento":
        return <Car className="h-4 w-4" />;
      case "baby changing":
      case "fraldário":
        return <Baby className="h-4 w-4" />;
      case "accessibility":
      case "acessibilidade":
        return <Accessibility className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 w-[92vw] max-w-[480px] max-h-[85vh] sm:w-[70vw] sm:max-w-lg sm:max-h-[80vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-hidden overflow-x-hidden bathroom-details-modal">
        {/* Add styles to hide any Leaflet popups when modal is open */}
        {isOpen && (
          <style>
            {`
              .leaflet-popup, .leaflet-tooltip {
                display: none !important;
              }
              /* Prevent horizontal overflow in modal */
              .bathroom-details-modal * {
                max-width: 100%;
                box-sizing: border-box;
              }
              .bathroom-details-modal {
                overflow-x: hidden !important;
              }
              .bathroom-details-modal .flex {
                flex-wrap: wrap;
              }
              /* Prevent Leaflet map interaction when modal is open */
              .leaflet-container {
                pointer-events: none !important;
                touch-action: none !important;
              }
              .leaflet-control-container {
                display: none !important;
              }
              /* Add overlay to prevent map interaction */
              .leaflet-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: transparent;
                pointer-events: auto;
                z-index: 9999;
              }
              /* Prevent background scroll when modal is open */
              body {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
              }
              html {
                overflow: hidden !important;
              }
              /* Prevent scroll on all scrollable containers */
              .overflow-y-auto,
              .overflow-y-scroll,
              .overflow-auto {
                overscroll-behavior: contain;
              }
            `}
          </style>
        )}
        {/* Sticky header on mobile for easy closing and context */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 supports-[backdrop-filter]:backdrop-blur-lg border-b border-border/60 px-4 py-4 sm:px-6 shadow-sm">
          <DialogHeader className="px-0">
            <DialogTitle className="flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between">
                <span className="text-xl sm:text-2xl font-bold leading-tight tracking-tight break-words min-w-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {bathroom.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="h-10 w-10 shrink-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="break-words">{bathroom.building}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="hidden sm:block text-muted-foreground mt-2">
              Detalhes e avaliações da casa de banho {bathroom.name}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div
          ref={scrollRef as any}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-3 sm:py-4 space-y-4"
        >
          {showScrollHint && (
            <div className="sticky top-2 z-20 flex justify-center mb-4">
              <div className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground/90 bg-white/90 dark:bg-gray-800/90 supports-[backdrop-filter]:backdrop-blur-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-200">
                <ChevronDown
                  className="h-4 w-4 text-blue-500 group-hover:translate-y-0.5 transition-transform animate-bounce"
                  aria-hidden
                />
                <span className="whitespace-nowrap font-medium">
                  Desça para avaliar
                </span>
                <button
                  className="ml-2 inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                  onClick={() => {
                    const el = document.getElementById("review-form");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTimeout(() => {
                      setShowScrollHint(false);
                    }, 350);
                  }}
                  aria-label="Avaliar"
                >
                  Avaliar
                </button>
              </div>
            </div>
          )}
          {/* Mobile context line under title */}
          <p className="sm:hidden text-xs text-muted-foreground -mt-2">
            {bathroom.building}
          </p>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="break-words font-medium">
                    {bathroom.building}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(bathroom.rating)}
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {bathroom.rating}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    {bathroom.reviewCount} avaliações
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="font-medium">
                    {bathroom.distance} m de distância
                  </span>
                </div>
              </div>
            </Card>

            {/* Features */}
            {bathroom.facilities && bathroom.facilities.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Instalações
                </h4>
                <div className="flex flex-wrap gap-2">
                  {bathroom.facilities.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {getFeatureIcon(feature)}
                      <span className="text-xs font-medium">{feature}</span>
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <Separator />

          {/* Bathroom Stats */}
          <Card className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-800/50">
            <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white text-center">
              Estado Atual
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Limpeza
                </div>
                <div
                  className={`text-base font-bold px-2 py-1 rounded-md ${
                    bathroom.cleanliness === "Excelente"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                      : bathroom.cleanliness === "Boa"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                  }`}
                >
                  {bathroom.cleanliness}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Papel Higiênico
                </div>
                <div
                  className={`text-base font-bold px-2 py-1 rounded-md ${
                    bathroom.paperSupply === "Bom"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                      : bathroom.paperSupply === "Médio"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                  }`}
                >
                  {bathroom.paperSupply}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Privacidade
                </div>
                <div
                  className={`text-base font-bold px-2 py-1 rounded-md ${
                    bathroom.privacy === "Excelente"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                      : bathroom.privacy === "Boa"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                  }`}
                >
                  {bathroom.privacy}
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Reviews Section */}
          <div id={reviewsAnchorId}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Avaliações
              </h3>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              >
                {bathroom.reviews?.length || 0}
              </Badge>
            </div>

            <div className="space-y-3">
              {bathroom.reviews ? (
                bathroom.reviews.length > 0 ? (
                  <>
                    {(showAllReviews
                      ? bathroom.reviews
                      : bathroom.reviews.slice(0, 3)
                    ).map((review) => (
                      <Card
                        key={review.id}
                        className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {review.user}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                {review.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {review.rating}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {bathroom.reviews.length > 3 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          {showAllReviews ? (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1 rotate-180" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Ver todas ({bathroom.reviews.length})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-dashed border-blue-200 dark:border-blue-800">
                    <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nenhuma avaliação ainda. Seja o primeiro a avaliar! 🌟
                    </p>
                  </Card>
                )
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Review Form */}
          <div id={formAnchorId}>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-3">
                  <Star className="h-6 w-6 text-white fill-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  Ajude a comunidade! 🌟
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sua avaliação faz a diferença
                </p>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 w-full overflow-hidden dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300 text-sm break-words flex items-center gap-2 font-medium">
                    <Check className="h-4 w-4" />
                    Obrigado pela avaliação! 🎉
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Quick Actions - Optional but encouraged */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="truncate">Papel higiênico?</span>
                    </label>
                    <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setPaperAvailable(true)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          paperAvailable
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Check className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Sim</span>
                      </button>
                      <button
                        onClick={() => setPaperAvailable(false)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          !paperAvailable
                            ? "bg-rose-500 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <X className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Não</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <UserIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Seu nome</span>
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Anónimo"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 dark:bg-gray-800/90"
                    />
                  </div>
                </div>

                {/* Overall Rating - Required */}
                <div className="space-y-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-3 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                  <label className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    <span>Classificação *</span>
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {renderStars(reviewRating, true, setReviewRating)}
                    </div>
                    {reviewRating > 0 && (
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">
                        {reviewRating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment - Optional */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Comentário</span>
                  </label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ajude outros usuários..."
                    className="w-full min-h-[60px] resize-none bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm rounded-lg"
                  />
                </div>

                {/* Submit - Only requires rating */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || reviewRating === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Enviar avaliação</span>
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  * Apenas a classificação é obrigatória
                </p>
              </div>
            </Card>
          </div>
        </div>
        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 z-10 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 supports-[backdrop-filter]:backdrop-blur-lg border-t border-border/60 px-4 py-4 sm:px-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Última limpeza: {bathroom.lastCleaned}
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-6 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
