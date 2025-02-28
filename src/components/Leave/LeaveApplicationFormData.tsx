"use client"

import type React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { DateTime } from 'luxon'
import { LeaveApplicationForTeachingStaff } from "@/types/leave"
import { useEffect } from "react"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectLeavePolicyForUser } from "@/redux/slices/leaveSlice"
import { useApplyLeaveForTeacherMutation, useLazyGetAllLeavePoliciesForUserQuery, useUpdateLeaveForTeacherMutation } from "@/services/LeaveService"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"

const leaveApplicationSchema = z
    .object({
        leave_type: z.string(),
        from_date: z.string(),
        to_date: z.string(),
        reason: z.string().min(1, "Reason is required"),
        is_half_day: z.boolean(),
        half_day_type: z.enum(["first_half", "second_half", "none"]),
        is_hourly_leave: z.boolean(),
        total_hours: z.number(),
    })
// .refine(
//     (data) => {
//         const startDate = DateTime.fromISO(data.from_date)
//         const endDate = DateTime.fromISO(data.to_date)
//         const today = DateTime.now().startOf("day")
//         const twoMonthsFromNow = today.plus({ months: 2 })

//         if (startDate < today) {
//             return false
//         }
//         if (startDate > endDate) {
//             return false
//         }
//         if (endDate > twoMonthsFromNow) {
//             return false
//         }
//         if (data.is_hourly_leave && !startDate.equals(endDate)) {
//             return false
//         }
//         if (data.is_hourly_leave && (data.is_half_day || data.half_day_type !== "none")) {
//             return false
//         }
//         if (data.is_hourly_leave && (!data.total_hours || data.total_hours > 4)) {
//             return false
//         }
//         if (data.is_half_day && !startDate.equals(endDate)) {
//             return false
//         }
//         if (data.is_half_day && data.half_day_type === "none") {
//             return false
//         }
//         if (!data.is_hourly_leave && data.total_hours !== null) {
//             return false
//         }

//         return true
//     },
//     {
//         message: "Invalid leave application",
//         path: ["from_date"],
//     },
// )

type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>

interface LeaveApplicationFormProps {
    initialData?: LeaveApplicationForTeachingStaff | null
    onCancel: () => void
    tpye: "edit" | "create"
}

export const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ initialData, onCancel, tpye }) => {

    const user = useAppSelector(selectCurrentUser);
    const leavePolicyForUser = useAppSelector(selectLeavePolicyForUser);

    const [getAllLeavePoliciesForUser, { isLoading }] = useLazyGetAllLeavePoliciesForUserQuery()

    const [applyLeaveForTeacher, { isLoading: LoadingForCreateTeacherApplcation }] = useApplyLeaveForTeacherMutation()
    const [updateLeaveForTeacher, { isLoading: LoadingForUpdateTeacherApplcation }] = useUpdateLeaveForTeacherMutation()

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

        if (tpye === 'create' && user!.teacher_id) {
            const application = await applyLeaveForTeacher({
                teacher_id: user!.teacher_id,
                leave_type_id: Number(data.leave_type),
                from_date: data.from_date,
                to_date: data.to_date,
                reason: data.reason,
                is_half_day: data.is_half_day,
                half_day_type: data.half_day_type,
                is_hourly_leave: data.is_hourly_leave,
                documents: {},
                total_hour: Number(data.total_hours),

            })
            if (application.error) {
                toast({
                    variant: 'destructive',
                    title: 'application.error',
                })
            }
            if (application.data) {
                toast({
                    variant: 'default',
                    title: 'Successfully added leave application !',
                })
                onCancel()
            }
        }
        else if(tpye === 'edit'){
            updateLeaveForTeacher({
                // leave_application_id: initialData!.id,
                leave_type_id: Number(data.leave_type),
                from_date: data.from_date,
                to_date: data.to_date,
                reason: data.reason,
                is_half_day: data.is_half_day,
                half_day_type: data.half_day_type,
                is_hourly_leave: data.is_hourly_leave,
                documents: {},
                total_hour: Number(data.total_hours)
            })
        }

    }

    useEffect(() => {
        if (initialData) {
            /**
             * TODO :: Select value not get reflected while editing
             */
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
    }, [])

    useEffect(() => {
        if (!leavePolicyForUser) {
            getAllLeavePoliciesForUser();
        }
    }, [])


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="leave_type"
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
                                    {leavePolicyForUser && leavePolicyForUser.map((leavePolicy) => (
                                        <SelectItem
                                            key={leavePolicy.leave_type_id}
                                            value={leavePolicy.leave_type.id.toString()}>
                                            {leavePolicy.leave_type.leave_type_name}</SelectItem>
                                    ))
                                    }
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
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />)}

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

