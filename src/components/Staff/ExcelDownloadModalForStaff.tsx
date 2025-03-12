"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { TeachingStaff, OtherStaff } from "@/types/staff"

interface ExcelDownloadModalProps {
  fetchTeachingStaff: () => Promise<TeachingStaff[]>
  fetchOtherStaff: () => Promise<OtherStaff[]>
}

// Define field groups
const fieldGroups = {
  role: [
    { id: "is_teaching_role", label: "Teaching Role" },
    { id: "staff_role_id", label: "Staff Role ID" },
  ],
  personal: [
    { id: "first_name", label: "First Name" },
    { id: "middle_name", label: "Middle Name" },
    { id: "last_name", label: "Last Name" },
    { id: "first_name_in_guj", label: "First Name (Gujarati)" },
    { id: "middle_name_in_guj", label: "Middle Name (Gujarati)" },
    { id: "last_name_in_guj", label: "Last Name (Gujarati)" },
    { id: "gender", label: "Gender" },
    { id: "birth_date", label: "Birth Date" },
    { id: "aadhar_no", label: "Aadhar Number" },
  ],
  contact: [
    { id: "mobile_number", label: "Mobile Number" },
    { id: "email", label: "Email" },
    { id: "qualification", label: "Qualification" },
    { id: "subject_specialization", label: "Subject Specialization" },
  ],
  other: [
    { id: "religiion", label: "Religion" },
    { id: "religiion_in_guj", label: "Religion (Gujarati)" },
    { id: "caste", label: "Caste" },
    { id: "caste_in_guj", label: "Caste (Gujarati)" },
    { id: "category", label: "Category" },
  ],
  address: [
    { id: "address", label: "Address" },
    { id: "district", label: "District" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "postal_code", label: "Postal Code" },
  ],
  bank: [
    { id: "bank_name", label: "Bank Name" },
    { id: "account_no", label: "Account Number" },
    { id: "IFSC_code", label: "IFSC Code" },
  ],
  employment: [
    { id: "class_id", label: "Class ID" },
    { id: "joining_date", label: "Joining Date" },
    { id: "employment_status", label: "Employment Status" },
  ],
}

export default function ExcelDownloadModalForStaff
({ fetchTeachingStaff, fetchOtherStaff }: ExcelDownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [staffType, setStaffType] = useState<"teaching" | "non-teaching">("teaching")
  const [staffData, setStaffData] = useState<(TeachingStaff | OtherStaff)[]>([])
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Initialize selected fields
  useEffect(() => {
    const initialSelectedFields: Record<string, boolean> = {}

    // Set all fields as selected by default
    Object.entries(fieldGroups).forEach(([_, fields]) => {
      fields.forEach((field) => {
        initialSelectedFields[field.id] = true
      })
    })

    setSelectedFields(initialSelectedFields)
  }, [])

  const loadStaffData = async () => {
    setIsLoading(true)
    try {
      let data: (TeachingStaff | OtherStaff)[] = []

      if (staffType === "teaching") {
        data = await fetchTeachingStaff()
      } else {
        data = await fetchOtherStaff()
      }

      setStaffData(data)
    } catch (error) {
      console.error("Error fetching staff data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load staff data when staff type changes
  useEffect(() => {
    if (isOpen) {
      loadStaffData()
    }
  }, [staffType, isOpen])

  const handleSelectAllFieldsInGroup = (groupName: string, checked: boolean) => {
    const newSelectedFields = { ...selectedFields }
    fieldGroups[groupName as keyof typeof fieldGroups].forEach((field) => {
      newSelectedFields[field.id] = checked
    })
    setSelectedFields(newSelectedFields)
  }

  const handleFieldSelect = (fieldId: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldId]: checked,
    }))
  }

  const downloadExcel = async () => {
    setIsDownloading(true)
    try {
      // Use all staff
      const staffToDownload = staffData

      if (staffToDownload.length === 0) {
        alert("No staff data available to download")
        setIsDownloading(false)
        return
      }

      // Get selected field IDs
      const fieldsToInclude = Object.entries(selectedFields)
        .filter(([_, isSelected]) => isSelected)
        .map(([fieldId]) => fieldId)

      if (fieldsToInclude.length === 0) {
        alert("Please select at least one field to include")
        setIsDownloading(false)
        return
      }

      // Prepare data for Excel with only selected fields
      const worksheetData = staffToDownload.map((staff) => {
        const rowData: Record<string, any> = {}

        // Add ID field always
        rowData["ID"] = staff.id

        // Add only selected fields
        fieldsToInclude.forEach((fieldId) => {
          // Find the field label for the header
          let fieldLabel = fieldId
          for (const [_, fields] of Object.entries(fieldGroups)) {
            const field = fields.find((f) => f.id === fieldId)
            if (field) {
              fieldLabel = field.label
              break
            }
          }

          // Add the field value to the row data
          if (fieldId in staff) {
            rowData[fieldLabel] = (staff as any)[fieldId] || ""
          }
        })

        return rowData
      })

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        staffType === "teaching" ? "Teaching Staff" : "Non-Teaching Staff",
      )

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Convert to Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const fileName = `${staffType === "teaching" ? "Teaching_Staff" : "Non_Teaching_Staff"}_${new Date().toISOString().split("T")[0]}.xlsx`
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(link)

      // Close modal after download
      setIsOpen(false)
    } catch (error) {
      console.error("Error downloading Excel:", error)
      alert("Failed to download Excel file. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStaffData([])
    }
  }, [isOpen])

  const selectedFieldCount = Object.values(selectedFields).filter(Boolean).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
          <FileDown className="mr-2 h-4 w-4" /> Download Excel
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Staff Data</DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">Select Staff Type</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <RadioGroup
              value={staffType}
              onValueChange={(value) => setStaffType(value as "teaching" | "non-teaching")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teaching" id="teaching" />
                <Label htmlFor="teaching">Teaching Staff</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-teaching" id="non-teaching" />
                <Label htmlFor="non-teaching">Non-Teaching Staff</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="border shadow-sm mt-4">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Select Fields ({selectedFieldCount} fields selected)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(fieldGroups).map(([groupName, fields]) => (
                      <div key={groupName} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`group-${groupName}`}
                              checked={fields.every((field) => selectedFields[field.id])}
                              onCheckedChange={(checked) => handleSelectAllFieldsInGroup(groupName, !!checked)}
                            />
                            <Label htmlFor={`group-${groupName}`} className="font-medium capitalize">
                              {groupName}
                            </Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                          {fields.map((field) => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`field-${field.id}`}
                                checked={selectedFields[field.id] || false}
                                onCheckedChange={(checked) => handleFieldSelect(field.id, !!checked)}
                              />
                              <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                            </div>
                          ))}
                        </div>

                        {groupName !== Object.keys(fieldGroups)[Object.keys(fieldGroups).length - 1] && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}

        <Button
          onClick={downloadExcel}
          disabled={isDownloading || staffData.length === 0 || selectedFieldCount === 0}
          className="w-full mt-4"
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Excel
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

