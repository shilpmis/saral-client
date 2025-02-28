"use client"

import { useState } from "react"
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

// Schema for leave type
const leaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  isPaid: z.boolean(),
})

// Schema for leave policy
const leavePolicySchema = z.object({
  staffRoleId: z.string().min(1, "Staff role is required"),
  leaveTypeId: z.string().min(1, "Leave type is required"),
  annualAllowance: z.number().min(0, "Annual allowance must be 0 or greater"),
  maxConsecutiveDays: z.number().min(1, "Max consecutive days must be at least 1"),
  noticePeriodDays: z.number().min(0, "Notice period days must be 0 or greater"),
  isCarryforward: z.boolean(),
  maxCarryforwardDays: z.number().min(0, "Max carryforward days must be 0 or greater"),
})

type LeaveType = z.infer<typeof leaveTypeSchema>
type LeavePolicy = z.infer<typeof leavePolicySchema>

// Mock data for staff roles and leave types
const staffRoles = [
  { id: "1", name: "Teacher" },
  { id: "2", name: "Administrative Staff" },
  { id: "3", name: "Principal" },
]

const leaveTypes = [
  { id: "1", name: "Sick Leave", description: "For medical reasons", isPaid: true },
  { id: "2", name: "Casual Leave", description: "For personal reasons", isPaid: true },
  { id: "3", name: "Unpaid Leave", description: "Leave without pay", isPaid: false },
]

const leavePolicies = [
  {
    id: "1",
    staffRoleId: "1",
    leaveTypeId: "1",
    annualAllowance: 10,
    maxConsecutiveDays: 5,
    noticePeriodDays: 1,
    isCarryforward: true,
    maxCarryforwardDays: 5,
  },
  {
    id: "2",
    staffRoleId: "1",
    leaveTypeId: "2",
    annualAllowance: 12,
    maxConsecutiveDays: 3,
    noticePeriodDays: 2,
    isCarryforward: false,
    maxCarryforwardDays: 0,
  },
]

export function LeaveManagementSettings() {
  
  const [activeTab, setActiveTab] = useState("leave-types")
  const [isLeaveTypeDialogOpen, setIsLeaveTypeDialogOpen] = useState(false)
  const [isLeavePolicyDialogOpen, setIsLeavePolicyDialogOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [editingLeavePolicy, setEditingLeavePolicy] = useState<LeavePolicy | null>(null)

  const leaveTypeForm = useForm<LeaveType>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      isPaid: true,
    },
  })

  const leavePolicyForm = useForm<LeavePolicy>({
    resolver: zodResolver(leavePolicySchema),
    defaultValues: {
      staffRoleId: "",
      leaveTypeId: "",
      annualAllowance: 0,
      maxConsecutiveDays: 1,
      noticePeriodDays: 0,
      isCarryforward: false,
      maxCarryforwardDays: 0,
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


  const onLeavePolicySubmit: SubmitHandler<LeavePolicy> = (data) => {
    console.log(data)
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
    setIsLeaveTypeDialogOpen(true)
  }

  const openLeavePolicyDialog = (leavePolicy?: LeavePolicy) => {
    if (leavePolicy) {
      setEditingLeavePolicy(leavePolicy)
      leavePolicyForm.reset(leavePolicy)
    } else {
      setEditingLeavePolicy(null)
      leavePolicyForm.reset()
    }
    setIsLeavePolicyDialogOpen(true)
  }

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
                <Button onClick={() => openLeaveTypeDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {
                  currentlyDispalyedLeaveTypes?.leave_type.map((leaveType) => (

                    <TableRow key={leaveType.id}>
                      <TableCell>{leaveType.name}</TableCell>
                      <TableCell>{leaveType.description}</TableCell>
                      <TableCell>{leaveType.isPaid ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openLeaveTypeDialog(leaveType)}>
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
                <Button onClick={() => openLeavePolicyDialog()}>
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
                    <TableHead>Notice Period (Days)</TableHead>
                    <TableHead>Carryforward</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leavePolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{staffRoles.find((role) => role.id === policy.staffRoleId)?.name}</TableCell>
                      <TableCell>{leaveTypes.find((type) => type.id === policy.leaveTypeId)?.name}</TableCell>
                      <TableCell>{policy.annualAllowance}</TableCell>
                      <TableCell>{policy.maxConsecutiveDays}</TableCell>
                      <TableCell>{policy.noticePeriodDays}</TableCell>
                      <TableCell>
                        {policy.isCarryforward ? `Yes (Max ${policy.maxCarryforwardDays} days)` : "No"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openLeavePolicyDialog(policy)}>
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
      <Dialog open={isLeaveTypeDialogOpen} onOpenChange={setIsLeaveTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
            <DialogDescription>
              {editingLeaveType ? "Edit the details of the leave type." : "Enter the details of the new leave type."}
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
                name="isPaid"
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
              <DialogFooter>
                <Button type="submit">{editingLeaveType ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Leave Policy Dialog */}
      <Dialog open={isLeavePolicyDialogOpen} onOpenChange={setIsLeavePolicyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLeavePolicy ? "Edit Leave Policy" : "Add Leave Policy"}</DialogTitle>
            <DialogDescription>
              {editingLeavePolicy
                ? "Edit the details of the leave policy."
                : "Enter the details of the new leave policy."}
            </DialogDescription>
          </DialogHeader>
          <Form {...leavePolicyForm}>
            <form onSubmit={leavePolicyForm.handleSubmit(onLeavePolicySubmit)} className="space-y-8">
              <FormField
                control={leavePolicyForm.control}
                name="staffRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
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
                name="leaveTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                name="annualAllowance"
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
                name="maxConsecutiveDays"
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
              <FormField
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
              />
              <FormField
                control={leavePolicyForm.control}
                name="isCarryforward"
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
                name="maxCarryforwardDays"
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
                <Button type="submit">{editingLeavePolicy ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

