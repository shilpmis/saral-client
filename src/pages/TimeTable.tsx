
// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Label } from "@/components/ui/label"
// import { Loader2, AlertCircle, Calendar, Edit, Info, Eye } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { selectAcademicClasses } from "@/redux/slices/academicSlice"
// import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
// import { useLazyFetchTimeTableConfigForDivisionQuery } from "@/services/timetableService"
// import TimetableDisplay from "@/components/TimeTable/TimetableDisplay"
// import TimetableGenerator from "@/components/TimeTable/TimetableGenerator"
// import TimetableWeekView from "@/components/TimeTable/TimetableWeekView"

// export default function TimetableManagement() {
//   const { t } = useTranslation()
//   const { toast } = useToast()
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
//   const academicClasses = useAppSelector(selectAcademicClasses)
//   const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
//   const [fetchTimeTableConfig, { data: timetableConfig, isLoading, error }] =
//     useLazyFetchTimeTableConfigForDivisionQuery()

//   const [selectedClass, setSelectedClass] = useState<string>("")
//   const [selectedDivision, setSelectedDivision] = useState<string>("")
//   const [activeDay, setActiveDay] = useState<string>("mon")
//   const [isEditing, setIsEditing] = useState(false)
//   const [viewMode, setViewMode] = useState<"day" | "week">("day")

//   // Load academic classes if not already loaded
//   useEffect(() => {
//     if (!academicClasses && currentAcademicSession) {
//       getAcademicClasses(currentAcademicSession.school_id)
//     }
//   }, [academicClasses, currentAcademicSession, getAcademicClasses])

//   // Fetch timetable config when class and division are selected
//   useEffect(() => {
//     if (selectedClass && selectedDivision && currentAcademicSession) {
//       fetchTimeTableConfig({
//         academic_session_id: currentAcademicSession.id,
//         division_id: Number(selectedDivision),
//       })
//     }
//   }, [selectedClass, selectedDivision, currentAcademicSession, fetchTimeTableConfig])

//   // Handle class change
//   const handleClassChange = (value: string) => {
//     setSelectedClass(value)
//     setSelectedDivision("")
//   }

//   // Handle division change
//   const handleDivisionChange = (value: string) => {
//     setSelectedDivision(value)
//   }

//   // Toggle edit mode
//   const toggleEditMode = () => {
//     setIsEditing(!isEditing)
//   }

//   // Get filtered divisions based on selected class
//   const filteredDivisions = academicClasses
//     ? academicClasses.find((cls) => cls.id.toString() === selectedClass)?.divisions || []
//     : []

//   // Check if timetable configuration exists for the selected class
//   const hasClassDayConfig = timetableConfig?.class_day_config && timetableConfig.class_day_config.length > 0

//   // Check if periods are configured for the selected division
//   const hasPeriodConfig =
//     hasClassDayConfig &&
//     timetableConfig?.class_day_config.some(
//       (config) =>
//         config.period_config && config.period_config.some((period) => period.division_id === Number(selectedDivision)),
//     )

//   // Get days of the week
//   const days = [
//     { value: "mon", label: t("monday") },
//     { value: "tue", label: t("tuesday") },
//     { value: "wed", label: t("wednesday") },
//     { value: "thu", label: t("thursday") },
//     { value: "fri", label: t("friday") },
//     { value: "sat", label: t("saturday") },
//   ]

//   // Get current day config
//   const currentDayConfig = hasClassDayConfig
//     ? timetableConfig?.class_day_config.find((config) => config.day === activeDay)
//     : null

//   // Check if academic session is available
//   if (!currentAcademicSession) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="h-5 w-5" />
//         <AlertTitle>{t("no_academic_session")}</AlertTitle>
//         <AlertDescription>{t("please_select_an_active_academic_session")}</AlertDescription>
//       </Alert>
//     )
//   }

//   // If no classes are available, show a message
//   if (!academicClasses || academicClasses.length === 0) {
//     return (
//       <Alert>
//         <Info className="h-5 w-5" />
//         <AlertTitle>{t("no_classes_available")}</AlertTitle>
//         <AlertDescription>{t("please_create_academic_classes_first")}</AlertDescription>
//       </Alert>
//     )
//   }

