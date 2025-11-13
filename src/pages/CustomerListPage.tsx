import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types/customer';
import { Search, Calendar, AtSign, Phone, Mail, User, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    }, (error) => {
      console.error('Error fetching customers:', error);
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

  const formatCreatedAt = (createdAt: any) => {
    if (!createdAt) return 'Unknown';
    try {
      if (createdAt.toDate) {
        return format(createdAt.toDate(), 'MMM dd, yyyy HH:mm');
      }
      return format(new Date(createdAt), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer List</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or Instagram handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new customer.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <li key={customer.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer.fullName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-y-2 sm:space-y-0 sm:space-x-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <AtSign className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                            @{customer.instagramHandle}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                            {formatBirthday(customer.birthday)}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className="text-xs text-gray-500">
                            Added {formatCreatedAt(customer.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {customer.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{customer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
};