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
import { Loader2, AlertCircle } from "lucide-react"
import type { Concession } from "@/types/fees"
import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { concessionSchema } from "@/utils/fees.validation"


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
    defaultValues: {
      name: "",
      description: "",
      applicable_to: "plan",
      concessions_to: "plan",
      category: "other",
      is_active: true,
    },
  })

  // Watch applicable_to to show relevant information
  const applicableTo = form.watch("applicable_to")
  const concessionsTo = form.watch("concessions_to")

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        applicable_to: initialData.applicable_to as "plan" | "students",
        concessions_to: (initialData.concessions_to as "plan" | "fees_type") || "plan",
        category: initialData.category,
        is_active: initialData.status !== "Inactive",
      })
    }
  }, [initialData, form])

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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select where this concession applies" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="plan">Fee Plan (Apply to fee plans)</SelectItem>
                    <SelectItem value="students">Students (Apply to selected students)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Determines who this concession will be applied to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="concessions_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concession Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select concession type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="plan">Entire Plan (Apply to whole fee plan)</SelectItem>
                    <SelectItem value="fees_type">Fee Types (Apply to specific fee types)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Determines what this concession will be applied to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Informational alert based on selected options */}
        {applicableTo && concessionsTo && (
          <Alert variant="default" className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Concession Application</AlertTitle>
            <AlertDescription>
              {applicableTo === "plan" &&
                concessionsTo === "plan" &&
                "This concession will be applied to entire fee plans. The deduction will apply to the total plan amount."}
              {applicableTo === "plan" &&
                concessionsTo === "fees_type" &&
                "This concession will be applied to specific fee types within fee plans. You'll be able to select which fee types when applying the concession."}
              {applicableTo === "students" &&
                concessionsTo === "plan" &&
                "This concession will be applied to individual students' fee plans. The deduction will apply to the total plan amount for selected students."}
              {applicableTo === "students" &&
                concessionsTo === "fees_type" &&
                "This concession will be applied to specific fee types for individual students. You'll be able to select which fee types when applying the concession to a student."}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Categorize this concession for easier management</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

