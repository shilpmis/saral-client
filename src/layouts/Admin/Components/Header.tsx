"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { logout } from "@/services/AuthService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useTranslation } from "@/redux/hooks/useTranslation"
import LanguageSwitcher from "@/components/traslater/languageSwitcher"
import { AlertTriangle, LogOut, Moon, Sun, User, Zap, School } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search } from "@/components/Dashboard/Search"

const shortFormForRole: any = {
  1: "AD",
  2: "PR",
  3: "HT",
  4: "CL",
  5: "IT",
  6: "TE",
}

export default function Header() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.auth.user)
  const { t } = useTranslation()

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New student enrolled", read: false, time: "10 min ago" },
    { id: 2, title: "Fee payment reminder", read: false, time: "1 hour ago" },
    { id: 3, title: "Staff meeting scheduled", read: true, time: "Yesterday" },
  ])

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false)
    await dispatch(logout())
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Offline Status Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full shadow-lg flex justify-center items-center p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 z-50 fixed top-0"
          >
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
            <span className="text-sm font-medium">No Internet Connection (·•᷄‎ࡇ•᷅ )</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div
        className={`w-full h-auto shadow-md rounded-md flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 transition-all duration-300 ${
          !isOnline ? "mt-10" : ""
        }`}
      >
        {/* Left Side - Logo and School Name */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary hover:text-primary/80 transition-colors" />
          <div className="hidden md:flex items-center">
            {/* <School className="h-5 w-5 text-primary mr-2" /> */}
            <h1 className="text-xl font-medium text-transparent">
              {users?.school.name || "Saral School Management"}
            </h1>
          </div>
        </div>

        {/* Right Side - Controls and User Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDarkMode ? t("light_mode") : t("dark_mode")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          <Search/>
          {/* Language Switcher */}
          <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
            <LanguageSwitcher />
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group ml-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium line-clamp-1">{users?.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{users?.saral_email}</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary group-hover:border-primary/80 transition-colors">
                  <AvatarImage
                    src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                    alt="User"
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {users?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="p-4 flex flex-col items-center gap-2 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                    alt="User"
                  />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {users?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold">{users?.name}</p>
                  <p className="text-xs text-muted-foreground">{users?.saral_email}</p>
                </div>
                <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20">
                  {shortFormForRole[users!.role_id] || "User"}
                </Badge>
              </div>

              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 rounded-md" asChild>
                  <Dialog>
                    <DialogTrigger className="w-full flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{t("my_profile")}</span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[350px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[600px] mx-5">
                      <DialogHeader>
                        <DialogTitle>{t("your_profile")}</DialogTitle>
                        <DialogDescription>{t("view_and_manage_your_profile_information")}</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center my-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741157072~exp=1741160672~hmac=ed96e089fd628b2ab1f81ea8e2bb6ecdda05224e16db03ed8a1745e8b9787c4f&w=900"
                            alt="User"
                          />
                          <AvatarFallback className="bg-primary text-white text-2xl">
                            {users?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              {t("name")}
                            </Label>
                            <Input id="name" defaultValue={users?.name} className="col-span-3" readOnly />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="schoolName" className="text-right">
                              {t("school_name")}
                            </Label>
                            <Input
                              id="schoolName"
                              defaultValue={users?.school?.name}
                              type="text"
                              className="col-span-3"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              {t("status")}
                            </Label>
                            <Input id="status" defaultValue={users?.school?.status} className="col-span-3" readOnly />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactNumber" className="text-right">
                              {t("contact_number")}
                            </Label>
                            <Input
                              id="contactNumber"
                              defaultValue={users?.school?.contact_number}
                              className="col-span-3"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl shadow-lg">
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mx-auto mb-4 w-14 h-14 flex items-center justify-center bg-red-100 rounded-full"
            >
              <AlertTriangle className="text-red-600 w-7 h-7" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t("logout_confirmation")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t("are_you_sure_you_want_to_logout?_you_will_be_redirected_to_the_login_page.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="px-6 py-2 rounded-lg"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-600 text-white"
            >
              {t("logout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

