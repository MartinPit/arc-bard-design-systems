function getLocales() {
  if (typeof navigator !== 'undefined') {
    if (navigator.languages?.length) return [...navigator.languages];
    if (navigator.language) return [navigator.language];
  }

  const documentLanguage = typeof document !== 'undefined' ? document.documentElement.lang : '';
  return documentLanguage ? [documentLanguage] : undefined;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(getLocales(), options).format(value);
}

function toDate(value: string | number | Date) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function formatDate(value: string | number | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat(getLocales(), options).format(toDate(value));
}

export function formatRelativeTime(value: string | number | Date) {
  const seconds = (toDate(value).getTime() - Date.now()) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [['day', 86_400], ['hour', 3_600], ['minute', 60]];
  const [unit, divisor] = units.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ['second', 1];
  return new Intl.RelativeTimeFormat(getLocales(), { numeric: 'auto' }).format(Math.round(seconds / divisor), unit);
}

export function formatTime(value: string | number | Date) {
  return new Intl.DateTimeFormat(getLocales(), { hour: '2-digit', minute: '2-digit' }).format(toDate(value));
}

export function formatLedgerNumber(value: number) {
  return formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
}

export function formatYear(value: number) {
  return formatNumber(value, { useGrouping: false });
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat(getLocales(), { style: 'percent', maximumFractionDigits: 3 }).format(value / 100);
}

export function formatUnit(value: number, unit = '') {
  if (!unit) return formatNumber(value);
  if (unit === '%') return formatPercent(value);
  return `${formatNumber(value)}\u00a0${unit}`;
}
