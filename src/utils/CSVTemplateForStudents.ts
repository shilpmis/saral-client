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
  "Rahul",
  "Pravinbhai",
  "Patel",
  "રાહુલ",
  "પ્રવિણભાઈ",
  "પટેલ",
  "Male",
  "2000-01-01",
  "Surat",
  "Surat",
  "'123456789012",
  "'895645125689784523",
  "Pravinbhai",
  "પ્રવિણભાઈ",
  "Sangitaben",
  "સંગીતાબેન",
  "'8956234582",
  "'9974001772",
  "8952",
  "41",
  "2023-08-01",
  "Play High School",
  "પ્લે હાઈ સ્કૂલ",
  "Hindu",
  "હિંદુ",
  "Hindu Patel",
  "હિંદુ પટેલ",
  "SC",
  "Plot No 123 Near School Surat",
  "Surat",
  "Surat",
  "Gujarat",
  "395001",
  "Bank of Baroda",
  "'1234567890123456",
  "BARB0SURAT123",
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
