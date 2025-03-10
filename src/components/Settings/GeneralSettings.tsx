import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToastAction } from "@/components/ui/toast"
import { updateSchoolDetails, useGetSchoolQuery } from '@/services/SchoolServices'
import { useAppSelector } from '@/redux/hooks/useAppSelector'
import { selectCurrentUser } from '@/redux/slices/authSlice'
import { Label } from "@/components/ui/label"
import { Building2, Mail, Phone, MapPin, Crown, Loader } from 'lucide-react'
import { useAppDispatch } from '@/redux/hooks/useAppDispatch'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/redux/hooks/useTranslation'
// import { useToast } from "@/components/hooks/use-toast"


interface TypeForUpdateSchoolData {
  name?: string,
  contact_number?: number,
  subscription_type?: string,
  established_year?: string,
  school_type?: string,
  address?: string
}

const basicSchoolDataSchema = z.object({
  name: z.string().min(2, {
    message: "School name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "School short-key must be at least 3 characters.",
  }).trim(),
  established_year: z.string().regex(/^\d{4}$/, {
    message: "Please enter a valid year (YYYY).",
  }),
  school_type: z.string({
    required_error: "Please select a school type.",
  }),
})

const contactInformationSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().regex(/^\d{10}$/, {
    message: "Please enter a valid 10-digit phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
})

const subscriptionSchema = z.object({
  plan: z.enum(["free", "basic", "premium"], {
    required_error: "Please select a subscription plan.",
  }),
})


