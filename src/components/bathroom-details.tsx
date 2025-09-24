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
  ChevronUp,
  EyeOff,
  User as UserIcon,
  Check,
  AlertTriangle,
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
import { Bathroom, Review } from "@/types";
import { DeviceFingerprint } from "@/lib/deviceFingerprint";
import { BathroomService } from "@/services/bathroomService";
import { SpamProtectionService } from "@/services/spamProtectionService";
import { Captcha } from "@/components/captcha";
import { BottomSheet } from "@/components/bottom-sheet";

interface BathroomDetailsProps {
  bathroom: Bathroom | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (
    bathroomId: string,
    review: {
      rating: number;
      comment: string;
      user_name: string;
      cleanliness: number;
      paper_supply: number;
      privacy: number;
      paper_available?: boolean;
    }
  ) => void;
  onBathroomUpdate?: (updatedBathroom: Bathroom) => void;
}

export function BathroomDetails({
  bathroom,
  isOpen,
  onClose,
  onReviewSubmit,
  onBathroomUpdate,
}: BathroomDetailsProps) {
  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // Hint to guide users to scroll for the review form
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // anchors to enable smooth scrolling inside the modal content
  const reviewsAnchorId = "all-reviews";
  const formAnchorId = "review-form";
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [paperAvailable, setPaperAvailable] = useState<boolean>(true);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [privacyRating, setPrivacyRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const submissionInProgressRef = useRef(false);
  const [isHidingHint, setIsHidingHint] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editReviewerName, setEditReviewerName] = useState("");
  const [editPaperAvailable, setEditPaperAvailable] = useState<boolean>(true);
  const [editCleanlinessRating, setEditCleanlinessRating] = useState(0);
  const [editPrivacyRating, setEditPrivacyRating] = useState(0);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Spam protection state
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [spamCheckResult, setSpamCheckResult] = useState(null);
  const [showSpamWarningModal, setShowSpamWarningModal] = useState(false);
  const [animateBottomSheetClose, setAnimateBottomSheetClose] = useState(false);

  // Reset modal states when component unmounts or bathroom changes
  useEffect(() => {
    return () => {
      setShowSuccessModal(false);
      setShowDuplicateModal(false);
      setShowEditSuccessModal(false);
      setShowSpamWarningModal(false);
      setShowCaptcha(false);
      setCaptchaVerified(false);
      setSpamCheckResult(null);
      setAnimateBottomSheetClose(false);
    };
  }, [bathroom?.id]);

  // Handle BottomSheet auto-close animation when success modal closes
  useEffect(() => {
    if (!showSuccessModal && isMobile) {
      // Success modal just closed, trigger BottomSheet close animation
      setAnimateBottomSheetClose(true);
      // Reset the animation state after the animation completes
      const timeout = setTimeout(() => {
        setAnimateBottomSheetClose(false);
      }, 700); // Slightly longer than the transition duration
      return () => clearTimeout(timeout);
    }
  }, [showSuccessModal, isMobile]);

  if (!bathroom) return null;

  const handleSubmitReview = async () => {
    // Reset all modal states first
    setShowSuccessModal(false);
    setShowDuplicateModal(false);
    setShowSpamWarningModal(false);

    if (cleanlinessRating === 0 || privacyRating === 0) {
      alert("Por favor, avalie a limpeza e privacidade.");
      return;
    }

    // Prevent multiple submissions using both state and ref
    if (
      isSubmittingReview ||
      showSuccessModal ||
      submissionInProgressRef.current
    ) {
      return;
    }

    submissionInProgressRef.current = true;
    setIsSubmittingReview(true);

    let success = false;

    try {
      // Prepare review data for spam check
      const reviewData = {
        bathroomId: bathroom.id,
        comment: reviewComment.trim(),
        userName: reviewerName.trim() || "Anónimo",
        rating: Math.round((cleanlinessRating + privacyRating) / 2),
        cleanliness: cleanlinessRating,
        privacy: privacyRating,
        paperAvailable: paperAvailable,
      };

      // Check for spam
      const spamResult = await SpamProtectionService.checkForSpam(reviewData);
      setSpamCheckResult(spamResult);

      // If spam detected, show warning or captcha
      if (spamResult.isSpam) {
        console.log("Spam detected:", spamResult.reason);
        setShowSpamWarningModal(true);
        // Auto-close spam warning after 3 seconds
        setTimeout(() => {
          setShowSpamWarningModal(false);
        }, 3000);
        return;
      }

      // If captcha required but not verified, show captcha
      if (spamResult.requiresCaptcha && !captchaVerified) {
        setShowCaptcha(true);
        return;
      }
      // Calculate overall rating from cleanliness and privacy
      const finalRating = Math.round((cleanlinessRating + privacyRating) / 2);

      await onReviewSubmit(bathroom.id, {
        rating: finalRating,
        comment: reviewComment.trim(),
        user_name: reviewerName.trim() || "Anónimo",
        cleanliness: cleanlinessRating,
        paper_supply: paperAvailable ? 5 : 1, // Set based on availability: 5 if available, 1 if not
        privacy: privacyRating,
        paper_available: paperAvailable,
      });

      success = true;

      // Reset form and spam protection state
      setReviewComment("");
      setReviewerName("");
      setPaperAvailable(true);
      setCleanlinessRating(0);
      setPrivacyRating(0);
      setCaptchaVerified(false);
      setShowCaptcha(false);
      setSpamCheckResult(null);

      // Show success modal with faster timing and cool animations
      setShowSuccessModal(true);

      // Auto-close success modal after 2 seconds (faster than before)
      setTimeout(() => {
        setShowSuccessModal(false);
        // Close main modal after success modal closes with shorter delay
        setTimeout(() => {
          onClose();
        }, 200); // Faster transition
      }, 2000);
    } catch (error: unknown) {
      console.error("Erro ao enviar avaliação:", error);
      console.log("Error type:", typeof error);
      console.log(
        "Error message:",
        error instanceof Error ? error.message : String(error)
      );
      console.log(
        "Error name:",
        error instanceof Error ? error.name : "Unknown"
      );

      // Handle specific error cases
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        (error as any).message === "ALREADY_REVIEWED"
      ) {
        console.log("ALREADY_REVIEWED error detected, showing duplicate modal");
        setShowDuplicateModal(true);
        // Auto-close duplicate modal after 2 seconds (faster than before)
        setTimeout(() => {
          setShowDuplicateModal(false);
          // Close main modal after duplicate modal closes with shorter delay
          setTimeout(() => {
            onClose();
          }, 200); // Faster transition
        }, 5000);
      } else {
        alert("Erro ao enviar avaliação. Tente novamente.");
      }
    } finally {
      setIsSubmittingReview(false);
      submissionInProgressRef.current = false;
    }
  };

  // Reset / show the scroll hint every time the sheet opens (mobile only)
  useEffect(() => {
    if (isOpen && isMobile) {
      // Re-show the hint when opening a different WC or re-opening
      setShowScrollHint(true);
      setIsHidingHint(false);
    }
  }, [isOpen, isMobile, bathroom?.id]);

  // Hide the scroll hint with a smooth fade-out, only once sheet is actually open on mobile
  useEffect(() => {
    if (!showScrollHint) return; // already hidden
    if (!isOpen || !isMobile) return; // don't start timers until visible context

    // Extended visibility so user can read it a bit longer
    const startFadeAfter = 3000; // ms
    const removeAfter = 3500; // ms
    const t1 = setTimeout(() => setIsHidingHint(true), startFadeAfter); // start fade
    const t2 = setTimeout(() => {
      setShowScrollHint(false);
      setIsHidingHint(false); // ensure no residual space
    }, removeAfter);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showScrollHint, isOpen, isMobile]);

  // Mobile: fade out hint immediately when user actually scrolls the sheet content
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    if (!showScrollHint) return;
    const contentEl = document.querySelector(".bottom-sheet-content");
    if (!contentEl) return;
    const onScroll = () => {
      if (!showScrollHint) return;
      if ((contentEl as HTMLElement).scrollTop > 8) {
        setIsHidingHint(true);
        setTimeout(() => {
          setShowScrollHint(false);
          setIsHidingHint(false);
        }, 320);
      }
    };
    contentEl.addEventListener("scroll", onScroll, { passive: true });
    return () => contentEl.removeEventListener("scroll", onScroll);
  }, [isMobile, isOpen, showScrollHint]);

  // Clean up Leaflet styles when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all submission-related state when main modal closes
      setShowSuccessModal(false);
      setIsSubmittingReview(false);
      setShowEditSuccessModal(false);
      setShowSpamWarningModal(false);
      setShowCaptcha(false);
      setCaptchaVerified(false);
      setSpamCheckResult(null);
      submissionInProgressRef.current = false;

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

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditComment(review.comment || "");
    setEditReviewerName(review.user_name || "");
    setEditPaperAvailable(review.paper_available !== false); // Default to true if undefined
    setEditCleanlinessRating(review.cleanliness);
    setEditPrivacyRating(review.privacy);
  };

  const toggleCommentExpansion = (reviewId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    setIsSubmittingEdit(true);
    try {
      const updatedReview = {
        user_name: editReviewerName || "Anónimo",
        comment: editComment,
        cleanliness: editCleanlinessRating,
        privacy: editPrivacyRating,
        paper_available: editPaperAvailable,
        rating: Math.round((editCleanlinessRating + editPrivacyRating) / 2),
        date: editingReview.date, // Keep original date
        paper_supply: editPaperAvailable ? 5 : 1, // Convert boolean to supply level
      };

      await BathroomService.updateReview(
        editingReview.id,
        bathroom.id,
        updatedReview
      );

      // Update the review in the local state
      const updatedBathroom = {
        ...bathroom,
        reviews:
          bathroom.reviews?.map((review) =>
            review.id === editingReview.id
              ? { ...review, ...updatedReview }
              : review
          ) || [],
      };

      // Notify parent component of the update
      if (onBathroomUpdate) {
        onBathroomUpdate(updatedBathroom);
      }

      // Update the bathroom data (you might need to pass this up to parent component)
      // For now, we'll just close the modal and show success
      setEditingReview(null);
      setShowEditSuccessModal(true);

      // Reset form
      setEditComment("");
      setEditReviewerName("");
      setEditPaperAvailable(true);
      setEditCleanlinessRating(0);
      setEditPrivacyRating(0);

      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setShowEditSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating review:", error);
      // You could add error state here
      alert("Erro ao atualizar avaliação. Tente novamente.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditComment("");
    setEditReviewerName("");
    setEditPaperAvailable(true);
    setEditCleanlinessRating(0);
    setEditPrivacyRating(0);
  };

  // Prevent touch event conflicts with Leaflet
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const target = e.currentTarget;
    if (target.scrollTop > 10 && showScrollHint) {
      setIsHidingHint(true);
      setTimeout(() => {
        setShowScrollHint(false);
        setIsHidingHint(false);
      }, 350);
    }
  };

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

  const getPaperAvailabilityText = (percentage: number): string => {
    if (percentage >= 60) return "Disponível";
    if (percentage >= 40) return "Dúvidas na disponibilidade";
    return "Indisponível";
  };

  const getPaperAvailabilityColor = (percentage: number): string => {
    if (percentage >= 60)
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
    if (percentage >= 40)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
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
      case "has_accessible":
      case "acessibilidade":
        return <Accessibility className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <>
      {isMobile ? (
        <BottomSheet
          isOpen={isOpen}
          onClose={onClose}
          title={bathroom?.name || ""}
          subtitle={bathroom?.building || ""}
          animateCloseDown={animateBottomSheetClose}
        >
          {/* Add styles to hide any Leaflet popups when modal is open */}
          {isOpen && (
            <style>
              {`
                .leaflet-popup, .leaflet-tooltip { display: none !important; }
                /* Keep the sheet clean without breaking scroll */
                .bathroom-details-modal * { max-width: 100%; box-sizing: border-box; }
                .bathroom-details-modal { overflow-x: hidden !important; }
                .bathroom-details-modal .flex { flex-wrap: wrap; }
                /* Disable direct map interaction but avoid intercepting touches globally */
                .leaflet-container { pointer-events: none !important; touch-action: none !important; }
                .leaflet-control-container { display: none !important; }
                /* Important: do NOT add overlays or lock body with position:fixed; BottomSheet controls body scroll. */
                /* Tame nested scroll bounce without blocking */
                .overflow-y-auto, .overflow-y-scroll, .overflow-auto { overscroll-behavior: contain; }
              `}
            </style>
          )}

          {/* Content directly in BottomSheet (sheet provides scroll) */}
          <div className="space-y-4 pb-4 h-full">
            {(showScrollHint || (isHidingHint && isOpen)) && (
              <div
                className={`sticky top-2 z-20 flex justify-center mb-4 transition-opacity duration-400 ease-out ${
                  showScrollHint && !isHidingHint ? "opacity-100" : "opacity-0"
                }`}
              >
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
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      // Immediate hide when user taps
                      setIsHidingHint(true);
                      setTimeout(() => {
                        setShowScrollHint(false);
                        setIsHidingHint(false);
                      }, 240);
                    }}
                    aria-label="Avaliar"
                  >
                    Avaliar
                  </button>
                </div>
              </div>
            )}

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
                      {bathroom.review_count} avaliações
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
                      bathroom.paper_availability !== undefined
                        ? getPaperAvailabilityColor(bathroom.paper_availability)
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                    }`}
                  >
                    {bathroom.paper_availability !== undefined
                      ? getPaperAvailabilityText(bathroom.paper_availability)
                      : "Sem dados"}
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-900 dark:text-white">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Avaliações
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {bathroom.reviews?.length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {bathroom.reviews ? (
                  bathroom.reviews.length > 0 ? (
                    <>
                      {(showAllReviews
                        ? bathroom.reviews
                        : bathroom.reviews.slice(0, 2)
                      ).map((review) => {
                        const isOwnReview = DeviceFingerprint.isOwnReview(
                          review.id
                        );
                        return (
                          <Card
                            key={review.id}
                            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {review.user_name}
                                  </p>
                                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {review.date}
                                    </span>
                                    {isOwnReview && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                        onClick={() => handleEditReview(review)}
                                      >
                                        <svg
                                          className="h-3 w-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                  {renderStars(review.rating)}
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {review.rating}/5
                                  </span>
                                </div>

                                {/* Expandable Comment */}
                                {review.comment && review.comment.trim() && (
                                  <div className="space-y-1">
                                    <p
                                      className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words ${
                                        expandedComments.has(review.id)
                                          ? ""
                                          : "line-clamp-2"
                                      }`}
                                    >
                                      {review.comment}
                                    </p>
                                    {review.comment.length > 100 && (
                                      <button
                                        onClick={() =>
                                          toggleCommentExpansion(review.id)
                                        }
                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                      >
                                        {expandedComments.has(review.id) ? (
                                          <span className="flex items-center gap-1">
                                            Ver menos
                                            <ChevronUp className="h-3 w-3" />
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            Ver mais
                                            <ChevronDown className="h-3 w-3" />
                                          </span>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bathroom.reviews.length > 2 && (
                        <div className="text-center pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors h-8 px-3"
                          >
                            {showAllReviews ? (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1 rotate-180" />
                                Ver menos
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Ver mais ({bathroom.reviews.length - 2})
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-dashed border-blue-200 dark:border-blue-800">
                      <MessageSquare className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Nenhuma avaliação ainda. Seja o primeiro a avaliar! 🌟
                      </p>
                    </Card>
                  )
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
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
                    Avalie a limpeza e privacidade! 🌟
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    A classificação geral será calculada automaticamente
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Quick Actions - Optional but encouraged */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">Papel higiénico?</span>
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
                        <span className="truncate">Nome</span>
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

                  {/* Detailed Ratings - Required */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Avaliações específicas *
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">Limpeza</span>
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                setCleanlinessRating(star);
                                // Auto-scroll to the in-form submit button
                                const btn = document.getElementById(
                                  "mobile-review-submit"
                                );
                                btn?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "end",
                                });
                              }}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= cleanlinessRating
                                    ? "fill-blue-400 text-blue-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <Star className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">Privacidade</span>
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                setPrivacyRating(star);
                                const btn = document.getElementById(
                                  "mobile-review-submit"
                                );
                                btn?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "end",
                                });
                              }}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= privacyRating
                                    ? "fill-purple-400 text-purple-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Show calculated rating */}
                    {cleanlinessRating > 0 && privacyRating > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Classificação geral calculada:
                          </span>
                          <div className="flex items-center gap-2">
                            {renderStars(
                              Math.round(
                                (cleanlinessRating + privacyRating) / 2
                              )
                            )}
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {Math.round(
                                (cleanlinessRating + privacyRating) / 2
                              )}
                              /5
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comment - Optional */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Comentário</span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 500) {
                            setReviewComment(value);
                          }
                        }}
                        placeholder="Ajude outros usuários..."
                        className="w-full min-h-[60px] resize-none bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm rounded-lg pr-16"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                        {reviewComment.length}/500
                      </div>
                    </div>
                    {reviewComment.length > 450 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Aproximando-se do limite de caracteres
                      </p>
                    )}
                  </div>

                  {/* Captcha */}
                  {showCaptcha && (
                    <Captcha
                      onVerify={setCaptchaVerified}
                      difficulty="medium"
                      required={true}
                    />
                  )}

                  {/* Submit - Requires cleanliness and privacy */}
                  <Button
                    id="mobile-review-submit"
                    onClick={handleSubmitReview}
                    disabled={
                      isSubmittingReview ||
                      cleanlinessRating === 0 ||
                      privacyRating === 0 ||
                      (showCaptcha && !captchaVerified)
                    }
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmittingReview ? (
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
                    * Limpeza e privacidade são obrigatórias
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </BottomSheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="p-0 w-[92vw] max-w-[480px] max-h-[85vh] sm:w-[70vw] sm:max-w-lg sm:max-h-[80vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-hidden overflow-x-hidden bathroom-details-modal animate-in fade-in zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200">
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
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-3 sm:py-4 space-y-4"
            >
              {showScrollHint && (
                <div
                  className={`sticky top-2 z-20 flex justify-center mb-4 transition-opacity duration-300 ease-out ${
                    isHidingHint ? "opacity-0" : "opacity-100"
                  }`}
                >
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
                        el?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                        setIsHidingHint(true);
                        setTimeout(() => setShowScrollHint(false), 250);
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
                        {bathroom.review_count} avaliações
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
                        bathroom.paper_availability !== undefined
                          ? getPaperAvailabilityColor(
                              bathroom.paper_availability
                            )
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                      }`}
                    >
                      {bathroom.paper_availability !== undefined
                        ? getPaperAvailabilityText(bathroom.paper_availability)
                        : "Sem dados"}
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-900 dark:text-white">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Avaliações
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {bathroom.reviews?.length || 0}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {bathroom.reviews ? (
                    bathroom.reviews.length > 0 ? (
                      <>
                        {(showAllReviews
                          ? bathroom.reviews
                          : bathroom.reviews.slice(0, 2)
                        ).map((review) => {
                          const isOwnReview = DeviceFingerprint.isOwnReview(
                            review.id
                          );
                          return (
                            <Card
                              key={review.id}
                              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                      {review.user_name}
                                    </p>
                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {review.date}
                                      </span>
                                      {isOwnReview && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                          onClick={() =>
                                            handleEditReview(review)
                                          }
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mb-1">
                                    {renderStars(review.rating)}
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {review.rating}/5
                                    </span>
                                  </div>

                                  {/* Expandable Comment */}
                                  {review.comment && review.comment.trim() && (
                                    <div className="space-y-1">
                                      <p
                                        className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words ${
                                          expandedComments.has(review.id)
                                            ? ""
                                            : "line-clamp-2"
                                        }`}
                                      >
                                        {review.comment}
                                      </p>
                                      {review.comment.length > 100 && (
                                        <button
                                          onClick={() =>
                                            toggleCommentExpansion(review.id)
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                        >
                                          {expandedComments.has(review.id) ? (
                                            <span className="flex items-center gap-1">
                                              Ver menos
                                              <ChevronUp className="h-3 w-3" />
                                            </span>
                                          ) : (
                                            <span className="flex items-center gap-1">
                                              Ver mais
                                              <ChevronDown className="h-3 w-3" />
                                            </span>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                        {bathroom.reviews.length > 2 && (
                          <div className="text-center pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllReviews(!showAllReviews)}
                              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors h-8 px-3"
                            >
                              {showAllReviews ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1 rotate-180" />
                                  Ver menos
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Ver mais ({bathroom.reviews.length - 2})
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-dashed border-blue-200 dark:border-blue-800">
                        <MessageSquare className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Nenhuma avaliação ainda. Seja o primeiro a avaliar! 🌟
                        </p>
                      </Card>
                    )
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
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
                      Avalie a limpeza e privacidade! 🌟
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      A classificação geral será calculada automaticamente
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Quick Actions - Optional but encouraged */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="truncate">Papel higiénico?</span>
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
                          <span className="truncate">Nome</span>
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

                    {/* Detailed Ratings - Required */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Avaliações específicas *
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                            <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">Limpeza</span>
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCleanlinessRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    star <= cleanlinessRating
                                      ? "fill-blue-400 text-blue-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                            <Star className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <span className="truncate">Privacidade</span>
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setPrivacyRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    star <= privacyRating
                                      ? "fill-purple-400 text-purple-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Show calculated rating */}
                      {cleanlinessRating > 0 && privacyRating > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              Classificação geral calculada:
                            </span>
                            <div className="flex items-center gap-2">
                              {renderStars(
                                Math.round(
                                  (cleanlinessRating + privacyRating) / 2
                                )
                              )}
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {Math.round(
                                  (cleanlinessRating + privacyRating) / 2
                                )}
                                /5
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comment - Optional */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Comentário</span>
                      </label>
                      <div className="relative">
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 500) {
                              setReviewComment(value);
                            }
                          }}
                          placeholder="Ajude outros usuários..."
                          className="w-full min-h-[60px] resize-none bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm rounded-lg pr-16"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                          {reviewComment.length}/500
                        </div>
                      </div>
                      {reviewComment.length > 450 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          ⚠️ Aproximando-se do limite de caracteres
                        </p>
                      )}
                    </div>

                    {/* Captcha */}
                    {showCaptcha && (
                      <Captcha
                        onVerify={setCaptchaVerified}
                        difficulty="medium"
                        required={true}
                      />
                    )}

                    {/* Submit - Requires cleanliness and privacy */}
                    <Button
                      onClick={handleSubmitReview}
                      disabled={
                        isSubmittingReview ||
                        cleanlinessRating === 0 ||
                        privacyRating === 0 ||
                        (showCaptcha && !captchaVerified)
                      }
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmittingReview ? (
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
                      * Limpeza e privacidade são obrigatórias
                    </p>
                  </div>
                </Card>
              </div>
            </div>
            {/* Sticky bottom action bar */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 supports-[backdrop-filter]:backdrop-blur-lg border-t border-border/60 px-4 py-4 sm:px-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Última atualização: {new Date().toLocaleDateString("pt-PT")}
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

          {/* Edit Success Modal */}
          <Dialog
            open={showEditSuccessModal}
            onOpenChange={setShowEditSuccessModal}
          >
            <DialogContent className="p-0 w-[90vw] max-w-[400px] max-h-[85vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <DialogHeader className="sr-only">
                <DialogTitle>Avaliação Atualizada com Sucesso</DialogTitle>
              </DialogHeader>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-100">
                  <Check className="h-8 w-8 text-white animate-in zoom-in-75 duration-300 delay-200" />
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Avaliação atualizada! ✨
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Obrigado por manter as informações atualizadas!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Suas alterações foram salvas com sucesso
                  </p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full animate-in slide-in-from-left-full duration-2000"></div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Review Modal */}
          <Dialog
            open={!!editingReview}
            onOpenChange={(open) => !open && handleCancelEdit()}
          >
            <DialogContent className="p-0 w-[92vw] max-w-[480px] max-h-[85vh] sm:w-[70vw] sm:max-w-lg sm:max-h-[80vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-hidden overflow-x-hidden">
              <DialogHeader className="px-4 py-4 sm:px-6 border-b border-border/60">
                <DialogTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="text-lg font-bold">Editar Avaliação</span>
                </DialogTitle>
                <DialogDescription>
                  Atualize sua avaliação para {bathroom.name}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">Papel higiénico?</span>
                      </label>
                      <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setEditPaperAvailable(true)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            editPaperAvailable
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Check className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Sim</span>
                        </button>
                        <button
                          onClick={() => setEditPaperAvailable(false)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            !editPaperAvailable
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
                        <span className="truncate">Nome</span>
                      </label>
                      <input
                        type="text"
                        value={editReviewerName}
                        onChange={(e) => setEditReviewerName(e.target.value)}
                        placeholder="Anónimo"
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 dark:bg-gray-800/90"
                      />
                    </div>
                  </div>

                  {/* Detailed Ratings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Avaliações específicas *
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">Limpeza</span>
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditCleanlinessRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= editCleanlinessRating
                                    ? "fill-blue-400 text-blue-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <Star className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">Privacidade</span>
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditPrivacyRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= editPrivacyRating
                                    ? "fill-purple-400 text-purple-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Show calculated rating */}
                    {editCleanlinessRating > 0 && editPrivacyRating > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Classificação geral calculada:
                          </span>
                          <div className="flex items-center gap-2">
                            {renderStars(
                              Math.round(
                                (editCleanlinessRating + editPrivacyRating) / 2
                              )
                            )}
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {Math.round(
                                (editCleanlinessRating + editPrivacyRating) / 2
                              )}
                              /5
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Comentário</span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={editComment}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 500) {
                            setEditComment(value);
                          }
                        }}
                        placeholder="Ajude outros usuários..."
                        className="w-full min-h-[60px] resize-none bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm rounded-lg pr-16"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                        {editComment.length}/500
                      </div>
                    </div>
                    {editComment.length > 450 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Aproximando-se do limite de caracteres
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-border/60 px-4 py-4 sm:px-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateReview}
                  disabled={
                    isSubmittingEdit ||
                    editCleanlinessRating === 0 ||
                    editPrivacyRating === 0
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {isSubmittingEdit ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Atualizando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Atualizar</span>
                    </div>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Dialog>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className="p-0 w-[90vw] max-w-[400px] max-h-[85vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ zIndex: 9999999 }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Avaliação Enviada com Sucesso</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-100">
              <Check className="h-8 w-8 text-white animate-in zoom-in-75 duration-300 delay-200" />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Avaliação enviada! 🎉
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Obrigado por ajudar a comunidade do IST!
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Sua opinião faz toda a diferença ✨
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-1 rounded-full animate-in slide-in-from-left-full duration-2000"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spam Warning Modal */}
      <Dialog
        open={showSpamWarningModal}
        onOpenChange={setShowSpamWarningModal}
      >
        <DialogContent
          className="p-0 w-[90vw] max-w-[400px] max-h-[85vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ zIndex: 9999999 }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Aviso de Spam</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-100">
              <AlertTriangle className="h-8 w-8 text-white animate-in zoom-in-75 duration-300 delay-200" />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Atividade Suspeita Detectada 🚫
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {spamCheckResult?.reason ||
                  "Sua atividade foi identificada como potencial spam."}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Por favor, aguarde antes de tentar novamente
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 rounded-full animate-in slide-in-from-left-full duration-3000"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Review Modal */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent
          className="p-0 w-[90vw] max-w-[400px] max-h-[85vh] flex flex-col bg-background/95 supports-[backdrop-filter]:backdrop-blur-md border border-border/60 shadow-2xl rounded-xl overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ zIndex: 9999999 }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Avaliação Duplicada</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-100">
              <AlertTriangle className="h-8 w-8 text-white animate-in zoom-in-75 duration-300 delay-200" />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Avaliação já existe hoje! ⚠️
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você já avaliou esta casa de banho hoje.
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Só é permitida uma avaliação por dispositivo por dia
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1 rounded-full animate-in slide-in-from-left-full duration-2000"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
