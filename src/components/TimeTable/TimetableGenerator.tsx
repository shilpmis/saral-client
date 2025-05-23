// import { useState, useEffect, useCallback } from "react"
// import { useForm, useFieldArray } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { Card, CardContent } from "@/components/ui/card"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Button } from "@/components/ui/button"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Input } from "@/components/ui/input"
// import { Loader2, AlertCircle, Clock, Dumbbell, Beaker, Plus, Trash2, XCircle } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
// import { useLazyGetAllTeachingStaffQuery } from "@/services/StaffService"
// import {
//   useVerifyPeriodConfigurationForDayMutation,
//   useCreateDayWiseTimeTableForDivisonMutation,
// } from "@/services/timetableService"
// import type { ClassDayConfigForTimeTable, TimeTableConfigForSchool } from "@/types/subjects"
// import type { SubjectDivisionMaster } from "@/types/subjects"
// import { Badge } from "@/components/ui/badge"

// interface TimetableGeneratorProps {
//   dayConfig: ClassDayConfigForTimeTable
//   divisionId: number
//   timetableConfig: TimeTableConfigForSchool
//   onSave: () => void
// }

// // Create a schema for period configuration
// const createPeriodSchema = (periodsCount: number) => {
//   return z.object({
//     periods: z
//       .array(
//         z.object({
//           period_order: z.number(),
//           start_time: z.string(),
//           end_time: z.string(),
//           is_break: z.boolean().default(false),
//           subjects_division_masters_id: z.number().default(0),
//           staff_enrollment_id: z.number().default(0),
//           lab_id: z.number().nullable(),
//           is_pt: z.boolean().default(false),
//           is_free_period: z.boolean().default(false),
//           duration: z.number(),
//         }),
//       )
//       .length(periodsCount, `Exactly ${periodsCount} periods required`),
//   })
// }

// // Interface for validation errors
// interface ValidationError {
//   code: string
//   message: string
//   periodIndex?: number
// }

// export default function TimetableGenerator({
//   dayConfig,
//   divisionId,
//   timetableConfig,
//   onSave,
// }: TimetableGeneratorProps) {
//   const { t } = useTranslation()
//   const { toast } = useToast()
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

//   const [getSubjectsForDivision, { data: subjectsData, isLoading: isLoadingSubjects }] =
//     useLazyGetSubjectsForDivisionQuery()
//   const [getAllTeachingStaff, { data: staffData, isLoading: isLoadingStaff }] = useLazyGetAllTeachingStaffQuery()
//   const [verifyPeriodConfiguration, { isLoading: isVerifying }] = useVerifyPeriodConfigurationForDayMutation()
//   const [createDayWiseTimeTable, { isLoading: isCreating }] = useCreateDayWiseTimeTableForDivisonMutation()

//   const [activeTab, setActiveTab] = useState<string>("timetable")
//   const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
//   const [firstPeriodStartTime, setFirstPeriodStartTime] = useState<string>(dayConfig.day_start_time)
//   const [selectedDuration, setSelectedDuration] = useState<number>(timetableConfig.default_period_duration)
//   const [breakPositions, setBreakPositions] = useState<number[]>([])
//   const [breakDurations, setBreakDurations] = useState<number[]>([])
//   const [maxPeriods, setMaxPeriods] = useState<number>(timetableConfig.max_periods_per_day)
//   const [periodsCount, setPeriodsCount] = useState<number>(timetableConfig.max_periods_per_day)
//   const [verificationInProgress, setVerificationInProgress] = useState<boolean>(false)

//   // Initialize form with dynamic schema
//   const form = useForm<z.infer<ReturnType<typeof createPeriodSchema>>>({
//     resolver: zodResolver(createPeriodSchema(periodsCount)),
//     defaultValues: {
//       periods: [],
//     },
//   })

//   const { fields, replace } = useFieldArray({
//     control: form.control,
//     name: "periods",
//   })

//   // Calculate the number of periods based on day configuration
//   useEffect(() => {
//     const count = maxPeriods + breakPositions.length
//     setPeriodsCount(count)

//     // Update form resolver when periodsCount changes
//     form.clearErrors()
//   }, [maxPeriods, breakPositions, form])

//   // Load subjects and staff data
//   useEffect(() => {
//     if (currentAcademicSession && divisionId) {
//       getSubjectsForDivision({
//         academic_session_id: currentAcademicSession.id,
//         division_id: divisionId,
//       })

//       getAllTeachingStaff({
//         academic_sessions: currentAcademicSession.id,
//       })
//     }
//   }, [currentAcademicSession, divisionId, getSubjectsForDivision, getAllTeachingStaff])

//   // Initialize break positions and durations from day config
//   useEffect(() => {
//     if (dayConfig.total_breaks) {
//       // Initialize break positions evenly distributed
//       const positions = []
//       const durations = []

//       for (let i = 0; i < dayConfig.total_breaks; i++) {
//         // Calculate position to distribute breaks evenly
//         const position = Math.round(((i + 1) * maxPeriods) / (dayConfig.total_breaks + 1))
//         positions.push(position)

//         // Get break duration from config or default to 15 minutes
//         const breakDuration = Array.isArray(dayConfig.break_durations)
//           ? dayConfig.break_durations[i] || 15
//           : dayConfig.break_durations || 15

//         durations.push(breakDuration)
//       }

//       setBreakPositions(positions)
//       setBreakDurations(durations)
//     }
//   }, [dayConfig, maxPeriods])

//   // Generate periods based on current configuration
//   useEffect(() => {
//     if (periodsCount > 0) {
//       generatePeriods()
//     }
//   }, [firstPeriodStartTime, selectedDuration, breakPositions, breakDurations, maxPeriods, periodsCount])

//   // Replace the verifyConfiguration function with this version that verifies a single period
//   const verifyConfiguration = useCallback(
//     async (periodIndex: number) => {
//       const period = form.getValues(`periods.${periodIndex}`)

//       // Only verify if this is not a break period and has both subject and teacher assigned
//       if (
//         period.is_break ||
//         period.is_pt ||
//         period.is_free_period ||
//         !period.subjects_division_masters_id ||
//         !period.staff_enrollment_id
//       ) {
//         // Remove any existing errors for this period
//         setValidationErrors((prev) => prev.filter((err) => err.periodIndex !== periodIndex))
//         return
//       }

//       try {
//         setVerificationInProgress(true)
//         // Prepare payload for verification API - just the single period
//         const periodPayload = {
//           class_day_config_id: dayConfig.id,
//           division_id: divisionId,
//           period_order: period.period_order,
//           start_time: period.start_time,
//           end_time: period.end_time,
//           is_break: period.is_break,
//           subjects_division_masters_id:period.subjects_division_masters_id ,
//           staff_enrollment_id: period.staff_enrollment_id ,
//           lab_id: period.lab_id,
//           is_pt: period.is_pt,
//           is_free_period: period.is_free_period,
//         }

//         await verifyPeriodConfiguration({ payload: periodPayload })

//         // If verification succeeds, remove any errors for this period
//         setValidationErrors((prev) => prev.filter((err) => err.periodIndex !== periodIndex))
//       } catch (error: any) {
//         // Handle validation errors from API
//         if (error.data) {
//           const errorData = error.data
//           const newError: ValidationError = {
//             code: errorData.code || "UNKNOWN_ERROR",
//             message: errorData.message || t("unknown_error"),
//             periodIndex: periodIndex,
//           }

//           // Update validation errors - remove any existing errors for this period and add the new one
//           setValidationErrors((prev) => {
//             const filtered = prev.filter((err) => err.periodIndex !== periodIndex)
//             return [...filtered, newError]
//           })
//         } else {
//           console.error("Verification error:", error)
//           setValidationErrors((prev) => {
//             const filtered = prev.filter((err) => err.periodIndex !== periodIndex)
//             return [
//               ...filtered,
//               {
//                 code: "API_ERROR",
//                 message: t("failed_to_verify_period"),
//                 periodIndex: periodIndex,
//               },
//             ]
//           })
//         }
//       } finally {
//         setVerificationInProgress(false)
//       }
//     },
//     [dayConfig.id, divisionId, form, t, verifyPeriodConfiguration],
//   )

//   // Debounced verification to avoid too many API calls
//   // Remove the useEffect that was doing debounced verification of the entire timetable
//   // (Remove the following code block)
//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     const formData = form.getValues();
//   //     verifyConfiguration(formData);
//   //   }, 500);
//   //
//   //   return () => clearTimeout(timer);
//   // }, [form, verifyConfiguration]);

//   // Generate periods based on current configuration
//   const generatePeriods = (customDurations?: number[]) => {
//     const [startHour, startMinute] = firstPeriodStartTime.split(":").map(Number)
//     let currentMinutes = startHour * 60 + startMinute

//     const periods = []
//     let regularPeriodCount = 0
//     const durations = customDurations || Array(periodsCount).fill(selectedDuration)

//     // Sort breakPositions to ensure correct order
//     const sortedBreakPositions = [...breakPositions].sort((a, b) => a - b)
//     let breakPointer = 0

//     for (let i = 0; i < maxPeriods + sortedBreakPositions.length; i++) {
//       // Insert a break after the correct period
//       if (breakPointer < sortedBreakPositions.length && regularPeriodCount === sortedBreakPositions[breakPointer]) {
//         // This is a break period
//         const breakDuration = breakDurations[breakPointer] || 15
//         const periodStartHour = Math.floor(currentMinutes / 60)
//         const periodStartMinute = currentMinutes % 60
//         const periodStartTime = `${periodStartHour.toString().padStart(2, "0")}:${periodStartMinute.toString().padStart(2, "0")}`
//         currentMinutes += breakDuration
//         const periodEndHour = Math.floor(currentMinutes / 60)
//         const periodEndMinute = currentMinutes % 60
//         const periodEndTime = `${periodEndHour.toString().padStart(2, "0")}:${periodEndMinute.toString().padStart(2, "0")}`
//         periods.push({
//           period_order: periods.length + 1,
//           start_time: periodStartTime,
//           end_time: periodEndTime,
//           is_break: true,
//           subjects_division_masters_id: 0,
//           staff_enrollment_id: 0,
//           lab_id: null,
//           is_pt: false,
//           is_free_period: false,
//           duration: breakDuration,
//         })
//         breakPointer++
//         continue
//       }
//       // Regular period
//       const duration = durations[regularPeriodCount] || selectedDuration
//       const periodStartHour = Math.floor(currentMinutes / 60)
//       const periodStartMinute = currentMinutes % 60
//       const periodStartTime = `${periodStartHour.toString().padStart(2, "0")}:${periodStartMinute.toString().padStart(2, "0")}`
//       currentMinutes += duration
//       const periodEndHour = Math.floor(currentMinutes / 60)
//       const periodEndMinute = currentMinutes % 60
//       const periodEndTime = `${periodEndHour.toString().padStart(2, "0")}:${periodEndMinute.toString().padStart(2, "0")}`
//       periods.push({
//         period_order: periods.length + 1,
//         start_time: periodStartTime,
//         end_time: periodEndTime,
//         is_break: false,
//         subjects_division_masters_id: 0,
//         staff_enrollment_id: 0,
//         lab_id: null,
//         is_pt: false,
//         is_free_period: false,
//         duration: duration,
//       })
//       regularPeriodCount++
//     }
//     replace(periods)
//   }

//   // Add a break
//   const addBreak = () => {
//     if (breakPositions.length >= maxPeriods - 1) {
//       toast({
//         variant: "destructive",
//         title: t("too_many_breaks"),
//         description: t("cannot_add_more_breaks"),
//       })
//       return
//     }

//     // Find a position where there isn't already a break
//     let position = 1
//     while (breakPositions.includes(position) && position < maxPeriods) {
//       position++
//     }

//     setBreakPositions([...breakPositions, position].sort((a, b) => a - b))
//     setBreakDurations([...breakDurations, 15])
//   }

//   // Remove a break
//   const removeBreak = (index: number) => {
//     setBreakPositions(breakPositions.filter((_, i) => i !== index))
//     setBreakDurations(breakDurations.filter((_, i) => i !== index))
//   }

//   // Update break position
//   const updateBreakPosition = (index: number, position: number) => {
//     const newPositions = [...breakPositions]
//     newPositions[index] = position
//     setBreakPositions(newPositions.sort((a, b) => a - b))
//   }

//   // Update break duration
//   const updateBreakDuration = (index: number, duration: number) => {
//     const newDurations = [...breakDurations]
//     newDurations[index] = duration
//     setBreakDurations(newDurations)
//   }

//   // Replace the handlePeriodDurationChange function with this version
//   const handlePeriodDurationChange = (index: number, value: number) => {
//     // Get current durations
//     const currentDurations = form.getValues("periods").map((p: any) => p.duration)
//     currentDurations[index] = value
//     generatePeriods(currentDurations)

//     // Trigger verification for this specific period after a short delay
//     setTimeout(() => {
//       verifyConfiguration(index)
//     }, 100)
//   }

//   // Replace the handleFieldChange function with this version that verifies only the changed period
//   const handleFieldChange = (
//     index: number,
//     field: "period_order" | "start_time" | "end_time" | "is_break" | "subjects_division_masters_id" | "staff_enrollment_id" | "lab_id" | "is_pt" | "is_free_period" | "duration",
//     value: any
//   ) => {
//     form.setValue(`periods.${index}.${field}`, value)

//     // Trigger verification for this specific period after a short delay
//     setTimeout(() => {
//       verifyConfiguration(index)
//     }, 100)
//   }

//   // Validate timetable against configuration rules
//   const validateTimetable = (data: z.infer<ReturnType<typeof createPeriodSchema>>) => {
//     const errors: string[] = []

//     // Check if all non-break periods have subjects and teachers assigned
//     const regularPeriods = data.periods.filter((p) => !p.is_break)
//     const unassignedSubjects = regularPeriods.filter(
//       (p) => !p.is_free_period && !p.is_pt && !p.subjects_division_masters_id,
//     )
//     const unassignedTeachers = regularPeriods.filter(
//       (p) => !p.is_free_period && !p.is_pt && p.subjects_division_masters_id > 0 && !p.staff_enrollment_id,
//     )

//     if (unassignedSubjects.length > 0) {
//       errors.push(t("some_periods_do_not_have_subjects_assigned"))
//     }

//     if (unassignedTeachers.length > 0) {
//       errors.push(t("some_periods_do_not_have_teachers_assigned"))
//     }

//     // Check max consecutive periods rule
//     if (dayConfig.max_consecutive_periods) {
//       let consecutiveCount = 0
//       let maxConsecutive = 0

//       for (const period of data.periods) {
//         if (!period.is_break) {
//           consecutiveCount++
//           maxConsecutive = Math.max(maxConsecutive, consecutiveCount)
//         } else {
//           consecutiveCount = 0
//         }
//       }

      
//     //   if (maxConsecutive > dayConfig.max_consecutive_periods) {
//     //     errors.push(t(`max_consecutive_periods_exceeded_${dayConfig.max_consecutive_periods}`))
//     //   }
//     }

//     return errors
//   }

//   // Handle form submission
//   const onSubmit = async (data: z.infer<ReturnType<typeof createPeriodSchema>>) => {
//     // Validate timetable
//     const formErrors = validateTimetable(data)

//     if (formErrors.length > 0) {
//       toast({
//         variant: "destructive",
//         title: t("validation_errors"),
//         description: formErrors.join(". "),
//       })
//       return
//     }

//     if (validationErrors.length > 0) {
//       toast({
//         variant: "destructive",
//         title: t("validation_errors"),
//         description: t("please_fix_validation_errors_before_saving"),
//       })
//       return
//     }

//     try {
//       // Prepare payload for API
//       const periodsPayload = {
//         class_day_config_id: dayConfig.id,
//         division_id: divisionId,
//         periods: data.periods.map((period) => ({
//           period_order: period.period_order,
//           start_time: period.start_time,
//           end_time: period.end_time,
//           is_break: period.is_break,
//           subjects_division_masters_id:period.subjects_division_masters_id ,
//           staff_enrollment_id: period.staff_enrollment_id,
//           lab_id: period.lab_id,
//           is_pt: period.is_pt,
//           is_free_period: period.is_free_period,
//         })),
//       }

//       // Call API to create period config
//       await createDayWiseTimeTable({
//         payload: periodsPayload,
//       })

//       toast({
//         title: t("success"),
//         description: t("timetable_created_successfully"),
//       })

//       // Notify parent component
//       onSave()
//     } catch (error: any) {
//       console.error("Error creating timetable:", error)

//       // Handle API error response
//       if (error.data) {
//         toast({
//           variant: "destructive",
//           title: t("error"),
//           description: error.data.message || t("failed_to_create_timetable"),
//         })
//       } else {
//         toast({
//           variant: "destructive",
//           title: t("error"),
//           description: t("failed_to_create_timetable"),
//         })
//       }
//     }
//   }

//   // Format time (e.g., "09:30" to "9:30 AM")
//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(":")
//     const hour = Number.parseInt(hours, 10)
//     const ampm = hour >= 12 ? "PM" : "AM"
//     const formattedHour = hour % 12 || 12
//     return `${formattedHour}:${minutes} ${ampm}`
//   }

//   // Get subject options
//   const getSubjectOptions = () => {
//     if (!subjectsData) return []
//     return subjectsData.map((subject: SubjectDivisionMaster) => ({
//       value: subject.id.toString(),
//       label: subject.subject?.name || `Subject ${subject.id}`,
//       code: subject.code_for_division || subject.subject?.code,
//     }))
//   }

//   // Get staff options for a specific subject
//   const getStaffOptionsForSubject = (subjectId: number | null) => {
//     if (!subjectsData || !subjectId) return []
//     // Find the subject division master for the selected subject
//     const subject = subjectsData.find((s: SubjectDivisionMaster) => s.id === subjectId)
//     if (!subject) return []
//     // Only include staff from subject_staff_divisioin_master
//     return (subject.subject_staff_divisioin_master || [])
//       .filter((ssm) => ssm.status === "Active" && ssm.staff_enrollment && ssm.staff_enrollment.status === "Retained")
//       .map((ssm) => {
//         const staff = ssm.staff_enrollment.staff
//         return {
//           value: ssm.staff_enrollment_id.toString(),
//           label: `${staff?.first_name || ""} ${staff?.last_name || ""}`.trim(),
//           code: staff?.employee_code,
//         }
//       })
//   }

//   // Get lab options
//   const getLabOptions = () => {
//     if (!timetableConfig.lab_config) return []
//     return timetableConfig.lab_config.map((lab) => ({
//       value: lab.id.toString(),
//       label: lab.name,
//     }))
//   }

//   // Get period background color
//   const getPeriodBgColor = (period: any, index: number) => {
//     // Check if this period has a validation error
//     const hasError = validationErrors.some((error) => error.periodIndex === index)

//     if (hasError) return "bg-red-50"
//     if (period.is_break) return "bg-amber-50"
//     if (period.is_pt) return "bg-purple-50"
//     if (period.lab_id) return "bg-blue-50"
//     if (period.is_free_period) return "bg-gray-50"
//     return "bg-white"
//   }

//   // Get error message for a specific period
//   const getPeriodErrorMessage = (index: number) => {
//     const error = validationErrors.find((err) => err.periodIndex === index)
//     return error ? error.message : null
//   }

//   // If loading subjects or staff
//   if (isLoadingSubjects || isLoadingStaff) {
//     return (
//       <div className="flex justify-center items-center py-12">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <Form {...form}>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <Clock className="h-5 w-5 text-muted-foreground" />
//             <span className="text-sm text-muted-foreground">
//               {t("school_hours")}: {formatTime(dayConfig.day_start_time)} - {formatTime(dayConfig.day_end_time)}
//             </span>
//           </div>

//           {verificationInProgress && (
//             <div className="flex items-center text-amber-600">
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//               <span className="text-sm">{t("verifying_timetable")}</span>
//             </div>
//           )}
//         </div>

//         {validationErrors.length > 0 && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-5 w-5" />
//             <AlertTitle>{t("validation_errors")}</AlertTitle>
//             <AlertDescription>
//               <ul className="list-disc pl-5 mt-2">
//                 {validationErrors.map((error, index) => (
//                   <li key={index} className="flex items-start">
//                     <span className="mr-2">
//                       {error.code === "PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_DAY" && "⚠️ "}
//                       {error.code === "TEACHER_NOT_AVAILABLE" && "⚠️ "}
//                       {error.code === "PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_WEEK" && "⚠️ "}
//                     </span>
//                     <span>
//                       {error.message}
//                       {error.periodIndex !== undefined && (
//                         <Badge variant="outline" className="ml-2">
//                           {t("period")} {error.periodIndex + 1}
//                         </Badge>
//                       )}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </AlertDescription>
//           </Alert>
//         )}

//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList>
//             <TabsTrigger value="settings">{t("timetable_settings")}</TabsTrigger>
//             <TabsTrigger value="timetable">{t("timetable_view")}</TabsTrigger>
//           </TabsList>

//           <TabsContent value="settings" className="space-y-6 pt-4">
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-medium">{t("period_settings")}</h3>

//                     <div className="space-y-2">
//                       <FormLabel htmlFor="first-period">{t("first_period_start_time")}</FormLabel>
//                       <Input
//                         id="first-period"
//                         type="time"
//                         value={firstPeriodStartTime}
//                         onChange={(e) => setFirstPeriodStartTime(e.target.value)}
//                       />
//                       <p className="text-sm text-muted-foreground">{t("start_time_for_the_first_period")}</p>
//                     </div>

//                     <div className="space-y-2">
//                       <FormLabel htmlFor="period-duration">{t("period_duration")}</FormLabel>
//                       <Select
//                         value={selectedDuration.toString()}
//                         onValueChange={(value) => setSelectedDuration(Number(value))}
//                       >
//                         <SelectTrigger id="period-duration">
//                           <SelectValue placeholder={t("select_duration")} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {timetableConfig.allowed_period_durations.map((duration) => (
//                             <SelectItem key={duration} value={duration.toString()}>
//                               {duration} {t("minutes")}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <p className="text-sm text-muted-foreground">{t("duration_for_regular_periods")}</p>
//                     </div>

