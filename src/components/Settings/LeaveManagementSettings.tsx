"use client"

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
import { selectAuthState } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"

// Schema for leave type
const leaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  is_paid: z.boolean(),
  affects_payroll: z.boolean()
})

// Schema for leave policy
const leavePolicySchema = z.object({
  staff_role_id: z.string().min(1, "Staff role is required"),
  leave_type_id: z.string().min(1, "Leave type is required"),
  annual_quota: z.number().min(0, "Annual allowance must be 0 or greater"),
  max_consecutive_days: z.number().min(1, "Max consecutive days must be at least 1"),
  can_carry_forward: z.boolean(),
  max_carry_forward_days: z.number().min(0, "Max carryforward days must be 0 or greater"),
})

type LeaveTypeSchema = z.infer<typeof leaveTypeSchema>
type LeavePolicySchema = z.infer<typeof leavePolicySchema>


export function LeaveManagementSettings() {

  const staffRole = useAppSelector(selectSchoolStaffRoles);
  const auth = useAppSelector(selectAuthState);
  const [getStaffForSchool, { isLoading, isError }] = useLazyGetSchoolStaffRoleQuery()
  const [getLeavePolicies, { isLoading: isLeavePoliciesLoading }] = useLazyGetLeavePolicyForSchoolPageWiseQuery()
  const [getLeaveType, { isLoading: isLeaveTypeLoading }] = useLazyGetLeaveTypeForSchoolPageWiseQuery()

  const [getAllLeaveType, { data: dataForLeaveType, isLoading: isAllLeaveTypeLoading }] = useLazyGetAllLeaveTypeForSchoolQuery()

  const [createLeaveType, { isLoading: loadingForLeaveTypeCreation, isError: ErrorWhileTypeCreation }] = useCreateLeaveTypeMutation()
  const [updateLeaveType, { isLoading: loadingForLeaveTypeUpdation, isError: ErrorWhileTypeUpdation }] = useUpdateLeaveTypeMutation()

  const [createLeavePolicy, { isLoading: loadingForPolicyCreation, isError: ErrorWhilePolicyCreation }] = useCreateLeavePolicyMutation()
  const [updateLeavePolicy, { isLoading: loadingForPolicyUpdation, isError: ErrorWhilePolicyUpdation }] = useUpdateLeavePolicyMutation()

  const leaveTypeForm = useForm<LeaveTypeSchema>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_paid: true,
      affects_payroll: true,
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


  /***
 * 
 * TODO : 
 *  -need to handle error here for both update nad create 
 *  -Need to add loader while api is executing 
 *  -Need to reflect data in UI as it get change  
 *  -close dialog and clear state after successfull submit
 */
  const onLeaveTypeSubmit: SubmitHandler<LeaveTypeSchema> = async (data) => {
    console.log(data)
    // Here you would typically save the data to your backend

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
        is_active: true
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
  // for table dynamic render  
  useEffect(()=>{
    console.log(currentlyDispalyedLeaveTypes);

  },[currentlyDispalyedLeaveTypes])



  /***
   * 
   * TODO : 
   *  -need to handle error here for both update nad create 
   *  -Need to add loader while api is executing 
   *  -Need to reflect data in UI as it get change  
   *  - Resolve bug for Carry Forward filed while updating leave policy (it gives verification error)
   *  -close dialog and clear state after successfull submit
   * 
   */

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
        requires_approval: 0
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

    leaveTypeForm.reset({
      name: leaveType?.leave_type_name,
      description: leaveType?.leave_type_name,
      is_paid: leaveType!.is_paid,
      affects_payroll: leaveType!.affects_payroll,
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
        const leave_policy = await getLeavePolicies({ page: page });
        if (leave_policy.data) {
          console.log(leave_policy.data.data)
          setCurrentlyDispalyedLeavePolicy({
            leave_policy: leave_policy.data.data,
            page: leave_policy.data.page
          })
        }
      }

      if (type === 'leave-types') {
        const leave_type = await getLeaveType({ page: page });
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
    if (!dataForLeaveType) {
      getAllLeaveType();
    }

  }, [activeTab])


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Leave Management Settings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
          <TabsTrigger value="leave-policies">Leave Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="leave-types">
          <Card>
            <CardHeader>
              <CardTitle>Leave Types</CardTitle>
              <CardDescription>Manage different types of leaves available in your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => openLeaveTypeDialog('add', null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {/* <TableHead>Description</TableHead> */}
                    <TableHead>Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {
                  currentlyDispalyedLeaveTypes?.leave_type.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell>{leaveType.leave_type_name}</TableCell>
                      <TableCell>{""}</TableCell>
                      <TableCell>{leaveType.is_paid ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openLeaveTypeDialog("edit", leaveType)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              <CardTitle>Leave Policies</CardTitle>
              <CardDescription>Set leave policies for different staff roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => openLeavePolicyDialog("add", null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Leave Policy
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Role</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Annual Allowance</TableHead>
                    <TableHead>Max Consecutive Days</TableHead>
                    {/* <TableHead>Notice Period (Days)</TableHead> */}
                    <TableHead>Carryforward</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>{DialogForLeaveType.type === 'edit' ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
            <DialogDescription>
              {DialogForLeaveType.type === 'edit' ? "Edit the details of the leave type." : "Enter the details of the new leave type."}
            </DialogDescription>
          </DialogHeader>
          <Form {...leaveTypeForm}>
            <form onSubmit={leaveTypeForm.handleSubmit(onLeaveTypeSubmit)} className="space-y-8">
              <FormField
                control={leaveTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel className="text-base">Paid Leave</FormLabel>
                      <FormDescription>Is this a paid leave type?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <FormLabel className="text-base">Affect Payroll</FormLabel>
                      <FormDescription>Is this a paid leave type?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{DialogForLeaveType.type === 'edit' ? "Update" : "Create"}</Button>
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
            <DialogTitle>{DialogForLeavePolicy.type === 'edit' ? "Edit Leave Policy" : "Add Leave Policy"}</DialogTitle>
            <DialogDescription>
              {DialogForLeavePolicy.type === 'edit'
                ? "Edit the details of the leave policy."
                : "Enter the details of the new leave policy."}
            </DialogDescription>
          </DialogHeader>
          <Form {...leavePolicyForm}>
            <form onSubmit={leavePolicyForm.handleSubmit(onLeavePolicySubmit)} className="space-y-8">
              <FormField
                control={leavePolicyForm.control}
                name="staff_role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
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
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}
                      disabled={DialogForLeavePolicy.type === 'edit'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dataForLeaveType && dataForLeaveType.map((type) => (
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
                    <FormLabel>Annual Allowance</FormLabel>
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
                    <FormLabel>Max Consecutive Days</FormLabel>
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
              {/* <FormField
                control={leavePolicyForm.control}
                name="noticePeriodDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period (Days)</FormLabel>
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
              /> */}
              <FormField
                control={leavePolicyForm.control}
                name="can_carry_forward"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Carryforward</FormLabel>
                      <FormDescription>Can unused leaves be carried forward to the next year?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={leavePolicyForm.control}
                name="max_carry_forward_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Carryforward Days</FormLabel>
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
                <Button type="submit">{DialogForLeavePolicy.type === 'edit' ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

