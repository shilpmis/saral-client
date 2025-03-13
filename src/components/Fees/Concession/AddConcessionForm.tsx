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
  "Tuition Fee",
  "Activity Fee",
  "Transport Fee",
  "Library Fee",
  "Technology Fee",
  "Sports Fee",
  "Examination Fee",
  "Development Fee",
]

export const AddConcessionForm: React.FC<AddConcessionFormProps> = ({ initialData, onSubmit, onCancel }) => {
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
              <FormLabel>Concession Name</FormLabel>
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
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
                <FormLabel>Discount Value</FormLabel>
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
                <FormLabel>Applicable Fee Types</FormLabel>
                <FormDescription>Select the fee types to which this concession applies</FormDescription>
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
                          <FormLabel className="font-normal">{feeType}</FormLabel>
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
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>Enable or disable this concession</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{initialData ? "Update Concession" : "Create Concession"}</Button>
        </div>
      </form>
    </Form>
  )
}

