"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useGetAcademicSessionsQuery } from "@/services/AcademicService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectCurrentUser } from "@/redux/slices/authSlice"

interface AcademicSessionsListProps {
  onActivate: (sessionId: number) => Promise<void>
}

export function AcademicSessionsList({ onActivate }: AcademicSessionsListProps) {
  const user = useAppSelector(selectCurrentUser)
  const { data: sessions, isLoading, refetch } = useGetAcademicSessionsQuery(user?.school_id ?? 0)
  const [activatingId, setActivatingId] = useState<number | null>(null)

  const handleSetActive = async (sessionId: number) => {
    if (!sessionId) return

    setActivatingId(sessionId)
    try {
      await onActivate(sessionId)
      refetch()
    } catch (error) {
      console.error("Failed to activate session:", error)
    } finally {
      setActivatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No academic sessions found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions?.sessions?.map((session: any) => (
          <TableRow key={session.id}>
            <TableCell>{format(new Date(session.start_date), "PPP")}</TableCell>
            <TableCell>{format(new Date(session.end_date), "PPP")}</TableCell>
            <TableCell>
              {session.is_active ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetActive(session.id!)}
                disabled={session.is_active || activatingId === session.id}
              >
                {activatingId === session.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : session.is_active ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Active
                  </>
                ) : (
                  "Set Active"
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

