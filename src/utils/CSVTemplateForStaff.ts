export function generateTeachingStaffCSV(): string {
  // Define the CSV header row
  const headers = [
    "first_name",
    "middle_name",
    "last_name",
    "gender",
    "aadhar_no",
    "mobile_number",
    "role",
    "employment_status",
  ].join(",")

  // Add a sample row with example data
  const sampleRow = [
    "John",
    "M",
    "Doe",
    "Male",
    "123456789012",
    "9876543210",
    "Principal",
    "Active",
  ].join(",")

  // Add an empty row for the user to fill
  const emptyRow = Array(headers.split(",").length).fill("").join(",")

  // Combine all rows
  return `${headers}\n${sampleRow}`
}

export function generateNonTeachingStaffCSV(): string {
  // Define the CSV header row
  const headers = [
    "first_name",
    "middle_name",
    "last_name",
    "gender",
    "aadhar_no",
    "mobile_number",
    "role",
    "employment_status",
  ].join(",")

  // Add a sample row with example data
  const sampleRow = [
    "Jane",
    "A",
    "Smith",
    "Female",
    "123456789012",
    "9876543210",
    "Clerk",
    "Active",
  ].join(",")

  // Add an empty row for the user to fill
  const emptyRow = Array(headers.split(",").length).fill("").join(",")

  // Combine all rows
  return `${headers}\n${sampleRow}`
}

export function downloadCSVTemplate(staffType: "teaching" | "non-teaching") {
  // Generate the appropriate CSV content
  const csvContent = staffType === "teaching" ? generateTeachingStaffCSV() : generateNonTeachingStaffCSV()


  try {
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    
      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${staffType}-staff-template.csv`)
    
      // Append to the document, click, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error("Error downloading CSV template For Staff:", error);
    alert("Failed to download the CSV template. Please try again later.");
  }
}

