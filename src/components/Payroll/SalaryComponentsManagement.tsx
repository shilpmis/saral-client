"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  AlertCircle,
  ArrowUpDown,
  Calculator,
  Banknote,
  Heart,
} from "lucide-react"

// Define the schema for the salary component form
const salaryComponentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  code: z.string().min(1, { message: "Code is required" }),
  type: z.enum(["Earning", "Deduction", "Benefit"]),
  description: z.string().optional(),
  calculationType: z.enum(["Flat Amount", "Percentage of Basic"]),
  defaultValue: z.number().optional(),
  defaultPercentage: z.number().optional(),
  isActive: z.boolean().default(true),
  isPartOfSalaryStructure: z.boolean().default(true),
  isTaxable: z.boolean().default(false),
  isProRated: z.boolean().default(false),
  isFlexibleBenefit: z.boolean().default(false),
  considerForEPF: z.boolean().default(false),
  considerForESI: z.boolean().default(false),
  showInPayslip: z.boolean().default(true),
  nameInPayslip: z.string().optional(),
})

// Define types for our component
type SalaryComponent = z.infer<typeof salaryComponentSchema> & {
  id: number
  createdAt: string
  isSystemDefined: boolean
}

// Mock data for salary components
const mockSalaryComponents: SalaryComponent[] = [
  {
    id: 1,
    name: "Basic Salary",
    code: "BASIC",
    type: "Earning",
    description: "Base salary component that forms the core of the salary structure",
    calculationType: "Flat Amount",
    defaultValue: 30000,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: true,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: true,
    considerForESI: true,
    showInPayslip: true,
    nameInPayslip: "Basic Salary",
  },
  {
    id: 2,
    name: "House Rent Allowance",
    code: "HRA",
    type: "Earning",
    description: "Allowance provided to employees for rental accommodation",
    calculationType: "Percentage of Basic",
    defaultPercentage: 40,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: false,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "HRA",
  },
  {
    id: 3,
    name: "Dearness Allowance",
    code: "DA",
    type: "Earning",
    description: "Allowance to compensate for inflation and rising cost of living",
    calculationType: "Percentage of Basic",
    defaultPercentage: 10,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: true,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: true,
    considerForESI: true,
    showInPayslip: true,
    nameInPayslip: "DA",
  },
  {
    id: 4,
    name: "Transport Allowance",
    code: "TA",
    type: "Earning",
    description: "Allowance for commuting to and from work",
    calculationType: "Flat Amount",
    defaultValue: 3000,
    isActive: true,
    isSystemDefined: false,
    createdAt: "2023-01-20",
    isPartOfSalaryStructure: true,
    isTaxable: true,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "Transport Allowance",
  },
  {
    id: 5,
    name: "Special Allowance",
    code: "SA",
    type: "Earning",
    description: "Additional allowance based on role and responsibilities",
    calculationType: "Flat Amount",
    defaultValue: 5000,
    isActive: true,
    isSystemDefined: false,
    createdAt: "2023-01-20",
    isPartOfSalaryStructure: true,
    isTaxable: true,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "Special Allowance",
  },
  {
    id: 6,
    name: "Provident Fund",
    code: "PF",
    type: "Deduction",
    description: "Employee contribution to provident fund",
    calculationType: "Percentage of Basic",
    defaultPercentage: 12,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: false,
    isProRated: true,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "PF Contribution",
  },
  {
    id: 7,
    name: "Professional Tax",
    code: "PT",
    type: "Deduction",
    description: "Tax levied by state governments on professions, trades, and employments",
    calculationType: "Flat Amount",
    defaultValue: 200,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: false,
    isProRated: false,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "Prof Tax",
  },
  {
    id: 8,
    name: "Income Tax",
    code: "IT",
    type: "Deduction",
    description: "Tax deducted at source from employee's salary",
    calculationType: "Flat Amount",
    defaultValue: 0,
    isActive: true,
    isSystemDefined: true,
    createdAt: "2023-01-15",
    isPartOfSalaryStructure: true,
    isTaxable: false,
    isProRated: false,
    isFlexibleBenefit: false,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "TDS",
  },
  {
    id: 9,
    name: "Health Insurance",
    code: "HI",
    type: "Benefit",
    description: "Employee health insurance premium",
    calculationType: "Flat Amount",
    defaultValue: 1000,
    isActive: true,
    isSystemDefined: false,
    createdAt: "2023-02-10",
    isPartOfSalaryStructure: false,
    isTaxable: false,
    isProRated: false,
    isFlexibleBenefit: true,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "Health Insurance",
  },
  {
    id: 10,
    name: "Meal Vouchers",
    code: "MV",
    type: "Benefit",
    description: "Food allowance provided as meal vouchers",
    calculationType: "Flat Amount",
    defaultValue: 2000,
    isActive: false,
    isSystemDefined: false,
    createdAt: "2023-02-10",
    isPartOfSalaryStructure: false,
    isTaxable: false,
    isProRated: true,
    isFlexibleBenefit: true,
    considerForEPF: false,
    considerForESI: false,
    showInPayslip: true,
    nameInPayslip: "Meal Vouchers",
  },
]

