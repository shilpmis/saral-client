// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   Loader2,
//   Calendar,
//   Edit,
//   Save,
//   RotateCcw,
//   BookOpen,
//   Users,
//   Dumbbell,
//   Coffee,
//   Beaker,
//   Clock,
//   Wand2,
//   CheckCircle,
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
// import { useLazyGetTeachingStaffQuery } from "@/services/StaffService"
// import {
//   useAutoGenerateTimeTableForWeekMutation,
//   useCreateDayWiseTimeTableForDivisonMutation,
//   useLazyFetchTimeTableConfigForDivisionQuery,
// } from "@/services/timetableService"
// import type { WeeklyTimeTableForDivision, TimeTableConfigForSchool, SubjectDivisionMaster } from "@/types/subjects"
// import type { StaffType } from "@/types/staff"

// interface AutoTimetableGeneratorProps {
//   divisionId: number
//   timetableConfig: TimeTableConfigForSchool
//   onSave: () => void
//   onCancel: () => void
// }

// export default function AutoTimetableGenerator({
//   divisionId,
//   timetableConfig,
//   onSave,
//   onCancel,
// }: AutoTimetableGeneratorProps) {
//   const { t } = useTranslation()
//   const { toast } = useToast()
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

//   // API hooks
//   const [autoGenerateTimeTable, { isLoading: isGenerating }] = useAutoGenerateTimeTableForWeekMutation()
//   const [createDayWiseTimeTable, { isLoading: isSaving }] = useCreateDayWiseTimeTableForDivisonMutation()
//   const [getSubjectsForDivision, { data: subjectsData }] = useLazyGetSubjectsForDivisionQuery()
//   const [getTeachingStaff, { data: staffData }] = useLazyGetTeachingStaffQuery()
//   const [fetchTimeTableConfig] = useLazyFetchTimeTableConfigForDivisionQuery()

//   // State management
//   const [generatedTimetable, setGeneratedTimetable] = useState<WeeklyTimeTableForDivision | null>(null)
//   const [editingTimetable, setEditingTimetable] = useState<WeeklyTimeTableForDivision | null>(null)
//   const [subjects, setSubjects] = useState<SubjectDivisionMaster[]>([])
//   const [staff, setStaff] = useState<StaffType[]>([])
//   const [activeDay, setActiveDay] = useState<string>("mon")
//   const [hasGenerated, setHasGenerated] = useState(false)
//   const [editingMode, setEditingMode] = useState(false)

//   // Days configuration
//   const days = [
//     { value: "mon", label: t("monday") },
//     { value: "tue", label: t("tuesday") },
//     { value: "wed", label: t("wednesday") },
//     { value: "thu", label: t("thursday") },
//     { value: "fri", label: t("friday") },
//     { value: "sat", label: t("saturday") },
//   ]

//   // Load subjects and staff data
//   useEffect(() => {
//     if (currentAcademicSession && divisionId) {
//       getSubjectsForDivision({
//         academic_session_id: currentAcademicSession.id,
//         division_id: divisionId,
//       })

//       getTeachingStaff({
//         academic_sessions: currentAcademicSession.id,
//       })
//     }
//   }, [currentAcademicSession, divisionId, getSubjectsForDivision, getTeachingStaff])

//   // Set subjects and staff when data is loaded
//   useEffect(() => {
//     if (subjectsData) {
//       setSubjects(subjectsData)
//     }
//     if (staffData) {
//       setStaff(staffData.data || [])
//     }
//   }, [subjectsData, staffData])

//   // Initialize editing timetable when generated timetable changes
//   useEffect(() => {
//     if (generatedTimetable) {
//       setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
//     } else {
//       setEditingTimetable(null)
//     }
//   }, [generatedTimetable])

//   // Handle auto-generation
//   const handleAutoGenerate = async () => {
//     try {
//       const result = await autoGenerateTimeTable({ division_id: divisionId , academic_session_id : currentAcademicSession!.id  }).unwrap()
//       setGeneratedTimetable(result)
//       setHasGenerated(true)
//       setEditingMode(false)

//       toast({
//         title: t("success"),
//         description: t("timetable_generated_successfully"),
//       })
//     } catch (error: any) {
//       console.error("Error generating timetable:", error)
//       toast({
//         variant: "destructive",
//         title: t("error"),
//         description: error.data?.message || t("failed_to_generate_timetable"),
//       })
//     }
//   }

//   // Handle save timetable
//   const handleSaveTimetable = async () => {
//     try {
//       // Save each day's timetable
//       for (const dayTimetable of (editingTimetable)) {
//         const periodsPayload = {
//           class_day_config_id: dayTimetable.class_day_config_id,
//           division_id: divisionId,
//           periods: dayTimetable.periods.map((period) => ({
//             period_order: period.period_order,
//             start_time: period.start_time,
//             end_time: period.end_time,
//             is_break: period.is_break,
//             subjects_division_masters_id:
//               period.is_break || period.is_pt || period.is_free_period ? null : period.subjects_division_masters_id,
//             staff_enrollment_id:
//               period.is_break || period.is_pt || period.is_free_period ? null : period.staff_enrollment_id,
//             lab_id: period.lab_id,
//             is_pt: period.is_pt,
//             is_free_period: period.is_free_period,
//           })),
//         }

//         await createDayWiseTimeTable({ payload: periodsPayload }).unwrap()
//       }

//       toast({
//         title: t("success"),
//         description: t("timetable_saved_successfully"),
//       })

//       onSave()
//     } catch (error: any) {
//       console.error("Error saving timetable:", error)
//       toast({
//         variant: "destructive",
//         title: t("error"),
//         description: error.data?.message || t("failed_to_save_timetable"),
//       })
//     }
//   }

//   // Reset to generated timetable
//   const handleResetChanges = () => {
//     setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
//     setEditingMode(false)
//     toast({
//       title: t("changes_reset"),
//       description: t("timetable_reset_to_generated_version"),
//     })
//   }

//   // Format time
//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(":")
//     const hour = Number.parseInt(hours, 10)
//     const ampm = hour >= 12 ? "PM" : "AM"
//     const formattedHour = hour % 12 || 12
//     return `${formattedHour}:${minutes} ${ampm}`
//   }

//   // Get day config by day value
//   const getDayConfig = (dayValue: string) => {
//     return timetableConfig.class_day_config.find((config) => config.day === dayValue)
//   }

//   // Get timetable for specific day
//   const getDayTimetable = (dayValue: string) => {
//     const dayConfig = getDayConfig(dayValue)
//     if (!dayConfig) return null

//     return editingTimetable.find((tt) => tt.class_day_config_id === dayConfig.id)
//   }

//   // Get subject name
//   const getSubjectName = (subjectId: number | null) => {
//     if (!subjectId) return t("no_subject")
//     const subject = subjects.find((s) => s.id === subjectId)
//     return subject ? subject.subject?.name || t("unknown_subject") : t("unknown_subject")
//   }

//   // Get subject code
//   const getSubjectCode = (subjectId: number | null) => {
//     if (!subjectId) return ""
//     const subject = subjects.find((s) => s.id === subjectId)
//     return subject ? subject.code_for_division || subject.subject?.code || "" : ""
//   }

