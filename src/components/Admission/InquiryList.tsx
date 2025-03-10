import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { PageMeta } from "@/types/global"
import { InquiriesForStudent } from "@/types/student"
import { useLazyGetInquiryQuery } from "@/services/InquiryServices"

export const InquiryList: React.FC = () => {

  const [getInquiry, { isLoading: isInquiriesLoading }] = useLazyGetInquiryQuery()

  const [InquiryData, setInquiryData] = useState<{ data: InquiriesForStudent[], page: PageMeta } | null>(null);

  async function fetchInquiry(page: number = 1) {
    const res = await getInquiry({ page });
    console.log(res);
    if (res.data) {
      setInquiryData({
        data: res.data.data,
        page: res.data.page
      })
    }
  }

  useEffect(() => {
    if (!InquiryData) {
      fetchInquiry(1);
    }
  }, [])
  return (
    <>
      {InquiryData && InquiryData.data.length > 0 && (<Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Parent Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {InquiryData.data.map((inquiry) => (
            <TableRow key={inquiry.id}>
              <TableCell>{inquiry.student_name}</TableCell>
              <TableCell>{inquiry.parent_name}</TableCell>
              <TableCell>{inquiry.contact_number}</TableCell>
              <TableCell>{inquiry.email}</TableCell>
              <TableCell>{inquiry.grade_applying}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(inquiry.status)}>{inquiry.status}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>)}
      {isInquiriesLoading && <div>
        Loading ...
      </div>}
      {
        InquiryData && InquiryData.data.length === 0 && (
          <div>
            No Inquiries for now !
          </div>
        )
      }
    </>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pendding":
      return "default"
    case "Interview Scheduled":
      return "secondary"
    case "approved":
      return "outline"
    default:
      return "destructive"
  }
}

