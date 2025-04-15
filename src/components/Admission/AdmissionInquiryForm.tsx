import { useEffect, useState } from "react"
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
import { Inquiry, useAddInquiryMutation, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { useGetClassSeatAvailabilityQuery } from "@/services/QuotaService"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useGetQuotasQuery } from "@/services/QuotaService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import NumberInput from "../ui/NumberInput"

// Define the form schema with Zod
const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, { message: "Last name is required" }),
  birth_date: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required",
  }),
  inquiry_for_class: z.coerce.number({
    required_error: "Class is required",
    invalid_type_error: "Class must be a number",
  }),
  father_name: z.string().min(2, { message: "Parent name is required" }),
  primary_mobile: z.coerce
    .number({
      required_error: "Contact number is required",
      invalid_type_error: "Contact number must be a number",
    })
    .refine((val) => val.toString().length >= 10, { message: "Contact number must be at least 10 digits" }),
  parent_email: z.string().email({ message: "Valid email is required" }).nullable(),
  address: z.string().min(5, { message: "Address is required" }),
  previous_school: z.string().optional(),
  previous_class: z.string().optional(),
  previous_percentage: z.coerce
    .number()
    .min(0, { message: "Percentage cannot be less than 0" })
    .max(100, { message: "Percentage cannot exceed 100" })
    .optional(),
  previous_year: z.string().optional(),
  special_achievements: z.string().optional(),
  applying_for_quota: z.boolean().default(false),
  quota_type: z.number().nullable().optional(),
  academic_session_id: z.number({
    required_error: "Academic session is required",
  }),
})

// Define the props for the component
interface AdmissionInquiryFormProps {
  isEditing?: boolean
  initialData?: Omit<Inquiry , 'school_id' | 'status' | 'admin_notes' | 'created_by' | 'is_converted_to_student'> | null
  inquiryId?: number
  onSuccess?: () => void
  onCancel?: () => void
  academicSessionId : number | null
}

