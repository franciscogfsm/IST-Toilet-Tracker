/**
 * Comprehensive spam protection service for bathroom reviews
 * Handles rate limiting, behavioral analysis, and spam detection
 */

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  confidence: number; // 0-1, higher means more likely spam
  requiresCaptcha: boolean;
}

export interface ReviewSubmissionData {
  bathroomId: string;
  comment?: string | null; // Optional comment field
  userName: string;
  rating: number;
  cleanliness: number;
  privacy: number;
  paperAvailable: boolean;
}

export class SpamProtectionService {
  private static readonly STORAGE_KEY = "spam_protection";
  private static readonly RATE_LIMIT_KEY = "review_submissions";
  private static readonly BEHAVIOR_KEY = "user_behavior";

  // ===== SPAM PROTECTION CONFIGURATION =====
  // Adjust these values to fine-tune spam protection sensitivity

  // Rate limiting configuration
  private static readonly MAX_REVIEWS_PER_HOUR = 5; // Max reviews per hour
  private static readonly MAX_REVIEWS_PER_DAY = 10; // Max reviews per day
  private static readonly MIN_TIME_BETWEEN_REVIEWS = 10000; // Minimum time between reviews (10 seconds)
  // This prevents the "Reviews submitted too quickly" error

  // Behavioral analysis thresholds
  private static readonly SIMILAR_CONTENT_THRESHOLD = 0.98; // Similarity threshold for content (0-1) - Increased to 0.98 to be much less strict
  private static readonly RAPID_SUBMISSION_THRESHOLD = 10000; // Rapid submission threshold (10 seconds)

  // Additional timing configurations
  private static readonly SUBMISSION_HISTORY_RETENTION = 24 * 60 * 60 * 1000; // 24 hours - how long to keep submission history
  private static readonly BEHAVIOR_DATA_RETENTION = 60 * 60 * 1000; // 1 hour - how long to keep behavior data
  private static readonly FINGERPRINT_CHECK_WINDOW = 30 * 60 * 1000; // 30 minutes - fingerprint change detection window

  // ===== END CONFIGURATION =====

  /**
   * Main spam check function
   */
  static async checkForSpam(
    data: ReviewSubmissionData
  ): Promise<SpamCheckResult> {
    const checks = await Promise.all([
      this.checkRateLimit(),
      this.checkBehavioralPatterns(data),
      this.checkContentSpam(data),
      this.checkDeviceAnomalies(),
    ]);

    // Combine results
    const maxConfidence = Math.max(...checks.map((c) => c.confidence));
    const isSpam = checks.some((c) => c.isSpam);
    const requiresCaptcha =
      maxConfidence > 0.6 || checks.some((c) => c.requiresCaptcha);

    // Get the most severe reason
    const reasons = checks.filter((c) => c.reason).map((c) => c.reason!);
    const reason = reasons.length > 0 ? reasons[0] : undefined;

    return {
      isSpam,
      reason,
      confidence: maxConfidence,
      requiresCaptcha,
    };
  }

