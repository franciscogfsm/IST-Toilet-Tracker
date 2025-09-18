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

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Body lock: only set overflow hidden (avoid position: fixed which can break iOS inner-scroll)
  useEffect(() => {
    if (isOpen) {
      // Prepare to render and animate in
      setIsRendering(true);
      // Lock body scroll
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      // Ensure we start from offscreen then animate to 0 in next frame
      setIsShown(false);
      const rAF = requestAnimationFrame(() => setIsShown(true));
      return () => cancelAnimationFrame(rAF);
    } else {
      // Animate out then unmount after duration
      setIsShown(false);
      const timeout = setTimeout(() => {
        setIsRendering(false);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        if (scrollYRef.current) window.scrollTo(0, scrollYRef.current);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentY(0);
      setCurrentSnapPoint(initialSnapPoint);
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
    if (diff > 0) setCurrentY(diff);
  };

  const onHandleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (!isHandleDrag) return;
    setIsHandleDrag(false);
    setIsDragging(false);
    if (currentY > 100) onClose();
    setCurrentY(0);
  };

  if (!isRendering) return null;

  const snapPoint = snapPoints[currentSnapPoint] || snapPoints[0];
  const translateY = isDragging ? currentY : isShown ? 0 : window.innerHeight;

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
        // IMPORTANT: make this a column flex container so .flex-1 works on content
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transition-[transform,_max-height,_height] duration-300 ease-out overflow-hidden flex flex-col"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
          maxHeight: `${snapPoint * 100}vh`,
          height: `${snapPoint * 100}vh`,
          willChange: "transform",
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
