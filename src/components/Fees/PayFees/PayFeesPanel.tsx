import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, ArrowUpDown, Download, FileText } from "lucide-react"
import { useLazyGetStudentFeesDetailsForClassQuery } from "@/services/feesService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import type { AcademicClasses, Division } from "@/types/academic"
import type { StudentWithFeeStatus } from "@/types/fees"
import { toast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { SaralPagination } from "@/components/ui/common/SaralPagination"

const PayFeesPanel: React.FC = () => {
  //   const router = useRouter()
  const navigate = useNavigate()
  const authState = useAppSelector(selectAuthState)
  const academicClasses = useAppSelector(selectAcademicClasses)

  const { t } = useTranslation()
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getClassFeesStatus, { data: feesData, isLoading, isError }] = useLazyGetStudentFeesDetailsForClassQuery()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [students, setStudents] = useState<StudentWithFeeStatus[]>([])

  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  // Get available divisions for selected class
  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (academicClasses && selectedClass) {
      return academicClasses.filter((cls) => cls.class.toString() === selectedClass)[0]
    }
    return null
  }, [academicClasses, selectedClass])

  // Handle class selection change
  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setSelectedDivision(null)
  }

  // Handle division selection change
  const handleDivisionChange = async (value: string) => {
    if (academicClasses) {
      const selectedDiv = academicClasses
        .filter((cls) => cls.class.toString() === selectedClass)[0]
        .divisions.filter((div) => div.id.toString() === value)

      setSelectedDivision(selectedDiv[0])

      try {
        await getClassFeesStatus({ class_id: selectedDiv[0].id, academic_session: CurrentAcademicSessionForSchool!.id })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch fees data",
          description: "Please try again later",
        })
      }
    }
  }

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!students) return []

    return students.filter((student) => {
      const fullName = `${student.first_name} ${student.middle_name} ${student.last_name}`.toLowerCase()
      const grNumber = student.gr_no.toString()

      return fullName.includes(searchTerm.toLowerCase()) || grNumber.includes(searchTerm.toLowerCase())
    })
  }, [students, searchTerm])

  // Sort students based on sort config
  const sortedStudents = useMemo(() => {
    if (!sortConfig) return filteredStudents

    return [...filteredStudents].sort((a, b) => {
      if (!sortConfig.key) return 0

      let aValue, bValue

      // Handle nested properties
      if (sortConfig.key.includes(".")) {
        const [parent, child] = sortConfig.key.split(".")
        aValue = (a[parent as keyof typeof a] as any)[child]
        bValue = (b[parent as keyof typeof b] as any)[child]
      } else {
        aValue = a[sortConfig.key as keyof typeof a]
        bValue = b[sortConfig.key as keyof typeof b]
      }

      // Convert to numbers for numeric comparison if needed
      if (typeof aValue === "string" && !isNaN(Number(aValue))) {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }, [filteredStudents, sortConfig])

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Navigate to student fee details page
  const handleViewDetails = (studentId: number) => {
    navigate(`${studentId}`)
  }

  // Get status badge variant based on fee status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "success"
      case "Partially Paid":
        return "warning"
      case "Overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Initialize data
  useEffect(() => {
    if (!academicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [academicClasses, authState.user, getAcademicClasses])

  // Auto-select first class and division when academicClasses are loaded
  useEffect(() => {
    if (academicClasses && academicClasses.length > 0 && !selectedClass) {
      // Find first class with divisions
      const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)

      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.class.toString())

        // Set the first division of that class
        if (firstClassWithDivisions.divisions.length > 0) {
          setSelectedDivision(firstClassWithDivisions.divisions[0])
        }
      }
    }
  }, [academicClasses, selectedClass])

  // Fetch data when selectedDivision changes
  useEffect(() => {
    if (selectedDivision && CurrentAcademicSessionForSchool) {
      getClassFeesStatus({
        class_id: selectedDivision.id,
        academic_session: CurrentAcademicSessionForSchool.id,
      })
    }
  }, [selectedDivision, CurrentAcademicSessionForSchool, getClassFeesStatus])

  // Update students when fees data changes
  useEffect(() => {
    if (feesData) {
      setStudents(feesData.data as unknown as StudentWithFeeStatus[])
    }
  }, [feesData])

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {t("fee_management")}
        </h2>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> {t("export_report")}
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> {t("generate_receipts")}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> {t("filter_students")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="class-select" className="text-sm font-medium text-gray-700 mb-1 block">
                {t("class")}
              </label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("select_class")} />
                </SelectTrigger>
                <SelectContent>
                  {academicClasses?.map((cls, index) =>
                    cls.divisions.length > 0 ? (
                      <SelectItem key={index} value={cls.class.toString()}>
                        {t("class")} {cls.class}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="division-select" className="text-sm font-medium text-gray-700 mb-1 block">
                {t("division")}
              </label>
              <Select
                value={selectedDivision ? selectedDivision.id.toString() : ""}
                onValueChange={handleDivisionChange}
                disabled={!selectedClass}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("select_division")} />
                </SelectTrigger>
                <SelectContent>
                  {availableDivisions?.divisions.map((division, index) => (
                    <SelectItem key={index} value={division.id.toString()}>
                      {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
              {t("search")}
            </label>
            <Input
              id="search"
              placeholder={t("search_by_name_or_roll_number")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("first_name")}>
                      {t("student_name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("gr_no")}>
                      {t("gr_number")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.total_amount")}
                    >
                      {t("total_fees")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.paid_amount")}
                    >
                      {t("paid_amount")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.due_amount")}
                    >
                      {t("due_amount")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("fees_status.status")}>
                      {t("status")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-[100px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-500">
                      {t("failed_to_load_fees_data._please_try_again.")}
                    </TableCell>
                  </TableRow>
                ) : sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? "No students match your search criteria."
                        : "No students found in this class/division."}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {student.first_name} {student.middle_name} {student.last_name}
                      </TableCell>
                      <TableCell>{student.gr_no}</TableCell>
                      <TableCell>{formatCurrency(student.fees_status.total_amount)}</TableCell>
                      <TableCell>{formatCurrency(student.fees_status.paid_amount)}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(student.fees_status.due_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.fees_status.status === "Paid" ? "default" : "destructive"}>
                          {student.fees_status.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleViewDetails(student.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {t("view_details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {feesData && selectedDivision && (
            <SaralPagination
              currentPage={feesData.meta.last_page}
              totalPages={feesData.meta.last_page}
              onPageChange={(page) =>
                getClassFeesStatus({
                  class_id: selectedDivision.id,
                  academic_session: CurrentAcademicSessionForSchool!.id,
                  page,
                })
              }
            ></SaralPagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PayFeesPanel