const SalaryComponentsManagement = () => {
  const { t } = useTranslation()

  // State for components and UI
  const [components, setComponents] = useState<SalaryComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [activeTab, setActiveTab] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)

  // State for component dialog
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<SalaryComponent | null>(null)

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [componentToDelete, setComponentToDelete] = useState<SalaryComponent | null>(null)

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof salaryComponentSchema>>({
    resolver: zodResolver(salaryComponentSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "Earning",
      description: "",
      calculationType: "Flat Amount",
      defaultValue: 0,
      defaultPercentage: 0,
      isActive: true,
      isPartOfSalaryStructure: true,
      isTaxable: false,
      isProRated: false,
      isFlexibleBenefit: false,
      considerForEPF: false,
      considerForESI: false,
      showInPayslip: true,
      nameInPayslip: "",
    },
  })

  // Load data with simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setComponents(mockSalaryComponents)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setComponents(mockSalaryComponents)
      setIsRefreshing(false)
      toast({
        title: "Data refreshed",
        description: "Salary components have been updated",
      })
    }, 800)
  }

  // Filter components based on search, type, and tab
  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "All" || component.type === selectedType

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && component.isActive) ||
      (activeTab === "inactive" && !component.isActive)

    return matchesSearch && matchesType && matchesTab
  })

  // Sort components
  const sortedComponents = sortConfig
    ? [...filteredComponents].sort((a, b) => {
        if ((a[sortConfig.key as keyof SalaryComponent] ?? '') < (b[sortConfig.key as keyof SalaryComponent] ?? '')) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if ((a[sortConfig.key as keyof SalaryComponent] ?? '') > (b[sortConfig.key as keyof SalaryComponent] ?? '')) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    : filteredComponents

  // Request sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Handle add new component
  const handleAddComponent = () => {
    setIsEditMode(false)
    setSelectedComponent(null)
    form.reset({
      name: "",
      code: "",
      type: "Earning",
      description: "",
      calculationType: "Flat Amount",
      defaultValue: 0,
      defaultPercentage: 0,
      isActive: true,
      isPartOfSalaryStructure: true,
      isTaxable: false,
      isProRated: false,
      isFlexibleBenefit: false,
      considerForEPF: false,
      considerForESI: false,
      showInPayslip: true,
      nameInPayslip: "",
    })
    setIsComponentDialogOpen(true)
  }

  // Handle edit component
  const handleEditComponent = (component: SalaryComponent) => {
    setIsEditMode(true)
    setSelectedComponent(component)
    form.reset({
      name: component.name,
      code: component.code,
      type: component.type,
      description: component.description || "",
      calculationType: component.calculationType,
      defaultValue: component.defaultValue || 0,
      defaultPercentage: component.defaultPercentage || 0,
      isActive: component.isActive,
      isPartOfSalaryStructure: component.isPartOfSalaryStructure,
      isTaxable: component.isTaxable,
      isProRated: component.isProRated,
      isFlexibleBenefit: component.isFlexibleBenefit,
      considerForEPF: component.considerForEPF,
      considerForESI: component.considerForESI,
      showInPayslip: component.showInPayslip,
      nameInPayslip: component.nameInPayslip || component.name,
    })
    setIsComponentDialogOpen(true)
  }

  // Handle delete component
  const handleDeleteComponent = (component: SalaryComponent) => {
    setComponentToDelete(component)
    setIsDeleteDialogOpen(true)
  }

  // Handle form submission
  const onSubmit = (values: z.infer<typeof salaryComponentSchema>) => {
    if (isEditMode && selectedComponent) {
      // Update existing component
      const updatedComponents = components.map((comp) =>
        comp.id === selectedComponent.id
          ? {
              ...comp,
              ...values,
            }
          : comp,
      )

      setComponents(updatedComponents)
      toast({
        title: "Component updated",
        description: `${values.name} has been updated successfully`,
      })
    } else {
      // Add new component
      const newComponent: SalaryComponent = {
        id: components.length + 1,
        ...values,
        isSystemDefined: false,
        createdAt: new Date().toISOString().split("T")[0],
      }

      setComponents([...components, newComponent])
      toast({
        title: "Component added",
        description: `${values.name} has been added successfully`,
      })
    }

    setIsComponentDialogOpen(false)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (componentToDelete) {
      const updatedComponents = components.filter((comp) => comp.id !== componentToDelete.id)
      setComponents(updatedComponents)

      toast({
        title: "Component deleted",
        description: `${componentToDelete.name} has been deleted successfully`,
        variant: "destructive",
      })

      setIsDeleteDialogOpen(false)
      setComponentToDelete(null)
    }
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

  // Get component badge color based on type
  const getComponentBadgeVariant = (type: string) => {
    switch (type) {
      case "Earning":
        return "bg-green-50 text-green-700 border-green-200"
      case "Deduction":
        return "bg-red-50 text-red-700 border-red-200"
      case "Benefit":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return ""
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
          <h1 className="text-3xl font-bold tracking-tight">{t("salary_components")}</h1>
          <p className="text-muted-foreground mt-1">{t("manage_salary_components_for_payroll_calculation")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button onClick={handleAddComponent}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_component")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("salary_components")}</CardTitle>
          <CardDescription>{t("create_and_manage_salary_components_for_employee_payroll")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">{t("all_components")}</TabsTrigger>
              <TabsTrigger value="active">{t("active")}</TabsTrigger>
              <TabsTrigger value="inactive">{t("inactive")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("component_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t("all_types")}</SelectItem>
                  <SelectItem value="Earning">{t("earnings")}</SelectItem>
                  <SelectItem value="Deduction">{t("deductions")}</SelectItem>
                  <SelectItem value="Benefit">{t("benefits")}</SelectItem>
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

          {/* Components Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                    <div className="flex items-center">
                      {t("name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("code")}>
                    <div className="flex items-center">
                      {t("code")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("type")}>
                    <div className="flex items-center">
                      {t("type")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t("calculation_method")}</TableHead>
                  <TableHead>{t("default_value")}</TableHead>
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
                {sortedComponents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedType !== "All"
                        ? t("no_components_match_your_search_criteria")
                        : t("no_components_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedComponents.map((component) => (
                    <TableRow key={component.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{component.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getComponentBadgeVariant(component.type)}>
                          <div className="flex items-center">
                            {getComponentIcon(component.type)}
                            {component.type}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {component.calculationType === "Flat Amount" ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            {t("fixed_amount")}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                            {t("percentage_based")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {component.calculationType === "Percentage of Basic"
                          ? `${component.defaultPercentage}%`
                          : `₹${(component.defaultValue ?? 0).toLocaleString("en-IN")}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.isActive ? "default" : "secondary"}>
                          {component.isActive ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComponent(component)}
                            disabled={component.isSystemDefined}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComponent(component)}
                            disabled={component.isSystemDefined}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Component Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t("edit_salary_component") : t("add_salary_component")}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? t("update_the_details_of_the_salary_component")
                : t("create_a_new_salary_component_for_payroll_calculation")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("basic_information")}</h3>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("component_name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("e.g._basic_salary")} {...field} />
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
                          <FormLabel>{t("component_code")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("e.g._basic")} {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("a_short_code_used_to_identify_this_component_in_the_system")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("component_type")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_component_type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Earning">{t("earning")}</SelectItem>
                              <SelectItem value="Deduction">{t("deduction")}</SelectItem>
                              <SelectItem value="Benefit">{t("benefit")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === "Earning"
                              ? t("earnings_are_components_that_add_to_the_employee_salary")
                              : field.value === "Deduction"
                                ? t("deductions_are_components_that_reduce_the_employee_salary")
                                : t("benefits_are_non-monetary_components_provided_to_employees")}
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
                            <Textarea
                              placeholder={t("enter_component_description")}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("calculation_details")}</h3>

                    <FormField
                      control={form.control}
                      name="calculationType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t("calculation_method")}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Flat Amount" id="flat-amount" />
                                <Label htmlFor="flat-amount" className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {t("flat_amount")}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Percentage of Basic" id="percentage-basic" />
                                <Label htmlFor="percentage-basic" className="flex items-center">
                                  <Percent className="h-4 w-4 mr-1" />
                                  {t("percentage_of_basic_salary")}
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("calculationType") === "Flat Amount" ? (
                      <FormField
                        control={form.control}
                        name="defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("default_amount")}</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="mr-2">₹</span>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t("the_default_amount_to_be_used_when_assigning_this_component_to_employees")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="defaultPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("default_percentage")}</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="w-24"
                                />
                                <span className="ml-2">%</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t("the_default_percentage_of_basic_salary_to_be_used_for_this_component")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="nameInPayslip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("name_in_payslip")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={form.watch("name")}
                              {...field}
                              value={field.value || form.watch("name")}
                            />
                          </FormControl>
                          <FormDescription>{t("how_this_component_will_appear_in_employee_payslips")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("component_settings")}</h3>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("active")}</FormLabel>
                            <FormDescription>
                              {t("inactive_components_will_not_be_available_for_selection_in_salary_structures")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPartOfSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("part_of_salary_structure")}</FormLabel>
                            <FormDescription>
                              {t("include_this_component_in_the_employee_salary_structure")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isTaxable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("taxable")}</FormLabel>
                            <FormDescription>
                              {t("this_component_will_be_considered_for_income_tax_calculations")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isProRated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("pro_rata_calculation")}</FormLabel>
                            <FormDescription>
                              {t("calculate_this_component_on_a_pro-rata_basis_for_partial_month_attendance")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showInPayslip"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("show_in_payslip")}</FormLabel>
                            <FormDescription>{t("display_this_component_in_employee_payslips")}</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("statutory_settings")}</h3>

                    <FormField
                      control={form.control}
                      name="considerForEPF"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("consider_for_epf")}</FormLabel>
                            <FormDescription>
                              {t("include_this_component_when_calculating_employee_provident_fund_contributions")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="considerForESI"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("consider_for_esi")}</FormLabel>
                            <FormDescription>
                              {t("include_this_component_when_calculating_employee_state_insurance_contributions")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFlexibleBenefit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("flexible_benefit_plan")}</FormLabel>
                            <FormDescription>
                              {t(
                                "include_this_component_in_the_flexible_benefit_plan_allowing_employees_to_customize_their_benefits",
                              )}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {isEditMode && selectedComponent && selectedComponent.isSystemDefined && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">{t("system_defined_component")}</p>
                      <p className="text-sm text-amber-600">
                        {t("this_is_a_system_defined_component_and_some_fields_cannot_be_modified")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsComponentDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit">{isEditMode ? t("update_component") : t("add_component")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_salary_component")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("are_you_sure_you_want_to_delete_this_component")}? {t("this_action_cannot_be_undone")}.
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700">{t("warning")}</p>
                    <p className="text-sm text-amber-600">
                      {t(
                        "deleting_this_component_may_affect_existing_salary_templates_and_employee_payroll_calculations",
                      )}
                    </p>
                  </div>
                </div>
              </div>
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
    </div>
  )
}

export default SalaryComponentsManagement