//                     <div className="space-y-2">
//                       <FormLabel htmlFor="max-periods">{t("number_of_periods")}</FormLabel>
//                       <Input
//                         id="max-periods"
//                         type="number"
//                         min="1"
//                         max={timetableConfig.max_periods_per_day}
//                         value={maxPeriods}
//                         onChange={(e) => setMaxPeriods(Number(e.target.value))}
//                       />
//                       <p className="text-sm text-muted-foreground">
//                         {t("maximum_allowed")}: {timetableConfig.max_periods_per_day}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-lg font-medium">{t("break_settings")}</h3>
//                       <Button type="button" size="sm" onClick={addBreak}>
//                         <Plus className="h-4 w-4 mr-2" />
//                         {t("add_break")}
//                       </Button>
//                     </div>

//                     {breakPositions.length === 0 ? (
//                       <div className="text-center py-4 border rounded-md">
//                         <p className="text-sm text-muted-foreground">{t("no_breaks_configured")}</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {breakPositions.map((position, index) => (
//                           <div key={index} className="flex items-end space-x-2 border p-3 rounded-md">
//                             <div className="flex-1 space-y-2">
//                               <FormLabel htmlFor={`break-position-${index}`}>{t("after_period")}</FormLabel>
//                               <Select
//                                 value={position.toString()}
//                                 onValueChange={(value) => updateBreakPosition(index, Number(value))}
//                               >
//                                 <SelectTrigger id={`break-position-${index}`}>
//                                   <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {Array.from({ length: maxPeriods }, (_, i) => (
//                                     <SelectItem
//                                       key={i}
//                                       value={(i + 1).toString()}
//                                       disabled={breakPositions.filter((_, j) => j !== index).includes(i + 1)}
//                                     >
//                                       {t("period")} {i + 1}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </div>

//                             <div className="flex-1 space-y-2">
//                               <FormLabel htmlFor={`break-duration-${index}`}>{t("duration")}</FormLabel>
//                               <Input
//                                 id={`break-duration-${index}`}
//                                 type="number"
//                                 min="5"
//                                 value={breakDurations[index]}
//                                 onChange={(e) => updateBreakDuration(index, Number(e.target.value))}
//                               />
//                             </div>

//                             <Button
//                               type="button"
//                               variant="ghost"
//                               size="icon"
//                               className="text-destructive hover:text-destructive"
//                               onClick={() => removeBreak(index)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="timetable" className="pt-4">
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <div className="space-y-6">
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("period")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("time")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("type")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("duration")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("subject")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("teacher")}</th>
//                         <th className="border p-2 bg-muted font-medium text-center">{t("special")}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {fields.map((field, index) => {
//                         const periodError = getPeriodErrorMessage(index)

