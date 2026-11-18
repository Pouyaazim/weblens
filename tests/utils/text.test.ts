import { describe, it, expect } from 'vitest';
import { normalizePersian, countWords, detectLanguage, extractQuestions, truncate } from '@/utils/text';
import { toPersianDigits, formatNumberFa } from '@/utils/format';

describe('Persian Text Utils', () => {
  it('حروف عربی را به فارسی تبدیل می‌کند', () => {
    expect(normalizePersian('اين كتاب')).toBe('این کتاب');
  });

  it('نیم‌فاصله را نرمال می‌کند', () => {
    expect(normalizePersian('می‌شود')).toBe('می شود');
  });

  it('کلمات فارسی، انگلیسی و ترکیبی را می‌شمارد', () => {
    expect(countWords('سلام دنیا hello world')).toBe(4);
    expect(countWords('')).toBe(0);
  });

  it('زبان متن را تشخیص می‌دهد', () => {
    expect(detectLanguage('این یک متن فارسی است')).toBe('fa');
    expect(detectLanguage('This is English text')).toBe('en');
    expect(detectLanguage('12345')).toBe('unknown');
  });

  it('جمله‌های پرسشی را استخراج می‌کند', () => {
    const qs = extractQuestions('سئو چیست؟ سئو بهینه‌سازی است. چرا مهم است؟');
    expect(qs).toHaveLength(2);
  });

  it('متن را برش می‌دهد', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('اعداد را به فارسی تبدیل می‌کند', () => {
    expect(toPersianDigits('123')).toBe('۱۲۳');
    expect(formatNumberFa(1000)).toContain('۱');
  });
});
