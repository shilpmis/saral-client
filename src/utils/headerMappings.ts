/**
 * Maps API response keys to user-friendly Excel column headers
 * Used for client-side transformation of Excel headers
 */

/**
 * Student-specific header mappings from API keys to friendly headers
 */
export const studentHeaderMappings: Record<string, string> = {
  // Personal information
  'first_name': 'First Name',
  'middle_name': 'Middle Name',
  'last_name': 'Last Name',
  'first_name_in_guj': 'First Name (Gujarati)',
  'middle_name_in_guj': 'Middle Name (Gujarati)',
  'last_name_in_guj': 'Last Name (Gujarati)',
  'gender': 'Gender',
  'birth_date': 'Date of Birth',
  'birth_place': 'Place of Birth',
  'birth_place_in_guj': 'Place of Birth (Gujarati)',
  'aadhar_no': 'Aadhar Number',
  'aadhar_dise_no': 'Aadhar DISE Number',
  
  // Family information
  'father_name': 'Father\'s Name',
  'father_name_in_guj': 'Father\'s Name (Gujarati)',
  'mother_name': 'Mother\'s Name',
  'mother_name_in_guj': 'Mother\'s Name (Gujarati)',
  'primary_mobile': 'Primary Mobile Number',
  'secondary_mobile': 'Secondary Mobile Number',
  
  // Academic information
  'gr_no': 'GR Number',
  'roll_number': 'Roll Number',
  'admission_date': 'Admission Date',
  'admission_class': 'Admission Class',
  'class': 'Current Class',
  'division': 'Division',
  'privious_school': 'Previous School',
  'privious_school_in_guj': 'Previous School (Gujarati)',
  
  // Other details
  'religion': 'Religion',
  'religion_in_guj': 'Religion (Gujarati)',
  'caste': 'Caste',
  'caste_in_guj': 'Caste (Gujarati)',
  'category': 'Category',
  
  // Address details
  'address': 'Address',
  'district': 'District',
  'city': 'City',
  'state': 'State',
  'postal_code': 'Postal Code',
  
  // Bank details
  'bank_name': 'Bank Name',
  'account_no': 'Account Number',
  'IFSC_code': 'IFSC Code',
};

/**
 * Staff-specific header mappings from API keys to friendly headers
 */
export const staffHeaderMappings: Record<string, string> = {
  // Role information
  'staff_role': 'Staff Role',
  'is_teaching_role': 'Teaching Role',
  
  // Personal information
  'first_name': 'First Name',
  'middle_name': 'Middle Name',
  'last_name': 'Last Name',
  'gender': 'Gender',
  'birth_date': 'Date of Birth',
  'aadhar_no': 'Aadhar Number',
  
  // Contact information
  'mobile_number': 'Mobile Number',
  'email': 'Email Address',
  'qualification': 'Qualification',
  
  // Address details
  'address': 'Address',
  'city': 'City',
  'state': 'State',
  'postal_code': 'Postal Code',
};

/**
 * Formats a snake_case API key to a Title Case header
 * Example: "first_name_in_guj" -> "First Name In Guj"
 * 
 * @param key The API key to format
 * @returns Formatted header text
 */
export function formatKeyToHeader(key: string): string {
  if (!key) return '';
  
  // Handle special case for uppercase abbreviations
  if (key.toUpperCase() === 'IFSC_CODE') return 'IFSC Code';
  
  // Special case abbreviations that should remain uppercase
  const uppercaseAbbreviations = ['gr', 'ifsc', 'dise', 'id', 'sms'];
  
  // Split by underscore and format each word
  return key
    .split('_')
    .map(word => {
      // Keep abbreviations uppercase
      if (uppercaseAbbreviations.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
