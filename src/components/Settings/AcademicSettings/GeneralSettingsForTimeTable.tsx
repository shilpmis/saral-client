"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CardFooter } from "@/components/ui/card"
import { FileWarning, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useCreateTimeTableConfigMutation } from "@/services/timetableService"
import type { TimeTableConfigForSchool } from "@/types/subjects"

// Define the schema for timetable configuration
const timetableConfigSchema = z.object({
  academic_session_id: z.number(),
  max_periods_per_day: z.number().min(1, "Must have at least 1 period per day").max(12, "Maximum 12 periods per day"),
  default_period_duration: z
    .number()
    .min(30, "Period must be at least 30 minutes")
    .max(120, "Period cannot exceed 2 hours"),
  allowed_period_durations: z.array(z.number()).min(1, "At least one period duration is required"),
  lab_enabled: z.boolean(),
  pt_enabled: z.boolean(),
  period_gap_duration: z.number().nullable(),
  teacher_max_periods_per_day: z.number().nullable(),
  teacher_max_periods_per_week: z.number().nullable(),
  is_lab_included_in_max_periods: z.boolean(),
})

type GeneralSettingsProps = {
  isNew: boolean
  existingConfig: TimeTableConfigForSchool | null
  academicSession: any
  onConfigSaved: () => void
}

export default function GeneralSettingsForTimeTable({
  isNew,
  existingConfig,
  academicSession,
  onConfigSaved,
}: GeneralSettingsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [periodDuration, setPeriodDuration] = useState<string>("")

  // RTK Query hooks
  const [createTimeTableConfig, { isLoading: isCreating }] = useCreateTimeTableConfigMutation()
//   const [updateTimeTableConfig, { isLoading: isUpdating }] = useUpdateTimeTableConfigMutation()

  // Set up general settings form
  const form = useForm<z.infer<typeof timetableConfigSchema>>({
    resolver: zodResolver(timetableConfigSchema),
    defaultValues:
      isNew || !existingConfig
        ? {
            academic_session_id: academicSession?.id || 0,
            max_periods_per_day: 8,
            default_period_duration: 45,
            allowed_period_durations: [45],
            lab_enabled: false,
            pt_enabled: false,
            period_gap_duration: null,
            teacher_max_periods_per_day: null,
            teacher_max_periods_per_week: null,
            is_lab_included_in_max_periods: true,
          }
        : {
            academic_session_id: academicSession?.id || 0,
            max_periods_per_day: existingConfig.max_periods_per_day,
            default_period_duration: existingConfig.default_period_duration,
            allowed_period_durations: existingConfig.allowed_period_durations,
            lab_enabled: existingConfig.lab_enabled,
            pt_enabled: existingConfig.pt_enabled,
            period_gap_duration: existingConfig.period_gap_duration,
            teacher_max_periods_per_day: existingConfig.teacher_max_periods_per_day,
            teacher_max_periods_per_week: existingConfig.teacher_max_periods_per_week,
            is_lab_included_in_max_periods: existingConfig.is_lab_included_in_max_periods,
          },
  })

  // Handle general settings form submission
  const onSubmit = async (data: z.infer<typeof timetableConfigSchema>) => {
    try {
      if (!academicSession) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("no_active_academic_session"),
        })
        return
      }

      // Ensure academic_session_id is set
      data.academic_session_id = academicSession.id

      if (isNew) {
        // Create new configuration
        await createTimeTableConfig({
          payload: data,
        })

        toast({
          title: t("success"),
          description: t("timetable_configuration_created_successfully"),
        })
      } else {
        // Update existing configuration
        // await updateTimeTableConfig({
        //   id: existingConfig!.id,
        //   payload: data,
        // })

        toast({
          title: t("success"),
          description: t("timetable_configuration_updated_successfully"),
        })
      }

      // Refresh data
      onConfigSaved()

      // If labs are enabled, suggest going to lab tab
      if (data.lab_enabled) {
        toast({
          title: t("lab_configuration"),
          description: t("you_have_enabled_labs_consider_configuring_them_in_the_lab_settings_tab"),
        })
      }
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_save_general_settings"),
      })
    }
  }

  // Add a new allowed period duration
  const addPeriodDuration = () => {
    const duration = Number.parseInt(periodDuration)
    if (!duration || isNaN(duration) || duration < 30 || duration > 120) {
      toast({
        variant: "destructive",
        title: t("invalid_duration"),
        description: t("period_duration_must_be_between_30_and_120_minutes"),
      })
      return
    }

    const currentDurations = form.getValues("allowed_period_durations") || []
    if (currentDurations.includes(duration)) {
      toast({
        variant: "destructive",
        title: t("duplicate_duration"),
        description: t("this_duration_is_already_in_the_list"),
      })
      return
    }

    form.setValue("allowed_period_durations", [...currentDurations, duration])
    setPeriodDuration("")
  }

  // Remove an allowed period duration
  const removePeriodDuration = (duration: number) => {
    const currentDurations = form.getValues("allowed_period_durations") || []
    form.setValue(
      "allowed_period_durations",
      currentDurations.filter((d) => d !== duration),
    )
  }

  // If it's a new configuration, show a notice
  if (isNew) {
    return (
      <div className="space-y-6">
        <Alert className="mb-6">
          <FileWarning className="h-5 w-5" />
          <AlertTitle>{t("no_timetable_configuration_found")}</AlertTitle>
          <AlertDescription>
            {t("no_timetable_configuration_exists_for_this_academic_session_please_create_one")}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Form content */}
            <GeneralSettingsFormContent
              form={form}
              periodDuration={periodDuration}
              setPeriodDuration={setPeriodDuration}
              addPeriodDuration={addPeriodDuration}
              removePeriodDuration={removePeriodDuration}
              t={t}
            />

            <CardFooter className="px-0 pb-0 pt-6 flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t("create_timetable_configuration")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </div>
    )
  }

  // For existing configuration
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Form content */}
          <GeneralSettingsFormContent
            form={form}
            periodDuration={periodDuration}
            setPeriodDuration={setPeriodDuration}
            addPeriodDuration={addPeriodDuration}
            removePeriodDuration={removePeriodDuration}
            t={t}
          />

          <CardFooter className="px-0 pb-0 pt-6 flex justify-end">
            <Button type="submit" disabled={false}>
              {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {t("update_timetable_configuration")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </div>
  )
}

