const headers = [
  "First Name",
  "Middle Name",
  "Last Name",
  "First Name Gujarati",
  "Middle Name Gujarati",
  "Last Name Gujarati",
  "Gender",
  "Date of Birth",
  "Birth Place",
  "Birth Place In Gujarati",
  "Aadhar No",
  "DISE Number",
  "Father Name",
  "Father Name in Gujarati",
  "Mother Name",
  "Mother Name in Gujarati",
  "Mobile No",
  "Other Mobile No",
  "GR No",
  "Roll Number",
  "Admission Date",
  "Previous School",
  "Previous School In Gujarati",
  "Religion",
  "Religion In Gujarati",
  "Caste",
  "Caste In Gujarati",
  "Category",
  "Address",
  "District",
  "City",
  "State",
  "Postal Code",
  "Bank Name",
  "Account Number",
  "IFSC Code",
].join(",");

// Add a sample row with example data
const sampleRow = [
  "Rahul", // First Name
  "", // Middle Name (optional)
  "Patel", // Last Name
  "", // First Name Gujarati (optional)
  "", // Middle Name Gujarati (optional)
  "", // Last Name Gujarati (optional)
  "Male", // Gender
  "", // Date of Birth (optional)
  "", // Birth Place (optional)
  "", // Birth Place In Gujarati (optional)
  "", // Aadhar No (optional)
  "", // DISE Number (optional)
  "", // Father Name (optional)
  "", // Father Name in Gujarati (optional)
  "", // Mother Name (optional)
  "", // Mother Name in Gujarati (optional)
  "9876543210", // Mobile No
  "", // Other Mobile No (optional)
  "GR12345", // GR No
  "", // Roll Number (optional)
  "", // Admission Date (optional)
  "", // Previous School (optional)
  "", // Previous School In Gujarati (optional)
  "", // Religion (optional)
  "", // Religion In Gujarati (optional)
  "", // Caste (optional)
  "", // Caste In Gujarati (optional)
  "", // Category (optional)
  "", // Address (optional)
  "", // District (optional)
  "", // City (optional)
  "", // State (optional)
  "", // Postal Code (optional)
  "", // Bank Name (optional)
  "", // Account Number (optional)
  "", // IFSC Code (optional)
].join(",");

export const downloadCSVTemplate = () => {
  try {
    const BOM = "\uFEFF"; // UTF-8 BOM
    const csvContent = `${headers}\n${sampleRow}`;

    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV template:", error);
    alert("Failed to download the CSV template. Please try again later.");
  }
};
