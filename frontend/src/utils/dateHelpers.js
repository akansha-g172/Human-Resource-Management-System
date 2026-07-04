import { format, parseISO, differenceInDays } from 'date-fns';

export function formatToLocalDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return dateStr;
  }
}

export function formatToHumanDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'MMM dd, yyyy');
  } catch (e) {
    return dateStr;
  }
}

export function formatToTime(dateTimeStr) {
  if (!dateTimeStr) return '--:--';
  try {
    const date = typeof dateTimeStr === 'string' ? parseISO(dateTimeStr) : dateTimeStr;
    return format(date, 'hh:mm a');
  } catch (e) {
    return dateTimeStr;
  }
}

export function formatToDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  try {
    const date = typeof dateTimeStr === 'string' ? parseISO(dateTimeStr) : dateTimeStr;
    return format(date, 'MMM dd, yyyy hh:mm a');
  } catch (e) {
    return dateTimeStr;
  }
}

export function calculateDurationDays(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  try {
    const start = typeof startStr === 'string' ? parseISO(startStr) : startStr;
    const end = typeof endStr === 'string' ? parseISO(endStr) : endStr;
    return differenceInDays(end, start) + 1;
  } catch (e) {
    return 0;
  }
}
