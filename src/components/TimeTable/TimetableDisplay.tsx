// "use client"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Clock, BookOpen, Users, Dumbbell, Coffee, Beaker, AlertCircle } from "lucide-react"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import type { ClassDayConfigForTimeTable, TimeTableConfigForSchool, PeriodsConfig } from "@/types/subjects"

// interface TimetableDisplayProps {
//   dayConfig: ClassDayConfigForTimeTable
//   divisionId: number
//   timetableConfig: TimeTableConfigForSchool
// }

// export default function TimetableDisplay({ dayConfig, divisionId, timetableConfig }: TimetableDisplayProps) {
//   const { t } = useTranslation()

//   // Filter periods for the selected division
//   const divisionPeriods = dayConfig.period_config
//     ? dayConfig.period_config.filter((period) => period.division_id === divisionId)
//     : []

//   // Sort periods by order
//   const sortedPeriods = [...divisionPeriods].sort((a, b) => a.period_order - b.period_order)

//   // Format time (e.g., "09:30" to "9:30 AM")
//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(":")
//     const hour = Number.parseInt(hours, 10)
//     const ampm = hour >= 12 ? "PM" : "AM"
//     const formattedHour = hour % 12 || 12
//     return `${formattedHour}:${minutes} ${ampm}`
//   }

//   // Get period type badge
//   const getPeriodTypeBadge = (period: PeriodsConfig) => {
//     if (period.is_break) {
//       return (
//         <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
//           Break
//         </Badge>
//       )
//     } else if (period.is_pt) {
//       return (
//         <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
//           PT
//         </Badge>
//       )
//     } else if (period.lab_id) {
//       return (
//         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//           Lab
//         </Badge>
//       )
//     } else if (period.is_free_period) {
//       return (
//         <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
//           Free
//         </Badge>
//       )
//     }
//     return (
//       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//         Regular
//       </Badge>
//     )
//   }

//   // Get period icon
//   const getPeriodIcon = (period: PeriodsConfig) => {
//     if (period.is_break) {
//       return <Coffee className="h-5 w-5 text-amber-600" />
//     } else if (period.is_pt) {
//       return <Dumbbell className="h-5 w-5 text-purple-600" />
//     } else if (period.lab_id) {
//       return <Beaker className="h-5 w-5 text-blue-600" />
//     } else if (period.is_free_period) {
//       return <Clock className="h-5 w-5 text-gray-600" />
//     }
//     return <BookOpen className="h-5 w-5 text-green-600" />
//   }

//   // Get subject and teacher names
//   const getSubjectName = (period: PeriodsConfig) => {
//     // This would typically come from your subject data
//     // For now, we'll return a placeholder
//     return period.subjects_division_masters_id ? `Subject ID: ${period.subjects_division_masters_id}` : "No Subject"
//   }

//   const getTeacherName = (period: PeriodsConfig) => {
//     // This would typically come from your staff data
//     // For now, we'll return a placeholder
//     return period.staff_enrollment_id ? `Teacher ID: ${period.staff_enrollment_id}` : "No Teacher"
//   }

//   // Get lab name
//   const getLabName = (period: PeriodsConfig) => {
//     if (!period.lab_id) return null

//     const lab = timetableConfig.lab_config.find((lab) => lab.id === period.lab_id)
//     return lab ? lab.name : `Lab ID: ${period.lab_id}`
//   }

//   // If no periods are configured
//   if (sortedPeriods.length === 0) {
//     return (
//       <div className="text-center py-8 border rounded-md">
//         <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
//           <AlertCircle className="h-6 w-6 text-muted-foreground" />
//         </div>
//         <h3 className="text-lg font-medium mb-1">{t("no_periods_configured")}</h3>
//         <p className="text-muted-foreground max-w-md mx-auto mb-4">
//           {t("no_periods_have_been_configured_for_this_day_and_division")}
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-2">
//           <Clock className="h-5 w-5 text-muted-foreground" />
//           <span className="text-sm text-muted-foreground">
//             {t("school_hours")}: {formatTime(dayConfig.day_start_time)} - {formatTime(dayConfig.day_end_time)}
//           </span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4">
//         {sortedPeriods.map((period) => (
//           <Card
//             key={period.id}
//             className={`
//             ${period.is_break ? "bg-amber-50" : ""}
//             ${period.is_pt ? "bg-purple-50" : ""}
//             ${period.lab_id ? "bg-blue-50" : ""}
//             ${period.is_free_period ? "bg-gray-50" : ""}
//             ${!period.is_break && !period.is_pt && !period.lab_id && !period.is_free_period ? "bg-green-50" : ""}
//           `}
//           >
//             <CardContent className="p-4">
//               <div className="flex flex-col md:flex-row md:items-center justify-between">
//                 <div className="flex items-center space-x-4 mb-2 md:mb-0">
//                   <div className="flex-shrink-0">{getPeriodIcon(period)}</div>
//                   <div>
//                     <div className="flex items-center space-x-2">
//                       <h4 className="font-medium">
//                         {t("period")} {period.period_order}
//                       </h4>
//                       {getPeriodTypeBadge(period)}
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                     </p>
//                   </div>
//                 </div>

//                 {!period.is_break && (
//                   <div className="flex flex-col md:items-end">
//                     {period.subjects_division_masters_id && !period.is_free_period && (
//                       <div className="flex items-center space-x-1">
//                         <BookOpen className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm font-medium">{getSubjectName(period)}</span>
//                       </div>
//                     )}

//                     {period.staff_enrollment_id && !period.is_free_period && (
//                       <div className="flex items-center space-x-1">
//                         <Users className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">{getTeacherName(period)}</span>
//                       </div>
//                     )}

