import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function AdmissionSetting() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Admission Management</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Manage admissions, seats, and quotas efficiently with our comprehensive admission management system.
        </p>
        {/* <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link to="/admin/dashboard">
            <Button size="lg" className="w-full">
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/admission-inquiry">
            <Button size="lg" variant="outline" className="w-full">
              New Admission Inquiry
            </Button>
          </Link>
        </div> */}
      </div>

      <div className="flex justify-content space-x-3 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Seat Management</CardTitle>
            <CardDescription>Manage available seats across classes and quotas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Configure seat allocation for each class and assign seats to different quotas like RTE, Staff, Sports,
              etc.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/seats" className="w-full">
              <Button className="w-full">
                Manage Seats
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quota Configuration</CardTitle>
            <CardDescription>Create and manage admission quotas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Define custom quotas, set eligibility criteria, and allocate seats for each quota category.</p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/quotas" className="w-full">
              <Button  className="w-full">
                Configure Quotas
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Admission Inquiries</CardTitle>
            <CardDescription>Process new admission requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review admission inquiries, check eligibility, and process applications through appropriate quotas.</p>
          </CardContent>
          <CardFooter>
            <Link to="/admin/inquiries" className="w-full">
              <Button variant="outline" className="w-full">
                View Inquiries
              </Button>
            </Link>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  )
}

// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Link } from "react-router-dom"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectActiveAccademicSessionsForSchool, selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"
// import { useState, useEffect } from "react"
// import { School, Users, GraduationCap, Settings } from "lucide-react"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { Badge } from "@/components/ui/badge"

// export default function AdmissionSetting() {
//   const { t } = useTranslation()
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
//   const allAcademicSessions = useAppSelector(selectAccademicSessionsForSchool)
//   const [selectedSession, setSelectedSession] = useState<string | null>(null)

//   useEffect(() => {
//     if (currentAcademicSession) {
//       setSelectedSession(currentAcademicSession.id.toString())
//     }
//   }, [currentAcademicSession])

//   return (
//     <div className="container mx-auto py-10">
//       <div className="flex flex-col items-center justify-center space-y-4 text-center">
//         <div className="flex items-center justify-center space-x-2">
//           <GraduationCap className="h-10 w-10 text-primary" />
//           <h1 className="text-4xl font-bold tracking-tight">{t("admission_management")}</h1>
//         </div>
//         <p className="text-muted-foreground max-w-[700px]">
//           {t("manage_admissions_seats_and_quotas_efficiently_with_our_comprehensive_admission_management_system")}
//         </p>

//         <div className="w-full max-w-md mt-6 mb-2">
//           <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border">
//             <label className="text-sm font-medium text-muted-foreground px-2">{t("academic_session")}:</label>
//             <Select value={selectedSession || ""} onValueChange={setSelectedSession}>
//               <SelectTrigger className="w-[220px] bg-background">
//                 <SelectValue placeholder={t("select_academic_session")} />
//               </SelectTrigger>
//               <SelectContent>
//                 {allAcademicSessions?.map((session) => (
//                   <SelectItem key={session.id} value={session.id.toString()}>
//                     {session.name}{" "}
//                     {session.id === currentAcademicSession?.id && (
//                       <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
//                         {t("current")}
//                       </Badge>
//                     )}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <p className="text-xs text-muted-foreground mt-1">
//             {t("all_admission_settings_are_specific_to_the_selected_academic_session")}
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
//         <Card className="overflow-hidden border-t-4 border-t-blue-500 transition-all hover:shadow-md">
//           <CardHeader className="pb-4">
//             <div className="flex items-start justify-between">
//               <div>
//                 <CardTitle className="text-xl font-bold">{t("seat_management")}</CardTitle>
//                 <CardDescription className="mt-1">
//                   {t("manage_available_seats_across_classes_and_quotas")}
//                 </CardDescription>
//               </div>
//               <div className="bg-blue-100 p-2 rounded-full">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="pb-4">
//             <p className="text-sm text-muted-foreground">
//               {t(
//                 "configure_seat_allocation_for_each_class_and_assign_seats_to_different_quotas_like_rte_staff_sports_etc",
//               )}
//             </p>
//             <div className="mt-4 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>{t("classes_configured")}:</span>
//                 <span className="font-medium">12</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>{t("total_seats")}:</span>
//                 <span className="font-medium">480</span>
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="pt-0">
//             <Link to={`/d/settings/admission/seats?session=${selectedSession}`} className="w-full">
//               <Button className="w-full bg-blue-600 hover:bg-blue-700">{t("manage_seats")}</Button>
//             </Link>
//           </CardFooter>
//         </Card>

//         <Card className="overflow-hidden border-t-4 border-t-purple-500 transition-all hover:shadow-md">
//           <CardHeader className="pb-4">
//             <div className="flex items-start justify-between">
//               <div>
//                 <CardTitle className="text-xl font-bold">{t("quota_configuration")}</CardTitle>
//                 <CardDescription className="mt-1">{t("create_and_manage_admission_quotas")}</CardDescription>
//               </div>
//               <div className="bg-purple-100 p-2 rounded-full">
//                 <Settings className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="pb-4">
//             <p className="text-sm text-muted-foreground">
//               {t("define_custom_quotas_set_eligibility_criteria_and_allocate_seats_for_each_quota_category")}
//             </p>
//             <div className="mt-4 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>{t("active_quotas")}:</span>
//                 <span className="font-medium">5</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>{t("quota_allocated_seats")}:</span>
//                 <span className="font-medium">120</span>
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="pt-0">
//             <Link to={`/d/settings/admission/quotas?session=${selectedSession}`} className="w-full">
//               <Button className="w-full bg-purple-600 hover:bg-purple-700">{t("configure_quotas")}</Button>
//             </Link>
//           </CardFooter>
//         </Card>

//         <Card className="overflow-hidden border-t-4 border-t-green-500 transition-all hover:shadow-md">
//           <CardHeader className="pb-4">
//             <div className="flex items-start justify-between">
//               <div>
//                 <CardTitle className="text-xl font-bold">{t("admission_dashboard")}</CardTitle>
//                 <CardDescription className="mt-1">{t("overview_of_admission_status")}</CardDescription>
//               </div>
//               <div className="bg-green-100 p-2 rounded-full">
//                 <School className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="pb-4">
//             <p className="text-sm text-muted-foreground">
//               {t("view_admission_statistics_filled_seats_and_available_capacity_across_all_classes")}
//             </p>
//             <div className="mt-4 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>{t("filled_seats")}:</span>
//                 <span className="font-medium">320</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>{t("available_seats")}:</span>
//                 <span className="font-medium">160</span>
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="pt-0">
//             <Link to={`/d/admission/dashboard?session=${selectedSession}`} className="w-full">
//               <Button className="w-full bg-green-600 hover:bg-green-700">{t("view_dashboard")}</Button>
//             </Link>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   )
// }

