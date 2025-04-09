"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SerializedError } from "@reduxjs/toolkit"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { Student } from "@/types/student"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface StudentSearchResultsProps {
  results: Student[]
  isLoading: boolean
  error?: FetchBaseQueryError | SerializedError
  onSelectStudent: (student: Student) => void
}

export function StudentSearchResults({ results, isLoading, error, onSelectStudent }: StudentSearchResultsProps) {

  const { t } = useTranslation()
  if (isLoading) {
    return (
      <Card className="absolute z-10 w-full mt-1 shadow-lg">
        <CardContent className="p-2">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-sm" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="absolute z-10 w-full mt-1 shadow-lg">
        <CardContent className="p-2 text-destructive">{t("failed_to_load_search_results._please_try_again.")}</CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-[300px] overflow-y-auto">
      <CardContent className="p-0">
        {results.map((student) => (
          <div
            key={student.id}
            className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelectStudent(student)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {student.first_name} {student.middle_name || ""} {student.last_name || ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {student.acadamic_class && student.acadamic_class[0]
                    ? `Class ${student.acadamic_class[0].class.name} ${student.acadamic_class[0].class.divisions}`
                    : "Class information not available"}
                </div>
              </div>
              <Badge variant="outline" className="font-mono">
                GR: {student.gr_no}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

