import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  instagramHandle: z.string().min(1, 'Instagram handle is required'),
  birthday: z.date(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export interface Customer extends CustomerFormData {
  id?: string;
  createdAt?: string;
}