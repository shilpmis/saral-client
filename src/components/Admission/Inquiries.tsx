"use client"

import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from "react"
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
import { mockInquiries } from "@/mock/admissionMockData"
import { ChevronLeft, SquareChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function InquiriesManagement() {
  const [inquiries, setInquiries] = useState(mockInquiries)
  const [filter, setFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<null | typeof mockInquiries[0]>(null)
  const navigate = useNavigate();

  const filteredInquiries = filter === "all" ? inquiries : inquiries.filter((inquiry) => inquiry.status === filter)

  const handleStatusChange = (id: string, status: string) => {
    setInquiries(inquiries.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry)))
  }

  const handleGoBack = () => {
    navigate(-1);
  }  

  const getStatusBadge = (status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "eligible":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Eligible
          </Badge>
        )
      case "ineligible":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Ineligible
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Approved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
        <div
            style={{ border: '1px  black', display: 'inline-flex', padding: '1px', cursor: 'pointer', marginTop: '10px' }}
            onClick={handleGoBack} // Add onClick to handle navigation
          >
            <SquareChevronLeft className="text-xl mr-2" />
            <span>Go Back</span>

          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admission Inquiries</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter">Filter:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="ineligible">Ineligible</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admission Inquiries</CardTitle>
            <CardDescription>Review and process admission inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.studentName}</TableCell>
                    <TableCell>{inquiry.class}</TableCell>
                    <TableCell>{inquiry.parentName}</TableCell>
                    <TableCell>{inquiry.contact}</TableCell>
                    <TableCell>{new Date(inquiry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                          View
                        </Button>
                        <Select
                          defaultValue={inquiry.status}
                          onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="eligible">Eligible</SelectItem>
                            <SelectItem value="ineligible">Ineligible</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Inquiry Details</DialogTitle>
                <DialogDescription>Review complete details and determine eligibility</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Student Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">Name:</div>
                      <div className="text-sm">{selectedInquiry.studentName}</div>
                      <div className="text-sm font-medium">Date of Birth:</div>
                      <div className="text-sm">15/08/2015</div>
                      <div className="text-sm font-medium">Gender:</div>
                      <div className="text-sm">Male</div>
                      <div className="text-sm font-medium">Applied for Class:</div>
                      <div className="text-sm">{selectedInquiry.class}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Parent Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">Parent Name:</div>
                      <div className="text-sm">{selectedInquiry.parentName}</div>
                      <div className="text-sm font-medium">Contact:</div>
                      <div className="text-sm">{selectedInquiry.contact}</div>
                      <div className="text-sm font-medium">Email:</div>
                      <div className="text-sm">{selectedInquiry.email || "parent@example.com"}</div>
                      <div className="text-sm font-medium">Occupation:</div>
                      <div className="text-sm">Software Engineer</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Previous Education</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">School Name:</div>
                      <div className="text-sm">ABC Primary School</div>
                      <div className="text-sm font-medium">Last Class:</div>
                      <div className="text-sm">5th</div>
                      <div className="text-sm font-medium">Percentage:</div>
                      <div className="text-sm">85%</div>
                      <div className="text-sm font-medium">Year:</div>
                      <div className="text-sm">2023</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Quota Eligibility</h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="rte-quota" />
                        <label htmlFor="rte-quota" className="text-sm">
                          RTE Quota
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="staff-quota" />
                        <label htmlFor="staff-quota" className="text-sm">
                          Staff Quota
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="sports-quota" />
                        <label htmlFor="sports-quota" className="text-sm">
                          Sports Quota
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="management-quota" />
                        <label htmlFor="management-quota" className="text-sm">
                          Management Quota
                        </label>
                      </div>
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
                  >
                    Mark Ineligible
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedInquiry.id, "eligible")
                      setSelectedInquiry(null)
                    }}
                  >
                    Mark Eligible
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

