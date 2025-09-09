import { useState, useEffect, useRef } from "react";
import {
  Star,
  MapPin,
  Clock,
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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(0);
  const [paperScore, setPaperScore] = useState<number>(0);
  const [privacyScore, setPrivacyScore] = useState<number>(0);
  const [paperAvailable, setPaperAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!bathroom) return null;

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || (!isAnonymous && !reviewerName.trim())) {
      alert(
        "Preencha pelo menos a classificação geral e o nome (ou escolha ficar anónimo)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onReviewSubmit(bathroom.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        user: isAnonymous ? "Anónimo" : reviewerName.trim(),
        cleanliness: cleanlinessScore || undefined,
        paperSupply: paperScore || undefined,
        privacy: privacyScore || undefined,
        paperAvailable,
      });

      // Reset form
      setReviewComment("");
      setReviewerName("");
      // keep isAnonymous as user preference
      setReviewRating(0);
      setCleanlinessScore(0);
      setPaperScore(0);
      setPrivacyScore(0);
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

  // Hide the scroll hint after a few seconds or once the user scrolls
  useEffect(() => {
    if (!showScrollHint) return;
    const t = setTimeout(() => setShowScrollHint(false), 6000);
    return () => clearTimeout(t);
  }, [showScrollHint]);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const target = e.currentTarget;
    if (target.scrollTop > 24 && showScrollHint) setShowScrollHint(false);
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
      <DialogContent className="p-0 w-[92vw] max-w-[640px] h-[86vh] sm:w-[90vw] sm:max-w-2xl sm:h-[80vh] bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-2xl overflow-hidden">
        {/* Add styles to hide any Leaflet popups when modal is open */}
        {isOpen && (
          <style>
            {`
              .leaflet-popup, .leaflet-tooltip {
                display: none !important;
              }
            `}
          </style>
        )}
        {/* Sticky header on mobile for easy closing and context */}
        <div className="sticky top-0 z-10 bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border-b border-border/50 px-4 py-3 sm:px-6">
          <DialogHeader className="px-0">
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-extrabold leading-snug tracking-tight">
                {bathroom.name}
              </span>
              <Button
                variant="outline"
                onClick={onClose}
                aria-label="Fechar"
                className="hidden sm:inline-flex h-9 px-3 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-800 border-border/60"
              >
                <X className="h-4 w-4 mr-1" /> Fechar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fechar"
                className="sm:hidden h-9 w-9 shrink-0 rounded-full bg-muted/50 hover:bg-muted border border-border/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
            <DialogDescription className="hidden sm:block text-muted-foreground">
              Detalhes e avaliações da casa de banho {bathroom.name} localizada
              em {bathroom.building}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div
          ref={scrollRef as any}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6"
        >
          {showScrollHint && (
            <div className="sticky top-2 z-20 flex justify-center">
              <div className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm text-foreground/80 bg-background/60 supports-[backdrop-filter]:backdrop-blur-md ring-1 ring-border/60 shadow-sm hover:bg-background/80 transition">
                <ChevronDown
                  className="h-3.5 w-3.5 text-muted-foreground/80 group-hover:translate-y-0.5 transition-transform"
                  aria-hidden
                />
                <span className="whitespace-nowrap">Scroll para avaliar</span>
                <button
                  className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition"
                  onClick={() => {
                    const el = document.getElementById("review-form");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTimeout(() => {
                      const input = el?.querySelector(
                        'input[type="text"]'
                      ) as HTMLInputElement | null;
                      input?.focus();
                    }, 350);
                    setShowScrollHint(false);
                  }}
                  aria-label="Ir para avaliação"
                >
                  Ir
                </button>
              </div>
            </div>
          )}
          {/* Mobile context line under title */}
          <p className="sm:hidden text-xs text-muted-foreground -mt-2">
            {bathroom.building}
          </p>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{bathroom.building}</span>
              </div>

              <div className="flex items-center gap-2">
                {renderStars(bathroom.rating)}
                <span className="text-sm font-medium">{bathroom.rating}</span>
                <span className="text-sm text-gray-500">
                  ({bathroom.reviewCount} avaliações)
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="text-green-600">
                  Última limpeza: {bathroom.lastCleaned}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Distância: {bathroom.distance} m</span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {bathroom.facilities &&
                  bathroom.facilities.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {getFeatureIcon(feature)}
                      <span className="text-xs">{feature}</span>
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bathroom Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Limpeza</div>
              <div className="text-lg font-bold text-blue-600">
                {bathroom.cleanliness}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Papel</div>
              <div className="text-lg font-bold text-green-600">
                {bathroom.paperSupply}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">
                Privacidade
              </div>
              <div className="text-lg font-bold text-purple-600">
                {bathroom.privacy}
              </div>
            </div>
          </div>

          <Separator />

          {/* Reviews Section */}
          <div id={reviewsAnchorId}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Avaliações ({bathroom.reviews?.length || 0})
            </h3>

            <div className="space-y-4">
              {bathroom.reviews && bathroom.reviews.length > 0 ? (
                bathroom.reviews.slice(0, 3).map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.user}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {review.comment}
                    </p>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma avaliação ainda. Seja o primeiro a avaliar! 🌟
                </p>
              )}
            </div>
            {bathroom.reviews && bathroom.reviews.length > 3 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById(reviewsAnchorId);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Ver todas as avaliações
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Review Form */}
          <div id={formAnchorId}>
            <h3 className="font-semibold mb-4">✍️ Deixe sua avaliação</h3>

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm">
                  ✅ Avaliação enviada com sucesso!
                </p>
              </div>
            )}

            <div className="space-y-5">
              {/* Ratings: overall + subratings */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Classificação geral
                  </label>
                  <div className="scale-110 origin-left">
                    {renderStars(reviewRating, true, setReviewRating)}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      Limpeza
                    </label>
                    {renderStars(cleanlinessScore, true, setCleanlinessScore)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      Papel higiénico
                    </label>
                    {renderStars(paperScore, true, setPaperScore)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      Privacidade
                    </label>
                    {renderStars(privacyScore, true, setPrivacyScore)}
                  </div>
                </div>
              </div>

              {/* Paper availability segmented control */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Havia papel higiénico?
                </label>
                <ToggleGroup
                  type="single"
                  value={paperAvailable ? "yes" : "no"}
                  onValueChange={(val) => {
                    if (!val) return;
                    setPaperAvailable(val === "yes");
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="yes"
                    className={
                      "data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700"
                    }
                  >
                    <Check className="h-4 w-4 mr-1" /> Sim
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="no"
                    className={
                      "data-[state=on]:bg-rose-100 data-[state=on]:text-rose-700"
                    }
                  >
                    <X className="h-4 w-4 mr-1" /> Não
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentário
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Conte sobre sua experiência nesta casa de banho..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Name + Anonymous toggle (end) */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Toggle
                    pressed={isAnonymous}
                    onPressedChange={setIsAnonymous}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 border border-border/60 bg-background/70 hover:bg-background/90"
                    aria-label="Ficar anónimo"
                  >
                    <EyeOff className="h-4 w-4" /> Anónimo
                  </Toggle>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder={
                        isAnonymous ? "Anónimo" : "Digite o seu nome..."
                      }
                      disabled={isAnonymous}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isAnonymous ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmitReview}
                disabled={
                  isSubmitting ||
                  reviewRating === 0 ||
                  (!isAnonymous && !reviewerName.trim())
                }
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Enviar Avaliação
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
        {/* Sticky bottom action bar (only Close to avoid redundancy) */}
        <div className="sticky bottom-0 z-10 bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border-t border-border/50 px-4 py-3 sm:px-6 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-9 px-4 rounded-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
