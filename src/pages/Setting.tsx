import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {SettingsSidebar} from "@/components/Settings/SettingSidebar"
import { Outlet } from "react-router-dom"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Mail, Lock, School } from "lucide-react"


const CompactSettingsPage: React.FC = () => {

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      <SettingsSidebar currentPath='' />
      <div className="flex-1 overflow-hidden no-custom-scroll">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              > */}
                {/* Child Component for setting will render here */}
                <Outlet />
              {/* </motion.div>
            </AnimatePresence> */}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default CompactSettingsPage


