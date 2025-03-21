"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AcademicClasses, Division } from "@/types/academic"
import { useDownloadExcelTemplateMutation } from "@/services/StudentServices"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface ExcelDownloadModalProps {
  academicClasses: AcademicClasses[] | null
}

// Define field groups for student data based on the provided mapping
const fieldGroups = {
  personal: [
    { id: "first_name", label: "First Name", table: "students" },
    { id: "middle_name", label: "Middle Name", table: "students" },
    { id: "last_name", label: "Last Name", table: "students" },
    { id: "first_name_in_guj", label: "First Name (Gujarati)", table: "students" },
    { id: "middle_name_in_guj", label: "Middle Name (Gujarati)", table: "students" },
    { id: "last_name_in_guj", label: "Last Name (Gujarati)", table: "students" },
    { id: "gender", label: "Gender", table: "students" },
    { id: "birth_date", label: "Birth Date", table: "students" },
    { id: "birth_place", label: "Birth Place", table: "student_meta" },
    { id: "birth_place_in_guj", label: "Birth Place (Gujarati)", table: "student_meta" },
    { id: "aadhar_no", label: "Aadhar Number", table: "students" },
    { id: "aadhar_dise_no", label: "Aadhar DISE Number", table: "student_meta" },
  ],
  family: [
    { id: "father_name", label: "Father's Name", table: "students" },
    { id: "father_name_in_guj", label: "Father's Name (Gujarati)", table: "students" },
    { id: "mother_name", label: "Mother's Name", table: "students" },
    { id: "mother_name_in_guj", label: "Mother's Name (Gujarati)", table: "students" },
    { id: "primary_mobile", label: "Primary Mobile", table: "students" },
    { id: "secondary_mobile", label: "Secondary Mobile", table: "student_meta" },
  ],
  academic: [
    { id: "gr_no", label: "GR Number", table: "students" },
    { id: "roll_number", label: "Roll Number", table: "students" },
    { id: "admission_date", label: "Admission Date", table: "student_meta" },
    { id: "admission_class", label: "Admission Class", table: "student_meta" },
    { id: "class", label: "Current Class", table: "students" },
    { id: "privious_school", label: "Previous School", table: "student_meta" },
    { id: "privious_school_in_guj", label: "Previous School (Gujarati)", table: "student_meta" },
  ],
  other: [
    { id: "religion", label: "Religion", table: "student_meta" },
    { id: "religion_in_guj", label: "Religion (Gujarati)", table: "student_meta" },
    { id: "caste", label: "Caste", table: "student_meta" },
    { id: "caste_in_guj", label: "Caste (Gujarati)", table: "student_meta" },
    { id: "category", label: "Category", table: "student_meta" },
  ],
  address: [
    { id: "address", label: "Address", table: "student_meta" },
    { id: "district", label: "District", table: "student_meta" },
    { id: "city", label: "City", table: "student_meta" },
    { id: "state", label: "State", table: "student_meta" },
    { id: "postal_code", label: "Postal Code", table: "student_meta" },
  ],
  bank: [
    { id: "bank_name", label: "Bank Name", table: "student_meta" },
    { id: "account_no", label: "Account Number", table: "student_meta" },
    { id: "IFSC_code", label: "IFSC Code", table: "student_meta" },
  ],
}

export default function ExcelDownloadModalForStudents({ academicClasses }: ExcelDownloadModalProps) {
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const {t} = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedAcademicSession, setSelectedAcademicSession] = useState<string>(
    CurrentAcademicSessionForSchool ? CurrentAcademicSessionForSchool.id.toString() : ""
  )

  const [getExcelForClass, { isLoading: isDownloadingExcle, isError }] = useDownloadExcelTemplateMutation()

  useEffect(() => {
    const initialSelectedFields: Record<string, boolean> = {}
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
  }

  const handleDivisionChange = (value: string) => {
    if (!academicClasses) return

    const selectedDiv = academicClasses
      .find((cls) => cls.class.toString() === selectedClass)
      ?.divisions.find((div) => div.id.toString() === value)

    if (selectedDiv) {
      setSelectedDivision(selectedDiv)
    }
  }

  const handleAcademicSessionChange = (value: string) => {
    setSelectedAcademicSession(value)
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
    const fieldsToInclude: Record<string, string[]> = {}
    Object.entries(selectedFields)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([fieldId]) => {
        const field = Object.values(fieldGroups).flat().find(f => f.id === fieldId)
        if (field) {
          if (!fieldsToInclude[field.table]) {
            fieldsToInclude[field.table] = []
          }
          fieldsToInclude[field.table].push(fieldId)
        }
      })

    if (Object.keys(fieldsToInclude).length === 0) {
      alert("Please select at least one field to include")
      setIsDownloading(false)
      return
    }

    try {
      const response = await getExcelForClass({
        class_id: selectedDivision!.id,
        academic_session: Number(selectedAcademicSession),
        payload: {
          student_meta: fieldsToInclude.student_meta,
          students: fieldsToInclude.students
        }
      }).unwrap()

      if (response.error) {
        throw new Error('Failed to download Excel file')
      }

      const fileName = `Students_${selectedClass}_${selectedDivision?.division || ""}_${new Date().toISOString().split("T")[0]}.xlsx`

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

  useEffect(() => {
    if (!isOpen) {
      setSelectedClass("")
      setSelectedDivision(null)
    }
  }, [isOpen])

  const selectedFieldCount = Object.values(selectedFields).filter(Boolean).length

  return (
    <div>
      <Card className="border shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t("select_academic_year,_class,_and_division")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academic-session">{t("select_academic_year")}</Label>
              <Select value={selectedAcademicSession} onValueChange={handleAcademicSessionChange}>
                <SelectTrigger id="academic-session">
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {AcademicSessionsForSchool?.map((as) => (
                    <SelectItem key={as.id} value={as.id.toString()}>
                      {as.session_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">{t("select_class")}</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger id="class">
                  <SelectValue placeholder={t("select_class")} />
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
              <Label htmlFor="division">{t("select_division")}</Label>
              <Select
                value={selectedDivision ? selectedDivision.id.toString() : ""}
                onValueChange={handleDivisionChange}
                disabled={!selectedClass}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder={t("select_division")} />
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
      ) : (
        <>
          <Card className="border shadow-sm mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-base">{t("select_fields")} ({selectedFieldCount} fields selected)</CardTitle>
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
        disabled={isDownloading || selectedFieldCount === 0 || !selectedClass || !selectedDivision || !selectedAcademicSession}
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
            {t("download_excel")}
          </>
        )}
      </Button>
    </div>
  )
}
