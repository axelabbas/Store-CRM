import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  instagramHandle: z.string().min(1, 'Instagram handle is required'),
  birthday: z.date({ message: 'Birthday is required. Please enter a valid date in DD/MM/YYYY format.' }),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export interface HistoryEntry {
  timestamp: string;
  adminEmail: string;
  adminUid: string;
  action: 'created' | 'edited';
  changes?: {
    field: string;
    oldValue: string | undefined;
    newValue: string | undefined;
  }[];
}

export interface Customer extends CustomerFormData {
  id?: string;
  createdAt?: string;
  createdBy?: {
    email: string;
    uid: string;
  };
  history?: HistoryEntry[];
}