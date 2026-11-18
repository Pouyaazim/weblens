/** تایپ‌های لایه هوش مصنوعی (OpenRouter). */

export interface AiSettings {
  enabled: boolean;
  apiKey: string;
  model: string;
  fallbackModel: string;
  /** زبان پاسخ‌های AI */
  language: 'fa' | 'en';
}

export interface AiModelInfo {
  id: string;
  name: string;
  isFree: boolean;
  contextLength: number | null;
}

export type AiTask =
  | 'meta-title'
  | 'meta-description'
  | 'headings'
  | 'improve-text'
  | 'faq'
  | 'schema'
  | 'explain-issue'
  | 'deep-analysis'
  | 'geo-analysis'
  | 'content-structure'
  | 'prioritized-suggestions';

export interface AiRequest {
  task: AiTask;
  /** داده‌های ورودی هر تسک (متن، عنوان و...) */
  payload: Record<string, string>;
}

export interface AiResult {
  task: AiTask;
  model: string;
  content: string;
  structured: unknown;
  createdAt: string;
}

export type AiErrorCode =
  | 'missing-key'
  | 'invalid-key'
  | 'rate-limit'
  | 'timeout'
  | 'model-not-found'
  | 'network'
  | 'invalid-response'
  | 'unknown';

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = 'AiError';
    this.code = code;
  }
}
