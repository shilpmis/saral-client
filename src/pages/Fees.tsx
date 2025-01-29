import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentFeeManagement } from "@/components/Fees/StudentFeeManagement"
import { FeeStructureManagement } from "@/components/Fees/FeeStructureManagement"

export const Fees: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary mb-4">Student Fee Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feeStructures">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feeStructures">Fee Structures</TabsTrigger>
            <TabsTrigger value="studentFees">Student Fees</TabsTrigger>
          </TabsList>
          <TabsContent value="feeStructures">
            <FeeStructureManagement />
          </TabsContent>
          <TabsContent value="studentFees">
            <StudentFeeManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

