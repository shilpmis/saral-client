import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Edit, Info, Loader2, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import type { TimeTableConfigForSchool, ClassDayConfigForTimeTable } from "@/types/subjects"
import { useCreateDayWiseTimeTableConfigfForClassMutation } from "@/services/timetableService"

type ClassDaySettingsProps = {
  existingConfig: TimeTableConfigForSchool | null
  academicSession: any
  onConfigSaved: () => void
}

// Define the schema for class day configuration
const createClassDayConfigSchema = (totalBreaks: number | null) => {
  return z.object({
    class_id: z.number({
      required_error: "Class is required",
    }),
    day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat"], {
      required_error: "Day is required",
    }),
    allowed_durations: z.array(z.string()).min(1, "At least one duration is required"),
    max_consecutive_periods: z.number().nullable(),
    total_breaks: z.number().nullable(),
    break_durations: z.array(z.number()).length(totalBreaks || 0, `Exactly ${totalBreaks} break duration(s) required`),
    day_start_time: z.string().min(1, "Start time is required"),
    day_end_time: z.string().min(1, "End time is required"),
  })
}

export default function ClassDaySettingsForTimeTable({
  existingConfig,
  academicSession,
  onConfigSaved,
}: ClassDaySettingsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const academicClasses = useAppSelector(selectAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("mon")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentConfigId, setCurrentConfigId] = useState<number | null>(null)
  const [totalBreaks, setTotalBreaks] = useState<number | null>(null)

  // Create form with dynamic schema based on totalBreaks
  const form = useForm<z.infer<ReturnType<typeof createClassDayConfigSchema>>>({
    resolver: zodResolver(createClassDayConfigSchema(totalBreaks)),
    defaultValues: {
      class_id: 0,
      day: "mon",
      allowed_durations: [],
      max_consecutive_periods: null,
      total_breaks: null,
      break_durations: [],
      day_start_time: "08:00",
      day_end_time: "15:00",
    },
  })

  const [createDayWiseTimeTableConfigfForClass] = useCreateDayWiseTimeTableConfigfForClassMutation() 

  // Load academic classes if not already loaded
  useEffect(() => {
    if (!academicClasses && academicSession) {
      getAcademicClasses(academicSession.school_id)
    }
  }, [academicClasses, academicSession, getAcademicClasses])

  // Get existing configurations for the selected class and day
  const getExistingConfig = () => {
    if (!existingConfig || !existingConfig.class_day_config || !selectedClass) return null

    return existingConfig.class_day_config.find(
      (config: ClassDayConfigForTimeTable) =>
        config.class_id === Number.parseInt(selectedClass) && config.day === selectedDay,
    )
  }

  // Update form schema when totalBreaks changes
  useEffect(() => {
    form.clearErrors("break_durations")

    // Update the resolver with the new schema
    form.setError = form.setError

    // Ensure break_durations array has correct length
    const currentBreakDurations = form.getValues("break_durations") || []
    if (totalBreaks === null) {
      form.setValue("break_durations", [])
    } else if (currentBreakDurations.length < totalBreaks) {
      form.setValue("break_durations", [
        ...currentBreakDurations,
        ...Array(totalBreaks - currentBreakDurations.length).fill(0),
      ])
    } else if (currentBreakDurations.length > totalBreaks) {
      form.setValue("break_durations", currentBreakDurations.slice(0, totalBreaks))
    }
  }, [totalBreaks, form])

  // Load existing configuration when class or day changes
  useEffect(() => {
    const config = getExistingConfig()
    if (config) {
      // Convert break_durations to array if it's not already
      let breakDurations = Array.isArray(config.break_durations)
        ? config.break_durations
        : config.break_durations
          ? [config.break_durations]
          : []

      // Ensure we have the right number of break durations based on total_breaks
      if (config.total_breaks && breakDurations.length < config.total_breaks) {
        // Add missing break durations with default value of 0
        breakDurations = [...breakDurations, ...Array(config.total_breaks - breakDurations.length).fill(0)]
      }

      // Set total breaks first so the schema updates
      setTotalBreaks(config.total_breaks)

      // Then reset the form with all values
      form.reset({
        class_id: config.class_id,
        day: config.day,
        allowed_durations: Array.isArray(config.allowed_durations) ? config.allowed_durations : [],
        max_consecutive_periods: config.max_consecutive_periods,
        total_breaks: config.total_breaks,
        break_durations: breakDurations,
        day_start_time: config.day_start_time,
        day_end_time: config.day_end_time,
      })

      setCurrentConfigId(config.id)
    } else {
      setTotalBreaks(null)
      form.reset({
        class_id: Number.parseInt(selectedClass) || 0,
        day: selectedDay as any,
        allowed_durations: [],
        max_consecutive_periods: null,
        total_breaks: null,
        break_durations: [],
        day_start_time: "08:00",
        day_end_time: "15:00",
      })
      setCurrentConfigId(null)
    }
  }, [selectedClass, selectedDay, existingConfig, form])

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  // Get day name from day code
  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      mon: t("monday"),
      tue: t("tuesday"),
      wed: t("wednesday"),
      thu: t("thursday"),
      fri: t("friday"),
      sat: t("saturday"),
    }
    return days[day] || day
  }

  // Get class name from class ID
  const getClassName = (classId: number) => {
    if (!academicClasses) return t("unknown_class")
    const cls = academicClasses.find((c) => c.id === classId)
    return cls ? `Class ${cls.class}` : t("unknown_class")
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<ReturnType<typeof createClassDayConfigSchema>>) => {
    try {
      if (!existingConfig) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("general_settings_must_be_saved_first"),
        })
        return
      }

      setIsLoading(true)

      // Add school_timetable_config_id to the payload
      const payload = {
        ...data,
        school_timetable_config_id: existingConfig.id,
      }

      // Here you would call your API
      // For now, we'll just simulate a successful API call
      await createDayWiseTimeTableConfigfForClass({ payload }).unwrap()

      toast({
        title: t("success"),
        description: currentConfigId
          ? t("class_schedule_updated_successfully")
          : t("class_schedule_created_successfully"),
      })

      // Exit edit mode and refresh data
      setIsEditing(false)
      onConfigSaved()
    } catch (error) {
      console.error("Error saving class schedule:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: currentConfigId ? t("failed_to_update_class_schedule") : t("failed_to_create_class_schedule"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If no classes are available, show a message
  if (!academicClasses || academicClasses.length === 0) {
    return (
      <Alert>
        <Info className="h-5 w-5" />
        <AlertTitle>{t("no_classes_available")}</AlertTitle>
        <AlertDescription>{t("please_create_academic_classes_first")}</AlertDescription>
      </Alert>
    )
  }

  // Get all configurations for the selected class
  const classConfigurations =
    existingConfig?.class_day_config?.filter(
      (config: ClassDayConfigForTimeTable) => config.class_id === Number.parseInt(selectedClass),
    ) || []

  // Days of the week
  const days = [
    { value: "mon", label: t("monday") },
    { value: "tue", label: t("tuesday") },
    { value: "wed", label: t("wednesday") },
    { value: "thu", label: t("thursday") },
    { value: "fri", label: t("friday") },
    { value: "sat", label: t("saturday") },
  ]

  // Get current configuration
  const currentConfig = getExistingConfig()

  // Get allowed period durations from general settings
  const allowedPeriodDurations = existingConfig?.allowed_period_durations?.map((duration) => duration.toString()) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Label htmlFor="class-select">{t("select_class")}</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder={t("select_a_class")} />
            </SelectTrigger>
            <SelectContent>
              {academicClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  Class {cls.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedClass ? (
        <div className="text-center py-8 border rounded-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("no_class_selected")}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t("please_select_a_class_to_configure_its_schedule")}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {t("schedule_for")} {getClassName(Number.parseInt(selectedClass))}
            </h3>
          </div>

          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="mb-6">
              {days.map((day) => (
                <TabsTrigger key={day.value} value={day.value}>
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map((day) => (
              <TabsContent key={day.value} value={day.value}>
                <Card>
                  <CardContent className="pt-6">
                    {!isEditing && currentConfig ? (
                      <div className="border rounded-md p-6 relative">
                        <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={toggleEditMode}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("edit")}
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("school_hours")}</h4>
                            <div className="flex items-center space-x-2 mb-4">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {currentConfig.day_start_time} - {currentConfig.day_end_time}
                              </span>
                            </div>

                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              {t("allowed_period_durations")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentConfig.allowed_durations.map((duration: any) => (
                                <Badge key={duration} variant="secondary">
                                  {duration}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              {t("period_constraints")}
                            </h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">{t("max_consecutive_periods")}:</span>
                                <span className="font-medium">
                                  {currentConfig.max_consecutive_periods === null
                                    ? t("no_limit")
                                    : currentConfig.max_consecutive_periods}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">{t("total_breaks")}:</span>
                                <span className="font-medium">
                                  {currentConfig.total_breaks === null ? t("none") : currentConfig.total_breaks}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">{t("break_durations")}:</span>
                                <span className="font-medium">
                                  {Array.isArray(currentConfig.break_durations)
                                    ? currentConfig.break_durations.join(", ") + " " + t("minutes")
                                    : currentConfig.break_durations === null
                                      ? t("not_specified")
                                      : `${currentConfig.break_durations} ${t("minutes")}`}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : isEditing || !currentConfig ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="day_start_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="required">{t("day_start_time")}</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormDescription>{t("when_the_school_day_starts")}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="day_end_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="required">{t("day_end_time")}</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormDescription>{t("when_the_school_day_ends")}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="allowed_durations"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="required">{t("allowed_period_durations")}</FormLabel>
                                  <FormDescription>{t("select_allowed_period_durations_for_this_day")}</FormDescription>
                                </div>

                                {allowedPeriodDurations.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {allowedPeriodDurations.map((duration) => (
                                      <FormField
                                        key={duration}
                                        control={form.control}
                                        name="allowed_durations"
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={duration}
                                              className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(duration)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, duration])
                                                      : field.onChange(
                                                          field.value?.filter((value) => value !== duration),
                                                        )
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {duration} {t("minutes")}
                                              </FormLabel>
                                            </FormItem>
                                          )
                                        }}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>{t("no_durations_available")}</AlertTitle>
                                    <AlertDescription>
                                      {t("please_define_allowed_period_durations_in_general_settings_first")}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="max_consecutive_periods"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("max_consecutive_periods")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder={t("no_limit")}
                                      {...field}
                                      value={field.value === null ? "" : field.value}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        field.onChange(value === "" ? null : Number(value))
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription>{t("maximum_consecutive_periods_without_a_break")}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="total_breaks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("total_breaks")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder={t("no_breaks")}
                                      {...field}
                                      value={field.value === null ? "" : field.value}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        const numValue = value === "" ? null : Number(value)
                                        field.onChange(numValue)
                                        setTotalBreaks(numValue)
                                      }}
                                      min="0"
                                      max="10"
                                    />
                                  </FormControl>
                                  <FormDescription>{t("number_of_breaks_in_the_day")}</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {totalBreaks && totalBreaks > 0 ? (
                            <div className="space-y-4">
                              <FormLabel>{t("break_durations")}</FormLabel>
                              <FormDescription>{t("duration_of_each_break_in_minutes")}</FormDescription>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Array.from({ length: totalBreaks }).map((_, index) => (
                                  <FormField
                                    key={index}
                                    control={form.control}
                                    name={`break_durations.${index}`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {t("break")} {index + 1}
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder={t("duration_in_minutes")}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            min="0"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="flex justify-end space-x-2 pt-4">
                            {isEditing && (
                              <Button type="button" variant="outline" onClick={toggleEditMode}>
                                {t("cancel")}
                              </Button>
                            )}
                            <Button type="submit" disabled={isLoading}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {/* {currentConfigId
                                ? t("update_schedule_for_" + selectedDay, {
                                    defaultValue: `${t("update_schedule_for")} ${getDayName(selectedDay)}`,
                                  })
                                : t("save_schedule_for_" + selectedDay, {
                                    defaultValue: `${t("save_schedule_for")} ${getDayName(selectedDay)}`,
                                  })} */}
                                {currentConfigId ? t("update_schedule") : t("save_schedule")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">
                          {t("no_schedule_for")} {getDayName(day.value)}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-4">
                          {t("no_schedule_has_been_configured_for_this_day")}
                        </p>
                        <Button onClick={toggleEditMode}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("configure_schedule")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
