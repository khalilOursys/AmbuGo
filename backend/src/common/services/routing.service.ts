import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { formatDuration } from '../utils/time.util';

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  durationHuman: string;
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly baseUrl =
    process.env.OSRM_URL ?? 'https://router.project-osrm.org';

  // simple in-memory cache: 10 min TTL
  private cache = new Map<string, { value: RouteResult; expires: number }>();

  constructor(private readonly http: HttpService) {}

  async getRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<RouteResult | null> {
    const key = `${fromLat},${fromLng}->${toLat},${toLng}`;
    const hit = this.cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;

    try {
      const url =
        `${this.baseUrl}/route/v1/driving/` +
        `${fromLng},${fromLat};${toLng},${toLat}` +
        `?overview=false&alternatives=false`;

      const { data } = await firstValueFrom(this.http.get(url));
      if (!data?.routes?.length) return null;

      const route = data.routes[0];
      const distanceKm = +(route.distance / 1000).toFixed(2);
      const durationMinutes = +(route.duration / 60).toFixed(1);

      const result: RouteResult = {
        distanceKm,
        durationMinutes,
        durationHuman: formatDuration(durationMinutes),
      };

      this.cache.set(key, {
        value: result,
        expires: Date.now() + 10 * 60_000,
      });

      return result;
    } catch (err) {
      this.logger.warn(`OSRM request failed: ${(err as Error).message}`);
      return null;
    }
  }
}
