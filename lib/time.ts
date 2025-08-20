// lib/time.ts

export function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;

  const normalizedTime = time.toUpperCase().trim();

  const is12HourFormat =
    normalizedTime.includes('AM') || normalizedTime.includes('PM');

  const [timePart, period] = normalizedTime.split(' ');

  if (!timePart) {
    console.error(
      `Invalid time format: "${time}". Expected "HH:MM" or "HH:MM AM/PM".`
    );
    return null;
  }

  const [hoursStr, minutesStr] = timePart.split(':');

  if (!hoursStr || !minutesStr) {
    console.error(
      `Invalid time format: "${time}". Expected "HH:MM" or "HH:MM AM/PM".`
    );
    return null;
  }

  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Validate hours and minutes
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 || // Allow 0 for 24-hour format
    hours > (is12HourFormat ? 12 : 23) ||
    minutes < 0 ||
    minutes > 59
  ) {
    console.error(
      `Invalid time values: "${time}". Expected "HH:MM" or "HH:MM AM/PM".`
    );
    return null;
  }

  // Additional validation for 12-hour format
  if (is12HourFormat && (hours < 1 || hours > 12)) {
    console.error(
      `Invalid hour for 12-hour format: "${time}". Expected hour between 1 and 12.`
    );
    return null;
  }

  if (is12HourFormat) {
    if (period === 'PM' && hours !== 12) {
      hours += 12; // Convert to 24-hour format (e.g., 1 PM -> 13)
    } else if (period === 'AM' && hours === 12) {
      hours = 0; // 12 AM -> 0
    }
  }

  return hours * 60 + minutes;
}

export function formatTime(
  hours: number,
  minutes: number,
  timeFormat: '12h' | '24h' = '24h'
): string {
  hours = hours % 24;

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    console.error(
      `Invalid time values: hours=${hours}, minutes=${minutes}`
    );
    return 'Invalid Time';
  }

  if (timeFormat === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedHours = String(adjustedHours).padStart(2, '0');
    return `${formattedHours}:${String(minutes).padStart(
      2,
      '0'
    )} ${period}`;
  } else {
    return `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}`;
  }
}
