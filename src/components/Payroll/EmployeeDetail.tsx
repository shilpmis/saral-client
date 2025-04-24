import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import {
  ArrowLeft,
  User,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Download,
  Printer,
  Mail,
  Phone,
  GraduationCap,
  Edit,
} from "lucide-react"

// Import sub-components
import EmployeeOverview from "./Employee/EmployeeOverview"
import EmployeeSalaryDetails from "./Employee/EmployeeSalaryDetails"
import EmployeePayslips from "./Employee/EmployeePayslips"
import EmployeeLeaves from "./Employee/EmployeeLeaves"

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
  address?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  emergencyContact?: string
  bankDetails?: {
    accountNumber: string
    bankName: string
    ifscCode: string
    branch: string
  }
  salary?: number
  salaryTemplate?: string
  epfNo?: string
  uanNo?: string
  pfAccountNo?: string
}

// Mock employee data
const mockEmployeeData: Record<string, Employee> = {
  "1": {
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
    address: "123 Main Street, City Center, State - 400001",
    dateOfBirth: "1985-04-12",
    gender: "Male",
    bloodGroup: "O+",
    emergencyContact: "+91 9876543299",
    bankDetails: {
      accountNumber: "1234567890",
      bankName: "State Bank of India",
      ifscCode: "SBIN0001234",
      branch: "Main Branch, City Center",
    },
    salary: 45000,
    salaryTemplate: "Teacher Grade II",
    epfNo: "EP12345678",
    uanNo: "UAN123456789012",
    pfAccountNo: "PF12345678",
  },
  "2": {
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
    address: "456 Park Avenue, Suburb Area, State - 400002",
    dateOfBirth: "1980-09-25",
    gender: "Female",
    bloodGroup: "A+",
    emergencyContact: "+91 9876543222",
    bankDetails: {
      accountNumber: "9876543210",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0002345",
      branch: "City Mall Branch",
    },
    salary: 65000,
    salaryTemplate: "Head Teacher Grade I",
    epfNo: "EP87654321",
    uanNo: "UAN987654321098",
    pfAccountNo: "PF87654321",
  },
  "3": {
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
    address: "789 Office Complex, Business District, State - 400003",
    dateOfBirth: "1978-11-30",
    gender: "Male",
    bloodGroup: "B+",
    emergencyContact: "+91 9876543233",
    bankDetails: {
      accountNumber: "5678901234",
      bankName: "ICICI Bank",
      ifscCode: "ICIC0003456",
      branch: "Business District Branch",
    },
    salary: 75000,
    salaryTemplate: "Administrator Grade I",
    epfNo: "EP23456789",
    uanNo: "UAN234567890123",
    pfAccountNo: "PF23456789",
  },
}

const EmployeeDetail = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { employeeId } = useParams<{ employeeId: string }>()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        setTimeout(() => {
          if (employeeId && mockEmployeeData[employeeId]) {
            setEmployee(mockEmployeeData[employeeId])
          }
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching employee data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employee data. Please try again.",
        })
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [employeeId])

  // Handle back navigation
  const handleBack = () => {
    navigate("/d/payroll/employee")
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex-1">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_employees")}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("employee_not_found")}</CardTitle>
            <CardDescription>
              {t("the_employee_you_are_looking_for_does_not_exist_or_has_been_removed")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>{t("return_to_employee_list")}</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={handleBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_employees")}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> {t("print")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> {t("export")}
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" /> {t("edit")}
          </Button>
        </div>
      </div>

      {/* Employee Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={`/abstract-geometric-shapes.png?height=96&width=96&query=${employee.name}`}
                  alt={employee.name}
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Badge className={`absolute -top-2 -right-2`} variant={getStatusBadgeVariant(employee.status)}>
                {employee.status}
              </Badge>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold">{employee.name}</h1>
                <Badge variant="outline" className="w-fit">
                  {t("employee_code")}: {employee.code}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{employee.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("joined")}: {formatDate(employee.joiningDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{employee.contactNumber}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {employee.gender || "N/A"}
                </Badge>
                {employee.bloodGroup && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    {employee.bloodGroup}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${
                    employee.employmentType === "Teaching"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  <GraduationCap className="h-3 w-3" />
                  {employee.employmentType}
                </Badge>
                {employee.qualification && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {employee.qualification}
                  </Badge>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2">
              <Card className="border-l-4 border-l-primary w-full md:w-64">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">{t("salary_information")}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">{t("monthly_salary")}</span>
                      <span className="font-medium">₹{employee.salary?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">{t("template")}</span>
                      <span className="font-medium">{employee.salaryTemplate || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> {t("overview")}
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" /> {t("salary_details")}
          </TabsTrigger>
          <TabsTrigger value="payslips" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> {t("payslips")}
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {t("leaves")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <EmployeeOverview employee={employee} />
        </TabsContent>

        {/* Salary Details Tab */}
        <TabsContent value="salary" className="space-y-6 mt-6">
          <EmployeeSalaryDetails employee={employee} />
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="space-y-6 mt-6">
          <EmployeePayslips employee={employee} />
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-6 mt-6">
          <EmployeeLeaves employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmployeeDetail
