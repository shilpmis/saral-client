export interface User {
    id: string
    image: string | File | FileList
    name: string
    mobileNumber: string
    registrationDetails: string
    email: string
    password: string
    currentStatus: "Active" | "Inactive"
    delegateResponsibilities: {
      managementDepartment: boolean
      studentDetails: boolean
      timeTable: boolean
      feeStructure: boolean
      staffManagement: boolean
      listOfComplaints: boolean
      accounts: boolean
      resultDetails: boolean
      transportDepartment: boolean
      hostelDepartment: boolean
    }
  }
  
  