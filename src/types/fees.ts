export interface FeesType {
    id: number,
    school_id: number,
    academic_year_id: number,
    name: string,
    description: string,
    status: "Active" | "Inactive"
    // is_concession_applicable: boolean,
}

export interface Concession {
    id: number,
    school_id: number,
    academic_year_id: number,
    name: string,
    description: string,
    applicable_to : 'fees_types' | 'plan' | 'students'
    status: "Active" | "Inactive",
    category : 'Family'| 'Sports' | 'Staff' | 'Education' | 'Financial' | 'Other'
}

export interface ConcessionDetailForPlan {
    concession_id : number,
    academic_year_id : number,
    fees_plan_id : number,
    fees_type_id : number
    deduction_type : 'percentage' | 'fixed_amount',
    amount : number | null,
    percentage : number | null,
    status : 'Active'| 'Inactive',
    concession : Concession,
    fees_plan : FeesPlan
}

export interface FeesPlan {
    id: number,
    name: string,
    class_id: number,
    academic_year_id: number,
    description: string,
    total_amount: number,
    status: "Active" | "Inactive"
    concession : ConcessionDetailForPlan[]
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
    }[],
    consession : ConcessionDetailForPlan[]
}

// Types for fees module

export interface FeeStatus {
    student_id: number
    academic_year_id: number
    fees_plan_id: number
    discounted_amount: number
    paid_amount: number
    total_amount: string
    due_amount: string
    status: "Pending" | "Partially Paid" | "Paid" | "Overdue"
  }
  
  export interface StudentWithFeeStatus {
    id: number
    first_name: string
    middle_name: string
    last_name: string
    gr_no: number
    roll_number: number
    fees_status: FeeStatus
  }
  
  export interface InstallmentBreakdown {
    id: number
    fee_plan_details_id: number
    installment_no: number
    installment_amount: string
    due_date: string
    status: "Active" | "Paid" | "Overdue"
  }

  export interface StudentFeesInstallment {
    id: number,
    student_fees_master_id: number,
    installment_id: number,
    paid_amount: string,
    remaining_amount: string,
    payment_mode: "Cash",
    transaction_reference: string | null,
    payment_date: string,
    remarks: "Done",
    status: 'Pending'| 'Partially Paid'| 'Paid' |'Overdue' | 'Failed'
  }
  
  export interface FeePlanDetail {
    id: number
    academic_year_id: number
    fees_plan_id: number
    fees_type_id: number
    installment_type: "Admission" | "Monthly" | "Half Yearly" | "Yearly"
    total_installment: number
    total_amount: string
    status: "Active" | "Inactive"
    installments_breakdown: InstallmentBreakdown[]
  }
  
  export interface FeePlan {
    id: number
    name: string
    academic_year_id: number
    description: string
    class_id: number
    total_amount: string
    status: "Active" | "Inactive"
  }
  
  export interface StudentFeeDetails {
    student: {
      id: number
      first_name: string
      middle_name: string
      last_name: string
      gr_no: number
      roll_number: number
      class_id: number
      fees_status: FeeStatus & { id: number }
      provided_concession : ApplyConcessioinToStudent[] 
    }
    fees_plan: {
      fees_details: FeePlanDetail[]
      fees_plan: FeePlan,
      paid_fees : StudentFeesInstallment[]
    }
  }
  
  export interface FeePaymentRequest {
    // student_id: number
    installment_id: number
    paid_amount: string
    payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer"
    transaction_reference: string
    payment_date: string
    remarks: string
    status: "Paid"
  }
  
  export interface FeePaymentFormData {
    installment_ids: number[]
    payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer"
    transaction_reference: string
    payment_date: string
    remarks: string
  }
  
  export interface ConcessionFormData {
    amount: number
    reason: string
  }
  
  export interface AppliedPlan {
    id: number
    concession_id: number
    fees_plan_id: number
    fees_type_id: number | null
    deduction_type: "percentage" | "amount"
    amount: string | null
    percentage: string | null
    status: string
    fees_plan?: {
      id: number
      name: string
      class_id: number
      total_amount: string
      status: string
    }
    fees_type?: {
      id: number
      name: string
    }
  }
  
  export interface ConcessionDetails  {
    concession : Concession
    applied_plans: ConcessionDetailForPlan[]
    applied_fee_types?: { id: number; name: string }[]
    applied_students?: { id: number; name: string }[]
  }
  
  export interface ApplyConcessionRequest {
    concession_id: number
    fees_plan_id: number
    fees_type_id: number | null
    deduction_type: "percentage" | "amount"
    amount: number | null
    percentage: number | null
  }
  
  export interface ApplyConcessioinToStudent {
    id: number,
    academic_year_id: number,
    concession_id: number,
    student_id: number,
    fees_plan_id: number,
    fees_type_id: number | null,
    deduction_type: string,
    amount: number | null,
    percentage: string | null,
    status: "Active" | "Inactive"
  }