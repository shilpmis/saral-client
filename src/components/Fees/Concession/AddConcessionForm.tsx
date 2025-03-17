"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/redux/hooks/useTranslation"

const concessionSchema = z.object({
  name: z.string().min(2, { message: "Concession name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
  applicableFeeTypes: z.array(z.string()).min(1, { message: "At least one fee type must be selected" }),
  isActive: z.boolean(),
})

interface Concession {
  id: string
  name: string
  category: string
  discountType: "percentage" | "fixed"
  discountValue: number
  applicableFeeTypes: string[]
  isActive: boolean
}

interface AddConcessionFormProps {
  initialData: Concession | null
  onSubmit: (data: Concession) => void
  onCancel: () => void
}

const feeTypes = [
  "tuition_fee",
  "activity_fee",
  "transport_fee",
  "library_fee",
  "technology_fee",
  "sports_fee",
  "examination_fee",
  "development_fee",
]

export const AddConcessionForm: React.FC<AddConcessionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const {t} = useTranslation()
  const form = useForm<z.infer<typeof concessionSchema>>({
    resolver: zodResolver(concessionSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          discountType: initialData.discountType,
          discountValue: initialData.discountValue,
          applicableFeeTypes: initialData.applicableFeeTypes,
          isActive: initialData.isActive,
        }
      : {
          name: "",
          category: "",
          discountType: "percentage",
          discountValue: 0,
          applicableFeeTypes: [],
          isActive: true,
        },
  })

  const handleSubmit = (values: z.infer<typeof concessionSchema>) => {
    onSubmit({
      id: initialData?.id || "0",
      ...values,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("concession_name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_category")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Family">{t("family")}</SelectItem>
                  <SelectItem value="Staff">{t("staff")}</SelectItem>
                  <SelectItem value="Academic">{t("academic")}</SelectItem>
                  <SelectItem value="Sports">{t("sports")}</SelectItem>
                  <SelectItem value="Financial">{t("financial")}</SelectItem>
                  <SelectItem value="Other">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("discount_type")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">{t("percentage")} (%)</SelectItem>
                    <SelectItem value="fixed">{t("fixed_amount")} (₹)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("discount_value")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number.parseFloat(e.target.value))} />
                </FormControl>
                <FormDescription>
                  {form.watch("discountType") === "percentage"
                    ? "Enter percentage value (0-100)"
                    : "Enter amount in rupees"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="applicableFeeTypes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>{t("applicable_fee_types")}</FormLabel>
                <FormDescription>{t("select_the_fee_types_to_which_this_concession_applies")}</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {feeTypes.map((feeType) => (
                  <FormField
                    key={feeType}
                    control={form.control}
                    name="applicableFeeTypes"
                    render={({ field }) => {
                      return (
                        <FormItem key={feeType} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(feeType)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, feeType])
                                  : field.onChange(field.value?.filter((value) => value !== feeType))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{t(feeType)}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("active_status")}</FormLabel>
                <FormDescription>{t("enable_or_disable_this_concession")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="submit">{initialData ? t("update_concession") : t("create_concession")}</Button>
        </div>
      </form>
    </Form>
  )
}

