"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Inquiry, useGetInquiriesQuery, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"

export const InquiryList: React.FC = () => {
  const { data: inquiriesData, isLoading, refetch } = useGetInquiriesQuery({ page: 1 })
  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation()
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const {t} = useTranslation()

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setSelectedStatus(inquiry.status)
  }

  const closeDialog = () => {
    setSelectedInquiry(null)
  }

  const handleStatusUpdate = async () => {
    if (!selectedInquiry) return

    try {
      await updateInquiry({
        id: selectedInquiry.id,
        status: selectedStatus,
      }).unwrap()

      toast({
        title: "Status Updated",
        description: "The inquiry status has been updated successfully.",
      })

      refetch()
      closeDialog()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {inquiriesData && inquiriesData.data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("student_name")}</TableHead>
              <TableHead>{t("parent_name")}</TableHead>
              <TableHead>{t("contact")}</TableHead>
              <TableHead>{t("class")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiriesData.data.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{inquiry.student_name}</TableCell>
                <TableCell>{inquiry.parent_name}</TableCell>
                <TableCell>{inquiry.parent_contact}</TableCell>
                <TableCell>{inquiry.class_applying}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(inquiry.status)}>{inquiry.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                    {t("view")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {inquiriesData && inquiriesData.data.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted/50">{t("no_inquiries_for_now!")}</div>
      )}

      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={closeDialog}>
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
                    <div className="text-sm">{selectedInquiry.student_name}</div>
                    <div className="text-sm font-medium">{t("applied_for_class")}:</div>
                    <div className="text-sm">{selectedInquiry.class_applying}</div>
                    <div className="text-sm font-medium">{t("date_of_birth")}:</div>
                    <div className="text-sm">{new Date(selectedInquiry.dob).toLocaleDateString()}</div>
                    <div className="text-sm font-medium">{t("gender")}:</div>
                    <div className="text-sm">{selectedInquiry.gender}</div>
                    <div className="text-sm font-medium">{t("status")}:</div>
                    <div className="text-sm">
                      <Badge variant={getStatusVariant(selectedInquiry.status)}>{selectedInquiry.status}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">{t("parent_information")}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm font-medium">{t("parent_name")}:</div>
                    <div className="text-sm">{selectedInquiry.parent_name}</div>
                    <div className="text-sm font-medium">{t("contact")}:</div>
                    <div className="text-sm">{selectedInquiry.parent_contact}</div>
                    <div className="text-sm font-medium">{t("email")}:</div>
                    <div className="text-sm">{selectedInquiry.parent_email || "N/A"}</div>
                    <div className="text-sm font-medium">{t("address")}:</div>
                    <div className="text-sm">{selectedInquiry.address}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{t("update_status")}</h3>
                  <div className="mt-2 space-y-4">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="Interview Scheduled">{t("interview_scheduled")}</SelectItem>
                        <SelectItem value="eligible">{t("eligible")}</SelectItem>
                        <SelectItem value="ineligible">{t("ineligible")}</SelectItem>
                        <SelectItem value="approved">{t("approved")}</SelectItem>
                        <SelectItem value="rejected">{t("rejected")}</SelectItem>
                      </SelectContent>
                    </Select>

                    {selectedInquiry.applying_for_quota ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t("quota_applied_for")}</h4>
                        <div className="p-2 bg-muted rounded-md">{selectedInquiry.quota_type || "General Quota"}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedStatus("rejected")
                    handleStatusUpdate()
                  }}
                  disabled={isUpdating}
                >
                  {t("reject_application")}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  {t("close")}
                </Button>
                <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : t("update_status")}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "default"
    case "Interview Scheduled":
    case "eligible":
      return "secondary"
    case "approved":
      return "outline"
    case "rejected":
    case "ineligible":
      return "destructive"
    default:
      return "default"
  }
}

