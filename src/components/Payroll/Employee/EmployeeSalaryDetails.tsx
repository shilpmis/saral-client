// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { toast } from "@/hooks/use-toast"
// import {
//   DollarSign,
//   Plus,
//   Trash,
//   Save,
//   AlertCircle,
//   Edit,
//   Calendar,
//   X,
//   Loader2,
//   ExternalLink,
//   GiftIcon,
//   MinusIcon,
//   HelpCircleIcon,
// } from "lucide-react"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { format } from "date-fns"
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"
// import type { StaffType } from "@/types/staff"
// import {
//   useCreateStaffSalaryTemplateMutation,
//   useFetchAllSalaryTemplateQuery,
//   useLazyFetchSingleStaffSalaryTemplateQuery,
//   useUpdaetStaffSalaryTemplateMutation,
//   useLazyFetchAllSalaryComponentQuery,
// } from "@/services/PayrollService"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { Skeleton } from "@/components/ui/skeleton"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import type { SalaryComponent, StaffSalaryTemplate, SalaryTemplateComponentForStaff } from "@/types/payroll"

// interface EmployeeSalaryDetailsProps {
//   employee: StaffType
// }

// const EmployeeSalaryDetails = ({ employee }: EmployeeSalaryDetailsProps) => {
//   const { t } = useTranslation()
//   const navigate = useNavigate()
//   const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

//   // API hooks
//   const { data: salaryTemplates, isLoading: isLoadingTemplates } = useFetchAllSalaryTemplateQuery({
//     academic_session: CurrentAcademicSessionForSchool!.id,
//   })
//   const [fetchAllSalaryComponent, { data: availableComponents, isLoading: isLoadingComponents }] =
//     useLazyFetchAllSalaryComponentQuery()
//   const [createStaffSalaryTemplate, { isLoading: isCreating }] = useCreateStaffSalaryTemplateMutation()
//   const [updateStaffSalaryTemplate, { isLoading: isUpdating }] = useUpdaetStaffSalaryTemplateMutation()
//   const [fetchStaffSalary, { data: staffSalary, isLoading: isLoadingSalary, error: salaryError }] =
//     useLazyFetchSingleStaffSalaryTemplateQuery()

//   // State for salary data
//   const [salary, setSalary] = useState<StaffSalaryTemplate | null>(null)
//   const [isEditing, setIsEditing] = useState(false)
//   const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
//   const [annualCtc, setAnnualCtc] = useState<string>("0")
//   const [templateName, setTemplateName] = useState<string>(`${employee.first_name}'s Salary Template`)
//   const [templateCode, setTemplateCode] = useState<string>(`${employee.employee_code}-SALARY`)
//   const [templateDescription, setTemplateDescription] = useState<string>("Custom salary template")
//   const [salaryComponents, setSalaryComponents] = useState<
//     Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[]
//   >([])
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [activeTab, setActiveTab] = useState<"earning" | "deduction" | "benefits">("earning")
//   const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
//   const [componentSearchTerm, setComponentSearchTerm] = useState("")
//   const [hasFixedAmountComponent, setHasFixedAmountComponent] = useState(false)


//   // Helper function to get component details by ID
//   const getComponentById = (componentId: number): SalaryComponent | undefined => {
//     return availableComponents?.find((component) => component.id === componentId)
//   }


//   // Fetch staff salary data
//   useEffect(() => {
//     if (employee.id && CurrentAcademicSessionForSchool) {
//       fetchStaffSalary({
//         staff_id: employee.id,
//       })
//     }
//   }, [employee.id, CurrentAcademicSessionForSchool, fetchStaffSalary])

//   // Fetch available salary components
//   useEffect(() => {
//     if (CurrentAcademicSessionForSchool) {
//       fetchAllSalaryComponent({
//         academic_session: CurrentAcademicSessionForSchool.id,
//       })
//     }
//   }, [CurrentAcademicSessionForSchool, fetchAllSalaryComponent])

//   // Update local state when API data is received
//   useEffect(() => {
//     if (staffSalary) {
//       setSalary(staffSalary)
//       setSelectedTemplateId(staffSalary.base_template_id)
//       setAnnualCtc(staffSalary.annual_ctc)
//       setTemplateName(staffSalary.template_name)
//       setTemplateCode(staffSalary.template_code || `${employee.employee_code}-SALARY`)
//       setTemplateDescription(staffSalary.description || "Custom salary template")

//       // Map existing components
//       if (staffSalary.template_components) {
//         setSalaryComponents(staffSalary.template_components)

//         // Check if there's a fixed amount component
//         const fixedAmountComp = staffSalary.template_components.find((comp) => {
//           const component = availableComponents?.find((c) => c.id === comp.salary_components_id)
//           return component?.component_name === "Fixed Amount"
//         })
//         setHasFixedAmountComponent(!!fixedAmountComp)
//       }
//     } else {
//       setSalary(null)
//       // Set default values for new salary
//       setAnnualCtc("0")
//       setTemplateName(`${employee.first_name}'s Salary Template`)
//       setTemplateCode(`${employee.employee_code}-SALARY`)
//       setTemplateDescription("Custom salary template")
//       setSalaryComponents([])
//       setHasFixedAmountComponent(false)
//     }
//   }, [staffSalary, employee, availableComponents])

//   // Calculate monthly salary
//   const monthlySalary = useMemo(() => {
//     return (Number(annualCtc) / 12).toFixed(2)
//   }, [annualCtc])


//   // Calculate total earnings, deductions, and benefits
//   const totals = useMemo(() => {
//     let totalEarnings = 0
//     let totalDeductions = 0
//     let totalBenefits = 0

//     salaryComponents.forEach((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       if (!component) return

//       const amount = comp.amount ? Number(comp.amount) : 0

//       if (component.component_type === "earning") {
//         totalEarnings += amount
//       } else if (component.component_type === "deduction") {
//         totalDeductions += amount
//       } else if (component.component_type === "benefits") {
//         totalBenefits += amount
//       }
//     })

//     // Calculate net salary properly
//     const netSalary = totalEarnings - totalDeductions

//     // Calculate the difference between monthly salary and total earnings
//     const earningsDifference = Number(monthlySalary) - totalEarnings

//     return {
//       totalEarnings,
//       totalDeductions,
//       totalBenefits,
//       netSalary,
//       earningsDifference,
//     }
//   }, [salaryComponents, monthlySalary])

//   // Filter components by type
//   const filteredComponents = useMemo(() => {
//     return salaryComponents.filter((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       return component?.component_type === activeTab
//     })
//   }, [salaryComponents, activeTab])

//   // Filter available components for dialog
//   const filteredAvailableComponents = useMemo(() => {
//     if (!availableComponents) return []

//     return availableComponents.filter(
//       (comp) =>
//         comp.component_type === activeTab &&
//         comp.component_name.toLowerCase().includes(componentSearchTerm.toLowerCase()) &&
//         !salaryComponents.some((sc) => sc.salary_components_id === comp.id),
//     )
//   }, [availableComponents, activeTab, componentSearchTerm, salaryComponents])

//   // Load template data when selected
//   useEffect(() => {
//     if (!selectedTemplateId || !salaryTemplates) return

//     const template = salaryTemplates.find((t) => t.id === selectedTemplateId)
//     if (!template) return

//     // Create new components based on template
//     if (template.template_components && availableComponents) {
//       const newComponents: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[] =
//         template.template_components.map((comp) => {
//           // Calculate amount based on calculation method
//           let amount: string | null = null
//           let percentage: string | null = null

//           if (comp.amount !== null) {
//             amount = String(comp.amount)
//           }

//           if (comp.percentage !== null) {
//             percentage = String(comp.percentage)

//             // If percentage is set and based on annual CTC, calculate the amount
//             if (comp.is_based_on_annual_ctc && Number(annualCtc) > 0) {
//               const percentValue = Number(comp.percentage)
//               amount = ((percentValue / 100) * (Number(annualCtc) / 12)).toFixed(2)
//             }
//           }

//           return {
//             salary_components_id: comp.salary_components_id,
//             amount,
//             percentage,
//             is_mandatory: Boolean(comp.is_mandatory),
//             recovering_end_month: null,
//             total_recovering_amount: null,
//             total_recovered_amount: null,
//           }
//         })

//       setSalaryComponents(newComponents)

//       // Check if there's a fixed amount component
//       const fixedAmountComp = newComponents.find((comp) => {
//         const component = availableComponents.find((c) => c.id === comp.salary_components_id)
//         return component?.component_name === "Fixed Amount"
//       })
//       setHasFixedAmountComponent(!!fixedAmountComp)
//     }

//     setTemplateName(`${employee.first_name}'s ${template.template_name}`)
//     setTemplateDescription(template.description || "")
//     setAnnualCtc(String(template.annual_ctc))
//   }, [selectedTemplateId, salaryTemplates, employee, annualCtc, availableComponents])

//   // Handle amount change
//   const handleAmountChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]
//     const componentDetails = getComponentById(newComponents[index].salary_components_id)

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
//       setErrors({ ...errors, [`amount-${index}`]: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`amount-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].amount = value === "" ? null : value

//     // If percentage is set, update it based on the new amount
//     if (newComponents[index].percentage !== null && Number(annualCtc) > 0) {
//       const amountValue = value === "" ? 0 : Number(value)
//       newComponents[index].percentage = (((amountValue * 12) / Number(annualCtc)) * 100).toFixed(2)
//     }

//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists
//     updateFixedAmountComponent(newComponents)
//   }

//   // Handle percentage change
//   const handlePercentageChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]
//     const componentDetails = getComponentById(newComponents[index].salary_components_id)

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
//       setErrors({ ...errors, [`percentage-${index}`]: "Please enter a valid percentage (0-100)" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`percentage-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].percentage = value === "" ? null : value

//     // Update amount based on percentage
//     if (value !== "") {
//       const percentValue = Number(value)
//       newComponents[index].amount = ((percentValue / 100) * (Number(annualCtc) / 12)).toFixed(2)
//     } else {
//       newComponents[index].amount = null
//     }

//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists
//     updateFixedAmountComponent(newComponents)
//   }

//   // Handle recovering end month change
//   const handleRecoveringEndMonthChange = (index: number, value: string | null) => {
//     const newComponents = [...salaryComponents]
//     newComponents[index].recovering_end_month = value
//     setSalaryComponents(newComponents)
//   }

//   // Handle total recovering amount change
//   const handleTotalRecoveringAmountChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
//       setErrors({ ...errors, [`recovering-${index}`]: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`recovering-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].total_recovering_amount = value === "" ? null : value
//     setSalaryComponents(newComponents)
//   }

//   // Update fixed amount component
//   const updateFixedAmountComponent = (
//     components: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[],
//   ) => {
//     if (!hasFixedAmountComponent || !availableComponents) return

//     // Find fixed amount component
//     const fixedAmountComponent = availableComponents.find((comp) => comp.component_name === "Fixed Amount")
//     if (!fixedAmountComponent) return

//     // Calculate total earnings excluding fixed amount
//     let totalEarnings = 0
//     components.forEach((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       if (component?.component_type === "earning" && component.id !== fixedAmountComponent.id) {
//         totalEarnings += comp.amount ? Number(comp.amount) : 0
//       }
//     })

//     // Calculate fixed amount
//     const fixedAmount = Math.max(0, Number(monthlySalary) - totalEarnings)

//     // Update or add fixed amount component
//     const fixedIndex = components.findIndex((comp) => comp.salary_components_id === fixedAmountComponent.id)
//     if (fixedIndex >= 0) {
//       components[fixedIndex].amount = fixedAmount.toFixed(2)
//     } else if (fixedAmount > 0) {
//       components.push({
//         salary_components_id: fixedAmountComponent.id,
//         amount: fixedAmount.toFixed(2),
//         percentage: null,
//         is_mandatory: false,
//         recovering_end_month: null,
//         total_recovering_amount: null,
//         total_recovered_amount: null,
//       })
//     }

//     setSalaryComponents([...components])
//   }

//   // Handle annual CTC change
//   const handleAnnualCtcChange = (value: string) => {
//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) <= 0)) {
//       setErrors({ ...errors, annualCtc: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors.annualCtc
//       setErrors(newErrors)
//     }

//     // Update annual CTC
//     setAnnualCtc(value)

//     // Update percentage-based components
//     if (value !== "") {
//       const ctcValue = Number(value)
//       const newComponents = salaryComponents.map((comp) => {
//         const componentDetails = getComponentById(comp.salary_components_id)


//         if (comp.percentage !== null) {
//           const percentValue = Number(comp.percentage || "0")
//           return {
//             ...comp,
//             amount: ((percentValue / 100) * (ctcValue / 12)).toFixed(2),
//           }
//         }
//         return comp
//       })

//       setSalaryComponents(newComponents)

//       // Update fixed amount component
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Add fixed amount component
//   const addFixedAmountComponent = () => {
//     if (!availableComponents) return

//     // Find fixed amount component
//     const fixedAmountComponent = availableComponents.find((comp) => comp.component_name === "Fixed Amount")
//     if (!fixedAmountComponent) return

