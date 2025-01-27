import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Mail, Lock, School } from "lucide-react"
import {SettingsSidebar} from "@/components/Settings/SettingSidebar"


const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <Card className="mb-4">
    <CardHeader className="p-4">
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription className="text-xs">{description}</CardDescription>
    </CardHeader>
    <CardContent className="p-4">{children}</CardContent>
  </Card>
)

const CompactSettingsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("general")

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      <SettingsSidebar currentPath='' />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeCategory === "general" && (
                  <>
                    <SettingsCard title="Notifications" description="Manage your notification preferences">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="push-notifications" className="text-sm">
                              Push Notifications
                            </Label>
                          </div>
                          <Switch id="push-notifications" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="email-notifications" className="text-sm">
                              Email Notifications
                            </Label>
                          </div>
                          <Switch id="email-notifications" />
                        </div>
                      </div>
                    </SettingsCard>
                    <SettingsCard title="Security" description="Manage your account security settings">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="two-factor" className="text-sm">
                            Two-Factor Authentication
                          </Label>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeCategory === "academic" && (
                  <>
                    <SettingsCard title="Grading Scale" description="Set the grading scale for your institution">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="min-grade" className="text-sm">
                              Minimum Grade
                            </Label>
                            <Input id="min-grade" type="number" placeholder="0" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="max-grade" className="text-sm">
                              Maximum Grade
                            </Label>
                            <Input id="max-grade" type="number" placeholder="100" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="passing-grade" className="text-sm">
                            Passing Grade
                          </Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select passing grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">50%</SelectItem>
                              <SelectItem value="60">60%</SelectItem>
                              <SelectItem value="70">70%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </SettingsCard>
                    <SettingsCard title="Academic Year" description="Configure the academic year settings">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date" className="text-sm">
                              Start Date
                            </Label>
                            <Input id="start-date" type="date" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="end-date" className="text-sm">
                              End Date
                            </Label>
                            <Input id="end-date" type="date" className="mt-1" />
                          </div>
                        </div>
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeCategory === "staff" && (
                  <>
                    <SettingsCard title="Staff Roles" description="Manage staff roles and permissions">
                      <div className="space-y-4">
                        {["Teacher", "Administrator", "Counselor"].map((role) => (
                          <div key={role} className="flex items-center justify-between">
                            <Label htmlFor={`role-${role.toLowerCase()}`} className="text-sm">
                              {role}
                            </Label>
                            <Switch id={`role-${role.toLowerCase()}`} />
                          </div>
                        ))}
                      </div>
                    </SettingsCard>
                    <SettingsCard title="Staff Directory" description="Configure staff directory settings">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <School className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="public-directory" className="text-sm">
                            Public Staff Directory
                          </Label>
                        </div>
                        <Switch id="public-directory" />
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeCategory === "payroll" && (
                  <SettingsCard title="Payroll Settings" description="Configure payroll settings">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pay-cycle" className="text-sm">
                          Pay Cycle
                        </Label>
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select pay cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-payroll" className="text-sm">
                          Automatic Payroll Processing
                        </Label>
                        <Switch id="auto-payroll" />
                      </div>
                    </div>
                  </SettingsCard>
                )}

                {activeCategory === "fees" && (
                  <SettingsCard title="Fees Settings" description="Configure fees and payment settings">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="late-fee" className="text-sm">
                          Enable Late Fee
                        </Label>
                        <Switch id="late-fee" />
                      </div>
                      <div>
                        <Label htmlFor="payment-methods" className="text-sm">
                          Accepted Payment Methods
                        </Label>
                        <div className="mt-2 space-y-2">
                          {["Credit Card", "Bank Transfer", "Cash"].map((method) => (
                            <div key={method} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`method-${method.toLowerCase().replace(" ", "-")}`}
                                className="mr-2"
                              />
                              <Label htmlFor={`method-${method.toLowerCase().replace(" ", "-")}`} className="text-sm">
                                {method}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SettingsCard>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default CompactSettingsPage

