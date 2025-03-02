import type React from "react"
import { useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { DateTime } from "luxon"
import type { LeaveApplicationForTeachingStaff } from "@/types/leave"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectLeavePolicyForUser } from "@/redux/slices/leaveSlice"
import {
    useApplyLeaveForTeacherMutation,
    useLazyGetAllLeavePoliciesForUserQuery,
    useUpdateLeaveForTeacherMutation,
} from "@/services/LeaveService"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"

const leaveApplicationSchema = z
    .object({
        leave_type: z.string().nonempty("Leave type is required"),
        from_date: z.string().nonempty("From date is required"),
        to_date: z.string().nonempty("To date is required"),
        reason: z.string().min(1, "Reason is required"),
        is_half_day: z.boolean(),
        half_day_type: z.enum(["first_half", "second_half", "none"]),
        is_hourly_leave: z.boolean(),
        total_hours: z.number().nullable().optional(),
    })
    .refine((data) => {
        const startDate = DateTime.fromISO(data.from_date)
        const endDate = DateTime.fromISO(data.to_date)
        const today = DateTime.now().startOf("day")
        const twoMonthsFromNow = today.plus({ months: 2 })

        if (startDate < today) {
            return { message: "Start date cannot be in the past", path: ["from_date"] }
        }
        if (startDate > endDate) {
            return { message: "End date must be after start date", path: ["to_date"] }
        }
        if (endDate > twoMonthsFromNow) {
            return { message: "End date cannot be more than 2 months in the future", path: ["to_date"] }
        }
        if (data.is_hourly_leave && !startDate.equals(endDate)) {
            return { message: "Hourly leave must be for a single day", path: ["to_date"] }
        }
        if (data.is_hourly_leave && (data.is_half_day || data.half_day_type !== "none")) {
            return { message: "Hourly leave cannot be combined with half-day leave", path: ["is_hourly_leave"] }
        }
        if (data.is_hourly_leave && (!data.total_hours || data.total_hours > 4)) {
            return { message: "Hourly leave must be between 1 and 4 hours", path: ["total_hours"] }
        }
        if (data.is_half_day && !startDate.equals(endDate)) {
            return { message: "Half-day leave must be for a single day", path: ["to_date"] }
        }
        if (data.is_half_day && data.half_day_type === "none") {
            return { message: "Please select half-day type", path: ["half_day_type"] }
        }
        if (!data.is_hourly_leave && data.total_hours !== null) {
            return { message: "Total hours should only be set for hourly leave", path: ["total_hours"] }
        }

        return true
    })

type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>

interface LeaveApplicationFormProps {
    initialData?: LeaveApplicationForTeachingStaff | null
    onSucessesfullApplication: (leave: LeaveApplicationForTeachingStaff) => void
    type: "edit" | "create"
    onCancel: () => void 
}

export const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ initialData, onSucessesfullApplication, type , onCancel }) => {
    const user = useAppSelector(selectCurrentUser)
    const leavePolicyForUser = useAppSelector(selectLeavePolicyForUser)

    const [getAllLeavePoliciesForUser] = useLazyGetAllLeavePoliciesForUserQuery()
    const [applyLeaveForTeacher] = useApplyLeaveForTeacherMutation()
    const [updateLeaveForTeacher] = useUpdateLeaveForTeacherMutation()

    const form = useForm<LeaveApplicationFormData>({
        resolver: zodResolver(leaveApplicationSchema),
        defaultValues: {
            leave_type: "",
            from_date: "",
            to_date: "",
            reason: "",
            is_half_day: false,
            half_day_type: "none",
            is_hourly_leave: false,
            total_hours: undefined,
        },
    })

    const handleSubmit: SubmitHandler<LeaveApplicationFormData> = async (data) => {
        try {
            if (type === "create" && user?.teacher_id) {
                const response: any = await applyLeaveForTeacher({
                    teacher_id: user.teacher_id,
                    leave_type_id: Number(data.leave_type),
                    from_date: data.from_date,
                    to_date: data.to_date,
                    reason: data.reason,
                    is_half_day: data.is_half_day,
                    half_day_type: data.half_day_type,
                    is_hourly_leave: data.is_hourly_leave,
                    documents: {},
                    total_hour: data.total_hours ? data.total_hours : null,
                })

                if (response.error) {
                    toast({
                        variant: "destructive",
                        title: response.error.data.message,
                    })
                }

                if (response.data) {
                    console.log("response.data", response.data)
                    onSucessesfullApplication(response.data)
                    toast({
                        variant: "default",
                        title: "Successfully added leave application!",
                        duration: 3000
                    })
                }

            } else if (type === "edit" && initialData) {
                let response : any = await updateLeaveForTeacher({
                    payload: {
                        leave_type_id: Number(data.leave_type),
                        from_date: data.from_date,
                        to_date: data.to_date,
                        reason: data.reason,
                        is_half_day: data.is_half_day,
                        half_day_type: data.half_day_type,
                        is_hourly_leave: data.is_hourly_leave,
                        documents: {},
                        total_hour: data.total_hours,
                    },
                    application_id: initialData.uuid
                })  

                if(response.data){
                    onSucessesfullApplication(response.data)
                    toast({
                        variant: "default",
                        title: "Successfully updated leave application!",
                    })
                }else{
                    toast({
                        variant: "destructive",
                        title: response.error.data.message,
                    })   
                }

            }
        } catch (error) {
            console.log("response.data", error)
            toast({
                variant: "destructive",
                title: "Error submitting leave application",
                description: "Please try again later.",
            })
        }
    }

    useEffect(() => {
        if (initialData) {
            form.reset({
                leave_type: initialData.leave_type.id.toString(),
                from_date: initialData.from_date,
                to_date: initialData.to_date,
                reason: initialData.reason,
                is_half_day: Boolean(initialData.is_half_day),
                half_day_type: initialData.half_day_type,
                is_hourly_leave: Boolean(initialData.is_hourly_leave),
                total_hours: initialData.total_hour,
            })
        }
    }, [initialData, form])

    useEffect(() => {
        if (!leavePolicyForUser) {
            getAllLeavePoliciesForUser()
        }
    }, [leavePolicyForUser, getAllLeavePoliciesForUser])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="leave_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Leave Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {leavePolicyForUser &&
                                        leavePolicyForUser.map((leavePolicy) => (
                                            <SelectItem key={leavePolicy.leave_type_id} value={leavePolicy.leave_type.id.toString()}>
                                                {leavePolicy.leave_type.leave_type_name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="from_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>From Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="to_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>To Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reason</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_half_day"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        if (checked) {
                                            form.setValue("is_hourly_leave", false)
                                            form.setValue("total_hours", undefined)
                                        }
                                    }}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Half Day</FormLabel>
                                <FormDescription>Check if this is a half-day leave</FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                {form.watch("is_half_day") && (
                    <FormField
                        control={form.control}
                        name="half_day_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Half Day Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select half day type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="first_half">First Half</SelectItem>
                                        <SelectItem value="second_half">Second Half</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="is_hourly_leave"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        if (checked) {
                                            form.setValue("is_half_day", false)
                                            form.setValue("half_day_type", "none")
                                        } else {
                                            form.setValue("total_hours", undefined)
                                        }
                                    }}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Hourly Leave</FormLabel>
                                <FormDescription>Check if this is an hourly leave</FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                {form.watch("is_hourly_leave") && (
                    <FormField
                        control={form.control}
                        name="total_hours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Hours</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                field.onChange(Number(e.target.value));
                                            } else {
                                                field.onChange(null); // Handle clearing input
                                            }
                                        }}
                                        min={1}
                                        max={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}

