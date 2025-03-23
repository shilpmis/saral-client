"use client"

import { useTranslation } from "@/redux/hooks/useTranslation"
import type React from "react"

export const ConcessionSettings: React.FC = () => {
  const {t} = useTranslation()
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("concession_settings")}</h2>
      <p>{t("configure_fee_concession_types_and_rules_here.")}</p>
    </div>
  )
}