//                     {period.lab_id && (
//                       <div className="flex items-center space-x-1">
//                         <Beaker className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">{getLabName(period)}</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }


"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Users, Dumbbell, Coffee, Beaker, AlertCircle } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"
import type { ClassDayConfigForTimeTable, TimeTableConfigForSchool, PeriodsConfig } from "@/types/subjects"
import { useLazyGetSubjectsForDivisionQuery } from "@/services/subjects"
import { useLazyGetTeachingStaffQuery } from "@/services/StaffService"
import { useEffect, useState } from "react"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import type { SubjectDivisionMaster } from "@/types/subjects"
import type { StaffType } from "@/types/staff"

interface TimetableDisplayProps {
  dayConfig: ClassDayConfigForTimeTable
  divisionId: number
  timetableConfig: TimeTableConfigForSchool
}

export default function TimetableDisplay({ dayConfig, divisionId, timetableConfig }: TimetableDisplayProps) {
  const { t } = useTranslation()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const [getSubjectsForDivision, { data: subjectsData }] = useLazyGetSubjectsForDivisionQuery()
  const [getTeachingStaff, { data: staffData }] = useLazyGetTeachingStaffQuery()
  const [subjects, setSubjects] = useState<SubjectDivisionMaster[]>([])
  const [staff, setStaff] = useState<StaffType[]>([])

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

  // Filter periods for the selected division
  const divisionPeriods = dayConfig.period_config
    ? dayConfig.period_config.filter((period) => period.division_id === divisionId)
    : []

  // Sort periods by order
  const sortedPeriods = [...divisionPeriods].sort((a, b) => a.period_order - b.period_order)

  // Format time (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  // Get period type badge
  const getPeriodTypeBadge = (period: PeriodsConfig) => {
    if (period.is_break) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {t("break")}
        </Badge>
      )
    } else if (period.is_pt) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {t("pt")}
        </Badge>
      )
    } else if (period.lab_id) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {t("lab")}
        </Badge>
      )
    } else if (period.is_free_period) {
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

  // Get period icon
  const getPeriodIcon = (period: PeriodsConfig) => {
    if (period.is_break) {
      return <Coffee className="h-5 w-5 text-amber-600" />
    } else if (period.is_pt) {
      return <Dumbbell className="h-5 w-5 text-purple-600" />
    } else if (period.lab_id) {
      return <Beaker className="h-5 w-5 text-blue-600" />
    } else if (period.is_free_period) {
      return <Clock className="h-5 w-5 text-gray-600" />
    }
    return <BookOpen className="h-5 w-5 text-green-600" />
  }

  // Get subject name
  const getSubjectName = (period: PeriodsConfig) => {
    if (!period.subjects_division_masters_id) return t("no_subject")

    const subject = subjects.find((s) => s.id === period.subjects_division_masters_id)
    return subject ? subject.subject?.name || t("unknown_subject") : t("unknown_subject")
  }

  // Get subject code
  const getSubjectCode = (period: PeriodsConfig) => {
    if (!period.subjects_division_masters_id) return ""

    const subject = subjects.find((s) => s.id === period.subjects_division_masters_id)
    return subject ? subject.code_for_division || subject.subject?.code || "" : ""
  }

  // Get teacher name
  const getTeacherName = (period: PeriodsConfig) => {
    if (!period.staff_enrollment_id) return t("no_teacher")

    const teacher = staff.find((s) => s.staff_enrollment_id === period.staff_enrollment_id)
    if (!teacher) return t("unknown_teacher")

    return `${teacher.first_name || ""} ${teacher.middle_name || ""} ${teacher.last_name || ""}`.trim()
  }

  // Get lab name
  const getLabName = (period: PeriodsConfig) => {
    if (!period.lab_id) return null

    const lab = timetableConfig.lab_config.find((lab) => lab.id === period.lab_id)
    return lab ? lab.name : t("unknown_lab")
  }

  // Get period background color
  const getPeriodBgColor = (period: PeriodsConfig) => {
    if (period.is_break) return "bg-amber-50"
    if (period.is_pt) return "bg-purple-50"
    if (period.lab_id) return "bg-blue-50"
    if (period.is_free_period) return "bg-gray-50"
    return "bg-green-50"
  }

  // If no periods are configured
  if (sortedPeriods.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">{t("no_periods_configured")}</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          {t("no_periods_have_been_configured_for_this_day_and_division")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("school_hours")}: {formatTime(dayConfig.day_start_time)} - {formatTime(dayConfig.day_end_time)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedPeriods.map((period) => (
          <Card key={period.id} className={`${getPeriodBgColor(period)} overflow-hidden`}>
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">{getPeriodIcon(period)}</div>
                    <h4 className="font-medium">
                      {t("period")} {period.period_order}
                    </h4>
                  </div>
                  {getPeriodTypeBadge(period)}
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {formatTime(period.start_time)} - {formatTime(period.end_time)}
                </div>

                {!period.is_break && (
                  <div className="mt-auto">
                    {period.subjects_division_masters_id && !period.is_free_period && (
                      <div className="flex items-center space-x-1 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">{getSubjectName(period)}</span>
                          {getSubjectCode(period) && (
                            <span className="text-xs text-muted-foreground ml-1">({getSubjectCode(period)})</span>
                          )}
                        </div>
                      </div>
                    )}

                    {period.staff_enrollment_id && !period.is_free_period && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{getTeacherName(period)}</span>
                      </div>
                    )}

                    {period.lab_id && (
                      <div className="flex items-center space-x-1">
                        <Beaker className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{getLabName(period)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
