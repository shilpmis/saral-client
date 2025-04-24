"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { toast } from "@/hooks/use-toast"
import { DollarSign, Save, Edit, Plus, Trash2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

// Mock data types
interface SalaryComponent {
  id: number
  name: string
  type: "Earning" | "Deduction" | "Benefit"
  amount: number
  percentage?: number
  isPercentage: boolean
  isEditable: boolean
  isActive: boolean
}

interface SalaryTemplate {
  id: number
  name: string
  description: string
  isActive: boolean
}

// Mock data for salary templates
const mockSalaryTemplates: SalaryTemplate[] = [
  {
    id: 1,
    name: "Teacher Grade I",
    description: "For senior teachers with more than 10 years of experience",
    isActive: true,
  },
  {
    id: 2,
    name: "Teacher Grade II",
    description: "For teachers with 5-10 years of experience",
    isActive: true,
  },
  {
    id: 3,
    name: "Teacher Grade III",
    description: "For teachers with less than 5 years of experience",
    isActive: true,
  },
  {
    id: 4,
    name: "Head Teacher Grade I",
    description: "For department heads and senior management",
    isActive: true,
  },
  {
    id: 5,
    name: "Administrator Grade I",
    description: "For administrative staff in senior positions",
    isActive: true,
  },
  {
    id: 6,
    name: "Support Staff Grade I",
    description: "For non-teaching support staff",
    isActive: true,
  },
]

// Mock data for salary components
const mockSalaryComponents: Record<string, SalaryComponent[]> = {
  "Teacher Grade II": [
    {
      id: 1,
      name: "Basic Salary",
      type: "Earning",
      amount: 22500,
      percentage: 50,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 2,
      name: "House Rent Allowance",
      type: "Earning",
      amount: 9000,
      percentage: 20,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 3,
      name: "Dearness Allowance",
      type: "Earning",
      amount: 4500,
      percentage: 10,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 4,
      name: "Transport Allowance",
      type: "Earning",
      amount: 3000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 5,
      name: "Special Allowance",
      type: "Earning",
      amount: 6000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 6,
      name: "Provident Fund",
      type: "Deduction",
      amount: 2700,
      percentage: 6,
      isPercentage: true,
      isEditable: false,
      isActive: true,
    },
    {
      id: 7,
      name: "Professional Tax",
      type: "Deduction",
      amount: 200,
      isPercentage: false,
      isEditable: false,
      isActive: true,
    },
    {
      id: 8,
      name: "Income Tax",
      type: "Deduction",
      amount: 1500,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 9,
      name: "Health Insurance",
      type: "Benefit",
      amount: 1000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 10,
      name: "Meal Vouchers",
      type: "Benefit",
      amount: 2000,
      isPercentage: false,
      isEditable: true,
      isActive: false,
    },
  ],
  "Head Teacher Grade I": [
    {
      id: 1,
      name: "Basic Salary",
      type: "Earning",
      amount: 32500,
      percentage: 50,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 2,
      name: "House Rent Allowance",
      type: "Earning",
      amount: 13000,
      percentage: 20,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 3,
      name: "Dearness Allowance",
      type: "Earning",
      amount: 6500,
      percentage: 10,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 4,
      name: "Transport Allowance",
      type: "Earning",
      amount: 4000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 5,
      name: "Special Allowance",
      type: "Earning",
      amount: 9000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 6,
      name: "Provident Fund",
      type: "Deduction",
      amount: 3900,
      percentage: 6,
      isPercentage: true,
      isEditable: false,
      isActive: true,
    },
    {
      id: 7,
      name: "Professional Tax",
      type: "Deduction",
      amount: 200,
      isPercentage: false,
      isEditable: false,
      isActive: true,
    },
    {
      id: 8,
      name: "Income Tax",
      type: "Deduction",
      amount: 3500,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 9,
      name: "Health Insurance",
      type: "Benefit",
      amount: 1500,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 10,
      name: "Leadership Allowance",
      type: "Benefit",
      amount: 5000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
  ],
  "Administrator Grade I": [
    {
      id: 1,
      name: "Basic Salary",
      type: "Earning",
      amount: 37500,
      percentage: 50,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 2,
      name: "House Rent Allowance",
      type: "Earning",
      amount: 15000,
      percentage: 20,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 3,
      name: "Dearness Allowance",
      type: "Earning",
      amount: 7500,
      percentage: 10,
      isPercentage: true,
      isEditable: true,
      isActive: true,
    },
    {
      id: 4,
      name: "Transport Allowance",
      type: "Earning",
      amount: 5000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 5,
      name: "Special Allowance",
      type: "Earning",
      amount: 10000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 6,
      name: "Provident Fund",
      type: "Deduction",
      amount: 4500,
      percentage: 6,
      isPercentage: true,
      isEditable: false,
      isActive: true,
    },
    {
      id: 7,
      name: "Professional Tax",
      type: "Deduction",
      amount: 200,
      isPercentage: false,
      isEditable: false,
      isActive: true,
    },
    {
      id: 8,
      name: "Income Tax",
      type: "Deduction",
      amount: 5000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 9,
      name: "Health Insurance",
      type: "Benefit",
      amount: 2000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
    {
      id: 10,
      name: "Administrative Allowance",
      type: "Benefit",
      amount: 6000,
      isPercentage: false,
      isEditable: true,
      isActive: true,
    },
  ],
}

interface EmployeeProps {
  employee: any
}

const EmployeeSalaryDetails: React.FC<EmployeeProps> = ({ employee }) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(employee.salaryTemplate || "")
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(
    mockSalaryComponents[employee.salaryTemplate || ""] || [],
  )
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate total earnings
  const calculateTotalEarnings = (components: SalaryComponent[]) => {
    return components
      .filter((comp) => comp.type === "Earning" && comp.isActive)
      .reduce((sum, comp) => sum + comp.amount, 0)
  }

  // Calculate total deductions
  const calculateTotalDeductions = (components: SalaryComponent[]) => {
    return components
      .filter((comp) => comp.type === "Deduction" && comp.isActive)
      .reduce((sum, comp) => sum + comp.amount, 0)
  }

  // Calculate total benefits
  const calculateTotalBenefits = (components: SalaryComponent[]) => {
    return components
      .filter((comp) => comp.type === "Benefit" && comp.isActive)
      .reduce((sum, comp) => sum + comp.amount, 0)
  }

  // Calculate net salary
  const calculateNetSalary = (components: SalaryComponent[]) => {
    const earnings = calculateTotalEarnings(components)
    const deductions = calculateTotalDeductions(components)
    return earnings - deductions
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`
  }

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "Changes saved",
          description: "Employee salary details have been updated",
        })
        setIsEditing(false)
      }, 1000)
    } else {
      setIsEditing(true)
    }
  }

  // Handle template change
  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName)
    setSalaryComponents(mockSalaryComponents[templateName] || [])
    setIsTemplateDialogOpen(false)
  }

  // Handle component change
  const handleComponentChange = (id: number, field: keyof SalaryComponent, value: any) => {
    setSalaryComponents(
      salaryComponents.map((component) => (component.id === id ? { ...component, [field]: value } : component)),
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("salary_details")}</h2>
        <Button onClick={handleEditToggle} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
            </>
          ) : isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" /> {t("save_changes")}
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" /> {t("edit")}
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {t("salary_structure")}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? t("edit_employee_salary_structure_and_components")
              : t("view_employee_salary_structure_and_components")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-medium">{t("salary_template")}</h3>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder={t("select_template")} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSalaryTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(true)}>
                    {t("view_details")}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground mt-1">{selectedTemplate || t("no_template_assigned")}</p>
              )}
            </div>

            <div className="mt-4 md:mt-0 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("gross_salary")}:</span>
                <span className="font-medium">{formatCurrency(calculateTotalEarnings(salaryComponents))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("total_deductions")}:</span>
                <span className="font-medium text-red-500">
                  {formatCurrency(calculateTotalDeductions(salaryComponents))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("total_benefits")}:</span>
                <span className="font-medium text-green-500">
                  {formatCurrency(calculateTotalBenefits(salaryComponents))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">{t("net_salary")}:</span>
                <span className="font-bold text-primary">{formatCurrency(calculateNetSalary(salaryComponents))}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Earnings Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              {t("earnings")}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("component_name")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("percentage")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  {isEditing && <TableHead>{t("actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents
                  .filter((comp) => comp.type === "Earning")
                  .map((component) => (
                    <TableRow key={component.id}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{component.type}</TableCell>
                      <TableCell>
                        {isEditing && component.isEditable ? (
                          <Input
                            type="number"
                            value={component.amount}
                            onChange={(e) => handleComponentChange(component.id, "amount", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(component.amount)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && component.isEditable && component.isPercentage ? (
                          <Input
                            type="number"
                            value={component.percentage || 0}
                            onChange={(e) => handleComponentChange(component.id, "percentage", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : component.percentage ? (
                          `${component.percentage}%`
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch
                            checked={component.isActive}
                            onCheckedChange={(checked) => handleComponentChange(component.id, "isActive", checked)}
                          />
                        ) : (
                          <Badge variant={component.isActive ? "default" : "secondary"}>
                            {component.isActive ? t("active") : t("inactive")}
                          </Badge>
                        )}
                      </TableCell>
                      {isEditing && (
                        <TableCell>
                          {component.isEditable ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-muted-foreground">{t("fixed")}</span>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-red-500" />
              {t("deductions")}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("component_name")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("percentage")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  {isEditing && <TableHead>{t("actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents
                  .filter((comp) => comp.type === "Deduction")
                  .map((component) => (
                    <TableRow key={component.id}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{component.type}</TableCell>
                      <TableCell>
                        {isEditing && component.isEditable ? (
                          <Input
                            type="number"
                            value={component.amount}
                            onChange={(e) => handleComponentChange(component.id, "amount", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(component.amount)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && component.isEditable && component.isPercentage ? (
                          <Input
                            type="number"
                            value={component.percentage || 0}
                            onChange={(e) => handleComponentChange(component.id, "percentage", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : component.percentage ? (
                          `${component.percentage}%`
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch
                            checked={component.isActive}
                            onCheckedChange={(checked) => handleComponentChange(component.id, "isActive", checked)}
                          />
                        ) : (
                          <Badge variant={component.isActive ? "default" : "secondary"}>
                            {component.isActive ? t("active") : t("inactive")}
                          </Badge>
                        )}
                      </TableCell>
                      {isEditing && (
                        <TableCell>
                          {component.isEditable ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-muted-foreground">{t("fixed")}</span>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Benefits Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
              {t("benefits")}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("component_name")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("percentage")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  {isEditing && <TableHead>{t("actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents
                  .filter((comp) => comp.type === "Benefit")
                  .map((component) => (
                    <TableRow key={component.id}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{component.type}</TableCell>
                      <TableCell>
                        {isEditing && component.isEditable ? (
                          <Input
                            type="number"
                            value={component.amount}
                            onChange={(e) => handleComponentChange(component.id, "amount", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(component.amount)
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && component.isEditable && component.isPercentage ? (
                          <Input
                            type="number"
                            value={component.percentage || 0}
                            onChange={(e) => handleComponentChange(component.id, "percentage", Number(e.target.value))}
                            className="w-24"
                          />
                        ) : component.percentage ? (
                          `${component.percentage}%`
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch
                            checked={component.isActive}
                            onCheckedChange={(checked) => handleComponentChange(component.id, "isActive", checked)}
                          />
                        ) : (
                          <Badge variant={component.isActive ? "default" : "secondary"}>
                            {component.isActive ? t("active") : t("inactive")}
                          </Badge>
                        )}
                      </TableCell>
                      {isEditing && (
                        <TableCell>
                          {component.isEditable ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-muted-foreground">{t("fixed")}</span>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Component Button (only in edit mode) */}
          {isEditing && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="flex items-center" onClick={() => setIsComponentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("add_component")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Details Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("salary_template_details")}</DialogTitle>
            <DialogDescription>{t("view_and_select_a_salary_template_for_this_employee")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {mockSalaryTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate === template.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
                onClick={() => handleTemplateChange(template.name)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center">
                      {template.name}
                      {selectedTemplate === template.name && <CheckCircle className="ml-2 h-4 w-4 text-primary" />}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? t("active") : t("inactive")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Component Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("add_salary_component")}</DialogTitle>
            <DialogDescription>{t("add_a_new_salary_component_to_this_employee")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="componentName">{t("component_name")}</Label>
              <Input id="componentName" placeholder={t("enter_component_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="componentType">{t("component_type")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_component_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Earning">{t("earning")}</SelectItem>
                  <SelectItem value="Deduction">{t("deduction")}</SelectItem>
                  <SelectItem value="Benefit">{t("benefit")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculationType">{t("calculation_type")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_calculation_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t("fixed_amount")}</SelectItem>
                  <SelectItem value="percentage">{t("percentage_of_basic")}</SelectItem>
                  <SelectItem value="percentageCTC">{t("percentage_of_ctc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="componentAmount">{t("amount")}</Label>
              <Input id="componentAmount" type="number" placeholder="0.00" />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="componentActive" defaultChecked />
              <Label htmlFor="componentActive">{t("active")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => setIsComponentDialogOpen(false)}>{t("add_component")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EmployeeSalaryDetails
