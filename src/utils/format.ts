/** قالب‌بندی اعداد و تاریخ به فارسی (fa-IR). */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function formatNumberFa(value: number): string {
  return toPersianDigits(new Intl.NumberFormat('fa-IR').format(value));
}

export function formatDateFa(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatScore(score: number): string {
  return toPersianDigits(String(Math.round(score)));
}
