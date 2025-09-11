import { LocationState } from "@/types";

export class LocationService {
  private static instance: LocationService;

  // IST Campus coordinates and bounds
  private readonly IST_CENTER: [number, number] = [38.7369, -9.1395];
  private readonly IST_BOUNDS: [[number, number], [number, number]] = [
    [38.734, -9.143],
    [38.74, -9.136],
  ];
  private readonly TOLERANCE = 0.005; // ~500m radius around campus bounds

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocation(): Promise<LocationState> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          userLocation: null,
          isNearIST: false,
          locationStatus: "denied",
        });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({
          userLocation: null,
          isNearIST: false,
          locationStatus: "denied",
        });
      }, 12000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          const { latitude, longitude } = pos.coords;
          const near = this.isNearIST(latitude, longitude);

          resolve({
            userLocation: [latitude, longitude],
            isNearIST: near,
            locationStatus: near ? "enabled" : "far",
          });
        },
        () => {
          clearTimeout(timeout);
          resolve({
            userLocation: null,
            isNearIST: false,
            locationStatus: "denied",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  isNearIST(latitude: number, longitude: number): boolean {
    return (
      latitude >= this.IST_BOUNDS[0][0] - this.TOLERANCE &&
      latitude <= this.IST_BOUNDS[1][0] + this.TOLERANCE &&
      longitude >= this.IST_BOUNDS[0][1] - this.TOLERANCE &&
      longitude <= this.IST_BOUNDS[1][1] + this.TOLERANCE
    );
  }

  convertToRealCoords(x: number, y: number): [number, number] {
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    const lat =
      this.IST_BOUNDS[1][0] -
      (clampedY / 100) * (this.IST_BOUNDS[1][0] - this.IST_BOUNDS[0][0]);

    const lng =
      this.IST_BOUNDS[0][1] +
      (clampedX / 100) * (this.IST_BOUNDS[1][1] - this.IST_BOUNDS[0][1]);

    return [lat, lng];
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  checkGeolocationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if ("permissions" in navigator && navigator.permissions?.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((res) => {
            resolve(res.state === "granted");
          })
          .catch(() => resolve(false));
      } else {
        resolve(false);
      }
    });
  }
}
