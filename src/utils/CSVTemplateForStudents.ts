export const downloadCSVTemplate = () => {
  try {
    const csvContent = `first_name,middle_name,last_name,gender,gr_no,phone_number
Melzo_Student_54,Kumar,Patel,Male,="6568",="9155636666"
John,,Doe,Female,="9012",="9876543210"
Jane,Marie,Smith,Female,="1098",="8765432109"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

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
