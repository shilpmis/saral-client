import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardData {
  totalInquiries: number
  pendingApplications: number
  acceptedAdmissions: number
  rejectedApplications: number
  upcomingInterviews: number
}

interface AdmissionTrend {
  grade: string
  inquiries: number
}

interface AdmissionDashboardProps {
  data: DashboardData
  trends: AdmissionTrend[]
}

export const AdmissionDashboard: React.FC<AdmissionDashboardProps> = ({ data, trends }) => {
  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="inquiries" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