//                         return (
//                           <tr key={field.id} className={getPeriodBgColor(field, index)}>
//                             <td className="border p-2 text-center">{field.period_order}</td>
//                             <td className="border p-2 text-center">
//                               {formatTime(field.start_time)} - {formatTime(field.end_time)}
//                             </td>
//                             <td className="border p-2 text-center">
//                               {field.is_break
//                                 ? t("break")
//                                 : field.is_pt
//                                   ? t("physical_training")
//                                   : field.lab_id
//                                     ? t("lab")
//                                     : field.is_free_period
//                                       ? t("free_period")
//                                       : t("regular")}
//                             </td>
//                             <td className="border p-2 text-center">
//                               {!field.is_break && (
//                                 <Select
//                                   value={field.duration.toString()}
//                                   onValueChange={(value) => handlePeriodDurationChange(index, Number(value))}
//                                 >
//                                   <SelectTrigger className="h-8 w-full">
//                                     <SelectValue placeholder={t("select_duration")} />
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     {timetableConfig.allowed_period_durations.map((duration) => (
//                                       <SelectItem key={duration} value={duration.toString()}>
//                                         {duration} {t("minutes")}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               )}
//                             </td>
//                             <td className="border p-2 text-center">
//                               {!field.is_break && (
//                                 <FormField
//                                   control={form.control}
//                                   name={`periods.${index}.subjects_division_masters_id`}
//                                   render={({ field: subjectField }) => (
//                                     <FormItem className="m-0">
//                                       <Select
//                                         value={subjectField.value?.toString() || "none"}
//                                         onValueChange={(value) => {
//                                           handleFieldChange(index, "subjects_division_masters_id", Number(value) || 0)
//                                           // Reset teacher when subject changes
//                                           handleFieldChange(index, "staff_enrollment_id", 0)
//                                         }}
//                                         disabled={field.is_break || field.is_pt || field.is_free_period}
//                                       >
//                                         <SelectTrigger
//                                           className={`border-0 bg-transparent h-8 w-full ${periodError ? "border-red-500" : ""}`}
//                                         >
//                                           <SelectValue placeholder={t("select_subject")} />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                           {getSubjectOptions().map((option) => (
//                                             <SelectItem key={option.value} value={option.value}>
//                                               {option.label} {option.code ? `(${option.code})` : ""}
//                                             </SelectItem>
//                                           ))}
//                                         </SelectContent>
//                                       </Select>
//                                       <FormMessage />
//                                     </FormItem>
//                                   )}
//                                 />
//                               )}
//                             </td>
//                             <td className="border p-2 text-center">
//                               {!field.is_break && (
//                                 <FormField
//                                   control={form.control}
//                                   name={`periods.${index}.staff_enrollment_id`}
//                                   render={({ field: teacherField }) => {
//                                     const staffOptions = getStaffOptionsForSubject(
//                                       form.getValues(`periods.${index}.subjects_division_masters_id`),
//                                     )
//                                     return (
//                                       <FormItem className="m-0">
//                                         <Select
//                                           value={teacherField.value?.toString() || "none"}
//                                           onValueChange={(value) => {
//                                             handleFieldChange(index, "staff_enrollment_id", Number(value) || 0)
//                                           }}
//                                           disabled={
//                                             field.is_break ||
//                                             field.is_pt ||
//                                             field.is_free_period ||
//                                             !form.getValues(`periods.${index}.subjects_division_masters_id`) ||
//                                             staffOptions.length === 0
//                                           }
//                                         >
//                                           <SelectTrigger
//                                             className={`border-0 bg-transparent h-8 w-full ${periodError ? "border-red-500" : ""}`}
//                                           >
//                                             <SelectValue placeholder={t("select_teacher")} />
//                                           </SelectTrigger>
//                                           <SelectContent>
//                                             {staffOptions.length === 0 ? (
//                                               <div className="px-2 py-1 text-xs text-destructive">
//                                                 {t("no_teacher_assigned_for_this_subject")}
//                                               </div>
//                                             ) : (
//                                               staffOptions.map((option) => (
//                                                 <SelectItem key={option.value} value={option.value}>
//                                                   {option.label} {option.code ? `(${option.code})` : ""}
//                                                 </SelectItem>
//                                               ))
//                                             )}
//                                           </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                       </FormItem>
//                                     )
//                                   }}
//                                 />
//                               )}
//                               {periodError && (
//                                 <div className="text-xs text-red-500 mt-1 flex items-center">
//                                   <XCircle className="h-3 w-3 mr-1" />
//                                   {periodError}
//                                 </div>
//                               )}
//                             </td>
//                             <td className="border p-2 text-center">
//                               {!field.is_break && (
//                                 <div className="flex flex-wrap gap-2 justify-center">
//                                   <FormField
//                                     control={form.control}
//                                     name={`periods.${index}.is_pt`}
//                                     render={({ field: ptField }) => (
//                                       <FormItem className="flex items-center space-x-1 m-0">
//                                         <FormControl>
//                                           <Button
//                                             type="button"
//                                             variant={ptField.value ? "default" : "outline"}
//                                             size="sm"
//                                             className="h-7 px-2"
//                                             onClick={() => {
//                                               const newValue = !ptField.value
//                                               handleFieldChange(index, "is_pt", newValue)
//                                               if (newValue) {
//                                                 handleFieldChange(index, "is_free_period", false)
//                                                 handleFieldChange(index, "lab_id", null)
//                                               }
//                                             }}
//                                           >
//                                             <Dumbbell className="h-4 w-4 mr-1" />
//                                             {t("pt")}
//                                           </Button>
//                                         </FormControl>
//                                       </FormItem>
//                                     )}
//                                   />

//                                   {timetableConfig.lab_enabled && (
//                                     <FormField
//                                       control={form.control}
//                                       name={`periods.${index}.lab_id`}
//                                       render={({ field: labField }) => (
//                                         <FormItem className="flex items-center space-x-1 m-0">
//                                           <Select
//                                             value={labField.value?.toString() || "none"}
//                                             onValueChange={(value) => {
//                                               handleFieldChange(
//                                                 index,
//                                                 "lab_id",
//                                                 value !== "none" ? Number(value) : null,
//                                               )
//                                               if (value !== "none") {
//                                                 handleFieldChange(index, "is_pt", false)
//                                                 handleFieldChange(index, "is_free_period", false)
//                                               }
//                                             }}
//                                           >
//                                             <SelectTrigger className="h-7 px-2">
//                                               <Beaker className="h-4 w-4 mr-1" />
//                                               <SelectValue placeholder={t("lab")} />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                               <SelectItem value="none">{t("no_lab")}</SelectItem>
//                                               {getLabOptions().map((option) => (
//                                                 <SelectItem key={option.value} value={option.value}>
//                                                   {option.label}
//                                                 </SelectItem>
//                                               ))}
//                                             </SelectContent>
//                                           </Select>
//                                         </FormItem>
//                                       )}
//                                     />
//                                   )}

//                                   <FormField
//                                     control={form.control}
//                                     name={`periods.${index}.is_free_period`}
//                                     render={({ field: freeField }) => (
//                                       <FormItem className="flex items-center space-x-1 m-0">
//                                         <FormControl>
//                                           <Button
//                                             type="button"
//                                             variant={freeField.value ? "default" : "outline"}
//                                             size="sm"
//                                             className="h-7 px-2"
//                                             onClick={() => {
//                                               const newValue = !freeField.value
//                                               handleFieldChange(index, "is_free_period", newValue)
//                                               if (newValue) {
//                                                 handleFieldChange(index, "is_pt", false)
//                                                 handleFieldChange(index, "lab_id", null)
//                                               }
//                                             }}
//                                           >
//                                             {t("free")}
//                                           </Button>
//                                         </FormControl>
//                                       </FormItem>
//                                     )}
//                                   />
//                                 </div>
//                               )}
//                             </td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <Button type="submit" disabled={isCreating || validationErrors.length > 0}>
//                   {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                   {t("save_timetable")}
//                 </Button>
//               </div>
//             </form>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </Form>
//   )
// }



"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, Clock, Dumbbell, Beaker, Plus, Trash2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
import { useLazyGetAllTeachingStaffQuery } from "@/services/StaffService"
import {
  useVerifyPeriodConfigurationForDayMutation,
  useCreateDayWiseTimeTableForDivisonMutation,
} from "@/services/timetableService"
import type { ClassDayConfigForTimeTable, TimeTableConfigForSchool } from "@/types/subjects"
import type { SubjectDivisionMaster } from "@/types/subjects"
import { Badge } from "@/components/ui/badge"

interface TimetableGeneratorProps {
  dayConfig: ClassDayConfigForTimeTable
  divisionId: number
  timetableConfig: TimeTableConfigForSchool
  onSave: () => void
}

// Create a schema for period configuration
const createPeriodSchema = (periodsCount: number) => {
  return z.object({
    periods: z
      .array(
        z.object({
          period_order: z.number(),
          start_time: z.string(),
          end_time: z.string(),
          is_break: z.boolean().default(false),
          subjects_division_masters_id: z.number().default(0).nullable(),
          staff_enrollment_id: z.number().default(0).nullable(),
          lab_id: z.number().nullable(),
          is_pt: z.boolean().default(false),
          is_free_period: z.boolean().default(false),
          duration: z.number(),
        }),
      )
      .length(periodsCount, `Exactly ${periodsCount} periods required`),
  })
}

// Interface for validation errors
interface ValidationError {
  code: string
  message: string
  periodIndex?: number
}

export default function TimetableGenerator({
  dayConfig,
  divisionId,
  timetableConfig,
  onSave,
}: TimetableGeneratorProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  const [getSubjectsForDivision, { data: subjectsData, isLoading: isLoadingSubjects }] =
    useLazyGetSubjectsForDivisionQuery()
  const [getAllTeachingStaff, { data: staffData, isLoading: isLoadingStaff }] = useLazyGetAllTeachingStaffQuery()
  const [verifyPeriodConfiguration, { isLoading: isVerifying }] = useVerifyPeriodConfigurationForDayMutation()
  const [createDayWiseTimeTable, { isLoading: isCreating }] = useCreateDayWiseTimeTableForDivisonMutation()

  const [activeTab, setActiveTab] = useState<string>("timetable")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [firstPeriodStartTime, setFirstPeriodStartTime] = useState<string>(dayConfig.day_start_time)
  const [selectedDuration, setSelectedDuration] = useState<number>(timetableConfig.default_period_duration)
  const [breakPositions, setBreakPositions] = useState<number[]>([])
  const [breakDurations, setBreakDurations] = useState<number[]>([])
  const [maxPeriods, setMaxPeriods] = useState<number>(timetableConfig.max_periods_per_day)
  const [periodsCount, setPeriodsCount] = useState<number>(timetableConfig.max_periods_per_day)
  const [verificationInProgress, setVerificationInProgress] = useState<boolean>(false)

  // Initialize form with dynamic schema
  const form = useForm<z.infer<ReturnType<typeof createPeriodSchema>>>({
    resolver: zodResolver(createPeriodSchema(periodsCount)),
    defaultValues: {
      periods: [],
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "periods",
  })

  // Calculate the number of periods based on day configuration
  useEffect(() => {
    const count = maxPeriods + breakPositions.length
    setPeriodsCount(count)

    // Update form resolver when periodsCount changes
    form.clearErrors()
  }, [maxPeriods, breakPositions, form])

  // Load subjects and staff data
  useEffect(() => {
    if (currentAcademicSession && divisionId) {
      getSubjectsForDivision({
        academic_session_id: currentAcademicSession.id,
        division_id: divisionId,
      })

      getAllTeachingStaff({
        academic_sessions: currentAcademicSession.id,
      })
    }
  }, [currentAcademicSession, divisionId, getSubjectsForDivision, getAllTeachingStaff])

  // Initialize break positions and durations from day config
  useEffect(() => {
    if (dayConfig.total_breaks) {
      // Initialize break positions evenly distributed
      const positions = []
      const durations = []

      for (let i = 0; i < dayConfig.total_breaks; i++) {
        // Calculate position to distribute breaks evenly
        const position = Math.round(((i + 1) * maxPeriods) / (dayConfig.total_breaks + 1))
        positions.push(position)

        // Get break duration from config or default to 15 minutes
        const breakDuration = Array.isArray(dayConfig.break_durations)
          ? dayConfig.break_durations[i] || 15
          : dayConfig.break_durations || 15

        durations.push(breakDuration)
      }

      setBreakPositions(positions)
      setBreakDurations(durations)
    }
  }, [dayConfig, maxPeriods])

  // Generate periods based on current configuration
  useEffect(() => {
    if (periodsCount > 0) {
      generatePeriods()
    }
  }, [firstPeriodStartTime, selectedDuration, breakPositions, breakDurations, maxPeriods, periodsCount])

  // Verify a single period configuration
  const verifyConfiguration = useCallback(
    async (periodIndex: number) => {
      const period = form.getValues(`periods.${periodIndex}`)

      // Only verify if this is not a break period and has both subject and teacher assigned
      if (
        period.is_break ||
        period.is_pt ||
        period.is_free_period ||
        !period.subjects_division_masters_id ||
        !period.staff_enrollment_id
      ) {
        // Remove any existing errors for this period
        setValidationErrors((prev) => prev.filter((err) => err.periodIndex !== periodIndex))
        return
      }

      try {
        setVerificationInProgress(true)
        // Prepare payload for verification API - just the single period
        const periodPayload = {
          class_day_config_id: dayConfig.id,
          division_id: divisionId,
          period_order: period.period_order,
          start_time: period.start_time,
          end_time: period.end_time,
          is_break: period.is_break,
          subjects_division_masters_id: period.subjects_division_masters_id,
          staff_enrollment_id: period.staff_enrollment_id,
          lab_id: period.lab_id,
          is_pt: period.is_pt,
          is_free_period: period.is_free_period,
        }

        await verifyPeriodConfiguration({ payload: periodPayload }).unwrap()

        // If verification succeeds, remove any errors for this period
        setValidationErrors((prev) => prev.filter((err) => err.periodIndex !== periodIndex))
      } catch (error: any) {
        // Handle validation errors from API
        if (error.data) {
          const errorData = error.data
          const newError: ValidationError = {
            code: errorData.code || "UNKNOWN_ERROR",
            message: errorData.message || t("unknown_error"),
            periodIndex: periodIndex,
          }

          // Update validation errors - remove any existing errors for this period and add the new one
          setValidationErrors((prev) => {
            const filtered = prev.filter((err) => err.periodIndex !== periodIndex)
            return [...filtered, newError]
          })
        } else {
          console.error("Verification error:", error)
          setValidationErrors((prev) => {
            const filtered = prev.filter((err) => err.periodIndex !== periodIndex)
            return [
              ...filtered,
              {
                code: "API_ERROR",
                message: t("failed_to_verify_period"),
                periodIndex: periodIndex,
              },
            ]
          })
        }
      } finally {
        setVerificationInProgress(false)
      }
    },
    [dayConfig.id, divisionId, form, t, verifyPeriodConfiguration],
  )

  // Generate periods based on current configuration
  const generatePeriods = (customDurations?: number[]) => {
    const [startHour, startMinute] = firstPeriodStartTime.split(":").map(Number)
    let currentMinutes = startHour * 60 + startMinute

    const periods = []
    let regularPeriodCount = 0
    const durations = customDurations || Array(periodsCount).fill(selectedDuration)

    // Sort breakPositions to ensure correct order
    const sortedBreakPositions = [...breakPositions].sort((a, b) => a - b)
    let breakPointer = 0

    for (let i = 0; i < maxPeriods + sortedBreakPositions.length; i++) {
      // Insert a break after the correct period
      if (breakPointer < sortedBreakPositions.length && regularPeriodCount === sortedBreakPositions[breakPointer]) {
        // This is a break period
        const breakDuration = breakDurations[breakPointer] || 15
        const periodStartHour = Math.floor(currentMinutes / 60)
        const periodStartMinute = currentMinutes % 60
        const periodStartTime = `${periodStartHour.toString().padStart(2, "0")}:${periodStartMinute.toString().padStart(2, "0")}`
        currentMinutes += breakDuration
        const periodEndHour = Math.floor(currentMinutes / 60)
        const periodEndMinute = currentMinutes % 60
        const periodEndTime = `${periodEndHour.toString().padStart(2, "0")}:${periodEndMinute.toString().padStart(2, "0")}`
        periods.push({
          period_order: periods.length + 1,
          start_time: periodStartTime,
          end_time: periodEndTime,
          is_break: true,
          subjects_division_masters_id: null,
          staff_enrollment_id: null,
          lab_id: null,
          is_pt: false,
          is_free_period: false,
          duration: breakDuration,
        })
        breakPointer++
        continue
      }
      // Regular period
      const duration = durations[regularPeriodCount] || selectedDuration
      const periodStartHour = Math.floor(currentMinutes / 60)
      const periodStartMinute = currentMinutes % 60
      const periodStartTime = `${periodStartHour.toString().padStart(2, "0")}:${periodStartMinute.toString().padStart(2, "0")}`
      currentMinutes += duration
      const periodEndHour = Math.floor(currentMinutes / 60)
      const periodEndMinute = currentMinutes % 60
      const periodEndTime = `${periodEndHour.toString().padStart(2, "0")}:${periodEndMinute.toString().padStart(2, "0")}`
      periods.push({
        period_order: periods.length + 1,
        start_time: periodStartTime,
        end_time: periodEndTime,
        is_break: false,
        subjects_division_masters_id: null,
        staff_enrollment_id: null,
        lab_id: null,
        is_pt: false,
        is_free_period: false,
        duration: duration,
      })
      regularPeriodCount++
    }
    replace(periods)
  }

  // Add a break
  const addBreak = () => {
    if (breakPositions.length >= maxPeriods - 1) {
      toast({
        variant: "destructive",
        title: t("too_many_breaks"),
        description: t("cannot_add_more_breaks"),
      })
      return
    }

    // Find a position where there isn't already a break
    let position = 1
    while (breakPositions.includes(position) && position < maxPeriods) {
      position++
    }

    setBreakPositions([...breakPositions, position].sort((a, b) => a - b))
    setBreakDurations([...breakDurations, 15])
  }

  // Remove a break
  const removeBreak = (index: number) => {
    setBreakPositions(breakPositions.filter((_, i) => i !== index))
    setBreakDurations(breakDurations.filter((_, i) => i !== index))
  }

  // Update break position
  const updateBreakPosition = (index: number, position: number) => {
    const newPositions = [...breakPositions]
    newPositions[index] = position
    setBreakPositions(newPositions.sort((a, b) => a - b))
  }

  // Update break duration
  const updateBreakDuration = (index: number, duration: number) => {
    const newDurations = [...breakDurations]
    newDurations[index] = duration
    setBreakDurations(newDurations)
  }

  // Handle period duration change
  const handlePeriodDurationChange = (index: number, value: number) => {
    // Get current durations
    const currentDurations = form.getValues("periods").map((p: any) => p.duration)
    currentDurations[index] = value
    generatePeriods(currentDurations)

    // Trigger verification for this specific period after a short delay
    setTimeout(() => {
      verifyConfiguration(index)
    }, 100)
  }

  // Handle field change and trigger verification
  const handleFieldChange = (
    index: number,
    field:
      | "period_order"
      | "start_time"
      | "end_time"
      | "is_break"
      | "subjects_division_masters_id"
      | "staff_enrollment_id"
      | "lab_id"
      | "is_pt"
      | "is_free_period"
      | "duration",
    value: any,
  ) => {
    form.setValue(`periods.${index}.${field}`, value)

    // Trigger verification for this specific period after a short delay
    setTimeout(() => {
      verifyConfiguration(index)
    }, 100)
  }

  // Validate timetable against configuration rules
  const validateTimetable = (data: z.infer<ReturnType<typeof createPeriodSchema>>) => {
    const errors: string[] = []

    // Check if all non-break periods have subjects and teachers assigned
    const regularPeriods = data.periods.filter((p) => !p.is_break && !p.is_pt && !p.is_free_period)
    const unassignedSubjects = regularPeriods.filter((p) => !p.subjects_division_masters_id)
    const unassignedTeachers = regularPeriods.filter((p) => p.subjects_division_masters_id && !p.staff_enrollment_id)

    if (unassignedSubjects.length > 0) {
      errors.push(t("some_periods_do_not_have_subjects_assigned"))
    }

    if (unassignedTeachers.length > 0) {
      errors.push(t("some_periods_do_not_have_teachers_assigned"))
    }

    // Check max consecutive periods rule
    if (dayConfig.max_consecutive_periods) {
      let consecutiveCount = 0
      let maxConsecutive = 0

      for (const period of data.periods) {
        if (!period.is_break) {
          consecutiveCount++
          maxConsecutive = Math.max(maxConsecutive, consecutiveCount)
        } else {
          consecutiveCount = 0
        }
      }

    //   if (maxConsecutive > dayConfig.max_consecutive_periods) {
    //     errors.push(t("max_consecutive_periods_exceeded"))
    //   }
    }

    return errors
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<ReturnType<typeof createPeriodSchema>>) => {
    // Validate timetable
    const formErrors = validateTimetable(data)

    if (formErrors.length > 0) {
      toast({
        variant: "destructive",
        title: t("validation_errors"),
        description: formErrors.join(". "),
      })
      return
    }

    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: t("validation_errors"),
        description: t("please_fix_validation_errors_before_saving"),
      })
      return
    }

    try {
      // Prepare payload for API
      const periodsPayload = {
        class_day_config_id: dayConfig.id,
        division_id: divisionId,
        periods: data.periods.map((period) => {
          // Determine if we should set fields to null based on period type
          const isSpecialPeriod = period.is_break || period.is_pt || period.is_free_period

          return {
            period_order: period.period_order,
            start_time: period.start_time,
            end_time: period.end_time,
            is_break: period.is_break,
            subjects_division_masters_id: isSpecialPeriod ? null : period.subjects_division_masters_id || null,
            staff_enrollment_id: isSpecialPeriod ? null : period.staff_enrollment_id || null,
            lab_id: period.lab_id,
            is_pt: period.is_pt,
            is_free_period: period.is_free_period,
          }
        }),
      }

      // Call API to create period config
      await createDayWiseTimeTable({
        payload: periodsPayload,
      })

      toast({
        title: t("success"),
        description: t("timetable_created_successfully"),
      })

      // Notify parent component
      onSave()
    } catch (error: any) {
      console.error("Error creating timetable:", error)

      // Handle API error response
      if (error.data) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: error.data.message || t("failed_to_create_timetable"),
        })
      } else {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("failed_to_create_timetable"),
        })
      }
    }
  }

  // Format time (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  // Get subject options
  const getSubjectOptions = () => {
    if (!subjectsData) return []
    return subjectsData.map((subject: SubjectDivisionMaster) => ({
      value: subject.id.toString(),
      label: subject.subject?.name || `Subject ${subject.id}`,
      code: subject.code_for_division || subject.subject?.code,
    }))
  }

  // Get staff options for a specific subject
  const getStaffOptionsForSubject = (subjectId: number | null) => {
    if (!subjectsData || !subjectId) return []
    // Find the subject division master for the selected subject
    const subject = subjectsData.find((s: SubjectDivisionMaster) => s.id === subjectId)
    if (!subject) return []
    // Only include staff from subject_staff_divisioin_master
    return (subject.subject_staff_divisioin_master || [])
      .filter((ssm) => ssm.status === "Active" && ssm.staff_enrollment && ssm.staff_enrollment.status === "Retained")
      .map((ssm) => {
        const staff = ssm.staff_enrollment.staff
        return {
          value: ssm.staff_enrollment_id.toString(),
          label: `${staff?.first_name || ""} ${staff?.last_name || ""}`.trim(),
          code: staff?.employee_code,
        }
      })
  }

  // Get lab options
  const getLabOptions = () => {
    if (!timetableConfig.lab_config) return []
    return timetableConfig.lab_config.map((lab) => ({
      value: lab.id.toString(),
      label: lab.name,
    }))
  }

  // Get period background color
  const getPeriodBgColor = (period: any, index: number) => {
    // Check if this period has a validation error
    const hasError = validationErrors.some((error) => error.periodIndex === index)

    if (hasError) return "bg-red-50"
    if (period.is_break) return "bg-amber-50"
    if (period.is_pt) return "bg-purple-50"
    if (period.lab_id) return "bg-blue-50"
    if (period.is_free_period) return "bg-gray-50"
    return "bg-white"
  }

  // Get error message for a specific period
  const getPeriodErrorMessage = (index: number) => {
    const error = validationErrors.find((err) => err.periodIndex === index)
    return error ? error.message : null
  }

  // If loading subjects or staff
  if (isLoadingSubjects || isLoadingStaff) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("school_hours")}: {formatTime(dayConfig.day_start_time)} - {formatTime(dayConfig.day_end_time)}
            </span>
          </div>

          {verificationInProgress && (
            <div className="flex items-center text-amber-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm">{t("verifying_timetable")}</span>
            </div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{t("validation_errors")}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">
                      {error.code === "PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_DAY" && "⚠️ "}
                      {error.code === "TEACHER_NOT_AVAILABLE" && "⚠️ "}
                      {error.code === "PERIODS_LIMIT_FOR_TEACHER_EXCEEDED_FOR_WEEK" && "⚠️ "}
                    </span>
                    <span>
                      {error.message}
                      {error.periodIndex !== undefined && (
                        <Badge variant="outline" className="ml-2">
                          {t("period")} {error.periodIndex + 1}
                        </Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="settings">{t("timetable_settings")}</TabsTrigger>
            <TabsTrigger value="timetable">{t("timetable_view")}</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("period_settings")}</h3>

                    <div className="space-y-2">
                      <FormLabel htmlFor="first-period">{t("first_period_start_time")}</FormLabel>
                      <Input
                        id="first-period"
                        type="time"
                        value={firstPeriodStartTime}
                        onChange={(e) => setFirstPeriodStartTime(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">{t("start_time_for_the_first_period")}</p>
                    </div>

                    <div className="space-y-2">
                      <FormLabel htmlFor="period-duration">{t("period_duration")}</FormLabel>
                      <Select
                        value={selectedDuration.toString()}
                        onValueChange={(value) => setSelectedDuration(Number(value))}
                      >
                        <SelectTrigger id="period-duration">
                          <SelectValue placeholder={t("select_duration")} />
                        </SelectTrigger>
                        <SelectContent>
                          {timetableConfig.allowed_period_durations.map((duration) => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} {t("minutes")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">{t("duration_for_regular_periods")}</p>
                    </div>

                    <div className="space-y-2">
                      <FormLabel htmlFor="max-periods">{t("number_of_periods")}</FormLabel>
                      <Input
                        id="max-periods"
                        type="number"
                        min="1"
                        max={timetableConfig.max_periods_per_day}
                        value={maxPeriods}
                        onChange={(e) => setMaxPeriods(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t("maximum_allowed")}: {timetableConfig.max_periods_per_day}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{t("break_settings")}</h3>
                      <Button type="button" size="sm" onClick={addBreak}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("add_break")}
                      </Button>
                    </div>

                    {breakPositions.length === 0 ? (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">{t("no_breaks_configured")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {breakPositions.map((position, index) => (
                          <div key={index} className="flex items-end space-x-2 border p-3 rounded-md">
                            <div className="flex-1 space-y-2">
                              <FormLabel htmlFor={`break-position-${index}`}>{t("after_period")}</FormLabel>
                              <Select
                                value={position.toString()}
                                onValueChange={(value) => updateBreakPosition(index, Number(value))}
                              >
                                <SelectTrigger id={`break-position-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: maxPeriods }, (_, i) => (
                                    <SelectItem
                                      key={i}
                                      value={(i + 1).toString()}
                                      disabled={breakPositions.filter((_, j) => j !== index).includes(i + 1)}
                                    >
                                      {t("period")} {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex-1 space-y-2">
                              <FormLabel htmlFor={`break-duration-${index}`}>{t("duration")}</FormLabel>
                              <Input
                                id={`break-duration-${index}`}
                                type="number"
                                min="5"
                                value={breakDurations[index]}
                                onChange={(e) => updateBreakDuration(index, Number(e.target.value))}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeBreak(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable" className="pt-4">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted font-medium text-center">{t("period")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("time")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("type")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("duration")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("subject")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("teacher")}</th>
                        <th className="border p-2 bg-muted font-medium text-center">{t("special")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const periodError = getPeriodErrorMessage(index)

                        return (
                          <tr key={field.id} className={getPeriodBgColor(field, index)}>
                            <td className="border p-2 text-center">{field.period_order}</td>
                            <td className="border p-2 text-center">
                              {formatTime(field.start_time)} - {formatTime(field.end_time)}
                            </td>
                            <td className="border p-2 text-center">
                              {field.is_break
                                ? t("break")
                                : field.is_pt
                                  ? t("physical_training")
                                  : field.lab_id
                                    ? t("lab")
                                    : field.is_free_period
                                      ? t("free_period")
                                      : t("regular")}
                            </td>
                            <td className="border p-2 text-center">
                              {!field.is_break && (
                                <Select
                                  value={field.duration.toString()}
                                  onValueChange={(value) => handlePeriodDurationChange(index, Number(value))}
                                >
                                  <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder={t("select_duration")} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timetableConfig.allowed_period_durations.map((duration) => (
                                      <SelectItem key={duration} value={duration.toString()}>
                                        {duration} {t("minutes")}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            <td className="border p-2 text-center">
                              {!field.is_break && (
                                <FormField
                                  control={form.control}
                                  name={`periods.${index}.subjects_division_masters_id`}
                                  render={({ field: subjectField }) => (
                                    <FormItem className="m-0">
                                      <Select
                                        value={subjectField.value?.toString() || "none"}
                                        onValueChange={(value) => {
                                          handleFieldChange(
                                            index,
                                            "subjects_division_masters_id",
                                            value === "none" ? null : Number(value),
                                          )
                                          // Reset teacher when subject changes
                                          handleFieldChange(index, "staff_enrollment_id", null)
                                        }}
                                        disabled={field.is_break || field.is_pt || field.is_free_period}
                                      >
                                        <SelectTrigger
                                          className={`border-0 bg-transparent h-8 w-full ${periodError ? "border-red-500" : ""}`}
                                        >
                                          <SelectValue placeholder={t("select_subject")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getSubjectOptions().map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label} {option.code ? `(${option.code})` : ""}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </td>
                            <td className="border p-2 text-center">
                              {!field.is_break && (
                                <FormField
                                  control={form.control}
                                  name={`periods.${index}.staff_enrollment_id`}
                                  render={({ field: teacherField }) => {
                                    const staffOptions = getStaffOptionsForSubject(
                                      form.getValues(`periods.${index}.subjects_division_masters_id`),
                                    )
                                    return (
                                      <FormItem className="m-0">
                                        <Select
                                          value={teacherField.value?.toString() || "none"}
                                          onValueChange={(value) => {
                                            handleFieldChange(
                                              index,
                                              "staff_enrollment_id",
                                              value === "none" ? null : Number(value),
                                            )
                                          }}
                                          disabled={
                                            field.is_break ||
                                            field.is_pt ||
                                            field.is_free_period ||
                                            !form.getValues(`periods.${index}.subjects_division_masters_id`) ||
                                            staffOptions.length === 0
                                          }
                                        >
                                          <SelectTrigger
                                            className={`border-0 bg-transparent h-8 w-full ${periodError ? "border-red-500" : ""}`}
                                          >
                                            <SelectValue placeholder={t("select_teacher")} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {staffOptions.length === 0 ? (
                                              <div className="px-2 py-1 text-xs text-destructive">
                                                {t("no_teacher_assigned_for_this_subject")}
                                              </div>
                                            ) : (
                                              staffOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label} {option.code ? `(${option.code})` : ""}
                                                </SelectItem>
                                              ))
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )
                                  }}
                                />
                              )}
                              {periodError && (
                                <div className="text-xs text-red-500 mt-1 flex items-center">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {periodError}
                                </div>
                              )}
                            </td>
                            <td className="border p-2 text-center">
                              {!field.is_break && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  <FormField
                                    control={form.control}
                                    name={`periods.${index}.is_pt`}
                                    render={({ field: ptField }) => (
                                      <FormItem className="flex items-center space-x-1 m-0">
                                        <FormControl>
                                          <Button
                                            type="button"
                                            variant={ptField.value ? "default" : "outline"}
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => {
                                              const newValue = !ptField.value
                                              handleFieldChange(index, "is_pt", newValue)
                                              if (newValue) {
                                                handleFieldChange(index, "is_free_period", false)
                                                handleFieldChange(index, "lab_id", null)
                                                handleFieldChange(index, "subjects_division_masters_id", null)
                                                handleFieldChange(index, "staff_enrollment_id", null)
                                              }
                                            }}
                                          >
                                            <Dumbbell className="h-4 w-4 mr-1" />
                                            {t("pt")}
                                          </Button>
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  {timetableConfig.lab_enabled && (
                                    <FormField
                                      control={form.control}
                                      name={`periods.${index}.lab_id`}
                                      render={({ field: labField }) => (
                                        <FormItem className="flex items-center space-x-1 m-0">
                                          <Select
                                            value={labField.value?.toString() || "none"}
                                            onValueChange={(value) => {
                                              handleFieldChange(
                                                index,
                                                "lab_id",
                                                value !== "none" ? Number(value) : null,
                                              )
                                              if (value !== "none") {
                                                handleFieldChange(index, "is_pt", false)
                                                handleFieldChange(index, "is_free_period", false)
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="h-7 px-2">
                                              <Beaker className="h-4 w-4 mr-1" />
                                              <SelectValue placeholder={t("lab")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="none">{t("no_lab")}</SelectItem>
                                              {getLabOptions().map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  <FormField
                                    control={form.control}
                                    name={`periods.${index}.is_free_period`}
                                    render={({ field: freeField }) => (
                                      <FormItem className="flex items-center space-x-1 m-0">
                                        <FormControl>
                                          <Button
                                            type="button"
                                            variant={freeField.value ? "default" : "outline"}
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => {
                                              const newValue = !freeField.value
                                              handleFieldChange(index, "is_free_period", newValue)
                                              if (newValue) {
                                                handleFieldChange(index, "is_pt", false)
                                                handleFieldChange(index, "lab_id", null)
                                                handleFieldChange(index, "subjects_division_masters_id", null)
                                                handleFieldChange(index, "staff_enrollment_id", null)
                                              }
                                            }}
                                          >
                                            {t("free")}
                                          </Button>
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isCreating || validationErrors.length > 0}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save_timetable")}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </Form>
  )
}
