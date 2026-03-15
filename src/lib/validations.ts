import { z } from 'zod'

export const leadFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
  city: z.string().max(100, 'City name is too long').optional().or(z.literal('')),
  customerType: z.enum(['residential', 'commercial']).optional().or(z.literal('')),
  serviceRequested: z.string().max(100, 'Service selection is too long').optional().or(z.literal('')),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional().or(z.literal('')),
  sourcePage: z.string().max(255),
  // Honeypot field - should always be empty
  website: z.string().max(0, 'Spam detected').optional(),
})

export type LeadFormData = z.infer<typeof leadFormSchema>

export const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  rating: z.number().min(1).max(5),
  text: z.string().min(10).max(1000),
  location: z.string().max(100).optional(),
  published: z.boolean().default(false),
})

export type TestimonialData = z.infer<typeof testimonialSchema>

export const promoSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  code: z.string().max(50).optional(),
  expiresAt: z.string().optional(),
  published: z.boolean().default(false),
  sortOrder: z.number().default(0),
})

export type PromoData = z.infer<typeof promoSchema>

export const serviceAreaSchema = z.object({
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  slug: z.string().min(2).max(100),
  intro: z.string().min(50).max(2000),
  highlightsJson: z.string().default('[]'),
  faqsJson: z.string().default('[]'),
  published: z.boolean().default(false),
})

export type ServiceAreaData = z.infer<typeof serviceAreaSchema>

export const serviceSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  excerpt: z.string().min(20).max(300),
  contentHtml: z.string().min(100),
  faqsJson: z.string().default('[]'),
  iconName: z.string().default('Zap'),
  published: z.boolean().default(false),
  sortOrder: z.number().default(0),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
})

export type ServiceData = z.infer<typeof serviceSchema>

export const siteConfigSchema = z.object({
  businessName: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  email: z.string().email().max(255),
  primaryArea: z.string().max(100),
  citiesServed: z.string(), // JSON string
  hours: z.string().max(200),
  emergencyEnabled: z.boolean(),
  licenseNumber: z.string().max(50),
  googleReviewUrl: z.string().max(500),
  address: z.string().max(300),
  tagline: z.string().max(200),
  aboutText: z.string().max(5000),
})

export type SiteConfigFormData = z.infer<typeof siteConfigSchema>

export interface FAQ {
  question: string
  answer: string
}

export interface ServiceHighlight {
  title: string
  description: string
}
