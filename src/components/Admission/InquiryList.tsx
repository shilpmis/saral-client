"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SquareChevronLeft, UserPlus } from "lucide-react"
import { type Inquiry, useGetInquiriesQuery, useLazyGetInquiriesQuery, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import type { StudentFormData } from "@/utils/student.validation"
import StudentForm from "../Students/StudentForm"
import { transformInquiryToStudent } from "@/utils/transform-inquiry-to-student"
import type { Student } from "@/types/student"
import { useAuth } from "@/redux/hooks/useAuth"
import { handleStudentOnboarding } from "@/utils/handle-student-onboarding"
import AdmissionInquiryForm from "./AdmissionInquiryForm"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectAuthState, selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { SaralPagination } from "../ui/common/SaralPagination"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import OnboardingForm from "../Students/OnboardingForm"
import { useNavigate } from "react-router-dom"

export default function InquiriesManagement() {
  const academicSessions = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentacademicSessions = useAppSelector(selectActiveAccademicSessionsForSchool)
  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const navigate = useNavigate()

  const [GetInquiries, { data: inquiriesData, isLoading }] = useLazyGetInquiriesQuery();
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const authState = useAppSelector(selectAuthState)

  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation()
  const [filter, setFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [inquiryToReject, setInquiryToReject] = useState<number | null>(null)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [currentInquiryForOnboarding, setCurrentInquiryForOnboarding] = useState<Inquiry | null>(null)
  const [editInquiryDialogOpen, setEditInquiryDialogOpen] = useState(false)
  const [inquiryToEdit, setInquiryToEdit] = useState<Inquiry | null>(null)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null)
  const { t } = useTranslation()

  const filteredInquiries = useCallback((): Inquiry[] => {
    if (!inquiriesData || !inquiriesData.data) {
      return [];
    }
    return filter === "all"
      ? inquiriesData.data
      : inquiriesData.data.filter((inquiry) => inquiry.status === filter);
  }, [filter, inquiriesData]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateInquiry({ inquiry_id: id, payload: { status } }).unwrap()
      toast({
        title: "Status Updated",
        description: "The inquiry status has been updated successfully.",
      })
      GetInquiries({
        page: inquiriesData?.meta.currentPage,
        academic_session_id: selectedAcademicYear!,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = (id: number) => {
    setInquiryToReject(id)
    setRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (inquiryToReject) {
      try {
        await updateInquiry({ inquiry_id: inquiryToReject, payload: { status: "rejected" } }).unwrap()
        toast({
          title: "Application Rejected",
          description: "The application has been rejected successfully.",
        })
        setRejectDialogOpen(false)
        setInquiryToReject(null)
        GetInquiries({
          page: inquiriesData?.meta.currentPage,
          academic_session_id: selectedAcademicYear!,
        })
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to reject application. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleOnboardStudent = (inquiry: Inquiry) => {
    if (!AcademicClasses) {
      toast({
        title: "Error",
        description: "Academic classes not found.",
        variant: "destructive",
      })
      return
    }
    setCurrentInquiryForOnboarding({
      ...inquiry,
      inquiry_for_class: AcademicClasses.find((item => item.id == inquiry.inquiry_for_class))!.id
    })
    setShowStudentForm(true)
  }

  const handleEditInquiry = (inquiry: Inquiry) => {
    setInquiryToEdit(inquiry)
    setEditInquiryDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t("pending")}
          </Badge>
        )
      case "eligible":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("eligible")}
          </Badge>
        )
      case "ineligible":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("ineligible")}
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("approved")}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("rejected")}
          </Badge>
        )
      case "withdrawn":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("withdrawn")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  useEffect(() => {
    const storedYear = sessionStorage.getItem("selectedAcademicYearInquiry");
    if (storedYear) {
      setSelectedAcademicYear(Number(storedYear));
    } else {
      setSelectedAcademicYear(CurrentacademicSessions?.id || null);
    }
  }, [CurrentacademicSessions]);

  useEffect(() => {
    if (selectedAcademicYear) {
      sessionStorage.setItem("selectedAcademicYearInquiry", selectedAcademicYear.toString());
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedAcademicYear) {
      GetInquiries({
        page: 1,
        academic_session_id: selectedAcademicYear,
      })
    }
  }, [selectedAcademicYear])

  useEffect(() => {
    if (!AcademicClasses) {
      getAcademicClasses(authState.user!.school_id)
    }
  }, [AcademicClasses])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <div className="h-6 w-40 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Academic Year Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Label>{t("academic_year")}:</Label>
            <Select
              value={selectedAcademicYear?.toString() || ""}
              onValueChange={(value) => setSelectedAcademicYear(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("select_academic_year")} />
              </SelectTrigger>
              <SelectContent>
                {academicSessions?.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.session_name} {Boolean(session.is_active) && `(${t("current")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter">{t("filter")}:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder={t("filter_by_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_inquiries")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="eligible">{t("eligible")}</SelectItem>
                <SelectItem value="ineligible">{t("ineligible")}</SelectItem>
                <SelectItem value="approved">{t("approved")}</SelectItem>
                <SelectItem value="rejected">{t("rejected")}</SelectItem>
                <SelectItem value="withdrawn">{t("withdrawn")}</SelectItem>
                <SelectItem value="enrolled">{t("enrolled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admission_inquiries")}</CardTitle>
            <CardDescription>{t("review_and_process_admission_inquiries")}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries() !== undefined && filteredInquiries().length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("student_name")}</TableHead>
                      <TableHead>{t("class")}</TableHead>
                      <TableHead>{t("parent_name")}</TableHead>
                      <TableHead>{t("contact")}</TableHead>
                      <TableHead>{t("date_of_birth")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries().map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">
                          {inquiry.first_name} {inquiry.middle_name ? inquiry.middle_name : ""} {inquiry.last_name}
                        </TableCell>
                        <TableCell>{AcademicClasses?.find((cls) => cls.id === inquiry.inquiry_for_class)?.class}</TableCell>
                        <TableCell>{inquiry.father_name}</TableCell>
                        <TableCell>{inquiry.primary_mobile}</TableCell>
                        <TableCell>{new Date(inquiry.birth_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                              {t("view")}
                            </Button>

                            {/* Edit button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInquiry(inquiry)}
                              disabled={inquiry.status === "enrolled"}
                            >
                              {t("edit")}
                            </Button>

                            {/* Onboard Student button - only enabled for approved applications */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOnboardStudent(inquiry)}
                              disabled={inquiry.status !== 'approved' || Boolean(Number(inquiry.is_converted_to_student))}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {t("onboard")}
                            </Button>

                            <Select
                              defaultValue={inquiry.status}
                              onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                              disabled={Boolean(Number(inquiry.is_converted_to_student)) || inquiry.status === "enrolled"}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue placeholder={t("change_status")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t("pending")}</SelectItem>
                                <SelectItem value="eligible">{t("eligible")}</SelectItem>
                                <SelectItem value="ineligible">{t("ineligible")}</SelectItem>
                                <SelectItem value="approved">{t("approved")}</SelectItem>
                                <SelectItem value="rejected">{t("rejected")}</SelectItem>
                                <SelectItem value="enrolled" disabled>{t("enrolled")}</SelectItem>
                              </SelectContent>
                            </Select>

                            {(authState.user!.role === 'CLERK' || authState.user!.role === 'ADMIN') && (<Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/d/pay-fees/${inquiry.student_enrollment!.student_id}?session_id=${inquiry.academic_session_id}`)}
                              disabled={inquiry.status !== 'enrolled' || !Boolean(Number(inquiry.is_converted_to_student) || inquiry.student_enrollments_id)}
                            >
                              {/* <UserPlus className="h-4 w-4 mr-1" /> */}
                              {t("token_amount")}
                            </Button>)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <SaralPagination
                  currentPage={inquiriesData!.meta.current_page || inquiriesData!.meta.currentPage}
                  totalPages={inquiriesData!.meta.last_page || inquiriesData!.meta.lastPage}
                  onPageChange={(page) => {
                    GetInquiries({
                      page: page,
                      academic_session_id: selectedAcademicYear!,
                    })
                  }}
                ></SaralPagination>
              </>
            ) : (
              <div className="text-center p-8 border rounded-lg bg-muted/50">
                {t("no_inquiries_found_matching_the_selected_filter.")}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t("inquiry_details")}</DialogTitle>
                <DialogDescription>{t("review_complete_details_and_determine_eligibility")}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{t("student_information")}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">{t("name")}:</div>
                      <div className="text-sm">
                        {selectedInquiry.first_name} {selectedInquiry.middle_name || ""} {selectedInquiry.last_name}
                      </div>
                      <div className="text-sm font-medium">{t("date_of_birth")}:</div>
                      <div className="text-sm">{new Date(selectedInquiry.birth_date).toLocaleDateString()}</div>
                      <div className="text-sm font-medium">{t("gender")}:</div>
                      <div className="text-sm">{selectedInquiry.gender}</div>
                      <div className="text-sm font-medium">{t("applied_for_class")}:</div>
                      <div className="text-sm">
                        {AcademicClasses?.find((cls) => cls.id === selectedInquiry.inquiry_for_class)?.class}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">{t("parent_information")}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">{t("parent_name")}:</div>
                      <div className="text-sm">{selectedInquiry.father_name}</div>
                      <div className="text-sm font-medium">{t("contact")}:</div>
                      <div className="text-sm">{selectedInquiry.primary_mobile}</div>
                      <div className="text-sm font-medium">{t("email")}:</div>
                      <div className="text-sm">{selectedInquiry.parent_email || "N/A"}</div>
                      <div className="text-sm font-medium">{t("address")}:</div>
                      <div className="text-sm">{selectedInquiry.address}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{t("previous_education")}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">{t("school_name")}:</div>
                      <div className="text-sm">{selectedInquiry.previous_school || "N/A"}</div>
                      <div className="text-sm font-medium">{t("last_class")}:</div>
                      <div className="text-sm">{selectedInquiry.previous_class || "N/A"}</div>
                      <div className="text-sm font-medium">{t("percentage")}(%):</div>
                      <div className="text-sm">{selectedInquiry.previous_percentage || "N/A"}</div>
                      <div className="text-sm font-medium">{t("year")}:</div>
                      <div className="text-sm">{selectedInquiry.previous_year || "N/A"}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">{t("quota_eligibility")}</h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {selectedInquiry.applying_for_quota ? (
                        <div className="p-2 bg-muted rounded-md">
                          Applied for: {selectedInquiry.quota_type ?? "N/A"}
                        </div>
                      ) : (
                        <div className="p-2 bg-muted rounded-md">{t("not_applying_for_any_quota")}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedInquiry(null)
                      handleReject(selectedInquiry.id)
                    }}
                    disabled={isUpdating || selectedInquiry.status === "enrolled"}
                  >
                    {t("reject_application")}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                    {t("close")}
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedInquiry.id, "eligible")
                      setSelectedInquiry(null)
                    }}
                    disabled={isUpdating || selectedInquiry.status === "enrolled"}
                  >
                    {t("mark_eligible")}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirm_rejection")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("are_you_sure_you_want_to_reject_this_application_this_action_cannot_be_undone")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReject} className="bg-red-600 hover:bg-red-700">
                {t("reject")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Student Onboarding Form Dialog */}
        {showStudentForm && currentInquiryForOnboarding && (
          <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
            <DialogContent className="max-w-4xl h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{t("onboard_student")}</DialogTitle>
                <DialogDescription>{t("complete_the_student_details_to_enroll_them_in_the_school")}</DialogDescription>
              </DialogHeader>
              <OnboardingForm
                onClose={() => {
                  setShowStudentForm(false)
                  setCurrentInquiryForOnboarding(null)
                }}
                academic_session_id={currentInquiryForOnboarding.academic_session_id!}
                // form_type="create"
                // is_use_for_onBoarding={true}
                inquiry_id={currentInquiryForOnboarding.id}
                initial_data={
                  transformInquiryToStudent(currentInquiryForOnboarding, authState.user!.school_id) as Student
                }
                onSubmitSuccess={() => {
                  GetInquiries({
                    page: inquiriesData?.meta.currentPage,
                    academic_session_id: selectedAcademicYear!,
                  })
                  setShowStudentForm(false)
                  setCurrentInquiryForOnboarding(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Inquiry Dialog */}
        {inquiryToEdit && (
          <Dialog open={editInquiryDialogOpen} onOpenChange={setEditInquiryDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("edit_inquiry")}</DialogTitle>
                <DialogDescription>{t("update_inquiry_details")}</DialogDescription>
              </DialogHeader>
              <AdmissionInquiryForm
                isEditing={true}
                initialData={{
                  id: inquiryToEdit.id,
                  first_name: inquiryToEdit.first_name,
                  middle_name: inquiryToEdit.middle_name || null,
                  last_name: inquiryToEdit.last_name,
                  birth_date: inquiryToEdit.birth_date,
                  gender: inquiryToEdit.gender,
                  inquiry_for_class: inquiryToEdit.inquiry_for_class,
                  father_name: inquiryToEdit.father_name,
                  primary_mobile: inquiryToEdit.primary_mobile,
                  parent_email: inquiryToEdit.parent_email || null,
                  address: inquiryToEdit.address,
                  previous_school: inquiryToEdit.previous_school || null,
                  previous_class: inquiryToEdit.previous_class || null,
                  previous_percentage: inquiryToEdit.previous_percentage || null,
                  previous_year: inquiryToEdit.previous_year || null,
                  special_achievements: inquiryToEdit.special_achievements || null,
                  applying_for_quota: inquiryToEdit.applying_for_quota,
                  quota_type: inquiryToEdit.quota_type || null,
                  academic_session_id: inquiryToEdit.academic_session_id
                }}
                academicSessionId={inquiryToEdit.academic_session_id}
                inquiryId={inquiryToEdit.id}
                onSuccess={() => {
                  setEditInquiryDialogOpen(false)
                  setInquiryToEdit(null)
                  GetInquiries({
                    page: inquiriesData?.meta.currentPage,
                    academic_session_id: selectedAcademicYear!,
                  })
                  toast({
                    title: "Inquiry Updated",
                    description: "The inquiry has been updated successfully.",
                  })
                }}
                onCancel={() => {
                  setEditInquiryDialogOpen(false)
                  setInquiryToEdit(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