//     // Calculate fixed amount
//     const fixedAmount = Math.max(0, totals.earningsDifference)

//     // Add fixed amount component
//     const newComponents = [...salaryComponents]
//     newComponents.push({
//       salary_components_id: fixedAmountComponent.id,
//       amount: fixedAmount.toFixed(2),
//       percentage: null,
//       is_mandatory: false,
//       recovering_end_month: null,
//       total_recovering_amount: null,
//       total_recovered_amount: null,
//     })

//     setSalaryComponents(newComponents)
//     setHasFixedAmountComponent(true)
//   }

//   // Add new component
//   const handleAddComponent = (component: SalaryComponent) => {
//     // Check if this is the fixed amount component
//     const isFixedAmountComponent = component.component_name === "Fixed Amount"

//     // If adding fixed amount component, set flag
//     if (isFixedAmountComponent) {
//       setHasFixedAmountComponent(true)
//     }

//     let amount: string | null = "0"
//     let percentage: string | null = null

//     // Set initial values based on calculation method
//     if (component.calculation_method === "percentage") {
//       percentage = component.percentage ? String(component.percentage) : "0"

//       // Calculate amount based on percentage
//       if (Number(annualCtc) > 0) {
//         amount = ((Number(percentage) / 100) * (Number(annualCtc) / 12)).toFixed(2)
//       }
//     } else if (component.calculation_method === "amount" && component.amount) {
//       amount = String(component.amount)
//     }

//     // For fixed amount component, calculate the difference
//     if (isFixedAmountComponent) {
//       amount = Math.max(0, totals.earningsDifference).toFixed(2)
//     }

//     const newComponent: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id"> = {
//       salary_components_id: component.id,
//       amount,
//       percentage,
//       is_mandatory: component.is_mandatory,
//       recovering_end_month: null,
//       total_recovering_amount: null,
//       total_recovered_amount: null,
//     }

//     const newComponents = [...salaryComponents, newComponent]
//     setSalaryComponents(newComponents)
//     setIsComponentDialogOpen(false)

//     // Update fixed amount component if it exists and this isn't the fixed amount component
//     if (hasFixedAmountComponent && !isFixedAmountComponent) {
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Remove component
//   const handleRemoveComponent = (index: number) => {
//     // Check if component is mandatory
//     if (salaryComponents[index].is_mandatory) {
//       toast({
//         title: "Cannot remove mandatory component",
//         description: "This component is mandatory and cannot be removed",
//         variant: "destructive",
//       })
//       return
//     }

//     // Check if this is the fixed amount component
//     const componentDetails = getComponentById(salaryComponents[index].salary_components_id)
//     const isFixedAmountComponent = componentDetails?.component_name === "Fixed Amount"

//     // If removing fixed amount component, clear flag
//     if (isFixedAmountComponent) {
//       setHasFixedAmountComponent(false)
//     }

//     const newComponents = [...salaryComponents]
//     newComponents.splice(index, 1)
//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists and this isn't the fixed amount component
//     if (hasFixedAmountComponent && !isFixedAmountComponent) {
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Navigate to create/edit salary page
//   const handleNavigateToSalaryPage = () => {
//     if (salary) {
//       navigate(`/d/payroll/employee/${employee.id}/salary/edit`)
//     } else {
//       navigate(`/d/payroll/employee/${employee.id}/salary/create`)
//     }
//   }

//   // Save salary template
//   const handleSaveSalary = async () => {
//     // Validate form
//     const formErrors: Record<string, string> = {}

//     if (!templateName) {
//       formErrors.templateName = "Template name is required"
//     }

//     if (!annualCtc || Number(annualCtc) <= 0) {
//       formErrors.annualCtc = "Annual CTC must be greater than 0"
//     }

//     if (salaryComponents.length === 0) {
//       formErrors.components = "At least one salary component is required"
//     }

//     // Check if total earnings matches monthly salary
//     if (!hasFixedAmountComponent && Math.abs(totals.totalEarnings - Number(monthlySalary)) > 1) {
//       formErrors.totalEarnings = "Total earnings must match monthly salary. Consider adding a Fixed Amount component."
//     }

//     if (Object.keys(formErrors).length > 0 || Object.keys(errors).length > 0) {
//       setErrors({ ...errors, ...formErrors })
//       toast({
//         title: "Validation Error",
//         description: "Please fix the errors before saving",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       if (salary) {
//         // Update existing template
//         const response = await updateStaffSalaryTemplate({
//           salary_template_id: salary.id,
//           payload: {
//             template_name: templateName,
//             template_code: templateCode,
//             description: templateDescription,
//             annual_ctc: Number(annualCtc),
//             existing_salary_components: salaryComponents
//               .filter((comp) =>
//                 salary.template_components.some((c) => c.salary_components_id === comp.salary_components_id),
//               )
//               .map((comp) => ({
//                 salary_components_id: comp.salary_components_id,
//                 amount: comp.amount ? Number(comp.amount) : null,
//                 percentage: comp.percentage ? Number(comp.percentage) : null,
//                 recovering_end_month: comp.recovering_end_month,
//                 total_recovering_amount: comp.total_recovering_amount ? Number(comp.total_recovering_amount) : null,
//               })),
//             new_salary_components: salaryComponents
//               .filter(
//                 (comp) => !salary.template_components.some((c) => c.salary_components_id === comp.salary_components_id),
//               )
//               .map((comp) => {
//                 const componentDetails = getComponentById(comp.salary_components_id)
//                 return {
//                   salary_components_id: comp.salary_components_id,
//                   amount: comp.amount ? Number(comp.amount) : null,
//                   percentage: comp.percentage ? Number(comp.percentage) : null,
//                   is_mandatory: comp.is_mandatory,
//                   is_based_on_annual_ctc: componentDetails?.is_based_on_annual_ctc || false,
//                   end_month: null,
//                   recovery_amount: null,
//                   recovering_end_month: comp.recovering_end_month,
//                   total_recovering_amount: comp.total_recovering_amount ? Number(comp.total_recovering_amount) : null,
//                   total_recovered_amount: comp.total_recovered_amount ? Number(comp.total_recovered_amount) : null,
//                 }
//               }),
//             remove_salary_components: salary.template_components
//               .filter((comp) => !salaryComponents.some((c) => c.salary_components_id === comp.salary_components_id))
//               .map((comp) => ({
//                 salary_components_id: comp.salary_components_id,
//               })),
//           },
//         })

//         if (response.data) {
//           toast({
//             title: "Success",
//             description: "Salary template updated successfully",
//           })
//           setIsEditing(false)

//           // Refresh salary data
//           fetchStaffSalary({
//             staff_id: employee.id,
//           })
//         }
//       } else {
//         // Create new template
//         const response = await createStaffSalaryTemplate({
//           payload: {
//             base_template_id: selectedTemplateId,
//             staff_enrollments_id: employee.id,
//             template_name: templateName,
//             template_code: templateCode,
//             description: templateDescription,
//             annual_ctc: annualCtc,
//             template_components: salaryComponents.map((comp) => {
//               const componentDetails = getComponentById(comp.salary_components_id)
//               return {
//                 salary_components_id: comp.salary_components_id,
//                 amount: comp.amount !== null ? String(comp.amount) : null,
//                 percentage: comp.percentage !== null ? String(comp.percentage) : null,
//                 is_mandatory: comp.is_mandatory,
//                 is_based_on_annual_ctc: componentDetails?.is_based_on_annual_ctc || false,
//                 recovering_end_month: comp.recovering_end_month,
//                 total_recovering_amount:
//                   comp.total_recovering_amount !== null ? String(comp.total_recovering_amount) : null,
//                 total_recovered_amount:
//                   comp.total_recovered_amount !== null ? String(comp.total_recovered_amount) : null,
//               }
//             }),
//           },
//         })

//         if (response.data) {
//           toast({
//             title: "Success",
//             description: "Salary template created successfully",
//           })
//           setIsEditing(false)

//           // Refresh salary data
//           fetchStaffSalary({
//             staff_id: employee.id,
//           })
//         }
//       }
//     } catch (error) {
//       console.error("Error saving salary template:", error)
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred",
//         variant: "destructive",
//       })
//     }
//   }

//   // Format currency
//   const formatCurrency = (amount: string | number | null) => {
//     if (amount === null || amount === "" || isNaN(Number(amount))) return "₹0.00"
//     const numAmount = typeof amount === "string" ? Number(amount) : amount
//     return `₹${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
//   }

//   // Handle start editing
//   const handleStartEditing = () => {
//     setIsEditing(true)

//     // Initialize form with current data if available
//     if (salary) {
//       setSelectedTemplateId(salary.base_template_id)
//       setAnnualCtc(salary.annual_ctc)
//       setTemplateName(salary.template_name)
//       setTemplateCode(salary.template_code || `${employee.employee_code}-SALARY`)
//       setTemplateDescription(salary.description || "Custom salary template")

//       // Map existing components
//       if (salary.template_components) {
//         setSalaryComponents(salary.template_components)

//         // Check if there's a fixed amount component
//         const fixedAmountComp = salary.template_components.find((comp) => {
//           const component = availableComponents?.find((c) => c.id === comp.salary_components_id)
//           return component?.component_name === "Fixed Amount"
//         })
//         setHasFixedAmountComponent(!!fixedAmountComp)
//       }
//     } else {
//       // Set defaults for new salary
//       setSelectedTemplateId(null)
//       setAnnualCtc("0")
//       setTemplateName(`${employee.first_name}'s Salary Template`)
//       setTemplateCode(`${employee.employee_code}-SALARY`)
//       setTemplateDescription("Custom salary template")
//       setSalaryComponents([])
//       setHasFixedAmountComponent(false)
//     }
//   }

//   // Get deduction type display text
//   const getDeductionTypeText = (type: string | null) => {
//     switch (type) {
//       case "ends_on_selected_month":
//         return "Ends on selected month"
//       case "ends_never":
//         return "Never ends"
//       case "recovering_specific_amount":
//         return "Recovering specific amount"
//       default:
//         return "N/A"
//     }
//   }

//   // Get deduction type tooltip text
//   const getDeductionTypeTooltip = (type: string | null) => {
//     switch (type) {
//       case "ends_on_selected_month":
//         return "This deduction will continue until the specified month and then stop automatically."
//       case "ends_never":
//         return "This deduction will continue indefinitely until manually removed."
//       case "recovering_specific_amount":
//         return "This deduction will continue until the total specified amount has been recovered."
//       default:
//         return ""
//     }
//   }

