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
import { StaffFormData, staffSchema } from "@/utils/staff.validation";
import { useGetSchoolStaffRoleQuery, useLazyGetOtherStaffQuery, useLazyGetSchoolStaffRoleQuery, useLazyGetTeachingStaffQuery } from "@/services/StaffService"
import { OtherStaff, StaffRole, TeachingStaff } from "@/types/staff"
import { useTranslation } from "@/redux/hooks/useTranslation";

interface StaffFormProps {
  // initialData?: Partial<StaffFormData>   
  initialData?: OtherStaff | TeachingStaff
  onSubmit: (data: StaffFormData) => void
  onClose: () => void
  formType: "create" | "update" | "view"
}

const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, initialData, onClose, formType }) => {

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [getSchoolStaff, { data: schoolStaff }] = useLazyGetSchoolStaffRoleQuery()

  const [activeTab, setActiveTab] = useState(formType === "update" ? "personal" : "role")
  const [teachingRoles, setTeachingRoles] = useState<StaffRole[] | null>(null)
  const [nonTeachingRoles, setNonTeachingRoles] = useState<StaffRole[] | null>(null)

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      is_teaching_role: true,
      staff_role_id: undefined,
      first_name: "",
      middle_name: "",
      last_name: "",
      first_name_in_guj: "",
      middle_name_in_guj: "",
      last_name_in_guj: "",
      gender: "Male",
      birth_date: "",
      aadhar_no: undefined,
      mobile_number: undefined,
      email: "",
      qualification: "",
      subject_specialization: "",
      religiion: "",
      religiion_in_guj: "",
      caste: "",
      caste_in_guj: "",
      category: undefined,
      address: "",
      district: "",
      city: "",
      state: "",
      postal_code: "",
      bank_name: "",
      account_no: undefined,
      IFSC_code: undefined,
      joining_date: "",
    }
  });


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
    religiion: "other",
    religiion_in_guj: "other",
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
  };


  const handleSubmit: SubmitHandler<StaffFormData> = (data) => {
    onSubmit(data)
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

  const {t} = useTranslation()
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      console.log("firstErrorField", firstErrorField)
      const tabToActivate = tabMapping[firstErrorField];
      setActiveTab(tabToActivate);

      // Focus on the input field with the error
      setTimeout(() => {
        inputRefs.current[firstErrorField]?.focus();
      }, 0);
    }
  }, [form.formState.errors]);

  useEffect(() => {
    if (initialData) {
      if (formType === 'update' && initialData?.staff_role_id) {
        form.setValue('is_teaching_role', initialData?.staff_role_id === 1)
        form.setValue('staff_role_id', initialData?.staff_role_id)
      } else {
        alert('Something went wrong');
      }
    }
  }, [initialData])

  useEffect(() => {
    if (!teachingRoles || !nonTeachingRoles) {
      getSchoolStaff(1)
    }
  }, [])

  useEffect(() => {
    if (schoolStaff) {
      setTeachingRoles(schoolStaff.filter((role: StaffRole) => role?.is_teaching_role))
      setNonTeachingRoles(schoolStaff?.filter((role: StaffRole) => !role?.is_teaching_role))
      // if(formType === 'update' && initialData?.staff_role_id){
      //   form.setValue('is_teaching_role', initialData?.staff_role_id === 1)
      //   form.setValue('staff_role_id', initialData?.staff_role_id)
      // }

    }
  }, [schoolStaff])

  useEffect(()=>{
    if(formType === 'update' && initialData?.staff_role_id){
      form.setValue('is_teaching_role', initialData?.staff_role_id === 1)
      form.setValue('staff_role_id', initialData?.staff_role_id)
    }
  },[formType])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {(formType === "view" || formType === "create") && <TabsTrigger value="role">Role</TabsTrigger>}
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
          </TabsList>

          {formType != 'update' && (
            <TabsContent value="role">
              <Card>
                <CardHeader>
                  <CardTitle>Role Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_teaching_role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Staff Type</FormLabel>
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
                              <FormLabel className="font-normal">Teaching Staff</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="non-teaching" />
                              </FormControl>
                              <FormLabel className="font-normal">Non-Teaching Staff</FormLabel>
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
                        <FormLabel>Staff Role</FormLabel>
                        {teachingRoles && nonTeachingRoles && (<Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch("is_teaching_role")
                              ? teachingRoles && teachingRoles.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id.toString()}>
                                  {staff.role}
                                </SelectItem>
                              ))
                              : nonTeachingRoles && nonTeachingRoles.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id.toString()}>
                                  {staff.role}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>)}
                        {(!teachingRoles || !nonTeachingRoles) && <div>Loading...</div>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={handleNextTab}>
                    Next
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
                        <FormLabel>{t("first_name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                        <FormLabel>{t("gender")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Input type="date" {...field} />
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
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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
                        <FormLabel>{t("mobile_no")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
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
                          <Input type="email" {...field} />
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
                          <FormLabel>{t("qualification")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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
                    name="religiion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="religiion_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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
                        <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input type="number" {...field} />
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
                        <Input {...field} />
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
                        <Input type="number"{...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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
                        <Input {...field} />
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
                {form.watch("is_teaching_role") && (
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("assigned_class")}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assigned class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Replace with actual class data */}
                            <SelectItem value="1">Class 1</SelectItem>
                            <SelectItem value="2">Class 2</SelectItem>
                            <SelectItem value="3">Class 3</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="joining_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("joining_date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>{t("employee_status")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Permanent">{t("permanent")}</SelectItem>
                          <SelectItem value="Trial_period">{t("trial_period")}</SelectItem>
                          <SelectItem value="Resigned">{t("resigned")}</SelectItem>
                          <SelectItem value="Contact_base">{t("contract_base")}</SelectItem>
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
                <Button type="submit">{t("submit")}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}

export default StaffForm

