"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { UserPlus } from "lucide-react"
import { type Inquiry, useGetInquiriesQuery, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import type { StudentFormData } from "@/utils/student.validation"
import StudentForm from "../Students/StudentForm"

export default function InquiryList() {
  const { data: inquiriesData, isLoading, refetch } = useGetInquiriesQuery({ page: 1 })
  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation()
  const [filter, setFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [inquiryToReject, setInquiryToReject] = useState<number | null>(null)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [currentInquiryForOnboarding, setCurrentInquiryForOnboarding] = useState<Inquiry | null>(null)
  const { t } = useTranslation()

  const filteredInquiries =
    filter === "all" ? inquiriesData?.data : inquiriesData?.data.filter((inquiry) => inquiry.status === filter)

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateInquiry({ id, status }).unwrap()
      toast({
        title: "Status Updated",
        description: "The inquiry status has been updated successfully.",
      })
      refetch()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleReject = (id: number) => {
    setInquiryToReject(id)
    setRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (inquiryToReject) {
      try {
        await updateInquiry({ id: inquiryToReject, status: "rejected" }).unwrap()
        toast({
          title: "Application Rejected",
          description: "The application has been rejected successfully.",
        })
        setRejectDialogOpen(false)
        setInquiryToReject(null)
        refetch()
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
    setCurrentInquiryForOnboarding(inquiry)
    setShowStudentForm(true)
  }

  const handleStudentSubmit = async (data: StudentFormData) => {
    try {
      // Here you would normally send the data to your API to create the student
      // and associate it with the inquiry

      // For demonstration, we'll simulate a successful response with an enrollment ID
      const enrollmentId = `ENR-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`

      // Update the inquiry with the enrollment ID
      if (currentInquiryForOnboarding) {
        await updateInquiry({
          id: currentInquiryForOnboarding.id,
          status: "enrolled",
          enrollment_id: enrollmentId,
        }).unwrap()
      }

      toast({
        title: "Student Onboarded",
        description: `Student has been successfully onboarded with enrollment ID: ${enrollmentId}`,
      })

      setShowStudentForm(false)
      setCurrentInquiryForOnboarding(null)
      refetch()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to onboard student. Please try again.",
        variant: "destructive",
      })
    }
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
      case "enrolled":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("enrolled")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col space-y-6">
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
                <SelectItem value="enrolled">{t("enrolled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredInquiries && filteredInquiries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("student_name")}</TableHead>
                    <TableHead>{t("class")}</TableHead>
                    <TableHead>{t("parent_name")}</TableHead>
                    <TableHead>{t("contact")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("enrollment_id")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">
                        {inquiry.first_name} {inquiry.middle_name ? inquiry.middle_name : ""} {inquiry.last_name}
                      </TableCell>
                      <TableCell>{inquiry.class_applying}</TableCell>
                      <TableCell>{inquiry.father_name}</TableCell>
                      <TableCell>{inquiry.primary_mobile}</TableCell>
                      <TableCell>{new Date(inquiry.birth_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        {inquiry.enrollment_id ? (
                          <span className="font-medium text-blue-600">{inquiry.enrollment_id}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                            {t("view")}
                          </Button>

                          {/* Onboard Student button - only enabled for approved applications */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOnboardStudent(inquiry)}
                            disabled={inquiry.status !== "approved" || !!inquiry.enrollment_id}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {t("onboard")}
                          </Button>

                          <Select
                            defaultValue={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                            disabled={inquiry.status === "enrolled"}
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
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                        {selectedInquiry.first_name} {selectedInquiry.middle_name ? selectedInquiry.middle_name : ""}{" "}
                        {selectedInquiry.last_name}
                      </div>
                      <div className="text-sm font-medium">{t("date_of_birth")}:</div>
                      <div className="text-sm">{new Date(selectedInquiry.birth_date).toLocaleDateString()}</div>
                      <div className="text-sm font-medium">{t("gender")}:</div>
                      <div className="text-sm">{selectedInquiry.gender}</div>
                      <div className="text-sm font-medium">{t("applied_for_class")}:</div>
                      <div className="text-sm">{selectedInquiry.class_applying}</div>
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
                      <div className="text-sm font-medium">{t("percentage")}:</div>
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
                          Applied for: {selectedInquiry.quota_type || "General Quota"}
                        </div>
                      ) : (
                        <div className="p-2 bg-muted rounded-md">{t("not_applying_for_any_quota")}</div>
                      )}
                    </div>
                  </div>

                  {selectedInquiry.enrollment_id && (
                    <div>
                      <h3 className="text-lg font-medium">{t("enrollment_details")}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm font-medium">{t("enrollment_id")}:</div>
                        <div className="text-sm font-bold text-blue-600">{selectedInquiry.enrollment_id}</div>
                      </div>
                    </div>
                  )}
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
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("onboard_student")}</DialogTitle>
                <DialogDescription>{t("complete_the_student_details_to_enroll_them_in_the_school")}</DialogDescription>
              </DialogHeader>
              <StudentForm
                onClose={() => {
                  setShowStudentForm(false)
                  setCurrentInquiryForOnboarding(null)
                }}
                form_type="create"
                initial_data={{
                  id: 0,
                  school_id: 0,
                  first_name: currentInquiryForOnboarding.first_name,
                  middle_name: currentInquiryForOnboarding.middle_name || "",
                  last_name: currentInquiryForOnboarding.last_name,
                  first_name_in_guj: "",
                  middle_name_in_guj: "",
                  last_name_in_guj: "",
                  class_id: currentInquiryForOnboarding.class_applying,
                  gender: currentInquiryForOnboarding.gender as "Male" | "Female",
                  birth_date: currentInquiryForOnboarding.birth_date,
                  father_name: currentInquiryForOnboarding.father_name,
                  primary_mobile: Number(currentInquiryForOnboarding.primary_mobile),
                  // parent_email: currentInquiryForOnboarding.parent_email || "",
                  // address: currentInquiryForOnboarding.address,
                  // privious_school: currentInquiryForOnboarding.previous_school || "",
                  // privious_school_in_guj: "",
                  // previous_class: currentInquiryForOnboarding.previous_class || "",
                  // previous_percentage: currentInquiryForOnboarding.previous_percentage || "",
                  // previous_year: currentInquiryForOnboarding.previous_year || "",
                  // applying_for_quota: currentInquiryForOnboarding.applying_for_quota || false,
                  // quota_type: currentInquiryForOnboarding.quota_type || "",
                }}
                onSubmitSuccess={(studentData: any, enrollmentId: any) => {
                  // Update the inquiry with the enrollment ID
                  if (currentInquiryForOnboarding && enrollmentId) {
                    updateInquiry({
                      id: currentInquiryForOnboarding.id,
                      status: "enrolled",
                      enrollment_id: enrollmentId,
                    })
                      .unwrap()
                      .then(() => {
                        toast({
                          title: "Student Onboarded",
                          description: `Student has been successfully onboarded with enrollment ID: ${enrollmentId}`,
                        })
                        refetch()
                      })
                      .catch((error) => {
                        console.error(error)
                        toast({
                          title: "Error",
                          description: "Failed to update inquiry status. Please try again.",
                          variant: "destructive",
                        })
                      })
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

