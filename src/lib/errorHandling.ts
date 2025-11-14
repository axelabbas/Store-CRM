// Error handling utilities

export interface ErrorDetails {
  message: string;
  type: 'error' | 'warning' | 'info';
}

// Firebase Auth error codes
export const getFirebaseAuthError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Please contact support.';
    default:
      return 'Authentication error. Please try again.';
  }
};

// Firebase Firestore error codes
export const getFirestoreError = (errorCode: string): string => {
  switch (errorCode) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'This document already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded. Please try again later.';
    case 'failed-precondition':
      return 'Operation cannot be completed in the current state.';
    case 'aborted':
      return 'The operation was aborted. Please try again.';
    case 'out-of-range':
      return 'Invalid input range.';
    case 'unimplemented':
      return 'This operation is not implemented yet.';
    case 'internal':
      return 'Internal server error. Please try again.';
    case 'unavailable':
      return 'Service is currently unavailable. Please try again later.';
    case 'data-loss':
      return 'Unrecoverable data loss or corruption.';
    case 'unauthenticated':
      return 'You must be logged in to perform this action.';
    case 'deadline-exceeded':
      return 'Operation timed out. Please try again.';
    default:
      return 'Database error. Please try again.';
  }
};

// General error handler
export const handleError = (error: unknown): ErrorDetails => {
  console.error('Error occurred:', error);

  // Check if it's a Firebase error
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string };
    
    // Check if it's an auth error
    if (firebaseError.code.startsWith('auth/')) {
      return {
        message: getFirebaseAuthError(firebaseError.code),
        type: 'error',
      };
    }
    
    // Check if it's a Firestore error
    return {
      message: getFirestoreError(firebaseError.code),
      type: 'error',
    };
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'error',
    };
  }

  // Check for network errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as { message: string }).message.toLowerCase();
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        type: 'error',
      };
    }
  }

  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'error',
  };
};

// Validation errors
export const getValidationError = (field: string, value: unknown): string | null => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required.';
      if (typeof value === 'string' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return 'Please enter a valid email address.';
      }
      return null;
    
    case 'phone':
      if (value && typeof value === 'string' && value.length > 0) {
        if (!value.match(/^[\d\s+()-]+$/)) {
          return 'Please enter a valid phone number.';
        }
      }
      return null;
    
    case 'birthday':
      if (!value) return 'Birthday is required.';
      if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length !== 3) {
          return 'Please enter birthday in DD/MM/YYYY format.';
        }
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
          return 'Invalid date. Please use numbers only.';
        }
        if (day < 1 || day > 31) {
          return 'Day must be between 1 and 31.';
        }
        if (month < 1 || month > 12) {
          return 'Month must be between 1 and 12.';
        }
        if (year < 1900 || year > new Date().getFullYear()) {
          return `Year must be between 1900 and ${new Date().getFullYear()}.`;
        }
      }
      return null;
    
    default:
      return null;
  }
};
