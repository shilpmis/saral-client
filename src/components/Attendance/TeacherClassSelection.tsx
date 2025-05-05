import type React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Division } from "@/types/academic"

interface Class {
  id: string
  name: string
}

interface TeacherClassSelectionProps {
  classes: Division[]
}

const TeacherClassSelection: React.FC<TeacherClassSelectionProps> = ({ classes }) => {
  return (
    <>
    {classes.length > 0 && (<div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select a Class for Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{cls.class.class} - {cls.division} </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={`/d/mark-attendance/${cls.id}`}>
                <Button className="w-full">Take Attendance</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>)}
    </>
  )
}

export default TeacherClassSelection

