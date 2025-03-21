"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAddInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useGetClassSeatAvailabilityQuery } from "@/services/QuotaService"


const formSchema = z.object({
  student_name: z.string().min(2, { message: "Student name is required" }),
  parent_name: z.string().min(2, { message: "Parent name is required" }),
  parent_contact: z.string().min(10, { message: "Valid contact number is required" }),
  parent_email: z.string().email({ message: "Valid email is required" }),
  class_applying: z.string().min(1, { message: "Class is required" }),
  dob: z.string().optional(),
  gender: z.string().default("male"),
  address: z.string().default(""),
  applying_for_quota: z.boolean().default(false),
})

interface QuickInquiryFormProps {
  isOpen: boolean
  onClose: () => void
}

export const QuickInquiryForm: React.FC<QuickInquiryFormProps> = ({ isOpen, onClose }) => {
  const [addInquiry, { isLoading: isAddingInquiry }] = useAddInquiryMutation()
  const currentAcademicSession = useAppSelector((state :any) => state.auth.currentActiveAcademicSession);
  const { data: classSeats, isLoading: isLoadingSeats, isError: isErrorSeats } = useGetClassSeatAvailabilityQuery()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      parent_name: "",
      parent_contact: "",
      parent_email: "",
      class_applying: "",
      dob: new Date().toISOString().split("T")[0],
      gender: "male",
      address: "",
      applying_for_quota: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Handle form submission
      const response = await addInquiry({
        academic_session_id: currentAcademicSession?.id || 1,
        student_name: values.student_name,
        dob: values.dob || new Date().toISOString().split("T")[0],
        gender: values.gender,
        class_applying: Number.parseInt(values.class_applying),
        parent_name: values.parent_name,
        parent_contact: values.parent_contact,
        address: values.address || "Address not provided",
        applying_for_quota: values.applying_for_quota,
        parent_email: values.parent_email,
      }).unwrap()

      form.reset()
      toast({
        title: "Inquiry added successfully",
        description: "The inquiry has been added to the system.",
      })
      onClose()
    } catch (error) {
      console.error("Error adding inquiry:", error)
      toast({
        variant: "destructive",
        title: "Error adding inquiry",
        description: "There was an error adding the inquiry. Please try again.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Inquiry Form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter parent name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class_applying"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Applying For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {classSeats?.map((seat) => (
                        <SelectItem key={seat.class_id} value={seat.class_id.toString()}>
                          Class {seat.class.class} {seat.class.division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isAddingInquiry}>
                {isAddingInquiry ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

