"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"

const recentTransactions = [
  {
    id: "TX123456",
    studentName: "Rahul Sharma",
    class: "Class 10-A",
    amount: 15000,
    date: "2023-08-15",
    status: "Paid",
    paymentMode: "Online",
  },
  {
    id: "TX123457",
    studentName: "Priya Patel",
    class: "Class 8-B",
    amount: 12000,
    date: "2023-08-14",
    status: "Paid",
    paymentMode: "Cash",
  },
  {
    id: "TX123458",
    studentName: "Amit Kumar",
    class: "Class 9-C",
    amount: 8000,
    date: "2023-08-14",
    status: "Partial",
    paymentMode: "Online",
  },
  {
    id: "TX123459",
    studentName: "Sneha Gupta",
    class: "Class 11-A",
    amount: 18000,
    date: "2023-08-13",
    status: "Paid",
    paymentMode: "Cheque",
  },
  {
    id: "TX123460",
    studentName: "Vikram Singh",
    class: "Class 12-B",
    amount: 20000,
    date: "2023-08-12",
    status: "Partial",
    paymentMode: "Online",
  },
]

export const FeeCollectionTable: React.FC = () => {
  const {t} = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("transaction_ID")}</TableHead>
            <TableHead>{t("student_name")}</TableHead>
            <TableHead>{t("class")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("payment_mode")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{transaction.studentName}</TableCell>
              <TableCell>{transaction.class}</TableCell>
              <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={transaction.status === "Paid" ? "default" : "destructive"}>{transaction.status}</Badge>
              </TableCell>
              <TableCell>{transaction.paymentMode}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

