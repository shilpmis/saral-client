import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useLazyGetLeavePolicyForSchoolPageWiseQuery, useLazyGetAllLeaveTypeForSchoolQuery, useLazyGetLeaveTypeForSchoolPageWiseQuery, useCreateLeavePolicyMutation, useUpdateLeavePolicyMutation, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation } from "@/services/LeaveService"
import { LeavePolicy, LeaveType } from "@/types/leave"
import { PageMeta } from "@/types/global"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice"
import { useLazyGetSchoolStaffRoleQuery } from "@/services/StaffService"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { selectLeaveTypeForSchool, setLeave } from "@/redux/slices/leaveSlice"

// Schema for leave type
const leaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  is_paid: z.boolean(),
  affects_payroll: z.boolean()
})

// Schema for leave policy
export const leavePolicySchema = z
  .object({
    staff_role_id: z.string().min(1, { message: "Staff role is required" }),
    leave_type_id: z.string().min(1, { message: "Leave type is required" }),
    annual_quota: z
      .number({ invalid_type_error: "Annual allowance must be a number" })
      .min(0, { message: "Annual allowance must be 0 or greater" })
      .max(50, { message: "Annual allowance cannot exceed 50" }),
    max_consecutive_days: z
      .number({ invalid_type_error: "Max consecutive days must be a number" })
      .min(1, { message: "Max consecutive days must be at least 1" }),
    can_carry_forward: z.boolean(),
    max_carry_forward_days: z
      .number({ invalid_type_error: "Max carryforward days must be a number" })
      .min(0, { message: "Max carryforward days must be 0 or greater" }),
    deduction_rules: z.record(z.string(), z.any()).optional(),
    approval_hierarchy: z.record(z.string(), z.any()).optional(),
    requires_approval: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.max_consecutive_days >= data.annual_quota) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_consecutive_days"],
        message: "Max consecutive days cannot be greater than or equal to the annual allowance",
      });
    }

    if (data.max_carry_forward_days >= data.annual_quota) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_carry_forward_days"],
        message: "Max carryforward days cannot be greater than or equal to the annual allowance",
      });
    }
  });

type LeaveTypeSchema = z.infer<typeof leaveTypeSchema>
type LeavePolicySchema = z.infer<typeof leavePolicySchema>