//   return (
//     <div className="container mx-auto py-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>{t("timetable_management")}</CardTitle>
//           <CardDescription>{t("create_and_manage_timetables_for_classes_and_divisions")}</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Class and Division Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             <div>
//               <Label htmlFor="class-select">{t("class")}</Label>
//               <Select value={selectedClass} onValueChange={handleClassChange}>
//                 <SelectTrigger id="class-select">
//                   <SelectValue placeholder={t("select_class")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {academicClasses?.map((cls) => (
//                     <SelectItem key={cls.id} value={cls.id.toString()}>
//                       Class {cls.class}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="division-select">{t("division")}</Label>
//               <Select
//                 value={selectedDivision}
//                 onValueChange={handleDivisionChange}
//                 disabled={!filteredDivisions.length}
//               >
//                 <SelectTrigger id="division-select">
//                   <SelectValue placeholder={t("select_division")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredDivisions.map((division) => (
//                     <SelectItem key={division.id} value={division.id.toString()}>
//                       {division.division} {division.aliases ? `- ${division.aliases}` : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Loading State */}
//           {isLoading && (
//             <div className="flex justify-center items-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           )}

//           {/* Error State */}
//           {error && ((error as any)?.status !== 404) && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-5 w-5" />
//               <AlertTitle>{t("error")}</AlertTitle>
//               <AlertDescription>{t("failed_to_load_timetable_configuration")}</AlertDescription>
//             </Alert>
//           )}

//           {/* No Selection State */}
//           {!selectedClass || !selectedDivision ? (
//             !isLoading && (
//               <div className="text-center py-12 border rounded-md">
//                 <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
//                   <Calendar className="h-6 w-6 text-muted-foreground" />
//                 </div>
//                 <h3 className="text-lg font-medium mb-1">{t("no_selection")}</h3>
//                 <p className="text-muted-foreground max-w-md mx-auto mb-4">
//                   {t("please_select_a_class_and_division_to_view_or_create_a_timetable")}
//                 </p>
//               </div>
//             )
//           ) : (
//             <>
//               {/* No Class Day Config Warning */}
//               {!hasClassDayConfig && !isLoading && (
//                 <Alert variant="destructive" className="mb-6">
//                   <AlertCircle className="h-5 w-5" />
//                   <AlertTitle>{t("timetable_configuration_missing")}</AlertTitle>
//                   <AlertDescription>
//                     {t("please_configure_the_timetable_settings_for_this_class_first")}
//                   </AlertDescription>
//                 </Alert>
//               )}

//               {/* Timetable Content */}
//               {hasClassDayConfig && !isLoading && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-medium">
//                       {t("timetable_for")} Class{" "}
//                       {academicClasses.find((cls) => cls.id.toString() === selectedClass)?.class}{" "}
//                       {filteredDivisions.find((div) => div.id.toString() === selectedDivision)?.division}
//                     </h3>

//                     <div className="flex items-center space-x-2">
//                       {hasPeriodConfig && (
//                         <>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setViewMode(viewMode === "day" ? "week" : "day")}
//                           >
//                             <Eye className="h-4 w-4 mr-2" />
//                             {viewMode === "day" ? t("week_view") : t("day_view")}
//                           </Button>
//                           {!isEditing && (
//                             <Button variant="outline" size="sm" onClick={toggleEditMode}>
//                               <Edit className="h-4 w-4 mr-2" />
//                               {t("edit_timetable")}
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   {viewMode === "week" && hasPeriodConfig ? (
//                     <TimetableWeekView
//                       timetableConfig={timetableConfig}
//                       divisionId={Number(selectedDivision)}
//                       days={days}
//                     />
//                   ) : (
//                     <Tabs value={activeDay} onValueChange={setActiveDay}>
//                       <TabsList className="mb-6">
//                         {days.map((day) => {
//                           // Check if this day is configured
//                           const isDayConfigured = timetableConfig?.class_day_config.some(
//                             (config) => config.day === day.value,
//                           )

//                           return (
//                             <TabsTrigger key={day.value} value={day.value} disabled={!isDayConfigured}>
//                               {day.label}
//                             </TabsTrigger>
//                           )
//                         })}
//                       </TabsList>

//                       {days.map((day) => {
//                         const dayConfig = timetableConfig?.class_day_config.find((config) => config.day === day.value)

//                         return (
//                           <TabsContent key={day.value} value={day.value}>
//                             {dayConfig ? (
//                               hasPeriodConfig && !isEditing ? (
//                                 <TimetableDisplay
//                                   dayConfig={dayConfig}
//                                   divisionId={Number(selectedDivision)}
//                                   timetableConfig={timetableConfig}
//                                 />
//                               ) : (
//                                 <TimetableGenerator
//                                   dayConfig={dayConfig}
//                                   divisionId={Number(selectedDivision)}
//                                   timetableConfig={timetableConfig}
//                                   onSave={() => {
//                                     setIsEditing(false)
//                                     fetchTimeTableConfig({
//                                       academic_session_id: currentAcademicSession.id,
//                                       division_id: Number(selectedDivision),
//                                     })
//                                   }}
//                                 />
//                               )
//                             ) : (
//                               <div className="text-center py-8 border rounded-md">
//                                 <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
//                                   <Info className="h-6 w-6 text-muted-foreground" />
//                                 </div>
//                                 <h3 className="text-lg font-medium mb-1">
//                                   {t("no_configuration_for")} {day.label}
//                                 </h3>
//                                 <p className="text-muted-foreground max-w-md mx-auto mb-4">
//                                   {t("this_day_is_not_configured_in_the_timetable_settings")}
//                                 </p>
//                               </div>
//                             )}
//                           </TabsContent>
//                         )
//                       })}
//                     </Tabs>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }



"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Calendar, Edit, Info, Eye, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { useLazyFetchTimeTableConfigForDivisionQuery } from "@/services/timetableService"
import TimetableDisplay from "@/components/TimeTable/TimetableDisplay"
import TimetableGenerator from "@/components/TimeTable/TimetableGenerator"
import TimetableWeekView from "@/components/TimeTable/TimetableWeekView"
import AutoTimetableGenerator from "@/components/TimeTable/AutoTimetableGenerator"

export default function TimetableManagement() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const academicClasses = useAppSelector(selectAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [fetchTimeTableConfig, { data: timetableConfig, isLoading, error }] =
    useLazyFetchTimeTableConfigForDivisionQuery()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [activeDay, setActiveDay] = useState<string>("mon")
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)

  // Load academic classes if not already loaded
  useEffect(() => {
    if (!academicClasses && currentAcademicSession) {
      getAcademicClasses(currentAcademicSession.school_id)
    }
  }, [academicClasses, currentAcademicSession, getAcademicClasses])

  // Fetch timetable config when class and division are selected
  useEffect(() => {
    if (selectedClass && selectedDivision && currentAcademicSession) {
      fetchTimeTableConfig({
        academic_session_id: currentAcademicSession.id,
        division_id: Number(selectedDivision),
      })
    }
  }, [selectedClass, selectedDivision, currentAcademicSession, fetchTimeTableConfig])

  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setSelectedDivision("")
  }

  // Handle division change
  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value)
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  // Get filtered divisions based on selected class
  const filteredDivisions = academicClasses
    ? academicClasses.find((cls) => cls.id.toString() === selectedClass)?.divisions || []
    : []

  // Check if timetable configuration exists for the selected class
  const hasClassDayConfig = timetableConfig?.class_day_config && timetableConfig.class_day_config.length > 0

  // Check if periods are configured for the selected division
  const hasPeriodConfig =
    hasClassDayConfig &&
    timetableConfig?.class_day_config.some(
      (config) =>
        config.period_config && config.period_config.some((period) => period.division_id === Number(selectedDivision)),
    )

  // Get days of the week
  const days = [
    { value: "mon", label: t("monday") },
    { value: "tue", label: t("tuesday") },
    { value: "wed", label: t("wednesday") },
    { value: "thu", label: t("thursday") },
    { value: "fri", label: t("friday") },
    { value: "sat", label: t("saturday") },
  ]

  // Get current day config
  const currentDayConfig = hasClassDayConfig
    ? timetableConfig?.class_day_config.find((config) => config.day === activeDay)
    : null

  // Check if academic session is available
  if (!currentAcademicSession) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>{t("no_academic_session")}</AlertTitle>
        <AlertDescription>{t("please_select_an_active_academic_session")}</AlertDescription>
      </Alert>
    )
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

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("timetable_management")}</CardTitle>
          <CardDescription>{t("create_and_manage_timetables_for_classes_and_divisions")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class and Division Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="class-select">{t("class")}</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder={t("select_class")} />
                </SelectTrigger>
                <SelectContent>
                  {academicClasses?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      Class {cls.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="division-select">{t("division")}</Label>
              <Select
                value={selectedDivision}
                onValueChange={handleDivisionChange}
                disabled={!filteredDivisions.length}
              >
                <SelectTrigger id="division-select">
                  <SelectValue placeholder={t("select_division")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDivisions.map((division) => (
                    <SelectItem key={division.id} value={division.id.toString()}>
                      {division.division} {division.aliases ? `- ${division.aliases}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && ((error as any)?.status !== 404) && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{t("failed_to_load_timetable_configuration")}</AlertDescription>
            </Alert>
          )}

          {/* No Selection State */}
          {!selectedClass || !selectedDivision ? (
            !isLoading && (
              <div className="text-center py-12 border rounded-md">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t("no_selection")}</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  {t("please_select_a_class_and_division_to_view_or_create_a_timetable")}
                </p>
              </div>
            )
          ) : (
            <>
              {/* Auto Generation Option - Show when class day config exists but no periods configured */}
              {hasClassDayConfig && !hasPeriodConfig && !isLoading && !isAutoGenerating && (
                <div className="text-center py-12 border rounded-md">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{t("no_timetable_found")}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {t("no_periods_configured_for_this_division_you_can_create_manually_or_auto_generate")}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="outline" onClick={toggleEditMode}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("create_manually")}
                    </Button>
                    <Button onClick={() => setIsAutoGenerating(true)}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      {t("auto_generate_timetable")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Auto Timetable Generator */}
              {isAutoGenerating && hasClassDayConfig && (
                <AutoTimetableGenerator
                  divisionId={Number(selectedDivision)}
                  timetableConfig={timetableConfig}
                  onSave={() => {
                    setIsAutoGenerating(false)
                    fetchTimeTableConfig({
                      academic_session_id: currentAcademicSession.id,
                      division_id: Number(selectedDivision),
                    })
                  }}
                  onCancel={() => setIsAutoGenerating(false)}
                />
              )}

              {/* Regular Timetable Content - Show when periods exist and not auto-generating */}
              {hasClassDayConfig && hasPeriodConfig && !isLoading && !isAutoGenerating && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t("timetable_for")} Class{" "}
                      {academicClasses.find((cls) => cls.id.toString() === selectedClass)?.class}{" "}
                      {filteredDivisions.find((div) => div.id.toString() === selectedDivision)?.division}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === "day" ? "week" : "day")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {viewMode === "day" ? t("week_view") : t("day_view")}
                      </Button>
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={toggleEditMode}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("edit_timetable")}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setIsAutoGenerating(true)}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        {t("regenerate_timetable")}
                      </Button>
                    </div>
                  </div>

                  {/* Rest of the existing timetable content */}
                  {viewMode === "week" && hasPeriodConfig ? (
                    <TimetableWeekView
                      timetableConfig={timetableConfig}
                      divisionId={Number(selectedDivision)}
                      days={days}
                    />
                  ) : (
                    <Tabs value={activeDay} onValueChange={setActiveDay}>
                      <TabsList className="mb-6">
                        {days.map((day) => {
                          const isDayConfigured = timetableConfig?.class_day_config.some(
                            (config) => config.day === day.value,
                          )

                          return (
                            <TabsTrigger key={day.value} value={day.value} disabled={!isDayConfigured}>
                              {day.label}
                            </TabsTrigger>
                          )
                        })}
                      </TabsList>

                      {days.map((day) => {
                        const dayConfig = timetableConfig?.class_day_config.find((config) => config.day === day.value)

                        return (
                          <TabsContent key={day.value} value={day.value}>
                            {dayConfig ? (
                              hasPeriodConfig && !isEditing ? (
                                <TimetableDisplay
                                  dayConfig={dayConfig}
                                  divisionId={Number(selectedDivision)}
                                  timetableConfig={timetableConfig}
                                />
                              ) : (
                                <TimetableGenerator
                                  dayConfig={dayConfig}
                                  divisionId={Number(selectedDivision)}
                                  timetableConfig={timetableConfig}
                                  onSave={() => {
                                    setIsEditing(false)
                                    fetchTimeTableConfig({
                                      academic_session_id: currentAcademicSession.id,
                                      division_id: Number(selectedDivision),
                                    })
                                  }}
                                />
                              )
                            ) : (
                              <div className="text-center py-8 border rounded-md">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                  <Info className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-1">
                                  {t("no_configuration_for")} {day.label}
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                                  {t("this_day_is_not_configured_in_the_timetable_settings")}
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        )
                      })}
                    </Tabs>
                  )}
                </div>
              )}

              {/* Manual Creation Mode - Show when editing and no periods exist */}
              {hasClassDayConfig && !hasPeriodConfig && isEditing && !isAutoGenerating && (
                <Tabs value={activeDay} onValueChange={setActiveDay}>
                  <TabsList className="mb-6">
                    {days.map((day) => {
                      const isDayConfigured = timetableConfig?.class_day_config.some(
                        (config) => config.day === day.value,
                      )

                      return (
                        <TabsTrigger key={day.value} value={day.value} disabled={!isDayConfigured}>
                          {day.label}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {days.map((day) => {
                    const dayConfig = timetableConfig?.class_day_config.find((config) => config.day === day.value)

                    return (
                      <TabsContent key={day.value} value={day.value}>
                        {dayConfig ? (
                          <TimetableGenerator
                            dayConfig={dayConfig}
                            divisionId={Number(selectedDivision)}
                            timetableConfig={timetableConfig}
                            onSave={() => {
                              setIsEditing(false)
                              fetchTimeTableConfig({
                                academic_session_id: currentAcademicSession.id,
                                division_id: Number(selectedDivision),
                              })
                            }}
                          />
                        ) : (
                          <div className="text-center py-8 border rounded-md">
                            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                              <Info className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">
                              {t("no_configuration_for")} {day.label}
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-4">
                              {t("this_day_is_not_configured_in_the_timetable_settings")}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    )
                  })}
                </Tabs>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
