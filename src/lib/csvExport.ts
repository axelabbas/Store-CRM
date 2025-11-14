import { Customer } from '../types/customer';
import { format, parseISO } from 'date-fns';

/**
 * Converts customer data to CSV format and triggers download
 */
export const exportCustomersToCSV = (customers: Customer[]): void => {
  if (customers.length === 0) {
    alert('No customers to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Full Name',
    'Instagram Handle',
    'Birthday',
    'Phone',
    'Email',
    'Notes',
    'Created At',
    'Created By',
    'Total Edits'
  ];

  // Helper function to escape CSV fields
  const escapeCSVField = (field: string | null | undefined): string => {
    if (!field) return '';
    // Escape double quotes by doubling them
    const escaped = field.toString().replace(/"/g, '""');
    // Wrap in quotes if contains comma, newline, or quote
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  // Helper function to format birthday
  const formatBirthday = (birthday: string | Date): string => {
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

  // Helper function to format created at
  const formatCreatedAt = (createdAt: unknown): string => {
    if (!createdAt) return 'Unknown';
    try {
      if (typeof createdAt === 'object' && createdAt !== null && 'toDate' in createdAt) {
        return format((createdAt as { toDate: () => Date }).toDate(), 'yyyy-MM-dd HH:mm:ss');
      }
      return format(new Date(createdAt as string), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return 'Unknown';
    }
  };

  // Convert customers to CSV rows
  const rows = customers.map(customer => {
    const editCount = customer.history?.filter(h => h.action === 'edited').length || 0;
    
    return [
      escapeCSVField(customer.fullName),
      escapeCSVField(customer.instagramHandle),
      escapeCSVField(formatBirthday(customer.birthday)),
      escapeCSVField(customer.phone || ''),
      escapeCSVField(customer.email || ''),
      escapeCSVField(customer.notes || ''),
      escapeCSVField(formatCreatedAt(customer.createdAt)),
      escapeCSVField(customer.createdBy?.email || 'Unknown'),
      escapeCSVField(editCount.toString())
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `customers_export_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
  }
};
