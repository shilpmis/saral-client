"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useDownloadExcelTemplateMutation } from "@/services/StaffService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { current } from "@reduxjs/toolkit"

interface ExcelDownloadModalProps {}

const fieldGroups = {
  role: [
    // { id: "is_teaching_role", label: "Teaching Role" },
    { id: "staff_role", label: "Staff Role" },
  ],
  personal: [
    { id: "first_name", label: "First Name" },
    { id: "middle_name", label: "Middle Name" },
    { id: "last_name", label: "Last Name" },
    { id: "gender", label: "Gender" },
    { id: "birth_date", label: "Birth Date" },
    { id: "aadhar_no", label: "Aadhar Number" },
  ],
  contact: [
    { id: "mobile_number", label: "Mobile Number" },
    { id: "email", label: "Email" },
    { id: "qualification", label: "Qualification" },
  ],
  address: [
    { id: "address", label: "Address" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "postal_code", label: "Postal Code" },
  ],
}

export default function ExcelDownloadModalForStaff({}: ExcelDownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [staffType, setStaffType] = useState<"teaching" | "non-teaching">("teaching")
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [isDownloading, setIsDownloading] = useState(false)

    const authState = useAppSelector(selectAuthState)
    const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const [getExcelForStaff, { isLoading: isDownloadingExcel }] = useDownloadExcelTemplateMutation()

  useEffect(() => {
    const initialSelectedFields: Record<string, boolean> = {}
    Object.entries(fieldGroups).forEach(([_, fields]) => {
      fields.forEach((field) => {
        initialSelectedFields[field.id] = true
      })
    })
    setSelectedFields(initialSelectedFields)
  }, [])

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
    const fieldsToInclude = Object.entries(selectedFields)
      .filter(([_, isSelected]) => isSelected)
      .map(([fieldId]) => fieldId)

    if (fieldsToInclude.length === 0) {
      alert("Please select at least one field to include")
      setIsDownloading(false)
      return
    }

    try {
      const response = await getExcelForStaff({
        school_id : authState.user!.school_id,
        academic_session : CurrentAcademicSessionForSchool!.id,
        fields: fieldsToInclude,
        type: staffType,
      }).unwrap()

      if (response.error) {
        throw new Error("Failed to download Excel file")
      }

      const fileName = `${staffType === "teaching" ? "Teaching_Staff" : "Non_Teaching_Staff"}_${new Date().toISOString().split("T")[0]}.xlsx`

      const url = URL.createObjectURL(response)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      URL.revokeObjectURL(url)
      document.body.removeChild(link)
      setIsOpen(false)
    } catch (error) {
      console.error("Error downloading Excel:", error)
      alert("Failed to download Excel file. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const selectedFieldCount = Object.values(selectedFields).filter(Boolean).length

  return (
    <div>
      <Card className="border shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Select Staff Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="teaching"
                checked={staffType === "teaching"}
                onCheckedChange={() => setStaffType("teaching")}
              />
              <Label htmlFor="teaching">Teaching Staff</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="non-teaching"
                checked={staffType === "non-teaching"}
                onCheckedChange={() => setStaffType("non-teaching")}
              />
              <Label htmlFor="non-teaching">Non-Teaching Staff</Label>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Button
        onClick={downloadExcel}
        disabled={isDownloading || selectedFieldCount === 0}
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
    </div>
  )
}

