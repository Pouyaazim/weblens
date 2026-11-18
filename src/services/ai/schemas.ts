/**
 * اسکیماهای اعتبارسنجی خروجی AI با Zod.
 * خروجی نامعتبر هرگز باعث خرابی برنامه نمی‌شود؛ در صورت خطا، پاسخ خام نمایش داده می‌شود.
 */
import { z } from 'zod';

export const MetaTitleSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().min(1),
    reason: z.string(),
  })).min(1).max(5),
});

export const MetaDescriptionSchema = z.object({
  suggestions: z.array(z.object({
    description: z.string().min(1),
    reason: z.string(),
  })).min(1).max(5),
});

export const HeadingsSchema = z.object({
  suggestions: z.array(z.object({
    level: z.string(),
    current: z.string(),
    suggested: z.string(),
    reason: z.string(),
  })).max(10),
});

export const ImproveTextSchema = z.object({
  improved: z.string().min(1),
  changes: z.array(z.string()).max(10),
});

export const FaqSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(1).max(10),
});

export const SchemaSuggestionSchema = z.object({
  schemaType: z.string(),
  jsonLd: z.string().min(1),
  explanation: z.string(),
});

export const ExplainIssueSchema = z.object({
  explanation: z.string().min(1),
  steps: z.array(z.string()).min(1).max(10),
});

export const DeepAnalysisSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string()).max(10),
  weaknesses: z.array(z.string()).max(10),
  opportunities: z.array(z.string()).max(10),
});

export const GeoAnalysisSchema = z.object({
  summary: z.string().min(1),
  entityClarity: z.string(),
  directAnswers: z.array(z.string()).max(5),
  suggestions: z.array(z.string()).min(1).max(10),
});

export const ContentStructureSchema = z.object({
  proposedOutline: z.array(z.object({
    heading: z.string(),
    purpose: z.string(),
  })).min(1).max(15),
  explanation: z.string(),
});

export const PrioritizedSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    priority: z.number().int().min(1),
    title: z.string().min(1),
    action: z.string().min(1),
    expectedImpact: z.string(),
  })).min(1).max(10),
});

export const AI_RESPONSE_SCHEMAS = {
  'meta-title': MetaTitleSchema,
  'meta-description': MetaDescriptionSchema,
  'headings': HeadingsSchema,
  'improve-text': ImproveTextSchema,
  'faq': FaqSchema,
  'schema': SchemaSuggestionSchema,
  'explain-issue': ExplainIssueSchema,
  'deep-analysis': DeepAnalysisSchema,
  'geo-analysis': GeoAnalysisSchema,
  'content-structure': ContentStructureSchema,
  'prioritized-suggestions': PrioritizedSuggestionsSchema,
} as const;