//   // Loading state
//   if (isLoadingSalary) {
//     return (
//       <div className="space-y-6">
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-8 w-64" />
//             <Skeleton className="h-4 w-48" />
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="space-y-2">
//                     <Skeleton className="h-4 w-24" />
//                     <Skeleton className="h-6 w-full" />
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {Array.from({ length: 4 }).map((_, i) => (
//                   <Card key={i}>
//                     <CardContent className="pt-6">
//                       <Skeleton className="h-4 w-24 mb-2" />
//                       <Skeleton className="h-8 w-32" />
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>

//               <Tabs defaultValue="earning">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="earning">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                   <TabsTrigger value="deduction">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                   <TabsTrigger value="benefits">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="earning" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Skeleton className="h-64 w-full" />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Error state
//   if (salaryError) {
//     return (
//       <div className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <AlertCircle className="mr-2 h-5 w-5 text-destructive" /> {t("error_loading_salary_data")}
//             </CardTitle>
//             <CardDescription>{t("there_was_an_error_loading_the_salary_data_for_this_employee")}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>{t("error")}</AlertTitle>
//               <AlertDescription>{t("failed_to_load_salary_data_please_try_again_later")}</AlertDescription>
//             </Alert>
//             <div className="mt-4 flex justify-end">
//               <Button
//                 onClick={() =>
//                   fetchStaffSalary({
//                     staff_id: employee.id,
//                   })
//                 }
//               >
//                 {t("try_again")}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Salary Overview Card */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center">
//               <DollarSign className="mr-2 h-5 w-5" /> {t("salary_overview")}
//             </CardTitle>
//             <CardDescription>
//               {salary ? t("current_salary_structure_for_the_employee") : t("no_salary_structure_assigned_yet")}
//             </CardDescription>
//           </div>
//           <div className="flex gap-2">
//             {!isEditing && (
//               <>
//                 <Button variant="outline" onClick={handleNavigateToSalaryPage}>
//                   <ExternalLink className="mr-2 h-4 w-4" onClick={handleNavigateToSalaryPage}/>
//                   {salary ? t("advanced_edit") : t("advanced_create")}                  
//                 </Button>
//                 <Button onClick={handleStartEditing}>
//                   <Edit className="mr-2 h-4 w-4" /> {salary ? t("edit_salary") : t("assign_salary")}
//                 </Button>
//               </>
//             )}
//             {isEditing && (
//               <Button variant="outline" onClick={() => setIsEditing(false)}>
//                 <X className="mr-2 h-4 w-4" /> {t("cancel")}
//               </Button>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isEditing ? (
//             <div className="space-y-6">
//               {/* Template Selection */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="template">{t("base_salary_template")}</Label>
//                   <Select
//                     value={selectedTemplateId?.toString() || "custom"}
//                     onValueChange={(value) => setSelectedTemplateId(value === "custom" ? null : Number(value))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a template" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="custom">Custom Template</SelectItem>
//                       {salaryTemplates?.map((template) => (
//                         <SelectItem key={template.id} value={template.id.toString()}>
//                           {template.template_name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="annual-ctc">{t("annual_ctc")}</Label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
//                     <Input
//                       id="annual-ctc"
//                       type="number"
//                       className="pl-8"
//                       value={annualCtc}
//                       onChange={(e) => handleAnnualCtcChange(e.target.value)}
//                     />
//                   </div>
//                   {errors.annualCtc && <p className="text-sm text-destructive">{errors.annualCtc}</p>}
//                 </div>
//               </div>

//               {/* Monthly Salary Display */}
//               <div className="bg-muted p-4 rounded-md flex justify-between items-center">
//                 <div>
//                   <p className="text-sm text-muted-foreground">{t("monthly_salary")}</p>
//                   <p className="text-2xl font-bold">{formatCurrency(monthlySalary)}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-muted-foreground">{t("net_salary")}</p>
//                   <p className="text-2xl font-bold">{formatCurrency(totals.netSalary)}</p>
//                 </div>
//               </div>

//               {/* Template Details */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="template-name">{t("template_name")}</Label>
//                   <Input id="template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
//                   {errors.templateName && <p className="text-sm text-destructive">{errors.templateName}</p>}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="template-code">{t("template_code")}</Label>
//                   <Input id="template-code" value={templateCode} onChange={(e) => setTemplateCode(e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="template-description">{t("description")}</Label>
//                   <Input
//                     id="template-description"
//                     value={templateDescription}
//                     onChange={(e) => setTemplateDescription(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Salary Components */}
//               <div className="space-y-4">
//                 <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
//                   <TabsList className="grid w-full grid-cols-3">
//                     <TabsTrigger value="earning" className="flex items-center">
//                       <Plus className="mr-2 h-4 w-4" /> {t("earnings")}
//                     </TabsTrigger>
//                     <TabsTrigger value="deduction" className="flex items-center">
//                       <MinusIcon className="mr-2 h-4 w-4" /> {t("deductions")}
//                     </TabsTrigger>
//                     <TabsTrigger value="benefits" className="flex items-center">
//                       <GiftIcon className="mr-2 h-4 w-4" /> {t("benefits")}
//                     </TabsTrigger>
//                   </TabsList>

//                   <div className="mt-4">
//                     <div className="flex justify-between mb-4">
//                       <div>
//                         {activeTab === "earning" && !hasFixedAmountComponent && totals.earningsDifference > 0 && (
//                           <Button variant="outline" onClick={addFixedAmountComponent}>
//                             <Plus className="mr-2 h-4 w-4" /> Add Fixed Amount (
//                             {formatCurrency(totals.earningsDifference)})
//                           </Button>
//                         )}
//                       </div>
//                       <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
//                         <DialogTrigger asChild>
//                           <Button>
//                             <Plus className="mr-2 h-4 w-4" /> {t("add_component")}
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-[500px]">
//                           <DialogHeader>
//                             <DialogTitle>{t("add_salary_component")}</DialogTitle>
//                             <DialogDescription>
//                               {t("select_a_component_to_add_to_the_salary_template")}
//                             </DialogDescription>
//                           </DialogHeader>
//                           <div className="py-4">
//                             <Input
//                               placeholder={t("search_components")}
//                               value={componentSearchTerm}
//                               onChange={(e) => setComponentSearchTerm(e.target.value)}
//                               className="mb-4"
//                             />
//                             <ScrollArea className="h-[300px]">
//                               {isLoadingComponents ? (
//                                 <div className="space-y-2">
//                                   {Array.from({ length: 5 }).map((_, i) => (
//                                     <Skeleton key={i} className="h-12 w-full" />
//                                   ))}
//                                 </div>
//                               ) : filteredAvailableComponents.length > 0 ? (
//                                 <div className="space-y-2">
//                                   {filteredAvailableComponents.map((component) => (
//                                     <div
//                                       key={component.id}
//                                       className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
//                                       onClick={() => handleAddComponent(component)}
//                                     >
//                                       <div>
//                                         <p className="font-medium">{component.component_name}</p>
//                                         <p className="text-sm text-muted-foreground">
//                                           {component.calculation_method === "amount"
//                                             ? t("fixed_amount")
//                                             : t("percentage")}
//                                         </p>
//                                       </div>
//                                       <div className="flex items-center">
//                                         {component.is_mandatory && (
//                                           <Badge variant="outline" className="mr-2">
//                                             {t("mandatory")}
//                                           </Badge>
//                                         )}
//                                         <Plus className="h-4 w-4" />
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               ) : (
//                                 <div className="text-center py-4 text-muted-foreground">
//                                   {componentSearchTerm
//                                     ? t("no_matching_components_found")
//                                     : t("no_available_components_for_this_type")}
//                                 </div>
//                               )}
//                             </ScrollArea>
//                           </div>
//                           <DialogFooter>
//                             <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>
//                               {t("cancel")}
//                             </Button>
//                           </DialogFooter>
//                         </DialogContent>
//                       </Dialog>
//                     </div>

//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t("component_name")}</TableHead>
//                           <TableHead>{t("calculation_method")}</TableHead>
//                           {/* Show amount field for all component types */}
//                           <TableHead className="text-right">{t("amount")}</TableHead>
//                           {/* Show percentage field only for earning components */}
//                           {activeTab === "earning" && <TableHead className="text-right">{t("percentage")}</TableHead>}
//                           {activeTab !== "earning" && <TableHead>{t("recovery_details")}</TableHead>}
//                           <TableHead className="text-right">{t("actions")}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredComponents.length === 0 ? (
//                           <TableRow>
//                             <TableCell colSpan={activeTab === "earning" ? 5 : 4} className="text-center py-4">
//                               <p className="text-muted-foreground">{t("no_components_added")}</p>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="mt-2"
//                                 onClick={() => setIsComponentDialogOpen(true)}
//                               >
//                                 <Plus className="mr-2 h-4 w-4" /> {t("add_component")}
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ) : (
//                           filteredComponents.map((component, index) => {
//                             const globalIndex = salaryComponents.findIndex(
//                               (c) => c.salary_components_id === component.salary_components_id,
//                             )
//                             const componentDetails = getComponentById(component.salary_components_id)
//                             return (
//                               <TableRow key={component.salary_components_id}>
//                                 <TableCell>
//                                   <div className="font-medium">{componentDetails?.component_name}</div>
//                                   {component.is_mandatory && (
//                                     <Badge variant="outline" className="mt-1">
//                                       {t("mandatory")}
//                                     </Badge>
//                                   )}
//                                 </TableCell>
//                                 <TableCell>
//                                   <Badge variant="outline">
//                                     {componentDetails?.calculation_method === "amount"
//                                       ? t("fixed_amount")
//                                       : t("percentage")}
//                                   </Badge>
//                                 </TableCell>
//                                 {/* Amount field for all component types */}
//                                 <TableCell className="text-right">
//                                   <div className="relative w-24 ml-auto">
//                                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
//                                     <Input
//                                       type="number"
//                                       className="pl-8 text-right"
//                                       value={component.amount === null ? "" : component.amount}
//                                       onChange={(e) => handleAmountChange(globalIndex, e.target.value)}
//                                     />
//                                   </div>
//                                   {errors[`amount-${globalIndex}`] && (
//                                     <p className="text-xs text-destructive mt-1">{errors[`amount-${globalIndex}`]}</p>
//                                   )}
//                                 </TableCell>
//                                 {/* Percentage field only for earning components */}
//                                 {activeTab === "earning" && (
//                                   <TableCell className="text-right">
//                                     <div className="relative w-24 ml-auto">
//                                       <Input
//                                         type="number"
//                                         className="pr-8 text-right"
//                                         value={component.percentage === null ? "" : component.percentage}
//                                         onChange={(e) => handlePercentageChange(globalIndex, e.target.value)}
//                                       />
//                                       <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
//                                     </div>
//                                     {errors[`percentage-${globalIndex}`] && (
//                                       <p className="text-xs text-destructive mt-1">
//                                         {errors[`percentage-${globalIndex}`]}
//                                       </p>
//                                     )}
//                                   </TableCell>
//                                 )}
//                                 {activeTab !== "earning" && (
//                                   <TableCell>
//                                     {/* Show appropriate fields based on deduction/benefit type */}
//                                     {activeTab === "deduction" &&
//                                     componentDetails!.deduction_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>Total Amount:</Label>
//                                           <div className="relative w-24">
//                                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                                               ₹
//                                             </span>
//                                             <Input
//                                               type="number"
//                                               className="pl-8"
//                                               value={
//                                                 component.total_recovering_amount === null
//                                                   ? ""
//                                                   : component.total_recovering_amount
//                                               }
//                                               onChange={(e) =>
//                                                 handleTotalRecoveringAmountChange(globalIndex, e.target.value)
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                         {errors[`recovering-${globalIndex}`] && (
//                                           <p className="text-xs text-destructive">
//                                             {errors[`recovering-${globalIndex}`]}
//                                           </p>
//                                         )}
//                                       </div>
//                                     ) : activeTab === "deduction" &&
//                                       componentDetails!.deduction_type === "ends_on_selected_month" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                       </div>
//                                     ) : activeTab === "benefits" &&
//                                       componentDetails!.benefit_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>Total Amount:</Label>
//                                           <div className="relative w-24">
//                                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                                               ₹
//                                             </span>
//                                             <Input
//                                               type="number"
//                                               className="pl-8"
//                                               value={
//                                                 component.total_recovering_amount === null
//                                                   ? ""
//                                                   : component.total_recovering_amount
//                                               }
//                                               onChange={(e) =>
//                                                 handleTotalRecoveringAmountChange(globalIndex, e.target.value)
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                         {errors[`recovering-${globalIndex}`] && (
//                                           <p className="text-xs text-destructive">
//                                             {errors[`recovering-${globalIndex}`]}
//                                           </p>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <div className="flex items-center">
//                                         <TooltipProvider>
//                                           <Tooltip>
//                                             <TooltipTrigger asChild>
//                                               <Badge variant="outline" className="flex items-center gap-1">
//                                                 {activeTab === "deduction"
//                                                   ? getDeductionTypeText(componentDetails!.deduction_type)
//                                                   : getDeductionTypeText(componentDetails!.benefit_type)}
//                                                 <HelpCircleIcon className="h-3 w-3 ml-1" />
//                                               </Badge>
//                                             </TooltipTrigger>
//                                             <TooltipContent>
//                                               <p>
//                                                 {activeTab === "deduction"
//                                                   ? getDeductionTypeTooltip(componentDetails!.deduction_type)
//                                                   : getDeductionTypeTooltip(componentDetails!.benefit_type)}
//                                               </p>
//                                             </TooltipContent>
//                                           </Tooltip>
//                                         </TooltipProvider>
//                                       </div>
//                                     )}
//                                   </TableCell>
//                                 )}
//                                 <TableCell className="text-right">
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     onClick={() => handleRemoveComponent(globalIndex)}
//                                     disabled={component.is_mandatory}
//                                   >
//                                     <Trash className="h-4 w-4" />
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>
//                             )
//                           })
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </Tabs>
//               </div>

//               {/* Summary */}
//               <div className="bg-muted p-4 rounded-md">
//                 <h3 className="font-medium mb-2">{t("salary_summary")}</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span>{t("total_earnings")}</span>
//                     <span className="font-medium">{formatCurrency(totals.totalEarnings)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>{t("total_deductions")}</span>
//                     <span className="font-medium text-destructive">- {formatCurrency(totals.totalDeductions)}</span>
//                   </div>
//                   <Separator className="my-2" />
//                   <div className="flex justify-between">
//                     <span className="font-medium">{t("net_salary")}</span>
//                     <span className="font-bold">{formatCurrency(totals.netSalary)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>{t("employer_contributions")}</span>
//                     <span>{formatCurrency(totals.totalBenefits)}</span>
//                   </div>
//                 </div>

//                 {!hasFixedAmountComponent && Math.abs(totals.totalEarnings - Number(monthlySalary)) > 1 && (
//                   <Alert variant="destructive" className="mt-4">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertTitle>Earnings mismatch</AlertTitle>
//                     <AlertDescription>
//                       Total earnings ({formatCurrency(totals.totalEarnings)}) do not match monthly salary (
//                       {formatCurrency(monthlySalary)}).
//                       <Button
//                         variant="link"
//                         className="p-0 h-auto text-destructive underline ml-1"
//                         onClick={addFixedAmountComponent}
//                       >
//                         Add Fixed Amount component ({formatCurrency(totals.earningsDifference)})
//                       </Button>
//                     </AlertDescription>
//                   </Alert>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setIsEditing(false)}>
//                   <X className="mr-2 h-4 w-4" /> {t("cancel")}
//                 </Button>
//                 <Button onClick={handleSaveSalary} disabled={isCreating || isUpdating}>
//                   {isCreating || isUpdating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" /> {t("save")}
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           ) : salary ? (
//             <div className="space-y-6">
//               {/* Template Info */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label className="text-muted-foreground">{t("template_name")}</Label>
//                   <p className="font-medium mt-1">{salary.template_name}</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">{t("template_code")}</Label>
//                   <p className="font-medium mt-1">{salary.template_code || "N/A"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">{t("description")}</Label>
//                   <p className="font-medium mt-1">{salary.description || "N/A"}</p>
//                 </div>
//               </div>

//               {/* Base Template Info */}
//               {salary.base_template && (
//                 <div className="bg-muted p-4 rounded-md">
//                   <h3 className="font-medium mb-2">{t("base_template_info")}</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <Label className="text-muted-foreground">{t("template_name")}</Label>
//                       <p className="font-medium mt-1">{salary.base_template.template_name}</p>
//                     </div>
//                     <div>
//                       <Label className="text-muted-foreground">{t("template_code")}</Label>
//                       <p className="font-medium mt-1">{salary.base_template.template_code || "N/A"}</p>
//                     </div>
//                     <div>
//                       <Label className="text-muted-foreground">{t("annual_ctc")}</Label>
//                       <p className="font-medium mt-1">{formatCurrency(salary.base_template.annual_ctc)}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Salary Summary */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("annual_ctc")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(salary.annual_ctc)}</div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("monthly_salary")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(Number(salary.annual_ctc) / 12)}</div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("total_deductions")}</div>
//                     <div className="text-2xl font-bold mt-1 text-destructive">
//                       {formatCurrency(totals.totalDeductions)}
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("net_salary")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(totals.netSalary)}</div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Salary Components */}
//               <Tabs defaultValue="earning">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="earning">{t("earnings")}</TabsTrigger>
//                   <TabsTrigger value="deduction">{t("deductions")}</TabsTrigger>
//                   <TabsTrigger value="benefits">{t("benefits")}</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="earning" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead className="text-right">{t("percentage")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "earning"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell className="text-right">
//                                     {comp.percentage !== null ? `${comp.percentage}%` : "N/A"}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="deduction" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead>{t("recovery_details")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "deduction"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell>
//                                     {componentDetails!.deduction_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-1">
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Total:</span>
//                                           <span>{formatCurrency(comp.total_recovering_amount)}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Until:</span>
//                                           <span>
//                                             {comp.recovering_end_month
//                                               ? format(new Date(comp.recovering_end_month), "MMM yyyy")
//                                               : "N/A"}
//                                           </span>
//                                         </div>
//                                         {comp.total_recovered_amount && Number(comp.total_recovered_amount) > 0 && (
//                                           <div className="flex items-center gap-2">
//                                             <span className="text-sm text-muted-foreground">Recovered:</span>
//                                             <span>{formatCurrency(comp.total_recovered_amount)}</span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <TooltipProvider>
//                                         <Tooltip>
//                                           <TooltipTrigger asChild>
//                                             <div className="flex items-center">
//                                               <span>{getDeductionTypeText(componentDetails!.deduction_type)}</span>
//                                               <HelpCircleIcon className="h-4 w-4 ml-1" />
//                                             </div>
//                                           </TooltipTrigger>
//                                           <TooltipContent>
//                                             <p>{getDeductionTypeTooltip(componentDetails!.deduction_type)}</p>
//                                           </TooltipContent>
//                                         </Tooltip>
//                                       </TooltipProvider>
//                                     )}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="benefits" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead>{t("recovery_details")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "benefits"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell>
//                                     {componentDetails!.benefit_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-1">
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Total:</span>
//                                           <span>{formatCurrency(comp.total_recovering_amount)}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Until:</span>
//                                           <span>
//                                             {comp.recovering_end_month
//                                               ? format(new Date(comp.recovering_end_month), "MMM yyyy")
//                                               : "N/A"}
//                                           </span>
//                                         </div>
//                                         {comp.total_recovered_amount && Number(comp.total_recovered_amount) > 0 && (
//                                           <div className="flex items-center gap-2">
//                                             <span className="text-sm text-muted-foreground">Recovered:</span>
//                                             <span>{formatCurrency(comp.total_recovered_amount)}</span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <TooltipProvider>
//                                         <Tooltip>
//                                           <TooltipTrigger asChild>
//                                             <div className="flex items-center">
//                                               <span>{getDeductionTypeText(componentDetails!.benefit_type)}</span>
//                                               <HelpCircleIcon className="h-4 w-4 ml-1" />
//                                             </div>
//                                           </TooltipTrigger>
//                                           <TooltipContent>
//                                             <p>{getDeductionTypeTooltip(componentDetails!.benefit_type)}</p>
//                                           </TooltipContent>
//                                         </Tooltip>
//                                       </TooltipProvider>
//                                     )}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           ) : (
//             <Alert>
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>No salary assigned</AlertTitle>
//               <AlertDescription>
//                 This employee does not have a salary structure assigned yet. Click the "Assign Salary" button to create
//                 one.
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default EmployeeSalaryDetails

// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { toast } from "@/hooks/use-toast"
// import {
//   DollarSign,
//   Plus,
//   Trash,
//   Save,
//   AlertCircle,
//   Edit,
//   Calendar,
//   X,
//   Loader2,
//   ExternalLink,
//   GiftIcon,
//   MinusIcon,
//   HelpCircleIcon,
// } from "lucide-react"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { format } from "date-fns"
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"
// import type { StaffType } from "@/types/staff"
// import {
//   useCreateStaffSalaryTemplateMutation,
//   useFetchAllSalaryTemplateQuery,
//   useLazyFetchSingleStaffSalaryTemplateQuery,
//   useUpdaetStaffSalaryTemplateMutation,
//   useLazyFetchAllSalaryComponentQuery,
// } from "@/services/PayrollService"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { Skeleton } from "@/components/ui/skeleton"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import type { SalaryComponent, StaffSalaryTemplate, SalaryTemplateComponentForStaff } from "@/types/payroll"

// interface EmployeeSalaryDetailsProps {
//   employee: StaffType
// }

// const EmployeeSalaryDetails = ({ employee }: EmployeeSalaryDetailsProps) => {
//   const { t } = useTranslation()
//   const navigate = useNavigate()
//   const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

//   // API hooks
//   const { data: salaryTemplates, isLoading: isLoadingTemplates } = useFetchAllSalaryTemplateQuery({
//     academic_session: CurrentAcademicSessionForSchool!.id,
//   })
//   const [fetchAllSalaryComponent, { data: availableComponents, isLoading: isLoadingComponents }] =
//     useLazyFetchAllSalaryComponentQuery()
//   const [createStaffSalaryTemplate, { isLoading: isCreating }] = useCreateStaffSalaryTemplateMutation()
//   const [updateStaffSalaryTemplate, { isLoading: isUpdating }] = useUpdaetStaffSalaryTemplateMutation()
//   const [fetchStaffSalary, { data: staffSalary, isLoading: isLoadingSalary, error: salaryError }] =
//     useLazyFetchSingleStaffSalaryTemplateQuery()

//   // State for salary data
//   const [salary, setSalary] = useState<StaffSalaryTemplate | null>(null)
//   const [isEditing, setIsEditing] = useState(false)
//   const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
//   const [annualCtc, setAnnualCtc] = useState<string>("0")
//   const [templateName, setTemplateName] = useState<string>(`${employee.first_name}'s Salary Template`)
//   const [templateCode, setTemplateCode] = useState<string>(`${employee.employee_code}-SALARY`)
//   const [templateDescription, setTemplateDescription] = useState<string>("Custom salary template")
//   const [salaryComponents, setSalaryComponents] = useState<
//     Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[]
//   >([])
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [activeTab, setActiveTab] = useState<"earning" | "deduction" | "benefits">("earning")
//   const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
//   const [componentSearchTerm, setComponentSearchTerm] = useState("")
//   const [hasFixedAmountComponent, setHasFixedAmountComponent] = useState(false)
//   // Add a new state variable to track the specific error type
//   const [errorType, setErrorType] = useState<"not_found" | "other" | null>(null)

//   // Helper function to get component details by ID
//   const getComponentById = (componentId: number): SalaryComponent | undefined => {
//     return availableComponents?.find((component) => component.id === componentId)
//   }

//   // Fetch staff salary data
//   useEffect(() => {
//     if (employee.id && CurrentAcademicSessionForSchool) {
//       fetchStaffSalary({
//         staff_id: employee.id,
//       })
//         .unwrap()
//         .then((data) => {
//           // Reset error state on successful fetch
//           setErrorType(null)
//         })
//         .catch((error) => {
//           // Check if it's the specific "not found" error
//           if (error.status === 404 && error.data?.message === "Salary Template not found") {
//             setErrorType("not_found")
//           } else {
//             setErrorType("other")
//           }
//         })
//     }
//   }, [employee.id, CurrentAcademicSessionForSchool, fetchStaffSalary])

//   // Fetch available salary components
//   useEffect(() => {
//     if (CurrentAcademicSessionForSchool) {
//       fetchAllSalaryComponent({
//         academic_session: CurrentAcademicSessionForSchool.id,
//       })
//     }
//   }, [CurrentAcademicSessionForSchool, fetchAllSalaryComponent])

//   // Update local state when API data is received
//   useEffect(() => {
//     if (staffSalary) {
//       setSalary(staffSalary)
//       setSelectedTemplateId(staffSalary.base_template_id)
//       setAnnualCtc(staffSalary.annual_ctc)
//       setTemplateName(staffSalary.template_name)
//       setTemplateCode(staffSalary.template_code || `${employee.employee_code}-SALARY`)
//       setTemplateDescription(staffSalary.description || "Custom salary template")

//       // Map existing components
//       if (staffSalary.template_components) {
//         setSalaryComponents(staffSalary.template_components)

//         // Check if there's a fixed amount component
//         const fixedAmountComp = staffSalary.template_components.find((comp) => {
//           const component = availableComponents?.find((c) => c.id === comp.salary_components_id)
//           return component?.component_name === "Fixed Amount"
//         })
//         setHasFixedAmountComponent(!!fixedAmountComp)
//       }
//     } else {
//       setSalary(null)
//       // Set default values for new salary
//       setAnnualCtc("0")
//       setTemplateName(`${employee.first_name}'s Salary Template`)
//       setTemplateCode(`${employee.employee_code}-SALARY`)
//       setTemplateDescription("Custom salary template")
//       setSalaryComponents([])
//       setHasFixedAmountComponent(false)
//     }
//   }, [staffSalary, employee, availableComponents])

//   // Calculate monthly salary
//   const monthlySalary = useMemo(() => {
//     return (Number(annualCtc) / 12).toFixed(2)
//   }, [annualCtc])

//   // Calculate total earnings, deductions, and benefits
//   const totals = useMemo(() => {
//     let totalEarnings = 0
//     let totalDeductions = 0
//     let totalBenefits = 0

//     salaryComponents.forEach((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       if (!component) return

//       const amount = comp.amount ? Number(comp.amount) : 0

//       if (component.component_type === "earning") {
//         totalEarnings += amount
//       } else if (component.component_type === "deduction") {
//         totalDeductions += amount
//       } else if (component.component_type === "benefits") {
//         totalBenefits += amount
//       }
//     })

//     // Calculate net salary properly
//     const netSalary = totalEarnings - totalDeductions

//     // Calculate the difference between monthly salary and total earnings
//     const earningsDifference = Number(monthlySalary) - totalEarnings

//     return {
//       totalEarnings,
//       totalDeductions,
//       totalBenefits,
//       netSalary,
//       earningsDifference,
//     }
//   }, [salaryComponents, monthlySalary])

//   // Filter components by type
//   const filteredComponents = useMemo(() => {
//     return salaryComponents.filter((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       return component?.component_type === activeTab
//     })
//   }, [salaryComponents, activeTab])

//   // Filter available components for dialog
//   const filteredAvailableComponents = useMemo(() => {
//     if (!availableComponents) return []

//     return availableComponents.filter(
//       (comp) =>
//         comp.component_type === activeTab &&
//         comp.component_name.toLowerCase().includes(componentSearchTerm.toLowerCase()) &&
//         !salaryComponents.some((sc) => sc.salary_components_id === comp.id),
//     )
//   }, [availableComponents, activeTab, componentSearchTerm, salaryComponents])

//   // Load template data when selected
//   useEffect(() => {
//     if (!selectedTemplateId || !salaryTemplates) return

//     const template = salaryTemplates.find((t) => t.id === selectedTemplateId)
//     if (!template) return

//     // Create new components based on template
//     if (template.template_components && availableComponents) {
//       const newComponents: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[] =
//         template.template_components.map((comp) => {
//           // Calculate amount based on calculation method
//           let amount: string | null = null
//           let percentage: string | null = null

//           if (comp.amount !== null) {
//             amount = String(comp.amount)
//           }

//           if (comp.percentage !== null) {
//             percentage = String(comp.percentage)

//             // If percentage is set and based on annual CTC, calculate the amount
//             if (comp.is_based_on_annual_ctc && Number(annualCtc) > 0) {
//               const percentValue = Number(comp.percentage)
//               amount = ((percentValue / 100) * (Number(annualCtc) / 12)).toFixed(2)
//             }
//           }

//           return {
//             salary_components_id: comp.salary_components_id,
//             amount,
//             percentage,
//             is_mandatory: Boolean(comp.is_mandatory),
//             recovering_end_month: null,
//             total_recovering_amount: null,
//             total_recovered_amount: null,
//           }
//         })

//       setSalaryComponents(newComponents)

//       // Check if there's a fixed amount component
//       const fixedAmountComp = newComponents.find((comp) => {
//         const component = availableComponents.find((c) => c.id === comp.salary_components_id)
//         return component?.component_name === "Fixed Amount"
//       })
//       setHasFixedAmountComponent(!!fixedAmountComp)
//     }

//     setTemplateName(`${employee.first_name}'s ${template.template_name}`)
//     setTemplateDescription(template.description || "")
//     setAnnualCtc(String(template.annual_ctc))
//   }, [selectedTemplateId, salaryTemplates, employee, annualCtc, availableComponents])

//   // Handle amount change
//   const handleAmountChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]
//     const componentDetails = getComponentById(newComponents[index].salary_components_id)

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
//       setErrors({ ...errors, [`amount-${index}`]: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`amount-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].amount = value === "" ? null : value

//     // If percentage is set, update it based on the new amount
//     if (newComponents[index].percentage !== null && Number(annualCtc) > 0) {
//       const amountValue = value === "" ? 0 : Number(value)
//       newComponents[index].percentage = (((amountValue * 12) / Number(annualCtc)) * 100).toFixed(2)
//     }

//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists
//     updateFixedAmountComponent(newComponents)
//   }

//   // Handle percentage change
//   const handlePercentageChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]
//     const componentDetails = getComponentById(newComponents[index].salary_components_id)

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
//       setErrors({ ...errors, [`percentage-${index}`]: "Please enter a valid percentage (0-100)" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`percentage-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].percentage = value === "" ? null : value

//     // Update amount based on percentage
//     if (value !== "") {
//       const percentValue = Number(value)
//       newComponents[index].amount = ((percentValue / 100) * (Number(annualCtc) / 12)).toFixed(2)
//     } else {
//       newComponents[index].amount = null
//     }

//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists
//     updateFixedAmountComponent(newComponents)
//   }

//   // Handle recovering end month change
//   const handleRecoveringEndMonthChange = (index: number, value: string | null) => {
//     const newComponents = [...salaryComponents]
//     newComponents[index].recovering_end_month = value
//     setSalaryComponents(newComponents)
//   }

//   // Handle total recovering amount change
//   const handleTotalRecoveringAmountChange = (index: number, value: string) => {
//     const newComponents = [...salaryComponents]

//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
//       setErrors({ ...errors, [`recovering-${index}`]: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors[`recovering-${index}`]
//       setErrors(newErrors)
//     }

//     newComponents[index].total_recovering_amount = value === "" ? null : value
//     setSalaryComponents(newComponents)
//   }

//   // Update fixed amount component
//   const updateFixedAmountComponent = (
//     components: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id">[],
//   ) => {
//     if (!hasFixedAmountComponent || !availableComponents) return

//     // Find fixed amount component
//     const fixedAmountComponent = availableComponents.find((comp) => comp.component_name === "Fixed Amount")
//     if (!fixedAmountComponent) return

//     // Calculate total earnings excluding fixed amount
//     let totalEarnings = 0
//     components.forEach((comp) => {
//       const component = getComponentById(comp.salary_components_id)
//       if (component?.component_type === "earning" && component.id !== fixedAmountComponent.id) {
//         totalEarnings += comp.amount ? Number(comp.amount) : 0
//       }
//     })

//     // Calculate fixed amount
//     const fixedAmount = Math.max(0, Number(monthlySalary) - totalEarnings)

//     // Update or add fixed amount component
//     const fixedIndex = components.findIndex((comp) => comp.salary_components_id === fixedAmountComponent.id)
//     if (fixedIndex >= 0) {
//       components[fixedIndex].amount = fixedAmount.toFixed(2)
//     } else if (fixedAmount > 0) {
//       components.push({
//         salary_components_id: fixedAmountComponent.id,
//         amount: fixedAmount.toFixed(2),
//         percentage: null,
//         is_mandatory: false,
//         recovering_end_month: null,
//         total_recovering_amount: null,
//         total_recovered_amount: null,
//       })
//     }

//     setSalaryComponents([...components])
//   }

//   // Handle annual CTC change
//   const handleAnnualCtcChange = (value: string) => {
//     // Check if value is valid
//     if (value !== "" && (isNaN(Number(value)) || Number(value) <= 0)) {
//       setErrors({ ...errors, annualCtc: "Please enter a valid positive number" })
//       return
//     } else {
//       const newErrors = { ...errors }
//       delete newErrors.annualCtc
//       setErrors(newErrors)
//     }

//     // Update annual CTC
//     setAnnualCtc(value)

//     // Update percentage-based components
//     if (value !== "") {
//       const ctcValue = Number(value)
//       const newComponents = salaryComponents.map((comp) => {
//         const componentDetails = getComponentById(comp.salary_components_id)

//         if (comp.percentage !== null) {
//           const percentValue = Number(comp.percentage || "0")
//           return {
//             ...comp,
//             amount: ((percentValue / 100) * (ctcValue / 12)).toFixed(2),
//           }
//         }
//         return comp
//       })

//       setSalaryComponents(newComponents)

//       // Update fixed amount component
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Add fixed amount component
//   const addFixedAmountComponent = () => {
//     if (!availableComponents) return

//     // Find fixed amount component
//     const fixedAmountComponent = availableComponents.find((comp) => comp.component_name === "Fixed Amount")
//     if (!fixedAmountComponent) return

//     // Calculate fixed amount
//     const fixedAmount = Math.max(0, totals.earningsDifference)

//     // Add fixed amount component
//     const newComponents = [...salaryComponents]
//     newComponents.push({
//       salary_components_id: fixedAmountComponent.id,
//       amount: fixedAmount.toFixed(2),
//       percentage: null,
//       is_mandatory: false,
//       recovering_end_month: null,
//       total_recovering_amount: null,
//       total_recovered_amount: null,
//     })

//     setSalaryComponents(newComponents)
//     setHasFixedAmountComponent(true)
//   }

//   // Add new component
//   const handleAddComponent = (component: SalaryComponent) => {
//     // Check if this is the fixed amount component
//     const isFixedAmountComponent = component.component_name === "Fixed Amount"

//     // If adding fixed amount component, set flag
//     if (isFixedAmountComponent) {
//       setHasFixedAmountComponent(true)
//     }

//     let amount: string | null = "0"
//     let percentage: string | null = null

//     // Set initial values based on calculation method
//     if (component.calculation_method === "percentage") {
//       percentage = component.percentage ? String(component.percentage) : "0"

//       // Calculate amount based on percentage
//       if (Number(annualCtc) > 0) {
//         amount = ((Number(percentage) / 100) * (Number(annualCtc) / 12)).toFixed(2)
//       }
//     } else if (component.calculation_method === "amount" && component.amount) {
//       amount = String(component.amount)
//     }

//     // For fixed amount component, calculate the difference
//     if (isFixedAmountComponent) {
//       amount = Math.max(0, totals.earningsDifference).toFixed(2)
//     }

//     const newComponent: Omit<SalaryTemplateComponentForStaff, "id" | "staff_salary_templates_id"> = {
//       salary_components_id: component.id,
//       amount,
//       percentage,
//       is_mandatory: component.is_mandatory,
//       recovering_end_month: null,
//       total_recovering_amount: null,
//       total_recovered_amount: null,
//     }

//     const newComponents = [...salaryComponents, newComponent]
//     setSalaryComponents(newComponents)
//     setIsComponentDialogOpen(false)

//     // Update fixed amount component if it exists and this isn't the fixed amount component
//     if (hasFixedAmountComponent && !isFixedAmountComponent) {
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Remove component
//   const handleRemoveComponent = (index: number) => {
//     // Check if component is mandatory
//     if (salaryComponents[index].is_mandatory) {
//       toast({
//         title: "Cannot remove mandatory component",
//         description: "This component is mandatory and cannot be removed",
//         variant: "destructive",
//       })
//       return
//     }

//     // Check if this is the fixed amount component
//     const componentDetails = getComponentById(salaryComponents[index].salary_components_id)
//     const isFixedAmountComponent = componentDetails?.component_name === "Fixed Amount"

//     // If removing fixed amount component, clear flag
//     if (isFixedAmountComponent) {
//       setHasFixedAmountComponent(false)
//     }

//     const newComponents = [...salaryComponents]
//     newComponents.splice(index, 1)
//     setSalaryComponents(newComponents)

//     // Update fixed amount component if it exists and this isn't the fixed amount component
//     if (hasFixedAmountComponent && !isFixedAmountComponent) {
//       updateFixedAmountComponent(newComponents)
//     }
//   }

//   // Navigate to create/edit salary page
//   const handleNavigateToSalaryPage = () => {
//     if (salary) {
//       navigate(`/d/payroll/employee/${employee.id}/salary/edit`)
//     } else {
//       navigate(`/d/payroll/employee/${employee.id}/salary/create`)
//     }
//   }

//   // Save salary template
//   const handleSaveSalary = async () => {
//     // Validate form
//     const formErrors: Record<string, string> = {}

//     if (!templateName) {
//       formErrors.templateName = "Template name is required"
//     }

//     if (!annualCtc || Number(annualCtc) <= 0) {
//       formErrors.annualCtc = "Annual CTC must be greater than 0"
//     }

//     if (salaryComponents.length === 0) {
//       formErrors.components = "At least one salary component is required"
//     }

//     // Check if total earnings matches monthly salary
//     if (!hasFixedAmountComponent && Math.abs(totals.totalEarnings - Number(monthlySalary)) > 1) {
//       formErrors.totalEarnings = "Total earnings must match monthly salary. Consider adding a Fixed Amount component."
//     }

//     if (Object.keys(formErrors).length > 0 || Object.keys(errors).length > 0) {
//       setErrors({ ...errors, ...formErrors })
//       toast({
//         title: "Validation Error",
//         description: "Please fix the errors before saving",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       if (salary) {
//         // Update existing template
//         const response = await updateStaffSalaryTemplate({
//           salary_template_id: salary.id,
//           payload: {
//             template_name: templateName,
//             template_code: templateCode,
//             description: templateDescription,
//             annual_ctc: Number(annualCtc),
//             existing_salary_components: salaryComponents
//               .filter((comp) =>
//                 salary.template_components.some((c) => c.salary_components_id === comp.salary_components_id),
//               )
//               .map((comp) => ({
//                 salary_components_id: comp.salary_components_id,
//                 amount: comp.amount ? Number(comp.amount) : null,
//                 percentage: comp.percentage ? Number(comp.percentage) : null,
//                 recovering_end_month: comp.recovering_end_month,
//                 total_recovering_amount: comp.total_recovering_amount ? Number(comp.total_recovering_amount) : null,
//               })),
//             new_salary_components: salaryComponents
//               .filter(
//                 (comp) => !salary.template_components.some((c) => c.salary_components_id === comp.salary_components_id),
//               )
//               .map((comp) => {
//                 const componentDetails = getComponentById(comp.salary_components_id)
//                 return {
//                   salary_components_id: comp.salary_components_id,
//                   amount: comp.amount ? Number(comp.amount) : null,
//                   percentage: comp.percentage ? Number(comp.percentage) : null,
//                   is_mandatory: comp.is_mandatory,
//                   is_based_on_annual_ctc: componentDetails?.is_based_on_annual_ctc || false,
//                   end_month: null,
//                   recovery_amount: null,
//                   recovering_end_month: comp.recovering_end_month,
//                   total_recovering_amount: comp.total_recovering_amount ? Number(comp.total_recovering_amount) : null,
//                   total_recovered_amount: comp.total_recovered_amount ? Number(comp.total_recovered_amount) : null,
//                 }
//               }),
//             remove_salary_components: salary.template_components
//               .filter((comp) => !salaryComponents.some((c) => c.salary_components_id === comp.salary_components_id))
//               .map((comp) => ({
//                 salary_components_id: comp.salary_components_id,
//               })),
//           },
//         })

//         if (response.data) {
//           toast({
//             title: "Success",
//             description: "Salary template updated successfully",
//           })
//           setIsEditing(false)

//           // Refresh salary data
//           fetchStaffSalary({
//             staff_id: employee.id,
//           })
//         }
//       } else {
//         // Create new template
//         const response = await createStaffSalaryTemplate({
//           payload: {
//             base_template_id: selectedTemplateId,
//             staff_enrollments_id: employee.id,
//             template_name: templateName,
//             template_code: templateCode,
//             description: templateDescription,
//             annual_ctc: annualCtc,
//             template_components: salaryComponents.map((comp) => {
//               const componentDetails = getComponentById(comp.salary_components_id)
//               return {
//                 salary_components_id: comp.salary_components_id,
//                 amount: comp.amount !== null ? String(comp.amount) : null,
//                 percentage: comp.percentage !== null ? String(comp.percentage) : null,
//                 is_mandatory: comp.is_mandatory,
//                 is_based_on_annual_ctc: componentDetails?.is_based_on_annual_ctc || false,
//                 recovering_end_month: comp.recovering_end_month,
//                 total_recovering_amount:
//                   comp.total_recovering_amount !== null ? String(comp.total_recovering_amount) : null,
//                 total_recovered_amount:
//                   comp.total_recovered_amount !== null ? String(comp.total_recovered_amount) : null,
//               }
//             }),
//           },
//         })

//         if (response.data) {
//           toast({
//             title: "Success",
//             description: "Salary template created successfully",
//           })
//           setIsEditing(false)

//           // Refresh salary data
//           fetchStaffSalary({
//             staff_id: employee.id,
//           })
//         }
//       }
//     } catch (error) {
//       console.error("Error saving salary template:", error)
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred",
//         variant: "destructive",
//       })
//     }
//   }

//   // Format currency
//   const formatCurrency = (amount: string | number | null) => {
//     if (amount === null || amount === "" || isNaN(Number(amount))) return "₹0.00"
//     const numAmount = typeof amount === "string" ? Number(amount) : amount
//     return `₹${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
//   }

//   // Handle start editing
//   const handleStartEditing = () => {
//     setIsEditing(true);
//     setErrorType(null); // Clear any error state

//     // Initialize form with current data if available
//     if (salary) {
//       setSelectedTemplateId(salary.base_template_id);
//       setAnnualCtc(salary.annual_ctc);
//       setTemplateName(salary.template_name);
//       setTemplateCode(salary.template_code || `${employee.employee_code}-SALARY`);
//       setTemplateDescription(salary.description || "Custom salary template");

//       // Map existing components
//       if (salary.template_components) {
//         setSalaryComponents(salary.template_components);

//         // Check if there's a fixed amount component
//         const fixedAmountComp = salary.template_components.find((comp) => {
//           const component = availableComponents?.find((c) => c.id === comp.salary_components_id);
//           return component?.component_name === "Fixed Amount";
//         });
//         setHasFixedAmountComponent(!!fixedAmountComp);
//       }
//     } else {
//       // Set defaults for new salary
//       setSelectedTemplateId(null);
//       setAnnualCtc("0");
//       setTemplateName(`${employee.first_name}'s Salary Template`);
//       setTemplateCode(`${employee.employee_code}-SALARY`);
//       setTemplateDescription("Custom salary template");
//       setSalaryComponents([]);
//       setHasFixedAmountComponent(false);
//     }
//   };

//   // Get deduction type display text
//   const getDeductionTypeText = (type: string | null) => {
//     switch (type) {
//       case "ends_on_selected_month":
//         return "Ends on selected month"
//       case "ends_never":
//         return "Never ends"
//       case "recovering_specific_amount":
//         return "Recovering specific amount"
//       default:
//         return "N/A"
//     }
//   }

//   // Get deduction type tooltip text
//   const getDeductionTypeTooltip = (type: string | null) => {
//     switch (type) {
//       case "ends_on_selected_month":
//         return "This deduction will continue until the specified month and then stop automatically."
//       case "ends_never":
//         return "This deduction will continue indefinitely until manually removed."
//       case "recovering_specific_amount":
//         return "This deduction will continue until the total specified amount has been recovered."
//       default:
//         return ""
//     }
//   }

//   // Loading state
//   if (isLoadingSalary) {
//     return (
//       <div className="space-y-6">
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-8 w-64" />
//             <Skeleton className="h-4 w-48" />
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="space-y-2">
//                     <Skeleton className="h-4 w-24" />
//                     <Skeleton className="h-6 w-full" />
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {Array.from({ length: 4 }).map((_, i) => (
//                   <Card key={i}>
//                     <CardContent className="pt-6">
//                       <Skeleton className="h-4 w-24 mb-2" />
//                       <Skeleton className="h-8 w-32" />
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>

//               <Tabs defaultValue="earning">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="earning">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                   <TabsTrigger value="deduction">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                   <TabsTrigger value="benefits">
//                     <Skeleton className="h-4 w-16" />
//                   </TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="earning" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Skeleton className="h-64 w-full" />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Error state
//   if (salaryError) {
//     return (
//       <div className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               {errorType === "not_found" ? (
//                 <>
//                   <AlertCircle className="mr-2 h-5 w-5 text-amber-500" /> {t("no_salary_template_found")}
//                 </>
//               ) : (
//                 <>
//                   <AlertCircle className="mr-2 h-5 w-5 text-destructive" /> {t("error_loading_salary_data")}
//                 </>
//               )}
//             </CardTitle>
//             <CardDescription>
//               {errorType === "not_found"
//                 ? t("this_employee_does_not_have_a_salary_template_assigned_yet")
//                 : t("there_was_an_error_loading_the_salary_data_for_this_employee")}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {errorType === "not_found" ? (
//               <div className="space-y-4">
//                 <Alert variant="destructive" className="bg-amber-50 border-amber-200">
//                   <AlertCircle className="h-4 w-4 text-amber-500" />
//                   <AlertTitle>{t("no_salary_template")}</AlertTitle>
//                   <AlertDescription>{t("you_need_to_create_a_salary_template_for_this_employee")}</AlertDescription>
//                 </Alert>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-end">
//                   <Button onClick={handleNavigateToSalaryPage} variant="outline">
//                     <ExternalLink className="mr-2 h-4 w-4" />
//                     {t("advanced_create")}
//                   </Button>
//                   <Button onClick={handleStartEditing}>
//                     <Plus className="mr-2 h-4 w-4" /> {t("create_salary_template")}
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>{t("error")}</AlertTitle>
//                   <AlertDescription>{t("failed_to_load_salary_data_please_try_again_later")}</AlertDescription>
//                 </Alert>
//                 <div className="mt-4 flex justify-end">
//                   <Button
//                     onClick={() =>
//                       fetchStaffSalary({
//                         staff_id: employee.id,
//                       })
//                     }
//                   >
//                     {t("try_again")}
//                   </Button>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Salary Overview Card */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center">
//               <DollarSign className="mr-2 h-5 w-5" /> {t("salary_overview")}
//             </CardTitle>
//             <CardDescription>
//               {salary ? t("current_salary_structure_for_the_employee") : t("no_salary_structure_assigned_yet")}
//             </CardDescription>
//           </div>
//           <div className="flex gap-2">
//             {!isEditing && (
//               <>
//                 <Button variant="outline" onClick={handleNavigateToSalaryPage}>
//                   <ExternalLink className="mr-2 h-4 w-4" />
//                   {salary ? t("advanced_edit") : t("advanced_create")}
//                 </Button>
//                 <Button onClick={handleStartEditing}>
//                   <Edit className="mr-2 h-4 w-4" /> {salary ? t("edit_salary") : t("assign_salary")}
//                 </Button>
//               </>
//             )}
//             {isEditing && (
//               <Button variant="outline" onClick={() => setIsEditing(false)}>
//                 <X className="mr-2 h-4 w-4" /> {t("cancel")}
//               </Button>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isEditing ? (
//             <div className="space-y-6">
//               {/* Template Selection */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="template">{t("base_salary_template")}</Label>
//                   <Select
//                     value={selectedTemplateId?.toString() || "custom"}
//                     onValueChange={(value) => setSelectedTemplateId(value === "custom" ? null : Number(value))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a template" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="custom">Custom Template</SelectItem>
//                       {salaryTemplates?.map((template) => (
//                         <SelectItem key={template.id} value={template.id.toString()}>
//                           {template.template_name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="annual-ctc">{t("annual_ctc")}</Label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
//                     <Input
//                       id="annual-ctc"
//                       type="number"
//                       className="pl-8"
//                       value={annualCtc}
//                       onChange={(e) => handleAnnualCtcChange(e.target.value)}
//                     />
//                   </div>
//                   {errors.annualCtc && <p className="text-sm text-destructive">{errors.annualCtc}</p>}
//                 </div>
//               </div>

//               {/* Monthly Salary Display */}
//               <div className="bg-muted p-4 rounded-md flex justify-between items-center">
//                 <div>
//                   <p className="text-sm text-muted-foreground">{t("monthly_salary")}</p>
//                   <p className="text-2xl font-bold">{formatCurrency(monthlySalary)}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-muted-foreground">{t("net_salary")}</p>
//                   <p className="text-2xl font-bold">{formatCurrency(totals.netSalary)}</p>
//                 </div>
//               </div>

//               {/* Template Details */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="template-name">{t("template_name")}</Label>
//                   <Input id="template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
//                   {errors.templateName && <p className="text-sm text-destructive">{errors.templateName}</p>}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="template-code">{t("template_code")}</Label>
//                   <Input id="template-code" value={templateCode} onChange={(e) => setTemplateCode(e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="template-description">{t("description")}</Label>
//                   <Input
//                     id="template-description"
//                     value={templateDescription}
//                     onChange={(e) => setTemplateDescription(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Salary Components */}
//               <div className="space-y-4">
//                 <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
//                   <TabsList className="grid w-full grid-cols-3">
//                     <TabsTrigger value="earning" className="flex items-center">
//                       <Plus className="mr-2 h-4 w-4" /> {t("earnings")}
//                     </TabsTrigger>
//                     <TabsTrigger value="deduction" className="flex items-center">
//                       <MinusIcon className="mr-2 h-4 w-4" /> {t("deductions")}
//                     </TabsTrigger>
//                     <TabsTrigger value="benefits" className="flex items-center">
//                       <GiftIcon className="mr-2 h-4 w-4" /> {t("benefits")}
//                     </TabsTrigger>
//                   </TabsList>

//                   <div className="mt-4">
//                     <div className="flex justify-between mb-4">
//                       <div>
//                         {activeTab === "earning" && !hasFixedAmountComponent && totals.earningsDifference > 0 && (
//                           <Button variant="outline" onClick={addFixedAmountComponent}>
//                             <Plus className="mr-2 h-4 w-4" /> Add Fixed Amount (
//                             {formatCurrency(totals.earningsDifference)})
//                           </Button>
//                         )}
//                       </div>
//                       <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
//                         <DialogTrigger asChild>
//                           <Button>
//                             <Plus className="mr-2 h-4 w-4" /> {t("add_component")}
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-[500px]">
//                           <DialogHeader>
//                             <DialogTitle>{t("add_salary_component")}</DialogTitle>
//                             <DialogDescription>
//                               {t("select_a_component_to_add_to_the_salary_template")}
//                             </DialogDescription>
//                           </DialogHeader>
//                           <div className="py-4">
//                             <Input
//                               placeholder={t("search_components")}
//                               value={componentSearchTerm}
//                               onChange={(e) => setComponentSearchTerm(e.target.value)}
//                               className="mb-4"
//                             />
//                             <ScrollArea className="h-[300px]">
//                               {isLoadingComponents ? (
//                                 <div className="space-y-2">
//                                   {Array.from({ length: 5 }).map((_, i) => (
//                                     <Skeleton key={i} className="h-12 w-full" />
//                                   ))}
//                                 </div>
//                               ) : filteredAvailableComponents.length > 0 ? (
//                                 <div className="space-y-2">
//                                   {filteredAvailableComponents.map((component) => (
//                                     <div
//                                       key={component.id}
//                                       className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
//                                       onClick={() => handleAddComponent(component)}
//                                     >
//                                       <div>
//                                         <p className="font-medium">{component.component_name}</p>
//                                         <p className="text-sm text-muted-foreground">
//                                           {component.calculation_method === "amount"
//                                             ? t("fixed_amount")
//                                             : t("percentage")}
//                                         </p>
//                                       </div>
//                                       <div className="flex items-center">
//                                         {component.is_mandatory && (
//                                           <Badge variant="outline" className="mr-2">
//                                             {t("mandatory")}
//                                           </Badge>
//                                         )}
//                                         <Plus className="h-4 w-4" />
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               ) : (
//                                 <div className="text-center py-4 text-muted-foreground">
//                                   {componentSearchTerm
//                                     ? t("no_matching_components_found")
//                                     : t("no_available_components_for_this_type")}
//                                 </div>
//                               )}
//                             </ScrollArea>
//                           </div>
//                           <DialogFooter>
//                             <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>
//                               {t("cancel")}
//                             </Button>
//                           </DialogFooter>
//                         </DialogContent>
//                       </Dialog>
//                     </div>

//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t("component_name")}</TableHead>
//                           <TableHead>{t("calculation_method")}</TableHead>
//                           {/* Show amount field for all component types */}
//                           <TableHead className="text-right">{t("amount")}</TableHead>
//                           {/* Show percentage field only for earning components */}
//                           {activeTab === "earning" && <TableHead className="text-right">{t("percentage")}</TableHead>}
//                           {activeTab !== "earning" && <TableHead>{t("recovery_details")}</TableHead>}
//                           <TableHead className="text-right">{t("actions")}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredComponents.length === 0 ? (
//                           <TableRow>
//                             <TableCell colSpan={activeTab === "earning" ? 5 : 4} className="text-center py-4">
//                               <p className="text-muted-foreground">{t("no_components_added")}</p>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="mt-2"
//                                 onClick={() => setIsComponentDialogOpen(true)}
//                               >
//                                 <Plus className="mr-2 h-4 w-4" /> {t("add_component")}
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ) : (
//                           filteredComponents.map((component, index) => {
//                             const globalIndex = salaryComponents.findIndex(
//                               (c) => c.salary_components_id === component.salary_components_id,
//                             )
//                             const componentDetails = getComponentById(component.salary_components_id)
//                             return (
//                               <TableRow key={component.salary_components_id}>
//                                 <TableCell>
//                                   <div className="font-medium">{componentDetails?.component_name}</div>
//                                   {component.is_mandatory && (
//                                     <Badge variant="outline" className="mt-1">
//                                       {t("mandatory")}
//                                     </Badge>
//                                   )}
//                                 </TableCell>
//                                 <TableCell>
//                                   <Badge variant="outline">
//                                     {componentDetails?.calculation_method === "amount"
//                                       ? t("fixed_amount")
//                                       : t("percentage")}
//                                   </Badge>
//                                 </TableCell>
//                                 {/* Amount field for all component types */}
//                                 <TableCell className="text-right">
//                                   <div className="relative w-24 ml-auto">
//                                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
//                                     <Input
//                                       type="number"
//                                       className="pl-8 text-right"
//                                       value={component.amount === null ? "" : component.amount}
//                                       onChange={(e) => handleAmountChange(globalIndex, e.target.value)}
//                                     />
//                                   </div>
//                                   {errors[`amount-${globalIndex}`] && (
//                                     <p className="text-xs text-destructive mt-1">{errors[`amount-${globalIndex}`]}</p>
//                                   )}
//                                 </TableCell>
//                                 {/* Percentage field only for earning components */}
//                                 {activeTab === "earning" && (
//                                   <TableCell className="text-right">
//                                     <div className="relative w-24 ml-auto">
//                                       <Input
//                                         type="number"
//                                         className="pr-8 text-right"
//                                         value={component.percentage === null ? "" : component.percentage}
//                                         onChange={(e) => handlePercentageChange(globalIndex, e.target.value)}
//                                       />
//                                       <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
//                                     </div>
//                                     {errors[`percentage-${globalIndex}`] && (
//                                       <p className="text-xs text-destructive mt-1">
//                                         {errors[`percentage-${globalIndex}`]}
//                                       </p>
//                                     )}
//                                   </TableCell>
//                                 )}
//                                 {activeTab !== "earning" && (
//                                   <TableCell>
//                                     {/* Show appropriate fields based on deduction/benefit type */}
//                                     {activeTab === "deduction" &&
//                                     componentDetails!.deduction_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>Total Amount:</Label>
//                                           <div className="relative w-24">
//                                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                                               ₹
//                                             </span>
//                                             <Input
//                                               type="number"
//                                               className="pl-8"
//                                               value={
//                                                 component.total_recovering_amount === null
//                                                   ? ""
//                                                   : component.total_recovering_amount
//                                               }
//                                               onChange={(e) =>
//                                                 handleTotalRecoveringAmountChange(globalIndex, e.target.value)
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                         {errors[`recovering-${globalIndex}`] && (
//                                           <p className="text-xs text-destructive">
//                                             {errors[`recovering-${globalIndex}`]}
//                                           </p>
//                                         )}
//                                       </div>
//                                     ) : activeTab === "deduction" &&
//                                       componentDetails!.deduction_type === "ends_on_selected_month" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                       </div>
//                                     ) : activeTab === "benefits" &&
//                                       componentDetails!.benefit_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-2">
//                                         <div className="flex items-center gap-2">
//                                           <Label>Total Amount:</Label>
//                                           <div className="relative w-24">
//                                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                                               ₹
//                                             </span>
//                                             <Input
//                                               type="number"
//                                               className="pl-8"
//                                               value={
//                                                 component.total_recovering_amount === null
//                                                   ? ""
//                                                   : component.total_recovering_amount
//                                               }
//                                               onChange={(e) =>
//                                                 handleTotalRecoveringAmountChange(globalIndex, e.target.value)
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <Label>End Month:</Label>
//                                           <Popover>
//                                             <PopoverTrigger asChild>
//                                               <Button variant="outline" size="sm" className="flex items-center gap-2">
//                                                 <Calendar className="h-4 w-4" />
//                                                 {component.recovering_end_month
//                                                   ? format(new Date(component.recovering_end_month), "MMM yyyy")
//                                                   : "Select"}
//                                               </Button>
//                                             </PopoverTrigger>
//                                             <PopoverContent className="w-auto p-0">
//                                               <CalendarComponent
//                                                 mode="single"
//                                                 selected={
//                                                   component.recovering_end_month
//                                                     ? new Date(component.recovering_end_month)
//                                                     : undefined
//                                                 }
//                                                 onSelect={(date) =>
//                                                   handleRecoveringEndMonthChange(
//                                                     globalIndex,
//                                                     date ? date.toISOString() : null,
//                                                   )
//                                                 }
//                                                 initialFocus
//                                               />
//                                             </PopoverContent>
//                                           </Popover>
//                                         </div>
//                                         {errors[`recovering-${globalIndex}`] && (
//                                           <p className="text-xs text-destructive">
//                                             {errors[`recovering-${globalIndex}`]}
//                                           </p>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <div className="flex items-center">
//                                         <TooltipProvider>
//                                           <Tooltip>
//                                             <TooltipTrigger asChild>
//                                               <Badge variant="outline" className="flex items-center gap-1">
//                                                 {activeTab === "deduction"
//                                                   ? getDeductionTypeText(componentDetails!.deduction_type)
//                                                   : getDeductionTypeText(componentDetails!.benefit_type)}
//                                                 <HelpCircleIcon className="h-3 w-3 ml-1" />
//                                               </Badge>
//                                             </TooltipTrigger>
//                                             <TooltipContent>
//                                               <p>
//                                                 {activeTab === "deduction"
//                                                   ? getDeductionTypeTooltip(componentDetails!.deduction_type)
//                                                   : getDeductionTypeTooltip(componentDetails!.benefit_type)}
//                                               </p>
//                                             </TooltipContent>
//                                           </Tooltip>
//                                         </TooltipProvider>
//                                       </div>
//                                     )}
//                                   </TableCell>
//                                 )}
//                                 <TableCell className="text-right">
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     onClick={() => handleRemoveComponent(globalIndex)}
//                                     disabled={component.is_mandatory}
//                                   >
//                                     <Trash className="h-4 w-4" />
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>
//                             )
//                           })
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </Tabs>
//               </div>

//               {/* Summary */}
//               <div className="bg-muted p-4 rounded-md">
//                 <h3 className="font-medium mb-2">{t("salary_summary")}</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span>{t("total_earnings")}</span>
//                     <span className="font-medium">{formatCurrency(totals.totalEarnings)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>{t("total_deductions")}</span>
//                     <span className="font-medium text-destructive">- {formatCurrency(totals.totalDeductions)}</span>
//                   </div>
//                   <Separator className="my-2" />
//                   <div className="flex justify-between">
//                     <span className="font-medium">{t("net_salary")}</span>
//                     <span className="font-bold">{formatCurrency(totals.netSalary)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>{t("employer_contributions")}</span>
//                     <span>{formatCurrency(totals.totalBenefits)}</span>
//                   </div>
//                 </div>

//                 {!hasFixedAmountComponent && Math.abs(totals.totalEarnings - Number(monthlySalary)) > 1 && (
//                   <Alert variant="destructive" className="mt-4">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertTitle>Earnings mismatch</AlertTitle>
//                     <AlertDescription>
//                       Total earnings ({formatCurrency(totals.totalEarnings)}) do not match monthly salary (
//                       {formatCurrency(monthlySalary)}).
//                       <Button
//                         variant="link"
//                         className="p-0 h-auto text-destructive underline ml-1"
//                         onClick={addFixedAmountComponent}
//                       >
//                         Add Fixed Amount component ({formatCurrency(totals.earningsDifference)})
//                       </Button>
//                     </AlertDescription>
//                   </Alert>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setIsEditing(false)}>
//                   <X className="mr-2 h-4 w-4" /> {t("cancel")}
//                 </Button>
//                 <Button onClick={handleSaveSalary} disabled={isCreating || isUpdating}>
//                   {isCreating || isUpdating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" /> {t("save")}
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           ) : salary ? (
//             <div className="space-y-6">
//               {/* Template Info */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label className="text-muted-foreground">{t("template_name")}</Label>
//                   <p className="font-medium mt-1">{salary.template_name}</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">{t("template_code")}</Label>
//                   <p className="font-medium mt-1">{salary.template_code || "N/A"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">{t("description")}</Label>
//                   <p className="font-medium mt-1">{salary.description || "N/A"}</p>
//                 </div>
//               </div>

//               {/* Base Template Info */}
//               {salary.base_template && (
//                 <div className="bg-muted p-4 rounded-md">
//                   <h3 className="font-medium mb-2">{t("base_template_info")}</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <Label className="text-muted-foreground">{t("template_name")}</Label>
//                       <p className="font-medium mt-1">{salary.base_template.template_name}</p>
//                     </div>
//                     <div>
//                       <Label className="text-muted-foreground">{t("template_code")}</Label>
//                       <p className="font-medium mt-1">{salary.base_template.template_code || "N/A"}</p>
//                     </div>
//                     <div>
//                       <Label className="text-muted-foreground">{t("annual_ctc")}</Label>
//                       <p className="font-medium mt-1">{formatCurrency(salary.base_template.annual_ctc)}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Salary Summary */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("annual_ctc")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(salary.annual_ctc)}</div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("monthly_salary")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(Number(salary.annual_ctc) / 12)}</div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("total_deductions")}</div>
//                     <div className="text-2xl font-bold mt-1 text-destructive">
//                       {formatCurrency(totals.totalDeductions)}
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="pt-6">
//                     <div className="text-muted-foreground text-sm">{t("net_salary")}</div>
//                     <div className="text-2xl font-bold mt-1">{formatCurrency(totals.netSalary)}</div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Salary Components */}
//               <Tabs defaultValue="earning">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="earning">{t("earnings")}</TabsTrigger>
//                   <TabsTrigger value="deduction">{t("deductions")}</TabsTrigger>
//                   <TabsTrigger value="benefits">{t("benefits")}</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="earning" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead className="text-right">{t("percentage")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "earning"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell className="text-right">
//                                     {comp.percentage !== null ? `${comp.percentage}%` : "N/A"}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="deduction" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead>{t("recovery_details")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "deduction"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell>
//                                     {componentDetails!.deduction_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-1">
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Total:</span>
//                                           <span>{formatCurrency(comp.total_recovering_amount)}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Until:</span>
//                                           <span>
//                                             {comp.recovering_end_month
//                                               ? format(new Date(comp.recovering_end_month), "MMM yyyy")
//                                               : "N/A"}
//                                           </span>
//                                         </div>
//                                         {comp.total_recovered_amount && Number(comp.total_recovered_amount) > 0 && (
//                                           <div className="flex items-center gap-2">
//                                             <span className="text-sm text-muted-foreground">Recovered:</span>
//                                             <span>{formatCurrency(comp.total_recovered_amount)}</span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <TooltipProvider>
//                                         <Tooltip>
//                                           <TooltipTrigger asChild>
//                                             <div className="flex items-center">
//                                               <span>{getDeductionTypeText(componentDetails!.deduction_type)}</span>
//                                               <HelpCircleIcon className="h-4 w-4 ml-1" />
//                                             </div>
//                                           </TooltipTrigger>
//                                           <TooltipContent>
//                                             <p>{getDeductionTypeTooltip(componentDetails!.deduction_type)}</p>
//                                           </TooltipContent>
//                                         </Tooltip>
//                                       </TooltipProvider>
//                                     )}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="benefits" className="mt-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>{t("component_name")}</TableHead>
//                             <TableHead>{t("calculation_method")}</TableHead>
//                             <TableHead className="text-right">{t("amount")}</TableHead>
//                             <TableHead>{t("recovery_details")}</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {salary.template_components
//                             .filter((comp) => {
//                               const component = getComponentById(comp.salary_components_id)
//                               return component?.component_type === "benefits"
//                             })
//                             .map((comp) => {
//                               const componentDetails = getComponentById(comp.salary_components_id)
//                               return (
//                                 <TableRow key={comp.id}>
//                                   <TableCell>
//                                     <div className="font-medium">{componentDetails?.component_name}</div>
//                                     {comp.is_mandatory && (
//                                       <Badge variant="outline" className="mt-1">
//                                         {t("mandatory")}
//                                       </Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell>
//                                     <Badge variant="outline">
//                                       {componentDetails?.calculation_method === "amount"
//                                         ? t("fixed_amount")
//                                         : t("percentage")}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
//                                   <TableCell>
//                                     {componentDetails!.benefit_type === "recovering_specific_amount" ? (
//                                       <div className="space-y-1">
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Total:</span>
//                                           <span>{formatCurrency(comp.total_recovering_amount)}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                           <span className="text-sm text-muted-foreground">Until:</span>
//                                           <span>
//                                             {comp.recovering_end_month
//                                               ? format(new Date(comp.recovering_end_month), "MMM yyyy")
//                                               : "N/A"}
//                                           </span>
//                                         </div>
//                                         {comp.total_recovered_amount && Number(comp.total_recovered_amount) > 0 && (
//                                           <div className="flex items-center gap-2">
//                                             <span className="text-sm text-muted-foreground">Recovered:</span>
//                                             <span>{formatCurrency(comp.total_recovered_amount)}</span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <TooltipProvider>
//                                         <Tooltip>
//                                           <TooltipTrigger asChild>
//                                             <div className="flex items-center">
//                                               <span>{getDeductionTypeText(componentDetails!.benefit_type)}</span>
//                                               <HelpCircleIcon className="h-4 w-4 ml-1" />
//                                             </div>
//                                           </TooltipTrigger>
//                                           <TooltipContent>
//                                             <p>{getDeductionTypeTooltip(componentDetails!.benefit_type)}</p>
//                                           </TooltipContent>
//                                         </Tooltip>
//                                       </TooltipProvider>
//                                     )}
//                                   </TableCell>
//                                 </TableRow>
//                               )
//                             })}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <Alert className="bg-amber-50 border-amber-200">
//                 <AlertCircle className="h-4 w-4 text-amber-500" />
//                 <AlertTitle>{t("no_salary_template_assigned")}</AlertTitle>
//                 <AlertDescription>{t("this_employee_does_not_have_a_salary_structure_assigned_yet")}</AlertDescription>
//               </Alert>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">{t("quick_setup")}</CardTitle>
//                     <CardDescription>{t("create_a_salary_template_directly_in_this_interface")}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       {t("use_this_option_to_quickly_set_up_a_salary_template_with_basic_components")}
//                     </p>
//                     <Button onClick={handleStartEditing} className="w-full">
//                       <Plus className="mr-2 h-4 w-4" /> {t("create_salary_template")}
//                     </Button>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">{t("advanced_setup")}</CardTitle>
//                     <CardDescription>{t("use_the_advanced_interface_for_more_options")}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       {t("use_this_option_for_more_advanced_configuration_and_detailed_setup")}
//                     </p>
//                     <Button variant="outline" onClick={handleNavigateToSalaryPage} className="w-full">
//                       <ExternalLink className="mr-2 h-4 w-4" /> {t("advanced_create")}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default EmployeeSalaryDetails



"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { DollarSign, Plus, AlertCircle, Edit, ExternalLink, HelpCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { StaffType } from "@/types/staff"
import {
  useLazyFetchSingleStaffSalaryTemplateQuery,
  useLazyFetchAllSalaryComponentQuery,
} from "@/services/PayrollService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { Skeleton } from "@/components/ui/skeleton"
import type { SalaryComponent, StaffSalaryTemplate } from "@/types/payroll"

interface EmployeeSalaryDetailsProps {
  employee: StaffType
}

const EmployeeSalaryDetails = ({ employee }: EmployeeSalaryDetailsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  // API hooks
  const [fetchStaffSalary, { data: staffSalary, isLoading: isLoadingSalary, error: salaryError }] =
    useLazyFetchSingleStaffSalaryTemplateQuery()
  const [fetchAllSalaryComponent, { data: availableComponents }] = useLazyFetchAllSalaryComponentQuery()

  // State for salary data
  const [salary, setSalary] = useState<StaffSalaryTemplate | null>(null)
  const [errorType, setErrorType] = useState<"not_found" | "other" | null>(null)

  // Helper function to get component details by ID
  const getComponentById = (componentId: number): SalaryComponent | undefined => {
    return availableComponents?.find((component) => component.id === componentId)
  }

  // Fetch staff salary data
  useEffect(() => {
    if (employee.id && CurrentAcademicSessionForSchool) {
      fetchStaffSalary({
        staff_id: employee.id,
      })
        .unwrap()
        .then((data) => {
          // Reset error state on successful fetch
          setErrorType(null)
        })
        .catch((error) => {
          // Check if it's the specific "not found" error
          if (error.status === 404 && error.data?.message === "Salary Template not found") {
            setErrorType("not_found")
          } else {
            setErrorType("other")
          }
        })
    }
  }, [employee.id, CurrentAcademicSessionForSchool, fetchStaffSalary])

  // Fetch available salary components
  useEffect(() => {
    if (CurrentAcademicSessionForSchool) {
      fetchAllSalaryComponent({
        academic_session: CurrentAcademicSessionForSchool.id,
      })
    }
  }, [CurrentAcademicSessionForSchool, fetchAllSalaryComponent])

  // Update local state when API data is received
  useEffect(() => {
    if (staffSalary) {
      setSalary(staffSalary)
    } else {
      setSalary(null)
    }
  }, [staffSalary])

  // Format currency
  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === "" || isNaN(Number(amount))) return "₹0.00"
    const numAmount = typeof amount === "string" ? Number(amount) : amount
    return `₹${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Navigate to create/edit salary page
  const handleNavigateToSalaryPage = (mode: "create" | "edit") => {
    if (mode === "edit") {
      navigate(`/d/payroll/employee/${employee.id}/salary/edit`)
    } else {
      navigate(`/d/payroll/employee/${employee.id}/salary/create`)
    }
  }

  // Get deduction type display text
  const getDeductionTypeText = (type: string | null) => {
    switch (type) {
      case "ends_on_selected_month":
        return "Ends on selected month"
      case "ends_never":
        return "Never ends"
      case "recovering_specific_amount":
        return "Recovering specific amount"
      default:
        return "N/A"
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    if (!salary || !salary.template_components)
      return { totalEarnings: 0, totalDeductions: 0, totalBenefits: 0, netSalary: 0 }

    let totalEarnings = 0
    let totalDeductions = 0
    let totalBenefits = 0

    salary.template_components.forEach((comp) => {
      const component = getComponentById(comp.salary_components_id)
      if (!component) return

      const amount = comp.amount ? Number(comp.amount) : 0

      if (component.component_type === "earning") {
        totalEarnings += amount
      } else if (component.component_type === "deduction") {
        totalDeductions += amount
      } else if (component.component_type === "benefits") {
        totalBenefits += amount
      }
    })

    // Calculate net salary properly
    const netSalary = totalEarnings - totalDeductions

    return {
      totalEarnings,
      totalDeductions,
      totalBenefits,
      netSalary,
    }
  }

  const totals = calculateTotals()

  // Loading state
  if (isLoadingSalary) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (salaryError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {errorType === "not_found" ? (
                <>
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-500" /> {t("no_salary_template_found")}
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" /> {t("error_loading_salary_data")}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {errorType === "not_found"
                ? t("this_employee_does_not_have_a_salary_template_assigned_yet")
                : t("there_was_an_error_loading_the_salary_data_for_this_employee")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorType === "not_found" ? (
              <div className="space-y-4">
                <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>{t("no_salary_template")}</AlertTitle>
                  <AlertDescription>{t("you_need_to_create_a_salary_template_for_this_employee")}</AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button onClick={() => handleNavigateToSalaryPage("create")} variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("advanced_create")}
                  </Button>
                  <Button onClick={() => handleNavigateToSalaryPage("create")}>
                    <Plus className="mr-2 h-4 w-4" /> {t("create_salary_template")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("error")}</AlertTitle>
                  <AlertDescription>{t("failed_to_load_salary_data_please_try_again_later")}</AlertDescription>
                </Alert>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() =>
                      fetchStaffSalary({
                        staff_id: employee.id,
                      })
                    }
                  >
                    {t("try_again")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Salary Overview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" /> {t("salary_overview")}
            </CardTitle>
            <CardDescription>
              {salary ? t("current_salary_structure_for_the_employee") : t("no_salary_structure_assigned_yet")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {salary ? (
              <>
                <Button variant="outline" onClick={() => handleNavigateToSalaryPage("edit")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("advanced_edit")}
                </Button>
                <Button onClick={() => handleNavigateToSalaryPage("edit")}>
                  <Edit className="mr-2 h-4 w-4" /> {t("edit_salary")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleNavigateToSalaryPage("create")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("advanced_create")}
                </Button>
                <Button onClick={() => handleNavigateToSalaryPage("create")}>
                  <Plus className="mr-2 h-4 w-4" /> {t("create_salary_template")}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {salary ? (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("template_name")}</Label>
                  <p className="font-medium mt-1">{salary.template_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("template_code")}</Label>
                  <p className="font-medium mt-1">{salary.template_code || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("description")}</Label>
                  <p className="font-medium mt-1">{salary.description || "N/A"}</p>
                </div>
              </div>

              {/* Base Template Info */}
              {salary.base_template && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">{t("base_template_info")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">{t("template_name")}</Label>
                      <p className="font-medium mt-1">{salary.base_template.template_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("template_code")}</Label>
                      <p className="font-medium mt-1">{salary.base_template.template_code || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("annual_ctc")}</Label>
                      <p className="font-medium mt-1">{formatCurrency(salary.base_template.annual_ctc)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-muted-foreground text-sm">{t("annual_ctc")}</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(salary.annual_ctc)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-muted-foreground text-sm">{t("monthly_salary")}</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(Number(salary.annual_ctc) / 12)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-muted-foreground text-sm">{t("total_deductions")}</div>
                    <div className="text-2xl font-bold mt-1 text-destructive">
                      {formatCurrency(totals.totalDeductions)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-muted-foreground text-sm">{t("net_salary")}</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(totals.netSalary)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Salary Components */}
              <Tabs defaultValue="earning">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="earning">{t("earnings")}</TabsTrigger>
                  <TabsTrigger value="deduction">{t("deductions")}</TabsTrigger>
                  <TabsTrigger value="benefits">{t("benefits")}</TabsTrigger>
                </TabsList>
                <TabsContent value="earning" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("component_name")}</TableHead>
                            <TableHead>{t("calculation_method")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead className="text-right">{t("percentage")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salary.template_components
                            .filter((comp) => {
                              const component = getComponentById(comp.salary_components_id)
                              return component?.component_type === "earning"
                            })
                            .map((comp) => {
                              const componentDetails = getComponentById(comp.salary_components_id)
                              return (
                                <TableRow key={comp.id}>
                                  <TableCell>
                                    <div className="font-medium">{componentDetails?.component_name}</div>
                                    {comp.is_mandatory && (
                                      <Badge variant="outline" className="mt-1">
                                        {t("mandatory")}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {componentDetails?.calculation_method === "amount"
                                        ? t("fixed_amount")
                                        : t("percentage")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
                                  <TableCell className="text-right">
                                    {comp.percentage !== null ? `${comp.percentage}%` : "N/A"}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="deduction" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("component_name")}</TableHead>
                            <TableHead>{t("calculation_method")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead>{t("recovery_details")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salary.template_components
                            .filter((comp) => {
                              const component = getComponentById(comp.salary_components_id)
                              return component?.component_type === "deduction"
                            })
                            .map((comp) => {
                              const componentDetails = getComponentById(comp.salary_components_id)
                              return (
                                <TableRow key={comp.id}>
                                  <TableCell>
                                    <div className="font-medium">{componentDetails?.component_name}</div>
                                    {comp.is_mandatory && (
                                      <Badge variant="outline" className="mt-1">
                                        {t("mandatory")}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {componentDetails?.calculation_method === "amount"
                                        ? t("fixed_amount")
                                        : t("percentage")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center">
                                            <span>{getDeductionTypeText(componentDetails!.deduction_type)}</span>
                                            <HelpCircleIcon className="h-4 w-4 ml-1" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Details about this deduction type</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="benefits" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("component_name")}</TableHead>
                            <TableHead>{t("calculation_method")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead>{t("details")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salary.template_components
                            .filter((comp) => {
                              const component = getComponentById(comp.salary_components_id)
                              return component?.component_type === "benefits"
                            })
                            .map((comp) => {
                              const componentDetails = getComponentById(comp.salary_components_id)
                              return (
                                <TableRow key={comp.id}>
                                  <TableCell>
                                    <div className="font-medium">{componentDetails?.component_name}</div>
                                    {comp.is_mandatory && (
                                      <Badge variant="outline" className="mt-1">
                                        {t("mandatory")}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {componentDetails?.calculation_method === "amount"
                                        ? t("fixed_amount")
                                        : t("percentage")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(comp.amount)}</TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center">
                                            <span>{t("view_details")}</span>
                                            <HelpCircleIcon className="h-4 w-4 ml-1" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Details about this benefit</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle>{t("no_salary_template_assigned")}</AlertTitle>
                <AlertDescription>{t("this_employee_does_not_have_a_salary_structure_assigned_yet")}</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("quick_setup")}</CardTitle>
                    <CardDescription>{t("create_a_salary_template_directly_in_this_interface")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("use_this_option_to_quickly_set_up_a_salary_template_with_basic_components")}
                    </p>
                    <Button onClick={() => handleNavigateToSalaryPage("create")} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> {t("create_salary_template")}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("advanced_setup")}</CardTitle>
                    <CardDescription>{t("use_the_advanced_interface_for_more_options")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("use_this_option_for_more_advanced_configuration_and_detailed_setup")}
                    </p>
                    <Button variant="outline" onClick={() => handleNavigateToSalaryPage("create")} className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" /> {t("advanced_create")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeSalaryDetails
