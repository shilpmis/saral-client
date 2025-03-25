import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { Link } from "react-router-dom"

export default function AdmissionSetting() {
  const {t} = useTranslation()
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t("admission_management")}</h1>
        <p className="text-muted-foreground max-w-[600px]">
          {t("manage_admissions,_seats,_and_quotas_efficiently_with_our_comprehensive_admission_management_system.")}
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
            <CardTitle>{t("seat_management")}</CardTitle>
            <CardDescription>{t("manage_available_seats_across_classes_and_quotas")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
            {t("configure_seat_allocation_for_each_class_and_assign_seats_to_different_quotas_like")} RTE, Staff, Sports,
              etc.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/seats" className="w-full">
              <Button className="w-full">
                {t("manage_seats")}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("quota_configuration")}</CardTitle>
            <CardDescription>{t("create_and_manage_admission_quotas")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("define_custom_quotas,_set_eligibility_criteria,_and_allocate_seats_for_each_quota_category.")}</p>
          </CardContent>
          <CardFooter>
            <Link to="/d/settings/admission/quotas" className="w-full">
              <Button  className="w-full">
                {t("configure_quotas")}
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