// Extracted form content component to avoid duplication
function GeneralSettingsFormContent({
  form,
  periodDuration,
  setPeriodDuration,
  addPeriodDuration,
  removePeriodDuration,
  t,
}: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="max_periods_per_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">{t("maximum_periods_per_day")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} required />
              </FormControl>
              <FormDescription>{t("the_maximum_number_of_periods_in_a_school_day")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period_gap_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("period_gap_duration_minutes")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  value={field.value === null ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>{t("duration_of_break_between_periods_in_minutes")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="pt_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("physical_training")}</FormLabel>
                <FormDescription>{t("enable_physical_training_in_timetable")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lab_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("lab_periods")}</FormLabel>
                <FormDescription>{t("enable_lab_periods_in_timetable")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {form.watch("lab_enabled") && (
        <FormField
          control={form.control}
          name="is_lab_included_in_max_periods"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("include_labs_in_max_periods")}</FormLabel>
                <FormDescription>{t("count_lab_periods_towards_maximum_periods_per_day")}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <Separator className="my-6" />

      <FormField
        control={form.control}
        name="default_period_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required">{t("default_period_duration_minutes")}</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} required />
            </FormControl>
            <FormDescription>{t("standard_duration_for_periods_in_minutes")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormLabel className="required">{t("allowed_period_durations")}</FormLabel>
        <FormDescription>{t("define_all_allowed_period_durations_for_the_timetable")}</FormDescription>

        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder={t("duration_in_minutes")}
            value={periodDuration}
            onChange={(e) => setPeriodDuration(e.target.value)}
            className="max-w-[200px]"
          />
          <Button type="button" onClick={addPeriodDuration} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("add")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {form.watch("allowed_period_durations")?.map((duration: number) => (
            <Badge key={duration} variant="secondary" className="px-3 py-1">
              {duration} {t("minutes")}
              <button
                type="button"
                className="ml-2 hover:text-destructive transition-colors"
                onClick={() => removePeriodDuration(duration)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {form.formState.errors.allowed_period_durations && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.allowed_period_durations.message as string}
          </p>
        )}
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <h3 className="text-lg font-medium">{t("teacher_workload_settings")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="teacher_max_periods_per_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maximum_periods_per_day_for_teachers")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("no_limit")}
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{t("leave_empty_for_no_limit")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacher_max_periods_per_week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maximum_periods_per_week_for_teachers")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("no_limit")}
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{t("leave_empty_for_no_limit")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  )
}
