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
import { mockClasses } from "@/mock/admissionMockData"

const formSchema = z.object({
  studentName: z.string().min(2, { message: "Student name is required" }),
  dob: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  classApplying: z.string().min(1, { message: "Class is required" }),
  parentName: z.string().min(2, { message: "Parent name is required" }),
  parentContact: z.string().min(10, { message: "Valid contact number is required" }),
  parentEmail: z.string().email({ message: "Valid email is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousPercentage: z.string().optional(),
  previousYear: z.string().optional(),
  specialAchievements: z.string().optional(),
  applyingForQuota: z.string().min(1, { message: "Please select an option" }),
  quotaType: z.string().optional(),
})

export default function AdmissionInquiryForm() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      dob: "",
      gender: "",
      classApplying: "",
      parentName: "",
      parentContact: "",
      parentEmail: "",
      address: "",
      previousSchool: "",
      previousClass: "",
      previousPercentage: "",
      previousYear: "",
      specialAchievements: "",
      applyingForQuota: "no",
      quotaType: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
    setSubmitted(true)
  }

  const nextStep = () => {
    if (step === 1) {
      form.trigger(["studentName", "dob", "gender", "classApplying"])
      if (
        form.getFieldState("studentName").invalid ||
        form.getFieldState("dob").invalid ||
        form.getFieldState("gender").invalid ||
        form.getFieldState("classApplying").invalid
      ) {
        return
      }
    } else if (step === 2) {
      form.trigger(["parentName", "parentContact", "parentEmail", "address"])
      if (
        form.getFieldState("parentName").invalid ||
        form.getFieldState("parentContact").invalid ||
        form.getFieldState("parentEmail").invalid ||
        form.getFieldState("address").invalid
      ) {
        return
      }
    }

    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  if (submitted) {
    return (
      <div className="container mx-auto py-10 max-w-3xl">
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
            <p>Your inquiry has been successfully submitted. Your inquiry reference number is:</p>
            <p className="text-2xl font-bold">INQ-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-sm text-muted-foreground">
              We will review your application and get back to you within 3-5 working days. You can check the status of
              your application using the reference number.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
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
                        name="studentName"
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
                      name="classApplying"
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
                              {mockClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
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
                        name="parentName"
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
                        name="parentContact"
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
                      name="parentEmail"
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
                        name="previousSchool"
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
                        name="previousClass"
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
                        name="previousPercentage"
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
                        name="previousYear"
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
                      name="specialAchievements"
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
                      name="applyingForQuota"
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

                    {form.watch("applyingForQuota") === "yes" && (
                      <FormField
                        control={form.control}
                        name="quotaType"
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
                  <Button type="submit" className="ml-auto">
                    Submit Inquiry
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

