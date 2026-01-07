import { z } from 'zod';

// Strong password schema: min 10 chars, upper/lowercase, number, symbol
export const strongPasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

// Invoice validation schemas
export const invoiceNumberSchema = z
  .string()
  .trim()
  .min(1, 'Invoice number is required')
  .max(50, 'Invoice number must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\-_\/]+$/, 'Invoice number can only contain letters, numbers, hyphens, underscores, and slashes');

export const beneficiarySchema = z
  .string()
  .trim()
  .min(1, 'Beneficiary is required')
  .max(200, 'Beneficiary must be less than 200 characters');

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(999999999999, 'Amount is too large');

export const containerNumberSchema = z
  .string()
  .trim()
  .max(30, 'Container number must be less than 30 characters')
  .regex(/^[a-zA-Z0-9\-]*$/, 'Container number can only contain letters, numbers, and hyphens')
  .optional()
  .or(z.literal(''));

export const bankNameSchema = z
  .string()
  .trim()
  .min(1, 'Bank name is required')
  .max(100, 'Bank name must be less than 100 characters');

export const dashboardNameSchema = z
  .string()
  .trim()
  .min(1, 'Dashboard name is required')
  .max(100, 'Dashboard name must be less than 100 characters');

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

// Sanitize string to prevent XSS
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize invoice data
export const validateInvoiceData = (data: {
  invoiceNumber: string;
  beneficiary: string;
  amount: number;
  bank: string;
  containerNumber?: string;
}) => {
  return z.object({
    invoiceNumber: invoiceNumberSchema,
    beneficiary: beneficiarySchema,
    amount: amountSchema,
    bank: bankNameSchema,
    containerNumber: containerNumberSchema,
  }).parse(data);
};

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
};