export function LeaveManagementSettings() {

  const staffRole = useAppSelector(selectSchoolStaffRoles);
  const AlleaveTypeForSchool = useAppSelector(selectLeaveTypeForSchool);

  const auth = useAppSelector(selectAuthState);
  const [getStaffForSchool, { isLoading, isError }] = useLazyGetSchoolStaffRoleQuery()
  const [getLeavePolicies, { isLoading: isLeavePoliciesLoading }] = useLazyGetLeavePolicyForSchoolPageWiseQuery()
  const [getLeaveType, { isLoading: isLeaveTypeLoading }] = useLazyGetLeaveTypeForSchoolPageWiseQuery()

  const [getAllLeaveType, { data: dataForLeaveType, isLoading: isAllLeaveTypeLoading }] = useLazyGetAllLeaveTypeForSchoolQuery()

  const [createLeaveType, { isLoading: loadingForLeaveTypeCreation, isError: ErrorWhileTypeCreation }] = useCreateLeaveTypeMutation()
  const [updateLeaveType, { isLoading: loadingForLeaveTypeUpdation, isError: ErrorWhileTypeUpdation }] = useUpdateLeaveTypeMutation()

  const [createLeavePolicy, { isLoading: loadingForPolicyCreation, isError: ErrorWhilePolicyCreation }] = useCreateLeavePolicyMutation()
  const [updateLeavePolicy, { isLoading: loadingForPolicyUpdation, isError: ErrorWhilePolicyUpdation }] = useUpdateLeavePolicyMutation()

    const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool);

  const leaveTypeForm = useForm<LeaveTypeSchema>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_paid: false,
      affects_payroll: false,
    },
  })

  const leavePolicyForm = useForm<LeavePolicySchema>({
    resolver: zodResolver(leavePolicySchema),
    defaultValues: {
      staff_role_id: "",
      leave_type_id: "",
      annual_quota: 0,
      max_consecutive_days: 1,
      can_carry_forward: false,
      max_carry_forward_days: 0,
    },
  })

  const [activeTab, setActiveTab] = useState("leave-types")

  const [DialogForLeaveType, setDialogForLeaveType] = useState<{
    type: 'add' | 'edit',
    leave_type: LeaveType | null,
    isOpen: boolean
  }>({
    isOpen: false,
    type: 'add',
    leave_type: null
  })

  const [DialogForLeavePolicy, setDialogForLeavePolicy] = useState<{
    type: 'add' | 'edit',
    leave_policy: LeavePolicy | null,
    isOpen: boolean
  }>({
    isOpen: false,
    type: 'add',
    leave_policy: null
  })


  const [currentlyDispalyedLeaveTypes, setCurrentlyDispalyedLeaveTypes] = useState<{
    leave_type: LeaveType[], page: PageMeta
  } | null>(null)

 

  const [currentlyDispalyedLeavePolicy, setCurrentlyDispalyedLeavePolicy] = useState<{
    leave_policy: LeavePolicy[], page: PageMeta
  } | null>(null)

  const {t} = useTranslation()

  const onLeaveTypeSubmit: SubmitHandler<LeaveTypeSchema> = async (data) => {

    if (DialogForLeaveType.type === 'edit') {
      let updated_type = await updateLeaveType({
        leave_type_id: DialogForLeaveType.leave_type!.id, payload: {
          leave_type_name: data.name,
          is_paid: data.is_paid,
          affects_payroll: data.affects_payroll,
          requires_proof: false,
          is_active: true
        }
      })
      if (updated_type.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
        })
        console.log(updated_type)
      }
      if (updated_type.data) {
        toast({
          variant: 'default',
          title: 'Leave type updated successfully ✔️',
          description: 'updated 🆗',
          duration : 3000
        })
        fetchDataForActiveTab("leave-types", currentlyDispalyedLeaveTypes?.page?.current_page);
      }
    } else {
      let new_type = await createLeaveType({
        leave_type_name: data.name,
        is_paid: data.is_paid,
        affects_payroll: data.affects_payroll,
        requires_proof: false,
        is_active: true,
        academic_session_id : CurrentAcademicSessionForSchool!.id
      })
      if (new_type.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
        })
        console.log(new_type)
      }
      if (new_type.data) {
        toast({
          variant: 'default',
          title: 'Leave type created successfully ✔️',
          description: 'created 🆗',
          duration : 3000
        })
        fetchDataForActiveTab("leave-types", currentlyDispalyedLeaveTypes?.page?.current_page);
      }
    }
    setDialogForLeaveType({
      isOpen: false,
      type: 'add',
      leave_type: null
    })
    
  }

  const onLeavePolicySubmit: SubmitHandler<LeavePolicySchema> = async (data) => {
    // Here you would typically save the data to your backend

    if (DialogForLeavePolicy.type === "add") {
      let new_policy = await createLeavePolicy({
        annual_quota: data.annual_quota,
        staff_role_id: Number(data.staff_role_id),
        leave_type_id: Number(data.leave_type_id),
        can_carry_forward: data.can_carry_forward,
        max_carry_forward_days: data.max_carry_forward_days,
        max_consecutive_days: data.max_consecutive_days,
        deduction_rules: {},
        approval_hierarchy: {},
        requires_approval: 0,
        academic_session_id : CurrentAcademicSessionForSchool!.id
      })
      if (new_policy.data) {
        toast({
          variant: 'default',
          title: 'Policy created successfully ✍🏾',
          description: '🆗 successfully',
          duration: 3000
        })
        fetchDataForActiveTab("leave-policies", currentlyDispalyedLeavePolicy?.page?.current_page)
      }
      if (new_policy.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
        })
        console.log(new_policy)
      }
    }
    if (DialogForLeavePolicy.type === 'edit') {
      let policy_id = DialogForLeavePolicy.leave_policy!.id

      let payload = {
        annual_quota: data.annual_quota,
        staff_role_id: Number(data.staff_role_id),
        leave_type_id: Number(data.leave_type_id),
        can_carry_forward: data.can_carry_forward,
        max_carry_forward_days: data.max_carry_forward_days,
        max_consecutive_days: data.max_consecutive_days,
        deduction_rules: {},
        approval_hierarchy: {},
        requires_approval: 0,

      }
      let policy = await updateLeavePolicy({ policy_id: policy_id, payload: payload })
      if (policy.data) {
        toast({
          variant: 'default',
          title: 'Policy updated successfully 👍🏾',
          description: 'Updated',
          duration: 3000
        })
        fetchDataForActiveTab("leave-policies", currentlyDispalyedLeavePolicy?.page?.current_page)
      }
      if (policy.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
        })
        console.log(policy.error)
      }

    }
    leavePolicyForm.reset()
    setDialogForLeavePolicy({
      isOpen: false,
      type: 'add',
      leave_policy: null
    })
  }

  const openLeaveTypeDialog = (type: 'add' | 'edit', leaveType: LeaveType | null) => {
    
    setDialogForLeaveType({
      isOpen: true,
      type: type,
      leave_type: leaveType
    })
    if(type === 'edit' && leaveType){
      leaveTypeForm.reset({
        name: leaveType?.leave_type_name,
        description: leaveType?.leave_type_name,
        is_paid: leaveType?.is_paid ,
        affects_payroll: leaveType?.affects_payroll,
      })
    }else{
      leaveTypeForm.reset({
        name: "",
        description: "",
        is_paid: false,
        affects_payroll: false,
      })
    }

    getAllLeaveType({
      academic_session_id: CurrentAcademicSessionForSchool!.id
    })

  }

  const openLeavePolicyDialog = (type: 'add' | 'edit', leavePolicy: LeavePolicy | null) => {
    setDialogForLeavePolicy({
      isOpen: true,
      type: type,
      leave_policy: leavePolicy
    })

    /**
     * Fetch Staff role and type of leaved accordingly
     */

    if (!staffRole) {
      getStaffForSchool(auth.user!.school_id)
    }

    // getLeaveType({ page: "all" })

    leavePolicyForm.reset({
      annual_quota: leavePolicy?.annual_quota,
      staff_role_id: leavePolicy?.staff_role_id.toString(),
      can_carry_forward: leavePolicy?.can_carry_forward,
      leave_type_id: leavePolicy?.leave_type_id.toString(),
      max_carry_forward_days: leavePolicy?.max_carry_forward_days,
      max_consecutive_days: leavePolicy?.max_consecutive_days,
    })
  }

  async function fetchDataForActiveTab(type: 'leave-types' | 'leave-policies', page: number = 1) {

    try {
      if (type === 'leave-policies') {
        const leave_policy = await getLeavePolicies({ page: page , academic_session_id : CurrentAcademicSessionForSchool!.id});
        if (leave_policy.data) {
          console.log(leave_policy.data.data)
          setCurrentlyDispalyedLeavePolicy({
            leave_policy: leave_policy.data.data,
            page: leave_policy.data.page
          })
        }
      }

      if (type === 'leave-types') {
        const leave_type = await getLeaveType({ page: page , academic_session_id : CurrentAcademicSessionForSchool!.id });
        if (leave_type.data) {
          setCurrentlyDispalyedLeaveTypes({
            leave_type: leave_type.data.data,
            page: leave_type.data.page
          })
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  useEffect(() => {
    if (!currentlyDispalyedLeavePolicy || !currentlyDispalyedLeaveTypes) {
      fetchDataForActiveTab(activeTab as 'leave-types' | 'leave-policies', 1);
    }
    if (!dataForLeaveType || !AlleaveTypeForSchool) {
      getAllLeaveType({
        academic_session_id: CurrentAcademicSessionForSchool!.id
      });
    }

  }, [activeTab])

    
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("leave_management_settings")}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave-types">{t("leave_type")}</TabsTrigger>
          <TabsTrigger value="leave-policies">{t("leave_policies")}</TabsTrigger>
        </TabsList>
        <TabsContent value="leave-types">
          <Card>
            <CardHeader>
             <CardTitle>{t("leave_type")}</CardTitle>
              <CardDescription>{t("manage_different_types_of_leaves_available_in_your_organization")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => openLeaveTypeDialog('add', null)}>
                  <Plus className="mr-2 h-4 w-4" /> {t("add_leave_type")}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    {/* <TableHead>Description</TableHead> */}
                    {/* <TableHead>{t("paid")}</TableHead> */}
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {
                  currentlyDispalyedLeaveTypes?.leave_type.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell>{leaveType.leave_type_name}</TableCell>
                      {/* <TableCell>{""}</TableCell>
                      <TableCell>{leaveType.is_paid ? "Yes" : "No"}</TableCell> */}
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openLeaveTypeDialog("edit", leaveType)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leave-policies">
          <Card>
            <CardHeader>
              <CardTitle>{t("leave_policies")}</CardTitle>
              <CardDescription>{t("set_leave_policies_for_different_staff_roles")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => openLeavePolicyDialog("add", null)}>
                  <Plus className="mr-2 h-4 w-4" />{t("add_leave_policy")}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("staff_role")}</TableHead>
                    <TableHead>{t("leave_type")}</TableHead>
                    <TableHead>{t("annual_allowance")}</TableHead>
                    <TableHead>{t("max_consecutive_days")}</TableHead>
                    {/* <TableHead>Notice Period (Days)</TableHead> */}
                    <TableHead>{t("carry_forward")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentlyDispalyedLeavePolicy && currentlyDispalyedLeavePolicy.leave_policy.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.staff_role.role}</TableCell>
                      <TableCell>{policy.leave_type.leave_type_name}</TableCell>
                      <TableCell>{policy.annual_quota}</TableCell>
                      <TableCell>{policy.max_consecutive_days}</TableCell>
                      {/* <TableCell>{policy.can_carry_forward}</TableCell> */}
                      <TableCell>
                        {policy.can_carry_forward ? `Yes (Max ${policy.max_carry_forward_days} days)` : "No"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openLeavePolicyDialog('edit', policy)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Type Dialog */}
      <Dialog open={DialogForLeaveType.isOpen} onOpenChange={(value) => {
        setDialogForLeaveType({
          ...DialogForLeaveType,
          isOpen: value
        })
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DialogForLeaveType.type === 'edit' ? t("edit_leave_type") : t("add_leave_type")}</DialogTitle>
            <DialogDescription>
              {DialogForLeaveType.type === 'edit' ? t("edit_the_details_of_the_new_leave_type.") : t("edit_the_details_of_the_new_leave_type.")}
            </DialogDescription>
          </DialogHeader>
          <Form {...leaveTypeForm}>
            <form onSubmit={leaveTypeForm.handleSubmit(onLeaveTypeSubmit)} className="space-y-8">
              <FormField
                control={leaveTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leaveTypeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leaveTypeForm.control}
                name="is_paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("paid_leave")}</FormLabel>
                      <FormDescription>{t("is_this_a_paid_leave_type?")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={(checked) => { field.onChange(checked) }} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={leaveTypeForm.control}
                name="affects_payroll"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("affect_role")}</FormLabel>
                      <FormDescription>{t("is_this_a_paid_leave_type?")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={(checked) => { field.onChange(checked) }} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{DialogForLeaveType.type === 'edit' ? t("update") : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Leave Policy Dialog */}
      <Dialog open={DialogForLeavePolicy.isOpen} onOpenChange={(value) => {
        if (!value) {
          setDialogForLeavePolicy({
            ...DialogForLeavePolicy,
            isOpen: value
          })
        }
      }}>
        <DialogContent className="sm:max-w-[425px] h-[500px] overflow-auto">
          <DialogHeader>
            <DialogTitle>{DialogForLeavePolicy.type === 'edit' ? "Edit Leave Policy" : t("add_leave_policy")}</DialogTitle>
            <DialogDescription>
              {DialogForLeavePolicy.type === 'edit'
                ? "Edit the details of the leave policy."
                : t("edit_the_details_of_the_new_leave_policy.")}
            </DialogDescription>
          </DialogHeader>
          <Form {...leavePolicyForm}>
            <form onSubmit={leavePolicyForm.handleSubmit(onLeavePolicySubmit)} className="space-y-8">
              <FormField
                control={leavePolicyForm.control}
                name="staff_role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staff_role")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}
                      disabled={DialogForLeavePolicy.type === 'edit'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRole && staffRole.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="leave_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("leave_type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}
                      disabled={DialogForLeavePolicy.type === 'edit'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="select_leave_type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AlleaveTypeForSchool && AlleaveTypeForSchool.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.leave_type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="annual_quota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("annual_allowance")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="max_consecutive_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("max_consecutive_days")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="can_carry_forward"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("allow_carry_forward")}</FormLabel>
                      <FormDescription>{t("can_unused_leaves_be_carried_forward_to_the_next_year?")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={(checked) => { field.onChange(checked) }} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="max_carry_forward_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("max_carry_forward")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{DialogForLeavePolicy.type === 'edit' ? "Update" : t("create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}