  /**
   * Check rate limiting based on submission frequency
   */
  private static async checkRateLimit(): Promise<SpamCheckResult> {
    const now = Date.now();
    const submissions = this.getStoredSubmissions();

    // Clean old submissions FIRST (before checking limits)
    const recentSubmissions = submissions.filter(
      (sub) => now - sub.timestamp < this.SUBMISSION_HISTORY_RETENTION
    );

    // Update storage with cleaned data
    if (recentSubmissions.length !== submissions.length) {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${this.RATE_LIMIT_KEY}`,
        JSON.stringify(recentSubmissions)
      );
    }

    // Check hourly limit
    const hourAgo = now - 60 * 60 * 1000;
    const hourlySubmissions = recentSubmissions.filter(
      (sub) => sub.timestamp > hourAgo
    );

    // Check daily limit
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const dailySubmissions = recentSubmissions.filter(
      (sub) => sub.timestamp > dayAgo
    );

    // Check minimum time between reviews
    const lastSubmission = recentSubmissions[recentSubmissions.length - 1];
    const timeSinceLast = lastSubmission
      ? now - lastSubmission.timestamp
      : Infinity;

    let isSpam = false;
    let confidence = 0;
    let reason: string | undefined;

    if (hourlySubmissions.length >= this.MAX_REVIEWS_PER_HOUR) {
      isSpam = true;
      confidence = 0.9;
      reason = "Too many reviews in the last hour";
    } else if (dailySubmissions.length >= this.MAX_REVIEWS_PER_DAY) {
      isSpam = true;
      confidence = 0.8;
      reason = "Too many reviews in the last 24 hours";
    } else if (timeSinceLast < this.MIN_TIME_BETWEEN_REVIEWS) {
      isSpam = true;
      confidence = 0.7;
      reason = "Reviews submitted too quickly";
    } else if (hourlySubmissions.length >= 3) {
      confidence = 0.5;
      reason = "High submission frequency detected";
    }

    // Store current submission timestamp
    this.storeSubmission(now);

    return {
      isSpam,
      reason,
      confidence,
      requiresCaptcha: confidence > 0.4,
    };
  }

  /**
   * Check for suspicious behavioral patterns
   */
  private static async checkBehavioralPatterns(
    data: ReviewSubmissionData
  ): Promise<SpamCheckResult> {
    const behavior = this.getStoredBehavior();
    const now = Date.now();

    // Clean up old behavior data - filter by time, not just count
    const cleanedBehavior = {
      submissions: behavior.submissions.filter(
        (sub) => now - sub.timestamp < this.BEHAVIOR_DATA_RETENTION
      ),
      recentComments: behavior.recentComments
        .filter((_, index) => {
          // Keep only comments from recent submissions (last 10 that are within time window)
          const correspondingSubmission = behavior.submissions[index];
          return (
            correspondingSubmission &&
            now - correspondingSubmission.timestamp <
              this.BEHAVIOR_DATA_RETENTION
          );
        })
        .filter((comment) => comment !== null && comment !== undefined) // Filter out null/undefined
        .slice(-10), // Keep last 10 recent comments
      recentRatings: behavior.recentRatings
        .filter((_, index) => {
          // Keep only ratings from recent submissions (last 10 that are within time window)
          const correspondingSubmission = behavior.submissions[index];
          return (
            correspondingSubmission &&
            now - correspondingSubmission.timestamp <
              this.BEHAVIOR_DATA_RETENTION
          );
        })
        .slice(-10), // Keep last 10 recent ratings
    };

    // Update storage with cleaned data
    const hasChanges =
      cleanedBehavior.submissions.length !== behavior.submissions.length ||
      cleanedBehavior.recentComments.length !==
        behavior.recentComments.length ||
      cleanedBehavior.recentRatings.length !== behavior.recentRatings.length;

    if (hasChanges) {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${this.BEHAVIOR_KEY}`,
        JSON.stringify(cleanedBehavior)
      );
    }

    // Check for rapid submissions (separate from rate limiting)
    const isRapidSubmission =
      cleanedBehavior.submissions.length > 0 &&
      now -
        cleanedBehavior.submissions[cleanedBehavior.submissions.length - 1]
          .timestamp <
        this.RAPID_SUBMISSION_THRESHOLD;

    // Check for similar content patterns
    const similarContent = this.checkSimilarContent(
      data.comment,
      cleanedBehavior.recentComments
    );

    // Check for pattern in ratings
    const ratingPattern = this.checkRatingPatterns(
      data,
      cleanedBehavior.recentRatings
    );

    let confidence = 0;
    let reason: string | undefined;

    if (isRapidSubmission) {
      confidence = Math.max(confidence, 0.8);
      reason = "Rapid submission detected";
    }

    if (similarContent > this.SIMILAR_CONTENT_THRESHOLD) {
      confidence = Math.max(confidence, 0.7);
      reason = `Similar content to recent reviews (${(
        similarContent * 100
      ).toFixed(1)}% match)`;
    }

    if (ratingPattern.isSuspicious) {
      confidence = Math.max(confidence, ratingPattern.confidence);
      reason = ratingPattern.reason;
    }

    // Update behavior tracking with new data
    this.updateBehavior(data, now);

