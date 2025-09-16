/**
 * Device fingerprinting utility for review limitation
 * Generates a unique identifier for the current device/browser
 */

export class DeviceFingerprint {
  private static readonly STORAGE_KEY = "device_fingerprint";
  private static readonly FINGERPRINT_KEY = "review_fingerprint";

  /**
   * Generate or retrieve a unique device fingerprint
   * Uses a combination of localStorage and browser properties
   */
  static getFingerprint(): string {
    // Try to get existing fingerprint from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Generate new fingerprint
    const fingerprint = this.generateFingerprint();
    localStorage.setItem(this.STORAGE_KEY, fingerprint);
    return fingerprint;
  }

  /**
   * Generate a new device fingerprint
   */
  private static generateFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset().toString(),
      this.getCanvasFingerprint(),
      this.getWebGLFingerprint(),
    ];

    // Create hash from components
    const hash = this.simpleHash(components.join("|"));
    return hash;
  }

  /**
   * Get canvas fingerprint
   */
  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "no-canvas";

      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("IST Toilet Tracker", 2, 2);

      return canvas.toDataURL();
    } catch (e) {
      return "canvas-error";
    }
  }

  /**
   * Get WebGL fingerprint
   */
  private static getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
        (canvas.getContext(
          "experimental-webgl"
        ) as WebGLRenderingContext | null);
      if (!gl) return "no-webgl";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        return (
          gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) +
          "|" +
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        );
      }

      return "webgl-no-debug";
    } catch (e) {
      return "webgl-error";
    }
  }

  /**
   * Simple hash function for fingerprinting
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if device has already reviewed a specific bathroom today
   */
  static hasReviewedBathroom(bathroomId: string): boolean {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_${bathroomId}`;
    const reviewData = JSON.parse(localStorage.getItem(key) || "[]");

    const today = new Date().toISOString().split("T")[0];

    // Check if this device has reviewed today
    return reviewData.some(
      (review: any) =>
        review.fingerprint === fingerprint && review.date === today
    );
  }

  /**
   * Mark that this device has reviewed a specific bathroom today
   */
  static markReviewedBathroom(bathroomId: string): void {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_${bathroomId}`;
    const reviewData = JSON.parse(localStorage.getItem(key) || "[]");
    const today = new Date().toISOString().split("T")[0];

    // Remove any existing review for this device today (shouldn't happen, but just in case)
    const filteredData = reviewData.filter(
      (review: any) =>
        !(review.fingerprint === fingerprint && review.date === today)
    );

    // Add today's review
    filteredData.push({
      fingerprint: fingerprint,
      date: today,
    });

    localStorage.setItem(key, JSON.stringify(filteredData));
  }

  /**
   * Check if a specific review belongs to this device
   */
  static isOwnReview(reviewId: string): boolean {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_review_${reviewId}`;
    const storedFingerprint = localStorage.getItem(key);

    return storedFingerprint === fingerprint;
  }

  /**
   * Mark a review as belonging to this device
   */
  static markOwnReview(reviewId: string): void {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_review_${reviewId}`;
    localStorage.setItem(key, fingerprint);
  }

  /**
   * Get all review IDs that belong to this device for a specific bathroom
   */
  static getOwnReviewIdsForBathroom(bathroomId: string): string[] {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_${bathroomId}`;
    const reviewData = JSON.parse(localStorage.getItem(key) || "[]");

    // Check if this device has any reviews for this bathroom
    const hasReviewed = reviewData.some(
      (review: any) => review.fingerprint === fingerprint
    );

    if (!hasReviewed) {
      return [];
    }

    // Find all review keys for this bathroom that belong to this device
    const reviewKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`${this.FINGERPRINT_KEY}_review_`)
    );

    const ownReviewIds: string[] = [];
    reviewKeys.forEach((key) => {
      const storedFingerprint = localStorage.getItem(key);
      if (storedFingerprint === fingerprint) {
        const reviewId = key.replace(`${this.FINGERPRINT_KEY}_review_`, "");
        ownReviewIds.push(reviewId);
      }
    });

    return ownReviewIds;
  }

  /**
   * Clear all review tracking for testing purposes
   */
  static clearAllReviewTracking(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.FINGERPRINT_KEY)
    );

    keys.forEach((key) => localStorage.removeItem(key));
  }
}
