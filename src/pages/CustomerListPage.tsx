import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer, HistoryEntry } from '../types/customer';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicInput } from '@/components/ui/dynamic-input';
import { DynamicTextarea } from '@/components/ui/dynamic-textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Search, Pencil, History, CalendarIcon, AlertCircle, Download } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import { handleError } from '../lib/errorHandling';
import { t } from '../lib/translations';
import { exportCustomersToCSV } from '../lib/csvExport';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<Customer | null>(null);
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [editError, setEditError] = useState('');
  const { user } = useAuth();
  const [editForm, setEditForm] = useState({
    fullName: '',
    instagramHandle: '',
    birthday: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customersData.push({
          id: doc.id,
          ...doc.data(),
        } as Customer);
      });
      setCustomers(customersData);
      setLoading(false);
      setError(''); // Clear any previous errors
    }, (error) => {
      const errorDetails = handleError(error);
      setError(errorDetails.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(searchLower) ||
      customer.instagramHandle.toLowerCase().includes(searchLower)
    );
  });

  const formatBirthday = (birthday: string | Date) => {
    try {
      const date = typeof birthday === 'string' ? parseISO(birthday) : birthday;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Invalid date';
    }
  };

  const formatCreatedAt = (createdAt: unknown) => {
    if (!createdAt) return 'Unknown';
    try {
      if (typeof createdAt === 'object' && createdAt !== null && 'toDate' in createdAt) {
        return format((createdAt as { toDate: () => Date }).toDate(), 'MMM dd, yyyy');
      }
      return format(new Date(createdAt as string), 'MMM dd, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    setDeleteError('');

    try {
      if (!customerToDelete.id) {
        throw new Error('Customer ID is missing');
      }

      await deleteDoc(doc(db, 'customers', customerToDelete.id));
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      const errorDetails = handleError(error);
      setDeleteError(errorDetails.message);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditError('');
    setCustomerToEdit(customer);
    setEditForm({
      fullName: customer.fullName,
      instagramHandle: customer.instagramHandle,
      birthday: formatBirthday(customer.birthday),
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditBirthdayChange = (value: string) => {
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

    setEditForm({ ...editForm, birthday: formatted });
  };

  const handleEditCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      setEditForm({ ...editForm, birthday: formatted });
      setEditCalendarOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!customerToEdit) return;

    setEditError('');

    try {
      // Validate required fields
      if (!editForm.fullName.trim()) {
        setEditError('Full name is required.');
        return;
      }

      if (!editForm.instagramHandle.trim()) {
        setEditError('Instagram handle is required.');
        return;
      }

      if (!editForm.birthday.trim()) {
        setEditError('Birthday is required.');
        return;
      }

      // Validate birthday format
      const parts = editForm.birthday.split('/');
      if (parts.length !== 3) {
        setEditError('Please enter birthday in DD/MM/YYYY format.');
        return;
      }

      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        setEditError('Invalid birthday date.');
        return;
      }

      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
        setEditError('Please enter a valid birthday date.');
        return;
      }

      // Parse birthday from DD/MM/YYYY to YYYY-MM-DD
      const birthdayString = `${parts[2]}-${parts[1]}-${parts[0]}`;

      // Detect changes
      const changes: { field: string; oldValue: string | undefined; newValue: string | undefined }[] = [];

      if (editForm.fullName !== customerToEdit.fullName) {
        changes.push({
          field: 'Full Name',
          oldValue: customerToEdit.fullName,
          newValue: editForm.fullName,
        });
      }

      if (editForm.instagramHandle !== customerToEdit.instagramHandle) {
        changes.push({
          field: 'Instagram Handle',
          oldValue: customerToEdit.instagramHandle,
          newValue: editForm.instagramHandle,
        });
      }

      const oldBirthdayString = typeof customerToEdit.birthday === 'string'
        ? customerToEdit.birthday
        : customerToEdit.birthday.toISOString().split('T')[0];

      if (birthdayString !== oldBirthdayString) {
        changes.push({
          field: 'Birthday',
          oldValue: oldBirthdayString,
          newValue: birthdayString,
        });
      }

      if (editForm.phone !== (customerToEdit.phone || '')) {
        changes.push({
          field: 'Phone',
          oldValue: customerToEdit.phone || '',
          newValue: editForm.phone || '',
        });
      }

      if (editForm.email !== (customerToEdit.email || '')) {
        changes.push({
          field: 'Email',
          oldValue: customerToEdit.email || '',
          newValue: editForm.email || '',
        });
      }

      if (editForm.notes !== (customerToEdit.notes || '')) {
        changes.push({
          field: 'Notes',
          oldValue: customerToEdit.notes || '',
          newValue: editForm.notes || '',
        });
      }

      // Validate user is authenticated
      if (!user) {
        setEditError('You must be logged in to edit customers.');
        return;
      }

      if (!customerToEdit.id) {
        setEditError('Customer ID is missing.');
        return;
      }

      // Create history entry
      const historyEntry: HistoryEntry = {
        timestamp: new Date().toISOString(),
        adminEmail: user.email || 'unknown',
        adminUid: user.uid,
        action: 'edited',
        changes,
      };

      // Get existing history or create new array
      const existingHistory = customerToEdit.history || [];
      const updatedHistory = [...existingHistory, historyEntry];

      await updateDoc(doc(db, 'customers', customerToEdit.id), {
        fullName: editForm.fullName,
        instagramHandle: editForm.instagramHandle,
        birthday: birthdayString,
        phone: editForm.phone || null,
        email: editForm.email || null,
        notes: editForm.notes || null,
        history: updatedHistory,
      });

      setEditDialogOpen(false);
      setCustomerToEdit(null);
      setEditError('');
    } catch (error) {
      const errorDetails = handleError(error);
      setEditError(errorDetails.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('Customers')}</h1>
        <p className="text-muted-foreground mt-2">{t('Manage and view all your customers')}</p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <DynamicInput
            type="text"
            placeholder={t('Search by name or Instagram...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} {t('of')} {customers.length} {t('customers')}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCustomersToCSV(filteredCustomers.length > 0 ? filteredCustomers : customers)}
          disabled={customers.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t('Export to CSV')}
        </Button>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? t('No customers found matching your search.') : t('No customers yet. Add your first customer to get started.')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Instagram')}</TableHead>
                <TableHead>{t('Birthday Column')}</TableHead>
                <TableHead>{t('Phone')}</TableHead>
                <TableHead>{t('Email')}</TableHead>
                <TableHead>{t('Notes')}</TableHead>
                <TableHead>{t('Added')}</TableHead>
                <TableHead className="w-[150px]">{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell>@{customer.instagramHandle}</TableCell>
                  <TableCell>{formatBirthday(customer.birthday)}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{customer.notes || '-'}</TableCell>
                  <TableCell className="text-xs">
                    <div className="text-muted-foreground">
                      {formatCreatedAt(customer.createdAt)}
                    </div>
                    {customer.createdBy && (
                      <div className="text-muted-foreground/70 truncate max-w-[120px]" title={customer.createdBy.email}>
                        {t('by')} {customer.createdBy.email.split('@')[0]}
                      </div>
                    )}
                    {customer.history && customer.history.filter(h => h.action === 'edited').length > 0 && (
                      <div className="text-muted-foreground/70">
                        ({customer.history.filter(h => h.action === 'edited').length} {customer.history.filter(h => h.action === 'edited').length === 1 ? t('edit') : t('edits')})
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCustomerHistory(customer);
                          setHistoryDialogOpen(true);
                        }}
                        title={t('View History')}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(customer)}
                        title={t('Edit Customer Tooltip')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCustomerToDelete(customer);
                          setDeleteDialogOpen(true);
                        }}
                        title={t('Delete Customer Tooltip')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Customer')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete')} {customerToDelete?.fullName}{t('? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-destructive">{deleteError}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteError('');
            }}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('Edit Customer')}</DialogTitle>
            <DialogDescription>
              {t('Update customer information below')}
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-destructive">{editError}</span>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">{t('Full Name')} *</Label>
                <DynamicInput
                  id="edit-fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instagram">{t('Instagram Handle')} *</Label>
                <DynamicInput
                  id="edit-instagram"
                  value={editForm.instagramHandle}
                  onChange={(e) => setEditForm({ ...editForm, instagramHandle: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-birthday">{t('Birthday (DD/MM/YYYY) *')}</Label>
                <div className="flex gap-2">
                  <DynamicInput
                    id="edit-birthday"
                    value={editForm.birthday}
                    onChange={(e) => handleEditBirthdayChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="flex-1"
                  />
                  <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
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
                        selected={editForm.birthday ? (() => {
                          const parts = editForm.birthday.split('/');
                          if (parts.length === 3) {
                            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                          }
                          return undefined;
                        })() : undefined}
                        onSelect={handleEditCalendarSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t('Phone')}</Label>
                <DynamicInput
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('Email')}</Label>
              <DynamicInput
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t('Notes')}</Label>
              <DynamicTextarea
                id="edit-notes"
                rows={4}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t('Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Customer History')}</DialogTitle>
            <DialogDescription>
              {t('Complete history for')} {customerHistory?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {customerHistory?.createdBy && (
              <div className="border-l-2 border-primary pl-4">
                <div className="font-semibold">{t('Created By')}</div>
                <div className="text-sm text-muted-foreground">
                  {customerHistory.createdBy.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {customerHistory.createdAt && formatCreatedAt(customerHistory.createdAt)}
                </div>
              </div>
            )}

            {customerHistory?.history && customerHistory.history.length > 0 ? (
              <div className="space-y-4">
                <div className="font-semibold">{t('Edit History')} ({customerHistory.history.length} {customerHistory.history.length === 1 ? t('change') : t('changes')})</div>
                {customerHistory.history
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {entry.action === 'created' ? t('Created') : `${t('Edit #')}${customerHistory.history!.length - index}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('by')} {entry.adminEmail}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>

                      {entry.changes && entry.changes.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium">{t('Changes:')}</div>
                          {entry.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="text-sm bg-muted rounded p-2">
                              <div className="font-medium">{change.field}</div>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-red-600 line-through">{change.oldValue || '(empty)'}</span>
                                <span>→</span>
                                <span className="text-green-600">{change.newValue || '(empty)'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t('No edit history available.')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              {t('Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};