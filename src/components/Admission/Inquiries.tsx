"use client"

import { useState } from "react"
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
import { SquareChevronLeft } from "lucide-react"
import { Inquiry, useGetInquiriesQuery, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"


export default function InquiriesManagement() {
  const { data: inquiriesData, isLoading, refetch } = useGetInquiriesQuery({ page: 1 })
  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation()
  const [filter, setFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const {t} = useTranslation()

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
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div
            style={{
              border: "1px  black",
              display: "inline-flex",
              padding: "1px",
              cursor: "pointer",
              marginTop: "10px",
            }}
            onClick={handleGoBack}
          >
            <SquareChevronLeft className="text-xl mr-2" />
            <span>{t("go_back")}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admission_inquiries")}</h1>
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
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.student_name}</TableCell>
                      <TableCell>{inquiry.class_applying}</TableCell>
                      <TableCell>{inquiry.parent_name}</TableCell>
                      <TableCell>{inquiry.parent_contact}</TableCell>
                      <TableCell>{new Date(inquiry.dob).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                            {t("view")}
                          </Button>
                          <Select
                            defaultValue={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder={t("change_status")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("pending")}</SelectItem>
                              <SelectItem value="eligible">{t("eligible")}</SelectItem>
                              <SelectItem value="ineligible">{t("ineligible")}</SelectItem>
                              <SelectItem value="approved">{t("approved")}</SelectItem>
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
                      <div className="text-sm">{selectedInquiry.student_name}</div>
                      <div className="text-sm font-medium">{t("date_of_birth")}:</div>
                      <div className="text-sm">{new Date(selectedInquiry.dob).toLocaleDateString()}</div>
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
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedInquiry.id, "ineligible")
                      setSelectedInquiry(null)
                    }}
                    disabled={isUpdating}
                  >
                    {t("mark_ineligible")}
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
                    disabled={isUpdating}
                  >
                    {t("mark_eligible")}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

