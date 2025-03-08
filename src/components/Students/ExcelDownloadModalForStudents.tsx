"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from 'lucide-react'
import * as XLSX from "xlsx"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student } from "@/types/student"
import type { AcademicClasses, Division } from "@/types/academic"

interface ExcelDownloadModalProps {
  academicClasses: AcademicClasses[] | null
  // fetchStudentsForClass: (classId: number) => Promise<Student[]>
}

// Define field groups for student data based on the provided mapping
const fieldGroups = {
  personal: [
    { id: "first_name", label: "First Name" },
    { id: "middle_name", label: "Middle Name" },
    { id: "last_name", label: "Last Name" },
    { id: "first_name_in_guj", label: "First Name (Gujarati)" },
    { id: "middle_name_in_guj", label: "Middle Name (Gujarati)" },
    { id: "last_name_in_guj", label: "Last Name (Gujarati)" },
    { id: "gender", label: "Gender" },
    { id: "birth_date", label: "Birth Date" },
    { id: "birth_place", label: "Birth Place" },
    { id: "birth_place_in_guj", label: "Birth Place (Gujarati)" },
    { id: "aadhar_no", label: "Aadhar Number" },
    { id: "aadhar_dise_no", label: "Aadhar DISE Number" },
  ],
  family: [
    { id: "father_name", label: "Father's Name" },
    { id: "father_name_in_guj", label: "Father's Name (Gujarati)" },
    { id: "mother_name", label: "Mother's Name" },
    { id: "mother_name_in_guj", label: "Mother's Name (Gujarati)" },
    { id: "primary_mobile", label: "Primary Mobile" },
    { id: "secondary_mobile", label: "Secondary Mobile" },
  ],
  academic: [
    { id: "gr_no", label: "GR Number" },
    { id: "roll_number", label: "Roll Number" },
    { id: "admission_date", label: "Admission Date" },
    { id: "admission_class", label: "Admission Class" },
    { id: "admission_division", label: "Admission Division" },
    { id: "class", label: "Current Class" },
    { id: "division", label: "Current Division" },
    { id: "privious_school", label: "Previous School" },
    { id: "privious_school_in_guj", label: "Previous School (Gujarati)" },
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
}

export default function ExcelDownloadModalForStudents({ academicClasses }: ExcelDownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [students, setStudents] = useState<Student[]>([])
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

  const availableDivisions =
    academicClasses && selectedClass ? academicClasses.find((cls) => cls.class.toString() === selectedClass) : null

  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setSelectedDivision(null)
    setStudents([])
  }

  const handleDivisionChange = async (value: string) => {
    if (!academicClasses) return

    setIsLoading(true)
    try {
      const selectedDiv = academicClasses
        .find((cls) => cls.class.toString() === selectedClass)
        ?.divisions.find((div) => div.id.toString() === value)

      if (selectedDiv) {
        setSelectedDivision(selectedDiv)
        // const fetchedStudents = await fetchStudentsForClass(selectedDiv.id)
        // setStudents(fetchedStudents)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      // Use all students
      const studentsToDownload = students

      if (studentsToDownload.length === 0) {
        alert("No students found for the selected class and division")
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
      const worksheetData = studentsToDownload.map((student) => {
        const rowData: Record<string, any> = {}

        // Add ID field always
        rowData["ID"] = student.id

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
          if (fieldId in student) {
            rowData[fieldLabel] = (student as any)[fieldId] || ""
          }
        })

        return rowData
      })

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Convert to Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const fileName = `Students_${selectedClass}_${selectedDivision?.division || ""}_${new Date().toISOString().split("T")[0]}.xlsx`
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
      setSelectedClass("")
      setSelectedDivision(null)
      setStudents([])
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
          <DialogTitle>Download Student Data</DialogTitle>
        </DialogHeader>

        <Card className="border shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-base">Select Class and Division</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Select Class</Label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicClasses?.map((cls) =>
                      cls.divisions.length > 0 ? (
                        <SelectItem key={cls.class} value={cls.class.toString()}>
                          Class {cls.class}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division">Select Division</Label>
                <Select
                  value={selectedDivision ? selectedDivision.id.toString() : ""}
                  onValueChange={handleDivisionChange}
                  disabled={!selectedClass}
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDivisions?.divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.division} {division.aliases ? `- ${division.aliases}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length > 0 ? (
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
        ) : selectedDivision ? (
          <div className="text-center py-4 text-muted-foreground">No students found for this class and division.</div>
        ) : null}

        <Button
          onClick={downloadExcel}
          disabled={isDownloading || students.length === 0 || selectedFieldCount === 0}
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
