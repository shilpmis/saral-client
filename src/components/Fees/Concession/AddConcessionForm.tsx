import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { concessionSchema } from "@/utils/fees.validation"
import { Concession } from "@/types/fees"

interface AddConcessionFormProps {
  initialData: Concession | null
  onSubmit: (data: z.infer<typeof concessionSchema>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export const AddConcessionForm: React.FC<AddConcessionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const form = useForm<z.infer<typeof concessionSchema>>({
    resolver: zodResolver(concessionSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          applicable_to: initialData.applicable_to as "plan" | "fees_types" ,
          category: initialData.category,
          is_active: initialData.status !== "Inactive",
        }
      : {
          name: "",
          description: "",
          applicable_to: "plan",
          category: "Other",
          is_active: true,
        },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concession Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter concession name" />
              </FormControl>
              <FormDescription>
                A descriptive name for the concession (e.g., "Sibling Discount", "Merit Scholarship")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter a detailed description of this concession"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormDescription>Explain the purpose and conditions of this concession</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="applicable_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicable To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select where this concession applies" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="plan">Fee Plan (Entire plan)</SelectItem>
                    <SelectItem value="students">Students (Apply to selected students)</SelectItem>
                    {/* <SelectItem value="fees_types">Fee Type (Specific fee types)</SelectItem> */}
                    {/* <SelectItem value="student">Student (Individual students)</SelectItem> */}
                  </SelectContent>
                </Select>
                <FormDescription>Determines how this concession will be applied</FormDescription>
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
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Categorize this concession for easier management</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : initialData ? (
              "Update Concession"
            ) : (
              "Create Concession"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

