"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import {
  selectActiveAccademicSessionsForSchool,
  selectAccademicSessionsForSchool,
  selectAuthState,
} from "@/redux/slices/authSlice"
import { Loader2, Plus, Pencil, AlertCircle, Search } from "lucide-react"
import { useLazyGetAllSubjectsQuery, useCreateSubjectMutation } from "@/services/subjects"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { SaralPagination } from "@/components/ui/common/SaralPagination"

// Define the form schema
const subjectFormSchema = z.object({
  name: z.string().min(2, {
    message: "Subject name must be at least 2 characters.",
  }),
//   code: z.string().min(1, {
//     message: "Subject code is required.",
//   }),
  description: z.string().optional(),
  academic_session_id: z.number({
    required_error: "Please select an academic session.",
  }).optional(),
  status: z.enum(["Active", "Inactive"]),
})

export default function SubjectSettings() {
  const { t } = useTranslation()
  const authState = useAppSelector(selectAuthState)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const academicSessions = useAppSelector(selectAccademicSessionsForSchool)

  // State variables
  const [selectedAcademicSession, setSelectedAcademicSession] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // API hooks
  const [getAllSubjects, { data: subjects, isLoading }] = useLazyGetAllSubjectsQuery()
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation()

  // Setup form
  const form = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
    },
  })

  // Load subjects when academic session changes
  useEffect(() => {
    if (currentAcademicSession) {
      setSelectedAcademicSession(currentAcademicSession.id)
    }
  }, [currentAcademicSession])

  useEffect(() => {
    if (selectedAcademicSession) {
      getAllSubjects({ academic_session_id: selectedAcademicSession })
    }
  }, [selectedAcademicSession, getAllSubjects])

  // Handle academic session change
  const handleAcademicSessionChange = useCallback(async (value: string) => {
    const sessionId = Number(value)
    setSelectedAcademicSession(sessionId)
    setCurrentPage(1) // Reset to first page when changing session
  }, [])

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof subjectFormSchema>) => {
    try {
      await createSubject({
        name: data.name,
        description: data.description || "",
        academic_session_id: currentAcademicSession!.id,
      })

      toast({
        title: t("subject_created"),
        description: t("subject_has_been_created_successfully"),
      })

      // Reset form and close dialog
      form.reset()
      setIsDialogOpen(false)

      // Refresh subjects list
      if (selectedAcademicSession) {
        getAllSubjects({ academic_session_id: selectedAcademicSession })
      }
    } catch (error) {
      console.error("Error creating subject:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_create_subject"),
      })
    }
  }

  // Filter subjects based on search query
  const filteredSubjects = React.useMemo(() => {
    if (!subjects) return []

    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [subjects, searchQuery])

  // Calculate pagination
  const paginatedSubjects = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSubjects.slice(startIndex, endIndex)
  }, [filteredSubjects, currentPage, itemsPerPage])

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredSubjects.length / itemsPerPage)
  }, [filteredSubjects, itemsPerPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("subject_settings")}</CardTitle>
            <CardDescription>{t("manage_subjects_across_academic_sessions")}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("add_new_subject")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("add_new_subject")}</DialogTitle>
                <DialogDescription>{t("create_a_new_subject_for_the_selected_academic_session")}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    name="academic_session_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("academic_session")}</FormLabel>
                        <Select
                          defaultValue={currentAcademicSession?.id?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_academic_year")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicSessions?.map((session) => (
                              <SelectItem
                                key={session.id}
                                value={session.id.toString()}
                                disabled={session.id !== currentAcademicSession?.id}
                              >
                                {session.session_name}
                                {session.id === currentAcademicSession?.id && " (" + t("current") + ")"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>{t("only_current_academic_session_is_allowed")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subject_name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("eg_mathematics")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subject_code")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("eg_math")} {...field} />
                        </FormControl>
                        <FormDescription>{t("a_short_code_to_identify_the_subject")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("description")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("enter_subject_description")} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("status")}</FormLabel>
                        <Select defaultValue={field.value} onValueChange={(value) => field.onChange(value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_status")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t("active")}</SelectItem>
                            <SelectItem value="Inactive">{t("inactive")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("create_subject")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Academic session selector */}
            <div className="flex items-center gap-4">
              <div className="max-w-xs">
                <Label htmlFor="academic-session">{t("academic_year")}</Label>
                <Select value={selectedAcademicSession?.toString() || ""} onValueChange={handleAcademicSessionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_academic_year")} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicSessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.session_name}
                        {session.id === currentAcademicSession?.id && " (" + t("current") + ")"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search input */}
              <div className="flex-grow max-w-md">
                <Label htmlFor="search">{t("search")}</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t("search_by_name_code_or_description")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* No academic sessions warning */}
            {!academicSessions ||
              (academicSessions.length === 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("no_academic_sessions_found")}</AlertTitle>
                  <AlertDescription>{t("please_create_academic_sessions_before_managing_subjects")}</AlertDescription>
                </Alert>
              ))}

            {/* Subjects table */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedSubjects.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("subject_code")}</TableHead>
                        <TableHead>{t("subject_name")}</TableHead>
                        <TableHead>{t("description")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{subject.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={subject.status === "Active" ? "default" : "secondary"}>
                              {subject.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4">
                    <SaralPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t("no_subjects_found")}</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {selectedAcademicSession
                    ? t("no_subjects_have_been_added_for_this_academic_session_yet")
                    : t("please_select_an_academic_session_to_view_subjects")}
                </p>
                {selectedAcademicSession && selectedAcademicSession === currentAcademicSession?.id && (
                  <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("add_your_first_subject")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
