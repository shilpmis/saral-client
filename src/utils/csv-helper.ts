/**
 * Helper function to download the CSV template from local assets
 * or fetch it from a remote URL if needed
 */
export const downloadCSVTemplate = async () => {
    try {
      const csvUrl =  "../../public/student_upload_template.csv"
  
        // Create a link element and trigger download
    const link = document.createElement("a")
    link.href = csvUrl
    link.setAttribute("download", "student_upload_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading CSV template:", error)
    }
  }
  
  