//   // Get teacher name
//   const getTeacherName = (staffId: number | null) => {
//     if (!staffId) return t("no_teacher")
//     const teacher = staff.find((s) => s.staff_enrollment_id === staffId)
//     if (!teacher) return t("unknown_teacher")
//     return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
//   }

//   // Get lab name
//   const getLabName = (labId: number | null) => {
//     if (!labId) return null
//     const lab = timetableConfig.lab_config.find((lab) => lab.id === labId)
//     return lab ? lab.name : t("unknown_lab")
//   }

//   // Get period icon
//   const getPeriodIcon = (period: any) => {
//     if (period.is_break) return <Coffee className="h-4 w-4 text-amber-600" />
//     if (period.is_pt) return <Dumbbell className="h-4 w-4 text-purple-600" />
//     if (period.lab_id) return <Beaker className="h-4 w-4 text-blue-600" />
//     if (period.is_free_period) return <Clock className="h-4 w-4 text-gray-600" />
//     return <BookOpen className="h-4 w-4 text-green-600" />
//   }

//   // Get period background color
//   const getPeriodBgColor = (period: any) => {
//     if (period.is_break) return "bg-amber-50"
//     if (period.is_pt) return "bg-purple-50"
//     if (period.lab_id) return "bg-blue-50"
//     if (period.is_free_period) return "bg-gray-50"
//     return "bg-green-50"
//   }

//   // Get period type badge
//   const getPeriodTypeBadge = (period: any) => {
//     if (period.is_break) {
//       return (
//         <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
//           {t("break")}
//         </Badge>
//       )
//     }
//     if (period.is_pt) {
//       return (
//         <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
//           {t("pt")}
//         </Badge>
//       )
//     }
//     if (period.lab_id) {
//       return (
//         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//           {t("lab")}
//         </Badge>
//       )
//     }
//     if (period.is_free_period) {
//       return (
//         <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
//           {t("free")}
//         </Badge>
//       )
//     }
//     return (
//       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//         {t("regular")}
//       </Badge>
//     )
//   }

//   // Get subject options
//   const getSubjectOptions = () => {
//     if (!subjects) return []
//     return subjects.map((subject) => ({
//       value: subject.id.toString(),
//       label: subject.subject?.name || `Subject ${subject.id}`,
//       code: subject.code_for_division || subject.subject?.code,
//     }))
//   }

//   // Get staff options for a specific subject
//   const getStaffOptionsForSubject = (subjectId: number | null) => {
//     if (!subjects || !subjectId) return []
//     const subject = subjects.find((s) => s.id === subjectId)
//     if (!subject) return []

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

//   // Update period in editing timetable
//   const updatePeriod = (dayValue: string, periodIndex: number, field: string, value: any) => {
//     const dayConfig = getDayConfig(dayValue)
//     if (!dayConfig) return

//     setEditingTimetable((prev) => {
//       const newTimetable = [...prev]
//       const dayTimetableIndex = newTimetable.findIndex((tt) => tt.class_day_config_id === dayConfig.id)

//       if (dayTimetableIndex !== -1) {
//         const updatedPeriods = [...newTimetable[dayTimetableIndex].periods]
//         updatedPeriods[periodIndex] = {
//           ...updatedPeriods[periodIndex],
//           [field]: value,
//         }

//         // Reset teacher when subject changes
//         if (field === "subjects_division_masters_id") {
//           updatedPeriods[periodIndex].staff_enrollment_id = null
//         }

//         newTimetable[dayTimetableIndex] = {
//           ...newTimetable[dayTimetableIndex],
//           periods: updatedPeriods,
//         }

//         setEditingMode(true)
//       }

//       return newTimetable
//     })
//   }

//   // Render weekly overview
//   const renderWeeklyOverview = () => {
//     const maxPeriods = Math.max(
//       ...timetableConfig.class_day_config.map((config) => {
//         const dayTimetable = editingTimetable.find((tt) => tt.class_day_config_id === config.id)
//         return dayTimetable ? dayTimetable.periods.length : 0
//       }),
//     )

//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr>
//               <th className="border p-2 bg-muted font-medium text-left">{t("day")}</th>
//               {Array.from({ length: maxPeriods }, (_, i) => (
//                 <th key={i} className="border p-2 bg-muted font-medium text-center">
//                   {t("period")} {i + 1}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {days.map((day) => {
//               const dayConfig = getDayConfig(day.value)
//               const dayTimetable = getDayTimetable(day.value)

//               if (!dayConfig || !dayTimetable) return null

//               return (
//                 <tr key={day.value}>
//                   <th className="border p-2 bg-muted font-medium text-left">{day.label}</th>
//                   {Array.from({ length: maxPeriods }, (_, i) => {
//                     const period = dayTimetable.periods[i]

//                     if (!period) {
//                       return (
//                         <td key={i} className="border p-2 text-center text-muted-foreground text-sm">
//                           -
//                         </td>
//                       )
//                     }

//                     return (
//                       <td key={i} className={`border p-2 ${getPeriodBgColor(period)}`}>
//                         <div className="flex flex-col h-full min-h-[80px]">
//                           <div className="flex items-center justify-between mb-1">
//                             <div className="flex items-center space-x-1">
//                               {getPeriodIcon(period)}
//                               <span className="text-xs font-medium">
//                                 {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                               </span>
//                             </div>
//                             {getPeriodTypeBadge(period)}
//                           </div>

//                           {!period.is_break && (
//                             <>
//                               {period.subjects_division_masters_id && !period.is_free_period && (
//                                 <div className="text-sm font-medium">
//                                   {getSubjectName(period.subjects_division_masters_id)}
//                                   {getSubjectCode(period.subjects_division_masters_id) && (
//                                     <span className="text-xs text-muted-foreground ml-1">
//                                       ({getSubjectCode(period.subjects_division_masters_id)})
//                                     </span>
//                                   )}
//                                 </div>
//                               )}

//                               {period.staff_enrollment_id && !period.is_free_period && (
//                                 <div className="flex items-center space-x-1 mt-1">
//                                   <Users className="h-3 w-3 text-muted-foreground" />
//                                   <span className="text-xs text-muted-foreground">
//                                     {getTeacherName(period.staff_enrollment_id)}
//                                   </span>
//                                 </div>
//                               )}

//                               {period.lab_id && (
//                                 <div className="flex items-center space-x-1 mt-1">
//                                   <Beaker className="h-3 w-3 text-muted-foreground" />
//                                   <span className="text-xs text-muted-foreground">{getLabName(period.lab_id)}</span>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     )
//                   })}
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//     )
//   }

//   // Render day editor
//   const renderDayEditor = (dayValue: string) => {
//     const dayTimetable = getDayTimetable(dayValue)
//     if (!dayTimetable) return null

//     return (
//       <div className="space-y-4">
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("period")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("time")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("type")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("subject")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("teacher")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("lab")}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dayTimetable.periods.map((period, index) => (
//                 <tr key={index} className={getPeriodBgColor(period)}>
//                   <td className="border p-2 text-center">{period.period_order}</td>
//                   <td className="border p-2 text-center">
//                     {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                   </td>
//                   <td className="border p-2 text-center">{getPeriodTypeBadge(period)}</td>
//                   <td className="border p-2 text-center">
//                     {!period.is_break && !period.is_pt && !period.is_free_period ? (
//                       <Select
//                         value={period.subjects_division_masters_id?.toString() || "none"}
//                         onValueChange={(value) =>
//                           updatePeriod(
//                             dayValue,
//                             index,
//                             "subjects_division_masters_id",
//                             value === "none" ? null : Number(value),
//                           )
//                         }
//                       >
//                         <SelectTrigger className="h-8 w-full">
//                           <SelectValue placeholder={t("select_subject")} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">{t("no_subject")}</SelectItem>
//                           {getSubjectOptions().map((option) => (
//                             <SelectItem key={option.value} value={option.value}>
//                               {option.label} {option.code ? `(${option.code})` : ""}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">-</span>
//                     )}
//                   </td>
//                   <td className="border p-2 text-center">
//                     {!period.is_break && !period.is_pt && !period.is_free_period ? (
//                       <Select
//                         value={period.staff_enrollment_id?.toString() || "none"}
//                         onValueChange={(value) =>
//                           updatePeriod(dayValue, index, "staff_enrollment_id", value === "none" ? null : Number(value))
//                         }
//                         disabled={!period.subjects_division_masters_id}
//                       >
//                         <SelectTrigger className="h-8 w-full">
//                           <SelectValue placeholder={t("select_teacher")} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">{t("no_teacher")}</SelectItem>
//                           {getStaffOptionsForSubject(period.subjects_division_masters_id).map((option) => (
//                             <SelectItem key={option.value} value={option.value}>
//                               {option.label} {option.code ? `(${option.code})` : ""}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">-</span>
//                     )}
//                   </td>
//                   <td className="border p-2 text-center">{period.lab_id ? getLabName(period.lab_id) : "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Wand2 className="h-5 w-5" />
//             <span>{t("automatic_timetable_generation")}</span>
//           </CardTitle>
//           <CardDescription>
//             {t("generate_and_customize_timetable_automatically_for_the_selected_division")}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {!hasGenerated ? (
//             <div className="text-center py-12">
//               <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
//                 <Calendar className="h-8 w-8 text-primary" />
//               </div>
//               <h3 className="text-lg font-medium mb-2">{t("ready_to_generate_timetable")}</h3>
//               <p className="text-muted-foreground max-w-md mx-auto mb-6">
//                 {t("click_the_button_below_to_automatically_generate_a_timetable_for_this_division")}
//               </p>
//               <Button onClick={handleAutoGenerate} disabled={isGenerating} size="lg" className="min-w-[200px]">
//                 {isGenerating ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     {t("generating_timetable")}
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="mr-2 h-5 w-5" />
//                     {t("generate_timetable")}
//                   </>
//                 )}
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Action buttons */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                   <span className="text-sm font-medium text-green-600">{t("timetable_generated_successfully")}</span>
//                   {editingMode && (
//                     <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
//                       {t("unsaved_changes")}
//                     </Badge>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Button variant="outline" size="sm" onClick={handleAutoGenerate} disabled={isGenerating}>
//                     {isGenerating ? (
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     ) : (
//                       <RotateCcw className="h-4 w-4 mr-2" />
//                     )}
//                     {t("regenerate")}
//                   </Button>

//                   {editingMode && (
//                     <Button variant="outline" size="sm" onClick={handleResetChanges}>
//                       <RotateCcw className="h-4 w-4 mr-2" />
//                       {t("reset_changes")}
//                     </Button>
//                   )}

//                   <Button variant="outline" size="sm" onClick={onCancel}>
//                     {t("cancel")}
//                   </Button>

//                   <Button onClick={handleSaveTimetable} disabled={isSaving} size="sm">
//                     {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
//                     {t("save_timetable")}
//                   </Button>
//                 </div>
//               </div>

//               {/* Timetable content */}
//               <Tabs value={activeDay} onValueChange={setActiveDay}>
//                 <div className="flex items-center justify-between mb-4">
//                   <TabsList>
//                     <TabsTrigger value="overview">{t("weekly_overview")}</TabsTrigger>
//                     {days.map((day) => {
//                       const dayConfig = getDayConfig(day.value)
//                       const dayTimetable = getDayTimetable(day.value)

//                       return (
//                         <TabsTrigger key={day.value} value={day.value} disabled={!dayConfig || !dayTimetable}>
//                           {day.label}
//                         </TabsTrigger>
//                       )
//                     })}
//                   </TabsList>
//                 </div>

//                 <TabsContent value="overview">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>{t("weekly_timetable_overview")}</CardTitle>
//                       <CardDescription>{t("complete_weekly_view_of_the_generated_timetable")}</CardDescription>
//                     </CardHeader>
//                     <CardContent>{renderWeeklyOverview()}</CardContent>
//                   </Card>
//                 </TabsContent>

//                 {days.map((day) => (
//                   <TabsContent key={day.value} value={day.value}>
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center space-x-2">
//                           <Edit className="h-5 w-5" />
//                           <span>
//                             {t("edit")} {day.label}
//                           </span>
//                         </CardTitle>
//                         <CardDescription>{t("customize_the_timetable_for_this_day")}</CardDescription>
//                       </CardHeader>
//                       <CardContent>{renderDayEditor(day.value)}</CardContent>
//                     </Card>
//                   </TabsContent>
//                 ))}
//               </Tabs>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }



// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   Loader2,
//   Calendar,
//   Edit,
//   Save,
//   RotateCcw,
//   BookOpen,
//   Users,
//   Dumbbell,
//   Coffee,
//   Beaker,
//   Clock,
//   Wand2,
//   CheckCircle,
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
// import { useLazyGetTeachingStaffQuery } from "@/services/StaffService"
// import {
//   useAutoGenerateTimeTableForWeekMutation,
//   useCreateDayWiseTimeTableForDivisonMutation,
//   useLazyFetchTimeTableConfigForDivisionQuery,
// } from "@/services/timetableService"
// import type { WeeklyTimeTableForDivision, TimeTableConfigForSchool, SubjectDivisionMaster } from "@/types/timetable"
// import type { StaffType } from "@/types/staff"

// interface AutoTimetableGeneratorProps {
//   divisionId: number
//   timetableConfig: TimeTableConfigForSchool
//   onSave: () => void
//   onCancel: () => void
// }

// export default function AutoTimetableGenerator({
//   divisionId,
//   timetableConfig,
//   onSave,
//   onCancel,
// }: AutoTimetableGeneratorProps) {
//   const { t } = useTranslation()
//   const { toast } = useToast()
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

//   // API hooks
//   const [autoGenerateTimeTable, { isLoading: isGenerating }] = useAutoGenerateTimeTableForWeekMutation()
//   const [createDayWiseTimeTable, { isLoading: isSaving }] = useCreateDayWiseTimeTableForDivisonMutation()
//   const [getSubjectsForDivision, { data: subjectsData }] = useLazyGetSubjectsForDivisionQuery()
//   const [getTeachingStaff, { data: staffData }] = useLazyGetTeachingStaffQuery()
//   const [fetchTimeTableConfig] = useLazyFetchTimeTableConfigForDivisionQuery()

//   // State management
//   const [generatedTimetable, setGeneratedTimetable] = useState<WeeklyTimeTableForDivision[]>([])
//   const [editingTimetable, setEditingTimetable] = useState<WeeklyTimeTableForDivision[]>([])
//   const [subjects, setSubjects] = useState<SubjectDivisionMaster[]>([])
//   const [staff, setStaff] = useState<StaffType[]>([])
//   const [activeDay, setActiveDay] = useState<string>("mon")
//   const [hasGenerated, setHasGenerated] = useState(false)
//   const [editingMode, setEditingMode] = useState(false)

//   // Days configuration
//   const days = [
//     { value: "mon", label: t("monday") },
//     { value: "tue", label: t("tuesday") },
//     { value: "wed", label: t("wednesday") },
//     { value: "thu", label: t("thursday") },
//     { value: "fri", label: t("friday") },
//     { value: "sat", label: t("saturday") },
//   ]

//   // Load subjects and staff data
//   useEffect(() => {
//     if (currentAcademicSession && divisionId) {
//       getSubjectsForDivision({
//         academic_session_id: currentAcademicSession.id,
//         division_id: divisionId,
//       })

//       getTeachingStaff({
//         academic_sessions: currentAcademicSession.id,
//       })
//     }
//   }, [currentAcademicSession, divisionId, getSubjectsForDivision, getTeachingStaff])

//   // Set subjects and staff when data is loaded
//   useEffect(() => {
//     if (subjectsData) {
//       setSubjects(subjectsData)
//     }
//     if (staffData) {
//       setStaff(staffData.data || [])
//     }
//   }, [subjectsData, staffData])

//   // Initialize editing timetable when generated timetable changes
//   useEffect(() => {
//     if (generatedTimetable.length > 0) {
//       setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
//     }
//   }, [generatedTimetable])

//   // Handle auto-generation
//   const handleAutoGenerate = async () => {
//     try {
//       const result = await autoGenerateTimeTable({ division_id: divisionId }).unwrap()
//       setGeneratedTimetable(result)
//       setHasGenerated(true)
//       setEditingMode(false)

//       toast({
//         title: t("success"),
//         description: t("timetable_generated_successfully"),
//       })
//     } catch (error: any) {
//       console.error("Error generating timetable:", error)
//       toast({
//         variant: "destructive",
//         title: t("error"),
//         description: error.data?.message || t("failed_to_generate_timetable"),
//       })
//     }
//   }

//   // Handle save timetable
//   const handleSaveTimetable = async () => {
//     try {
//       // Save each day's timetable
//       for (const dayTimetable of editingTimetable) {
//         const periodsPayload = {
//           class_day_config_id: dayTimetable.class_day_config_id,
//           division_id: divisionId,
//           periods: dayTimetable.periods.map((period) => ({
//             period_order: period.period_order,
//             start_time: period.start_time,
//             end_time: period.end_time,
//             is_break: period.is_break,
//             subjects_division_masters_id:
//               period.is_break || period.is_pt || period.is_free_period ? null : period.subjects_division_masters_id,
//             staff_enrollment_id:
//               period.is_break || period.is_pt || period.is_free_period ? null : period.staff_enrollment_id,
//             lab_id: period.lab_id,
//             is_pt: period.is_pt,
//             is_free_period: period.is_free_period,
//           })),
//         }

//         await createDayWiseTimeTable({ payload: periodsPayload }).unwrap()
//       }

//       toast({
//         title: t("success"),
//         description: t("timetable_saved_successfully"),
//       })

//       onSave()
//     } catch (error: any) {
//       console.error("Error saving timetable:", error)
//       toast({
//         variant: "destructive",
//         title: t("error"),
//         description: error.data?.message || t("failed_to_save_timetable"),
//       })
//     }
//   }

//   // Handle save individual day
//   const handleSaveDay = async (dayTimetable: WeeklyTimeTableForDivision) => {
//     try {
//       const periodsPayload = {
//         class_day_config_id: dayTimetable.class_day_config_id,
//         division_id: divisionId,
//         periods: dayTimetable.periods.map((period) => ({
//           period_order: period.period_order,
//           start_time: period.start_time,
//           end_time: period.end_time,
//           is_break: period.is_break,
//           subjects_division_masters_id:
//             period.is_break || period.is_pt || period.is_free_period ? null : period.subjects_division_masters_id,
//           staff_enrollment_id:
//             period.is_break || period.is_pt || period.is_free_period ? null : period.staff_enrollment_id,
//           lab_id: period.lab_id,
//           is_pt: period.is_pt,
//           is_free_period: period.is_free_period,
//         })),
//       }

//       await createDayWiseTimeTable({ payload: periodsPayload }).unwrap()

//       toast({
//         title: t("success"),
//         description: t("day_timetable_saved_successfully"),
//       })

//       return true
//     } catch (error: any) {
//       console.error("Error saving day timetable:", error)
//       toast({
//         variant: "destructive",
//         title: t("error"),
//         description: error.data?.message || t("failed_to_save_day_timetable"),
//       })
//       return false
//     }
//   }

//   // Reset to generated timetable
//   const handleResetChanges = () => {
//     setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
//     setEditingMode(false)
//     toast({
//       title: t("changes_reset"),
//       description: t("timetable_reset_to_generated_version"),
//     })
//   }

//   // Format time
//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(":")
//     const hour = Number.parseInt(hours, 10)
//     const ampm = hour >= 12 ? "PM" : "AM"
//     const formattedHour = hour % 12 || 12
//     return `${formattedHour}:${minutes} ${ampm}`
//   }

//   // Get day config by day value
//   const getDayConfig = (dayValue: string) => {
//     return timetableConfig.class_day_config.find((config) => config.day === dayValue)
//   }

//   // Get timetable for specific day
//   const getDayTimetable = (dayValue: string) => {
//     const dayConfig = getDayConfig(dayValue)
//     if (!dayConfig) return null

//     return editingTimetable.find((tt) => tt.class_day_config_id === dayConfig.id)
//   }

//   // Get subject name
//   const getSubjectName = (subjectId: number | null) => {
//     if (!subjectId) return t("no_subject")
//     const subject = subjects.find((s) => s.id === subjectId)
//     return subject ? subject.subject?.name || t("unknown_subject") : t("unknown_subject")
//   }

//   // Get subject code
//   const getSubjectCode = (subjectId: number | null) => {
//     if (!subjectId) return ""
//     const subject = subjects.find((s) => s.id === subjectId)
//     return subject ? subject.code_for_division || subject.subject?.code || "" : ""
//   }

//   // Get teacher name
//   const getTeacherName = (staffId: number | null) => {
//     if (!staffId) return t("no_teacher")
//     const teacher = staff.find((s) => s.staff_enrollment_id === staffId)
//     if (!teacher) return t("unknown_teacher")
//     return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
//   }

//   // Get lab name
//   const getLabName = (labId: number | null) => {
//     if (!labId) return null
//     const lab = timetableConfig.lab_config.find((lab) => lab.id === labId)
//     return lab ? lab.name : t("unknown_lab")
//   }

//   // Get period icon
//   const getPeriodIcon = (period: any) => {
//     if (period.is_break) return <Coffee className="h-4 w-4 text-amber-600" />
//     if (period.is_pt) return <Dumbbell className="h-4 w-4 text-purple-600" />
//     if (period.lab_id) return <Beaker className="h-4 w-4 text-blue-600" />
//     if (period.is_free_period) return <Clock className="h-4 w-4 text-gray-600" />
//     return <BookOpen className="h-4 w-4 text-green-600" />
//   }

//   // Get period background color
//   const getPeriodBgColor = (period: any) => {
//     if (period.is_break) return "bg-amber-50"
//     if (period.is_pt) return "bg-purple-50"
//     if (period.lab_id) return "bg-blue-50"
//     if (period.is_free_period) return "bg-gray-50"
//     return "bg-green-50"
//   }

//   // Get period type badge
//   const getPeriodTypeBadge = (period: any) => {
//     if (period.is_break) {
//       return (
//         <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
//           {t("break")}
//         </Badge>
//       )
//     }
//     if (period.is_pt) {
//       return (
//         <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
//           {t("pt")}
//         </Badge>
//       )
//     }
//     if (period.lab_id) {
//       return (
//         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//           {t("lab")}
//         </Badge>
//       )
//     }
//     if (period.is_free_period) {
//       return (
//         <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
//           {t("free")}
//         </Badge>
//       )
//     }
//     return (
//       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//         {t("regular")}
//       </Badge>
//     )
//   }

//   // Get subject options
//   const getSubjectOptions = () => {
//     if (!subjects) return []
//     return subjects.map((subject) => ({
//       value: subject.id.toString(),
//       label: subject.subject?.name || `Subject ${subject.id}`,
//       code: subject.code_for_division || subject.subject?.code,
//     }))
//   }

//   // Get staff options for a specific subject
//   const getStaffOptionsForSubject = (subjectId: number | null) => {
//     if (!subjects || !subjectId) return []
//     const subject = subjects.find((s) => s.id === subjectId)
//     if (!subject) return []

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

//   // Update period in editing timetable
//   const updatePeriod = (dayValue: string, periodIndex: number, field: string, value: any) => {
//     const dayConfig = getDayConfig(dayValue)
//     if (!dayConfig) return

//     setEditingTimetable((prev) => {
//       const newTimetable = [...prev]
//       const dayTimetableIndex = newTimetable.findIndex((tt) => tt.class_day_config_id === dayConfig.id)

//       if (dayTimetableIndex !== -1) {
//         const updatedPeriods = [...newTimetable[dayTimetableIndex].periods]
//         updatedPeriods[periodIndex] = {
//           ...updatedPeriods[periodIndex],
//           [field]: value,
//         }

//         // Reset teacher when subject changes
//         if (field === "subjects_division_masters_id") {
//           updatedPeriods[periodIndex].staff_enrollment_id = null
//         }

//         newTimetable[dayTimetableIndex] = {
//           ...newTimetable[dayTimetableIndex],
//           periods: updatedPeriods,
//         }

//         setEditingMode(true)
//       }

//       return newTimetable
//     })
//   }

//   // Render weekly overview
//   const renderWeeklyOverview = () => {
//     const maxPeriods = Math.max(
//       ...timetableConfig.class_day_config.map((config) => {
//         const dayTimetable = editingTimetable.find((tt) => tt.class_day_config_id === config.id)
//         return dayTimetable ? dayTimetable.periods.length : 0
//       }),
//     )

//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr>
//               <th className="border p-2 bg-muted font-medium text-left">{t("day")}</th>
//               {Array.from({ length: maxPeriods }, (_, i) => (
//                 <th key={i} className="border p-2 bg-muted font-medium text-center">
//                   {t("period")} {i + 1}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {days.map((day) => {
//               const dayConfig = getDayConfig(day.value)
//               const dayTimetable = getDayTimetable(day.value)

//               if (!dayConfig || !dayTimetable) return null

//               return (
//                 <tr key={day.value}>
//                   <th className="border p-2 bg-muted font-medium text-left">{day.label}</th>
//                   {Array.from({ length: maxPeriods }, (_, i) => {
//                     const period = dayTimetable.periods[i]

//                     if (!period) {
//                       return (
//                         <td key={i} className="border p-2 text-center text-muted-foreground text-sm">
//                           -
//                         </td>
//                       )
//                     }

//                     return (
//                       <td key={i} className={`border p-2 ${getPeriodBgColor(period)}`}>
//                         <div className="flex flex-col h-full min-h-[80px]">
//                           <div className="flex items-center justify-between mb-1">
//                             <div className="flex items-center space-x-1">
//                               {getPeriodIcon(period)}
//                               <span className="text-xs font-medium">
//                                 {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                               </span>
//                             </div>
//                             {getPeriodTypeBadge(period)}
//                           </div>

//                           {!period.is_break && (
//                             <>
//                               {period.subjects_division_masters_id && !period.is_free_period && (
//                                 <div className="text-sm font-medium">
//                                   {getSubjectName(period.subjects_division_masters_id)}
//                                   {getSubjectCode(period.subjects_division_masters_id) && (
//                                     <span className="text-xs text-muted-foreground ml-1">
//                                       ({getSubjectCode(period.subjects_division_masters_id)})
//                                     </span>
//                                   )}
//                                 </div>
//                               )}

//                               {period.staff_enrollment_id && !period.is_free_period && (
//                                 <div className="flex items-center space-x-1 mt-1">
//                                   <Users className="h-3 w-3 text-muted-foreground" />
//                                   <span className="text-xs text-muted-foreground">
//                                     {getTeacherName(period.staff_enrollment_id)}
//                                   </span>
//                                 </div>
//                               )}

//                               {period.lab_id && (
//                                 <div className="flex items-center space-x-1 mt-1">
//                                   <Beaker className="h-3 w-3 text-muted-foreground" />
//                                   <span className="text-xs text-muted-foreground">{getLabName(period.lab_id)}</span>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     )
//                   })}
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//     )
//   }

//   // Render day editor
//   const renderDayEditor = (dayValue: string) => {
//     const dayTimetable = getDayTimetable(dayValue)
//     if (!dayTimetable) return null

//     return (
//       <div className="space-y-4">
//         {/* Add save button for individual day */}
//         <div className="flex justify-end mb-4">
//           <Button size="sm" onClick={() => handleSaveDay(dayTimetable)} disabled={isSaving}>
//             {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
//             {t("save")} {days.find((d) => d.value === dayValue)?.label}
//           </Button>
//         </div>

//         {/* Rest of the existing day editor content */}
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("period")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("time")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("type")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("subject")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("teacher")}</th>
//                 <th className="border p-2 bg-muted font-medium text-center">{t("lab")}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dayTimetable.periods.map((period, index) => (
//                 <tr key={index} className={getPeriodBgColor(period)}>
//                   <td className="border p-2 text-center">{period.period_order}</td>
//                   <td className="border p-2 text-center">
//                     {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                   </td>
//                   <td className="border p-2 text-center">{getPeriodTypeBadge(period)}</td>
//                   <td className="border p-2 text-center">
//                     {!period.is_break && !period.is_pt && !period.is_free_period ? (
//                       <Select
//                         value={period.subjects_division_masters_id?.toString() || "none"}
//                         onValueChange={(value) =>
//                           updatePeriod(
//                             dayValue,
//                             index,
//                             "subjects_division_masters_id",
//                             value === "none" ? null : Number(value),
//                           )
//                         }
//                       >
//                         <SelectTrigger className="h-8 w-full">
//                           <SelectValue placeholder={t("select_subject")} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">{t("no_subject")}</SelectItem>
//                           {getSubjectOptions().map((option) => (
//                             <SelectItem key={option.value} value={option.value}>
//                               {option.label} {option.code ? `(${option.code})` : ""}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">-</span>
//                     )}
//                   </td>
//                   <td className="border p-2 text-center">
//                     {!period.is_break && !period.is_pt && !period.is_free_period ? (
//                       <Select
//                         value={period.staff_enrollment_id?.toString() || "none"}
//                         onValueChange={(value) =>
//                           updatePeriod(dayValue, index, "staff_enrollment_id", value === "none" ? null : Number(value))
//                         }
//                         disabled={!period.subjects_division_masters_id}
//                       >
//                         <SelectTrigger className="h-8 w-full">
//                           <SelectValue placeholder={t("select_teacher")} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">{t("no_teacher")}</SelectItem>
//                           {getStaffOptionsForSubject(period.subjects_division_masters_id).map((option) => (
//                             <SelectItem key={option.value} value={option.value}>
//                               {option.label} {option.code ? `(${option.code})` : ""}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">-</span>
//                     )}
//                   </td>
//                   <td className="border p-2 text-center">{period.lab_id ? getLabName(period.lab_id) : "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Wand2 className="h-5 w-5" />
//             <span>{t("automatic_timetable_generation")}</span>
//           </CardTitle>
//           <CardDescription>
//             {t("generate_and_customize_timetable_automatically_for_the_selected_division")}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {!hasGenerated ? (
//             <div className="text-center py-12">
//               <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
//                 <Calendar className="h-8 w-8 text-primary" />
//               </div>
//               <h3 className="text-lg font-medium mb-2">{t("ready_to_generate_timetable")}</h3>
//               <p className="text-muted-foreground max-w-md mx-auto mb-6">
//                 {t("click_the_button_below_to_automatically_generate_a_timetable_for_this_division")}
//               </p>
//               <Button onClick={handleAutoGenerate} disabled={isGenerating} size="lg" className="min-w-[200px]">
//                 {isGenerating ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     {t("generating_timetable")}
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="mr-2 h-5 w-5" />
//                     {t("generate_timetable")}
//                   </>
//                 )}
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Action buttons */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                   <span className="text-sm font-medium text-green-600">{t("timetable_generated_successfully")}</span>
//                   {editingMode && (
//                     <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
//                       {t("unsaved_changes")}
//                     </Badge>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Button variant="outline" size="sm" onClick={handleAutoGenerate} disabled={isGenerating}>
//                     {isGenerating ? (
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     ) : (
//                       <RotateCcw className="h-4 w-4 mr-2" />
//                     )}
//                     {t("regenerate")}
//                   </Button>

//                   {editingMode && (
//                     <Button variant="outline" size="sm" onClick={handleResetChanges}>
//                       <RotateCcw className="h-4 w-4 mr-2" />
//                       {t("reset_changes")}
//                     </Button>
//                   )}

//                   <Button variant="outline" size="sm" onClick={onCancel}>
//                     {t("cancel")}
//                   </Button>

//                   <Button onClick={handleSaveTimetable} disabled={isSaving} size="sm">
//                     {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
//                     {t("save_timetable")}
//                   </Button>
//                 </div>
//               </div>

//               {/* Timetable content */}
//               <Tabs value={activeDay} onValueChange={setActiveDay}>
//                 <div className="flex items-center justify-between mb-4">
//                   <TabsList>
//                     <TabsTrigger value="overview">{t("weekly_overview")}</TabsTrigger>
//                     {days.map((day) => {
//                       const dayConfig = getDayConfig(day.value)
//                       const dayTimetable = getDayTimetable(day.value)

//                       return (
//                         <TabsTrigger key={day.value} value={day.value} disabled={!dayConfig || !dayTimetable}>
//                           {day.label}
//                         </TabsTrigger>
//                       )
//                     })}
//                   </TabsList>
//                 </div>

//                 <TabsContent value="overview">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>{t("weekly_timetable_overview")}</CardTitle>
//                       <CardDescription>{t("complete_weekly_view_of_the_generated_timetable")}</CardDescription>
//                     </CardHeader>
//                     <CardContent>{renderWeeklyOverview()}</CardContent>
//                   </Card>
//                 </TabsContent>

//                 {days.map((day) => (
//                   <TabsContent key={day.value} value={day.value}>
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center space-x-2">
//                           <Edit className="h-5 w-5" />
//                           <span>
//                             {t("edit")} {day.label}
//                           </span>
//                         </CardTitle>
//                         <CardDescription>{t("customize_the_timetable_for_this_day")}</CardDescription>
//                       </CardHeader>
//                       <CardContent>{renderDayEditor(day.value)}</CardContent>
//                     </Card>
//                   </TabsContent>
//                 ))}
//               </Tabs>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Calendar,
  Edit,
  Save,
  RotateCcw,
  BookOpen,
  Users,
  Dumbbell,
  Coffee,
  Beaker,
  Clock,
  Wand2,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
import { useLazyGetTeachingStaffQuery } from "@/services/StaffService"
import {
  useAutoGenerateTimeTableForWeekMutation,
  useCreateDayWiseTimeTableForDivisonMutation,
  useLazyFetchTimeTableConfigForDivisionQuery,
} from "@/services/timetableService"
import type { WeeklyTimeTableForDivision, TimeTableConfigForSchool, SubjectDivisionMaster } from "@/types/subjects"
import type { StaffType } from "@/types/staff"

interface AutoTimetableGeneratorProps {
  divisionId: number
  timetableConfig: TimeTableConfigForSchool
  onSave: () => void
  onCancel: () => void
}

export default function AutoTimetableGenerator({
  divisionId,
  timetableConfig,
  onSave,
  onCancel,
}: AutoTimetableGeneratorProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // API hooks
  const [autoGenerateTimeTable, { isLoading: isGenerating }] = useAutoGenerateTimeTableForWeekMutation()
  const [createDayWiseTimeTable, { isLoading: isSaving }] = useCreateDayWiseTimeTableForDivisonMutation()
  const [getSubjectsForDivision, { data: subjectsData }] = useLazyGetSubjectsForDivisionQuery()
  const [getTeachingStaff, { data: staffData }] = useLazyGetTeachingStaffQuery()
  const [fetchTimeTableConfig] = useLazyFetchTimeTableConfigForDivisionQuery()

  // State management
  const [generatedTimetable, setGeneratedTimetable] = useState<WeeklyTimeTableForDivision[]>([])
  const [editingTimetable, setEditingTimetable] = useState<WeeklyTimeTableForDivision[]>([])
  const [subjects, setSubjects] = useState<SubjectDivisionMaster[]>([])
  const [staff, setStaff] = useState<StaffType[]>([])
  const [activeDay, setActiveDay] = useState<string>("mon")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [editingMode, setEditingMode] = useState(false)

  // Days configuration
  const days = [
    { value: "mon", label: t("monday") },
    { value: "tue", label: t("tuesday") },
    { value: "wed", label: t("wednesday") },
    { value: "thu", label: t("thursday") },
    { value: "fri", label: t("friday") },
    { value: "sat", label: t("saturday") },
  ]

  // Load subjects and staff data
  useEffect(() => {
    if (currentAcademicSession && divisionId) {
      getSubjectsForDivision({
        academic_session_id: currentAcademicSession.id,
        division_id: divisionId,
      })

      getTeachingStaff({
        academic_sessions: currentAcademicSession.id,
      })
    }
  }, [currentAcademicSession, divisionId, getSubjectsForDivision, getTeachingStaff])

  // Set subjects and staff when data is loaded
  useEffect(() => {
    if (subjectsData) {
      setSubjects(subjectsData)
    }
    if (staffData) {
      setStaff(staffData.data || [])
    }
  }, [subjectsData, staffData])

  // Initialize editing timetable when generated timetable changes
  useEffect(() => {
    if (generatedTimetable.length > 0) {
      setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
    }
  }, [generatedTimetable])

  // Handle auto-generation
  const handleAutoGenerate = async () => {
    try {
      const result = await autoGenerateTimeTable({ division_id: divisionId ,academic_session_id : currentAcademicSession!.id }).unwrap()
      setGeneratedTimetable(result.timetable)
      setHasGenerated(true)
      setEditingMode(false)

      toast({
        title: t("success"),
        description: t("timetable_generated_successfully"),
      })
    } catch (error: any) {
      console.error("Error generating timetable:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.data?.message || t("failed_to_generate_timetable"),
      })
    }
  }

  // Handle save timetable
  const handleSaveTimetable = async () => {
    try {
      // Save each day's timetable
      for (const dayTimetable of editingTimetable) {
        const periodsPayload = {
          class_day_config_id: dayTimetable.class_day_config_id,
          division_id: divisionId,
          periods: dayTimetable.periods.map((period) => ({
            period_order: period.period_order,
            start_time: period.start_time,
            end_time: period.end_time,
            is_break: period.is_break,
            subjects_division_masters_id:
              period.is_break || period.is_pt || period.is_free_period ? null : period.subjects_division_masters_id,
            staff_enrollment_id:
              period.is_break || period.is_pt || period.is_free_period ? null : period.staff_enrollment_id,
            lab_id: period.lab_id,
            is_pt: period.is_pt,
            is_free_period: period.is_free_period,
          })),
        }

        await createDayWiseTimeTable({ payload: periodsPayload }).unwrap()
      }

      toast({
        title: t("success"),
        description: t("timetable_saved_successfully"),
      })

      onSave()
    } catch (error: any) {
      console.error("Error saving timetable:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.data?.message || t("failed_to_save_timetable"),
      })
    }
  }

  // Handle save individual day
  const handleSaveDay = async (dayTimetable: WeeklyTimeTableForDivision) => {
    try {
      const periodsPayload = {
        class_day_config_id: dayTimetable.class_day_config_id,
        division_id: divisionId,
        periods: dayTimetable.periods.map((period) => ({
          period_order: period.period_order,
          start_time: period.start_time,
          end_time: period.end_time,
          is_break: period.is_break,
          subjects_division_masters_id:
            period.is_break || period.is_pt || period.is_free_period ? null : period.subjects_division_masters_id,
          staff_enrollment_id:
            period.is_break || period.is_pt || period.is_free_period ? null : period.staff_enrollment_id,
          lab_id: period.lab_id,
          is_pt: period.is_pt,
          is_free_period: period.is_free_period,
        })),
      }

      await createDayWiseTimeTable({ payload: periodsPayload }).unwrap()

      toast({
        title: t("success"),
        description: t("day_timetable_saved_successfully"),
      })

      return true
    } catch (error: any) {
      console.error("Error saving day timetable:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.data?.message || t("failed_to_save_day_timetable"),
      })
      return false
    }
  }

  // Reset to generated timetable
  const handleResetChanges = () => {
    setEditingTimetable(JSON.parse(JSON.stringify(generatedTimetable)))
    setEditingMode(false)
    toast({
      title: t("changes_reset"),
      description: t("timetable_reset_to_generated_version"),
    })
  }

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  // Get day config by day value
  const getDayConfig = (dayValue: string) => {
    return timetableConfig.class_day_config.find((config) => config.day === dayValue)
  }

  // Get timetable for specific day
  const getDayTimetable = (dayValue: string) => {
    const dayConfig = getDayConfig(dayValue)
    if (!dayConfig) return null

    return editingTimetable.find((tt) => tt.class_day_config_id === dayConfig.id)
  }

  // Get subject name
  const getSubjectName = (subjectId: number | null) => {
    if (!subjectId) return t("no_subject")
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.subject?.name || t("unknown_subject") : t("unknown_subject")
  }

  // Get subject code
  const getSubjectCode = (subjectId: number | null) => {
    if (!subjectId) return ""
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.code_for_division || subject.subject?.code || "" : ""
  }

  // Get teacher name
  const getTeacherName = (staffId: number | null) => {
    if (!staffId) return t("no_teacher")
    const teacher = staff.find((s) => s.staff_enrollment_id === staffId)
    if (!teacher) return t("unknown_teacher")
    return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
  }

  // Get lab name
  const getLabName = (labId: number | null) => {
    if (!labId) return null
    const lab = timetableConfig.lab_config.find((lab) => lab.id === labId)
    return lab ? lab.name : t("unknown_lab")
  }

  // Get period icon
  const getPeriodIcon = (period: any) => {
    if (period.is_break) return <Coffee className="h-4 w-4 text-amber-600" />
    if (period.is_pt) return <Dumbbell className="h-4 w-4 text-purple-600" />
    if (period.lab_id) return <Beaker className="h-4 w-4 text-blue-600" />
    if (period.is_free_period) return <Clock className="h-4 w-4 text-gray-600" />
    return <BookOpen className="h-4 w-4 text-green-600" />
  }

  // Get period background color
  const getPeriodBgColor = (period: any) => {
    if (period.is_break) return "bg-amber-50"
    if (period.is_pt) return "bg-purple-50"
    if (period.lab_id) return "bg-blue-50"
    if (period.is_free_period) return "bg-gray-50"
    return "bg-green-50"
  }

  // Get period type badge
  const getPeriodTypeBadge = (period: any) => {
    if (period.is_break) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {t("break")}
        </Badge>
      )
    }
    if (period.is_pt) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {t("pt")}
        </Badge>
      )
    }
    if (period.lab_id) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {t("lab")}
        </Badge>
      )
    }
    if (period.is_free_period) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {t("free")}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {t("regular")}
      </Badge>
    )
  }

  // Get subject options
  const getSubjectOptions = () => {
    if (!subjects) return []
    return subjects.map((subject) => ({
      value: subject.id.toString(),
      label: subject.subject?.name || `Subject ${subject.id}`,
      code: subject.code_for_division || subject.subject?.code,
    }))
  }

  // Get staff options for a specific subject
  const getStaffOptionsForSubject = (subjectId: number | null) => {
    if (!subjects || !subjectId) return []
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) return []

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

  // Update period in editing timetable
  const updatePeriod = (dayValue: string, periodIndex: number, field: string, value: any) => {
    const dayConfig = getDayConfig(dayValue)
    if (!dayConfig) return

    setEditingTimetable((prev) => {
      const newTimetable = [...prev]
      const dayTimetableIndex = newTimetable.findIndex((tt) => tt.class_day_config_id === dayConfig.id)

      if (dayTimetableIndex !== -1) {
        const updatedPeriods = [...newTimetable[dayTimetableIndex].periods]
        updatedPeriods[periodIndex] = {
          ...updatedPeriods[periodIndex],
          [field]: value,
        }

        // Reset teacher when subject changes
        if (field === "subjects_division_masters_id") {
          updatedPeriods[periodIndex].staff_enrollment_id = null
        }

        newTimetable[dayTimetableIndex] = {
          ...newTimetable[dayTimetableIndex],
          periods: updatedPeriods,
        }

        setEditingMode(true)
      }

      return newTimetable
    })
  }

  // Render weekly overview
  const renderWeeklyOverview = () => {
    const maxPeriods = Math.max(
      ...timetableConfig.class_day_config.map((config) => {
        const dayTimetable = editingTimetable.find((tt) => tt.class_day_config_id === config.id)
        return dayTimetable ? dayTimetable.periods.length : 0
      }),
    )

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-muted font-medium text-left">{t("day")}</th>
              {Array.from({ length: maxPeriods }, (_, i) => (
                <th key={i} className="border p-2 bg-muted font-medium text-center">
                  {t("period")} {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const dayConfig = getDayConfig(day.value)
              const dayTimetable = getDayTimetable(day.value)

              if (!dayConfig || !dayTimetable) return null

              return (
                <tr key={day.value}>
                  <th className="border p-2 bg-muted font-medium text-left">{day.label}</th>
                  {Array.from({ length: maxPeriods }, (_, i) => {
                    const period = dayTimetable.periods[i]

                    if (!period) {
                      return (
                        <td key={i} className="border p-2 text-center text-muted-foreground text-sm">
                          -
                        </td>
                      )
                    }

                    return (
                      <td key={i} className={`border p-2 ${getPeriodBgColor(period)}`}>
                        <div className="flex flex-col h-full min-h-[80px]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              {getPeriodIcon(period)}
                              <span className="text-xs font-medium">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </span>
                            </div>
                            {getPeriodTypeBadge(period)}
                          </div>

                          {!period.is_break && (
                            <>
                              {period.subjects_division_masters_id && !period.is_free_period && (
                                <div className="text-sm font-medium">
                                  {getSubjectName(period.subjects_division_masters_id)}
                                  {getSubjectCode(period.subjects_division_masters_id) && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({getSubjectCode(period.subjects_division_masters_id)})
                                    </span>
                                  )}
                                </div>
                              )}

                              {period.staff_enrollment_id && !period.is_free_period && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {getTeacherName(period.staff_enrollment_id)}
                                  </span>
                                </div>
                              )}

                              {period.lab_id && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Beaker className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{getLabName(period.lab_id)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Render day editor
  const renderDayEditor = (dayValue: string) => {
    const dayTimetable = getDayTimetable(dayValue)
    if (!dayTimetable) return null

    return (
      <div className="space-y-4">
        {/* Add save button for individual day */}
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => handleSaveDay(dayTimetable)} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {t("save")} {days.find((d) => d.value === dayValue)?.label}
          </Button>
        </div>

        {/* Rest of the existing day editor content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted font-medium text-center">{t("period")}</th>
                <th className="border p-2 bg-muted font-medium text-center">{t("time")}</th>
                <th className="border p-2 bg-muted font-medium text-center">{t("type")}</th>
                <th className="border p-2 bg-muted font-medium text-center">{t("subject")}</th>
                <th className="border p-2 bg-muted font-medium text-center">{t("teacher")}</th>
                <th className="border p-2 bg-muted font-medium text-center">{t("lab")}</th>
              </tr>
            </thead>
            <tbody>
              {dayTimetable.periods.map((period, index) => (
                <tr key={index} className={getPeriodBgColor(period)}>
                  <td className="border p-2 text-center">{period.period_order}</td>
                  <td className="border p-2 text-center">
                    {formatTime(period.start_time)} - {formatTime(period.end_time)}
                  </td>
                  <td className="border p-2 text-center">{getPeriodTypeBadge(period)}</td>
                  <td className="border p-2 text-center">
                    {!period.is_break && !period.is_pt && !period.is_free_period ? (
                      <Select
                        value={period.subjects_division_masters_id?.toString() || "none"}
                        onValueChange={(value) =>
                          updatePeriod(
                            dayValue,
                            index,
                            "subjects_division_masters_id",
                            value === "none" ? null : Number(value),
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={t("select_subject")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("no_subject")}</SelectItem>
                          {getSubjectOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label} {option.code ? `(${option.code})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {!period.is_break && !period.is_pt && !period.is_free_period ? (
                      <Select
                        value={period.staff_enrollment_id?.toString() || "none"}
                        onValueChange={(value) =>
                          updatePeriod(dayValue, index, "staff_enrollment_id", value === "none" ? null : Number(value))
                        }
                        disabled={!period.subjects_division_masters_id}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={t("select_teacher")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("no_teacher")}</SelectItem>
                          {getStaffOptionsForSubject(period.subjects_division_masters_id).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label} {option.code ? `(${option.code})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="border p-2 text-center">{period.lab_id ? getLabName(period.lab_id) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <span>{t("automatic_timetable_generation")}</span>
          </CardTitle>
          <CardDescription>
            {t("generate_and_customize_timetable_automatically_for_the_selected_division")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasGenerated ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("ready_to_generate_timetable")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {t("click_the_button_below_to_automatically_generate_a_timetable_for_this_division")}
              </p>
              <Button onClick={handleAutoGenerate} disabled={isGenerating} size="lg" className="min-w-[200px]">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("generating_timetable")}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    {t("generate_timetable")}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{t("timetable_generated_successfully")}</span>
                  {editingMode && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {t("unsaved_changes")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleAutoGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {t("regenerate")}
                  </Button>

                  {editingMode && (
                    <Button variant="outline" size="sm" onClick={handleResetChanges}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("reset_changes")}
                    </Button>
                  )}

                  <Button variant="outline" size="sm" onClick={onCancel}>
                    {t("cancel")}
                  </Button>

                  <Button onClick={handleSaveTimetable} disabled={isSaving} size="sm">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {t("save_timetable")}
                  </Button>
                </div>
              </div>

              {/* Timetable content */}
              <Tabs value={activeDay} onValueChange={setActiveDay}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="overview">{t("weekly_overview")}</TabsTrigger>
                    {days.map((day) => {
                      const dayConfig = getDayConfig(day.value)
                      const dayTimetable = getDayTimetable(day.value)

                      return (
                        <TabsTrigger key={day.value} value={day.value} disabled={!dayConfig || !dayTimetable}>
                          {day.label}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("weekly_timetable_overview")}</CardTitle>
                      <CardDescription>{t("complete_weekly_view_of_the_generated_timetable")}</CardDescription>
                    </CardHeader>
                    <CardContent>{renderWeeklyOverview()}</CardContent>
                  </Card>
                </TabsContent>

                {days.map((day) => (
                  <TabsContent key={day.value} value={day.value}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Edit className="h-5 w-5" />
                          <span>
                            {t("edit")} {day.label}
                          </span>
                        </CardTitle>
                        <CardDescription>{t("customize_the_timetable_for_this_day")}</CardDescription>
                      </CardHeader>
                      <CardContent>{renderDayEditor(day.value)}</CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
