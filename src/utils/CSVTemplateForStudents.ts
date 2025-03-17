export const downloadCSVTemplate = () => {
  try {
    // Define the CSV content directly with required fields
    const csvContent = `first_name,middle_name,last_name,gender,aadhar_no, phone
Melzo_Student_54,Kumar,Patel,Male,6568585903 ,9155636666
John,,Doe,Female,123456789012,9876543210
Jane,Marie,Smith,Female,987654321098,8765432109`;

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV template:", error);
    alert("Failed to download the CSV template. Please try again later.");
  }
};

/**
 * Required fields 
 * 
 *   First Name
 *   Middle Name(optional)
 *   Last Name
 *   Gender
 *   Aadhar Number
 *   Primary Mobile 
 */