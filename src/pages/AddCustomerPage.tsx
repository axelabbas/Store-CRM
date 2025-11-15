import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { customerSchema, CustomerFormData } from '../types/customer';
import { Button } from '@/components/ui/button';
import { DynamicInput } from '@/components/ui/dynamic-input';
import { DynamicTextarea } from '@/components/ui/dynamic-textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleError } from '../lib/errorHandling';
import { t } from '../lib/translations';

export const AddCustomerPage: React.FC = () => {
  const [dateInput, setDateInput] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const birthday = watch('birthday');

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;

    return new Date(year, month, day);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-digit characters except /
    const digitsOnly = value.replace(/[^\d]/g, '');

    // Auto-format as DD/MM/YYYY
    let formatted = '';

    if (digitsOnly.length > 0) {
      // Add day (max 2 digits)
      formatted = digitsOnly.substring(0, 2);

      if (digitsOnly.length > 2) {
        // Add slash and month
        formatted += '/' + digitsOnly.substring(2, 4);

        if (digitsOnly.length > 4) {
          // Add slash and year
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }

    setDateInput(formatted);

    const parsedDate = parseDateFromInput(formatted);
    if (parsedDate) {
      setValue('birthday', parsedDate, { shouldValidate: true });
    } else {
      setValue('birthday', null as unknown as Date, { shouldValidate: true });
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setValue('birthday', date, { shouldValidate: true });
      setDateInput(formatDateForInput(date));
      setIsCalendarOpen(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitError('');
    setSuccessMessage('');

    try {
      // Validate user is authenticated
      if (!user) {
        setSubmitError('You must be logged in to add customers.');
        return;
      }

      // Store birthday as YYYY-MM-DD format to avoid timezone issues
      const year = data.birthday.getFullYear();
      const month = String(data.birthday.getMonth() + 1).padStart(2, '0');
      const day = String(data.birthday.getDate()).padStart(2, '0');
      const birthdayString = `${year}-${month}-${day}`;

      const now = new Date().toISOString();

      const customerData = {
        ...data,
        birthday: birthdayString,
        createdAt: serverTimestamp(),
        createdBy: {
          email: user.email || 'unknown',
          uid: user.uid,
        },
        history: [
          {
            timestamp: now,
            adminEmail: user.email || 'unknown',
            adminUid: user.uid,
            action: 'created' as const,
          },
        ],
      };

      await addDoc(collection(db, 'customers'), customerData);

      setSuccessMessage('Customer added successfully!');

      // Reset form and navigate after a brief delay
      setTimeout(() => {
        reset();
        setDateInput('');
        navigate('/customers');
      }, 1000);
    } catch (error) {
      const errorDetails = handleError(error);
      setSubmitError(errorDetails.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('Add New Customer')}</CardTitle>
          <CardDescription>
            {t('Fill in the customer information below')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-destructive">{submitError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 text-sm bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/30 rounded-md flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-green-600 dark:text-green-400">{successMessage}</span>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('Full Name')} *</Label>
                <DynamicInput
                  id="fullName"
                  placeholder={t('Full Name Placeholder')}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramHandle">{t('Instagram Handle')} *</Label>
                <DynamicInput
                  id="instagramHandle"
                  placeholder={t('Instagram Handle Placeholder')}
                  {...register('instagramHandle')}
                />
                {errors.instagramHandle && (
                  <p className="text-sm text-destructive">{errors.instagramHandle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">{t('Birthday')} *</Label>
                <div className="flex gap-2">
                  <DynamicInput
                    id="birthday"
                    placeholder="DD/MM/YYYY"
                    value={dateInput}
                    onChange={handleDateInputChange}
                    maxLength={10}
                    className="flex-1"
                  />
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-3"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={birthday}
                        onSelect={handleCalendarSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.birthday && (
                  <p className="text-sm text-destructive">{errors.birthday.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('Type or click calendar')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('Phone Number')}</Label>
                <DynamicInput
                  id="phone"
                  type="tel"
                  placeholder={t('Phone Placeholder')}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">{t('Email Address')}</Label>
                <DynamicInput
                  id="email"
                  type="email"
                  placeholder={t('Email Placeholder')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">{t('Notes')}</Label>
                <DynamicTextarea
                  id="notes"
                  rows={4}
                  placeholder={t('Notes Placeholder')}
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="text-sm text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { reset(); setDateInput(''); }}
              >
                {t('Clear')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('Saving') : t('Save Customer')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};