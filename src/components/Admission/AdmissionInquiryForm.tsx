"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { useAddInquiryMutation } from "@/services/InquiryServices"
import { useAppSelector } from "@/redux/hooks/useAppSelector"


const formSchema = z.object({
  student_name: z.string().min(2, { message: "Student name is required" }),
  dob: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  class_applying: z.string().min(1, { message: "Class is required" }),
  parent_name: z.string().min(2, { message: "Parent name is required" }),
  parent_contact: z.string().min(10, { message: "Valid contact number is required" }),
  parent_email: z.string().email({ message: "Valid email is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  previous_school: z.string().optional(),
  previous_class: z.string().optional(),
  previous_percentage: z.string().optional(),
  previous_year: z.string().optional(),
  special_achievements: z.string().optional(),
  applying_for_quota: z.string().min(1, { message: "Please select an option" }),
  quota_type: z.string().optional(),
})

export default function AdmissionInquiryForm() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [addInquiry, { isLoading }] = useAddInquiryMutation()
  const currentAcademicSession = useAppSelector((state :any) => state.auth.currentActiveAcademicSession);
 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      dob: "",
      gender: "",
      class_applying: "",
      parent_name: "",
      parent_contact: "",
      parent_email: "",
      address: "",
      previous_school: "",
      previous_class: "",
      previous_percentage: "",
      previous_year: "",
      special_achievements: "",
      applying_for_quota: "no",
      quota_type: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await addInquiry({
        academic_session_id: currentAcademicSession?.id || 1,
        student_name: values.student_name,
        dob: values.dob,
        gender: values.gender,
        class_applying: Number.parseInt(values.class_applying),
        parent_name: values.parent_name,
        parent_contact: values.parent_contact,
        address: values.address,
        applying_for_quota: values.applying_for_quota === "yes",
        parent_email: values.parent_email,
        previous_school: values.previous_school,
        previous_class: values.previous_class,
        previous_percentage: values.previous_percentage,
        previous_year: values.previous_year,
        special_achievements: values.special_achievements,
        quota_type: values.applying_for_quota === "yes" ? values.quota_type : undefined,
      })

      console.log(response)
      setSubmitted(true)
      toast({
        title: "Inquiry Submitted",
        description: "Your inquiry has been successfully submitted.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "There was an error submitting your inquiry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const nextStep = () => {
    if (step === 1) {
      form.trigger(["student_name", "dob", "gender", "class_applying"])
      if (
        form.getFieldState("student_name").invalid ||
        form.getFieldState("dob").invalid ||
        form.getFieldState("gender").invalid ||
        form.getFieldState("class_applying").invalid
      ) {
        return
      }
    } else if (step === 2) {
      form.trigger(["parent_name", "parent_contact", "parent_email", "address"])
      if (
        form.getFieldState("parent_name").invalid ||
        form.getFieldState("parent_contact").invalid ||
        form.getFieldState("parent_email").invalid ||
        form.getFieldState("address").invalid
      ) {
        return
      }
    }

    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)
  const handleClose = () => setSubmitted(true)
  if (submitted) {
    return (
      <div className="container mx-auto py-10 max-w-3xl mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Admission Inquiry Submitted</CardTitle>
            <CardDescription className="text-center">Thank you for submitting your admission inquiry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-green-600 mx-auto"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleClose}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Admission Inquiry Form</CardTitle>
          <CardDescription>Please fill out this form to submit an admission inquiry for your child</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Step {step} of 3:{" "}
                    {step === 1 ? "Student Information" : step === 2 ? "Parent Information" : "Previous Education"}
                  </h2>
                  <div className="flex space-x-1">
                    <div className={`h-2 w-10 rounded ${step >= 1 ? "bg-primary" : "bg-gray-200"}`}></div>
                    <div className={`h-2 w-10 rounded ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
                    <div className={`h-2 w-10 rounded ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="student_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Male</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Female</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">Other</Label>
                              </div>
                            </RadioGroup>
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
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                                <SelectItem key={cls} value={cls.toString()}>
                                  Class {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parent_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent/Guardian Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="parent_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residential Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="previous_school"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Previous School</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="previous_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Class Completed</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="previous_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentage/Grade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="previous_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="special_achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Achievements (Sports, Arts, etc.)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Please mention any special achievements or talents" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="applying_for_quota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Are you applying under any quota?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="quota-yes" />
                                <Label htmlFor="quota-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="quota-no" />
                                <Label htmlFor="quota-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("applying_for_quota") === "yes" && (
                      <FormField
                        control={form.control}
                        name="quota_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Quota</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select quota" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rte">RTE Quota</SelectItem>
                                <SelectItem value="staff">Staff Quota</SelectItem>
                                <SelectItem value="sports">Sports Quota</SelectItem>
                                <SelectItem value="management">Management Quota</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

