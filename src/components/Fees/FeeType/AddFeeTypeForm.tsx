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
import { FeesType } from "@/types/fees"
import { feeTypeSchema } from "@/utils/fees.validation"
import { Loader2 } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"


interface AddFeeTypeFormProps {
  initialData: FeesType | null
  type : 'create' | 'edit'
  onSubmit: (data: z.infer<typeof feeTypeSchema>) => void
  onCancel: () => void,
  isLoading : boolean
}

export const AddFeeTypeForm: React.FC<AddFeeTypeFormProps> = ({
  initialData,
  type,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const form = useForm<z.infer<typeof feeTypeSchema>>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: type === 'edit' && initialData
      ? {
        name: initialData.name,
        description: initialData.description,
        status: initialData.status
        // is_concession_applicable: initialData.is_concession_applicable,
      }
      : {
        name: undefined,
        description: undefined,
        status: "Active",
        // is_concession_applicable: false,
      },
  })

  const handleSubmit = (values: z.infer<typeof feeTypeSchema>) => {
    onSubmit(values)
  }
  const {t} = useTranslation()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fee_type_name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("enter_the_description_for_this_fee_type.")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <FormField
            control={form.control}
            name="is_concession_applicable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Concession Applicable</FormLabel>
                  <FormDescription>Allow concessions on this fee type</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => { field.onChange(checked) }} />
                </FormControl>
              </FormItem>
            )}
          /> */}

          {/* <FormField
            control={form.control}
            name="is_concession_applicable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Concession Applicable</FormLabel>
                  <FormDescription>Allow concessions on this fee type</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("status")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_status")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">{t("active")}</SelectItem>
                    <SelectItem value="Inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>{t("set_the_status_of_this_fee_type.")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading} className="flex items-center justify-center space-x-2">
              {isLoading && <div className="ml-2"><Loader2 className="animate-spin" /></div>}
              {!isLoading && initialData ? t("update_fee_type") : t("create_fee_type")}
            </Button>
        </div>
      </form>
    </Form>
  )
}