export default function AdmissionInquiryForm({
  isEditing = false,
  initialData,
  inquiryId,
  onSuccess,
  onCancel,
  academicSessionId,
}: AdmissionInquiryFormProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  // Get all academic sessions
  const academicSessions = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentacademicSessions = useAppSelector(selectActiveAccademicSessionsForSchool)

  // API hooks
  const [addInquiry, { isLoading: isAddLoading }] = useAddInquiryMutation()
  const [updateInquiry, { isLoading: isUpdateLoading }] = useUpdateInquiryMutation()

  // Fetch available classes
  const { data: classSeats, isLoading: isLoadingSeats } = useGetClassSeatAvailabilityQuery()

  // Fetch available quotas
  const { data: quotas, isLoading: isLoadingQuotas } = useGetQuotasQuery({
    academic_session_id: CurrentacademicSessions!.id,
  })

  const isLoading = isAddLoading || isUpdateLoading

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?
    {
      first_name: initialData.first_name,
      middle_name: initialData.middle_name || "",
      last_name: initialData.last_name,
      birth_date: initialData.birth_date,
      gender: initialData.gender,
      inquiry_for_class: initialData.inquiry_for_class,
      father_name: initialData.father_name,
      primary_mobile: initialData.primary_mobile,
      parent_email: initialData.parent_email,
      address: initialData.address,
      previous_school: initialData.previous_school || "",
      previous_class: initialData.previous_class || "",
      previous_percentage: Number(initialData.previous_percentage) || undefined,
      previous_year: initialData.previous_year || "",
      special_achievements: initialData.special_achievements || "",
      applying_for_quota: Boolean(Number(initialData.applying_for_quota)),
      quota_type: initialData.quota_type,
      academic_session_id: initialData.academic_session_id ,
    }
    :
    {
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender: undefined,
      inquiry_for_class: undefined,
      father_name: "",
      primary_mobile: undefined,
      parent_email: null,
      address: "",
      previous_school: "",
      previous_class: "",
      previous_percentage: undefined,
      previous_year: "",
      special_achievements: "",
      applying_for_quota: false,
      quota_type: null,
      academic_session_id: CurrentacademicSessions!.id,
    }
  })

  // Update academic session when prop changes
  useEffect(() => {
    if (academicSessionId && !form.getValues("academic_session_id")) {
      form.setValue("academic_session_id", academicSessionId)
    }
  }, [academicSessionId, form])

  // Watch for quota selection to conditionally show quota type field
  const applyingForQuota = form.watch("applying_for_quota")

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && inquiryId) {
        // Update existing inquiry
        await updateInquiry({
          inquiry_id: inquiryId,
          payload : {
            first_name: values.first_name,
            middle_name: values.middle_name || "",
            last_name: values.last_name,
            birth_date: values.birth_date,
            gender: values.gender,
            inquiry_for_class: values.inquiry_for_class,
            father_name: values.father_name,
            primary_mobile: values.primary_mobile,
            parent_email: values.parent_email,
            address: values.address,
            previous_school: values.previous_school || "",
            previous_class: values.previous_class || "",
            previous_percentage: values.previous_percentage?.toString() || null,
            previous_year: values.previous_year || "",
            special_achievements: values.special_achievements || "",
            applying_for_quota: values.applying_for_quota,
            quota_type: values.applying_for_quota ? values.quota_type ? values.quota_type : null : null,
          }
        }).unwrap()

        toast({
          title: "Success",
          description: "Inquiry updated successfully",
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Add new inquiry
        await addInquiry({
          academic_session_id: values.academic_session_id,
          first_name: values.first_name,
          middle_name: values.middle_name || "",
          last_name: values.last_name,
          birth_date: values.birth_date,
          gender: values.gender,
          inquiry_for_class: values.inquiry_for_class,
          father_name: values.father_name,
          primary_mobile: values.primary_mobile,
          parent_email: values.parent_email,
          address: values.address,
          previous_school: values.previous_school || null,
          previous_class: values.previous_class || null,
          previous_percentage: values.previous_percentage ? values.previous_percentage?.toString() : null,
          previous_year: values.previous_year || null,
          special_achievements: values.special_achievements || null,
          applying_for_quota: values.applying_for_quota,
          quota_type: values.applying_for_quota ? values.quota_type ? values.quota_type : null : null,
          // quota_type: values.quota_type ? values.quota_type : null,
          status: "Pending",
          admin_notes: null,
        }).unwrap()

        setSubmitted(true)
        toast({
          title: "Success",
          description: "Inquiry submitted successfully",
        })
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
      })
    }
  }

  // Navigation between form steps
  const nextStep = () => {
    if (step === 1) {
      form.trigger(["first_name", "last_name", "birth_date", "gender", "inquiry_for_class"])
      if (
        form.getFieldState("first_name").invalid ||
        form.getFieldState("last_name").invalid ||
        form.getFieldState("birth_date").invalid ||
        form.getFieldState("gender").invalid ||
        form.getFieldState("inquiry_for_class").invalid
      ) {
        return
      }
    } else if (step === 2) {
      form.trigger(["father_name", "primary_mobile", "parent_email", "address"])
      if (
        form.getFieldState("father_name").invalid ||
        form.getFieldState("primary_mobile").invalid ||
        form.getFieldState("parent_email").invalid ||
        form.getFieldState("address").invalid
      ) {
        return
      }
    }

    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const handleClose = () => {
    if (onCancel) {
      onCancel()
    } else {
      setSubmitted(true)
    }
  }


  // Show success message after submission
  if (submitted && !isEditing) {
    return (
      <div className="mx-auto max-w-3xl mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("admission_inquiry_submitted")}</CardTitle>
            <CardDescription className="text-center">
              {t("thank_you_for_submitting_your_admission_inquiry")}
            </CardDescription>
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
            <Button onClick={handleClose}>{t("back_to_home")}</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={`mx-auto max-w-3xl`}>
      <Card className={isEditing ? "border-0 shadow-none" : ""}>
        {/* {!isEditing && (
          <CardHeader>
            <CardTitle>{t("admission_inquiry_form")}</CardTitle>
            <CardDescription>
              {t("please_fill_out_this_form_to_submit_an_admission_inquiry_for_your_child")}
            </CardDescription>
          </CardHeader>
        )} */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Step {step} of 3:{" "}
                    {step === 1
                      ? t("student_information")
                      : step === 2
                        ? t("parent_information")
                        : t("previous_education")}
                  </h2>
                  <div className="flex space-x-1">
                    <div className={`h-2 w-10 rounded ${step >= 1 ? "bg-primary" : "bg-gray-200"}`}></div>
                    <div className={`h-2 w-10 rounded ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
                    <div className={`h-2 w-10 rounded ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
                  </div>
                </div>

                {/* Step 1: Student Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    {/* Academic Session Selection */}
                    <FormField
                      control={form.control}
                      name="academic_session_id"
                      disabled
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("academic_session")}</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            defaultValue={field.value?.toString()}
                            disabled={true}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_academic_session")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicSessions?.map((session) => (
                                <SelectItem key={session.id} value={session.id.toString()}>
                                  {session.session_name} {session.is_active && `(${t("current")})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Student Name Fields */}
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("first_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_first_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="middle_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("middle_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_middle_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("last_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_last_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("date_of_birth")}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("gender")}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">{t("male")}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">{t("female")}</Label>
                              </div>
                              {/* <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">{t("other")}</Label>
                              </div> */}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Class Applying For */}
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {t("only_shows_the_classes_which_has_seat_allocation_for")}  
                         ${academicSessionId ? academicSessions?.find((session)=> session.id == academicSessionId)?.session_name : t("please_select_an_academic_year")}
                         {t("academic_session_and_are_open_for_admissions_by_admin.")}
                    </div>
                    <FormField
                      control={form.control}
                      name="inquiry_for_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("inquiry_for_class")}</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_class")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingSeats ? (
                                <SelectItem value="loading" disabled>
                                  {t("loading...")}
                                </SelectItem>
                              ) : classSeats && classSeats.length > 0 ? (
                                classSeats.map((seat) => (
                                  <SelectItem key={seat.class_id} value={seat.class_id.toString()}>
                                    Class {seat.class.class} {seat.class.division}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  {t("no_classes_available")}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Parent Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    {/* Parent Name and Contact */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="father_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("parent_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_parent_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primary_mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact_number")}</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder={t("enter_contact_number")}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "")
                                  field.onChange(value === "" ? undefined : Number(value))
                                }}
                                value={field.value === undefined ? "" : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="parent_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email_address")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t("enter_email_address")}
                              value={field.value ? field.value : ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("residential_address")}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t("enter_address")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Previous Education */}
                {step === 3 && (
                  <div className="space-y-4">
                    {/* Previous School */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="previous_school"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("previous_school")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_previous_school")} {...field} />
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
                            <FormLabel>{t("last_class_completed")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_last_class")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Previous Percentage and Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="previous_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("percentage/_grade")}</FormLabel>
                            <FormControl>
                              <NumberInput
                                placeholder={t("enter_percentage")}
                                value={field.value ? String(field.value) :  ""}
                                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                                // max={100} // Ensure the value does not exceed 100
                              />
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
                            <FormLabel>{t("year")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("enter_year")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Special Achievements */}
                    <FormField
                      control={form.control}
                      name="special_achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("special_achievements")} (Sports, Arts, etc.)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("please_mention_any_special_achievements_or_talents")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quota Application */}
                    <FormField
                      control={form.control}
                      name="applying_for_quota"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t("are_you_applying_under_any_quota?")}</FormLabel>
                          </div>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "yes")}
                              defaultValue={field.value ? "yes" : "no"}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={"yes"} id="quota-yes" />
                                <Label htmlFor="quota-yes">{t("yes")}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="quota-no" />
                                <Label htmlFor="quota-no">{t("no")}</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Quota Type - Conditional */}
                    {applyingForQuota && (
                      <FormField
                        control={form.control}
                        name="quota_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("select_quota")}</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(Number.parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("select_quota_type")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingQuotas ? (
                                  <SelectItem value="loading" disabled>
                                    {t("loading...")}
                                  </SelectItem>
                                ) : quotas && quotas.length > 0 ? (
                                  quotas.map((quota) => (
                                    <SelectItem key={quota.id} value={quota.id.toString()}>
                                      {quota.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    {t("no_quotas_available")}
                                  </SelectItem>
                                )}
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

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    {t("previous")}
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    {t("next")}
                  </Button>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={onCancel}>
                        {t("cancel")}
                      </Button>
                    )}
                    <Button type="submit" disabled={isLoading || !form.getValues("academic_session_id")}>
                      {isLoading ? t("submitting...") : isEditing ? t("update_inquiry") : t("submit_inquiry")}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

