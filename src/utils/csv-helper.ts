export const downloadCSVTemplate = () => {
    try {
      // Define the CSV content directly
      const csvContent = `gr_no,class,division,first_name,middle_name,last_name,first_name_in_guj,middle_name_in_guj,last_name_in_guj,father_name,father_name_in_guj,mother_name,mother_name_in_guj,is_active,primary_mobile,secondary_mobile,roll_number,aadhar_no,aadhar_dise_no,privious_school,privious_school_in_guj,religiion,religiion_in_guj,caste,caste_in_guj,category,address,district,city,state,postal_code,bank_name,account_no,IFSC_code,gender,birth_date,birth_place,birth_place_in_guj,admission_date
  5563,2,A,Melzo_Student_54,Kumar,Patel,મેળજો_સ્ટુડન્ટ_54,કુમાર,Patel,Ramesh Patel,રમેશ પટેલ,Rama Patel,રમ પટેલ,TRUE,9155636666,8340303453,54,6568585903,6568585903,Delhi Public School,દિલ્લી પબ્લિક સ્કૂલ,Hindu,હિન્દુ,Hindu,હિન્દુ,OPEN,Bhatar Char Rasta,Surat,Surat,Gujrat,394233,SBI,6568585903,SBIN0000194,Male,2005-04-17,Surat,સુરત,2025-03-24`
  
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  
      // Create a URL for the Blob
      const url = URL.createObjectURL(blob)
  
      // Create a link element and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "student_upload_template.csv")
      document.body.appendChild(link)
      link.click()
  
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading CSV template:", error)
      alert("Failed to download the CSV template. Please try again later.")
    }
  }