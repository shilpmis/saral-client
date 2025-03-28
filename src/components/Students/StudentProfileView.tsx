"use client"

import { useState } from "react"
import {
  User,
  GraduationCap,
  CreditCard,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Award,
  School,
  Clock,
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useNavigate } from "react-router-dom"

interface StudentProfileViewProps {
  student: any
  onBack?: () => void
}

export function StudentProfileView({ student, onBack }: StudentProfileViewProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate fees payment percentage
  const feesPaymentPercentage = student.fees_status
    ? Math.round(
        (Number.parseFloat(student.fees_status.paid_amount) / Number.parseFloat(student.fees_status.total_amount)) *
          100,
      )
    : 0

  // Get current academic status
  const currentAcademicClass = student.academic_class?.find((ac: { status: string }) => ac.status === "Pursuing")

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pursuing":
        return "bg-green-500 hover:bg-green-600"
      case "Failed":
        return "bg-red-500 hover:bg-red-600"
      case "Passed":
        return "bg-blue-500 hover:bg-blue-600"
      case "Dropped":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Get fees status badge color
  const getFeesStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500 hover:bg-green-600"
      case "Partially Paid":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Unpaid":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" className="flex items-center gap-1" onClick={onBack || (() => navigate(-1))}>
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            {t("print_profile")}
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {t("export_data")}
          </Button>
          <Button className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {t("edit_profile")}
          </Button>
        </div>
      </div>

      {/* Profile header */}
      <Card className="border-t-4 border-t-primary shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt={student.first_name} />
                <AvatarFallback className="text-4xl bg-primary/10">
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Badge className={`absolute -top-2 -right-2 ${getStatusBadgeColor(currentAcademicClass?.status || "")}`}>
                {currentAcademicClass?.status || "N/A"}
              </Badge>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold">
                  {student.first_name} {student.middle_name} {student.last_name}
                </h1>
                <Badge variant="outline" className="w-fit">
                  {t("enrollment_code")}: {student.enrollment_code}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    {t("class")}: {currentAcademicClass?.class?.class}-{currentAcademicClass?.class?.division}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>
                    {t("roll_number")}: {student.roll_number}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("dob")}: {formatDate(student.birth_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{student.primary_mobile}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {student.gender}
                </Badge>
                {student.student_meta?.blood_group && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    {student.student_meta.blood_group}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  GR: {student.gr_no}
                </Badge>
                {student.student_meta?.category && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {student.student_meta.category}
                  </Badge>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2">
              <Card className="border-l-4 border-l-primary w-full md:w-64">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">{t("fees_status")}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">{t("payment_progress")}</span>
                      <span className="font-medium">{feesPaymentPercentage}%</span>
                    </div>
                    <Progress value={feesPaymentPercentage} className="h-2" />
                    <div className="flex justify-between items-center pt-1">
                      <Badge className={getFeesStatusBadgeColor(student.fees_status?.status || "")}>
                        {student.fees_status?.status || "N/A"}
                      </Badge>
                      <span className="text-sm font-medium">
                        ₹{Number.parseFloat(student.fees_status?.paid_amount || 0).toLocaleString()} / ₹
                        {Number.parseFloat(student.fees_status?.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="academic">{t("academic")}</TabsTrigger>
          <TabsTrigger value="fees">{t("fees")}</TabsTrigger>
          <TabsTrigger value="personal">{t("personal_details")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t("quick_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("admission_date")}</p>
                    <p className="font-medium">{formatDate(student.student_meta?.admission_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("admission_class")}</p>
                    <p className="font-medium">Class {student.student_meta?.admission_class_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("admission_type")}</p>
                    <p className="font-medium">{student.academic_class?.[0]?.type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("aadhar_no")}</p>
                    <p className="font-medium">{student.aadhar_no || "N/A"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">{t("previous_school")}</p>
                  <p className="font-medium">{student.student_meta?.privious_school || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Family Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  {/* <Users className="h-5 w-5 text-primary" /> */}
                  {t("family_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("father_name")}</p>
                  <p className="font-medium">{student.father_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{student.father_name_in_guj}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">{t("mother_name")}</p>
                  <p className="font-medium">{student.mother_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{student.mother_name_in_guj}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">{t("contact_details")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{student.primary_mobile}</p>
                  </div>
                  {student.student_meta?.secondary_mobile && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{student.student_meta.secondary_mobile}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t("address_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("current_address")}</p>
                  <p className="font-medium">{student.student_meta?.address || "N/A"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("city")}</p>
                    <p className="font-medium">{student.student_meta?.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("district")}</p>
                    <p className="font-medium">{student.student_meta?.district || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("state")}</p>
                    <p className="font-medium">{student.student_meta?.state || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("postal_code")}</p>
                    <p className="font-medium">{student.student_meta?.postal_code || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {t("academic_summary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t("class")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("division")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("status")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("type")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("remarks")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.academic_class?.map((ac: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{ac.class?.class}</td>
                        <td className="py-3 px-4">{ac.class?.division}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadgeColor(ac.status)}>{ac.status}</Badge>
                        </td>
                        <td className="py-3 px-4">{ac.type}</td>
                        <td className="py-3 px-4">{ac.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Academic Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  {t("current_academic_status")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAcademicClass ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("class")}</span>
                      <span className="font-medium">
                        {currentAcademicClass.class?.class}-{currentAcademicClass.class?.division}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("status")}</span>
                      <Badge className={getStatusBadgeColor(currentAcademicClass.status)}>
                        {currentAcademicClass.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("roll_number")}</span>
                      <span className="font-medium">{student.roll_number}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("admission_type")}</span>
                      <span className="font-medium">{currentAcademicClass.type}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>{t("no_current_academic_record")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t("academic_history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.academic_class?.length > 0 ? (
                    student.academic_class.map((ac: any, index: number) => (
                      <div key={index} className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              Class {ac.class?.class}-{ac.class?.division}
                            </h4>
                            <p className="text-sm text-muted-foreground">{ac.type}</p>
                          </div>
                          <Badge className={getStatusBadgeColor(ac.status)}>{ac.status}</Badge>
                        </div>
                        {ac.remarks && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            <span className="font-medium">{t("remarks")}:</span> {ac.remarks}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p>{t("no_academic_history")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Previous School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                {t("previous_school_information")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.student_meta?.privious_school ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">{t("previous_school")}</h4>
                    <p>{student.student_meta.privious_school}</p>
                    {student.student_meta.privious_school_in_guj && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {student.student_meta.privious_school_in_guj}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t("admission_details")}</h4>
                    <p>
                      <span className="text-muted-foreground">{t("admission_date")}:</span>{" "}
                      {formatDate(student.student_meta.admission_date)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("admission_class")}:</span> Class{" "}
                      {student.student_meta.admission_class_id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>{t("no_previous_school_information")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-6 mt-6">
          {/* Fees Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {t("fees_overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.fees_status ? (
                <div className="space-y-6">
                  {/* Fees Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{t("total_fees")}</p>
                        <p className="text-2xl font-bold">
                          ₹{Number.parseFloat(student.fees_status.total_amount).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{t("paid_amount")}</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{Number.parseFloat(student.fees_status.paid_amount).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-500/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{t("due_amount")}</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{Number.parseFloat(student.fees_status.due_amount).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-500/5 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{t("discount")}</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          ₹{Number.parseFloat(student.fees_status.discounted_amount).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Progress */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{t("payment_progress")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("payment_status")}</span>
                          <Badge className={getFeesStatusBadgeColor(student.fees_status.status)}>
                            {student.fees_status.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{t("progress")}</span>
                            <span>{feesPaymentPercentage}%</span>
                          </div>
                          <Progress value={feesPaymentPercentage} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" className="flex items-center gap-1">
                      <Printer className="h-4 w-4" />
                      {t("print_receipt")}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {t("view_payment_history")}
                    </Button>
                    <Button className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {t("collect_fees")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>{t("no_fees_information_available")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Concessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {t("concessions_and_scholarships")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.provided_concession && student.provided_concession.length > 0 ? (
                <div className="space-y-4">
                  {student.provided_concession.map((concession: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{concession.name}</h4>
                        <Badge variant="outline">₹{concession.amount}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{concession.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>{t("no_concessions_applied")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t("basic_information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("full_name")}</p>
                    <p className="font-medium">
                      {student.first_name} {student.middle_name} {student.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {student.first_name_in_guj} {student.middle_name_in_guj} {student.last_name_in_guj}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("gender")}</p>
                    <p className="font-medium">{student.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("date_of_birth")}</p>
                    <p className="font-medium">{formatDate(student.birth_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("birth_place")}</p>
                    <p className="font-medium">{student.student_meta?.birth_place || "N/A"}</p>
                    {student.student_meta?.birth_place_in_guj && (
                      <p className="text-sm text-muted-foreground mt-1">{student.student_meta.birth_place_in_guj}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("religion")}</p>
                    <p className="font-medium">{student.student_meta?.religion || "N/A"}</p>
                    {student.student_meta?.religion_in_guj && (
                      <p className="text-sm text-muted-foreground mt-1">{student.student_meta.religion_in_guj}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("caste")}</p>
                    <p className="font-medium">{student.student_meta?.caste || "N/A"}</p>
                    {student.student_meta?.caste_in_guj && (
                      <p className="text-sm text-muted-foreground mt-1">{student.student_meta.caste_in_guj}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("category")}</p>
                    <p className="font-medium">{student.student_meta?.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("blood_group")}</p>
                    <p className="font-medium">{student.student_meta?.blood_group || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("identification")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("enrollment_code")}</p>
                    <p className="font-medium">{student.enrollment_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("gr_number")}</p>
                    <p className="font-medium">{student.gr_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("aadhar_number")}</p>
                    <p className="font-medium">{student.aadhar_no || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("aadhar_dise_number")}</p>
                    <p className="font-medium">{student.student_meta?.aadhar_dise_no || "N/A"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">{t("identification_mark")}</p>
                  <p className="font-medium">{student.student_meta?.identification_mark || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                {t("contact_information")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">{t("phone_numbers")}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t("primary")}:</span>
                      <span className="font-medium">{student.primary_mobile}</span>
                    </div>
                    {student.student_meta?.secondary_mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t("secondary")}:</span>
                        <span className="font-medium">{student.student_meta.secondary_mobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("address")}</h4>
                  <p>{student.student_meta?.address || "N/A"}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-sm text-muted-foreground">{t("city")}:</span>
                      <span className="ml-1">{student.student_meta?.city || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{t("district")}:</span>
                      <span className="ml-1">{student.student_meta?.district || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{t("state")}:</span>
                      <span className="ml-1">{student.student_meta?.state || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{t("postal_code")}:</span>
                      <span className="ml-1">{student.student_meta?.postal_code || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {t("bank_details")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.student_meta?.bank_name || student.student_meta?.account_no ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("bank_name")}</p>
                    <p className="font-medium">{student.student_meta?.bank_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("account_number")}</p>
                    <p className="font-medium">{student.student_meta?.account_no || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-16 text-muted-foreground">
                  <p>{t("no_bank_details_available")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function Users() {
  return <div>Users</div>
}

export default StudentProfileView

