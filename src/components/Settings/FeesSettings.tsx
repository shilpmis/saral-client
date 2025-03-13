import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeeTypeSettings } from "../Fees/FeeTypeSettings"
import { ConcessionSettings } from "../Fees/ConcessionSettings"
import { FeePlanSettings } from "../Fees/FeePlanSettings"

const FeeSettings: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Fee Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Fee Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fee-types" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fee-types">Fee Types</TabsTrigger>
              <TabsTrigger value="fee-plans">Fee Plans</TabsTrigger>
              <TabsTrigger value="concessions">Concessions</TabsTrigger>
            </TabsList>
            <TabsContent value="fee-types">
              <FeeTypeSettings />
            </TabsContent>
            <TabsContent value="fee-plans">
              <FeePlanSettings />
            </TabsContent>
            <TabsContent value="concessions">
              <ConcessionSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
export default FeeSettings
