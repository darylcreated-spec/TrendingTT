/**
 * Date and Time Utility Functions for Trending TT
 * Ensures all timestamps are formatted in Trinidad & Tobago AST timezone (America/Port_of_Spain)
 */

const TT_TIMEZONE = 'America/Port_of_Spain';

/**
 * Formats an ISO date string into a complete readable date & time string in AST timezone.
 * Example output: "Oct 11, 2026 • 7:45 PM AST"
 */
export function formatPostDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    const datePart = date.toLocaleDateString('en-US', {
      timeZone: TT_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const timePart = date.toLocaleTimeString('en-US', {
      timeZone: TT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${datePart} • ${timePart} AST`;
  } catch {
    return 'Recently';
  }
}

/**
 * Formats an ISO date string into a short date in AST timezone.
 * Example output: "Oct 11, 2026"
 */
export function formatPostDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      timeZone: TT_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

/**
 * Formats an ISO date string into a time-only string with AST suffix.
 * Example output: "7:45 PM AST"
 */
export function formatPostTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      timeZone: TT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' AST';
  } catch {
    return '';
  }
}

/**
 * Formats relative time (e.g., "Just now", "5m ago", "2h ago", "3d ago").
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const diff = Math.max(0, Date.now() - date.getTime());
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatPostDateOnly(isoString);
  } catch {
    return '';
  }
}

/**
 * Formats full timestamp with relative badge combined.
 * Example output: "Oct 11, 2026 • 7:45 PM AST (15m ago)"
 */
export function formatFullTimestampWithRelative(isoString: string): string {
  const dateTime = formatPostDateTime(isoString);
  const relative = formatRelativeTime(isoString);
  return `${dateTime} (${relative})`;
}

/**
 * Formats current system time in Trinidad and Tobago AST timezone.
 */
export function formatCurrentASTDateTime(): { dateStr: string; timeStr: string } {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      timeZone: TT_TIMEZONE,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      timeZone: TT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return {
      dateStr,
      timeStr: `${timeStr} AST`
    };
  } catch {
    return { dateStr: '', timeStr: 'AST' };
  }
}

/**
 * Returns current timestamp formatted in AST.
 */
export function getCurrentASTTime(): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: TT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' AST';
  } catch {
    return 'AST';
  }
}
