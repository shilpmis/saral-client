import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StaffFormData, staffSchema } from "@/utils/staff.validation"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface StaffFormProps {
  initialData?: Partial<StaffFormData>
  onSubmit: (data: StaffFormData) => void
  onClose: () => void
  formType: "create" | "update" | "view"
}

const StaffForm : React.FC<StaffFormProps> = ({ onSubmit, initialData, onClose, formType }) => {
  const [activeTab, setActiveTab] = useState(formType === "update" ? "personal" : "role")
  const [teachingRoles, setTeachingRoles] = useState<{ id: number; name: string }[]>([])
  const [nonTeachingRoles, setNonTeachingRoles] = useState<{ id: number; name: string }[]>([])

  const form = useForm<StaffFormData>({
    // resolver: zodResolver(staffSchema),
    defaultValues: initialData || {
      is_teaching_role: true,
      employment_status: "Permanent",
    },
  })

  // Simulated API call to fetch roles
  useEffect(() => {
    // Replace this with actual API call
    setTeachingRoles([
      { id: 1, name: t("teacher") },
      { id: 2, name: t("principal")},
    ])
    setNonTeachingRoles([
      { id: 3, name: t("librarian") },
      { id: 4, name: t("administrative_staff") },
    ])
  }, [])

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

          {formType != 'update' && (
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
                      <FormLabel>{t("staff_role")}</FormLabel>
                      <Select
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
                            ? teachingRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))
                            : nonTeachingRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
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
                          <Input {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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
                          <Input {...field} />
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
                          <Input {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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
                        <Input {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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

