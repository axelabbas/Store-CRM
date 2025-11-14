// Detect if text contains Arabic characters
export const hasArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Detect if text contains Latin/English characters
export const hasLatin = (text: string): boolean => {
  const latinPattern = /[A-Za-z]/;
  return latinPattern.test(text);
};

// Get text direction based on content
export const getTextDirection = (text: string): 'rtl' | 'ltr' | 'auto' => {
  if (!text) return 'auto';
  
  const arabic = hasArabic(text);
  const latin = hasLatin(text);
  
  // If both Arabic and Latin, use auto
  if (arabic && latin) return 'auto';
  
  // If only Arabic, use RTL
  if (arabic) return 'rtl';
  
  // If only Latin or numbers, use LTR
  if (latin) return 'ltr';
  
  // Default to auto
  return 'auto';
};

// Component hook to get direction for input value
export const useTextDirection = (value: string) => {
  return getTextDirection(value);
};
