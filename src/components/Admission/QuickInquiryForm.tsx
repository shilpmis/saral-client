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

const formSchema = z.object({
  student_name: z.string().min(2, { message: "Student name is required" }),
  parent_name: z.string().min(2, { message: "Parent name is required" }),
  contact_number: z.string().min(10, { message: "Valid contact number is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  grade_applying: z.string().min(1, { message: "Grade is required" }),
})

interface QuickInquiryFormProps {
  isOpen: boolean
  onClose: () => void
}

export const QuickInquiryForm: React.FC<QuickInquiryFormProps> = ({ isOpen, onClose }) => {
  const [addInquiries, { isLoading: isAddingInquiry }] = useAddInquiryMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      parent_name: "",
      contact_number: "",
      email: "",
      grade_applying: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission
    const res = await addInquiries({
      payload: {
        contact_number: Number(values.contact_number),
        email: values.email,
        grade_applying: Number(values.grade_applying),
        parent_name: values.parent_name,
        student_name: values.student_name,
      },
    })

    if (res.data) {
      form.reset()
      toast({
        variant: "default",
        title: "Inquiry added successfully",
        description: "Inquiry added successfully",
      })
      onClose()
    }

    if (res.error) {
      console.log("Check this error", res.error)
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
              name="contact_number"
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
              name="email"
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
              name="grade_applying"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Applying For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Std {grade}
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

