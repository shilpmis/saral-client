"use client"

import type React from "react"
import { useRef } from "react"
import { useState, useCallback, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { type StaffFormData, staffSchema } from "@/utils/staff.validation"
import { useLazyGetSchoolStaffRoleQuery } from "@/services/StaffService"
import type { StaffRole, StaffType } from "@/types/staff"
import { useTranslation } from "@/redux/hooks/useTranslation"
import NumberInput from "@/components/ui/NumberInput"
import { selectAuthState } from "@/redux/slices/authSlice"
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { Loader2 } from "lucide-react"

interface StaffFormProps {
  // initial_data?: Partial<StaffFormData>
  initial_data?: StaffType | null
  onSubmit: (data: StaffFormData) => void
  onClose: () => void
  formType: "create" | "update" | "view"
  isApiInProgress: boolean
  onSuccess?: () => void // Add this line
}

const formatData = (value: any): string => {
  return value ? new Date(value).toISOString().split("T")[0] : " "
}

const StaffForm: React.FC<StaffFormProps> = ({
  onSubmit,
  initial_data,
  isApiInProgress,
  onClose,
  formType,
  onSuccess,
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const [getStaffRoles, { data: schoolStaff }] = useLazyGetSchoolStaffRoleQuery()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(formType === "update" ? "personal" : "role")
  const [teachingRoles, setTeachingRoles] = useState<StaffRole[] | null>(null)
  const [nonTeachingRoles, setNonTeachingRoles] = useState<StaffRole[] | null>(null)

  const authState = useAppSelector(selectAuthState)
  const StaffRolesForSchool = useAppSelector(selectSchoolStaffRoles)

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      is_teaching_role: true,
      staff_role_id: undefined,
      first_name: "",
      middle_name: null,
      last_name: "",
      first_name_in_guj: null,
      middle_name_in_guj: null,
      last_name_in_guj: null,
      gender: undefined,
      birth_date: null,
      aadhar_no: null,
      mobile_number: undefined,
      email: null,
      qualification: null,
      subject_specialization: null,
      religion: null,
      religion_in_guj: null,
      caste: null,
      caste_in_guj: null,
      category: null,
      address: null,
      district: null,
      city: null,
      state: null,
      postal_code: null,
      bank_name: null,
      account_no: null,
      IFSC_code: null,
      joining_date: null,
      employment_status: undefined,
    },
  })

  const tabMapping: { [key: string]: string } = {
    is_teaching_role: "role",
    staff_role_id: "role",
    first_name: "personal",
    middle_name: "personal",
    last_name: "personal",
    first_name_in_guj: "personal",
    middle_name_in_guj: "personal",
    last_name_in_guj: "personal",
    gender: "personal",
    birth_date: "personal",
    aadhar_no: "personal",
    mobile_number: "contact",
    email: "contact",
    qualification: "contact",
    subject_specialization: "contact",
    religion: "other",
    religion_in_guj: "other",
    caste: "other",
    caste_in_guj: "other",
    category: "other",
    address: "address",
    district: "address",
    city: "address",
    state: "address",
    postal_code: "address",
    bank_name: "bank",
    account_no: "bank",
    IFSC_code: "bank",
    class_id: "employment",
    joining_date: "employment",
    employment_status: "employment",
  }

  const handleSubmit: SubmitHandler<StaffFormData> = (data) => {
    onSubmit(data)
    // The parent component will handle the success callback after API call
  }

  const handleNextTab = useCallback(() => {
    if (activeTab === "role") setActiveTab("personal")
    else if (activeTab === "personal") setActiveTab("contact")
    else if (activeTab === "contact") setActiveTab("other")
    else if (activeTab === "other") setActiveTab("address")
    else if (activeTab === "address") setActiveTab("bank")
    else if (activeTab === "bank") setActiveTab("employment")
  }, [activeTab])

  const handlePreviousTab = useCallback(() => {
    if (activeTab === "personal") setActiveTab(formType === "update" ? "personal" : "role")
    else if (activeTab === "contact") setActiveTab("personal")
    else if (activeTab === "other") setActiveTab("contact")
    else if (activeTab === "address") setActiveTab("other")
    else if (activeTab === "bank") setActiveTab("address")
    else if (activeTab === "employment") setActiveTab("bank")
  }, [activeTab])

  useEffect(() => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      // console.log("firstErrorField", firstErrorField)
      const tabToActivate = tabMapping[firstErrorField]
      setActiveTab(tabToActivate)

      // Focus on the input field with the error
      setTimeout(() => {
        inputRefs.current[firstErrorField]?.focus()
      }, 0)
    }
  }, [form.formState.errors])

  useEffect(() => {
    if (!teachingRoles || !nonTeachingRoles) {
      getStaffRoles(authState.user!.school_id)
    }
  }, [])

  useEffect(() => {
    if (!StaffRolesForSchool) {
      getStaffRoles(authState.user!.school_id)
    }
  }, [StaffRolesForSchool])

  useEffect(() => {
    if (schoolStaff && StaffRolesForSchool) {
      setTeachingRoles(schoolStaff.filter((role: StaffRole) => role?.is_teaching_role))
      setNonTeachingRoles(schoolStaff?.filter((role: StaffRole) => !role?.is_teaching_role))
    }
  }, [schoolStaff, StaffRolesForSchool])

  useEffect(() => {
    console.log(formType, initial_data)
    if (formType === "update" && initial_data?.staff_role_id) {
      form.reset({
        is_teaching_role: Boolean(initial_data?.is_teching_staff),
        staff_role_id: initial_data?.staff_role_id,
        first_name: initial_data?.first_name,
        middle_name: initial_data?.middle_name ?? null,
        last_name: initial_data?.last_name,
        first_name_in_guj: initial_data?.first_name_in_guj ?? null,
        last_name_in_guj: initial_data?.last_name_in_guj ?? null,
        middle_name_in_guj: initial_data?.middle_name_in_guj ?? null,
        gender: initial_data?.gender,
        birth_date: initial_data?.birth_date ? formatData(initial_data.birth_date) : "",
        aadhar_no: initial_data?.aadhar_no,
        mobile_number: initial_data?.mobile_number,
        email: initial_data?.email,
        religion: initial_data?.religion,
        religion_in_guj: initial_data?.religion_in_guj,
        caste: initial_data?.caste,
        caste_in_guj: initial_data?.caste_in_guj,
        category: initial_data?.category,
        address: initial_data?.address,
        district: initial_data?.district,
        city: initial_data?.city,
        postal_code: initial_data?.postal_code ? initial_data?.postal_code.toString() : null,
        bank_name: initial_data?.bank_name,
        account_no: initial_data?.account_no,
        IFSC_code: initial_data?.IFSC_code,
        joining_date: initial_data?.birth_date ? formatData(initial_data.birth_date) : "",
        employment_status: initial_data?.employment_status,
        state: initial_data?.state,
        qualification: initial_data?.qualification ?? null,
        subject_specialization: initial_data?.subject_specialization ?? null,
      })
    }
  }, [formType])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {(formType === "view" || formType === "create") && <TabsTrigger value="role">{t("role")}</TabsTrigger>}
            <TabsTrigger value="personal">{t("personal")}</TabsTrigger>
            <TabsTrigger value="contact">{t("contact")}</TabsTrigger>
            <TabsTrigger value="other">{t("other")}</TabsTrigger>
            <TabsTrigger value="address">{t("address")}</TabsTrigger>
            <TabsTrigger value="bank">{t("bank")}</TabsTrigger>
            <TabsTrigger value="employment">{t("employee")}</TabsTrigger>
          </TabsList>

          {formType != "update" && (
            <TabsContent value="role">
              <Card>
                <CardHeader>
                  <CardTitle>{t("role_selection")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_teaching_role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("staff_type")}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "teaching")}
                            defaultValue={field.value ? "teaching" : "non-teaching"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="teaching" />
                              </FormControl>
                              <FormLabel className="font-normal">{t("teaching_staff")}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="non-teaching" />
                              </FormControl>
                              <FormLabel className="font-normal">{t("non_teaching_staff")}</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="staff_role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("staff_role")}</FormLabel>
                        {teachingRoles && nonTeachingRoles && (
                          <Select
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_staff_role")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("is_teaching_role")
                                ? teachingRoles &&
                                  teachingRoles.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id.toString()}>
                                      {staff.role}
                                    </SelectItem>
                                  ))
                                : nonTeachingRoles &&
                                  nonTeachingRoles.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id.toString()}>
                                      {staff.role}
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        )}
                        {(!teachingRoles || !nonTeachingRoles) && <div>Loading...</div>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={handleNextTab}>
                    {t("next")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>{t("personal_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("first_name")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
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
                          <Input {...field} value={field.value ?? ""} />
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
                        <FormLabel required>{t("last_name")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("first_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("middle_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("last_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("gender")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">{t("male")}</SelectItem>
                            <SelectItem value="Female">{t("female")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("date_of_birth")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("aadhar_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value ? String(field.value) : ""}
                            onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("mobile_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value !== undefined ? String(field.value) : ""}
                            onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          />
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
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch("is_teaching_role") && (
                  <>
                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>{t("qualification")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Qualification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="D.Ed">D.Ed</SelectItem>
                              <SelectItem value="B.Ed">B.Ed</SelectItem>
                              <SelectItem value="M.Ed">M.Ed</SelectItem>
                              <SelectItem value="B.A + B.Ed">B.A + B.Ed</SelectItem>
                              <SelectItem value="B.Sc + B.Ed">B.Sc + B.Ed</SelectItem>
                              <SelectItem value="M.A + B.Ed">M.A + B.Ed</SelectItem>
                              <SelectItem value="M.Sc + B.Ed"> M.Sc + B.Ed</SelectItem>
                              <SelectItem value="Ph.D">Ph.D</SelectItem>
                              <SelectItem value="Diploma">Diploma</SelectItem>
                              <SelectItem value="B.Com">B.Com</SelectItem>
                              <SelectItem value="BBA">BBA</SelectItem>
                              <SelectItem value="MBA">MBA</SelectItem>
                              <SelectItem value="M.Com">M.Com</SelectItem>
                              <SelectItem value="ITI">ITI</SelectItem>
                              <SelectItem value="SSC">SSC</SelectItem>
                              <SelectItem value="HSC">HSC</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject_specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("subject_specialization")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject specialization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Hindi">Hindi</SelectItem>
                              <SelectItem value="Gujarati">Gujarati</SelectItem>
                              <SelectItem value="Social Science">Social Science</SelectItem>
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Commerce">Commerce</SelectItem>
                              <SelectItem value="Economics">Economics</SelectItem>
                              <SelectItem value="Physical Education">Physical Education</SelectItem>
                              <SelectItem value="Arts">Arts</SelectItem>
                              <SelectItem value="Music">Music</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle>{t("other_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="religion_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="caste"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("caste")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caste_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("caste")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("category")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_category")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="OPEN">OPEN</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>{t("address_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("address")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("district")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("city")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("state")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("postal_code")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>{t("bank_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bank_name")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("account_number")}</FormLabel>
                      <FormControl>
                        <NumberInput
                          {...field}
                          value={field.value ? String(field.value) : undefined}
                          onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="IFSC_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ifsc_code")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle>{t("employee_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="joining_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("joining_date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("employee_status")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Permanent">{t("permanent")}</SelectItem>
                          <SelectItem value="Trial_Period">{t("trial_period")}</SelectItem>
                          <SelectItem value="Resigned">{t("resigned")}</SelectItem>
                          <SelectItem value="Contract_Based">{t("contract_base")}</SelectItem>
                          <SelectItem value="Notice_Period">{t("notice_period")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  {t("previous")}
                </Button>
                {/* <Button type="submit" disabled={isApiInProgress}>
                  {isApiInProgress ? <Loader2 className="animate-spin" />  : null}
                  {t("submit")}
                </Button> */}
                <Button type="submit" disabled={isApiInProgress}>
                  {isApiInProgress && <Loader2 className="animate-spin" />}
                  {formType === "create" ? t("Create") : "Update"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}

export default StaffForm
