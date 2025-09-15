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
   * Check if device has already reviewed a specific bathroom
   */
  static hasReviewedBathroom(bathroomId: string): boolean {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_${bathroomId}`;
    const reviewedDevices = JSON.parse(localStorage.getItem(key) || "[]");

    return reviewedDevices.includes(fingerprint);
  }

  /**
   * Mark that this device has reviewed a specific bathroom
   */
  static markReviewedBathroom(bathroomId: string): void {
    const fingerprint = this.getFingerprint();
    const key = `${this.FINGERPRINT_KEY}_${bathroomId}`;
    const reviewedDevices = JSON.parse(localStorage.getItem(key) || "[]");

    if (!reviewedDevices.includes(fingerprint)) {
      reviewedDevices.push(fingerprint);
      localStorage.setItem(key, JSON.stringify(reviewedDevices));
    }
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