    return {
      isSpam: confidence > 0.6,
      reason,
      confidence,
      requiresCaptcha: confidence > 0.4,
    };
  }

  /**
   * Check review content for spam patterns
   */
  private static async checkContentSpam(
    data: ReviewSubmissionData
  ): Promise<SpamCheckResult> {
    const comment = data.comment ? data.comment.toLowerCase().trim() : "";
    const userName = data.userName.toLowerCase();

    let spamScore = 0;
    let reasons: string[] = [];

    // Skip content analysis if no comment
    if (!comment || comment.length === 0) {
      return {
        isSpam: false,
        reason: undefined,
        confidence: 0,
        requiresCaptcha: false,
      };
    }

    // Check for excessive repetition
    if (this.hasExcessiveRepetition(comment)) {
      spamScore += 0.3;
      reasons.push("Excessive character repetition");
    }

    // Check for spam keywords
    const spamKeywords = [
      "http",
      "www",
      "buy",
      "sell",
      "promo",
      "discount",
      "free",
      "win",
      "prize",
    ];
    const hasSpamKeywords = spamKeywords.some((keyword) =>
      comment.includes(keyword)
    );
    if (hasSpamKeywords) {
      spamScore += 0.4;
      reasons.push("Contains spam keywords");
    }

    // Check for suspicious username patterns
    if (this.isSuspiciousUsername(userName)) {
      spamScore += 0.2;
      reasons.push("Suspicious username pattern");
    }

    // Check for very short or very long comments
    if (comment.length < 5) {
      spamScore += 0.1;
      reasons.push("Comment too short");
    } else if (comment.length > 500) {
      spamScore += 0.2;
      reasons.push("Comment too long");
    }

    // Check for all caps
    const capsRatio = (comment.match(/[A-Z]/g) || []).length / comment.length;
    if (capsRatio > 0.8 && comment.length > 10) {
      spamScore += 0.2;
      reasons.push("Excessive use of capital letters");
    }

    return {
      isSpam: spamScore > 0.5,
      reason: reasons.length > 0 ? reasons[0] : undefined,
      confidence: Math.min(spamScore, 1),
      requiresCaptcha: spamScore > 0.3,
    };
  }

  /**
   * Check for device anomalies that might indicate anonymous browser usage
   */
  private static async checkDeviceAnomalies(): Promise<SpamCheckResult> {
    const fingerprint = this.getEnhancedFingerprint();
    const storedFingerprints = this.getStoredFingerprints();

    // Check if fingerprint has changed recently (might indicate incognito mode)
    const recentFingerprintChange = this.detectFingerprintChange(
      fingerprint,
      storedFingerprints
    );

    // Check for inconsistent browser properties
    const browserInconsistency = this.detectBrowserInconsistency();

    let confidence = 0;
    let reason: string | undefined;

    if (recentFingerprintChange) {
      confidence = 0.6;
      reason = "Device fingerprint changed recently";
    }

    if (browserInconsistency) {
      confidence = Math.max(confidence, 0.5);
      reason = "Browser properties inconsistent";
    }

    // Store current fingerprint
    this.storeFingerprint(fingerprint);

    return {
      isSpam: confidence > 0.7,
      reason,
      confidence,
      requiresCaptcha: confidence > 0.4,
    };
  }

  // Helper methods

  private static getStoredSubmissions(): Array<{ timestamp: number }> {
    try {
      const stored = localStorage.getItem(
        `${this.STORAGE_KEY}_${this.RATE_LIMIT_KEY}`
      );
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static storeSubmission(timestamp: number): void {
    try {
      const submissions = this.getStoredSubmissions();
      submissions.push({ timestamp });

      // Keep only recent submissions
      const recent = submissions.filter(
        (sub) => Date.now() - sub.timestamp < this.SUBMISSION_HISTORY_RETENTION
      );

      localStorage.setItem(
        `${this.STORAGE_KEY}_${this.RATE_LIMIT_KEY}`,
        JSON.stringify(recent)
      );
    } catch (error) {
      console.warn("Failed to store submission data:", error);
    }
  }

  private static getStoredBehavior() {
    try {
      const stored = localStorage.getItem(
        `${this.STORAGE_KEY}_${this.BEHAVIOR_KEY}`
      );
      return stored
        ? JSON.parse(stored)
        : { submissions: [], recentComments: [], recentRatings: [] };
    } catch {
      return { submissions: [], recentComments: [], recentRatings: [] };
    }
  }

  private static updateBehavior(
    data: ReviewSubmissionData,
    timestamp: number
  ): void {
    try {
      const behavior = this.getStoredBehavior();

      behavior.submissions.push({ timestamp });

      // Handle null/undefined comments by storing empty string
      const commentToStore =
        data.comment && data.comment.trim() ? data.comment.trim() : "";
      behavior.recentComments.push(commentToStore);

      behavior.recentRatings.push({
        rating: data.rating,
        cleanliness: data.cleanliness,
        privacy: data.privacy,
      });

      // Clean up old data based on time retention
      const now = Date.now();
      behavior.submissions = behavior.submissions.filter(
        (sub) => now - sub.timestamp < this.BEHAVIOR_DATA_RETENTION
      );
      behavior.recentComments = behavior.recentComments.slice(-10); // Keep last 10 comments
      behavior.recentRatings = behavior.recentRatings.slice(-10); // Keep last 10 ratings

      localStorage.setItem(
        `${this.STORAGE_KEY}_${this.BEHAVIOR_KEY}`,
        JSON.stringify(behavior)
      );
    } catch (error) {
      console.warn("Failed to update behavior data:", error);
    }
  }

  private static checkSimilarContent(
    newComment: string | null | undefined,
    recentComments: (string | null | undefined)[]
  ): number {
    // If new comment is null, undefined, or empty, don't check similarity
    if (!newComment || newComment.trim().length === 0) return 0;

    // Filter out null, undefined, or empty comments from recent comments
    const validRecentComments = recentComments.filter(
      (comment) => comment && comment.trim().length > 0
    );

    if (validRecentComments.length === 0) return 0;

    // Don't check similarity for very short comments (less than 10 characters)
    if (newComment.trim().length < 10) return 0;

    const similarities = validRecentComments
      .filter((comment) => comment!.trim().length >= 10) // Only compare with reasonably long comments
      .map((comment) =>
        this.calculateSimilarity(newComment.trim(), comment!.trim())
      );

    if (similarities.length === 0) return 0;

    return Math.max(...similarities);
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Handle empty strings
    if (!str1 || !str2 || str1.length === 0 || str2.length === 0) {
      return str1 === str2 ? 1.0 : 0.0;
    }

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static checkRatingPatterns(
    data: ReviewSubmissionData,
    recentRatings: any[]
  ): { isSuspicious: boolean; confidence: number; reason?: string } {
    if (recentRatings.length < 2) return { isSuspicious: false, confidence: 0 };

    // Check for identical ratings
    const identicalRatings = recentRatings.filter(
      (r) =>
        r.rating === data.rating &&
        r.cleanliness === data.cleanliness &&
        r.privacy === data.privacy
    );

    if (identicalRatings.length >= 2) {
      return {
        isSuspicious: true,
        confidence: 0.6,
        reason: "Identical ratings pattern detected",
      };
    }

    // Check for perfect ratings (all 5s)
    const perfectRatings = recentRatings.filter(
      (r) => r.rating === 5 && r.cleanliness === 5 && r.privacy === 5
    );

    if (perfectRatings.length >= 3) {
      return {
        isSuspicious: true,
        confidence: 0.5,
        reason: "Multiple perfect ratings detected",
      };
    }

    return { isSuspicious: false, confidence: 0 };
  }

  private static hasExcessiveRepetition(text: string): boolean {
    if (!text || text.length === 0) return false;

    // Check for repeated characters
    const repeatedChars = /(.)\1{4,}/.test(text);
    // Check for repeated words
    const repeatedWords = /(\b\w+\b)(\s+\1){2,}/.test(text);

    return repeatedChars || repeatedWords;
  }

  private static isSuspiciousUsername(username: string): boolean {
    // Check for usernames that look like spam
    const spamPatterns = [
      /^\d+$/, // Only numbers
      /^[a-zA-Z]\d{3,}$/, // Letter followed by numbers
      /(.)\1{2,}/, // Repeated characters
      /test|spam|fake|bot/i,
    ];

    return spamPatterns.some((pattern) => pattern.test(username));
  }

  private static getEnhancedFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.hardwareConcurrency || "unknown",
      (navigator as any).deviceMemory || "unknown",
      this.getCanvasFingerprint(),
      this.getWebGLFingerprint(),
      this.getAudioFingerprint(),
    ];

    return this.simpleHash(components.join("|"));
  }

  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "no-canvas";

      ctx.textBaseline = "top";
      ctx.font = "16px Arial";
      ctx.fillText("SpamProtection", 2, 2);

      return canvas.toDataURL();
    } catch {
      return "canvas-error";
    }
  }

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
    } catch {
      return "webgl-error";
    }
  }

  private static getAudioFingerprint(): string {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      oscillator.connect(analyser);
      analyser.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      oscillator.start();
      analyser.getByteFrequencyData(dataArray);
      oscillator.stop();

      return Array.from(dataArray.slice(0, 10)).join(",");
    } catch {
      return "audio-error";
    }
  }

  private static getStoredFingerprints(): Array<{
    fingerprint: string;
    timestamp: number;
  }> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_fingerprints`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static storeFingerprint(fingerprint: string): void {
    try {
      const fingerprints = this.getStoredFingerprints();
      fingerprints.push({ fingerprint, timestamp: Date.now() });

      // Keep only recent fingerprints (last 10)
      const recent = fingerprints.slice(-10);

      localStorage.setItem(
        `${this.STORAGE_KEY}_fingerprints`,
        JSON.stringify(recent)
      );
    } catch (error) {
      console.warn("Failed to store fingerprint:", error);
    }
  }

  private static detectFingerprintChange(
    currentFingerprint: string,
    storedFingerprints: Array<{ fingerprint: string; timestamp: number }>
  ): boolean {
    if (storedFingerprints.length < 2) return false;

    const recentFingerprints = storedFingerprints.filter(
      (f) => Date.now() - f.timestamp < this.FINGERPRINT_CHECK_WINDOW
    ); // Last 30 minutes

    // Check if fingerprint changed more than once in recent history
    const uniqueFingerprints = [
      ...new Set(recentFingerprints.map((f) => f.fingerprint)),
    ];

    return uniqueFingerprints.length > 2; // More than 2 different fingerprints recently
  }

  private static detectBrowserInconsistency(): boolean {
    // Check for common signs of incognito/private browsing
    const checks = [
      // Check if localStorage is available and persistent
      typeof localStorage !== "undefined",
      // Check if indexedDB is available
      typeof indexedDB !== "undefined",
    ];

    // If some features are missing, might be incognito mode
    return checks.includes(false);
  }

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
   * Clear all spam protection data (for testing)
   */
  static clearAllData(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.STORAGE_KEY)
    );

    keys.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Clear only behavioral analysis data (for testing similar content issues)
   */
  static clearBehavioralData(): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${this.BEHAVIOR_KEY}`);
  }

  /**
   * Temporarily disable similar content checking (for testing)
   */
  static disableSimilarContentCheck(): void {
    (this as any).SIMILAR_CONTENT_THRESHOLD = 1.0; // Set to 100% - nothing will match
  }

  /**
   * Re-enable similar content checking with default threshold
   */
  static enableSimilarContentCheck(): void {
    (this as any).SIMILAR_CONTENT_THRESHOLD = 0.98;
  }

  /**
   * Debug method to check current spam protection state
   */
  static debugState(): {
    rateLimitData: Array<{ timestamp: number }>;
    behaviorData: any;
    hourlyCount: number;
    dailyCount: number;
    timeUntilNextAllowed: number;
    recentComments: string[];
    similarContentThreshold: number;
    commentLengths: number[];
  } {
    const now = Date.now();
    const submissions = this.getStoredSubmissions();
    const behavior = this.getStoredBehavior();

    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const hourlySubmissions = submissions.filter(
      (sub) => sub.timestamp > hourAgo
    );
    const dailySubmissions = submissions.filter(
      (sub) => sub.timestamp > dayAgo
    );

    const lastSubmission = submissions[submissions.length - 1];
    const timeSinceLast = lastSubmission
      ? now - lastSubmission.timestamp
      : Infinity;
    const timeUntilNextAllowed = Math.max(
      0,
      this.MIN_TIME_BETWEEN_REVIEWS - timeSinceLast
    );

    return {
      rateLimitData: submissions,
      behaviorData: behavior,
      hourlyCount: hourlySubmissions.length,
      dailyCount: dailySubmissions.length,
      timeUntilNextAllowed,
      recentComments: (behavior.recentComments || []).map(
        (c) => c || "[no comment]"
      ),
      similarContentThreshold: this.SIMILAR_CONTENT_THRESHOLD,
      commentLengths: (behavior.recentComments || []).map(
        (c) => (c || "").length
      ),
    };
  }
}
