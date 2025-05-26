// "use client"

// import type React from "react"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { FileText, Download, Printer } from "lucide-react"
// import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
// import { useTranslation } from "@/redux/hooks/useTranslation"

// export const ReportGeneration: React.FC = () => {
//   const [reportType, setReportType] = useState("collection")
//   const [selectedClass, setSelectedClass] = useState("")
//   const [selectedDivision, setSelectedDivision] = useState("")
//   const [startDate, setStartDate] = useState<Date | undefined>(new Date())
//   const [endDate, setEndDate] = useState<Date | undefined>(new Date())
//   const {t} = useTranslation()

//   const handleGenerateReport = () => {
//     console.log("Generating report with:", {
//       reportType,
//       selectedClass,
//       selectedDivision,
//       startDate,
//       endDate,
//     })
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <h1 className="text-3xl font-bold">{t("report_generation")}</h1>

//       <Tabs value={reportType} onValueChange={setReportType}>
//         <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
//           <TabsTrigger value="collection">{t("collection_report")}</TabsTrigger>
//           <TabsTrigger value="pending">{t("pending_fees_report")}</TabsTrigger>
//           <TabsTrigger value="concession">{t("concession_report")}</TabsTrigger>
//           <TabsTrigger value="summary">{t("summary_report")}</TabsTrigger>
//         </TabsList>

//         <TabsContent value="collection">
//           <Card>
//             <CardHeader>
//               <CardTitle>{t("fee_collection_report")}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("class")}</label>
//                   <Select value={selectedClass} onValueChange={setSelectedClass}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_class")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all classes")}</SelectItem>
//                       <SelectItem value="Class 1">Class 1</SelectItem>
//                       <SelectItem value="Class 2">Class 2</SelectItem>
//                       <SelectItem value="Class 3">Class 3</SelectItem>
//                       <SelectItem value="Class 4">Class 4</SelectItem>
//                       <SelectItem value="Class 5">Class 5</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("division")}</label>
//                   <Select value={selectedDivision} onValueChange={setSelectedDivision}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_division")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all_divisions")}</SelectItem>
//                       <SelectItem value="A">Division A</SelectItem>
//                       <SelectItem value="B">Division B</SelectItem>
//                       <SelectItem value="C">Division C</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("start_date")}</label>
//                   <SaralDatePicker date={startDate} onDateChange={setStartDate} />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("end_date")}</label>
//                   <SaralDatePicker date={endDate} onDateChange={setEndDate} />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button onClick={handleGenerateReport}>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_report")}
//                 </Button>
//                 <Button variant="outline">
//                   <Download className="mr-2 h-4 w-4" /> {t("export")}
//                 </Button>
//                 <Button variant="outline">
//                   <Printer className="mr-2 h-4 w-4" /> {t("print")}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="pending">
//           <Card>
//             <CardHeader>
//               <CardTitle>{t("pending_fees_report")}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("class")}</label>
//                   <Select value={selectedClass} onValueChange={setSelectedClass}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_class")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all_classes")}</SelectItem>
//                       <SelectItem value="Class 1">Class 1</SelectItem>
//                       <SelectItem value="Class 2">Class 2</SelectItem>
//                       <SelectItem value="Class 3">Class 3</SelectItem>
//                       <SelectItem value="Class 4">Class 4</SelectItem>
//                       <SelectItem value="Class 5">Class 5</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("division")}</label>
//                   <Select value={selectedDivision} onValueChange={setSelectedDivision}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_division")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all_divisions")}</SelectItem>
//                       <SelectItem value="A">Division A</SelectItem>
//                       <SelectItem value="B">Division B</SelectItem>
//                       <SelectItem value="C">Division C</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("due_date")}</label>
//                   <SaralDatePicker date={endDate} onDateChange={setEndDate} />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button onClick={handleGenerateReport}>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_report")}
//                 </Button>
//                 <Button variant="outline">
//                   <Download className="mr-2 h-4 w-4" /> {t("export")}
//                 </Button>
//                 <Button variant="outline">
//                   <Printer className="mr-2 h-4 w-4" /> {t("print")}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="concession">
//           <Card>
//             <CardHeader>
//               <CardTitle>{t("concession_report")}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("class")}</label>
//                   <Select value={selectedClass} onValueChange={setSelectedClass}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_class")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all_classes")}</SelectItem>
//                       <SelectItem value="Class 1">Class 1</SelectItem>
//                       <SelectItem value="Class 2">Class 2</SelectItem>
//                       <SelectItem value="Class 3">Class 3</SelectItem>
//                       <SelectItem value="Class 4">Class 4</SelectItem>
//                       <SelectItem value="Class 5">Class 5</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("division")}</label>
//                   <Select value={selectedDivision} onValueChange={setSelectedDivision}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t("select_division")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">{t("all_divisions")}</SelectItem>
//                       <SelectItem value="A">Division A</SelectItem>
//                       <SelectItem value="B">Division B</SelectItem>
//                       <SelectItem value="C">Division C</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("start_date")}</label>
//                   <SaralDatePicker date={startDate} onDateChange={setStartDate} />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("end_date")}</label>
//                   <SaralDatePicker date={endDate} onDateChange={setEndDate} />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button onClick={handleGenerateReport}>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_report")}
//                 </Button>
//                 <Button variant="outline">
//                   <Download className="mr-2 h-4 w-4" /> {t("export")}
//                 </Button>
//                 <Button variant="outline">
//                   <Printer className="mr-2 h-4 w-4" /> {t("print")}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="summary">
//           <Card>
//             <CardHeader>
//               <CardTitle>{t("summary_report")}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("start_date")}</label>
//                   <SaralDatePicker date={startDate} onDateChange={setStartDate} />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">{t("end_date")}</label>
//                   <SaralDatePicker date={endDate} onDateChange={setEndDate} />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button onClick={handleGenerateReport}>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_report")}
//                 </Button>
//                 <Button variant="outline">
//                   <Download className="mr-2 h-4 w-4" /> {t("export")}
//                 </Button>
//                 <Button variant="outline">
//                   <Printer className="mr-2 h-4 w-4" /> {t("print")}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BarChart3 } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"
import InstallmentWiseReport from "./InstallmentWiseReport"

export const ReportGeneration: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("installment-wise")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("fees_reports")}</h1>
          <p className="text-muted-foreground mt-1">{t("generate_and_export_comprehensive_fees_reports")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("report_generation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="installment-wise" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("installment_wise_report")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="installment-wise" className="mt-6">
              <InstallmentWiseReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportGeneration
