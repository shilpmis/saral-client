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
import { useGetClassSeatAvailabilityQuery } from "@/services/QuotaService"
import { useTranslation } from "@/redux/hooks/useTranslation"

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, { message: "Last name is required" }),
  father_name: z.string().min(2, { message: "Parent name is required" }),
  primary_mobile: z.string().min(10, { message: "Valid contact number is required" }),
  parent_email: z.string().email({ message: "Valid email is required" }),
  class_applying: z.string().min(1, { message: "Class is required" }),
  birth_date: z.string().optional(),
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
  const currentAcademicSession = useAppSelector((state: any) => state.auth.currentActiveAcademicSession)
  const { data: classSeats, isLoading: isLoadingSeats, isError: isErrorSeats } = useGetClassSeatAvailabilityQuery()
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      father_name: "",
      primary_mobile: "",
      parent_email: "",
      class_applying: "",
      birth_date: new Date().toISOString().split("T")[0],
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
        first_name: values.first_name,
        middle_name: values.middle_name,
        last_name: values.last_name,
        birth_date: values.birth_date || new Date().toISOString().split("T")[0],
        gender: values.gender,
        class_applying: Number.parseInt(values.class_applying),
        father_name: values.father_name,
        primary_mobile: values.primary_mobile,
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
          <DialogTitle>{t("quick_inquiry_form")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("date_of_birth")}</FormLabel>
                  <FormControl>
                    <Input type="date" placeholder={t("enter_your_date_of_birth")} {...field} />
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
                    <Input placeholder={t("enter_contact_number")} {...field} />
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
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("enter_email")} {...field} />
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
                  <FormLabel>{t("class_applying_for")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_class")} />
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
                {isAddingInquiry ? "Submitting..." : t("submit_inquiry")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

