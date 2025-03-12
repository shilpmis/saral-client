import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PayFeesDialog from "@/components/Fees/PayFees/PayFeesDialog"

// Mock data for demonstration
const mockStudentDetails = {
  name: "John Doe",
  grNumber: "GR001",
  class: "10",
  division: "A",
  parentContact: "+1234567890",
  admissionYear: "2022",
}

const mockPaidFees = [
  { id: 1, date: "2023-05-01", amount: 5000, mode: "Cash", reference: "REF001" },
  // Add more paid fees entries
]

const mockDueFees = [
  { id: 1, installment: "Term 1", dueDate: "2023-06-30", amount: 3000, penalty: 0, isOverdue: false },
  { id: 2, installment: "Term 2", dueDate: "2023-12-31", amount: 2000, penalty: 0, isOverdue: false },
  // Add more due fees entries
]

const mockConcessions = [
  { id: 1, name: "Sibling Discount", amount: "10%", status: "Active" },
  // Add more concessions
]

export const StudentFeesPanel: React.FC = () => {
  const [isPayFeesDialogOpen, setIsPayFeesDialogOpen] = useState(false)
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null)

  const handlePayFees = (installment: any) => {
    setSelectedInstallment(installment)
    setIsPayFeesDialogOpen(true)
  }

  const handlePaymentSubmit = (paymentDetails: any) => {
    // Implement payment submission logic
    console.log("Payment submitted:", paymentDetails)
    setIsPayFeesDialogOpen(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Fees Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold">Name: {mockStudentDetails.name}</h3>
            <p>GR Number: {mockStudentDetails.grNumber}</p>
            <p>Class: {mockStudentDetails.class}</p>
          </div>
          <div>
            <p>Division: {mockStudentDetails.division}</p>
            <p>Parent's Contact: {mockStudentDetails.parentContact}</p>
            <p>Admission Year: {mockStudentDetails.admissionYear}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Paid Fees</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPaidFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.date}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>{fee.mode}</TableCell>
                    <TableCell>{fee.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Due Fees</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Installment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDueFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.installment}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>₹{fee.penalty}</TableCell>
                    <TableCell>
                      <Badge variant={fee.isOverdue ? "destructive" : "secondary"}>
                        {fee.isOverdue ? "Overdue" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handlePayFees(fee)}>Pay Fees</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Applied Concessions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concession Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConcessions.map((concession) => (
                  <TableRow key={concession.id}>
                    <TableCell>{concession.name}</TableCell>
                    <TableCell>{concession.amount}</TableCell>
                    <TableCell>
                      <Badge variant={concession.status === "Active" ? "default" : "secondary"}>
                        {concession.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline">Apply Concession</Button>
            <Button variant="outline">Generate Report</Button>
            <Button variant="outline">Generate Pay Slip</Button>
          </div>
        </div>

        <PayFeesDialog
          isOpen={isPayFeesDialogOpen}
          onClose={() => setIsPayFeesDialogOpen(false)}
          installment={selectedInstallment}
          onSubmit={handlePaymentSubmit}
        />
      </CardContent>
    </Card>
  )
}