export default function GeneralSettings() {

  const [loading, setLoading] = useState({
    basicSchoolData: false,
    contactInformation: false,
    subscription: false,
  })

  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  /**
   * FIX : Already have school data inside user state , 
   * Need to think and fix this 
  */

  const { data, error, isLoading, isFetching, isSuccess, isError } = useGetSchoolQuery(user!.school_id);

  const basicSchoolDataForm = useForm<z.infer<typeof basicSchoolDataSchema>>({
    resolver: zodResolver(basicSchoolDataSchema),
    defaultValues: {
      name: "",
      username: "",
      established_year: "",
      school_type: " ",
    },
  })

  const contactInformationForm = useForm<z.infer<typeof contactInformationSchema>>({
    resolver: zodResolver(contactInformationSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
    },
  })

  const subscriptionForm = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: "free",
    },
  })

  const {t} = useTranslation()

  async function onSubmitBasicSchoolData(values: z.infer<typeof basicSchoolDataSchema>) {
    setLoading(prev => ({ ...prev, basicSchoolData: true }))

    // Simulate API call
    let payload: TypeForUpdateSchoolData = {}

    if (data?.name !== values.name.trim()) payload.name = values.name.trim()
    if (data?.school_type !== values.school_type.trim()) payload.school_type = values.school_type.trim()
    if (data?.established_year !== values.established_year.trim()) payload.established_year = values.established_year.trim()

    const updated_school = await dispatch(updateSchoolDetails({ id: user!.school_id, schoolData: payload })); 
    if(updated_school?.meta.requestStatus === "rejected"){
      toast({
        variant: "destructive",
        title: `Error :: ${updated_school.payload.message} ! `
      })
    }else{
      toast({
        variant: "default",
        title: "Basic School Details updated Succesfully ! ",
      })
    }
    setLoading(prev => ({ ...prev, basicSchoolData: false }))

  }

  async function onSubmitContactInformation(values: z.infer<typeof contactInformationSchema>) {
    setLoading(prev => ({ ...prev, contactInformation: true }))

    // Simulate API call
    let payload: TypeForUpdateSchoolData = {}

    if (data?.address !== values.address.trim()) payload.address = values.address.trim();
    if (data?.contact_number != parseInt(values.phone.trim())) payload.contact_number = parseInt(values.phone.trim());

    const updated_school = await dispatch(updateSchoolDetails({ id: user!.school_id, schoolData: payload }));
    setLoading(prev => ({ ...prev, contactInformation: false }))

  }


  /**
   * TODO :  Currrently not working 
   * 
   * @param values 
   */
  function onSubmitSubscription(values: z.infer<typeof subscriptionSchema>) {
    setLoading(prev => ({ ...prev, subscription: true }))
    // Simulate API call
    setTimeout(() => {
      setLoading(prev => ({ ...prev, subscription: false }))
      // toast({
      //   title: "Subscription updated",
      //   description: `Your subscription has been updated to the ${values.plan} plan.`,
      // })
      console.log(values)
    }, 1000)
  }


  /**
   * FIXME :: Fix this use regarding school_type , 
   * while fetching data from server , it is not setting the value of school_type
   * 
   */
  useEffect(() => {
    basicSchoolDataForm.reset({
      name: data?.name,
      username: data?.username,
      established_year: data?.established_year,
      school_type: data?.school_type == "Private" ? "Private" : data?.school_type == "Public" ? "Public" : "Charter"
    })
  }, [data])

  useEffect(() => {
    contactInformationForm.reset({
      email: data?.email,
      address: data?.address,
      phone: (data?.contact_number)?.toString()
    })
  }, [data])

  console.log("Check data " ,data)

  return (
    <>
      {isSuccess && (<div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("general_seetings")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
          {t("manage_your_school's_basic_information,_contact_details,_and_subscription")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <Building2 className="h-5 w-5" /> */}
              {t("basic_school_data")}
            </CardTitle>
            <CardDescription>
            {t("update_your_school's_fundamental_information")}
            </CardDescription>
          </CardHeader>
          <Form {...basicSchoolDataForm}>
            <form onSubmit={basicSchoolDataForm.handleSubmit(onSubmitBasicSchoolData)}>
              <CardContent className="space-y-4">
                <FormField
                  control={basicSchoolDataForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("school_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicSchoolDataForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("short_key/username")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter short-key/username for school" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicSchoolDataForm.control}
                  name="established_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("established_year")}</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicSchoolDataForm.control}
                  name="school_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("school_type")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="School type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=" " disabled>{t("select_type")}</SelectItem>
                          <SelectItem value="Public">{t("public")}</SelectItem>
                          <SelectItem value="Private">{t("private")}</SelectItem>
                          <SelectItem value="Charter">{t("charter")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading.basicSchoolData}>
                  {loading.basicSchoolData ? "Saving..." : "Save"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <Mail className="h-5 w-5" /> */}
              {t("contact_information")}
            </CardTitle>
            <CardDescription>
            {t("update_your_school's_contact_details")}
            </CardDescription>
          </CardHeader>
          <Form {...contactInformationForm}>
            <form onSubmit={contactInformationForm.handleSubmit(onSubmitContactInformation)}>
              <CardContent className="space-y-4">
                <FormField
                  control={contactInformationForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email_address")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="school@example.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactInformationForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phone_number")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number for school" type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactInformationForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("address")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter school address"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading.contactInformation}>
                  {loading.contactInformation ? "Saving..." : "Save"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <Crown className="h-5 w-5" /> */}
              {t("subcription_details")}
            </CardTitle>
            <CardDescription>
            {t("manage_your_school's_subscription_plan")}
            </CardDescription>
          </CardHeader>
          <Form {...subscriptionForm}>
            <form onSubmit={subscriptionForm.handleSubmit(onSubmitSubscription)}>
              <CardContent>
                <FormField
                  control={subscriptionForm.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subcription_plan")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">{t("free")}</SelectItem>
                          <SelectItem value="basic">{t("basic")}</SelectItem>
                          <SelectItem value="premium">{t("premium")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                      {t("choose_the_plan_that_best_fits_your_school's_needs")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading.subscription}>
                  {loading.subscription ? "Updating..." : "Update Subscription"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>)}
      {
        isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader className="h-10 w-10 animate-spin" />
          </div>
        )
      }
    </>
  )
}

