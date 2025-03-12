export interface FeesType {
    id: number,
    school_id: number,
    academic_year_id: number,
    name: string,
    description: string,
    status: "Active" | "Inactive"
    // is_concession_applicable: boolean,
}

export interface FeesPlan {
    id: number,
    name: string,
    class_id: number,
    academic_year_id: number,
    description: string,
    total_amount: number,
    status: "Active" | "Inactive"
}

export interface FeesPlanDetail {
    id: number,
    academic_year_id: number,
    fees_plan_id: number,
    fees_type_id: number,
    total_installment: number,
    installment_type: 'Admission' | 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly'
    total_amount: number,
    status: "Active" | "Inactive"
}

export interface InstallmentBreakdowns {
    fee_plan_details_id: number,
    installment_no: number,
    installment_amount: number,
    due_date: string,
    status: "Active" | "Inactive"
}

export interface DetailFeesPlan {

}

export interface ReqObjectForCreateFeesPlan {
    fees_plan: Pick<FeesPlan, 'class_id' | 'name' | 'description'>,
    plan_details: {
        fees_type_id: number,
        installment_type: string,
        total_installment: number,
        total_amount: number,
        installment_breakDowns: Pick<InstallmentBreakdowns, 'installment_no' | 'due_date' | 'installment_amount'>[]
    }[]
}

export interface DetailedFeesPlan {
    fees_plan: FeesPlan,
    fees_types: {
        fees_type : FeesPlanDetail
        installment_breakDowns: InstallmentBreakdowns[]
    }[]
}