interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
}

export function parseDuration(totalMinutes: number): DurationParts {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const days = Math.floor(rounded / (60 * 24));
  const hours = Math.floor((rounded % (60 * 24)) / 60);
  const minutes = rounded % 60;
  return { days, hours, minutes };
}

/**
 * Human-readable duration.
 *  45    → "45 min"
 *  60    → "1 h"
 *  75    → "1 h 15 min"
 *  120   → "2 h"
 *  135   → "2 h 15 min"
 *  1620  → "1 d 3 h"
 */
export function formatDuration(
  totalMinutes: number,
  opts: { locale?: 'en' | 'fr'; compact?: boolean } = {},
): string {
  const { locale = 'en', compact = false } = opts;
  const { days, hours, minutes } = parseDuration(totalMinutes);

  const dLabel = locale === 'fr' ? 'j' : 'd';
  const hLabel = 'h';
  const minLabel = compact ? 'm' : 'min';

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${dLabel}`);
  if (hours > 0) parts.push(`${hours} ${hLabel}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} ${minLabel}`);

  return parts.length ? parts.join(' ') : '0 min';
}

/** Format an ISO date to HH:mm local string. */
export function formatTimeHHmm(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
