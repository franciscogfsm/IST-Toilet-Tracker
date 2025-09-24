import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  snapPoints?: number[];
  initialSnapPoint?: number;
  animateCloseDown?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  showCloseButton = true,
  snapPoints = [0.9, 0.5, 0.1],
  initialSnapPoint = 0,
  animateCloseDown = false,
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHandleDrag, setIsHandleDrag] = useState(false);
  const scrollYRef = useRef(0);
  // Local mount/animation state for smooth enter/exit
  const [isRendering, setIsRendering] = useState(isOpen);
  const [isShown, setIsShown] = useState(false);
  const [isClosingDown, setIsClosingDown] = useState(false);

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Animation constants
  const OPEN_DURATION = 260;
  const NORMAL_CLOSE_DURATION = 260;
  const CLOSE_DOWN_DURATION = 420;
  const OPEN_EASING = "cubic-bezier(0.25,0.9,0.30,1)";
  const CLOSE_EASING = "cubic-bezier(0.33,1,0.68,1)";
  const CLOSE_DOWN_EASING = "cubic-bezier(0.16,1,0.3,1)";

  // Body lock + mount/unmount with timing aware cleanup
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let rAF: number | null = null;
    if (isOpen) {
      setIsRendering(true);
      if (document.body.style.overflow !== "hidden") {
        scrollYRef.current = window.scrollY || window.pageYOffset || 0;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      }
      setIsShown(false);
      rAF = requestAnimationFrame(() => setIsShown(true));
    } else {
      setIsShown(false);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      const exitDuration = isClosingDown
        ? CLOSE_DOWN_DURATION
        : NORMAL_CLOSE_DURATION;
      timeout = setTimeout(() => {
        setIsRendering(false);
        if (scrollYRef.current) window.scrollTo(0, scrollYRef.current);
      }, exitDuration);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      if (rAF) cancelAnimationFrame(rAF);
      if (!isOpen) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    };
  }, [isOpen, isClosingDown]);

  // Extra safety: on unmount always restore scroll (covers navigation away)
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Smooth downward auto-close coordination
  useEffect(() => {
    if (animateCloseDown && isOpen) {
      setIsClosingDown(true);
      const t = setTimeout(() => {
        onClose();
      }, CLOSE_DOWN_DURATION + 20);
      return () => clearTimeout(t);
    } else if (!animateCloseDown) {
      setIsClosingDown(false);
    }
  }, [animateCloseDown, isOpen, onClose]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentY(0);
      setCurrentSnapPoint(initialSnapPoint);
      setIsClosingDown(false);
    }
  }, [isOpen, initialSnapPoint]);

  // Handle/header touch handlers (drag-to-close only from handle/header)
  const onHandleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    setIsHandleDrag(true);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  const onHandleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isHandleDrag || !isDragging) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;
    const maxDragUp = -50;
    const constrainedDiff = Math.max(maxDragUp, diff);
    setCurrentY(constrainedDiff);
  };
  const onHandleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (!isHandleDrag) return;
    setIsHandleDrag(false);
    setIsDragging(false);
    // Improved close threshold - close if dragged down more than 80px or if velocity suggests closing
    if (currentY > 80) {
      onClose();
    } else {
      // Smooth return animation
      setCurrentY(0);
    }
  };

  if (!isRendering) return null;

  const snapPoint = snapPoints[currentSnapPoint] || snapPoints[0];
  // Calculate translateY with improved logic
  let translateY = 0;
  if (isClosingDown) {
    // Animate downward when closing due to modal auto-close
    translateY = window.innerHeight;
  } else if (isDragging) {
    translateY = currentY;
  } else if (isShown) {
    translateY = 0;
  } else {
    translateY = window.innerHeight;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={handleBackdropClick}
        style={{ opacity: isShown ? 1 : 0 }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
          maxHeight: `${snapPoint * 100}vh`,
          height: `${snapPoint * 100}vh`,
          willChange: "transform",
          transition:
            isShown || isClosingDown
              ? `transform ${
                  isClosingDown ? CLOSE_DOWN_DURATION : OPEN_DURATION
                }ms ${isClosingDown ? CLOSE_DOWN_EASING : OPEN_EASING}`
              : undefined,
        }}
      >
        {/* Handle */}
        <div
          className="flex justify-center py-3 px-4 flex-shrink-0"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          style={{ touchAction: "none" }}
        >
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        {(title || subtitle || showCloseButton) && (
          <div
            className="flex items-center justify-between px-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
            style={{ touchAction: "none" }}
          >
            <div className="min-w-0 pr-2">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 py-4 pb-20 bottom-sheet-content"
          // Important for iOS smooth scrolling
          style={{
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch" as any,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
