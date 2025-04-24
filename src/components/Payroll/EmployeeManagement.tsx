"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { toast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  FileText,
  ArrowUpDown,
  RefreshCw,
  UserPlus,
  Building,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react"

// Mock data types
interface Employee {
  id: number
  name: string
  code: string
  role: string
  department: string
  employmentType: "Teaching" | "Non-Teaching"
  status: "Active" | "Inactive" | "On Leave"
  joiningDate: string
  contactNumber: string
  email: string
  qualification: string
  salary?: number
}

// Mock data for employees
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    code: "EMP001",
    role: "Science Teacher",
    department: "Science",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2022-06-15",
    contactNumber: "+91 9876543210",
    email: "john.doe@school.edu",
    qualification: "M.Sc., B.Ed.",
    salary: 45000,
  },
  {
    id: 2,
    name: "Jane Smith",
    code: "EMP002",
    role: "Head Teacher",
    department: "Mathematics",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2021-08-10",
    contactNumber: "+91 9876543211",
    email: "jane.smith@school.edu",
    qualification: "M.Sc., Ph.D.",
    salary: 65000,
  },
  {
    id: 3,
    name: "Robert Johnson",
    code: "EMP003",
    role: "Administrator",
    department: "Administration",
    employmentType: "Non-Teaching",
    status: "Active",
    joiningDate: "2020-03-22",
    contactNumber: "+91 9876543212",
    email: "robert.johnson@school.edu",
    qualification: "MBA",
    salary: 75000,
  },
  {
    id: 4,
    name: "Emily Davis",
    code: "EMP004",
    role: "English Teacher",
    department: "English",
    employmentType: "Teaching",
    status: "On Leave",
    joiningDate: "2022-01-05",
    contactNumber: "+91 9876543213",
    email: "emily.davis@school.edu",
    qualification: "M.A., B.Ed.",
    salary: 42000,
  },
  {
    id: 5,
    name: "Michael Wilson",
    code: "EMP005",
    role: "Librarian",
    department: "Library",
    employmentType: "Non-Teaching",
    status: "Active",
    joiningDate: "2021-11-18",
    contactNumber: "+91 9876543214",
    email: "michael.wilson@school.edu",
    qualification: "B.Lib.",
    salary: 38000,
  },
  {
    id: 6,
    name: "Sarah Brown",
    code: "EMP006",
    role: "Arts Teacher",
    department: "Arts",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2023-01-10",
    contactNumber: "+91 9876543215",
    email: "sarah.brown@school.edu",
    qualification: "M.F.A., B.Ed.",
    salary: 41000,
  },
  {
    id: 7,
    name: "David Miller",
    code: "EMP007",
    role: "Peon",
    department: "Maintenance",
    employmentType: "Non-Teaching",
    status: "Active",
    joiningDate: "2022-09-01",
    contactNumber: "+91 9876543216",
    email: "david.miller@school.edu",
    qualification: "10th",
    salary: 22000,
  },
  {
    id: 8,
    name: "Jennifer Taylor",
    code: "EMP008",
    role: "Physical Education Teacher",
    department: "Physical Education",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2021-07-15",
    contactNumber: "+91 9876543217",
    email: "jennifer.taylor@school.edu",
    qualification: "B.P.Ed., M.P.Ed.",
    salary: 43000,
  },
  {
    id: 9,
    name: "James Anderson",
    code: "EMP009",
    role: "Accountant",
    department: "Finance",
    employmentType: "Non-Teaching",
    status: "Active",
    joiningDate: "2020-12-01",
    contactNumber: "+91 9876543218",
    email: "james.anderson@school.edu",
    qualification: "M.Com., CA",
    salary: 58000,
  },
  {
    id: 10,
    name: "Patricia Thomas",
    code: "EMP010",
    role: "Counselor",
    department: "Student Affairs",
    employmentType: "Non-Teaching",
    status: "Inactive",
    joiningDate: "2022-04-20",
    contactNumber: "+91 9876543219",
    email: "patricia.thomas@school.edu",
    qualification: "M.Sc. Psychology",
    salary: 48000,
  },
  {
    id: 11,
    name: "Rajesh Kumar",
    code: "EMP011",
    role: "Computer Teacher",
    department: "Computer Science",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2021-05-12",
    contactNumber: "+91 9876543220",
    email: "rajesh.kumar@school.edu",
    qualification: "MCA, B.Ed.",
    salary: 47000,
  },
  {
    id: 12,
    name: "Priya Sharma",
    code: "EMP012",
    role: "Hindi Teacher",
    department: "Languages",
    employmentType: "Teaching",
    status: "Active",
    joiningDate: "2022-07-05",
    contactNumber: "+91 9876543221",
    email: "priya.sharma@school.edu",
    qualification: "M.A. Hindi, B.Ed.",
    salary: 40000,
  },
]

