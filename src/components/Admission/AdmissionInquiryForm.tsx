"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { type Inquiry, useAddInquiryMutation, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { useGetClassSeatAvailabilityQuery } from "@/services/QuotaService"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useGetQuotasQuery } from "@/services/QuotaService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { Loader2, CheckCircle } from "lucide-react"
import NumberInput from "@/components/ui/NumberInput"
import { format } from "date-fns"
import { formSchema, type FormValues } from "./AdmissionFormSchema"

// Define the props for the component
interface AdmissionInquiryFormProps {
  isEditing?: boolean
  initialData?: Omit<Inquiry, "school_id" | "status" | "admin_notes" | "created_by" | "is_converted_to_student"> | null
  inquiryId?: number
  onSuccess?: () => void
  onCancel?: () => void
  academicSessionId: number | null
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

  // Create refs for form fields to focus on errors
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Map fields to steps for error navigation
  const stepMapping: { [key: string]: number } = {
    first_name: 1,
    middle_name: 1,
    last_name: 1,
    birth_date: 1,
    gender: 1,
    inquiry_for_class: 1,
    father_name: 2,
    primary_mobile: 2,
    parent_email: 2,
    address: 2,
    previous_school: 3,
    previous_class: 3,
    previous_percentage: 3,
    previous_year: 3,
    special_achievements: 3,
    applying_for_quota: 3,
    quota_type: 3,
  }

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          first_name: initialData.first_name,
          middle_name: initialData.middle_name || "",
          last_name: initialData.last_name,
          birth_date: initialData.birth_date ? new Date(initialData.birth_date) : undefined,
          gender: initialData.gender,
          inquiry_for_class: initialData.inquiry_for_class,
          father_name: initialData.father_name,
          primary_mobile: initialData.primary_mobile?.toString() || "",
          parent_email: initialData.parent_email,
          address: initialData.address,
          previous_school: initialData.previous_school || "",
          previous_class: initialData.previous_class || "",
          previous_percentage: Number(initialData.previous_percentage) || undefined,
          previous_year: initialData.previous_year ? new Date(initialData.previous_year) : undefined,
          special_achievements: initialData.special_achievements || "",
          applying_for_quota: Boolean(Number(initialData.applying_for_quota)),
          quota_type: initialData.quota_type,
          academic_session_id: initialData.academic_session_id,
        }
      : {
          first_name: "",
          middle_name: "",
          last_name: "",
          birth_date: undefined,
          gender: undefined,
          inquiry_for_class: undefined,
          father_name: "",
          primary_mobile: "",
          parent_email: null,
          address: "",
          previous_school: "",
          previous_class: "",
          previous_percentage: undefined,
          previous_year: undefined,
          special_achievements: "",
          applying_for_quota: false,
          quota_type: null,
          academic_session_id: CurrentacademicSessions!.id,
        },
    mode: "onChange",
  })

  // Update academic session when prop changes
  useEffect(() => {
    if (academicSessionId && !form.getValues("academic_session_id")) {
      form.setValue("academic_session_id", academicSessionId)
    }
  }, [academicSessionId, form])

  // Watch for quota selection to conditionally show quota type field
  const applyingForQuota = form.watch("applying_for_quota")

  // Get all form errors
  const formErrors = Object.keys(form.formState.errors)
  const hasErrors = formErrors.length > 0

  // Focus on first error field when errors occur
  useEffect(() => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const stepToActivate = stepMapping[firstErrorField]
      if (stepToActivate) {
        setStep(stepToActivate)
      }

      // Focus on the input field with the error
      setTimeout(() => {
        inputRefs.current[firstErrorField]?.focus()
      }, 0)
    }
  }, [form.formState.errors])

  const handleDateChange = (date: Date | undefined) => {
    form.setValue("birth_date", date ?? new Date())
  }
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && inquiryId) {
        // Update existing inquiry
        await updateInquiry({
          inquiry_id: inquiryId,
          payload: {
            first_name: values.first_name,
            middle_name: values.middle_name || "",
            last_name: values.last_name,
            birth_date: values.birth_date ? format(values.birth_date, "yyyy-MM-dd") : "",
            gender: values.gender,
            inquiry_for_class: values.inquiry_for_class,
            father_name: values.father_name,
            primary_mobile: Number(values.primary_mobile),
            parent_email: values.parent_email ?? null,
            address: values.address,
            previous_school: values.previous_school || "",
            previous_class: values.previous_class || "",
            previous_percentage: values.previous_percentage?.toString() || null,
            previous_year: values.previous_year ? format(values.previous_year, "yyyy-MM-dd") : null,
            special_achievements: values.special_achievements || "",
            applying_for_quota: values.applying_for_quota,
            quota_type: values.applying_for_quota ? (values.quota_type ? values.quota_type : null) : null,
          },
        }).unwrap()

        toast({
          variant: "default",
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
          birth_date: values.birth_date ? format(values.birth_date, "yyyy-MM-dd") : "",
          gender: values.gender,
          inquiry_for_class: values.inquiry_for_class,
          father_name: values.father_name,
          primary_mobile: Number(values.primary_mobile),
          parent_email: values.parent_email ?? null,
          address: values.address,
          previous_school: values.previous_school || null,
          previous_class: values.previous_class || null,
          previous_percentage: values.previous_percentage ? values.previous_percentage?.toString() : null,
          previous_year: values.previous_year ? format(values.previous_year, "yyyy-MM-dd") : null,
          special_achievements: values.special_achievements || null,
          applying_for_quota: values.applying_for_quota,
          quota_type: values.applying_for_quota ? (values.quota_type ? values.quota_type : null) : null,
          status: "Pending",
          admin_notes: null,
        }).unwrap()

        setSubmitted(true)
        toast({
          variant: "default",
          title: "Success",
          description: "Inquiry submitted successfully",
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error("Error submitting inquiry:", error)

      // Check if there are validation errors from the API
      if (error?.data?.errors?.code === "E_VALIDATION_ERROR") {
        error.data.errors.messages.forEach((msg: any) => {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: msg.message,
          })
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit inquiry. Please try again.",
        })
      }
    }
  }

  // Navigation between form steps
  const nextStep = () => {
    let fieldsToValidate: (keyof FormValues)[] = []

    if (step === 1) {
      fieldsToValidate = ["first_name", "last_name", "birth_date", "gender", "inquiry_for_class"]
    } else if (step === 2) {
      fieldsToValidate = ["father_name", "primary_mobile", "address"]
    }

    form.trigger(fieldsToValidate as (keyof FormValues)[]).then((isValid) => {
      if (isValid) {
        setStep(step + 1)
      } else {
        // Focus on the first field with an error
        const errors = form.formState.errors
        if (Object.keys(errors).length > 0) {
          const firstErrorField = Object.keys(errors)[0]
          setTimeout(() => {
            inputRefs.current[firstErrorField]?.focus()
          }, 0)
        }
      }
    })
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
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("admission_inquiry_submitted")}</CardTitle>
            <CardDescription className="text-center">
              {t("thank_you_for_submitting_your_admission_inquiry")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button onClick={handleClose}>{t("back_to_home")}</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render step indicators
  const renderStepIndicators = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <h2 className="text-lg font-medium">
        Step {step} of 3:{" "}
        {step === 1 ? t("student_information") : step === 2 ? t("parent_information") : t("previous_education")}
      </h2>
      <div className="flex space-x-2">
        <div className={`h-2 w-12 rounded-full ${step >= 1 ? "bg-primary" : "bg-gray-200"}`}></div>
        <div className={`h-2 w-12 rounded-full ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
        <div className={`h-2 w-12 rounded-full ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
    </div>
  )
  // Render navigation buttons
  const renderNavigationButtons = () => (
    <div className="flex justify-between mt-6">
      {step > 1 && (
        <Button type="button" variant="outline" onClick={prevStep}>
          {t("previous")}
        </Button>
      )}
      {step < 3 ? (
        <Button type="button" onClick={nextStep} className={step > 1 ? "" : "ml-auto"}>
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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("submitting...")}
              </>
            ) : isEditing ? (
              t("update_inquiry")
            ) : (
              t("submit_inquiry")
            )}
          </Button>
        </div>
      )}
    </div>
  )

  // Render Step 1: Student Information
  const renderStep1 = () => (
    <>
      {/* Academic Session Selection */}
      <FormField
        control={form.control}
        name="academic_session_id"
        disabled
        render={({ field }) => (
          <FormItem className="w-full">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t("first_name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_first_name")}
                  {...field}
                  ref={(el) => {
                    inputRefs.current.first_name = el
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{(field.value || "").length}/30</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="middle_name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("middle_name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_middle_name")}
                  {...field}
                  ref={(el) => {
                    inputRefs.current.middle_name = el
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{(field.value || "").length}/30</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t("last_name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_last_name")}
                  {...field}
                  ref={(el) => {
                    inputRefs.current.last_name = el
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{field.value.length}/30</span>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Date of Birth */}
      <FormField
        control={form.control}
        name="birth_date"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>
              {t("date_of_birth")} <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  field.onChange(date);
                  // Ensure the form knows the field was touched
                  form.setValue("birth_date", date ?? new Date(), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
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
          <FormItem className="w-full">
            <FormLabel>
              {t("gender")} <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">{t("male")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">{t("female")}</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Class Applying For */}
      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
        {`Only shows the classes which have seat allocation for  
           ${academicSessionId ? academicSessions?.find((session) => session.id == academicSessionId)?.session_name : t("please_select_an_academic_year")}
           academic session and are open for admissions by admin.`}
      </div>
      <FormField
        control={form.control}
        name="inquiry_for_class"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>
              {t("inquiry_for_class")} <span className="text-destructive">*</span>
            </FormLabel>
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
    </>
  )

  // Render Step 2: Parent Information
  const renderStep2 = () => (
    <>
      {/* Parent Name and Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormField
          control={form.control}
          name="father_name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t("parent_name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_parent_name")}
                  {...field}
                  ref={(el) => {
                    inputRefs.current.father_name = el
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{field.value.length}/30</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primary_mobile"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t("contact_number")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_contact_number")}
                  {...field}
                  onChange={(e) => {
                    // Only allow numeric input
                    const value = e.target.value.replace(/\D/g, "")
                    field.onChange(value)
                  }}
                  maxLength={10}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{field.value.length}/10</span>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Email */}
      <FormField
        control={form.control}
        name="parent_email"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>{t("email_address")}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={t("enter_email_address")}
                value={field.value ? field.value : ""}
                onChange={(e) => field.onChange(e.target.value)}
                ref={(el) => {
                  inputRefs.current.parent_email = el
                }}
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
          <FormItem className="w-full">
            <FormLabel>
              {t("residential_address")} <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea placeholder={t("enter_address")} {...field} className="min-h-[100px]" />
            </FormControl>
            <div className="flex justify-between items-start h-5">
              <FormMessage className="text-xs" />
              <span className="text-xs text-muted-foreground">{field.value.length}/100</span>
            </div>
          </FormItem>
        )}
      />
    </>
  )

  // Render Step 3: Previous Education
  const renderStep3 = () => (
    <>
      {/* Previous School */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormField
          control={form.control}
          name="previous_school"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("previous_school")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_previous_school")}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || "")}
                />
              </FormControl>
              <div className="flex justify-between items-start h-5">
                <FormMessage className="text-xs" />
                <span className="text-xs text-muted-foreground">{(field.value || "").length}/100</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="previous_class"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("last_class_completed")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_last_class")}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Previous Percentage and Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormField
          control={form.control}
          name="previous_percentage"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("percentage/_grade")}</FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  value={field.value ? String(field.value) : ""}
                  onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  min={0}
                  max={100}
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
            <FormItem className="w-full">
              <FormLabel>{t("year")}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                    // Ensure the form knows the field was touched
                    form.setValue("previous_year", date, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
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
          <FormItem className="w-full">
            <FormLabel>{t("special_achievements")} (Sports, Arts, etc.)</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("please_mention_any_special_achievements_or_talents")}
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value || "")}
                className="min-h-[100px]"
              />
            </FormControl>
            <div className="flex justify-between items-start h-5">
              <FormMessage className="text-xs" />
              <span className="text-xs text-muted-foreground">{(field.value || "").length}/500</span>
            </div>
          </FormItem>
        )}
      />

      {/* Quota Application */}
      <FormField
        control={form.control}
        name="applying_for_quota"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full">
            <div className="space-y-1 leading-none">
              <FormLabel>{t("are_you_applying_under_any_quota?")}</FormLabel>
            </div>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "yes")}
                defaultValue={field.value ? "yes" : "no"}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="quota-yes" />
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
            <FormItem className="w-full">
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
    </>
  )

  return (
    <div className="w-full">
      <Card
        className={`${isEditing ? "border-0 shadow-none" : ""} mx-auto max-h-[600px}`}
        style={{ width: "45rem", padding: "1rem" }}
      >
        <CardContent className="p-4 w-full h-full flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full flex flex-col">
              {renderStepIndicators()}
              <div className="w-full flex-grow overflow-y-auto space-y-4 pr-1">
                {step === 1 && <div className="w-full">{renderStep1()}</div>}
                {step === 2 && <div className="w-full">{renderStep2()}</div>}
                {step === 3 && <div className="w-full">{renderStep3()}</div>}
              </div>

              <div className="mt-4">{renderNavigationButtons()}</div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
