"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Printer } from "lucide-react"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"

export const ReportGeneration: React.FC = () => {
  const [reportType, setReportType] = useState("collection")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDivision, setSelectedDivision] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  const handleGenerateReport = () => {
    console.log("Generating report with:", {
      reportType,
      selectedClass,
      selectedDivision,
      startDate,
      endDate,
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Report Generation</h1>

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="collection">Collection Report</TabsTrigger>
          <TabsTrigger value="pending">Pending Fees Report</TabsTrigger>
          <TabsTrigger value="concession">Concession Report</TabsTrigger>
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 1">Class 1</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Division</label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      <SelectItem value="A">Division A</SelectItem>
                      <SelectItem value="B">Division B</SelectItem>
                      <SelectItem value="C">Division C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <SaralDatePicker date={startDate} onDateChange={setStartDate} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <SaralDatePicker date={endDate} onDateChange={setEndDate} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleGenerateReport}>
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Fees Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 1">Class 1</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Division</label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      <SelectItem value="A">Division A</SelectItem>
                      <SelectItem value="B">Division B</SelectItem>
                      <SelectItem value="C">Division C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <SaralDatePicker date={endDate} onDateChange={setEndDate} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleGenerateReport}>
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concession">
          <Card>
            <CardHeader>
              <CardTitle>Concession Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 1">Class 1</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Division</label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      <SelectItem value="A">Division A</SelectItem>
                      <SelectItem value="B">Division B</SelectItem>
                      <SelectItem value="C">Division C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <SaralDatePicker date={startDate} onDateChange={setStartDate} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <SaralDatePicker date={endDate} onDateChange={setEndDate} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleGenerateReport}>
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Summary Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <SaralDatePicker date={startDate} onDateChange={setStartDate} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <SaralDatePicker date={endDate} onDateChange={setEndDate} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleGenerateReport}>
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

