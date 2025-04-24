"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  AlertCircle,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  UserMinus,
  Check,
  Banknote,
  Calculator,
  Heart,
} from "lucide-react"

// Define the schema for the salary component
interface SalaryComponent {
  id: string
  name: string
  type: "Earning" | "Deduction" | "Benefit"
  calculationType: "Fixed Amount" | "Percentage of Basic" | "Percentage of CTC"
  value: number
  percentage: number
  isActive: boolean
  isSelected: boolean
}

// Define the schema for the salary template
interface SalaryTemplate {
  id: string
  name: string
  code: string
  description?: string
  applicableRoles: string[]
  annualCTC: number
  components: SalaryComponent[]
  isActive: boolean
  employeeCount: number
  createdAt: string
}

// Define the schema for the salary template form
const salaryTemplateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  code: z.string().min(1, { message: "Code is required" }),
  description: z.string().optional(),
  applicableRoles: z.array(z.string()).min(1, { message: "At least one role must be selected" }),
  annualCTC: z.number().min(0, { message: "Annual CTC must be a positive number" }),
  isActive: z.boolean().default(true),
})

// Mock data for available salary components
const availableSalaryComponents: SalaryComponent[] = [
  {
    id: "comp1",
    name: "Basic Salary",
    type: "Earning",
    calculationType: "Percentage of CTC",
    value: 0,
    percentage: 40,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp2",
    name: "House Rent Allowance",
    type: "Earning",
    calculationType: "Percentage of Basic",
    value: 0,
    percentage: 50,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp3",
    name: "Conveyance Allowance",
    type: "Earning",
    calculationType: "Fixed Amount",
    value: 1600,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp4",
    name: "Special Allowance",
    type: "Earning",
    calculationType: "Fixed Amount",
    value: 3000,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp5",
    name: "Medical Allowance",
    type: "Earning",
    calculationType: "Fixed Amount",
    value: 1250,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp6",
    name: "Professional Tax",
    type: "Deduction",
    calculationType: "Fixed Amount",
    value: 200,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp7",
    name: "Provident Fund",
    type: "Deduction",
    calculationType: "Percentage of Basic",
    value: 0,
    percentage: 12,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp8",
    name: "Income Tax",
    type: "Deduction",
    calculationType: "Fixed Amount",
    value: 0,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp9",
    name: "Health Insurance",
    type: "Benefit",
    calculationType: "Fixed Amount",
    value: 1000,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
  {
    id: "comp10",
    name: "Meal Vouchers",
    type: "Benefit",
    calculationType: "Fixed Amount",
    value: 2000,
    percentage: 0,
    isActive: true,
    isSelected: false,
  },
]

// Mock data for roles
const availableRoles = [
  { id: "role1", name: "Principal" },
  { id: "role2", name: "Head Teacher" },
  { id: "role3", name: "Teacher" },
  { id: "role4", name: "Clerk" },
  { id: "role5", name: "Accountant" },
  { id: "role6", name: "Librarian" },
  { id: "role7", name: "Lab Assistant" },
  { id: "role8", name: "Admin Staff" },
]

// Mock data for salary templates
const mockSalaryTemplates: SalaryTemplate[] = [
  {
    id: "template1",
    name: "Principal Salary Structure",
    code: "PRIN-SS",
    description: "Salary template for school principals",
    applicableRoles: ["Principal"],
    annualCTC: 1200000,
    components: [
      {
        id: "comp1",
        name: "Basic Salary",
        type: "Earning",
        calculationType: "Percentage of CTC",
        value: 480000,
        percentage: 40,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp2",
        name: "House Rent Allowance",
        type: "Earning",
        calculationType: "Percentage of Basic",
        value: 240000,
        percentage: 50,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp3",
        name: "Conveyance Allowance",
        type: "Earning",
        calculationType: "Fixed Amount",
        value: 19200,
        percentage: 0,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp7",
        name: "Provident Fund",
        type: "Deduction",
        calculationType: "Percentage of Basic",
        value: 57600,
        percentage: 12,
        isActive: true,
        isSelected: true,
      },
    ],
    isActive: true,
    employeeCount: 2,
    createdAt: "2023-01-15",
  },
  {
    id: "template2",
    name: "Teacher Salary Structure",
    code: "TEACH-SS",
    description: "Salary template for school teachers",
    applicableRoles: ["Teacher", "Head Teacher"],
    annualCTC: 600000,
    components: [
      {
        id: "comp1",
        name: "Basic Salary",
        type: "Earning",
        calculationType: "Percentage of CTC",
        value: 240000,
        percentage: 40,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp2",
        name: "House Rent Allowance",
        type: "Earning",
        calculationType: "Percentage of Basic",
        value: 120000,
        percentage: 50,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp3",
        name: "Conveyance Allowance",
        type: "Earning",
        calculationType: "Fixed Amount",
        value: 19200,
        percentage: 0,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp7",
        name: "Provident Fund",
        type: "Deduction",
        calculationType: "Percentage of Basic",
        value: 28800,
        percentage: 12,
        isActive: true,
        isSelected: true,
      },
    ],
    isActive: true,
    employeeCount: 45,
    createdAt: "2023-01-20",
  },
  {
    id: "template3",
    name: "Administrative Staff",
    code: "ADMIN-SS",
    description: "Salary template for administrative staff",
    applicableRoles: ["Clerk", "Accountant", "Admin Staff"],
    annualCTC: 480000,
    components: [
      {
        id: "comp1",
        name: "Basic Salary",
        type: "Earning",
        calculationType: "Percentage of CTC",
        value: 192000,
        percentage: 40,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp2",
        name: "House Rent Allowance",
        type: "Earning",
        calculationType: "Percentage of Basic",
        value: 96000,
        percentage: 50,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp3",
        name: "Conveyance Allowance",
        type: "Earning",
        calculationType: "Fixed Amount",
        value: 19200,
        percentage: 0,
        isActive: true,
        isSelected: true,
      },
      {
        id: "comp7",
        name: "Provident Fund",
        type: "Deduction",
        calculationType: "Percentage of Basic",
        value: 23040,
        percentage: 12,
        isActive: true,
        isSelected: true,
      },
    ],
    isActive: false,
    employeeCount: 12,
    createdAt: "2023-02-05",
  },
]

const SalaryTemplatesManagement = () => {
  const { t } = useTranslation()

  // State for templates and UI
  const [templates, setTemplates] = useState<SalaryTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("All")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)

  // State for template dialog
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null)

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<SalaryTemplate | null>(null)

  // State for dissociate confirmation
  const [isDissociateDialogOpen, setIsDissociateDialogOpen] = useState(false)
  const [templateToDissociate, setTemplateToDissociate] = useState<SalaryTemplate | null>(null)

  // State for selected components
  const [selectedComponents, setSelectedComponents] = useState<SalaryComponent[]>([])
  const [availableComponents, setAvailableComponents] = useState<SalaryComponent[]>([])

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof salaryTemplateSchema>>({
    resolver: zodResolver(salaryTemplateSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      applicableRoles: [],
      annualCTC: 0,
      isActive: true,
    },
  })

  // Load data with simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplates(mockSalaryTemplates)
      setAvailableComponents(availableSalaryComponents)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setTemplates(mockSalaryTemplates)
      setIsRefreshing(false)
      toast({
        title: "Data refreshed",
        description: "Salary templates have been updated",
      })
    }, 800)
  }

  // Filter templates based on search and role
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "All" || template.applicableRoles.includes(selectedRole)

    return matchesSearch && matchesRole
  })

  // Sort templates
  const sortedTemplates = sortConfig
    ? [...filteredTemplates].sort((a, b) => {
        if ((a[sortConfig.key as keyof SalaryTemplate] ?? "") < (b[sortConfig.key as keyof SalaryTemplate] ?? "")) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if ((a[sortConfig.key as keyof SalaryTemplate] ?? "") > (b[sortConfig.key as keyof SalaryTemplate] ?? "")) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    : filteredTemplates

  // Request sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Calculate totals
  const calculateTotalEarnings = (components: SalaryComponent[]) => {
    return components
      .filter((c) => c.type === "Earning" && c.isActive)
      .reduce((sum, component) => sum + component.value, 0)
  }

  const calculateTotalDeductions = (components: SalaryComponent[]) => {
    return components
      .filter((c) => c.type === "Deduction" && c.isActive)
      .reduce((sum, component) => sum + component.value, 0)
  }

  const calculateTotalBenefits = (components: SalaryComponent[]) => {
    return components
      .filter((c) => c.type === "Benefit" && c.isActive)
      .reduce((sum, component) => sum + component.value, 0)
  }

  const calculateNetSalary = (components: SalaryComponent[]) => {
    const totalEarnings = calculateTotalEarnings(components)
    const totalDeductions = calculateTotalDeductions(components)
    return totalEarnings - totalDeductions
  }

  const calculateMonthlySalary = (annualSalary: number) => {
    return annualSalary / 12
  }

  // Handle add new template
  const handleAddTemplate = () => {
    setIsEditMode(false)
    setSelectedTemplate(null)
    setSelectedComponents([])
    form.reset({
      name: "",
      code: "",
      description: "",
      applicableRoles: [],
      annualCTC: 0,
      isActive: true,
    })
    setIsTemplateDialogOpen(true)
  }

  // Handle edit template
  const handleEditTemplate = (template: SalaryTemplate) => {
    setIsEditMode(true)
    setSelectedTemplate(template)
    setSelectedComponents([...template.components])
    form.reset({
      name: template.name,
      code: template.code,
      description: template.description || "",
      applicableRoles: template.applicableRoles,
      annualCTC: template.annualCTC,
      isActive: template.isActive,
    })
    setIsTemplateDialogOpen(true)
  }

  // Handle duplicate template
  const handleDuplicateTemplate = (template: SalaryTemplate) => {
    const newTemplate = {
      ...template,
      id: `template${templates.length + 1}`,
      name: `${template.name} (Copy)`,
      code: `${template.code}-COPY`,
      employeeCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setTemplates([...templates, newTemplate])
    toast({
      title: "Template duplicated",
      description: `${newTemplate.name} has been created successfully`,
    })
  }

  // Handle delete template
  const handleDeleteTemplate = (template: SalaryTemplate) => {
    setTemplateToDelete(template)
    setIsDeleteDialogOpen(true)
  }

  // Handle dissociate employees
  const handleDissociateEmployees = (template: SalaryTemplate) => {
    setTemplateToDissociate(template)
    setIsDissociateDialogOpen(true)
  }

  // Handle toggle template status
  const handleToggleStatus = (template: SalaryTemplate) => {
    const updatedTemplates = templates.map((t) => (t.id === template.id ? { ...t, isActive: !t.isActive } : t))
    setTemplates(updatedTemplates)

    toast({
      title: template.isActive ? "Template deactivated" : "Template activated",
      description: `${template.name} has been ${template.isActive ? "deactivated" : "activated"} successfully`,
    })
  }

  // Handle component selection
  const handleComponentSelection = (component: SalaryComponent) => {
    const isAlreadySelected = selectedComponents.some((c) => c.id === component.id)

    if (isAlreadySelected) {
      setSelectedComponents(selectedComponents.filter((c) => c.id !== component.id))
    } else {
      // Create a copy of the component with isSelected set to true
      const newComponent = { ...component, isSelected: true }
      setSelectedComponents([...selectedComponents, newComponent])
    }
  }

  // Handle component value change
  const handleComponentValueChange = (componentId: string, key: string, value: any) => {
    setSelectedComponents(
      selectedComponents.map((component) => {
        if (component.id === componentId) {
          return { ...component, [key]: value }
        }
        return component
      }),
    )
  }

  // Update component values based on CTC
  const updateComponentValues = (ctc: number) => {
    const annualCTC = ctc || 0
    const updatedComponents = selectedComponents.map((component) => {
      let value = component.value

      if (component.calculationType === "Percentage of CTC") {
        value = (annualCTC * component.percentage) / 100
      } else if (component.calculationType === "Percentage of Basic") {
        // Find the basic salary component
        const basicComponent = selectedComponents.find(
          (c) => c.name === "Basic Salary" && c.calculationType === "Percentage of CTC",
        )
        if (basicComponent) {
          const basicValue = (annualCTC * basicComponent.percentage) / 100
          value = (basicValue * component.percentage) / 100
        }
      }

      return { ...component, value }
    })

    setSelectedComponents(updatedComponents)
  }

  // Watch for CTC changes
  const ctc = form.watch("annualCTC")
  useEffect(() => {
    updateComponentValues(ctc)
  }, [ctc])

  // Handle form submission
  const onSubmit = (values: z.infer<typeof salaryTemplateSchema>) => {
    if (isEditMode && selectedTemplate) {
      // Update existing template
      const updatedTemplates = templates.map((template) =>
        template.id === selectedTemplate.id
          ? {
              ...template,
              ...values,
              components: selectedComponents,
            }
          : template,
      )

      setTemplates(updatedTemplates)
      toast({
        title: "Template updated",
        description: `${values.name} has been updated successfully`,
      })
    } else {
      // Add new template
      const newTemplate: SalaryTemplate = {
        id: `template${templates.length + 1}`,
        ...values,
        components: selectedComponents,
        employeeCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      }

      setTemplates([...templates, newTemplate])
      toast({
        title: "Template added",
        description: `${values.name} has been added successfully`,
      })
    }

    setIsTemplateDialogOpen(false)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (templateToDelete) {
      const updatedTemplates = templates.filter((template) => template.id !== templateToDelete.id)
      setTemplates(updatedTemplates)

      toast({
        title: "Template deleted",
        description: `${templateToDelete.name} has been deleted successfully`,
        variant: "destructive",
      })

      setIsDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  // Handle confirm dissociate
  const handleConfirmDissociate = () => {
    if (templateToDissociate) {
      const updatedTemplates = templates.map((template) =>
        template.id === templateToDissociate.id ? { ...template, employeeCount: 0 } : template,
      )
      setTemplates(updatedTemplates)

      toast({
        title: "Employees dissociated",
        description: `Employees have been dissociated from ${templateToDissociate.name} successfully`,
      })

      setIsDissociateDialogOpen(false)
      setTemplateToDissociate(null)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get component icon based on type
  const getComponentIcon = (type: string) => {
    switch (type) {
      case "Earning":
        return <Banknote className="h-4 w-4 mr-1 text-green-600" />
      case "Deduction":
        return <Calculator className="h-4 w-4 mr-1 text-red-600" />
      case "Benefit":
        return <Heart className="h-4 w-4 mr-1 text-blue-600" />
      default:
        return <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-10 w-[300px] bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-[200px] bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("salary_templates")}</h1>
          <p className="text-muted-foreground mt-1">{t("manage_salary_templates_for_different_roles")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button onClick={handleAddTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_template")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("salary_templates")}</CardTitle>
          <CardDescription>{t("create_and_manage_salary_templates_for_different_employee_roles")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filter_by_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t("all_roles")}</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search_by_name_or_code")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>

          {/* Templates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                    <div className="flex items-center">
                      {t("template_name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("code")}>
                    <div className="flex items-center">
                      {t("code")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t("applicable_roles")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("annualCTC")}>
                    <div className="flex items-center">
                      {t("annual_ctc")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t("monthly_salary")}</TableHead>
                  <TableHead>{t("employees")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("isActive")}>
                    <div className="flex items-center">
                      {t("status")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedRole !== "All"
                        ? t("no_templates_match_your_search_criteria")
                        : t("no_templates_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTemplates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.code}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.applicableRoles.map((role) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(template.annualCTC)}</TableCell>
                      <TableCell>{formatCurrency(calculateMonthlySalary(template.annualCTC))}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.employeeCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {t("clone")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                              {template.isActive ? (
                                <>
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  {t("mark_as_inactive")}
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  {t("mark_as_active")}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {template.employeeCount > 0 && (
                              <DropdownMenuItem onClick={() => handleDissociateEmployees(template)}>
                                <UserMinus className="h-4 w-4 mr-2" />
                                {t("dissociate_employees")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-red-600 hover:text-red-700 focus:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t("edit_salary_template") : t("add_salary_template")}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? t("update_the_details_of_the_salary_template")
                : t("create_a_new_salary_template_for_employee_payroll")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("template_details")}</h3>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("template_name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("e.g._teacher_salary_structure")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("template_code")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("e.g._teach_ss")} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("a_short_code_used_to_identify_this_template_in_the_system")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("description")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("enter_template_description")} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicableRoles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>{t("applicable_roles")}</FormLabel>
                          <FormDescription>{t("select_the_roles_this_salary_template_will_apply_to")}</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {availableRoles.map((role) => (
                            <FormField
                              key={role.id}
                              control={form.control}
                              name="applicableRoles"
                              render={({ field }) => {
                                return (
                                  <FormItem key={role.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(role.name)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, role.name])
                                            : field.onChange(field.value?.filter((value) => value !== role.name))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{role.name}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annualCTC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("annual_ctc")}</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">₹</span>
                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("the_total_annual_cost_to_company_for_this_salary_template")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t("active_template")}</FormLabel>
                          <FormDescription>
                            {t("inactive_templates_will_not_be_available_for_assignment_to_employees")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("salary_components")}</h3>

                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{t("available_components")}</h4>
                      <p className="text-sm text-muted-foreground">{t("click_to_add_to_template")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2">
                      {availableComponents.map((component) => {
                        const isSelected = selectedComponents.some((c) => c.id === component.id)
                        return (
                          <div
                            key={component.id}
                            className={`p-2 border rounded-md cursor-pointer hover:bg-muted/50 ${
                              isSelected ? "bg-muted/50 border-primary" : ""
                            }`}
                            onClick={() => handleComponentSelection(component)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getComponentIcon(component.type)}
                                <span className="font-medium">{component.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  component.type === "Earning"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : component.type === "Deduction"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              >
                                {component.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {component.calculationType === "Fixed Amount"
                                ? `${formatCurrency(component.value)} (Fixed)`
                                : component.calculationType === "Percentage of Basic"
                                  ? `${component.percentage}% of Basic`
                                  : `${component.percentage}% of CTC`}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {selectedComponents.length > 0 ? (
                    <div className="border rounded-md">
                      <Accordion type="multiple" className="w-full">
                        <AccordionItem value="earnings">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center text-green-600">
                              <Banknote className="h-4 w-4 mr-2" />
                              {t("earnings")}
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                {selectedComponents.filter((c) => c.type === "Earning").length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("name")}</TableHead>
                                  <TableHead>{t("calculation")}</TableHead>
                                  <TableHead>{t("value")}</TableHead>
                                  <TableHead>{t("actions")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedComponents
                                  .filter((comp) => comp.type === "Earning")
                                  .map((component) => (
                                    <TableRow key={component.id}>
                                      <TableCell className="font-medium">{component.name}</TableCell>
                                      <TableCell>
                                        {component.calculationType === "Fixed Amount" ? (
                                          <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.value}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "value",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-24"
                                            />
                                          </div>
                                        ) : component.calculationType === "Percentage of Basic" ? (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of Basic</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of CTC</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>{formatCurrency(component.value)}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleComponentSelection(component)}
                                          className="h-8 w-8 p-0 text-red-500"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="deductions">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center text-red-600">
                              <Calculator className="h-4 w-4 mr-2" />
                              {t("deductions")}
                              <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">
                                {selectedComponents.filter((c) => c.type === "Deduction").length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("name")}</TableHead>
                                  <TableHead>{t("calculation")}</TableHead>
                                  <TableHead>{t("value")}</TableHead>
                                  <TableHead>{t("actions")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedComponents
                                  .filter((comp) => comp.type === "Deduction")
                                  .map((component) => (
                                    <TableRow key={component.id}>
                                      <TableCell className="font-medium">{component.name}</TableCell>
                                      <TableCell>
                                        {component.calculationType === "Fixed Amount" ? (
                                          <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.value}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "value",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-24"
                                            />
                                          </div>
                                        ) : component.calculationType === "Percentage of Basic" ? (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of Basic</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of CTC</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>{formatCurrency(component.value)}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleComponentSelection(component)}
                                          className="h-8 w-8 p-0 text-red-500"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="benefits">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center text-blue-600">
                              <Heart className="h-4 w-4 mr-2" />
                              {t("benefits")}
                              <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                {selectedComponents.filter((c) => c.type === "Benefit").length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("name")}</TableHead>
                                  <TableHead>{t("calculation")}</TableHead>
                                  <TableHead>{t("value")}</TableHead>
                                  <TableHead>{t("actions")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedComponents
                                  .filter((comp) => comp.type === "Benefit")
                                  .map((component) => (
                                    <TableRow key={component.id}>
                                      <TableCell className="font-medium">{component.name}</TableCell>
                                      <TableCell>
                                        {component.calculationType === "Fixed Amount" ? (
                                          <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.value}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "value",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-24"
                                            />
                                          </div>
                                        ) : component.calculationType === "Percentage of Basic" ? (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of Basic</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center">
                                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <Input
                                              type="number"
                                              value={component.percentage}
                                              onChange={(e) =>
                                                handleComponentValueChange(
                                                  component.id,
                                                  "percentage",
                                                  Number(e.target.value),
                                                )
                                              }
                                              className="w-20"
                                            />
                                            <span className="ml-1">% of CTC</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>{formatCurrency(component.value)}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleComponentSelection(component)}
                                          className="h-8 w-8 p-0 text-red-500"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="p-4 bg-muted/50 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center text-sm">
                              <span className="text-muted-foreground mr-2">{t("total_earnings")}:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(calculateTotalEarnings(selectedComponents))}
                              </span>
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <span className="text-muted-foreground mr-2">{t("total_deductions")}:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(calculateTotalDeductions(selectedComponents))}
                              </span>
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <span className="text-muted-foreground mr-2">{t("total_benefits")}:</span>
                              <span className="font-medium text-blue-600">
                                {formatCurrency(calculateTotalBenefits(selectedComponents))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">{t("net_monthly_salary")}</div>
                            <div className="text-xl font-bold text-primary">
                              {formatCurrency(calculateNetSalary(selectedComponents) / 12)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-6 text-center text-muted-foreground">
                      {t("no_components_added_yet._click_on_available_components_to_add_them_to_the_template")}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsTemplateDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid ||
                    selectedComponents.length === 0 ||
                    calculateTotalEarnings(selectedComponents) === 0
                  }
                >
                  {isEditMode ? t("update_template") : t("add_template")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_salary_template")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("are_you_sure_you_want_to_delete_this_template")}? {t("this_action_cannot_be_undone")}.
              {templateToDelete && templateToDelete.employeeCount > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">{t("warning")}</p>
                      <p className="text-sm text-amber-600">
                        {t("this_template_is_currently_assigned_to")} {templateToDelete.employeeCount}{" "}
                        {templateToDelete.employeeCount === 1 ? t("employee") : t("employees")}.{" "}
                        {t("deleting_it_will_remove_the_salary_structure_from_these_employees")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dissociate Confirmation Dialog */}
      <AlertDialog open={isDissociateDialogOpen} onOpenChange={setIsDissociateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dissociate_employees")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("are_you_sure_you_want_to_dissociate_all_employees_from_this_template")}?{" "}
              {templateToDissociate && (
                <span>
                  {t("this_will_remove_the_salary_structure_from")} {templateToDissociate.employeeCount}{" "}
                  {templateToDissociate.employeeCount === 1 ? t("employee") : t("employees")}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDissociate}>{t("dissociate")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SalaryTemplatesManagement
