import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function AdmissionSetting() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Admission Management</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Manage admissions, seats, and quotas efficiently with our comprehensive admission management system.
        </p>
        {/* <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link to="/admin/dashboard">
            <Button size="lg" className="w-full">
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/admission-inquiry">
            <Button size="lg" variant="outline" className="w-full">
              New Admission Inquiry
            </Button>
          </Link>
        </div> */}
      </div>

      <div className="flex justify-content space-x-3 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Seat Management</CardTitle>
            <CardDescription>Manage available seats across classes and quotas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Configure seat allocation for each class and assign seats to different quotas like RTE, Staff, Sports,
              etc.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/seats" className="w-full">
              <Button className="w-full">
                Manage Seats
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quota Configuration</CardTitle>
            <CardDescription>Create and manage admission quotas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Define custom quotas, set eligibility criteria, and allocate seats for each quota category.</p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/quotas" className="w-full">
              <Button  className="w-full">
                Configure Quotas
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Admission Inquiries</CardTitle>
            <CardDescription>Process new admission requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review admission inquiries, check eligibility, and process applications through appropriate quotas.</p>
          </CardContent>
          <CardFooter>
            <Link to="/admin/inquiries" className="w-full">
              <Button variant="outline" className="w-full">
                View Inquiries
              </Button>
            </Link>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  )
}

