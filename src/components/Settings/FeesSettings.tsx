import React from 'react'
import { SaralCard } from '../ui/common/SaralCard'
import { useTranslation } from '@/redux/hooks/useTranslation';

export default function FeesSettings() {

  const { t } = useTranslation();
  return (
    <SaralCard title="Notifications" description="Manage your notification preferences">
                <h3>{t("setting_page")}</h3>
            </SaralCard>
  )
}