// Mock data for departments and roles
const departments = [
  "All Departments",
  "Science",
  "Mathematics",
  "English",
  "Arts",
  "Physical Education",
  "Administration",
  "Finance",
  "Library",
  "Maintenance",
  "Student Affairs",
  "Computer Science",
  "Languages",
]

const roles = [
  "All Roles",
  "Science Teacher",
  "Head Teacher",
  "Administrator",
  "English Teacher",
  "Librarian",
  "Arts Teacher",
  "Peon",
  "Physical Education Teacher",
  "Accountant",
  "Counselor",
  "Computer Teacher",
  "Hindi Teacher",
]

const statuses = ["All Statuses", "Active", "Inactive", "On Leave"]

const EmployeeManagement = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [selectedRole, setSelectedRole] = useState("All Roles")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [selectedType, setSelectedType] = useState<"All" | "Teaching" | "Non-Teaching">("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })

  // Pagination settings
  const itemsPerPage = 8
  const totalPages = Math.ceil(mockEmployees.length / itemsPerPage)

  // Load data with simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Data refreshed",
        description: "Employee data has been updated",
      })
    }, 1000)
  }

  // Handle sorting
  const requestSort = (key: keyof Employee) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Filter employees
  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "All Departments" || employee.department === selectedDepartment
    const matchesRole = selectedRole === "All Roles" || employee.role === selectedRole
    const matchesStatus = selectedStatus === "All Statuses" || employee.status === selectedStatus
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Teaching" && employee.employmentType === "Teaching") ||
      (selectedType === "Non-Teaching" && employee.employmentType === "Non-Teaching")

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus && matchesType
  })

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0

    // if (sortConfig && a[sortConfig.key] < b[sortConfig.key]) {
    //   return sortConfig.direction === "ascending" ? -1 : 1
    // }
    // if (sortConfig.key && a[sortConfig.key] > b[sortConfig.key]) {
    //   return sortConfig.direction === "ascending" ? 1 : -1
    // }
    return 0
  })

  // Paginate employees
  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Navigate to employee detail
  const handleViewEmployee = (employeeId: number) => {
    navigate(`/d/payroll/employee/${employeeId}`)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Active":
        return "default"
      case "Inactive":
        return "destructive"
      case "On Leave":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("All Departments")
    setSelectedRole("All Roles")
    setSelectedStatus("All Statuses")
    setSelectedType("All")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("employee_management")}</h1>
          <p className="text-muted-foreground mt-1">{t("manage_staff_and_employee_details")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? t("refreshing") : t("refresh")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            {t("add_employee")}
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("total_employees")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.length}</div>
            <p className="text-xs text-muted-foreground">{t("across_all_departments")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("teaching_staff")}</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEmployees.filter((emp) => emp.employmentType === "Teaching").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("faculty_members")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("non_teaching_staff")}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEmployees.filter((emp) => emp.employmentType === "Non-Teaching").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("support_staff")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("departments")}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length - 1}</div>
            <p className="text-xs text-muted-foreground">{t("active_departments")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("employee_directory")}</CardTitle>
          <CardDescription>{t("view_and_manage_all_employees_in_the_system")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Staff Type Tabs */}
          <Tabs
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as "All" | "Teaching" | "Non-Teaching")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="All">{t("all_staff")}</TabsTrigger>
              <TabsTrigger value="Teaching">{t("teaching")}</TabsTrigger>
              <TabsTrigger value="Non-Teaching">{t("non_teaching")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("department")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("role")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search_by_name_code_or_email")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>

          {/* Employee Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("name")}>
                      {t("employee_name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("code")}>
                      {t("employee_code")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("role")}>
                      {t("role")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("department")}>
                      {t("department")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("employmentType")}>
                      {t("type")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("status")}>
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
                ) : paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ||
                      selectedDepartment !== "All Departments" ||
                      selectedRole !== "All Roles" ||
                      selectedStatus !== "All Statuses" ||
                      selectedType !== "All"
                        ? t("no_employees_match_your_search_criteria")
                        : t("no_employees_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewEmployee(employee.id)}
                    >
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.code}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            employee.employmentType === "Teaching"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }
                        >
                          {employee.employmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(employee.status)}>{employee.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewEmployee(employee.id)
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {t("view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredEmployees.length > 0 && (
            <div className="flex justify-center">
              <SaralPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeManagement
