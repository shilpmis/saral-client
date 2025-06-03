import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Calendar, Edit, Info, Eye, Wand2, Settings, Table, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import {
  useLazyFetchTimeTableConfigForDivisionQuery,
  useDeleteDayWiseTimeTableForDivisonMutation,
} from "@/services/timetableService"
import TimetableDisplay from "@/components/TimeTable/TimetableDisplay"
import TimetableGenerator from "@/components/TimeTable/TimetableGenerator"
import TimetableWeekView from "@/components/TimeTable/TimetableWeekView"
import AutoTimetableGenerator from "@/components/TimeTable/AutoTimetableGenerator"
import DayConfigurationView from "@/components/TimeTable/DayConfigurationView"

export default function TimetableManagement() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const academicClasses = useAppSelector(selectAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [fetchTimeTableConfig, { data: timetableConfig, isLoading, error }] =
    useLazyFetchTimeTableConfigForDivisionQuery()
  const [deleteDayWiseTimeTable, { isLoading: isDeleting }] = useDeleteDayWiseTimeTableForDivisonMutation()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [activeDay, setActiveDay] = useState<string>("mon")
  const [activeTab, setActiveTab] = useState<string>("day_view")
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
    setIsAutoGenerating(false)
  }

  // Handle division change
  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value)
    setIsAutoGenerating(false)
  }

  // Handle delete timetable
  const handleDeleteTimetable = async () => {
    if (!selectedDivision) return

    try {
      await deleteDayWiseTimeTable({ 
        division_id: Number(selectedDivision),
        school_timetable_config_id : timetableConfig!.id,
      }).unwrap()
      toast({
        title: t("success"),
        description: t("timetable_deleted_successfully"),
      })

      // Refresh data
      fetchTimeTableConfig({
        academic_session_id: currentAcademicSession!.id,
        division_id: Number(selectedDivision),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.data?.message || t("failed_to_delete_timetable"),
      })
    }
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

  // Get existing periods for current day and division
  const getExistingPeriodsForDay = (dayValue: string) => {
    const dayConfig = timetableConfig?.class_day_config.find((config) => config.day === dayValue)
    if (!dayConfig || !dayConfig.period_config) return []

    return dayConfig.period_config.filter((period) => period.division_id === Number(selectedDivision))
  }

  // Check if academic session is available
  if (!currentAcademicSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{t("no_academic_session")}</AlertTitle>
            <AlertDescription>{t("please_select_an_active_academic_session")}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // If no classes are available, show a message
  if (!academicClasses || academicClasses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>{t("no_classes_available")}</AlertTitle>
            <AlertDescription>{t("please_create_academic_classes_first")}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("timetable_management")}</h1>
              <p className="text-gray-600 mt-1">{t("create_and_manage_timetables_for_classes_and_divisions")}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {currentAcademicSession.session_name}
              </Badge>
            </div>
          </div>

          {/* Class and Division Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class-select" className="text-sm font-medium text-gray-700">
                {t("class")}
              </Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger id="class-select" className="mt-1">
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
              <Label htmlFor="division-select" className="text-sm font-medium text-gray-700">
                {t("division")}
              </Label>
              <Select
                value={selectedDivision}
                onValueChange={handleDivisionChange}
                disabled={!filteredDivisions.length}
              >
                <SelectTrigger id="division-select" className="mt-1">
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border p-12">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">{t("loading_timetable_data")}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (error as any)?.status !== 404 && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{t("failed_to_load_timetable_configuration")}</AlertDescription>
          </Alert>
        )}

        {/* No Selection State */}
        {!selectedClass || !selectedDivision ? (
          !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_selection")}</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {t("please_select_a_class_and_division_to_view_or_create_a_timetable")}
                </p>
              </div>
            </div>
          )
        ) : !hasClassDayConfig ? (
          // No class day configuration
          <Alert>
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{t("no_class_configuration")}</AlertTitle>
            <AlertDescription>
              {t("no_day_configuration_found_for_this_class_please_configure_class_schedules_in_settings_first")}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Header with Actions */}
              <div className="border-b bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t("timetable_for")} Class{" "}
                      {academicClasses.find((cls) => cls.id.toString() === selectedClass)?.class}{" "}
                      {filteredDivisions.find((div) => div.id.toString() === selectedDivision)?.division}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {hasPeriodConfig ? t("timetable_configured") : t("no_timetable_configured")}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!hasPeriodConfig ? (
                      <>
                        <Button variant="outline" onClick={() => setActiveTab("timetable_setup")}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("create_manually")}
                        </Button>
                        <Button onClick={() => setIsAutoGenerating(true)}>
                          <Wand2 className="h-4 w-4 mr-2" />
                          {t("auto_generate")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => setIsAutoGenerating(true)}>
                          <Wand2 className="h-4 w-4 mr-2" />
                          {t("regenerate")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDeleteTimetable}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          {t("delete_timetable")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto Generation Mode */}
              {isAutoGenerating ? (
                <div className="p-6">
                  <AutoTimetableGenerator
                    divisionId={Number(selectedDivision)}
                    timetableConfig={timetableConfig}
                    onSave={() => {
                      setIsAutoGenerating(false)
                      setActiveTab("day_view")
                      fetchTimeTableConfig({
                        academic_session_id: currentAcademicSession.id,
                        division_id: Number(selectedDivision),
                      })
                    }}
                    onCancel={() => setIsAutoGenerating(false)}
                  />
                </div>
              ) : (
                <>
                  {/* Navigation Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="border-b">
                      <TabsList className="h-auto p-0 bg-transparent">
                        <TabsTrigger
                          value="day_config"
                          className="flex items-center space-x-2 px-6 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{t("day_configuration")}</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="timetable_setup"
                          className="flex items-center space-x-2 px-6 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span>{t("timetable_setup")}</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="day_view"
                          className="flex items-center space-x-2 px-6 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{t("day_view")}</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="week_view"
                          className="flex items-center space-x-2 px-6 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          <Table className="h-4 w-4" />
                          <span>{t("week_view")}</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Day Selection for Day-specific tabs */}
                    {(activeTab === "timetable_setup" || activeTab === "day_view") && (
                      <div className="border-b bg-gray-50 px-6 py-3">
                        <div className="flex items-center space-x-4">
                          <Label className="text-sm font-medium text-gray-700">{t("select_day")}:</Label>
                          <div className="flex space-x-1">
                            {days.map((day) => {
                              const isDayConfigured = timetableConfig?.class_day_config.some(
                                (config) => config.day === day.value,
                              )

                              return (
                                <Button
                                  key={day.value}
                                  variant={activeDay === day.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setActiveDay(day.value)}
                                  disabled={!isDayConfigured}
                                  className="h-8"
                                >
                                  {day.label.substring(0, 3)}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab Content */}
                    <div className="p-6">
                      <TabsContent value="day_config" className="mt-0">
                        {currentDayConfig ? (
                          <DayConfigurationView dayConfig={currentDayConfig} timetableConfig={timetableConfig} />
                        ) : (
                          <div className="text-center py-8">
                            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t("no_configuration_available")}
                            </h3>
                            <p className="text-gray-600">
                              {t("please_configure_day_settings_in_timetable_settings_first")}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="timetable_setup" className="mt-0">
                        {currentDayConfig ? (
                          <TimetableGenerator
                            dayConfig={currentDayConfig}
                            divisionId={Number(selectedDivision)}
                            timetableConfig={timetableConfig}
                            existingPeriods={getExistingPeriodsForDay(activeDay)}
                            isEditing={getExistingPeriodsForDay(activeDay).length > 0}
                            onSave={() => {
                              setActiveTab("day_view")
                              fetchTimeTableConfig({
                                academic_session_id: currentAcademicSession.id,
                                division_id: Number(selectedDivision),
                              })
                            }}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t("no_configuration_for")} {days.find((d) => d.value === activeDay)?.label}
                            </h3>
                            <p className="text-gray-600">{t("this_day_is_not_configured_in_the_timetable_settings")}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="day_view" className="mt-0">
                        {currentDayConfig ? (
                          <TimetableDisplay
                            dayConfig={currentDayConfig}
                            divisionId={Number(selectedDivision)}
                            timetableConfig={timetableConfig}
                            onEdit={() => setActiveTab("timetable_setup")}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t("no_configuration_for")} {days.find((d) => d.value === activeDay)?.label}
                            </h3>
                            <p className="text-gray-600">{t("this_day_is_not_configured_in_the_timetable_settings")}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="week_view" className="mt-0">
                        {hasPeriodConfig ? (
                          <TimetableWeekView
                            timetableConfig={timetableConfig}
                            divisionId={Number(selectedDivision)}
                            days={days}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t("no_timetable_data_available")}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {t("create_a_timetable_first_to_view_the_weekly_schedule")}
                            </p>
                            <Button onClick={() => setActiveTab("timetable_setup")}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("create_timetable")}
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
